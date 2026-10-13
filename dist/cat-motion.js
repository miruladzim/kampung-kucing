import * as THREE from './vendor/three.module.js';

const up=new THREE.Vector3(0,1,0),direction=new THREE.Vector3(),kneePoint=new THREE.Vector3();
const angleDifference=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const approach=(value,target,step)=>value+THREE.MathUtils.clamp(target-value,-step,step);
const pawHeight=.13*.66+.0002;

function footToWorld(actor,rig,x,y,z,result){
  const scale=actor.root.scale.x,c=Math.cos(actor.root.rotation.y),s=Math.sin(actor.root.rotation.y);
  const lx=rig.leg.position.x+x,lz=rig.leg.position.z+z;
  return result.set(actor.root.position.x+(lx*c+lz*s)*scale,
    actor.root.position.y+(rig.leg.position.y+y)*scale,
    actor.root.position.z+(-lx*s+lz*c)*scale);
}

export function resetCatGait(actor){
  actor.speed=0;actor.gaitPhase=0;actor.gaitBlend=0;actor.gaitTrot=0;actor.motionState='idle';actor.hasStepped=false;actor.airborne=false;
  actor.upperBody.position.y=0;actor.upperBody.rotation.z=0;
  actor.rig.forEach(rig=>{
    rig.contact=true;rig.cycle=0;rig.lift=0;
    footToWorld(actor,rig,0,pawHeight-rig.leg.position.y,.045,rig.anchor);
    rig.footWorld.copy(rig.anchor);rig.swingStart.copy(rig.anchor);
    poseLeg(rig,0,pawHeight-rig.leg.position.y,.045);
  });
}

export function prepareRoamingCat(actor){
  actor.cruiseSpeed=1.2;actor.blockedTime=0;actor.gaitMode='walk';actor.airborne=false;
  // All markings and body parts share the sway, while feet stay on the ground.
  actor.upperBody=new THREE.Group();
  for(const child of [...actor.root.children])if(!actor.legs.includes(child))actor.upperBody.add(child);
  actor.root.add(actor.upperBody);
  actor.rig=actor.legs.map(leg=>{
    const fur=leg.children[0].material,paw=leg.children[1];
    leg.clear();leg.rotation.set(0,0,0);
    const segment=()=>{
      const mesh=new THREE.Mesh(new THREE.SphereGeometry(.095,12,8),fur);
      mesh.castShadow=true;mesh.receiveShadow=true;leg.add(mesh);return mesh;
    };
    const upper=segment(),lower=segment(),knee=segment();knee.scale.setScalar(.9);
    leg.add(paw);
    return {leg,upper,lower,knee,paw,lift:0,bend:leg.position.z>0?-1:1,
      anchor:new THREE.Vector3(),footWorld:new THREE.Vector3(),swingStart:new THREE.Vector3(),landing:new THREE.Vector3()};
  });
  resetCatGait(actor);
}

function poseLeg(rig,x,y,z){
  const length=Math.hypot(x,y,z),segmentLength=.285;
  direction.set(x,y,z).divideScalar(length);
  // Project the knee bend perpendicular to the hip-to-paw direction.
  kneePoint.set(0,0,-rig.bend).addScaledVector(direction,direction.z*rig.bend).normalize();
  kneePoint.multiplyScalar(Math.sqrt(Math.max(0,segmentLength**2-length**2/4)))
    .addScaledVector(direction,length/2);
  rig.knee.position.copy(kneePoint);
  rig.upper.position.copy(kneePoint).multiplyScalar(.5);
  direction.copy(kneePoint);let size=direction.length();
  rig.upper.quaternion.setFromUnitVectors(up,direction.normalize());rig.upper.scale.set(.9,size/.19,.95);
  direction.set(x,y,z).sub(kneePoint);size=direction.length();
  rig.lower.position.copy(kneePoint).addScaledVector(direction,.5);
  rig.lower.quaternion.setFromUnitVectors(up,direction.normalize());rig.lower.scale.set(.9,size/.19,.95);
  rig.paw.position.set(x,y,z);rig.paw.rotation.set(0,0,0);
}

