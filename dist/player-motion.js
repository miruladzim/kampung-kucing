import {prepareRoamingCat,resetCatGait,stepCatMotion} from './cat-motion.js';

const difference=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export function createPlayerMotion(root,legs,head,tail,colliders){
  const actor={root,legs,head,tail,phase:0,walkStride:.8,trotStride:1.18};
  prepareRoamingCat(actor);
  function clear(x,z){
    if(x<=-23||x>=23||z<=-39||z>=37)return false;
    return !colliders.some(c=>{
      if(c.kind==='pond')return ((x-c.x)/(c.rx+.3))**2+((z-c.z)/(c.rz+.3))**2<1;
      if(!c.w)return Math.hypot(x-c.x,z-c.z)<c.r+.25;
      const dx=x-c.x,dz=z-c.z,lx=dx*Math.cos(c.rotation)-dz*Math.sin(c.rotation),lz=dx*Math.sin(c.rotation)+dz*Math.cos(c.rotation);
      return Math.abs(lx)<c.w/2+.3&&Math.abs(lz)<c.d/2+.3;
    });
  }
  function update(time,dt,{forward,right,yaw,running,enabled,height}){
    let heading=null,speed=0;
    if(enabled&&(forward||right)){
      const dx=right*Math.cos(yaw)-forward*Math.sin(yaw),dz=-right*Math.sin(yaw)-forward*Math.cos(yaw);
      heading=Math.atan2(dx,dz);
      const turn=Math.max(0,Math.abs(difference(heading,root.rotation.y))-5*dt);
      // Take pivot steps before moving; never strafe while facing elsewhere.
      speed=(running?4.2:2.2)*Math.max(0,1-turn/.65);
    }
    root.position.y=height;
    return stepCatMotion(actor,time,dt,{speed,heading,clear,turnRate:5,trot:running,airborne:height>.001});
  }
  return {actor,update,reset:()=>resetCatGait(actor)};
}
