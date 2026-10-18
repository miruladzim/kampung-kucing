import * as THREE from './vendor/three.module.js';
import {STATIONS} from './history-content.js';
import {stationComplete} from './history-state.js';
import {createWorldPlay} from './history-play.js';

const colors={water:'#74bbc3',rice:'#d8ba62',rattan:'#b69664',pepper:'#66834c',pearl:'#efe9d7',wood:'#9d7152',seaweed:'#5e9673',ore:'#73868a',gold:'#e5b750',pot:'#b77e5b',jewel:'#9fc4bd',clay:'#b78a71'};
function mesh(parent,geo,color,x,y,z){const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.85}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const box=(p,c,x,y,z,w=.6,h=.5,d=.6)=>mesh(p,new THREE.BoxGeometry(w,h,d),c,x,y,z);
function label(parent,text,x,y,z,width=2){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#fff2d6';ctx.beginPath();ctx.roundRect(3,3,506,90,20);ctx.fill();ctx.fillStyle='#294c3c';ctx.font=`bold ${text.length>24?25:30}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,48,484);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthWrite:false}));s.position.set(x,y,z);s.scale.set(width,width*96/512,1);parent.add(s);return s;}
function prop(parent,kind,x,z,scale=1){
 const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);parent.add(g);const color=colors[kind]||'#b79a72';
 if(kind==='gong'){box(g,'#806246',-.35,.5,0,.1,1,.1);box(g,'#806246',.35,.5,0,.1,1,.1);box(g,'#806246',0,1,0,.9,.1,.1);const disc=mesh(g,new THREE.CylinderGeometry(.34,.34,.06,24),'#c7a85e',0,.65,0);disc.rotation.x=Math.PI/2;}
 else if(kind==='water'||kind==='salt'){mesh(g,new THREE.CylinderGeometry(.37,.3,.48,12),'#9b7952',0,.24,0);mesh(g,new THREE.CylinderGeometry(.33,.33,.025,16),kind==='salt'?'#eee7cd':colors.water,0,.49,0);}
 else if(kind==='basket'){box(g,'#a37c50',0,.25,0,.9,.5,.75);for(let i=0;i<5;i++)box(g,'#d5b887',0,.12+i*.09,0,.94,.035,.79);box(g,'#594b36',0,.51,0,.75,.025,.6);}
 else if(kind==='boat'){box(g,'#785a3e',0,.15,0,1.35,.18,.8);mesh(g,new THREE.SphereGeometry(.5,8,5),'#ae805a',0,.2,0).scale.set(1.5,.35,.7);box(g,'#694e38',0,.75,0,.04,1.2,.04);const sail=mesh(g,new THREE.ConeGeometry(.43,.8,3),'#f1dec0',.1,.9,0);sail.rotation.z=-.4;}
 else if(kind==='store'||kind==='closed'){box(g,'#9c7a50',0,.4,0,.9,.8,.75);const roof=mesh(g,new THREE.ConeGeometry(.85,.55,4),kind==='closed'?'#845f56':'#82a196',0,1,0);roof.rotation.y=Math.PI/4;box(g,kind==='closed'?'#744d3e':'#514f3b',0,.4,.39,.4,.6,.03);}
 else if(kind==='gate'){box(g,'#876c49',-.35,.5,0,.1,1,.12);box(g,'#876c49',.35,.5,0,.1,1,.12);box(g,'#b69966',0,.42,0,.65,.6,.1);const wheel=mesh(g,new THREE.TorusGeometry(.23,.035,6,16),'#5e7666',0,.9,.15);wheel.name='wheel';}
 else if(kind==='pot'){mesh(g,new THREE.SphereGeometry(.33,12,8),color,0,.32,0).scale.y=1.1;mesh(g,new THREE.CylinderGeometry(.18,.23,.16,12),color,0,.65,0);mesh(g,new THREE.CircleGeometry(.145,12),'#594733',0,.735,0).rotation.x=-Math.PI/2;}
 else if(kind==='rice'||kind==='dry'||kind==='pepper'||kind==='seaweed'){
  box(g,'#8b7650',0,.06,0,.7,.12,.7);for(let i=0;i<5;i++){const a=i*2.4;const stem=box(g,kind==='dry'?'#bc9a62':kind==='rice'?'#88a566':'#658b62',Math.sin(a)*.2,.35,Math.cos(a)*.2,.04,.6,.04);stem.rotation.z=Math.sin(a)*.25;if(kind==='rice')mesh(g,new THREE.SphereGeometry(.08,6,4),'#e4c66c',Math.sin(a)*.25,.64,Math.cos(a)*.2);}}
 else if(kind==='rattan'||kind==='wood'){for(let i=0;i<4;i++){const stick=mesh(g,new THREE.CylinderGeometry(.05,.06,.85,6),color,(i-1.5)*.11,.17,0);stick.rotation.x=Math.PI/2;}}
 else if(kind==='barrier'){box(g,'#a17a4a',-.35,.35,0,.1,.7,.1);box(g,'#a17a4a',.35,.35,0,.1,.7,.1);box(g,'#caa475',0,.45,0,.9,.15,.12);}
 else if(kind==='pearl'||kind==='jewel'){mesh(g,new THREE.SphereGeometry(.24,12,8),color,0,.25,0);}
 else if(kind==='ore'||kind==='gold'||kind==='clay'){mesh(g,new THREE.DodecahedronGeometry(.36),color,0,.3,0);mesh(g,new THREE.DodecahedronGeometry(.18),kind==='ore'?'#a9b3a8':color,.25,.14,.15);}
 else {box(g,'#b68b57',0,.28,0,.65,.55,.6);box(g,'#d6b983',0,.3,.31,.055,.55,.02);}
 return g;
}
function dispose(root){root.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose();}});root.removeFromParent();}

