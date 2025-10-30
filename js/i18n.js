/* ===== POWER LINK — i18n + UI + Drawer + Menu title ===== */
(function () {
  // Anti-preload
  try { document.documentElement.classList.remove('preload'); } catch {}

  const SUPPORTED = ['en','fr','ar'];
  const DEFAULT = localStorage.getItem('lang') || 'en';
  const queryLang = new URL(location.href).searchParams.get('lang');
  const START = SUPPORTED.includes(queryLang || '') ? queryLang : DEFAULT;

  async function loadDict(lang){
    const r = await fetch('/i18n/'+lang+'.json',{cache:'no-cache'});
    return r.json();
  }

  function applyRTL(lang){
    const rtl = (lang === 'ar');
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }

  function translate(dict){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n');
      if(dict[k] != null) el.textContent = dict[k];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const k = el.getAttribute('data-i18n-placeholder');
      if(dict[k] != null) el.setAttribute('placeholder', dict[k]);
    });
    if(dict['meta.title']) document.title = dict['meta.title'];
    if(dict['meta.desc']){
      let m=document.querySelector('meta[name=description]');
      if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m);}
      m.content=dict['meta.desc'];
    }
    // Traduction du titre du menu
    const t=document.querySelector('.drawer-title');
    if(t && dict['menu.title']) t.textContent=dict['menu.title'];
  }

  function activateFlag(lang){
    document.querySelectorAll('.lang-btn').forEach(b=>{
      const on=b.dataset.lang===lang;
      b.classList.toggle('active',on);
      b.setAttribute('aria-current',on?'true':'false');
    });
  }

  // Ajout du titre “Menu”
  function ensureDrawerTitle(){
    const header=document.querySelector('.drawer .drawer-header');
    if(!header) return;
    let h=header.querySelector('.drawer-title');
    if(!h){
      h=document.createElement('h2');
      h.className='drawer-title';
      header.insertBefore(h,header.firstChild);
    }
    h.textContent='Menu';
    h.setAttribute('data-i18n','menu.title');
  }

  // Lang switching
  async function setLang(lang,push=true){
    if(!SUPPORTED.includes(lang)) lang='en';
    localStorage.setItem('lang',lang);
    applyRTL(lang);
    const dict=await loadDict(lang);
    translate(dict);
    activateFlag(lang);
    if(push){
      const u=new URL(location.href);
      u.searchParams.set('lang',lang);
      history.replaceState({},'',u);
    }
  }

  // Drawer open/close
  const drawer=document.querySelector('.drawer');
  document.querySelector('.hamburger')?.addEventListener('click',()=>{
    ensureDrawerTitle();
    drawer?.classList.add('open');
  });
  document.querySelector('.drawer-close')?.addEventListener('click',()=>{
    drawer?.classList.remove('open');
    drawer?.classList.add('closing');
    setTimeout(()=>drawer?.classList.remove('closing'),320);
  });
  drawer?.querySelector('.overlay')?.addEventListener('click',()=>{
    drawer?.classList.remove('open');
    drawer?.classList.add('closing');
    setTimeout(()=>drawer?.classList.remove('closing'),320);
  });

  // Form demo
  const form=document.getElementById('contact-form');
  form?.addEventListener('submit',async e=>{
    e.preventDefault();
    const msg=document.getElementById('contact-success');
    await new Promise(r=>setTimeout(r,300));
    msg.hidden=false;
    form.reset();
  });

  // Boot
  ensureDrawerTitle();
  setLang(START,false);
})();
