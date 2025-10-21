// js/i18n.js — robuste : flags, hamburger, RTL, transitions (entrée/sortie) et inter-pages
(function () {
  /* === Helpers === */
  function retriggerEnter(){
    const el = document.querySelector('.page-enter') || document.querySelector('main') || document.body;
    if(!el) return;
    el.classList.remove('page-enter');
    void el.offsetWidth;  // reflow
    el.classList.add('page-enter');
  }

  const SUPPORTED = ['en','fr','ar'];
  const DEFAULT   = localStorage.getItem('lang') || 'en';
  const q         = new URL(location.href).searchParams.get('lang');
  const START     = SUPPORTED.includes(q||'') ? q : DEFAULT;

  async function loadDict(lang){
    const r = await fetch(`i18n/${lang}.json`, { cache:'no-cache' });
    return r.json();
  }

  function applyRTL(lang){
    const rtl = (lang === 'ar');
    document.documentElement.lang = lang;
    document.documentElement.dir  = rtl ? 'rtl' : 'ltr';
  }

  function translate(dict){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n');
      if (dict[k] != null) el.textContent = dict[k];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const k = el.getAttribute('data-i18n-placeholder');
      if (dict[k] != null) el.setAttribute('placeholder', dict[k]);
    });
    if (dict['meta.title']) document.title = dict['meta.title'];
    if (dict['meta.desc']) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement('meta'); m.name='description'; document.head.appendChild(m); }
      m.content = dict['meta.desc'];
    }
  }

  function activateFlag(lang){
    document.querySelectorAll('.lang-btn').forEach(b=>{
      b.classList.toggle('active', b.dataset.lang === lang);
      b.setAttribute('aria-current', b.dataset.lang === lang ? 'true' : 'false');
    });
  }

  async function setLang(lang, push=true){
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem('lang', lang);
    applyRTL(lang);
    const dict = await loadDict(lang);
    translate(dict);
    activateFlag(lang);
    retriggerEnter(); // relance l'animation premium
    if (push) {
      const u = new URL(location.href);
      u.searchParams.set('lang', lang);
      history.replaceState({}, '', u);
    }
  }
  window.setLanguage = setLang; // si besoin en inline

  /* === UI binding (robuste) === */
  function bindUI(){
    const drawer = document.querySelector('.drawer');

    // Délégation de clic pour TOUT : hamburger, fermeture, drapeaux
    document.addEventListener('click', (e)=>{
      const openBtn  = e.target.closest('.hamburger, .menu-toggle');
      const closeBtn = e.target.closest('.drawer-close, .overlay');
      const flagBtn  = e.target.closest('.lang-btn');

      if (openBtn)  { drawer?.classList.add('open'); }
      if (closeBtn) { drawer?.classList.remove('open'); }
      if (flagBtn)  { e.preventDefault(); e.stopPropagation(); setLang(flagBtn.dataset.lang); }
    }, true); // capture=true pour passer avant d'autres handlers

    // ESC pour fermer le menu mobile
    document.addEventListener('keydown', (e)=>{
      if (e.key === 'Escape') drawer?.classList.remove('open');
    });
  }

  /* === Transitions inter-pages (inclut Contact) === */
  function bindPageTransitions(){
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.addEventListener('click', (e)=>{
      // Ignorer: clics sur boutons de langue, éléments marqués data-no-transition, ancres internes, tel/mailto
      if (e.target.closest('.lang-btn') || e.target.closest('[data-no-transition]')) return;
      const a = e.target.closest('a[href]');
      if(!a) return;

      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      const url = new URL(a.href, location.href);
      const sameOrigin = url.origin === location.origin;
      const sameTab = a.target !== '_blank' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

      if (sameOrigin && sameTab){
        e.preventDefault();
        const root = document.querySelector('.page-enter') || document.querySelector('main') || document.body;
        if(root){ root.classList.add('page-leave'); }
        setTimeout(()=>{ location.href = url.href; }, 280);
      }
    }, true);
  }

  /* === Boot === */
  function boot(){
    bindUI();
    bindPageTransitions();

    // Sécurité: s'assurer que la page "contact" a la classe page-enter
    const isContact = /contact\.html($|\?)/i.test(location.pathname + location.search);
    if (isContact){
      const root = document.querySelector('.page-enter') || document.querySelector('main') || document.body;
      if (root && !root.classList.contains('page-enter')){
        root.classList.add('page-enter');
      }
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ boot(); setLang((localStorage.getItem('lang')||'en'), false); }, {once:true});
  } else {
    boot(); setLang((localStorage.getItem('lang')||'en'), false);
  }
})();
