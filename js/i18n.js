<script>
(function () {
  // Anti-preload
  try { document.documentElement.classList.remove('preload'); } catch {}

  // Utils
  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
  function getRoot(){ return $('.page-root') || $('main') || document.body; }

  // I18N
  const SUPPORTED=['en','fr','ar'];
  const DEFAULT=localStorage.getItem('lang')||'fr';
  const queryLang=new URL(location.href).searchParams.get('lang');
  const START=SUPPORTED.includes(queryLang||'')?queryLang:DEFAULT;

  async function loadDict(lang){
    try{
      const r=await fetch('/i18n/'+lang+'.json',{cache:'no-cache'});
      if(!r.ok) throw new Error(r.status);
      return await r.json();
    }catch(e){
      if(lang!=='en') return loadDict('en');
      return {};
    }
  }
  function applyRTL(lang){
    const rtl=(lang==='ar');
    document.documentElement.lang=lang;
    document.documentElement.dir=rtl?'rtl':'ltr';
  }
  function translate(dict){
    $$('[data-i18n]').forEach(el=>{
      const k=el.getAttribute('data-i18n');
      if(dict[k]!=null) el.textContent=dict[k];
    });
    $$('[data-i18n-placeholder]').forEach(el=>{
      const k=el.getAttribute('data-i18n-placeholder');
      if(dict[k]!=null) el.setAttribute('placeholder',dict[k]);
    });
    if(dict['meta.title']) document.title=dict['meta.title'];
    if(dict['meta.desc']){
      let m=$('meta[name=description]'); if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m);}
      m.content=dict['meta.desc'];
    }
    const t=$('.drawer-title'); if(t) t.textContent=dict['menu.title']??'Menu';
  }
  function activateFlag(lang){
    $$('[data-lang]').forEach(b=>{
      const on=b.dataset.lang===lang;
      b.classList.toggle('active',on);
      b.setAttribute('aria-current', on?'true':'false');
    });
  }

  // Drawer title
  function ensureDrawerTitle(){
    const header=$('.drawer .drawer-header'); if(!header) return;
    let h=$('.drawer-title',header);
    if(!h){ h=document.createElement('h2'); h.className='drawer-title'; header.insertBefore(h,header.firstChild); }
    h.textContent='Menu'; h.setAttribute('data-i18n','menu.title');
  }

  // Set language
  async function setLang(lang,push=true){
    if(!SUPPORTED.includes(lang)) lang='en';
    localStorage.setItem('lang',lang);
    applyRTL(lang);
    const dict=await loadDict(lang);
    translate(dict);
    activateFlag(lang);
    if(push){
      const u=new URL(location.href); u.searchParams.set('lang',lang); history.replaceState({},'',u);
    }
    try{
      getRoot().animate([{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'cubic-bezier(.18,.84,.24,1)',fill:'both'});
    }catch{}
  }

  // Robust language triggers (click ANY descendant with data-lang)
  function handleLangTrigger(target){
    const el=target.closest('[data-lang]');
    if(!el) return false;
    const lang=el.dataset.lang||el.getAttribute('lang');
    if(!lang) return false;
    setLang(lang);
    return true;
  }
  document.addEventListener('click',e=>{
    if(handleLangTrigger(e.target)){
      e.preventDefault(); e.stopPropagation();
    }
  });
  document.addEventListener('keydown',e=>{
    if((e.key==='Enter'||e.key===' ')&&handleLangTrigger(e.target)){
      e.preventDefault(); e.stopPropagation();
    }
  });

  // Drawer open/close
  const drawer=$('.drawer');
  $('.hamburger')?.addEventListener('click',()=>{
    ensureDrawerTitle();
    drawer?.classList.add('open');
  });
  function closeDrawer(){
    if(!drawer) return;
    drawer.classList.remove('open');
    drawer.classList.add('closing');
    setTimeout(()=>drawer.classList.remove('closing'),320);
  }
  $('.drawer-close')?.addEventListener('click',closeDrawer);
  $('.drawer .overlay')?.addEventListener('click',closeDrawer);

  // Form demo
  const form=$('#contact-form');
  form?.addEventListener('submit',async e=>{
    e.preventDefault();
    const msg=$('#contact-success'); await new Promise(r=>setTimeout(r,300));
    if(msg) msg.hidden=false; form.reset();
  });

  // Boot
  ensureDrawerTitle();
  setLang(START,false);
})();
</script>
