import {STATIONS} from './history-content.js';
import {solved,recordAnswer,useHint,stationComplete} from './history-state.js';

// Physical actions map to the same concepts used in the assessment report.
export const TASKS={
 p1:{kind:'carry',cargo:'Air takungan',icon:'water',instruction:'Bawa air takungan ke pintu saluran yang mengairi sawah.',targets:[['water','Saluran sawah','gate'],['ore','Laluan bijih','ore'],['salt','Kolam garam','salt']]},
 p3:{kind:'switch',instruction:'Sawah kering! Baiki dua bahagian pengairan, kemudian bunyikan gong.',targets:[['channel','Baiki saluran','gate'],['storage','Isi takungan','water'],['boats','Tambah gudang','store'],['ore','Buka lombong','ore']]},
 d1:{kind:'carry',cargo:'Muatan pedagang',icon:'crate',instruction:'Bawa muatan ke tempat pertemuan pedagang dari timur dan barat.',targets:[['meeting','Jeti pertemuan','boat'],['farming','Kebun pedalaman','rice'],['mining','Tapak lombong','ore']]},
 d2:{kind:'switch',instruction:'Sediakan dua kemudahan untuk kapal singgah. Kemudian bunyikan gong.',targets:[['water','Sediakan air','water'],['store','Buka gudang','store'],['blocked','Tutup laluan','barrier'],['noexchange','Tutup pasar','closed']]},
 d3:{kind:'carry',cargo:'Lebihan padi',icon:'rice',instruction:'Hasil tuaian sudah cukup. Hantar lebihan padi untuk diperdagangkan.',targets:[['link','Gerai pedagang','store'],['same','Tapak lombong','ore'],['stop','Sawah terbiar','dry']]},
 h2:{kind:'carry',cargo:'Rotan',icon:'rattan',instruction:'Bawa rotan ke tempat yang boleh mengolahnya menjadi kraf.',targets:[['craft','Meja anyaman','basket'],['metal','Relau logam','ore'],['pearl','Tempat mutiara','pearl']]},
 h3:{kind:'carry',cargo:'Lebihan hasil hutan',icon:'wood',instruction:'Hantar lebihan hasil hutan untuk urusan jual beli atau pertukaran.',targets:[['sell','Gerai pertukaran','store'],['mine','Tapak mineral','ore'],['farm','Petak padi','rice']]},
 b2:{kind:'carry',cargo:'Tanah liat',icon:'clay',instruction:'Bawa tanah liat ke bengkel yang mengubah bahan menjadi tembikar.',targets:[['transform','Roda tembikar','pot'],['locate','Papan pelayaran','boat'],['collect','Kutipan laut','pearl']]},
 b3:{kind:'chain',instruction:'Lengkapkan rantaian ekonomi: hantar bijih ke bengkel, kemudian pasu ke pedagang.',targets:[['material','Bengkel logam','ore'],['trade','Gerai pedagang','store'],['same','Tapak tanpa proses','dry'],['isolated','Stor tertutup','closed']]}
};
export function createWorldPlay(session,{save=()=>{},feedback=()=>{},reward=()=>{}}={}){
 session.mode='world';
 const runs=new Map();
 function current(st){return st.questions.find(q=>!solved(session,q.id));}
 function state(st){const q=current(st);if(!q)return null;let r=runs.get(st.id);if(r?.id!==q.id){r={id:q.id,carrying:null,places:{},selected:[],chain:0};runs.set(st.id,r);}return r;}
 function task(st){const q=current(st);if(!q)return null;return q.type==='sort'?{kind:'sort',instruction:'Angkut setiap barang ke bakul kategorinya. Bunyikan gong selepas keempat-empat barang diletakkan.',targets:q.groups.map(g=>[g.id,g.label,'basket'])}:TASKS[q.id];}
 function submit(st,answers){const q=current(st),was=stationComplete(session,st.id);const result=recordAnswer(session,q.id,answers);const attempt=session.records[q.id].attempts.at(-1);if(!result.alreadySolved){attempt.physicalAction=q.type==='sort'?q.items.map(i=>`${i.label} → ${q.groups.find(g=>g.id===answers[i.id])?.label}`).join(' | '):answers.map(id=>TASKS[q.id].targets.find(v=>v[0]===id)?.[1]||id).join(' → ');}save();feedback(result.correct?q.explanation:q.wrong,result.correct?'success':'retry');if(!was&&stationComplete(session,st.id))reward(st);return result;}
 function act(st,action,id){
  const q=current(st),r=state(st),t=task(st);if(!q)return false;
  if(action==='hint'){useHint(session,q.id);save();feedback(q.id==='p1'?'Cari pintu saluran sawah. Air takungan menyokong tanaman padi.':q.hint,'hint');return true;}
  if(action==='drop'){r.carrying=null;feedback('Barang dikembalikan ke tempat asal.');return true;}
  if(action==='pickup'){
   if(r.carrying){feedback('Letakkan barang yang sedang dibawa dahulu.');return false;}
   if(t.kind==='sort'&&!q.items.some(i=>i.id===id))return false;
   r.carrying=t.kind==='sort'?id:'cargo';if(t.kind==='sort')delete r.places[id];feedback('Barang dibawa. Dekati tempat tujuan dan tekan F.');return true;
  }
  if(action==='target'){
   if(!t.targets.some(v=>v[0]===id))return false;
   if(t.kind==='switch'){if(r.selected.includes(id))r.selected=r.selected.filter(v=>v!==id);else if(r.selected.length<2)r.selected.push(id);else{feedback('Dua bahagian sudah dipilih. Tekan F pada bahagian terpilih untuk menukarnya.');return false;}return true;}
   if(!r.carrying){feedback('Ambil barang dahulu. Cari barang dengan penanda kecil.');return false;}
   if(t.kind==='sort'){r.places[r.carrying]=id;r.carrying=null;return true;}
   if(t.kind==='chain'){
    r.selected.push(id);r.carrying=null;r.chain++;
    if(r.chain===2){const result=submit(st,r.selected);if(!result.correct){r.selected=[];r.chain=0;}}
    else feedback('Penghantaran pertama dicatat. Sekarang ambil pasu dan pilih tempat tujuannya.');return true;
   }
   r.carrying=null;submit(st,[id]);return true;
  }
  if(action==='check'){
   if(t.kind==='sort'){
    if(q.items.some(i=>!r.places[i.id])){feedback('Letakkan semua empat barang sebelum membunyikan gong.');return false;}
    submit(st,r.places);return true;
   }
   if(r.selected.length!==2){feedback('Kendalikan dua bahagian dahulu.');return false;}submit(st,r.selected);return true;
  }
  return false;
 }
 return {current,state,task,act};
}
