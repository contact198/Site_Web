(function(){
  // Retrigger top transition on language change
  function retriggerEnter(){
    const el = document.querySelector('.page-enter') || document.querySelector('main') || document.body;
    if(!el) return;
    el.classList.remove('page-enter');
    void el.offsetWidth; // reflow
    el.classList.add('page-enter');
  }

  const SUPPORTED=['en','fr','ar']; const DEFAULT=localStorage.getItem('lang')||'en';
  const q=new URL(location.href).searchParams.get('lang'); const START=SUPPORTED.includes(q||'')?q:DEFAULT;
  async function loadDict(lang){const r=await fetch('/i18n/'+lang+'.json',{cache:'no-cache'});return r.json();}
  function applyRTL(lang){const rtl=(lang==='ar');document.documentElement.lang=lang;document.documentElement.dir=rtl?'rtl':'ltr';}
  function translate(d){document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n'); if(d[k]!=null) el.textContent=d[k];});
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{const k=el.getAttribute('data-i18n-placeholder'); if(d[k]!=null) el.setAttribute('placeholder',d[k]);});
    if(d['meta.title']) document.title=d['meta.title']; if(d['meta.desc']){let m=document.querySelector('meta[name=description]'); if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m);} m.content=d['meta.desc'];}}
  function activateFlag(lang){document.querySelectorAll('.lang-btn').forEach(b=>{b.classList.toggle('active', b.dataset.lang===lang); b.setAttribute('aria-current', b.dataset.lang===lang?'true':'false');});}
  async function setLang(lang,push=true){if(!SUPPORTED.includes(lang)) lang='en'; localStorage.setItem('lang',lang); applyRTL(lang); const d=await loadDict(lang); \1 retriggerEnter();
    if(push){const u=new URL(location.href);u.searchParams.set('lang',lang);history.replaceState({},'',u);}}
  document.addEventListener('click',e=>{const b=e.target.closest('.lang-btn'); if(b){setLang(b.dataset.lang);}});
  const drawer=document.querySelector('.drawer');
  document.querySelector('.hamburger')?.addEventListener('click',()=>drawer?.classList.add('open'));
  document.querySelector('.menu-toggle')?.addEventListener('click',()=>drawer?.classList.add('open'));
 document.querySelector('.hamburger')?.addEventListener('click',()=>drawer?.classList.add('open'));
  document.querySelector('.drawer-close')?.addEventListener('click',()=>drawer?.classList.remove('open')); drawer?.querySelector('.overlay')?.addEventListener('click',()=>drawer?.classList.remove('open'));
  const form=document.getElementById('contact-form'); form?.addEventListener('submit',async e=>{e.preventDefault(); const msg=document.getElementById('contact-success'); await new Promise(r=>setTimeout(r,300)); msg.hidden=false; form.reset();});
  setLang(START,false);
})();