// The accepted stride advance drives both root motion and the leg cycle.
// A blocked stride advances neither position nor walking animation.
export function stepCatMotion(actor,time,dt,{speed,heading,clear,turnRate=2.4,trot=false,airborne=false}){
  const position=actor.root.position,scale=actor.root.scale.x;
  const oldYaw=actor.root.rotation.y;
  if(heading!==null)actor.root.rotation.y+=THREE.MathUtils.clamp(angleDifference(heading,oldYaw),-turnRate*dt,turnRate*dt);
  const turn=actor.root.rotation.y-oldYaw;
  actor.gaitMode=trot?'trot':'walk';
  actor.gaitTrot=approach(actor.gaitTrot,trot?1:0,dt*4);
  const stride=THREE.MathUtils.lerp(actor.walkStride||.48,actor.trotStride||.72,actor.gaitTrot)*scale;
  const strideAdvance=speed*dt/stride;
  let distance=strideAdvance*stride;
  const forwardX=Math.sin(actor.root.rotation.y),forwardZ=Math.cos(actor.root.rotation.y);
  if(!clear(position.x+forwardX*distance,position.z+forwardZ*distance))distance=0;
  position.x+=forwardX*distance;position.z+=forwardZ*distance;
  actor.speed=distance/dt;
  actor.motionState=airborne?'jumping':distance>1e-7?'walking':Math.abs(turn)>1e-7?'turning':'idle';
  const footTravel=Math.hypot(distance,turn*.65*scale);
  actor.travelRatio=footTravel>0?distance/footTravel:0;
  if(!airborne)actor.gaitPhase+=footTravel/stride;
  animateCat(actor,time,dt,stride,airborne);
  return {distance,turn,blocked:speed>0&&distance===0};
}

function animateCat(actor,time,dt,stride,airborne){
  const scale=actor.root.scale.x,trot=actor.gaitTrot,active=actor.motionState==='walking'||actor.motionState==='turning';
  const duty=.74-.14*trot,offsets=[0,.25+.25*trot,.5,.75+.25*trot];
  const c=Math.cos(actor.root.rotation.y),s=Math.sin(actor.root.rotation.y);
  actor.gaitBlend=approach(actor.gaitBlend,active?1:0,dt*6);
  actor.rig.forEach((rig,i)=>{
    const total=actor.gaitPhase+offsets[i],cycle=Math.floor(total),phase=total-cycle;
    if(active&&!actor.hasStepped){
      const reach=phase<duty?(.5-phase/duty)*stride/scale*duty*actor.travelRatio:0;
      footToWorld(actor,rig,0,pawHeight-rig.leg.position.y,.045+reach,rig.anchor);
      rig.footWorld.copy(rig.anchor);rig.swingStart.copy(rig.anchor);
    }
    if(airborne){
      // Jumping uses a tucked pose, rather than cycling walking legs in midair.
      poseLeg(rig,0,-.32,rig.leg.position.z>0?.09:-.07);rig.contact=false;
      return;
    }
    if(actor.airborne){
      footToWorld(actor,rig,0,pawHeight-rig.leg.position.y,.045,rig.anchor);
      rig.footWorld.copy(rig.anchor);rig.contact=true;rig.cycle=cycle;
    }
    if(!active){
      // Settle a lifted paw vertically; planted paws never slide back to neutral.
      rig.footWorld.y=approach(rig.footWorld.y,pawHeight*scale,dt*.8*scale);
      rig.contact=rig.footWorld.y<=pawHeight*scale+1e-6;
      if(rig.contact)rig.anchor.copy(rig.footWorld);
    }else if(phase<duty){
      if(!rig.contact||cycle!==rig.cycle){
        const reach=(.5-phase/duty)*stride/scale*duty*actor.travelRatio;
        footToWorld(actor,rig,0,pawHeight-rig.leg.position.y,.045+reach,rig.anchor);
      }
      rig.footWorld.copy(rig.anchor);rig.contact=true;
    }else{
      if(rig.contact)rig.swingStart.copy(rig.footWorld);
      const swing=(phase-duty)/(1-duty),smooth=swing*swing*(3-2*swing);
      const remaining=(1-phase)*stride/Math.max(actor.speed,.3);
      footToWorld(actor,rig,0,pawHeight-rig.leg.position.y,.045+stride/scale*duty*.5*actor.travelRatio,rig.landing);
      rig.landing.x+=Math.sin(actor.root.rotation.y)*actor.speed*remaining;
      rig.landing.z+=Math.cos(actor.root.rotation.y)*actor.speed*remaining;
      rig.footWorld.lerpVectors(rig.swingStart,rig.landing,smooth);
      rig.footWorld.y=pawHeight*scale+Math.sin(Math.PI*swing)**2*(.11+.02*trot)*scale*actor.gaitBlend;
      rig.contact=false;
    }
    rig.cycle=cycle;
    const rx=(rig.footWorld.x-actor.root.position.x)/scale,rz=(rig.footWorld.z-actor.root.position.z)/scale;
    const x=rx*c-rz*s-rig.leg.position.x,z=rx*s+rz*c-rig.leg.position.z;
    const y=(rig.footWorld.y-actor.root.position.y)/scale-rig.leg.position.y;
    rig.lift=Math.max(0,rig.footWorld.y/scale-pawHeight);
    poseLeg(rig,x,y,z);
  });
  if(active)actor.hasStepped=true;
  actor.airborne=airborne;
  actor.upperBody.position.y=Math.sin(actor.gaitPhase*Math.PI*4)*.012*actor.gaitBlend;
  actor.upperBody.rotation.z=Math.sin(actor.gaitPhase*Math.PI*2)*.012*actor.gaitBlend;
  actor.tail.rotation.z=Math.sin(time*1.7+(actor.phase||0))*.12;
  actor.head.rotation.x=Math.sin(time*1.1+(actor.phase||0))*.025;
}

