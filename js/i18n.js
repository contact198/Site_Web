/* ========= POWER LINK — i18n + Drawer + Anti-Double-Transition (VT Guard) ========= */

(() => {
  // ---- Config ----
  const SUPPORTED = ['fr','en','ar'];
  const RTL_SET   = new Set(['ar']);
  const DEFAULT   = 'en';

  // ---- State ----
  let currentLang = DEFAULT;
  let switching   = false;          // anti double-clic
  let dictCache   = new Map();      // cache des dictionnaires

  // ---- Utils ----
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function clampToSupported(lang){
    lang = (lang || '').toLowerCase().slice(0,2);
    return SUPPORTED.includes(lang) ? lang : DEFAULT;
  }

  function getInitialLang(){
    const u = new URL(location.href);
    const fromUrl = u.searchParams.get('lang');
    if(fromUrl) return clampToSupported(fromUrl);

    const fromLS = localStorage.getItem('lang');
    if(fromLS) return clampToSupported(fromLS);

    const fromNav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return clampToSupported(fromNav);
  }

  function applyRTL(lang){
    const root = document.documentElement;
    const isRTL = RTL_SET.has(lang);
    root.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    root.setAttribute('lang', lang);
  }

  // Lecture de dictionnaire :
  // 1) <script type="application/json" id="i18n-xx">…</script>
  // 2) window.I18N_DICTIONARIES?.xx
  async function loadDict(lang){
    if(dictCache.has(lang)) return dictCache.get(lang);

    // 1) Script inline
    const node = document.getElementById(`i18n-${lang}`);
    if(node && node.tagName === 'SCRIPT'){
      try{
        const json = JSON.parse(node.textContent || '{}');
        dictCache.set(lang, json);
        return json;
      }catch(e){
        console.warn('[i18n] JSON invalide dans #i18n-' + lang, e);
      }
    }

    // 2) Objet global (optionnel)
    if(window.I18N_DICTIONARIES && window.I18N_DICTIONARIES[lang]){
      dictCache.set(lang, window.I18N_DICTIONARIES[lang]);
      return window.I18N_DICTIONARIES[lang];
    }

    // 3) Fallback vide
    const empty = {};
    dictCache.set(lang, empty);
    return empty;
  }

  function translate(dict){
    // Traduction par data-i18n-key
    $$('[data-i18n-key]').forEach(el => {
      const key = el.getAttribute('data-i18n-key');
      if(!key) return;
      const val = getDeep(dict, key);
      if(val == null) return;

      if(el.hasAttribute('data-i18n-attr')){
        const attr = el.getAttribute('data-i18n-attr');
        el.setAttribute(attr, String(val));
      }else{
        el.textContent = String(val);
      }
    });

    // Traduction placeholders
    $$('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      const val = getDeep(dict, key);
      if(val == null) return;
      el.setAttribute('placeholder', String(val));
    });

    // Traduction titres
    $$('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const val = getDeep(dict, key);
      if(val == null) return;
      el.setAttribute('title', String(val));
    });

    // <title> du document
    const titleKey = document.querySelector('meta[name="i18n:title"]')?.getAttribute('content');
    if(titleKey){
      const t = getDeep(dict, titleKey);
      if(t) document.title = String(t);
    }
  }

  function getDeep(obj, path){
    return String(path).split('.').reduce((o,k)=> (o && k in o) ? o[k] : undefined, obj);
  }

  function activateFlag(lang){
    $$('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });
  }

  // ---- Anti-double VT guard autour du switch de langue ----
  async function setLang(lang, push=true){
    if(switching) return;      // anti double-clic
    switching = true;

    lang = clampToSupported(lang);
    const root = document.documentElement;

    // Couper *toute* View Transition pendant les gros changements
    root.classList.add('no-vt');

    try{
      localStorage.setItem('lang', lang);
      applyRTL(lang);

      const dict = await loadDict(lang);
      translate(dict);
      activateFlag(lang);
      currentLang = lang;

      if(push){
        const u = new URL(location.href);
        u.searchParams.set('lang', lang);
        history.replaceState({lang}, '', u);
      }
    } catch (e){
      console.error('[i18n] setLang error:', e);
    } finally {
      // Réactiver VT proprement au prochain frame
      requestAnimationFrame(() => {
        root.classList.remove('no-vt');
        switching = false;
      });
    }
  }

  // ---- Drawer (hamburger) ----
  const Drawer = (() => {
    let open = false;
    let closing = false;
    const root   = $('.drawer');
    if(!root) return { open:()=>{}, close:()=>{} };

    const overlay = $('.drawer .overlay');
    const panel   = $('.drawer .panel');
    const burger  = $('.hamburger');
    const btnClose= $('.drawer-close');

    function onKey(e){
      if(e.key === 'Escape') close();
    }

    function lockScroll(lock){
      if(lock){
        document.body.style.overflow = 'hidden';
      }else{
        document.body.style.overflow = '';
      }
    }

    function openFn(){
      if(open || closing) return;
      root.classList.add('open');
      open = true; closing = false;
      lockScroll(true);
      document.addEventListener('keydown', onKey);
      // focus trap minimal
      panel?.setAttribute('tabindex','-1');
      panel?.focus({preventScroll:true});
    }

    function close(){
      if(!open || closing) return;
      closing = true;
      root.classList.add('closing');
      root.classList.remove('open');

      const done = () => {
        root.classList.remove('closing');
        open = false; closing = false;
        lockScroll(false);
        document.removeEventListener('keydown', onKey);
      };

      // attendre la fin de l’anim CSS
      const dur = 320;
      setTimeout(done, dur);
    }

    burger?.addEventListener('click', e => {
      e.preventDefault();
      openFn();
    });
    overlay?.addEventListener('click', close);
    btnClose?.addEventListener('click', close);

    return { open: openFn, close };
  })();

  // ---- View Transition helper (optionnel pour liens) ----
  // Utilise la VT pour les liens [data-vt-link], sinon navigation classique.
  function enhanceLinks(){
    const supportsVT = !!document.startViewTransition;
    if(!supportsVT) return;

    $$('a[data-vt-link]').forEach(a => {
      a.addEventListener('click', (e) => {
        const url = a.getAttribute('href');
        if(!url || url.startsWith('#') || a.target === '_blank') return;

        e.preventDefault();
        // fermer le drawer si ouvert
        Drawer.close?.();

        document.startViewTransition(() => {
          window.location.href = url;
        });
      }, {capture:true});
    });
  }

  // ---- Bind UI (drapeaux & synchronisation historique) ----
  function bindUI(){
    // drapeaux
    $$('.lang-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const lang = btn.dataset.lang;
        if(!lang || lang === currentLang) return;
        // On **ne** déclenche pas de VT ici : le switch est encapsulé par html.no-vt
        await setLang(lang, true);
        // fermer le drawer si le tap vient de là
        const inDrawer = btn.closest('.drawer');
        if(inDrawer) Drawer.close();
      });
    });

    // retour arrière/avant
    window.addEventListener('popstate', () => {
      const u = new URL(location.href);
      const lang = clampToSupported(u.searchParams.get('lang') || currentLang);
      setLang(lang, false);
    });

    enhanceLinks();
  }

  // ---- Boot ----
  document.addEventListener('DOMContentLoaded', async () => {
    const init = getInitialLang();
    // Empêche une VT initiale si le HTML/CSS l’active très tôt
    document.documentElement.classList.add('no-vt');
    applyRTL(init);

    try{
      const dict = await loadDict(init);
      translate(dict);
      activateFlag(init);
      currentLang = init;

      // Sync URL (si manquante)
      const u = new URL(location.href);
      if(!u.searchParams.get('lang')){
        u.searchParams.set('lang', init);
        history.replaceState({lang:init}, '', u);
      }
    } finally {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('no-vt');
      });
    }

    bindUI();

    // Expose API globale (utile pour debug)
    window.I18N_API = { get lang(){return currentLang}, setLang, loadDict, translate };
  });

})();
