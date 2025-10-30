<script>
(function () {
  /* Anti-preload */
  try { document.documentElement.classList.remove('preload'); } catch {}

  /* Shorthands */
  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>Array.from(root.querySelectorAll(s));

  function getRoot(){
    const el = $('.page-root') || $('main') || document.body;
    el.classList.add('page-root'); return el;
  }

  /* I18N core */
  const SUPPORTED = ['en','fr','ar'];
  const DEFAULT = localStorage.getItem('lang') || 'fr';
  const queryLang = new URL(location.href).searchParams.get('lang');
  const START = SUPPORTED.includes(queryLang || '') ? queryLang : DEFAULT;

  async function loadDict(lang){
    try{
      const r = await fetch('/i18n/'+lang+'.json', {cache:'no-cache'});
      if(!r.ok) throw new Error('dict '+r.status);
      return await r.json();
    }catch(err){
      console.warn('[i18n] fallback EN after error:', err);
      if(lang!=='en') return loadDict('en');
      return {};
    }
  }

  function applyRTL(lang){
    const rtl = (lang === 'ar');
    document.documentElement.lang = lang;
    document.documentElement.dir  = rtl ? 'rtl' : 'ltr';
  }

  function translate(dict){
    $$('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n');
      if(k in dict) el.textContent = dict[k];
    });
    $$('[data-i18n-placeholder]').forEach(el=>{
      const k = el.getAttribute('data-i18n-placeholder');
      if(k in dict) el.setAttribute('placeholder', dict[k]);
    });
    if (dict['meta.title']) document.title = dict['meta.title'];
    if (dict['meta.desc']){
      let m = $('meta[name=description]');
      if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m);}
      m.content = dict['meta.desc'];
    }
    const t = $('.drawer-title');
    if (t) t.textContent = dict['menu.title'] ?? 'Menu';
  }

  function activateFlag(lang){
    $$('[data-lang]').forEach(el=>{
      const on = (el.dataset.lang === lang);
      el.classList.toggle('active', on);
      el.setAttribute('aria-current', on ? 'true' : 'false');
    });
  }

  function ensureDrawerTitle(){
    const header = $('.drawer .drawer-header');
    if(!header) return;
    let h = $('.drawer-title', header);
    if(!h){
      h = document.createElement('h2');
      h.className = 'drawer-title';
      header.insertBefore(h, header.firstChild);
    }
    h.textContent = 'Menu';
    h.setAttribute('data-i18n','menu.title');
  }

  async function setLang(lang, push=true){
    if(!SUPPORTED.includes(lang)) lang = 'en';
    localStorage.setItem('lang', lang);

    applyRTL(lang);
    const dict = await loadDict(lang);
    translate(dict);
    activateFlag(lang);

    if(push){
      const u = new URL(location.href);
      u.searchParams.set('lang', lang);
      history.replaceState({},'',u);
    }

    try{
      getRoot().animate(
        [{opacity:0, transform:'translateY(-10px)'}, {opacity:1, transform:'translateY(0)'}],
        {duration:380, easing:'cubic-bezier(.18,.84,.24,1)', fill:'both'}
      );
    }catch{}
  }

  /* ====== Délégation d’événements (marche même si le DOM change) ====== */
  document.addEventListener('click', (e)=>{
    const t = e.target;

    /* 1) Switch langue: accepte tout descendant portant data-lang */
    const langEl = t.closest('[data-lang]');
    if(langEl){
      const lang = langEl.dataset.lang || langEl.getAttribute('lang');
      if(lang){
        e.preventDefault();
        e.stopPropagation();
        setLang(lang);
        return;
      }
    }

    /* 2) Hamburger */
    if(t.closest('.hamburger')){
      e.preventDefault();
      ensureDrawerTitle();
      $('.drawer')?.classList.add('open');
      document.body.style.overflow = 'hidden';
      return;
    }

    /* 3) Fermer drawer (croix ou overlay) */
    if(t.closest('.drawer-close') || t.closest('.drawer .overlay')){
      e.preventDefault();
      const d = $('.drawer');
      if(d){
        d.classList.remove('open');
        d.classList.add('closing');
        setTimeout(()=>d.classList.remove('closing'),320);
      }
      document.body.style.overflow = '';
      return;
    }
  }, {capture:true}); // capture pour intercepter avant des handlers tiers

  /* Accessibilité: clavier pour switch langue */
  document.addEventListener('keydown', (e)=>{
    if(e.key!=='Enter' && e.key!==' ') return;
    const t = e.target.closest('[data-lang]');
    if(!t) return;
    const lang = t.dataset.lang || t.getAttribute('lang');
    if(!lang) return;
    e.preventDefault();
    e.stopPropagation();
    setLang(lang);
  }, {capture:true});

  /* Boot */
  ensureDrawerTitle();
  setLang(START,false);
})();
</script>
