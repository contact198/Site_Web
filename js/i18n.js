/* ========= POWER LINK — i18n + Drawer + Anti-Double-Transition (VT Guard) — FULL ========= */

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

  function normalizeLang(code){
    const c = (code || '').toLowerCase();
    if (c === 'gb' || c === 'uk' || c === 'en' || c === 'en-us' || c === 'en-gb') return 'en';
    if (c === 'fr' || c === 'fr-fr') return 'fr';
    if (c === 'sa' || c === 'ar' || c === 'arabic' || c === 'ar-sa' || c === 'ar-ae') return 'ar';
    return c;
  }

  function clampToSupported(lang){
    lang = normalizeLang((lang || '').toLowerCase().slice(0,2));
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
    lang = normalizeLang(lang);
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

    const empty = {};
    dictCache.set(lang, empty);
    return empty;
  }

  function translate(dict){
    // data-i18n-key
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

    // placeholders
    $$('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      const val = getDeep(dict, key);
      if(val == null) return;
      el.setAttribute('placeholder', String(val));
    });

    // titles
    $$('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const val = getDeep(dict, key);
      if(val == null) return;
      el.setAttribute('title', String(val));
    });

    // <title> doc
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
    const norm = normalizeLang(lang);
    $$('.lang-btn,[data-lang]').forEach(btn => {
      const bLang = normalizeLang(btn.dataset.lang);
      const act = bLang === norm;
      btn.classList.toggle('active', act);
      if(btn.classList.contains('lang-btn')) btn.setAttribute('aria-pressed', String(act));
    });
  }

  // ---- Anti-double VT guard autour du switch de langue ----
  async function setLang(lang, push=true){
    if(switching) return;
    switching = true;

    lang = normalizeLang(lang);
    if(!SUPPORTED.includes(lang)) lang = DEFAULT;

    const root = document.documentElement;
    root.classList.add('no-vt'); // couper VT pendant les gros changements

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
      document.body.style.overflow = lock ? 'hidden' : '';
    }

    function openFn(){
      if(open || closing) return;
      root.classList.add('open');
      open = true; closing = false;
      lockScroll(true);
      document.addEventListener('keydown', onKey);
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

      setTimeout(done, 320); // durée de l'anim CSS
    }

    burger?.addEventListener('click', e => { e.preventDefault(); openFn(); });
    overlay?.addEventListener('click', close);
    btnClose?.addEventListener('click', close);

    return { open: openFn, close };
  })();

  // ---- View Transition helper (optionnel pour liens) ----
  function enhanceLinks(){
    const supportsVT = !!document.startViewTransition;
    if(!supportsVT) return;

    $$('a[data-vt-link]').forEach(a => {
      a.addEventListener('click', (e) => {
        const url = a.getAttribute('href');
        if(!url || url.startsWith('#') || a.target === '_blank') return;

        e.preventDefault();
        Drawer.close?.();
        document.startViewTransition(() => { window.location.href = url; });
      }, {capture:true});
    });
  }

  // ---- Bind UI (drapeaux & historique) ----
  function bindUI(){
    // Délégation globale : tout élément avec data-lang fonctionne
    document.addEventListener('click', async (e) => {
      const trg = e.target.closest('[data-lang]');
      if(!trg) return;

      e.preventDefault();
      const lang = normalizeLang(trg.dataset.lang);
      if(!lang || lang === currentLang) return;

      await setLang(lang, true);

      // fermer le drawer si le clic vient de l'intérieur
      const inDrawer = trg.closest('.drawer');
      if(inDrawer){
        document.querySelector('.drawer-close')?.click();
      }
    });

    // popstate (retour/avant)
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

    // Expose API pour debug
    window.I18N_API = { get lang(){return currentLang}, setLang, loadDict, translate };
  });

})();
