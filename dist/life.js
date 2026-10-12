import * as THREE from './vendor/three.module.js';

// Village life is independent of the player: characters choose clear routes,
// stop to rest, and react to nearby meows. Decorative gardens join static batches.
export function createVillageLife(scene, helpers, player, colliders, houses) {
  const {box,sphere,foliage,cylinder,beam,add,material,group}=helpers;
  const villagers=[],cats=[],butterflies=[],dynamicRoots=[],gardens=[];
  let seed=167;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  function clear(x,z,margin=.45){
    if(x<-22||x>22||z<-37||z>35)return false;
    return !colliders.some(c=>{
      if(c.kind==='pond')return ((x-c.x)/(c.rx+margin))**2+((z-c.z)/(c.rz+margin))**2<1;
      if(!c.w)return Math.hypot(x-c.x,z-c.z)<c.r+margin;
      const dx=x-c.x,dz=z-c.z,lx=dx*Math.cos(c.rotation)-dz*Math.sin(c.rotation),lz=dx*Math.sin(c.rotation)+dz*Math.cos(c.rotation);
      return Math.abs(lx)<c.w/2+margin&&lz>-c.d/2-margin&&lz<c.d/2+2.6+margin;
    });
  }
  function clearRoute(ax,az,bx,bz){const distance=Math.hypot(bx-ax,bz-az);for(let i=0;i<=Math.ceil(distance/.35);i++){const t=i/Math.max(1,Math.ceil(distance/.35));if(!clear(ax+(bx-ax)*t,az+(bz-az)*t))return false;}return true;}
  function chooseTarget(actor){
    const {position}=actor.root;
    for(let i=0;i<28;i++){
      const a=random()*Math.PI*2,length=2+random()*(actor.kind==='cat'?7:5),x=position.x+Math.sin(a)*length,z=position.z+Math.cos(a)*length;
      if(actor.kind==='villager'&&(Math.abs(x)>3&&Math.abs(z-8)>1.6))continue;
      if(clearRoute(position.x,position.z,x,z)){actor.target.set(x,0,z);actor.speed=actor.kind==='cat'?2.3+random()*1.7:.65+random()*.35;actor.rest=0;return true;}
    }
    actor.rest=.7;actor.resting=true;actor.target.copy(position);return false;
  }
  // Neat beds of hibiscus pink, marigold gold, ivory daisies, and lavender.
  const gardenLayout=[[-5.1,10,'#d88a9d'],[5.2,12,'#e4bd62'],[-5.1,-3,'#e8cf9b'],[5.3,-16,'#bb9ac8'],[-5.3,26,'#d88a9d'],[17.8,17,'#e4bd62'],[-18.7,10,'#bb9ac8'],[17.5,-10,'#d88a9d'],[-16,-4,'#e4bd62'],[6.2,26,'#d88a9d'],[-7.1,15.5,'#e7d9ad'],[8.2,16.8,'#bb9ac8']];
  for(const [x,z,color]of gardenLayout){
    const bed=group(x,z);gardens.push({x,z});
    sphere(1.08,'#9c8863',0,.035,0,bed,1,.08,.72);
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2;foliage(.15,'#c0b08b',Math.cos(a)*1.1,.09,Math.sin(a)*.8,bed,1,.65,.8);}
    for(let i=0;i<14;i++){
      const a=random()*6.28,r=Math.sqrt(random())*.85,xx=Math.cos(a)*r,zz=Math.sin(a)*r*.75,h=.38+random()*.3;
      cylinder(.013,.018,h,'#648455',xx,h/2+.08,zz,bed,6);
      for(const side of [-1,1]){const leaf=sphere(.12,'#6f925c',xx+side*.07,h*.45,zz,bed,1,.25,.55);leaf.rotation.z=side*.5;}
      const petals=i%3===0?6:5;
      for(let j=0;j<petals;j++){const angle=j/petals*6.28;const petal=add(new THREE.SphereGeometry(.112,10,6),color,xx+Math.cos(angle)*.105,h+.08,zz+Math.sin(angle)*.105,bed);petal.scale.set(1,.45,.65);petal.rotation.y=-angle;}
      sphere(.065,i%3===0?'#e2b656':'#f2d999',xx,h+.105,zz,bed,1,.65,1);
    }
  }
  // Additional pots and climbing blooms beside the village porches.
  for(const house of houses.slice(0,4))for(const side of [-1,1]){
    const x=house.x+side*(house.w/2+1),z=house.z+2.2;
    cylinder(.28,.18,.42,'#b98468',x,.21,z);cylinder(.32,.32,.08,'#c79777',x,.43,z);
    foliage(.4,'#60865e',x,.66,z,scene,1,.9,1);
    for(let j=0;j<5;j++){const a=j*1.26;sphere(.12,side===1?'#dba1a9':'#eed39c',x+Math.cos(a)*.23,.89,z+Math.sin(a)*.23,scene,1,.55,1);}
  }
  // Warm fabric bunting over the market lane.
  beam([-7,0,20],[-7,3.5,20],.045,'#9b8561');beam([3,0,20],[3,3.5,20],.045,'#9b8561');
  const stringPoints=[];for(let i=0;i<17;i++)stringPoints.push(new THREE.Vector3(-7+i*.625,3.5-Math.sin(i/16*Math.PI)*.45,20));
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(stringPoints),24,.012,5,false),'#cab994');
  for(let i=0;i<13;i++){const x=-6.6+i*.74,y=3.5-Math.sin((x+7)/10*Math.PI)*.45;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([x-.2,y,20,x+.2,y,20,x,y-.36,20],3));geo.computeVertexNormals();const m=add(geo,['#bd8a79','#d8bd84','#91afa0'][i%3]);m.material=m.material.clone();m.material.side=THREE.DoubleSide;}

  function label(text){
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const ctx=canvas.getContext('2d');
    ctx.fillStyle='rgba(45,70,57,.88)';ctx.beginPath();ctx.roundRect(3,6,250,50,18);ctx.fill();ctx.fillStyle='#fff4d9';ctx.font='500 25px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,128,32);
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false}));sprite.scale.set(1.75,.44,1);sprite.position.y=2.45;sprite.visible=false;return sprite;
  }
  function villager(name,x,z,outfit,style,stationary=false){
    const root=group(x,z),skin='#bd8966',limbs=[],arms=[];
    root.userData.role='villager';root.userData.name=name;dynamicRoots.push(root);
    const torso=new THREE.Group();torso.position.y=1.18;root.add(torso);
    sphere(.3,outfit,0,0,0,torso,1,.95,.64);
    cylinder(.27,.3,.42,outfit,0,-.14,0,torso,12);
    if(style==='kurung'){cylinder(.27,.38,.73,outfit,0,.53,0,root,16);for(let i=0;i<5;i++){const a=i*1.26;sphere(.038,'#e1c99c',Math.sin(a)*.29,.6,Math.cos(a)*.29,root);}}
    const head=new THREE.Group();head.position.set(0,1.68,0);root.add(head);sphere(.235,skin,0,0,0,head,.92,1.08,.9);
    for(const side of [-1,1]){sphere(.025,'#3e4034',side*.079,.015,.205,head,.75,1,.5);sphere(.045,skin,side*.22,-.01,0,head,.6,1,.7);}
    sphere(.04,'#a37457',0,-.06,.221,head,.7,.85,.7);
    if(style==='kurung'){
      sphere(.26,outfit,0,.04,-.052,head,1.05,1.03,.95);
      // The face stays uncovered; the scarf drapes over the neck and shoulders.
      sphere(.208,skin,0,-.018,.10,head,.9,.98,.7);
      for(const side of [-1,1])sphere(.025,'#3e4034',side*.073,.012,.246,head,.7,1,.5);
      cylinder(.2,.35,.3,outfit,0,1.4,-.035,root,12);
    }else{
      sphere(.237,'#494c3d',0,.088,-.045,head,1,.75,.9);
      if(style==='songkok')cylinder(.23,.235,.19,'#33443d',0,.24,-.02,head,12);
      if(style==='hat'){cylinder(.32,.36,.055,'#d3b887',0,.24,0,head,16);cylinder(.18,.25,.19,'#c4a773',0,.34,0,head,12);}
    }
    for(const side of [-1,1]){
      const arm=new THREE.Group();arm.position.set(side*.29,1.32,0);root.add(arm);
      sphere(.105,outfit,0,-.12,0,arm,.9,1.65,.95);sphere(.065,skin,0,-.35,.025,arm);arms.push(arm);
      const leg=new THREE.Group();leg.position.set(side*.13,.69,0);root.add(leg);
      cylinder(.075,.078,.51,style==='kurung'?outfit:'#5c6a60',0,-.24,0,leg,10);
      sphere(.10,'#575b48',0,-.58,.065,leg,.9,.45,1.55);limbs.push(leg);
    }
    const nameTag=label(name);root.add(nameTag);
    const actor={root,torso,head,arms,legs:limbs,nameTag,name,kind:'villager',stationary,target:new THREE.Vector3(x,0,z),rest:1+random()*3,speed:.8,phase:random()*6.28,wave:0};villagers.push(actor);return actor;
  }
  const seller=villager('Pak Rahman',-5,19.9,'#9fae90','songkok',true);seller.root.rotation.y=Math.PI;
  const gardener=villager('Mak Siti',-6.6,10.5,'#aa8299','kurung',true);gardener.root.rotation.y=1.6;
  villager('Aina',1.1,10.8,'#82a9a0','kurung');
  villager('Amir',-1.5,-3,'#bd9773','songkok');
  const neighbor=villager('Pak Hassan',5.1,5.8,'#91aab0','hat',true);neighbor.root.rotation.y=-.7;

  // Clone Oyen's fitted model so the village cats share the same polished style.
  for(const [name,x,z,coat,mark,scale]of [['Tompok',2.1,13,'#e3dfcb','#7d8275',.84],['Arang',-3.2,7,'#515c56','#3d4743',.92],['Putih',5,18,'#e5e2d4','#c9bda5',.78],['Belang',-2,-10,'#a7a396','#747f77',.88],['Manja',4.8,-6,'#c39777','#936d53',.72]]){
    const root=player.clone(true);root.position.set(x,0,z);root.scale.setScalar(scale);root.userData.role='roaming-cat';root.userData.name=name;scene.add(root);dynamicRoots.push(root);
    const recolored=new Map();root.traverse(object=>{if(!object.isMesh)return;const hex=object.material.color.getHexString();if(!recolored.has(object.material)){const mat=object.material.clone();if(hex==='d99147')mat.color.set(coat);if(hex==='ae6735')mat.color.set(mark);if(hex==='f5d9ab')mat.color.set('#eee5cf');recolored.set(object.material,mat);}object.material=recolored.get(object.material);});
    const actor={root,name,kind:'cat',legs:[...root.children.filter(c=>c.name==='cat-leg')],head:root.getObjectByName('cat-head'),tail:root.getObjectByName('cat-tail'),body:root.getObjectByName('cat-body'),target:new THREE.Vector3(x,0,z),rest:random()*1.5,speed:3,phase:random()*6.28,attention:0};cats.push(actor);
  }
  // Four hinged wings flap while each butterfly circles a flower garden.
  for(let i=0;i<18;i++){
    const garden=gardens[i%gardens.length],root=group(garden.x,garden.z),wings=[];dynamicRoots.push(root);root.userData.role='butterfly';
    const color=['#e4bf6a','#b59acb','#d9909b','#a9d0c6'][i%4];
    sphere(.075,'#52634f',0,0,0,root,.4,1,1.5);
    for(const side of [-1,1]){
      const hinge=new THREE.Group();root.add(hinge);wings.push({hinge,side});
      const front=sphere(.15,color,side*.135,.025,.07,hinge,1,.13,1.1);front.castShadow=false;
      const rear=sphere(.115,color,side*.11,0,-.10,hinge,1,.15,.85);rear.castShadow=false;
      sphere(.03,'#f4dfaf',side*.17,.025,.10,hinge,1,.2,1).castShadow=false;
    }
    butterflies.push({root,wings,garden,phase:random()*6.28,radius:.6+random()*1.1,speed:.65+random()*.45});
  }
  let currentTime=0;
  function reactToMeow(){
    const nearby=villagers.filter(v=>v.root.position.distanceTo(player.position)<6).sort((a,b)=>a.root.position.distanceTo(player.position)-b.root.position.distanceTo(player.position));
    nearby.forEach(v=>v.wave=currentTime+3);
    cats.filter(c=>c.root.position.distanceTo(player.position)<7).forEach(c=>c.attention=currentTime+2);
    if(!nearby.length)return null;
    const replies={'Pak Rahman':'Pak Rahman: Oyen! Hungry again?','Mak Siti':'Mak Siti: Hello, sayang. Mind the flowers!','Aina':'Aina: Comelnya! Hello, little cat.','Amir':'Amir: Oyen, want to explore together?','Pak Hassan':'Pak Hassan: Selamat petang, Oyen!'};
    return replies[nearby[0].name];
  }
  function updateActor(actor,time,dt){
    let moving=false;
    if(!actor.stationary){
      if(actor.resting){
        actor.rest-=dt;
        if(actor.rest<=0){actor.resting=false;chooseTarget(actor);}
      }else if(actor.root.position.distanceTo(actor.target)<.18){
        actor.resting=true;actor.rest=1.3+random()*3.2;
      }
      if(!actor.resting&&actor.root.position.distanceTo(actor.target)>.18){
        const dx=actor.target.x-actor.root.position.x,dz=actor.target.z-actor.root.position.z,len=Math.hypot(dx,dz),step=Math.min(len,actor.speed*dt),x=actor.root.position.x+dx/len*step,z=actor.root.position.z+dz/len*step;
        if(clear(x,z)){actor.root.position.x=x;actor.root.position.z=z;moving=true;}
        else{actor.target.copy(actor.root.position);actor.resting=true;actor.rest=.5;}
        const angle=Math.atan2(dx,dz);actor.root.rotation.y+=Math.atan2(Math.sin(angle-actor.root.rotation.y),Math.cos(angle-actor.root.rotation.y))*Math.min(9*dt,1);
      }
    }
    const phase=time*(actor.kind==='cat'?14:4)+actor.phase;
    actor.legs.forEach((leg,i)=>leg.rotation.x=moving?Math.sin(phase+(actor.kind==='cat'?(i===0||i===3?0:Math.PI):i*Math.PI))*(actor.kind==='cat'?.5:.36):0);
    if(actor.kind==='cat'){
      actor.tail.rotation.z=Math.sin(time*3+actor.phase)*.22;
      actor.body.position.y=.64+(moving?Math.sin(time*28)*.02:Math.sin(time*2)*.008);
      actor.head.rotation.y=time<actor.attention?Math.sin(time*5)*.2:Math.sin(time*.9+actor.phase)*.04;
    }else{
      actor.arms.forEach((arm,i)=>{arm.rotation.x=moving?-Math.sin(phase+i*Math.PI)*.28:Math.sin(time*1.5+actor.phase)*.035;arm.rotation.z=time<actor.wave&&i===1?-2.25+Math.sin(time*8)*.2:0;});
      actor.torso.rotation.z=Math.sin(time*1.3+actor.phase)*.012;
      actor.nameTag.visible=actor.root.position.distanceTo(player.position)<5;
      if(time<actor.wave){const dx=player.position.x-actor.root.position.x,dz=player.position.z-actor.root.position.z;actor.root.rotation.y=Math.atan2(dx,dz);}
    }
  }
  function update(time,dt){
    currentTime=time;[...cats,...villagers].forEach(a=>updateActor(a,time,dt));
    butterflies.forEach(b=>{
      const a=time*b.speed+b.phase;
      b.root.position.set(b.garden.x+Math.cos(a)*b.radius,.95+Math.sin(a*1.8+b.phase)*.35,b.garden.z+Math.sin(a)*b.radius*.7);
      b.root.rotation.y=-a;b.root.rotation.z=Math.sin(a*2)*.16;
      b.wings.forEach(w=>w.hinge.rotation.z=w.side*(.4+Math.sin(time*18+b.phase)*.75));
    });
  }
  // Start with visible activity, then alternate running/walking with short rests.
  [...cats,...villagers.filter(v=>!v.stationary)].forEach(a=>{a.resting=false;chooseTarget(a);});
  return {dynamicRoots,update,reactToMeow,villagers,cats,butterflies};
}
