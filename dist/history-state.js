import {LESSON_VERSION,STATIONS,QUESTIONS,QUESTION_MAP} from './history-content.js';
export function newSession(){return {version:LESSON_VERSION,alias:'',startedAt:new Date().toISOString(),records:{},reflection:''};}
export function restoreSession(raw){
  try{
    const data=JSON.parse(raw);
    if(data?.version!==LESSON_VERSION||!data.records||typeof data.records!=='object')return newSession();
    const clean=newSession();clean.mode=data.mode==='world'?'world':'visual';clean.alias=String(data.alias||'').slice(0,30);clean.reflection=String(data.reflection||'').slice(0,1200);
    if(typeof data.startedAt==='string'&&!Number.isNaN(Date.parse(data.startedAt)))clean.startedAt=data.startedAt;
    for(const q of QUESTIONS){
      const r=data.records[q.id];if(!r||!Array.isArray(r.attempts))continue;
      const attempts=r.attempts.slice(0,50).filter(a=>a&&typeof a.answers==='object'&&a.answers!==null).map(a=>({answers:a.answers,correct:isCorrect(q,a.answers,clean.mode==='world'),at:typeof a.at==='string'?a.at:'',assisted:!!a.assisted,...(typeof a.physicalAction==='string'?{physicalAction:a.physicalAction.slice(0,1000)}:{})}));
      const solved=attempts.findIndex(a=>a.correct);
      clean.records[q.id]={attempts:solved>=0?attempts.slice(0,solved+1):attempts,hintUsed:!!r.hintUsed};
    }
    return clean;
  }catch{return newSession();}
}
export function isCorrect(q,answers,world=false){
  if(world&&q.id==='b3')return Array.isArray(answers)&&answers.length===2&&answers[0]==='material'&&answers[1]==='trade';
  if(q.type==='sort')return q.items.every(i=>answers[i.id]===i.group);
  if(!Array.isArray(answers)||answers.length!==q.answer.length)return false;
  return new Set(answers).size===answers.length&&q.answer.every(a=>answers.includes(a));
}
export function hasCompleteAnswer(q,answers){
  return q.type==='sort'?q.items.every(i=>q.groups.some(g=>g.id===answers[i.id])):
    Array.isArray(answers)&&answers.length===(q.type==='multi'?q.answer.length:1)&&answers.every(a=>q.options.some(o=>o.id===a));
}
export function recordAnswer(session,id,answers){
  const q=QUESTION_MAP.get(id);if(!q||!hasCompleteAnswer(q,answers))throw new Error('Lengkapkan jawapan sebelum menyemak.');
  const r=session.records[id]??={attempts:[],hintUsed:false};
  if(r.attempts.some(a=>a.correct))return {correct:true,alreadySolved:true};
  if(r.attempts.length>=50)throw new Error('Had percubaan dicapai. Rujuk guru atau mulakan sesi baharu.');
  const correct=isCorrect(q,answers,session.mode==='world');
  r.attempts.push({answers:structuredClone(answers),correct,at:new Date().toISOString(),assisted:r.hintUsed});
  return {correct,alreadySolved:false};
}
export function useHint(session,id){
  if(!QUESTION_MAP.has(id))return;
  const r=session.records[id]??={attempts:[],hintUsed:false};r.hintUsed=true;
}
export function solved(session,id){return !!session.records[id]?.attempts.some(a=>a.correct);}
export function stationComplete(session,id){const s=STATIONS.find(s=>s.id===id);return !!s&&s.questions.every(q=>solved(session,q.id));}
export function summary(session){
  const answered=QUESTIONS.filter(q=>session.records[q.id]?.attempts.length),done=QUESTIONS.filter(q=>solved(session,q.id));
  const sorts=answered.filter(q=>q.type==='sort');
  return {answered:answered.length,solved:done.length,total:QUESTIONS.length,
    sortCorrect:sorts.reduce((n,q)=>n+q.items.filter(i=>session.records[q.id].attempts[0].answers[i.id]===i.group).length,0),sortTotal:sorts.reduce((n,q)=>n+q.items.length,0),
    firstCorrect:answered.filter(q=>session.records[q.id].attempts[0].correct).length,
    independent:answered.filter(q=>{const a=session.records[q.id].attempts[0];return a.correct&&!a.assisted;}).length,
    retries:answered.reduce((n,q)=>n+Math.max(0,session.records[q.id].attempts.length-1),0),
    fish:STATIONS.filter(s=>stationComplete(session,s.id)).length};
}
export function answerLabel(q,answers){
  if(q.type==='sort')return q.items.map(i=>`${i.label}: ${q.groups.find(g=>g.id===answers[i.id])?.label||'—'}`).join(' | ');
  return Array.isArray(answers)?answers.map(id=>q.options.find(o=>o.id===id)?.label||'—').join(' | '):'';
}
const cell=value=>{let s=String(value??'');if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
export function resultsCsv(session){
  const rows=[['Versi','Nama samaran','Stesen','ID soalan','Konsep','Status','Percubaan pertama betul','Petunjuk sebelum jawapan pertama','Bilangan percubaan','Jawapan pertama','Jawapan terakhir','Petunjuk digunakan','Item pengelasan betul pada cubaan pertama','Jumlah item pengelasan','Cadangan susulan guru','Masa percubaan pertama','Refleksi murid']];
  for(const q of QUESTIONS){const r=session.records[q.id],first=r?.attempts[0],last=r?.attempts.at(-1);
    rows.push([session.mode==='world'?LESSON_VERSION+'-world-v2':LESSON_VERSION,session.alias||'Tanpa nama',q.stationName,q.id,q.concept,last?.correct?'Selesai':first?'Perlu cuba lagi':'Belum dijawab',first?first.correct?'Ya':'Tidak':'',first?first.assisted?'Ya':'Tidak':'',r?.attempts.length||0,first?(first.physicalAction||answerLabel(q,first.answers)):'',last?(last.physicalAction||answerLabel(q,last.answers)):'',r?.hintUsed?'Ya':'Tidak',q.type==='sort'&&first?q.items.filter(i=>first.answers[i.id]===i.group).length:'',q.type==='sort'?q.items.length:'',first&&!first.correct?q.reteach:'',first?.at||'',session.reflection]);
  }
  return '\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n');
}
