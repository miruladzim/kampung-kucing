import assert from 'node:assert/strict';
import {createWorldPlay,TASKS} from '../dist/history-play.js';
import {STATIONS} from '../dist/history-content.js';
import {newSession,summary,restoreSession,resultsCsv} from '../dist/history-state.js';
const session=newSession(),messages=[],rewards=[];
let saves=0;const play=createWorldPlay(session,{save:()=>saves++,feedback:(text,type)=>messages.push({text,type}),reward:st=>rewards.push(st.id)});
const farm=STATIONS[0];
assert.equal(play.current(farm).id,'p1');
assert.equal(play.act(farm,'target','water'),false,'Cannot deliver without carrying');
assert.equal(summary(session).answered,0);
play.act(farm,'pickup','cargo');play.act(farm,'target','ore');
assert.equal(session.records.p1.attempts[0].correct,false);
play.act(farm,'hint');play.act(farm,'pickup','cargo');play.act(farm,'drop');
assert.equal(play.state(farm).carrying,null);
play.act(farm,'pickup','cargo');play.act(farm,'target','water');
assert.equal(play.current(farm).id,'p2');
assert.equal(session.records.p1.attempts.length,2);
assert.equal(session.records.p1.attempts[0].assisted,false);
assert.equal(session.records.p1.attempts[1].assisted,true);
assert.equal(play.act(farm,'check'),false,'Cannot assess incomplete sorting');
for(const st of STATIONS){
 let guard=0;
 while(play.current(st)){
  assert.ok(++guard<5,'Station advances after successful physical action');
  const q=play.current(st),task=play.task(st);
  if(task.kind==='sort'){
   // Invalid pickup cannot create a forged item; a failed arrangement remains editable.
   assert.equal(play.act(st,'pickup','unknown'),false);
   q.items.forEach(item=>{play.act(st,'pickup',item.id);play.act(st,'target',q.groups[0].id);});
   play.act(st,'check');
   assert.equal(play.current(st).id,q.id);
   q.items.forEach(item=>{play.act(st,'pickup',item.id);play.act(st,'target',item.group);});
   play.act(st,'check');
   assert.equal(session.records[q.id].attempts.length,2);
  }else if(task.kind==='switch'){
   play.act(st,'target',q.answer[0]);
   assert.equal(play.act(st,'check'),false,'Two physical operations are required');
   play.act(st,'target',q.answer[0]);assert.equal(play.state(st).selected.length,0,'Can undo an operation');
   q.answer.forEach(id=>play.act(st,'target',id));play.act(st,'check');
  }else if(task.kind==='chain'){
   play.act(st,'pickup','cargo');play.act(st,'target','trade');
   assert.equal(session.records[q.id]?.attempts.length||0,0,'Wait for two deliveries before marking the chain');
   play.act(st,'pickup','cargo');play.act(st,'target','material');
   assert.equal(play.state(st).chain,0,'Reversed deliveries are incorrect and can be rebuilt');assert.equal(session.records[q.id].attempts[0].correct,false,'Order matters for the physical chain');
   for(const id of ['material','trade']){play.act(st,'pickup','cargo');play.act(st,'target',id);}
  }else {play.act(st,'pickup','cargo');play.act(st,'target',q.answer[0]);}
 }
 assert.equal(play.state(st),null);
}
assert.equal(summary(session).solved,12);assert.equal(summary(session).fish,4);
assert.equal(new Set(rewards).size,4);assert.equal(rewards.length,4,'Each station rewards once');
assert.equal(summary(restoreSession(JSON.stringify(session))).fish,4,'World completions survive reload');
assert.equal(session.records.p1.attempts[0].physicalAction,'Laluan bijih');assert.match(resultsCsv(restoreSession(JSON.stringify(session))),/world-v2/);assert.match(resultsCsv(session),/Laluan bijih/);
assert.ok(saves>=12);assert.equal(Object.keys(TASKS).length,9);
console.log('Passed: physical pickup/delivery, four-station progression, complete sorting before marking, correction and first attempts, two-part operation and delivery chain, hints, one-time rewards and persistence.');

// Exercise the actual scene/controller through proximity interaction, not direct answers.
const THREE=await import('../dist/vendor/three.module.js');
const {createWorld}=await import('../dist/world.js');
const {createHistoryWorld}=await import('../dist/history-world.js');
const nodes=new Map();
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){},beginPath(){},roundRect(){},fill(){},fillText(){}})}),getElementById:id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,textContent:'',dataset:{}});return nodes.get(id);}};
const scene=new THREE.Scene(),world=createWorld(scene),data=newSession();
const worldMissions=createHistoryWorld(scene,world.cat,{getSession:()=>data,saveWorld(){},rewardWorld(){}},world.colliders);
let clock=0;
function update(){worldMissions.update(clock+=.1,true);}
function use(st,kind,id){
 update();const m=worldMissions.stations.find(m=>m.st===st),object=m.objects.find(o=>o.kind===kind&&o.id===id);assert.ok(object,`${st.id}: physical ${kind} ${id} exists`);
 world.cat.position.set(object.x,0,object.z+.8);update();
 assert.equal(nodes.get('nearbyMission').hidden,false,`${kind} ${id} reachable`);
 worldMissions.interact();update();
}
for(const st of STATIONS){
 while(worldMissions.play.current(st)){
  const q=worldMissions.play.current(st),t=worldMissions.play.task(st);
  if(t.kind==='sort'){
   for(const item of q.items){use(st,'pickup',item.id);assert.ok(world.cat.children.some(o=>o.position.z===.85),'Carried prop is attached to cat');use(st,'target',item.group);}use(st,'check','check');
  }else if(t.kind==='switch'){for(const id of q.answer)use(st,'target',id);use(st,'check','check');}
  else if(t.kind==='chain'){for(const id of ['material','trade']){use(st,'pickup','cargo');use(st,'target',id);}}
  else{use(st,'pickup','cargo');use(st,'target',q.answer[0]);}
  assert.notEqual(worldMissions.play.current(st)?.id,q.id,'Physical interaction advances assessment');
 }
}
assert.equal(summary(data).fish,4);
assert.ok(nodes.get('worldFeedback').textContent.length>10);
assert.ok(!world.cat.children.some(o=>o.position.z===.85),'No held object leaks after completion');
console.log('Passed: actual Three.js mission scene, nearby interaction selection, carried meshes, all twelve in-world tasks and clean completion.');
