import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {createWorld} from '../dist/world.js';
// A canvas stub is enough for model creation; rendering is checked in the browser.
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){},beginPath(){},roundRect(){},fill(){},fillText(){}})})};
const scene=new THREE.Scene();const world=createWorld(scene);const {life,cat,colliders}=world;
assert.equal(life.villagers.length,5);assert.equal(life.cats.length,5);assert.equal(life.butterflies.length,18);
const actors=[...life.cats,...life.villagers.filter(v=>!v.stationary)];
const moved=new Map(actors.map(a=>[a,0]));const paused=new Set(),resumed=new Set();
for(let frame=1;frame<=2400;frame++){
  const previous=new Map(actors.map(a=>[a,a.root.position.clone()]));
  life.update(frame/20,.05);
  for(const actor of actors){
    assert.ok(actor.root.position.toArray().every(Number.isFinite));
    const distance=previous.get(actor).distanceTo(actor.root.position);moved.set(actor,moved.get(actor)+distance);
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
cat.position.set(-5,0,19.5);assert.match(life.reactToMeow(),/Pak Rahman/);assert.ok(life.villagers[0].wave>120);
cat.position.set(21,0,-36);assert.equal(life.reactToMeow(),null);
const butterfly=life.butterflies[0],previous=butterfly.root.position.clone();life.update(121,.05);assert.ok(previous.distanceTo(butterfly.root.position)>.01);
console.log('Passed: population, 120 seconds of collision-free roaming, pause/resume, greetings, butterfly motion.');
