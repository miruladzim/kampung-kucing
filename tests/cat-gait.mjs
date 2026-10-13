import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {createWorld} from '../dist/world.js';
import {createPlayerMotion} from '../dist/player-motion.js';
globalThis.document={createElement:()=>({getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){},beginPath(){},roundRect(){},fill(){},fillText(){}})})};
const world=createWorld(new THREE.Scene());
const controller=createPlayerMotion(world.cat,world.legs,world.head,world.tail,world.colliders);
const {actor}=controller;
const dt=1/60;let time=0,lockedContacts=0;
const input={forward:1,right:0,yaw:0,running:false,enabled:true,height:0};
function pawPositions(){actor.root.updateMatrixWorld(true);return actor.rig.map(r=>r.paw.getWorldPosition(new THREE.Vector3()));}
function frame(overrides={}){
  const before=pawPositions(),contacts=actor.rig.map(r=>r.contact),cycles=actor.rig.map(r=>r.cycle);
  const wasAirborne=actor.airborne;
  const rootBefore=actor.root.position.clone(),phaseBefore=actor.gaitPhase;
  const result=controller.update(time+=dt,dt,{...input,...overrides});
  const after=pawPositions();
  if(!actor.airborne){
    assert.ok(actor.rig.filter(r=>r.contact).length>=2,'At least two paws should support the cat');
    actor.rig.forEach((rig,i)=>{
      assert.ok(after[i].y-.13*.66>=-1e-6,'A paw must not sink into the ground');
      if(contacts[i]&&rig.contact&&cycles[i]===rig.cycle&&actor.hasStepped){
        // Exclude initial pose setup and landing; inspect the rendered mesh position.
        if(phaseBefore>0&&!wasAirborne){
          assert.ok(after[i].distanceTo(before[i])<1e-6,'A planted paw slid across the ground');lockedContacts++;
        }
      }
    });
  }
  if(result.distance>1e-7){
    const forward=new THREE.Vector3(Math.sin(actor.root.rotation.y),0,Math.cos(actor.root.rotation.y));
    const travel=actor.root.position.clone().sub(rootBefore);travel.y=0;
    assert.ok(travel.normalize().dot(forward)>.99999,'The cat moved sideways relative to its feet');
    assert.ok(actor.airborne||actor.gaitPhase>phaseBefore,'Walking movement must advance the footsteps');
  }
  return result;
}
// Straight walking must cover exactly one stride per animation cycle.
for(let i=0;i<120;i++)frame();
assert.ok(Math.abs((17-actor.root.position.z)-actor.gaitPhase*actor.walkStride)<1e-8);
assert.ok(lockedContacts>200,'Not enough planted contacts were inspected');
const stopped=actor.root.position.clone();for(let i=0;i<30;i++)frame({forward:0});
assert.deepEqual(actor.root.position,stopped,'No input should mean no root drift');
const idlePhase=actor.gaitPhase;for(let i=0;i<10;i++)frame({forward:0});
assert.equal(actor.gaitPhase,idlePhase,'Standing cats must not cycle their walking legs');
assert.ok(actor.rig.every(r=>r.contact),'Idle cats should settle all four paws');
// Reversing direction needs visible pivot steps before forward travel.
const turnStart=actor.root.position.clone(),turnPhase=actor.gaitPhase;frame({forward:-1});
assert.deepEqual(actor.root.position,turnStart);assert.equal(actor.motionState,'turning');
assert.ok(actor.gaitPhase>turnPhase);
for(let i=0;i<50;i++)frame({forward:-1});
for(let i=0;i<50;i++)frame({forward:-1,running:true});
assert.equal(actor.gaitTrot,1,'Running should transition to the trot without requiring a stop');
// A wall stops both translation and the walking cycle, even with movement held.
actor.root.position.set(0,0,-38.99);actor.root.rotation.y=Math.PI;controller.reset();
const wallPosition=actor.root.position.clone();for(let i=0;i<30;i++)frame();
assert.deepEqual(actor.root.position,wallPosition);assert.equal(actor.gaitPhase,0);assert.equal(actor.motionState,'idle');
// Airborne movement tucks the legs without advancing a ground walking cycle.
actor.root.position.set(0,0,17);controller.reset();const jumpPhase=actor.gaitPhase;
frame({height:.6});assert.equal(actor.motionState,'jumping');assert.equal(actor.gaitPhase,jumpPhase);
assert.ok(actor.rig.every(r=>r.paw.position.y>-.4));
frame({height:0,forward:0});
assert.ok(actor.rig.every(r=>r.contact));
console.log('Passed: rendered paw contact locks, stride/distance synchronization, idle, pivot steps, blocked movement, jump/landing.');
