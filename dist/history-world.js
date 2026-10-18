import * as THREE from './vendor/three.module.js';
import {STATIONS} from './history-content.js';
import {stationComplete} from './history-state.js';

export function createHistoryMarkers(scene,colliders){
  const markers=STATIONS.map(st=>{
    const root=new THREE.Group();root.position.set(st.x,0,st.z);scene.add(root);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.05,.07,1.9,8),new THREE.MeshStandardMaterial({color:'#8d7350',roughness:.9}));pole.position.y=.95;pole.castShadow=true;root.add(pole);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.62,.025,6,48),new THREE.MeshStandardMaterial({color:st.color,emissive:st.color,emissiveIntensity:.15,roughness:.9}));ring.rotation.x=-Math.PI/2;ring.position.y=.03;root.add(ring);
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#fff5df';ctx.beginPath();ctx.roundRect(4,4,504,152,24);ctx.fill();
    ctx.fillStyle=st.color;ctx.beginPath();ctx.roundRect(17,18,92,123,16);ctx.fill();ctx.fillStyle='#355344';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 47px sans-serif';ctx.fillText(st.number,63,81);
    ctx.textAlign='left';ctx.font='bold 25px sans-serif';const lines=st.name==='Lombong & Pembuatan'?['Lombong &','Pembuatan']:st.name==='Hasil Hutan & Laut'?['Hasil Hutan','& Laut']:[st.name];
    lines.forEach((line,i)=>ctx.fillText(line,130,lines.length===1?65:48+i*32));ctx.font='18px sans-serif';ctx.fillStyle='#7c8d70';ctx.fillText('MISI SEJARAH',130,123);
    const sign=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthWrite:false}));sign.scale.set(2.8,.875,1);sign.position.y=2.2;root.add(sign);
    const beacon=new THREE.Mesh(new THREE.OctahedronGeometry(.13),new THREE.MeshStandardMaterial({color:st.color,emissive:st.color,emissiveIntensity:.2}));beacon.position.y=2.9;root.add(beacon);
    colliders.push({x:st.x,z:st.z,r:.13});return {st,root,ring,beacon};
  });
  return {update(time,player,session){
    let nearest=null,distance=2.8;
    for(const m of markers){
      const d=Math.hypot(player.position.x-m.st.x,player.position.z-m.st.z);
      if(d<distance){nearest=m.st;distance=d;}
      const done=stationComplete(session,m.st.id);m.beacon.visible=!done;m.beacon.position.y=2.9+Math.sin(time*1.8+Number(m.st.number))*.08;m.beacon.rotation.y=time*.5;
      m.ring.material.emissiveIntensity=d<2.8?.45:.12;m.ring.material.color.set(done?'#789974':m.st.color);
    }
    return nearest;
  }};
}
