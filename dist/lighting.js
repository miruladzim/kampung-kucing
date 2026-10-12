import * as THREE from './vendor/three.module.js';

export function createTimeOfDay(scene, renderer, sun, ambient) {
  const colors={
    day:{fog:new THREE.Color('#c0d3cc'),sun:new THREE.Color('#fff0da'),sky:new THREE.Color('#fff5d8'),ground:new THREE.Color('#647e60'),
      horizon:new THREE.Color('#d9e4d7'),middle:new THREE.Color('#b9d2cb'),zenith:new THREE.Color('#97b9c5')},
    evening:{fog:new THREE.Color('#d2aaa0'),sun:new THREE.Color('#ffbe82'),sky:new THREE.Color('#debec1'),ground:new THREE.Color('#706763'),
      horizon:new THREE.Color('#f2b485'),middle:new THREE.Color('#dba6b4'),zenith:new THREE.Color('#87799c')}
  };
  const uniforms={horizon:{value:colors.day.horizon.clone()},middle:{value:colors.day.middle.clone()},zenith:{value:colors.day.zenith.clone()}};
  const dome=new THREE.Mesh(new THREE.SphereGeometry(145,32,20),new THREE.ShaderMaterial({
    uniforms,side:THREE.BackSide,depthWrite:false,toneMapped:false,
    vertexShader:'varying vec3 direction; void main(){ direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:`varying vec3 direction; uniform vec3 horizon; uniform vec3 middle; uniform vec3 zenith;
      void main(){float h=clamp(normalize(direction).y,0.0,1.0);vec3 color=mix(horizon,middle,smoothstep(0.0,0.42,h));
        color=mix(color,zenith,smoothstep(0.3,1.0,h));gl_FragColor=vec4(color,1.0);
        #include <colorspace_fragment>
      }`
  }));
  dome.renderOrder=-100;dome.frustumCulled=false;scene.add(dome);scene.background=null;
  // A soft disc sits low in the sunset sky; its glow does not obscure the world.
  const disc=new THREE.Mesh(new THREE.SphereGeometry(3.2,24,16),new THREE.MeshBasicMaterial({color:'#ffdb9e',transparent:true,opacity:0,depthWrite:false,toneMapped:false}));
  disc.renderOrder=-90;scene.add(disc);
  const fill=new THREE.DirectionalLight('#c4bfd7',0);fill.position.set(20,18,-25);scene.add(fill);
  const dayPosition=new THREE.Vector3(-18,28,12),eveningPosition=new THREE.Vector3(-36,13,22);
  const windows=new Set();scene.traverse(object=>{if(object.isMesh&&object.material.color?.getHexString()==='47736d')windows.add(object.material);});
  const warmWindow=new THREE.Color('#ffc281');
  let target=0,blend=0;
  function setMode(mode){target=mode==='evening'?1:0;}
  function update(dt,camera){
    blend+=(target-blend)*(1-Math.exp(-dt*2.5));if(Math.abs(target-blend)<.001)blend=target;
    const t=blend*blend*(3-2*blend);
    sun.color.copy(colors.day.sun).lerp(colors.evening.sun,t);sun.position.lerpVectors(dayPosition,eveningPosition,t);sun.intensity=THREE.MathUtils.lerp(2.3,1.65,t);
    ambient.color.copy(colors.day.sky).lerp(colors.evening.sky,t);ambient.groundColor.copy(colors.day.ground).lerp(colors.evening.ground,t);ambient.intensity=THREE.MathUtils.lerp(1.65,1.15,t);
    fill.intensity=t*.4;renderer.toneMappingExposure=THREE.MathUtils.lerp(1.12,1.02,t);
    scene.fog.color.copy(colors.day.fog).lerp(colors.evening.fog,t);
    for(const key of ['horizon','middle','zenith'])uniforms[key].value.copy(colors.day[key]).lerp(colors.evening[key],t);
    windows.forEach(mat=>{mat.emissive.copy(warmWindow);mat.emissiveIntensity=t*.62;});
    dome.position.copy(camera.position);disc.position.copy(camera.position).add(new THREE.Vector3(-99,19,62));disc.material.opacity=t*.88;
  }
  return {setMode,update,get mode(){return target?'evening':'day';},get blend(){return blend;}};
}