export function updateRoamingCat(actor,time,dt,environment){
  const {clear,chooseTarget,random,neighbors,player}=environment,position=actor.root.position;
  const attentive=time<actor.attention;
  if(actor.resting&&!attentive){
    actor.rest-=dt;
    if(actor.rest<=0){actor.resting=false;chooseTarget(actor);}
  }
  let dx=actor.target.x-position.x,dz=actor.target.z-position.z,len=Math.hypot(dx,dz);
  if(!actor.resting&&len<.15){actor.resting=true;actor.rest=1.5+random()*3;}
  let heading=Math.atan2(dx,dz),desiredSpeed=0;
  if(attentive&&actor.speed<.1)heading=Math.atan2(player.position.x-position.x,player.position.z-position.z);
  const nextYaw=actor.root.rotation.y+THREE.MathUtils.clamp(angleDifference(heading,actor.root.rotation.y),-2.4*dt,2.4*dt);
  const turn=Math.abs(angleDifference(heading,nextYaw));
  if(!actor.resting&&!attentive){
    // Brake before a tight turn or the end of a route, then accelerate gently.
    desiredSpeed=Math.min(actor.cruiseSpeed,Math.sqrt(2*2.8*Math.max(0,len-.12)));
    desiredSpeed*=THREE.MathUtils.clamp(1-turn/.55,0,1);
  }
  const forwardX=Math.sin(nextYaw),forwardZ=Math.cos(nextYaw);
  const stoppingDistance=actor.speed**2/(2*2.8)+.12;
  let obstructed=!clear(position.x+forwardX*stoppingDistance,position.z+forwardZ*stoppingDistance);
  for(const other of neighbors){
    if(other===actor)continue;
    const ox=other.root.position.x-position.x,oz=other.root.position.z-position.z;
    const ahead=ox*forwardX+oz*forwardZ,side=Math.abs(ox*forwardZ-oz*forwardX);
    if(ahead>0&&ahead<1.4&&side<.55){
      desiredSpeed*=THREE.MathUtils.clamp((ahead-.65)/.75,0,1);
      if(ahead<.9)obstructed=true;
    }
  }
  if(obstructed)desiredSpeed=0;
  actor.speed=approach(actor.speed,desiredSpeed,dt*(desiredSpeed>actor.speed?1.6:2.8));
  const result=stepCatMotion(actor,time,dt,{speed:actor.speed,heading:!actor.resting||attentive?heading:null,clear,trot:actor.cruiseSpeed>1.7});
  if(result.blocked)obstructed=true;
  actor.blockedTime=obstructed?actor.blockedTime+dt:0;
  if(actor.blockedTime>1.2&&actor.speed<.05&&!attentive){
    actor.resting=true;actor.rest=.6+random();actor.blockedTime=0;
  }
  const look=attentive?THREE.MathUtils.clamp(angleDifference(Math.atan2(player.position.x-position.x,player.position.z-position.z),actor.root.rotation.y),-.65,.65):Math.sin(time*.7+actor.phase)*.035;
  actor.head.rotation.y+=angleDifference(look,actor.head.rotation.y)*(1-Math.exp(-6*dt));
}
