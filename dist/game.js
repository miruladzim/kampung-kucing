import * as THREE from './vendor/three.module.js';
import {createWorld} from './world.js';
import {createTimeOfDay} from './lighting.js';
import {createPlayerMotion} from './player-motion.js';
import {createHistoryLearning} from './history-learning.js';
import {createHistoryMarkers} from './history-world.js';
import {STATIONS} from './history-content.js';
import {startLightMode} from './history-light.js';

if(new URLSearchParams(location.search).get('mode')==='ringan')startLightMode();
else startVillage();

function startVillage(){
const $=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color('#c0d3cc');scene.fog=new THREE.Fog('#c0d3cc',55,125);
let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(e){startLightMode();return;}
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.setClearColor('#c0d3cc');$('world').appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,180);const ambient=new THREE.HemisphereLight('#fff5d8','#647e60',1.65);scene.add(ambient);const sun=new THREE.DirectionalLight('#fff0da',2.3);sun.position.set(-18,28,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:.5,far:110});sun.shadow.bias=-.0002;sun.shadow.normalBias=.025;sun.shadow.radius=3;scene.add(sun);
const {cat,body,head,legs,tail,fish,houses,colliders,laundry,updateEnvironment,life,nature}=createWorld(scene);
const timeOfDay=createTimeOfDay(scene,renderer,sun,ambient);
const playerMotion=createPlayerMotion(cat,legs,head,tail,colliders);
const missionMarkers=createHistoryMarkers(scene,colliders);
fish.forEach(f=>{f.collected=true;scene.remove(f.g);});
let started=false,muted=true,audioCtx,vertical=0,height=0,yaw=.15,zoom=13,elapsed=0,villageTime=0,toastTimer,trackedStation=null;const keys=new Set();
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2800);}
function start(){started=true;document.body.classList.add('playing');$('intro').classList.add('hidden');}
function tone(freq,duration=.2){if(muted)return;audioCtx??=new(window.AudioContext||window.webkitAudioContext)();audioCtx.resume();let o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(freq,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.6,audioCtx.currentTime+duration);g.gain.setValueAtTime(.09,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration);}
function jump(){if(learning.isOpen())return;start();if(height<=.001){vertical=5.2;tone(440,.12);}}
let meowUntil=0;function meow(){if(learning.isOpen())return;start();meowUntil=elapsed+.65;toast(nature.reactToMeow()||life.reactToMeow()||'Meow! Mari teruskan jejak sejarah.');tone(720,.45);}
const learning=createHistoryLearning({
  onOpen:()=>keys.clear(),onLaunch:start,
  onTrack:station=>{trackedStation=station;start();toast(`Ikuti penanda ${station.number}: ${station.name}.`);},
  onReward:()=>{tone(980,.25);toast('Satu ikan misi untuk Oyen!');}
});
$('play').onclick=()=>{start();learning.openBook();};
$('explore').onclick=()=>{start();toast('Buka Buku Misi atau dekati penanda bernombor.');};
$('help').onclick=()=>{$('helpDialog').showModal();keys.clear();};
$('closeHelp').onclick=()=>$('helpDialog').close();
$('helpPlay').onclick=()=>{$('helpDialog').close();start();};
$('sound').onclick=()=>{muted=!muted;$('sound').textContent=muted?'♫':'♪';$('sound').setAttribute('aria-label',muted?'Aktifkan bunyi':'Senyapkan bunyi');if(!muted)tone(640);toast(muted?'Bunyi dimatikan':'Bunyi diaktifkan');};
$('reset').onclick=()=>{cat.position.set(0,0,17);height=0;vertical=0;yaw=.15;zoom=13;playerMotion.reset();toast('Kembali ke pintu masuk. Kemajuan misi disimpan.');};
$('touchJump').onclick=jump;$('touchMeow').onclick=meow;
function chooseTime(mode){
  timeOfDay.setMode(mode);
  $('day').setAttribute('aria-pressed',String(mode==='day'));
  $('evening').setAttribute('aria-pressed',String(mode==='evening'));
  $('weather').textContent=mode==='evening'?'◒  Senja di kampung':'☀  Petang di kampung';
  document.body.dataset.time=mode;
}
$('day').onclick=()=>chooseTime('day');
$('evening').onclick=()=>chooseTime('evening');
const keymap={arrowup:'w',arrowdown:'s',arrowleft:'a',arrowright:'d'};
window.addEventListener('keydown',e=>{if($('helpDialog').open||learning.isOpen())return;let k=e.key.toLowerCase();k=keymap[k]||k;if(['w','a','s','d',' ','shift','e','f'].includes(k)){e.preventDefault();if(!e.repeat&&k===' ')jump();if(!e.repeat&&k==='e')meow();if(!e.repeat&&k==='f'){learning.interact();return;}keys.add(k);start();}});window.addEventListener('keyup',e=>{let k=e.key.toLowerCase();keys.delete(keymap[k]||k);});window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
for(let b of document.querySelectorAll('[data-move]')){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.move);start();};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.move);}
let dragging=false,lastX;renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId);});renderer.domElement.addEventListener('pointermove',e=>{if(dragging){yaw-=(e.clientX-lastX)*.006;lastX=e.clientX;}});renderer.domElement.addEventListener('pointerup',()=>dragging=false);renderer.domElement.addEventListener('pointercancel',()=>dragging=false);renderer.domElement.style.touchAction='none';renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom=THREE.MathUtils.clamp(zoom+e.deltaY*.015,7,22);},{passive:false});
const map=$('minimap').getContext('2d');function drawMap(){map.clearRect(0,0,160,160);map.save();map.translate(80,80);map.beginPath();map.arc(0,0,69,0,Math.PI*2);map.clip();map.fillStyle='#9daf7d';map.fillRect(-80,-80,160,160);map.fillStyle='#d8c395';map.fillRect(-7,-80,14,160);map.fillRect(-80,10,160,9);map.fillStyle='#84b1a6';map.fillRect(49,-80,14,160);map.fillStyle='#76a69a';map.beginPath();map.ellipse(nature.pond.x*1.9,nature.pond.z*1.6,nature.pond.rx*1.9,nature.pond.rz*1.6,0,0,Math.PI*2);map.fill();for(let h of houses){map.fillStyle='#e9d6a5';map.fillRect(h.x*1.9-h.w,h.z*1.6-h.d,h.w*2,h.d*2);map.fillStyle='#9b654a';map.fillRect(h.x*1.9-h.w,h.z*1.6-h.d,h.w*2,3);}for(const station of STATIONS){map.fillStyle=station.color;map.beginPath();map.arc(station.x*1.9,station.z*1.6,4,0,Math.PI*2);map.fill();map.fillStyle='#2d4b3c';map.font='bold 6px sans-serif';map.textAlign='center';map.fillText(station.number,station.x*1.9,station.z*1.6+2);}for(const actor of [...life.villagers,...life.cats]){map.fillStyle=actor.kind==='cat'?'#efc38c':'#669888';map.beginPath();map.arc(actor.root.position.x*1.9,actor.root.position.z*1.6,actor.kind==='cat'?1.7:2.2,0,Math.PI*2);map.fill();}map.translate(cat.position.x*1.9,cat.position.z*1.6);map.rotate(-cat.rotation.y);map.fillStyle='#fff6dc';map.beginPath();map.moveTo(0,6);map.lineTo(-4,-4);map.lineTo(4,-4);map.closePath();map.fill();map.restore();}
const clock=new THREE.Clock(),target=new THREE.Vector3(),desired=new THREE.Vector3();function animate(){requestAnimationFrame(animate);let dt=Math.min(clock.getDelta(),.05);elapsed+=dt;const forward=(keys.has('w')?1:0)-(keys.has('s')?1:0),right=(keys.has('d')?1:0)-(keys.has('a')?1:0);
const paused=learning.isOpen()||$('helpDialog').open;
if(!paused){
  villageTime+=dt;vertical-=13*dt;height=Math.max(0,height+vertical*dt);if(height===0)vertical=0;
  playerMotion.update(elapsed,dt,{forward,right,yaw,running:keys.has('shift'),enabled:started,height});
  if(elapsed<meowUntil)head.rotation.x=-.2;
  laundry.forEach((m,i)=>m.rotation.x=Math.sin(villageTime*1.3+i)*.04);
  updateEnvironment(villageTime,height);life.update(villageTime,dt);nature.update(villageTime,dt,life.cats);
}
learning.setNearby(started?missionMarkers.update(villageTime,cat,learning.getSession()):null);
if(trackedStation&&started){
  const distance=Math.hypot(cat.position.x-trackedStation.x,cat.position.z-trackedStation.z);
  $('routeHint').hidden=false;$('routeHint').textContent=distance<2.8?`Stesen ditemui`:`Jejak ${trackedStation.number} · ${trackedStation.name} · ${Math.round(distance)} m`;
  if(distance<2.8){$('routeHint').textContent=`${trackedStation.name} · Tekan F atau buka penanda`;}
}
target.set(cat.position.x,cat.position.y+.8,cat.position.z);desired.set(target.x+Math.sin(yaw)*zoom,target.y+zoom*.57,target.z+Math.cos(yaw)*zoom);if(!started){desired.set(26,22,34);target.set(0,1,2);}camera.position.lerp(desired,1-Math.exp(-4*dt));camera.lookAt(target);drawMap();timeOfDay.update(dt,camera);renderer.render(scene,camera);}
camera.position.set(26,22,34);window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});$('loading').remove();animate();

}
