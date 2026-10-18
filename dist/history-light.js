import {createHistoryLearning} from './history-learning.js';

// All assessment tasks remain available when 3D controls or WebGL are a barrier.
export function startLightMode(){
  const $=id=>document.getElementById(id);document.body.classList.add('lightweight-mode');
  const learning=createHistoryLearning({onOpen:()=>{},onLaunch:()=>{},onTrack:st=>learning.openStation(st.id),onReward:()=>{}});
  $('world').innerHTML='<img class="light-mode-illustration" src="history-assets/harbour.svg" alt="Ilustrasi pelabuhan pembelajaran dengan pergerakan pedagang dari timur dan barat">';
  $('loading')?.remove();
  $('intro').querySelector('.eyebrow').textContent='MOD AKTIVITI TANPA 3D';
  $('intro').querySelector('p').textContent='Empat stesen dan konsep yang sama, dalam bentuk aktiviti visual. Rekod mod ini berasingan daripada misi 3D. Buka Buku Misi dan belajar mengikut rentak sendiri.';
  $('worldJournal').onclick=()=>learning.openBook();
  $('play').onclick=()=>learning.openBook();
  $('explore').textContent='Kembali ke kampung 3D';$('explore').onclick=()=>location.assign('./');
  $('help').setAttribute('aria-label','Buka panduan pembelajaran');
  $('help').onclick=()=>{document.getElementById('helpDialog').showModal();};
  $('closeHelp').onclick=()=>$('helpDialog').close();
  $('helpPlay').onclick=()=>{$('helpDialog').close();learning.openBook();};
  $('helpDialog').querySelector('h2').textContent='Belajar tanpa kawalan 3D';
  $('helpDialog').querySelectorAll('p').forEach((p,i)=>p.textContent=[
    'Pilih mana-mana stesen melalui Buku Misi. Konsep pentaksiran adalah sama; mod ini menggunakan rajah dan soalan, dengan rekod berasingan daripada misi fizikal 3D.',
    'Pilih satu jawapan, dua jawapan, atau kategori bagi setiap kad mengikut arahan. Tekan Semak jawapan untuk menerima maklum balas. Petunjuk dan percubaan semula tersedia tanpa had masa.',
    'Butang Dengar soalan menggunakan bacaan suara pelayar jika tersedia. Teks dan rajah kekal tersedia pada skrin.',
    'Gunakan Laporan untuk melihat cubaan pertama dan memuat turun CSV. Pada peranti berkongsi, simpan laporan sebelum memulakan sesi murid lain.'
  ][i]||'');
  return learning;
}
