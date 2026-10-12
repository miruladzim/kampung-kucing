import * as THREE from './vendor/three.module.js';

export function createPond(scene, helpers, player, colliders) {
  const {add,sphere,foliage,cylinder,beam,group}=helpers;
  const dynamicRoots=[],fish=[],blades=[];
  let seed=281;function random(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
  const pond={x:14,z:25,rx:3.25,rz:2.65,surface:.14};
  colliders.push({x:pond.x,z:pond.z,rx:pond.rx,rz:pond.rz,kind:'pond'});
  const bank=group(pond.x,pond.z);bank.userData.role='fish-pond';
  cylinder(3.5,3.55,.15,'#a69470',0,.01,0,bank,48).scale.z=.83;
  cylinder(3.26,3.3,.13,'#456b60',0,.045,0,bank,48).scale.z=pond.rz/pond.rx;
  const water=add(new THREE.CircleGeometry(pond.rx,64),'#639c90',0,pond.surface,0,bank);water.rotation.x=-Math.PI/2;water.scale.y=pond.rz/pond.rx;
  water.material=water.material.clone();water.material.transparent=true;water.material.opacity=.69;water.material.roughness=.25;water.material.depthWrite=false;water.castShadow=false;dynamicRoots.push(water);
  for(let i=0;i<36;i++){
    const a=i/36*Math.PI*2,r=3.42+(random()-.5)*.16;
    const rock=foliage(.23+random()*.10,i%3?'#b9ad8d':'#c9bea0',Math.cos(a)*r,.12,Math.sin(a)*r*.82,bank,1.2,.68,.92);rock.rotation.y=a;
  }
  for(const [x,z]of [[-2.1,.2],[1.4,1.3],[-.9,1.6],[1.9,-.7]]){
    const pad=add(new THREE.CircleGeometry(.38,20, .18,Math.PI*2-.38),'#668b58',x,.158,z,bank);pad.rotation.x=-Math.PI/2;pad.rotation.z=random()*6.28;pad.castShadow=false;
    if(x<0){for(let j=0;j<6;j++){const a=j/6*Math.PI*2;const petal=sphere(.09,'#e6b1b6',x+Math.cos(a)*.10,.20,z+Math.sin(a)*.10,bank,.75,1,.75);petal.rotation.z=Math.sin(a)*.3;}sphere(.055,'#e8c87a',x,.23,z,bank);}
  }
  for(const [x,z]of [[3,.8],[-2.5,1.8],[2.3,-2.1]])for(let j=0;j<6;j++){
    const xx=x+(random()-.5)*.6,zz=z+(random()-.5)*.45,h=.7+random()*.5;
    beam([xx,.1,zz],[xx+.1,h,zz],.022,'#72865b',bank);
    cylinder(.065,.065,.28,'#8b7050',xx+.1,h,zz,bank,8);
  }
  // Koi circle beneath the translucent surface, then leap along an arc.
  for(let i=0;i<6;i++){
    const root=group(pond.x,pond.z);root.userData.role='pond-fish';dynamicRoots.push(root);
    const coat=['#e4a366','#e4cc8d','#d6dfce'][i%3];sphere(.22,coat,0,0,0,root,.58,.36,1.55);
    sphere(.13,i%2?'#e1a369':'#f0e3c1',0,.018,.02,root,.75,.32,1.1);
    for(const side of [-1,1]){
      sphere(.027,'#344f45',side*.09,.03,.21,root,.5,.8,.7);
      const fin=add(new THREE.ConeGeometry(.1,.18,3),'#dba569',side*.15,-.035,-.015,root);fin.rotation.z=side*Math.PI/2;fin.rotation.x=.3;
    }
    const tail=new THREE.Group();tail.position.z=-.31;root.add(tail);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-.13,.02,-.21,0,0,-.16,0,0,0,0,0,-.16,.13,.02,-.21],3));geo.computeVertexNormals();
    const fin=add(geo,'#dba569',0,0,0,tail);fin.material=fin.material.clone();fin.material.side=THREE.DoubleSide;
    const ripple=add(new THREE.TorusGeometry(.3,.012,4,40),'#d8e6d7',pond.x,pond.surface+.012,pond.z);ripple.rotation.x=-Math.PI/2;ripple.material=new THREE.MeshBasicMaterial({color:'#d8e6d7',transparent:true,opacity:0,depthWrite:false});ripple.visible=false;dynamicRoots.push(ripple);
    const droplets=[];for(let j=0;j<7;j++){const drop=sphere(.037,'#b6d3c8',pond.x,pond.surface,pond.z);drop.visible=false;drop.castShadow=false;dynamicRoots.push(drop);droplets.push(drop);}
    fish.push({root,tail,ripple,droplets,phase:random()*6.28,speed:.24+random()*.13,radius:1+random()*1.1,nextJump:1+i*1.15,jumpStart:-10,splashStart:-10,landing:new THREE.Vector3(),jumping:false});
  }
  // Danish sits on a low timber seat facing the water, legs dangling.
  const child=group(12.7,21.25);child.rotation.y=Math.atan2(pond.x-12.7,pond.z-21.25);child.userData.role='pond-child';dynamicRoots.push(child);
  const seat=group(12.7,21.25);seat.rotation.y=child.rotation.y;
  beam([-.65,.4,0],[.65,.4,0],.14,'#a48b64',seat);for(const x of [-.45,.45])beam([x,.02,0],[x,.35,0],.09,'#806e50',seat);
  const shirt='#96b6ad',skin='#c69974';
  const torso=new THREE.Group();torso.position.y=.89;child.add(torso);
  cylinder(.20,.24,.4,shirt,0,0,0,torso,12);sphere(.21,shirt,0,.13,0,torso,1,.58,.77);
  sphere(.22,'#7b8e7b',0,.59,.04,child,1,.4,.72);
  const head=new THREE.Group();head.position.set(0,1.33,.03);child.add(head);sphere(.205,skin,0,0,0,head,.95,1.05,.94);
  sphere(.21,'#4a5140',0,.092,-.032,head,1,.65,.92);
  for(const side of [-1,1]){sphere(.026,'#3d4837',side*.075,.008,.185,head,.65,.85,.6);sphere(.04,skin,side*.195,-.01,0,head,.5,.9,.7);}
  sphere(.034,'#ac7e5e',0,-.046,.202,head,.6,.7,.5);
  const feet=[];
  for(const side of [-1,1]){
    beam([side*.14,.60,.04],[side*.14,.56,.30],.077,'#7b8e7b',child);
    const shin=new THREE.Group();shin.position.set(side*.14,.55,.30);child.add(shin);beam([0,0,0],[0,-.28,.035],.053,skin,shin);sphere(.068,'#bca982',0,-.29,.09,shin,.8,.55,1.5);feet.push(shin);
    beam([side*.21,1.02,.04],[side*.25,.77,.13],.057,shirt,child);beam([side*.25,.77,.13],[side*.15,.65,.28],.045,skin,child);sphere(.05,skin,side*.15,.65,.28,child);
  }
  // A single dynamic mesh holds tapered blades. Bases stay anchored while the
  // upper segments bend away from cats; spring smoothing restores each blade.
  const grass={x:8.1,z:22.3,rx:2.05,rz:1.75};const grassRoot=group(grass.x,grass.z);grassRoot.userData.role='reactive-grass';dynamicRoots.push(grassRoot);
  sphere(2,'#81975b',grass.x,-.015,grass.z,scene,1.1,.025,.95);
  const positions=[],colors=[],indices=[],segments=5;
  for(let i=0;i<260;i++){
    const a=random()*Math.PI*2,r=Math.sqrt(random()),x=Math.cos(a)*r*grass.rx,z=Math.sin(a)*r*grass.rz,h=.55+random()*.62,width=.032+random()*.038,angle=random()*6.28;
    const blade={x,z,h,width,angle,phase:random()*6.28,bendX:0,bendZ:0,offset:positions.length/3};blades.push(blade);
    for(let j=0;j<=segments;j++){
      const t=j/segments,w=width*(1-t);positions.push(x-Math.cos(angle)*w,h*t,z-Math.sin(angle)*w,x+Math.cos(angle)*w,h*t,z+Math.sin(angle)*w);
      const color=new THREE.Color().lerpColors(new THREE.Color('#54754a'),new THREE.Color('#b1bf7b'),t);colors.push(color.r,color.g,color.b,color.r,color.g,color.b);
      if(j<segments){const n=blade.offset+j*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();geometry.boundingSphere.radius+=1.2;
  const grassMesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:1}));grassMesh.castShadow=true;grassMesh.receiveShadow=true;grassRoot.add(grassMesh);
  function update(time,dt,cats=[]){
    head.rotation.y=Math.sin(time*.45)*.1;head.rotation.x=-.08+Math.sin(time*.7)*.025;torso.rotation.z=Math.sin(time*1.3)*.01;
    feet.forEach((foot,i)=>foot.rotation.x=Math.sin(time*1.65+i*.8)*.14);
    fish.forEach((f,i)=>{
      if(time>=f.nextJump&&!f.jumping){f.jumpStart=time;f.jumping=true;f.nextJump=time+5+random()*5;}
      const angle=time*f.speed+f.phase,x=pond.x+Math.cos(angle)*f.radius,z=pond.z+Math.sin(angle)*f.radius*.7;
      let y=.05,pitch=0;
      if(f.jumping){const t=(time-f.jumpStart)/1.15;if(t>=1){f.jumping=false;f.splashStart=time;f.landing.set(x,pond.surface,z);f.ripple.position.copy(f.landing);f.ripple.position.y+=.015;}
        else{y=pond.surface+Math.sin(t*Math.PI)*1.35;pitch=-Math.atan2(Math.cos(t*Math.PI)*1.35*Math.PI/1.15,.85);}}
      f.root.position.set(x,y,z);f.root.rotation.set(pitch,-angle,0);f.tail.rotation.y=Math.sin(time*9+i)*.25;
      const splash=time-f.splashStart;f.ripple.visible=splash>=0&&splash<1.4;
      if(f.ripple.visible){f.ripple.scale.setScalar(1+splash*3.5);f.ripple.material.opacity=(1-splash/1.4)*.6;}
      f.droplets.forEach((drop,j)=>{drop.visible=splash>=0&&splash<.65;if(!drop.visible)return;const a=j/7*Math.PI*2;drop.position.set(f.landing.x+Math.cos(a)*splash*.8,pond.surface+Math.max(0,1.9*splash-3*splash*splash),f.landing.z+Math.sin(a)*splash*.8);});
    });
    const actors=[player,...cats.map(c=>c.root??c)];const attribute=geometry.attributes.position;
    for(const blade of blades){
      const x=grass.x+blade.x,z=grass.z+blade.z;
      let bx=Math.sin(time*1.45+blade.phase)*.055,bz=Math.cos(time*1.1+blade.phase)*.045;
      for(const actor of actors){const dx=x-actor.position.x,dz=z-actor.position.z,d=Math.hypot(dx,dz);if(d<1.1&&actor.position.y<1.25){const strength=(1-d/1.1)*.85,length=Math.max(.05,d);bx+=dx/length*strength;bz+=dz/length*strength;}}
      blade.bendX+=(bx-blade.bendX)*(1-Math.exp(-dt*8));blade.bendZ+=(bz-blade.bendZ)*(1-Math.exp(-dt*8));
      for(let j=0;j<=segments;j++){
        const t=j/segments,w=blade.width*(1-t),curve=t*t,bend=Math.hypot(blade.bendX,blade.bendZ),yy=blade.h*t*(1-Math.min(.42,bend*.4)*t);
        attribute.setXYZ(blade.offset+j*2,blade.x+blade.bendX*curve-Math.cos(blade.angle)*w,yy,blade.z+blade.bendZ*curve-Math.sin(blade.angle)*w);
        attribute.setXYZ(blade.offset+j*2+1,blade.x+blade.bendX*curve+Math.cos(blade.angle)*w,yy,blade.z+blade.bendZ*curve+Math.sin(blade.angle)*w);
      }
    }
    attribute.needsUpdate=true;
    geometry.computeVertexNormals();
  }
  function reactToMeow(){return Math.hypot(player.position.x-12.7,player.position.z-21.25)<5?'Danish: Look, Oyen! The fish are jumping!':null;}
  return {pond,grass,child,fish,blades,grassMesh,dynamicRoots,update,reactToMeow};
}