export function createHistoryWorld(scene,cat,learning,colliders=[]){
 const feedbackEl=document.getElementById('worldFeedback'),taskEl=document.getElementById('worldInstruction'),titleEl=document.getElementById('worldMissionTitle'),prompt=document.getElementById('nearbyMission');
 let nearby=null,active=null,time=0,feedbackUntil=0,held=null;
 const play=createWorldPlay(learning.getSession(),{save:()=>learning.saveWorld(),feedback:(text,type='info')=>{feedbackEl.textContent=text;feedbackEl.dataset.type=type;feedbackUntil=time+12;feedbackEl.hidden=false;},reward:st=>learning.rewardWorld(st)});
 const stations=STATIONS.map(st=>{
  const root=new THREE.Group();root.position.set(st.x,0,st.z);scene.add(root);
  const sign=label(root,`${st.number} · ${st.name}`,0,2.1,-4,3.4);
  box(root,'#8e7653',0,1,-4,.1,2,.1);
  const ring=mesh(root,new THREE.TorusGeometry(.6,.03,6,40),st.color,0,.04,3.6);ring.rotation.x=-Math.PI/2;
  const beacon=mesh(root,new THREE.OctahedronGeometry(.18),st.color,0,1.5,3.6);
  // Permanent scenery makes completed work visible after the task changes.
  const decor=new THREE.Group();root.add(decor);const water=[];const crops=[];const rewards=[];
  if(st.id==='pertanian'){
   box(decor,'#958265',4.7,.1,0,2.1,.2,3.8);const reservoir=box(decor,'#75b3bd',4.7,.22,-1.25,1.8,.08,1);water.push(reservoir);
   water.push(box(decor,'#75b3bd',4.7,.15,0,.28,.06,1.5));box(decor,'#705f3d',4.7,.13,1.3,1.9,.07,1.4);
   for(let i=0;i<6;i++)crops.push(prop(decor,'rice',4.1+i%3*.6,.9+Math.floor(i/3)*.65,.6));
  }else if(st.id==='perdagangan'){rewards.push([prop(decor,'crate',-4.6,0,.8),'d1']);rewards.push([prop(decor,'rice',-4.8,-1,.7),'d3']);prop(decor,'boat',-4.6,0,1.6);prop(decor,'store',-4.7,-2,1.3);box(decor,'#76a9b0',-4.6,.025,0,2.4,.03,3.2);}
  else if(st.id==='hasil'){for(let i=0;i<3;i++){box(decor,'#927457',-4.7+i*.6,.65,-1,.12,1.3,.12);mesh(decor,new THREE.IcosahedronGeometry(.6,0),'#71916b',-4.7+i*.6,1.5,-1);}prop(decor,'pearl',4.6,1,1.4);rewards.push([prop(decor,'basket',4.6,-1,1.2),'h2']);}
  else {prop(decor,'ore',-4.5,0,1.8);rewards.push([prop(decor,'pot',4.6,0,1.5),'b2']);box(decor,'#b6976c',4.6,.2,0,1.6,.4,1.3);}
  return {st,root,sign,ring,beacon,water,crops,rewards,colliders:[],key:null,objects:[],dynamic:null};
 });
 function rebuild(m){
  for(const c of m.colliders){const i=colliders.indexOf(c);if(i>=0)colliders.splice(i,1);}m.colliders=[];if(m.dynamic)dispose(m.dynamic);m.dynamic=new THREE.Group();m.root.add(m.dynamic);m.objects=[];
  const q=play.current(m.st),r=play.state(m.st),t=play.task(m.st);if(!q){label(m.dynamic,'✓ Kampung semakin makmur',0,1,0,3);const fish=mesh(m.dynamic,new THREE.SphereGeometry(.3,10,6),'#e8c477',0,1.6,0);fish.scale.set(1.5,.7,.55);const tail=mesh(m.dynamic,new THREE.ConeGeometry(.22,.35,3),'#d49c5c',-.55,1.6,0);tail.rotation.z=-Math.PI/2;return;}
  function add(kind,id,name,icon,x,z){if(kind==='target'||kind==='check'){const collider={x:m.st.x+x,z:m.st.z+z,r:.35};colliders.push(collider);m.colliders.push(collider);}
   const object=prop(m.dynamic,icon,x,z,kind==='pickup'?.7:1);object.userData={action:kind,id};const text=label(m.dynamic,name,x,kind==='pickup'?.8:1.55,z,kind==='pickup'?1.55:2);const halo=mesh(m.dynamic,new THREE.TorusGeometry(kind==='pickup'?.36:.63,.025,5,28),'#f4d17b',x,.04,z);halo.rotation.x=-Math.PI/2;m.objects.push({kind,id,name,object,text,halo,x:m.st.x+x,z:m.st.z+z});return object;}
  const positions=t.targets.length===2?[[-2.5,-1.4],[2.5,-1.4]]:t.targets.length===4?[[-2.5,-1.6],[2.5,-1.6],[-2.5,1.1],[2.5,1.1]]:[[-2.5,-1.4],[0,-2.1],[2.5,-1.4]];
  t.targets.forEach(([id,name,icon],i)=>{
   const [x,z]=positions[i],o=add('target',id,name,icon,x,z);
   if(r.selected.includes(id)){label(m.dynamic,'✓',x,2,z,.55);o.scale.multiplyScalar(1.13);box(m.dynamic,'#a6c379',x,.025,z,1.3,.025,1.3);}
  });
  if(t.kind==='sort'){
   q.items.forEach((item,i)=>{
    if(r.carrying===item.id)return;
    const placed=r.places[item.id],targetIndex=t.targets.findIndex(v=>v[0]===placed);
    const [x,z]=placed?[positions[targetIndex][0]+(i%2? .2:-.2),positions[targetIndex][1]-.13+Math.floor(i/2)*.25]:[-1.5+i,2.4];
    const object=add('pickup',item.id,item.label,item.icon,x,z);if(placed){object.position.y=.55;object.scale.setScalar(.45);m.objects.at(-1).placed=true;}
   });
  }else if(t.kind==='carry'||t.kind==='chain'){
   if(!r.carrying)add('pickup','cargo',t.kind==='chain'?(r.chain?'Pasu siap':'Bijih mineral'):t.cargo,t.kind==='chain'?(r.chain?'pot':'ore'):t.icon,0,2);
  }
  if(t.kind==='sort'||t.kind==='switch')add('check','check','Bunyikan gong','gong',0,-3.5);
 }
 function sync(){for(const m of stations){const r=play.state(m.st),q=play.current(m.st);const key=JSON.stringify(r)||'done';if(key!==m.key){m.key=key;rebuild(m);}const irrigated=!!learning.getSession().records.p1?.attempts.some(a=>a.correct)&&(q?.id!=='p3'||(r.selected.includes('channel')&&r.selected.includes('storage')));for(const [o,id] of m.rewards)o.visible=!!learning.getSession().records[id]?.attempts.some(a=>a.correct);if(m.st.id==='pertanian'){m.water.forEach(o=>o.visible=irrigated);m.crops.forEach(o=>o.scale.y=irrigated?1:.5);}const done=stationComplete(learning.getSession(),m.st.id);m.beacon.visible=!done;m.ring.material.color.set(done?'#86af75':m.st.color);}}
 function interact(){if(!nearby)return;const previous=nearby;play.act(previous.m.st,previous.kind,previous.id);sync();}
 prompt.onclick=interact;
 document.getElementById('worldHint').onclick=()=>{if(active)play.act(active.st,'hint');};
 document.getElementById('worldDrop').onclick=()=>{if(active){play.act(active.st,'drop');sync();}};
 function update(t,started){
  time=t;sync();let nearestStation=null,dist=Infinity;for(const m of stations){const d=Math.hypot(cat.position.x-m.st.x,cat.position.z-m.st.z);if(d<dist){dist=d;nearestStation=m;}m.beacon.position.y=1.4+Math.sin(time*2)*.1;m.beacon.rotation.y=time;for(const [i,o] of m.water.entries()){o.position.y=(i===0?.22:.15)+Math.sin(time*3+i)*.012;}m.crops.forEach((o,i)=>o.rotation.z=Math.sin(time*2+i)*.025);}
  // Keep held objects and the active interaction tied to the station they belong to.
  const carrying=stations.find(m=>play.state(m.st)?.carrying);active=carrying||nearestStation;
  const r=play.state(active.st),q=play.current(active.st),task=play.task(active.st);
  const visible=started&&dist<7;document.getElementById('worldTask').hidden=!visible;
  if(visible){titleEl.textContent=`${active.st.number} · ${active.st.name} · ${q?`${active.st.questions.indexOf(q)+1} / 3`:'Selesai ✓'}`;taskEl.textContent=task?task.instruction:'Satu ikan diperoleh! Teruskan ke stesen lain di sepanjang jalan.';document.getElementById('worldHint').hidden=!q;document.getElementById('worldDrop').hidden=!r?.carrying;}
  nearby=null;let best=1.65;
  for(const m of stations)for(const o of m.objects){const d=Math.hypot(cat.position.x-o.x,cat.position.z-o.z);o.text.visible=started&&d<7;o.halo.visible=started&&d<7;o.halo.material.emissive.set(d<1.65?'#bca361':'#000000');o.halo.material.emissiveIntensity=.7;if(started&&m===active&&d<best){if(r?.carrying&&o.kind==='pickup')continue;if(!r?.carrying&&task?.kind!=='switch'&&o.kind==='target')continue;nearby={...o,m};best=d;}}
  for(const m of stations)for(const o of m.objects)if(o.placed)o.text.visible=nearby?.id===o.id&&nearby?.m===m;
  prompt.hidden=!nearby;prompt.textContent=nearby?`F · ${nearby.kind==='pickup'?'Angkut':nearby.kind==='target'?(task.kind==='switch'?'Kendalikan':'Letakkan di'):''} ${nearby.name}`:'';
  const heldKey=r?.carrying?`${r.id}-${r.carrying}-${r.chain}`:'';
  if(held?.key!==heldKey){if(held)dispose(held.root);held=null;if(heldKey){const item=q.items?.find(i=>i.id===r.carrying),root=new THREE.Group();cat.add(root);root.position.set(0,.5,.85);prop(root,item?.icon||(task.kind==='chain'?(r.chain?'pot':'ore'):task.icon),0,0,.45);held={root,key:heldKey};}}
  if(time>feedbackUntil)feedbackEl.hidden=true;
  return nearestStation.st;
 }
 return {update,interact,play,stations};
}
