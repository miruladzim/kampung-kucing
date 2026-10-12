import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {createWorld} from '../dist/world.js';
// A canvas stub is enough for model creation; rendering is checked in the browser.
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){},beginPath(){},roundRect(){},fill(){},fillText(){}})})};
const scene=new THREE.Scene();const world=createWorld(scene);const {life,cat,colliders}=world;
assert.equal(life.villagers.length,5);assert.equal(life.cats.length,5);assert.equal(life.butterflies.length,18);
const actors=[...life.cats,...life.villagers.filter(v=>!v.stationary)];
const moved=new Map(actors.map(a=>[a,0]));const paused=new Set(),resumed=new Set();
const catMotion=new Map(life.cats.map(a=>[a,{speed:0,yaw:a.root.rotation.y,lifted:false}]));
for(let frame=1;frame<=2400;frame++){
  const previous=new Map(actors.map(a=>[a,a.root.position.clone()]));
  life.update(frame/20,.05);
  for(const actor of actors){
    assert.ok(actor.root.position.toArray().every(Number.isFinite));
    const distance=previous.get(actor).distanceTo(actor.root.position);moved.set(actor,moved.get(actor)+distance);
    if(actor.kind==='cat'){
      const motion=catMotion.get(actor),delta=actor.root.position.clone().sub(previous.get(actor));
      assert.ok(Math.abs(actor.speed-motion.speed)<=2.8*.05+1e-8,`${actor.name} changed speed abruptly`);
      assert.ok(Math.abs(Math.atan2(Math.sin(actor.root.rotation.y-motion.yaw),Math.cos(actor.root.rotation.y-motion.yaw)))<=2.4*.05+1e-8,`${actor.name} snapped around`);
      if(distance>1e-6){
        const forward=new THREE.Vector3(Math.sin(actor.root.rotation.y),0,Math.cos(actor.root.rotation.y));
        assert.ok(delta.normalize().dot(forward)>.999,`${actor.name} slid sideways`);
        assert.ok(Math.abs(distance/.05-actor.speed)<1e-8,`${actor.name} stopped moving before its walk stopped`);
      }
      let planted=0;
      for(const rig of actor.rig){
        const sole=rig.leg.position.y+rig.paw.position.y-.13*.66;
        assert.ok(sole>=-1e-5,`${actor.name} put a paw below ground`);
        if(sole<.002)planted++;if(sole>.025)motion.lifted=true;
      }
      assert.ok(planted>=2,`${actor.name} floated with all paws lifted`);
      assert.equal(actor.root.position.y,0);
      motion.speed=actor.speed;motion.yaw=actor.root.rotation.y;
    }
    if(actor.resting)paused.add(actor);if(paused.has(actor)&&distance>.005)resumed.add(actor);
    for(const c of colliders){
      const x=actor.root.position.x,z=actor.root.position.z;
      if(c.kind==='pond'){assert.ok(((x-c.x)/(c.rx+.44))**2+((z-c.z)/(c.rz+.44))**2>=1);continue;}
      if(!c.w){assert.ok(Math.hypot(x-c.x,z-c.z)>=c.r+.44);continue;}
      const dx=x-c.x,dz=z-c.z,lx=dx*Math.cos(c.rotation)-dz*Math.sin(c.rotation),lz=dx*Math.sin(c.rotation)+dz*Math.cos(c.rotation);
      assert.ok(!(Math.abs(lx)<c.w/2+.44&&lz>-c.d/2-.44&&lz<c.d/2+3.04),`${actor.name} entered a house or porch`);
    }
  }
}
for(const actor of actors){assert.ok(moved.get(actor)>8,`${actor.name} did not roam`);assert.ok(resumed.has(actor),`${actor.name} did not resume after resting`);}
for(const actor of life.cats)assert.ok(catMotion.get(actor).lifted,`${actor.name} never took a step`);
cat.position.set(-5,0,19.5);assert.match(life.reactToMeow(),/Pak Rahman/);assert.ok(life.villagers[0].wave>120);
cat.position.set(21,0,-36);assert.equal(life.reactToMeow(),null);
const butterfly=life.butterflies[0],previous=butterfly.root.position.clone();life.update(121,.05);assert.ok(previous.distanceTo(butterfly.root.position)>.01);
const curious=life.cats[0];cat.position.copy(curious.root.position).add(new THREE.Vector3(.4,0,.8));life.reactToMeow();
for(let frame=1;frame<=28;frame++)life.update(121+frame*.05,.05);
assert.equal(curious.speed,0,'A nearby meow should make a cat pause');
assert.ok(curious.rig.every(r=>r.lift<.001),'A cat should settle all paws when paused');
const idlePhase=curious.gaitPhase;life.update(122.45,.05);assert.equal(curious.gaitPhase,idlePhase,'Idle cats should not walk in place');
console.log('Passed: 120 seconds of roaming, smooth speeds/turns, forward movement, grounded stepping, pause/resume, meow attention, greetings, butterflies.');
