import * as THREE from './vendor/three.module.js';

const up=new THREE.Vector3(0,1,0),direction=new THREE.Vector3();
const angleDifference=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const approach=(value,target,step)=>value+THREE.MathUtils.clamp(target-value,-step,step);

export function prepareRoamingCat(actor){
  actor.speed=0;actor.cruiseSpeed=1.2;actor.gaitPhase=actor.phase/(Math.PI*2);
  actor.gaitBlend=0;actor.blockedTime=0;
  // Keep the chest, markings, head, and tail together during the tiny body sway.
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
    return {leg,upper,lower,knee,paw,footZ:.045,lift:0,bend:leg.position.z>0?-1:1};
  });
}

function poseLeg(rig,footZ,lift){
  // Two short joints reach the paw target. During stance the paw stays on the
  // ground; only the recovery part of a step lifts it.
  const y=-.434+lift,z=footZ,length=Math.hypot(y,z),segmentLength=.25;
  const midpoint=length/2,height=Math.sqrt(Math.max(0,segmentLength**2-midpoint**2));
  const ky=y/length*midpoint-z/length*height*rig.bend;
  const kz=z/length*midpoint+y/length*height*rig.bend;
  rig.knee.position.set(0,ky,kz);
  for(const [mesh,ay,az,by,bz]of [[rig.upper,0,0,ky,kz],[rig.lower,ky,kz,y,z]]){
    mesh.position.set(0,(ay+by)/2,(az+bz)/2);
    direction.set(0,by-ay,bz-az);const size=direction.length();
    mesh.quaternion.setFromUnitVectors(up,direction.normalize());mesh.scale.set(.9,size/.19,.95);
  }
  rig.paw.position.set(0,y,z);rig.paw.rotation.set(0,0,0);
}

function animateCat(actor,time,dt,distance){
  const scale=actor.root.scale.x,trot=actor.cruiseSpeed>1.7;
  const stride=(trot?.72:.48)*scale;
  actor.gaitPhase+=distance/stride;
  actor.gaitBlend=approach(actor.gaitBlend,Math.min(1,actor.speed/.45),dt*4);
  const duty=trot?.6:.74,offsets=trot?[0,.5,.5,0]:[0,.25,.5,.75];
  actor.rig.forEach((rig,i)=>{
    const phase=(actor.gaitPhase+offsets[i])%1;
    let reach,lift=0;
    if(phase<duty)reach=.5-phase/duty;
    else{
      const swing=(phase-duty)/(1-duty),smooth=swing*swing*(3-2*swing);
      reach=-.5+smooth;lift=Math.sin(Math.PI*swing)**2*(trot?.12:.085);
    }
    const blend=actor.gaitBlend;
    // Stance travels backwards at the same speed as the body travels forwards.
    const targetZ=.045+reach*stride/scale*duty*blend;
    rig.footZ=approach(rig.footZ,targetZ,dt*2.6);
    rig.lift=lift*blend;
    poseLeg(rig,rig.footZ,rig.lift);
  });
  actor.upperBody.position.y=Math.sin(actor.gaitPhase*Math.PI*4)*.012*actor.gaitBlend;
  actor.upperBody.rotation.z=Math.sin(actor.gaitPhase*Math.PI*2)*.012*actor.gaitBlend;
  actor.tail.rotation.z=Math.sin(time*1.7+actor.phase)*.12;
  actor.head.rotation.x=Math.sin(time*1.1+actor.phase)*.025;
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
  if(!actor.resting||attentive){
    const turn=angleDifference(heading,actor.root.rotation.y);
    actor.root.rotation.y+=THREE.MathUtils.clamp(turn,-2.4*dt,2.4*dt);
  }
  const turn=Math.abs(angleDifference(heading,actor.root.rotation.y));
  if(!actor.resting&&!attentive){
    // Brake before a tight turn or the end of a route, then accelerate gently.
    desiredSpeed=Math.min(actor.cruiseSpeed,Math.sqrt(2*2.8*Math.max(0,len-.12)));
    desiredSpeed*=THREE.MathUtils.clamp(1-turn/.55,0,1);
  }
  const forwardX=Math.sin(actor.root.rotation.y),forwardZ=Math.cos(actor.root.rotation.y);
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
  const step=actor.speed*dt;
  const x=position.x+forwardX*step,z=position.z+forwardZ*step;
  let distance=0;
  if(step>0&&clear(x,z)){position.x=x;position.z=z;distance=step;}
  else if(step>0){actor.speed=0;obstructed=true;}
  actor.blockedTime=obstructed?actor.blockedTime+dt:0;
  if(actor.blockedTime>1.2&&actor.speed<.05&&!attentive){
    actor.resting=true;actor.rest=.6+random();actor.blockedTime=0;
  }
  animateCat(actor,time,dt,distance);
  const look=attentive?THREE.MathUtils.clamp(angleDifference(Math.atan2(player.position.x-position.x,player.position.z-position.z),actor.root.rotation.y),-.65,.65):Math.sin(time*.7+actor.phase)*.035;
  actor.head.rotation.y+=angleDifference(look,actor.head.rotation.y)*(1-Math.exp(-6*dt));
}
