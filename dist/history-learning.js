import {STATIONS,QUESTIONS,REFERENCES} from './history-content.js';
import {newSession,restoreSession,recordAnswer,useHint,solved,stationComplete,summary,resultsCsv} from './history-state.js';

const KEY='kampung-kucing-sejarah-v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=name=>`history-assets/${name}.svg`;
const visualAlt={irrigation:'Air dari takungan melalui saluran menuju sawah padi.',harbour:'Peta skematik: pedagang dari barat dan timur menuju pelabuhan P.',goods:'Empat kad bergambar: padi, lada hitam, rotan dan mutiara.','forest-sea':'Hutan: rotan dan gaharu. Laut: mutiara dan rumpai laut.','rattan-craft':'Rotan yang panjang dan lentur serta contoh bakul kraf.',workshop:'Perlombongan mendapatkan mineral. Pembuatan mengolah bahan seperti tanah liat menjadi tembikar.',exchange:'Pengeluar dan pedagang dihubungkan oleh anak panah jual beli atau pertukaran.'};

export function createHistoryLearning({onOpen,onLaunch,onTrack,onReward}){
  const dialog=$('learningDialog'),body=$('learningBody');
  let session,saveAvailable=true;
  try{session=restoreSession(localStorage.getItem(KEY));}catch{session=newSession();saveAvailable=false;}
  let activeStation=null,index=0,draft=[],feedback=null,nearby=null,returnFocus=null;
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(session));}catch{saveAvailable=false;}updateHud();}
  function updateHud(){
    const s=summary(session);$('count').textContent=`${s.fish} / 4 ikan`;
    $('questText').textContent=s.fish===4?'Semua stesen selesai. Lihat laporan pembelajaran.':`${s.solved} / 12 aktiviti selesai · Ikut rentak sendiri`;
    $('progress').style.width=`${s.solved/12*100}%`;
    $('questTitle').textContent=s.fish===4?'Penjelajah warisan!':'Jejak ekonomi Alam Melayu';
  }
  function show(){
    onOpen();if(!dialog.open){returnFocus=document.activeElement;dialog.showModal();}
    document.body.classList.add('learning-open');
  }
  function close(){if(window.speechSynthesis)window.speechSynthesis.cancel();dialog.close();}
  dialog.addEventListener('close',()=>{document.body.classList.remove('learning-open');if(window.speechSynthesis)window.speechSynthesis.cancel();returnFocus?.focus?.();});
  function header(kicker,title,subtitle=''){
    return `<div class="lesson-heading"><div class="eyebrow">${kicker}</div><h2 id="learningTitle">${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div>`;
  }
  const sources=()=>`<details class="lesson-sources"><summary>Sumber kandungan & ilustrasi</summary><p>Kampung fiksyen untuk pembelajaran; bukan pembinaan semula kerajaan silam. Rajah ialah ilustrasi konsep asli untuk prototaip ini. Soalan situasi ialah aplikasi pembelajaran.</p>${REFERENCES.map(s=>`<p><a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)} ↗</a><br>${esc(s.detail)}</p>`).join('')}</details>`;
  function openBook(){
    activeStation=null;show();dialog.className='lesson-dialog book-dialog';
    const s=summary(session);
    body.innerHTML=header('SEJARAH TINGKATAN 2 · BAB 2.2','Buku Misi Oyen','Terokai kegiatan ekonomi masyarakat kerajaan Alam Melayu. Tiada had masa, tiada kedudukan awam.')+
      `<div class="book-welcome"><label for="learnerAlias">Nama samaran <span>(pilihan)</span></label><input id="learnerAlias" maxlength="30" autocomplete="off" placeholder="Contoh: Penjelajah 01" value="${esc(session.alias)}"><p>Jawapan disimpan pada pelayar ini. Pada peranti berkongsi, muat turun laporan sebelum menukar murid.</p>${!saveAvailable?'<p role="status">Simpanan pelayar tidak tersedia. Kekalkan tab ini dan muat turun laporan sebelum keluar.</p>':''}</div>
      <div class="book-progress"><strong>${s.fish} / 4 ikan misi</strong><span>${s.solved} / 12 aktiviti selesai</span></div>
      <div class="station-grid">${STATIONS.map(st=>{
        const done=stationComplete(session,st.id),n=st.questions.filter(q=>solved(session,q.id)).length;
        return `<article class="station-card" style="--station-color:${st.color}"><div class="station-card-top"><span class="station-number">${st.number}</span><span class="station-status">${done?'✓ Selesai':`${n} / 3 aktiviti`}</span></div><img src="${asset(st.visual)}" alt="${visualAlt[st.visual]}"><h3>${st.name}</h3><p>${st.description}</p><div class="station-card-actions"><button class="lesson-primary" data-action="station" data-id="${st.id}">${done?'Ulang kaji':'Main aktiviti'} ↗</button><button class="lesson-secondary" data-action="track" data-id="${st.id}">Jejak di kampung</button></div></article>`;
      }).join('')}</div><p class="lesson-tip">Pilih aktiviti di sini, atau dekati penanda bernombor dalam kampung dan tekan <kbd>F</kbd>. Semua stesen boleh diteroka mengikut pilihan sendiri.</p>
      <div class="lesson-footer"><button class="lesson-secondary" data-action="results">Lihat laporan</button><a href="panduan-guru.html" target="_blank" rel="noopener">Panduan guru & objektif ↗</a><button class="lesson-text" data-action="reset-confirm">Sesi baharu</button></div>${sources()}`;
    $('learnerAlias').addEventListener('input',e=>{session.alias=e.target.value.trim().slice(0,30);persist();});
    focusHeading();
  }
  function openStation(id){
    activeStation=STATIONS.find(s=>s.id===id);if(!activeStation)return;
    index=activeStation.questions.findIndex(q=>!solved(session,q.id));if(index<0)index=0;
    prepareQuestion();show();renderQuestion();
  }
  function prepareQuestion(){
    const q=activeStation.questions[index],r=session.records[q.id];
    draft=q.type==='sort'?{}:[];
    if(solved(session,q.id)){draft=structuredClone(r.attempts.at(-1).answers);feedback={correct:true,review:true};}
    else feedback=null;
  }
  function renderQuestion(){
    if(window.speechSynthesis)window.speechSynthesis.cancel();
    const st=activeStation,q=st.questions[index],isDone=solved(session,q.id),r=session.records[q.id];
    dialog.className='lesson-dialog question-dialog';
    body.innerHTML=`<div class="question-nav"><button class="lesson-text" data-action="book">← Buku misi</button><span>${st.number} · ${st.name}</span><span>Aktiviti ${index+1} / 3</span></div>
      <div class="question-layout"><aside class="question-visual" style="--station-color:${st.color}"><div class="eyebrow">GALERI PETUNJUK</div><img src="${asset(q.visual)}" alt="${visualAlt[q.visual]}"><p>${visualAlt[q.visual]}</p><details><summary>Nota stesen</summary><p>${st.note}</p></details><button class="lesson-secondary audio-button" data-action="read">◖ Dengar soalan</button><p id="audioStatus" class="audio-status" role="status">Bacaan suara boleh diaktifkan; teks sentiasa tersedia.</p><small>${q.source} · Ilustrasi konsep</small></aside>
      <section class="question-main">${header('MISI JEJAK SEJARAH',q.prompt)}
      ${q.type==='sort'?`<p class="question-instruction">Pilih satu kategori bagi setiap kad.</p><div class="sort-grid">${q.items.map((item,i)=>`<label class="sort-item"><span class="sort-item-number">${i+1}</span><strong>${item.label}</strong><select aria-label="Kategori untuk ${item.label}" data-item="${item.id}" ${feedback?'disabled':''}><option value="">Pilih kategori…</option>${q.groups.map(g=>`<option value="${g.id}" ${draft[item.id]===g.id?'selected':''}>${g.label}</option>`).join('')}</select></label>`).join('')}</div>`:
        `<p class="question-instruction">${q.type==='multi'?'Pilih DUA jawapan.':'Pilih satu jawapan.'}</p><div class="answer-options" role="group" aria-label="Pilihan jawapan">${q.options.map((o,i)=>`<button class="answer-option" data-action="answer" data-value="${o.id}" aria-pressed="${draft.includes(o.id)}" ${feedback?'disabled':''}><span>${String.fromCharCode(65+i)}</span>${o.label}</button>`).join('')}</div><p id="selectionStatus" class="selection-status" role="status">${q.type==='multi'?`${draft.length} / 2 dipilih`:''}</p>`}
      <div id="questionFeedback" class="answer-feedback ${feedback?(feedback.correct?'correct':'incorrect'):''}" role="status">${feedback?`<strong>${feedback.correct?(feedback.review?'✓ Sudah diselesaikan':'✓ Tepat! Teruskan meneroka.'):'Belum tepat — mari semak petunjuk.'}</strong><p>${feedback.correct?q.explanation:q.wrong}</p>`:''}</div>
      <div id="questionHint" class="question-hint" ${r?.hintUsed?'':'hidden'}>${q.hint}</div>
      <div class="question-actions">${feedback?`<button class="lesson-primary" data-action="${feedback.correct?'next':'retry'}">${feedback.correct?(index===2?'Tamatkan stesen ↗':'Aktiviti seterusnya →'):'Cuba lagi'}</button>`:'<button class="lesson-primary" data-action="check">Semak jawapan</button>'}<button class="lesson-secondary" data-action="hint">Lihat petunjuk</button></div>
      <p class="question-reassurance">Boleh cuba semula. Ikan diberi apabila ketiga-tiga aktiviti stesen selesai. Jawapan pertama kekal dalam laporan pembelajaran.</p></section></div>`;
    body.querySelectorAll('select[data-item]').forEach(el=>el.addEventListener('change',()=>draft[el.dataset.item]=el.value));
    if(feedback)focusFeedback();else focusHeading();
  }
  function focusHeading(){const h=$('learningTitle');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}dialog.scrollTop=0;}
  function focusFeedback(){const el=$('questionFeedback');if(el){el.tabIndex=-1;el.focus({preventScroll:true});el.scrollIntoView({block:'center'});}}
  function finishStation(){
    const st=activeStation,s=summary(session);dialog.className='lesson-dialog completion-dialog';
    body.innerHTML=`<div class="completion-fish" aria-hidden="true">🐟</div>${header('STESEN SELESAI',`${st.name} diterokai!`,`Tiga aktiviti selesai. Satu ikan misi untuk Oyen — ${s.fish} daripada empat ikan dikumpulkan.`)}<p>Anda boleh meneliti laporan atau meneruskan ke stesen lain. Cuba semula membantu pembelajaran; laporan masih menunjukkan jawapan pertama.</p><div class="lesson-footer"><button class="lesson-primary" data-action="book">${s.fish===4?'Lihat semua misi':'Pilih stesen seterusnya'} →</button><button class="lesson-secondary" data-action="results">Lihat laporan</button></div>`;
    focusHeading();
  }
  function openResults(){
    activeStation=null;show();dialog.className='lesson-dialog results-dialog';const s=summary(session);
    body.innerHTML=header('LAPORAN PEMBELAJARAN','Lihat perjalanan belajar anda',`${esc(session.alias||'Penjelajah tanpa nama')} · Sejarah Tingkatan 2 · SP 5.2.2`)+
      `<div class="result-metrics"><div><strong>${s.fish}<small> / 4</small></strong><span>Ikan misi</span></div><div><strong>${s.solved}<small> / 12</small></strong><span>Aktiviti selesai</span></div><div><strong>${s.firstCorrect}<small> / ${s.answered}</small></strong><span>Betul pada cubaan pertama</span></div><div><strong>${s.retries}</strong><span>Percubaan tambahan</span></div></div>
      <p class="result-context">${s.answered} daripada 12 aktiviti telah dijawab. ${s.independent} jawapan pertama betul tanpa petunjuk. Pengelasan awal: <strong>${s.sortCorrect} / ${s.sortTotal} contoh</strong> daripada 12 contoh keseluruhan (sasaran: sekurang-kurangnya 8 / 12). Penyelesaian selepas cuba semula ditunjukkan berasingan daripada ketepatan awal.</p>
      <div class="report-table-wrap"><table class="report-table"><caption>Rekod pada peranti ini</caption><thead><tr><th>Stesen / konsep</th><th>Cubaan pertama</th><th>Percubaan</th><th>Status</th></tr></thead><tbody>${QUESTIONS.map(q=>{const r=session.records[q.id],first=r?.attempts[0];return `<tr><td><span>${q.stationName}</span><strong>${q.concept}</strong></td><td>${first?(first.correct?'✓ Betul':'Perlu semakan')+(first.assisted?' · dengan petunjuk':''):'Belum dijawab'}</td><td>${r?.attempts.length||'—'}</td><td>${solved(session,q.id)?'✓ Selesai':first?'Cuba lagi':'—'}</td></tr>`;}).join('')}</tbody></table></div>
      <label class="reflection-label" for="learnerReflection">Tiket keluar · refleksi ringkas</label><p class="reflection-prompt">Nyatakan empat kelompok kegiatan ekonomi. Kemudian terangkan dua faktor yang membantu kegiatan tersebut, dengan contoh daripada misi. Guru akan menilai penjelasan ini; teks ini tidak ditanda secara automatik.</p><textarea id="learnerReflection" rows="3" maxlength="1200" placeholder="Contoh struktur: Empat kelompok ialah … Faktor … membantu … kerana …">${esc(session.reflection)}</textarea>
      <details class="teacher-followup"><summary>Cadangan susulan guru</summary><p>Muat turun CSV bagi setiap murid atau pasangan. Semak lajur cubaan pertama dan petunjuk sebelum menilai kefahaman awal. Fail ini ialah laporan satu peranti, bukan papan pemantauan seluruh kelas.</p>${QUESTIONS.filter(q=>{const a=session.records[q.id]?.attempts[0];return a&&!a.correct;}).map(q=>`<p><strong>${q.concept}:</strong> ${q.reteach}</p>`).join('')||'<p>Gunakan respons refleksi untuk menyemak penjelasan sebab dan akibat. Aktiviti yang belum dijawab masih memerlukan pentaksiran.</p>'}</details>
      <div class="lesson-footer"><button class="lesson-primary" data-action="csv">Muat turun CSV ↓</button><button class="lesson-secondary" data-action="book">Kembali ke misi</button><a href="panduan-guru.html" target="_blank" rel="noopener">Panduan guru ↗</a></div><p id="downloadStatus" class="audio-status" role="status"></p>${sources()}`;
    $('learnerReflection').addEventListener('input',e=>{session.reflection=e.target.value.slice(0,1200);persist();});focusHeading();
  }
  function readQuestion(){
    const status=$('audioStatus');if(!('speechSynthesis' in window)){status.textContent='Bacaan suara tidak disokong pada pelayar ini. Gunakan teks soalan yang tersedia.';return;}
    const q=activeStation.questions[index];speechSynthesis.cancel();
    const text=q.prompt+' '+(q.type==='sort'?q.items.map(i=>i.label).join('. '):q.options.map(o=>o.label).join('. '));
    const u=new SpeechSynthesisUtterance(text);u.lang='ms-MY';u.rate=.88;
    const voice=speechSynthesis.getVoices().find(v=>/^ms/i.test(v.lang));if(voice)u.voice=voice;
    u.onstart=()=>status.textContent='Sedang membaca…';u.onend=()=>status.textContent='Bacaan selesai. Boleh dengar semula.';
    u.onerror=()=>status.textContent='Bacaan suara tidak tersedia. Teks soalan kekal di atas.';
    speechSynthesis.speak(u);
  }
  dialog.addEventListener('click',event=>{
    const button=event.target.closest('button[data-action]');if(!button)return;
    const action=button.dataset.action;
    if(action==='book')return openBook();if(action==='station')return openStation(button.dataset.id);
    if(action==='results')return openResults();
    if(action==='track'){const st=STATIONS.find(s=>s.id===button.dataset.id);close();onTrack(st);return;}
    if(action==='read')return readQuestion();
    if(action==='reset-confirm'){
      body.innerHTML=header('PERANTI BERKONGSI','Mulakan sesi baharu?','Muat turun laporan dahulu jika anda mahu menyimpannya. Sesi semasa akan diganti pada pelayar ini.')+'<div class="lesson-footer"><button class="lesson-primary" data-action="reset">Ya, sesi baharu</button><button class="lesson-secondary" data-action="book">Kembali</button></div>';focusHeading();return;
    }
    if(action==='reset'){session=newSession();persist();openBook();return;}
    if(action==='csv'){
      const blob=new Blob([resultsCsv(session)],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='kampung-kucing-sejarah-laporan.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      $('downloadStatus').textContent='Fail CSV dimuat turun. Serahkan fail ini kepada guru melalui kaedah yang ditetapkan.';return;
    }
    if(!activeStation)return;
    const q=activeStation.questions[index];
    if(action==='answer'&&!feedback){
      const value=button.dataset.value;
      if(q.type==='choice')draft=[value];
      else if(draft.includes(value))draft=draft.filter(v=>v!==value);
      else if(draft.length<q.answer.length)draft.push(value);
      body.querySelectorAll('[data-action="answer"]').forEach(b=>b.setAttribute('aria-pressed',String(draft.includes(b.dataset.value))));
      $('selectionStatus').textContent=q.type==='multi'?`${draft.length} / 2 dipilih${draft.length===2?' · Nyahpilih satu untuk menukar pilihan.':''}`:'';return;
    }
    if(action==='hint'){useHint(session,q.id);persist();$('questionHint').hidden=false;$('questionHint').scrollIntoView({block:'center'});return;}
    if(action==='check'&&!feedback){
      try{const wasComplete=stationComplete(session,activeStation.id);feedback=recordAnswer(session,q.id,draft);persist();if(!wasComplete&&stationComplete(session,activeStation.id))onReward();renderQuestion();}
      catch(e){$('questionFeedback').textContent=e.message;focusFeedback();}
      return;
    }
    if(action==='retry'){feedback=null;renderQuestion();return;}
    if(action==='next'){if(index<2){index++;prepareQuestion();renderQuestion();}else finishStation();}
  });
  $('closeLearning').addEventListener('click',close);
  $('missionBook').addEventListener('click',()=>{onLaunch();openBook();});
  $('learningReport').addEventListener('click',openResults);
  $('nearbyMission').addEventListener('click',()=>{if(nearby)openStation(nearby.id);});
  updateHud();
  return {openBook,openStation,openResults,isOpen:()=>dialog.open,getSession:()=>session,
    setNearby(st){if(nearby?.id===st?.id)return;nearby=st;const b=$('nearbyMission');b.hidden=!st;b.textContent=st?`F · ${st.name} — buka misi`:'';},
    interact(){if(nearby){openStation(nearby.id);return true;}return false;}};
}
