import * as THREE from './vendor/three.module.js';
import {createVillageLife} from './life.js';

export function createWorld(scene) {
  const colors={grass:'#859b61',sand:'#d6bd91',trim:'#e5d4ac',roof:'#935e4d',leaf:'#44735b',orange:'#d99147',stripe:'#ae6735',cream:'#f5d9ab'};
  const materials=new Map();
  function material(color,flat=false){const key=`${color}:${flat}`;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.88,flatShading:flat}));return materials.get(key);}
  function add(geometry,color,x=0,y=0,z=0,parent=scene,flat=false){const m=new THREE.Mesh(geometry,material(color,flat));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(w,h,d,c,x,y,z,p){return add(new THREE.BoxGeometry(w,h,d),c,x,y,z,p);}
  function sphere(r,c,x,y,z,p,sx=1,sy=1,sz=1){const m=add(new THREE.SphereGeometry(r,24,16),c,x,y,z,p);m.scale.set(sx,sy,sz);return m;}
  function foliage(r,c,x,y,z,p,sx=1,sy=1,sz=1){const m=add(new THREE.IcosahedronGeometry(r,1),c,x,y,z,p,true);m.scale.set(sx,sy,sz);return m;}
  function cylinder(rt,rb,h,c,x,y,z,p,n=12){return add(new THREE.CylinderGeometry(rt,rb,h,n),c,x,y,z,p);}
  function beam(a,b,r,c,p=scene){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);const m=cylinder(r,r,v.length(),c,...start.add(end).multiplyScalar(.5).toArray(),p);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
  function tube(points,r,c,p,segments=24){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),segments,r,8,false),c,0,0,0,p);}
  function group(x,z,rotation=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;scene.add(g);return g;}
  let seed=41;function random(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
  const colliders=[],houses=[],laundry=[],palms=[],water=[];
  box(130,.5,130,colors.grass,0,-.29,0);
  // Rounded paths are single continuous surfaces, avoiding overlapping faces.
  function path(w,length,x,z,rotation=0){const s=new THREE.Shape(),r=.65,hw=w/2,hl=length/2;s.moveTo(-hw+r,-hl);s.lineTo(hw-r,-hl);s.quadraticCurveTo(hw,-hl,hw,-hl+r);s.lineTo(hw,hl-r);s.quadraticCurveTo(hw,hl,hw-r,hl);s.lineTo(-hw+r,hl);s.quadraticCurveTo(-hw,hl,-hw,hl-r);s.lineTo(-hw,-hl+r);s.quadraticCurveTo(-hw,-hl,-hw+r,-hl);const m=add(new THREE.ShapeGeometry(s,8),colors.sand,x,.006,z);m.rotation.x=-Math.PI/2;m.rotation.z=rotation;m.castShadow=false;m.material=material(colors.sand);}
  path(7.4,79,0,-1);path(4.8,52,0,8,Math.PI/2);
  for(const [x,z]of [[-6,-1],[6,-7],[-8,17],[8,17],[-6,-21],[7,-26],[-10,32]])path(2.2,6,x,z,Math.PI/2);
  box(7,.06,100,'#699a93',28,-.035,0).castShadow=false;
  for(const x of [24.2,31.8])for(let i=0;i<20;i++)foliage(.85,'#7c985d',x,-.05,-45+i*4.6,scene,.9,.45,2.9);
  for(let i=0;i<26;i++){const m=add(new THREE.PlaneGeometry(1.4+random()*1.8,.035),'#a6c5b7',25+random()*5,.008,-43+random()*86);m.rotation.x=-Math.PI/2;m.castShadow=false;water.push(m);}

  function windowAt(parent,x,y,z,rotation=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotation;parent.add(g);box(1.18,1.22,.13,colors.trim,0,0,0,g);box(.95,1,.15,'#47736d',0,0,.04,g);box(.07,1,.06,colors.trim,0,0,.14,g);box(.96,.065,.06,colors.trim,0,0,.14,g);box(1.35,.11,.26,'#c8af81',0,-.66,.04,g);for(const side of [-1,1]){box(.31,1.2,.08,'#7a6950',side*.82,0,.03,g);for(let i=0;i<5;i++)box(.25,.035,.025,'#a18d6c',side*.82,-.43+i*.21,.08,g);}}
  function house(x,z,color,rotation=0,w=6,d=5){const g=group(x,z,rotation);houses.push({x,z,w,d});colliders.push({x,z,w,d,rotation,r:Math.max(w,d)*.58});
    for(const xx of [-w/2+.28,w/2-.28])for(const zz of [-d/2+.28,d/2-.28]){box(.24,1.48,.24,'#76634b',xx,.72,zz,g);cylinder(.22,.28,.16,'#a39b81',xx,.08,zz,g);}
    box(w,.22,d,'#927351',0,1.38,0,g);
    // Fitted boards make tidy seams without floating strips across the walls.
    for(let i=0;i<13;i++)box(w,.196,d,color,0,1.6+i*.202,0,g);
    for(const xx of [-w/2,w/2])for(const zz of [-d/2,d/2])box(.12,2.65,.12,colors.trim,xx,2.77,zz,g);
    box(.98,1.95,.12,'#665644',0,2.48,d/2+.065,g);for(const xx of [-.54,.54])box(.09,2.05,.15,colors.trim,xx,2.51,d/2+.09,g);box(1.17,.11,.16,colors.trim,0,3.58,d/2+.09,g);sphere(.028,'#dabd74',.31,2.38,d/2+.14,g);
    windowAt(g,-w*.32,2.88,d/2+.08);windowAt(g,w*.32,2.88,d/2+.08);windowAt(g,w/2+.06,2.88,0,Math.PI/2);windowAt(g,-w/2-.06,2.88,0,-Math.PI/2);
    const e=w/2+.55,f=d/2+.6,eave=4.08,peak=5.72,slope=Math.atan2(peak-eave,e);
    for(const zz of [-d/2,d/2]){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-w/2,eave,zz,w/2,eave,zz,0,peak-.17,zz],3));geo.computeVertexNormals();const m=add(geo,color,0,0,0,g);m.material=m.material.clone();m.material.side=THREE.DoubleSide;for(let i=0;i<3;i++)box(.065,.4,.08,'#6b765d',(i-1)*.18,4.49,zz+Math.sign(zz)*.02,g);}
    for(const side of [-1,1]){const m=box(Math.hypot(e,peak-eave),.16,f*2,colors.roof,side*e/2,(peak+eave)/2,0,g);m.rotation.z=-side*slope;for(let i=0;i<11;i++){const zz=-f+.13+i*(2*f-.26)/10;beam([side*e,eave+.10,zz],[0,peak+.10,zz],.026,'#ab735b',g);}beam([side*e,eave,-f],[0,peak,-f],.065,colors.trim,g);beam([side*e,eave,f],[0,peak,f],.065,colors.trim,g);box(.12,.18,2*f,'#7c5143',side*e,eave,0,g);}
    beam([0,peak+.1,-f-.06],[0,peak+.1,f+.06],.08,'#865546',g);
    box(w,.16,1.35,'#b09165',0,1.38,d/2+.66,g);for(let i=0;i<Math.floor(w/.3);i++)box(.018,.012,1.3,'#8e754f',-w/2+.15+i*.3,1.47,d/2+.66,g);
    for(const side of [-1,1]){const xx=side*(w/2-.18);box(.12,2.6,.12,colors.trim,xx,2.65,d/2+1.2,g);box(w/2-.85,.1,.1,colors.trim,side*(w/4+.38),2.16,d/2+1.2,g);for(let i=0;i<5;i++)box(.065,.66,.065,'#d6c297',side*(.87+i*(w/2-1.1)/4),1.82,d/2+1.2,g);box(.09,.1,1.2,colors.trim,xx,2.16,d/2+.6,g);}
    for(let i=0;i<5;i++){const h=(i+1)*.272;box(1.4,h,.38,'#ae956c',0,h/2,d/2+2.83-i*.35,g);box(1.46,.04,.4,'#cfb78c',0,h+.015,d/2+2.83-i*.35,g);}return g;
  }
  house(-10,-5,'#b0bba1',.14);house(10,-11,'#d7be93',-.17);house(-13,13,'#bb9978',.05,7,5);house(12,13,'#85aaa1',-.12);house(-9,-25,'#d2c3a0',.08);house(11,-30,'#bbad8e',-.15,7,6);house(-15,29,'#a3b49b',-.12);

  function palm(x,z,h=8){const g=group(x,z),lean=.48;tube([[0,0,0],[.12,h*.35,0],[.27,h*.7,.03],[lean,h,0]],.16,'#93846a',g,20);
    for(let i=1;i<13;i++){const t=i/13,m=add(new THREE.TorusGeometry(.163,.012,4,12),'#b2a082',lean*t*t,h*t,0,g);m.rotation.x=Math.PI/2;}
    const crown=new THREE.Group();crown.position.set(lean,h,0);g.add(crown);palms.push(crown);
    // Continuous tapered fronds, with pointed leaflets instead of square blocks.
    for(let k=0;k<8;k++){const frond=new THREE.Group();frond.rotation.y=k*Math.PI/4+.15;crown.add(frond);const length=3.5+(k%3)*.25,points=[];for(let j=0;j<=12;j++){const t=j/12;points.push([t*length,Math.sin(t*Math.PI)*.6-t*t*1.35,0]);}tube(points,.035,'#6d8858',frond,14);
      const vertices=[],indices=[];for(let j=0;j<=12;j++){const t=j/12,width=Math.sin(t*Math.PI)*.38;vertices.push(points[j][0],points[j][1],-width,points[j][0],points[j][1]+.05,0,points[j][0],points[j][1],width);if(j<12){const n=j*3;indices.push(n,n+3,n+1,n+1,n+3,n+4,n+1,n+4,n+2,n+2,n+4,n+5);}}
      for(let j=2;j<11;j++)for(const side of [-1,1]){const t=j/12,p=points[j],width=Math.sin(t*Math.PI)*.64,n=vertices.length/3;vertices.push(p[0]-.11,p[1],0,p[0]+.19,p[1]-.04,0,p[0]+.42,p[1]-.16,side*width);indices.push(n,n+1,n+2);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const leaf=add(geo,k%2?colors.leaf:'#618762',0,0,0,frond);leaf.material=leaf.material.clone();leaf.material.side=THREE.DoubleSide;
    }
    for(let i=0;i<4;i++)sphere(.22,'#797553',Math.cos(i*1.6)*.27,-.2,Math.sin(i*1.6)*.27,crown,.9,1.1,.9);colliders.push({x,z,r:.4});
  }
  for(const p of [[-6,4,7.5],[7,2,8.5],[-19,-10,9],[18,-17,8],[-20,19,8.8],[20,21,9.2],[18,-34,8.6],[-15,-33,8],[-23,0,9],[22,1,8],[-3,32,8.5],[6,32,7.8]])palm(...p);
  function fence(x,z,n){for(let i=0;i<n;i++){const xx=x+i*.65;box(.11,.95,.11,'#d0bc95',xx,.47,z);cylinder(0,.085,.12,'#d0bc95',xx,1,z,scene,4).rotation.y=Math.PI/4;}for(const y of [.3,.72])box((n-1)*.65,.08,.09,'#bda67c',x+(n-1)*.325,y,z);}
  fence(-20,18,11);fence(8,19,11);fence(-15,-11,8);
  for(const [x,z]of [[-16,-6],[-14,-9],[-6,-8],[15,-12],[16,-9],[-18,14],[-9,12],[17,14],[16,10],[-13,-28],[15,-34],[-20,30],[20,28],[-20,3],[20,-3]]){const size=.6+random()*.3;foliage(size,colors.leaf,x,.35,z,scene,1.1,.75,1);foliage(size*.75,'#618762',x+.3,.4,z-.2,scene,1,.8,1);}
  // Instanced edge planting keeps the scene light and the paths clear.
  const grass=new THREE.InstancedMesh(new THREE.ConeGeometry(.07,.3,3),material('#687e50',true),400),matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion();let blades=0;
  for(let i=0;i<220;i++){const x=(random()-.5)*46,z=(random()-.5)*76;if(Math.abs(x)<4.15||Math.abs(z-8)<2.8||houses.some(h=>Math.hypot(x-h.x,z-h.z)<5))continue;for(let j=0;j<3&&blades<400;j++){quaternion.setFromEuler(new THREE.Euler((random()-.5)*.3,random()*6.28,(random()-.5)*.3));matrix.compose(new THREE.Vector3(x+(random()-.5)*.4,.1,z+(random()-.5)*.4),quaternion,new THREE.Vector3(1,.7+random()*.7,1));grass.setMatrixAt(blades++,matrix);}}
  grass.count=blades;grass.receiveShadow=true;scene.add(grass);
  function pot(x,z){cylinder(.32,.23,.52,'#b17c62',x,.26,z);cylinder(.36,.36,.07,'#c09276',x,.53,z);cylinder(.28,.28,.015,'#615947',x,.56,z);for(let i=0;i<5;i++){const a=i*1.26,m=sphere(.38,'#56815c',x+Math.cos(a)*.13,.81,z+Math.sin(a)*.13,scene,.3,1,.7);m.rotation.z=Math.cos(a)*.4;}}
  for(const p of [[-7,-1],[13,17],[-17,17],[7,-6]])pot(...p);
  for(let i=0;i<3;i++)box(2,.09,.16,'#a78964',5,.72,6.8+i*.19);for(const x of [4.2,5.8]){box(.1,.72,.1,'#6c6b54',x,.36,7);box(.1,.7,.1,'#6c6b54',x,.99,7.28);}for(let i=0;i<2;i++)box(2,.18,.09,'#a78964',5,1.06+i*.23,7.28);
  const stall=group(-5,21);for(let i=0;i<9;i++)box(.32,.88,1.2,'#ad8f65',-1.35+i*.34,.47,0,stall);box(3.15,.13,1.3,'#dac197',0,.97,0,stall);for(const x of [-1.5,1.5])box(.1,2.8,.1,'#826c50',x,1.4,0,stall);for(let i=0;i<6;i++){const m=box(.61,.06,2.2,i%2?'#dbc7a0':'#728e76',-1.53+i*.61,2.73,0,stall);m.rotation.x=.13;}box(3.7,.16,.04,'#6f846e',0,2.5,1.1,stall);
  for(let i=0;i<3;i++){box(.68,.07,.55,'#876e4e',-.95+i*.95,1.08,0,stall);for(let j=0;j<4;j++)sphere(.12,'#d6b768',-1.14+i*.95+(j%2)*.26,1.22,Math.floor(j/2)*.24-.1,stall);}pot(-7,21);
  beam([-17,0,23],[-17,2.8,23],.055,'#7b735b');beam([-8,0,23],[-8,2.8,23],.055,'#7b735b');tube([[-17,2.75,23],[-12.5,2.55,23],[-8,2.75,23]],.012,'#d7c9a8',scene);
  for(let i=0;i<4;i++){const g=new THREE.Group();g.position.set(-15.5+i*1.8,2.62,23);scene.add(g);box(.8,.95,.025,['#e6c28f','#a4bdb0','#bd8c76','#d5d1ba'][i],0,-.45,0,g);for(const x of [-.28,.28])box(.035,.085,.045,'#a68b62',x,.01,0,g);laundry.push(g);}
  // Rounded tropical canopies replace the pointed background cones.
  for(let i=0;i<34;i++){const a=i/34*Math.PI*2,x=Math.cos(a)*(47+random()*8),z=Math.sin(a)*(47+random()*8),h=4+random()*6;cylinder(.14,.27,h*.65,'#6d7355',x,h*.3,z);for(let j=0;j<3;j++)foliage(3+random(),'#69846a',x+(j-1)*1.4,h*.7+random(),z+(random()-.5)*2,scene,1,1.0,1);}
  for(let i=0;i<9;i++)sphere(12,'#91ad93',-70+i*18,2,-67,scene,1.3,.5+random()*.3,1);
  for(const [x,y,z]of [[-25,25,-45],[20,27,-60],[50,29,-35]]){const g=group(x,z);g.position.y=y;for(let i=0;i<4;i++){const m=sphere(2.1,'#e0e7dc',(i-1.5)*2.4,Math.sin(i)*.5,0,g,1.4,.55,.8);m.castShadow=false;m.receiveShadow=false;}}

  // Smooth cat silhouette, with markings fitted onto the fur surface.
  const cat=group(0,17);cat.rotation.y=Math.PI;
  const body=sphere(.5,colors.orange,0,.64,-.04,cat,.72,.83,1.24);sphere(.27,colors.cream,0,.7,.39,cat,.75,1.02,.66);
  const head=new THREE.Group();head.position.set(0,1.04,.5);cat.add(head);sphere(.345,colors.orange,0,0,0,head,1.08,.91,.94);
  function ear(side){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-.13,0,-.07,.13,0,-.07,0,.27,0,-.13,0,.08,.13,0,.08],3));geo.setIndex([0,2,1,3,4,2,0,3,2,1,2,4,0,1,4,0,4,3]);geo.computeVertexNormals();const m=add(geo,colors.orange,side*.235,.2,-.04,head);m.rotation.z=-side*.18;const inner=new THREE.BufferGeometry();inner.setAttribute('position',new THREE.Float32BufferAttribute([-.075,.035,.086,.075,.035,.086,0,.21,.038],3));inner.computeVertexNormals();const pink=add(inner,'#d99e8c',side*.235,.2,-.04,head);pink.rotation.z=-side*.18;}
  for(const side of [-1,1]){ear(side);sphere(.079,'#eef0ce',side*.145,.035,.285,head,.8,1,.4);sphere(.057,'#689786',side*.145,.035,.311,head,.75,1,.3);sphere(.041,'#293f39',side*.145,.035,.327,head,.32,1,.18);sphere(.017,'#ffffff',side*.133,.057,.336,head,1,1,.35);sphere(.095,colors.cream,side*.075,-.105,.3,head,1,.75,.6);for(let j=0;j<3;j++)tube([[side*.1,-.105,.343],[side*.23,-.08-j*.035,.35],[side*.4,-.06-j*.05,.31]],.0045,'#f3e4c8',head,8);tube([[side*.11,.17,.277],[side*.14,.1,.3]],.022,colors.stripe,head,6);}
  sphere(.038,'#996d63',0,-.065,.361,head,1,.68,.55);tube([[0,-.08,.36],[0,-.14,.354],[-.04,-.16,.34]],.006,'#765848',head,6);tube([[0,-.14,.354],[.04,-.16,.34]],.006,'#765848',head,6);
  const legs=[];for(const x of [-.23,.23])for(const z of [-.39,.35]){const g=new THREE.Group();g.position.set(x,.52,z);cat.add(g);sphere(.125,colors.orange,0,-.15,0,g,.85,1.9,.9);sphere(.13,colors.cream,0,-.405,.045,g,1,.66,1.25);legs.push(g);}
  for(const z of [-.33,-.08,.18]){const points=[],radial=Math.sqrt(1-((z+.04)/.62)**2);for(let j=0;j<=16;j++){const a=-1.17+j/16*2.34;points.push([Math.sin(a)*.363*radial,.64+Math.cos(a)*.417*radial,z]);}tube(points,.018,colors.stripe,cat,20);}
  const tail=new THREE.Group();tail.position.set(0,.73,-.57);cat.add(tail);tube([[0,0,0],[.06,.18,-.2],[.18,.5,-.29],[.21,.77,-.22],[.15,.88,-.12]],.065,colors.orange,tail,28);tube([[.18,.74,-.23],[.21,.81,-.2],[.15,.88,-.12]],.066,colors.cream,tail,10);tube([[.105,.3,-.26],[.14,.4,-.28]],.067,colors.stripe,tail,6);sphere(.066,colors.cream,.15,.88,-.12,tail);
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,3,32,32,30);gradient.addColorStop(0,'rgba(40,48,29,.22)');gradient.addColorStop(1,'rgba(40,48,29,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.8),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;scene.add(shadow);
  const fish=[];for(const [x,z]of [[-5,5],[5,-6],[-6,-19],[17,6],[-8,24],[6,-27]]){const g=group(x,z);g.position.y=.8;sphere(.22,'#e7bb65',0,0,0,g,1.5,.8,.48);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-.27,0,0,-.48,.16,0,-.48,-.16,0],3));geo.computeVertexNormals();const fin=add(geo,'#dba956',0,0,0,g);fin.material=fin.material.clone();fin.material.side=THREE.DoubleSide;sphere(.025,'#485e51',.23,.04,.09,g);const ring=add(new THREE.TorusGeometry(.45,.01,4,40),'#f6ddb0',0,-.62,0,g);ring.rotation.x=Math.PI/2;fish.push({g,x,z,collected:false});}
  body.name='cat-body';head.name='cat-head';tail.name='cat-tail';legs.forEach(leg=>leg.name='cat-leg');
  const life=createVillageLife(scene,{box,sphere,foliage,cylinder,beam,add,material,group},cat,colliders,houses);
  const animatedRoots=new Set([cat,...laundry,...palms,...water,...fish.map(f=>f.g),shadow,...life.dynamicRoots]);
  scene.updateMatrixWorld(true);
  const batches=new Map();
  scene.traverse(object=>{
    if(!object.isMesh||object.isInstancedMesh||object.material.transparent)return;
    for(let p=object;p;p=p.parent)if(animatedRoots.has(p))return;
    if(!batches.has(object.material))batches.set(object.material,[]);
    batches.get(object.material).push(object);
  });
  for(const [mat,objects]of batches){
    if(objects.length<2)continue;
    let count=0;for(const object of objects)count+=object.geometry.index?.count??object.geometry.attributes.position.count;
    const positions=new Float32Array(count*3),normals=new Float32Array(count*3);
    const v=new THREE.Vector3(),normalMatrix=new THREE.Matrix3();let offset=0;
    for(const object of objects){
      const geometry=object.geometry,pos=geometry.attributes.position,norm=geometry.attributes.normal,index=geometry.index;
      normalMatrix.getNormalMatrix(object.matrixWorld);
      for(let i=0,n=index?.count??pos.count;i<n;i++){
        const j=index?index.getX(i):i;
        v.fromBufferAttribute(pos,j).applyMatrix4(object.matrixWorld).toArray(positions,offset);
        v.fromBufferAttribute(norm,j).applyNormalMatrix(normalMatrix).toArray(normals,offset);offset+=3;
      }
      object.removeFromParent();geometry.dispose();
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.BufferAttribute(normals,3));
    const combined=new THREE.Mesh(geo,mat);combined.castShadow=objects.some(o=>o.castShadow);combined.receiveShadow=true;scene.add(combined);
  }
  function updateEnvironment(time,height){palms.forEach((p,i)=>{p.rotation.z=Math.sin(time*.7+i)*.012;p.rotation.x=Math.cos(time*.55+i)*.01;});water.forEach((m,i)=>m.scale.x=1+Math.sin(time+i)*.13);shadow.position.x=cat.position.x;shadow.position.z=cat.position.z;shadow.material.opacity=1-height*.35;shadow.scale.setScalar(1+height*.12);}
  return {cat,body,head,legs,tail,fish,houses,colliders,laundry,updateEnvironment,life};
}
