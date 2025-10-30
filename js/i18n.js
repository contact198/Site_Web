<script>
/* ===== POWER LINK — i18n + UI + Drawer + Smooth language switch ===== */
(function () {
  /* ---------- Anti-preload ---------- */
  try { document.documentElement.classList.remove('preload'); } catch {}

  /* ---------- Helpers ---------- */
  function getRoot(){
    const el = document.querySelector('.page-root') || document.querySelector('main') || document.body;
    el.classList.add('page-root'); return el;
  }
  function playEnterWAAPI(){
    // Petite anim à chaque changement de langue, compatible VT
    const root = getRoot();
    try{
      root.animate(
        [
          {opacity:0, transform:'translateY(-10px)'},
          {opacity:1, transform:'translateY(0)'}
        ],
        {duration:420, easing:'cubic-bezier(.18,.84,.24,1)', fill:'both'}
      );
    }catch{}
  }

  /* ---------- I18N ---------- */
  const SUPPORTED = ['en','fr','ar'];
  const DEFAULT = localStorage.getItem('lang') || 'en';
  const queryLang = new URL(location.href).searchParams.get('lang');
  const START = SUPPORTED.includes(queryLang || '') ? queryLang : DEFAULT;

  async function loadDict(lang){
    try{
      const r = await fetch('/i18n/'+lang+'.json', {cache:'no-cache'});
      if(!r.ok) throw new Error('dict fetch '+r.status);
      return await r.json();
    }catch(err){
      console.warn('[i18n] fallback to EN:', err);
      if(lang!=='en') return loadDict('en');
      return {};
    }
  }
  function applyRTL(lang){
    const rtl = (lang === 'ar');
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
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
    if (dict['meta.desc']){
      let m = document.querySelector('meta[name=description]');
      if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m);}
      m.content = dict['meta.desc'];
    }
    // Titre du menu
    const t=document.querySelector('.drawer-title');
    if(t) t.textContent = dict['menu.title'] ?? 'Menu';
  }
  function activateFlag(lang){
    document.querySelectorAll('.lang-btn').forEach(b=>{
      const on = b.dataset.lang === lang;
      b.classList.toggle('active', on);
      b.setAttribute('aria-current', on ? 'true' : 'false');
    });
  }

  /* ---------- Drawer title ---------- */
  function ensureDrawerTitle(){
    const header = document.querySelector('.drawer .drawer-header');
    if(!header) return;
    let h = header.querySelector('.drawer-title');
    if(!h){
      h = document.createElement('h2');
      h.className = 'drawer-title';
      header.insertBefore(h, header.firstChild);
    }
    h.textContent = 'Menu';                 // valeur par défaut
    h.setAttribute('data-i18n','menu.title');
  }

  /* ---------- Language switching ---------- */
  async function setLang(lang, push=true){
    if(!SUPPORTED.includes(lang)) lang = 'en';
    localStorage.setItem('lang', lang);

    // 1) Mettre l’orientation (pas d’anim ici)
    applyRTL(lang);

    // 2) Charger et appliquer la traduction
    const dict = await loadDict(lang);
    translate(dict);
    activateFlag(lang);

    // 3) Ajuster l’URL (state propre)
    if(push){
      const u = new URL(location.href);
      u.searchParams.set('lang', lang);
      history.replaceState({},'',u);
    }

    // 4) Jouer l’animation d’entrée (compatible VT)
    playEnterWAAPI();
  }

  /* ---------- UI events ---------- */
  // Changement de langue (drapeaux header + tiroir)
  document.addEventListener('click', e=>{
    const b = e.target.closest('.lang-btn');
    if(b){ setLang(b.dataset.lang); }
  });

  // Ouverture / fermeture du tiroir
  const drawer = document.querySelector('.drawer');
  document.querySelector('.hamburger')?.addEventListener('click', ()=>{
    ensureDrawerTitle();
    drawer?.classList.add('open');
  });
  function closeDrawer(){
    if(!drawer) return;
    drawer.classList.remove('open');
    drawer.classList.add('closing');
    setTimeout(()=>drawer.classList.remove('closing'), 320);
  }
  document.querySelector('.drawer-close')?.addEventListener('click', closeDrawer);
  drawer?.querySelector('.overlay')?.addEventListener('click', closeDrawer);

  /* ---------- Form (exemple) ---------- */
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', async e=>{
    e.preventDefault();
    const msg=document.getElementById('contact-success');
    await new Promise(r=>setTimeout(r,300));
    msg.hidden=false;
    form.reset();
  });

  /* ---------- Boot ---------- */
  ensureDrawerTitle();
  setLang(START,false);        // init i18n sans animer
  playEnterWAAPI();            // petite entrée au premier rendu
})();
</script>
