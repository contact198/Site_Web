/* ===== POWER LINK — i18n + Drawer + VT Guard + Anti-Flash + Link Decorator + Pulse Retrigger ===== */
(function(){
  const DEBUG=false;
  const log=(...a)=>DEBUG&&console.log('[PL]',...a);
  const warn=(...a)=>DEBUG&&console.warn('[PL]',...a);
  const err=(...a)=>console.error('[PL]',...a);

  /* --- Early anti-flash --- */
  (function earlyGuard(){
    try{
      const urlLangEarly=new URL(location.href).searchParams.get("lang");
      const storeEarly=localStorage.getItem("lang")||"en";
      const raw=(urlLangEarly||storeEarly||"en").toLowerCase();
      const EARLY=raw.startsWith("fr")?"fr":raw.startsWith("ar")?"ar":"en";
      document.documentElement.lang=EARLY;
      document.documentElement.dir=EARLY==="ar"?"rtl":"ltr";
      document.documentElement.classList.add("preload");
    }catch(e){}
  })();

  /* ---------- Helpers dom ---------- */
  function getRoot(){return document.querySelector(".page-root")||document.querySelector("main")||document.body;}
  function retriggerEnter(){
    const root=getRoot();
    root.classList.remove("page-leave","page-enter","page-pulse");
    void root.offsetWidth;
    root.classList.add("page-enter");
  }

  /* --- Helpers URL & pulse (re-clic) --- */
  function normalizeUrl(u){
    try{
      const url=new URL(u,location.href);
      url.searchParams.delete('lang');
      if(url.pathname.length>1 && url.pathname.endsWith('/')) url.pathname=url.pathname.slice(0,-1);
      return url.origin+url.pathname+(url.search?url.search:'')+(url.hash||'');
    }catch{return u;}
  }
  function sameLocation(u){return normalizeUrl(u)===normalizeUrl(location.href);}
  function pulseEnter(){
    const root=getRoot();
    if(document.startViewTransition){
      document.startViewTransition(()=>{
        root.classList.remove('page-pulse'); void root.offsetWidth; root.classList.add('page-pulse');
      });
    }else{
      root.classList.remove('page-pulse'); void root.offsetWidth; root.classList.add('page-pulse');
    }
  }

  /* ---------- I18N ---------- */
  const SUPPORTED=["en","fr","ar"];
  const queryLang=new URL(location.href).searchParams.get("lang");
  const DEFAULT=localStorage.getItem("lang")||"en";
  const START=SUPPORTED.includes((queryLang||"").toLowerCase())?queryLang.toLowerCase():DEFAULT;

  let switching=false;
  let CURRENT=(START||"en").toLowerCase();

  function normalizeLang(code){
    const c=(code||"").toLowerCase();
    if(c.startsWith("fr"))return"fr";
    if(c.startsWith("ar"))return"ar";
    return"en";
  }

  async function loadDict(lang){
    try{
      const res=await fetch(`/i18n/${lang}.json`,{cache:"no-store"});
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }catch(e){warn(`Dictionnaire manquant: /i18n/${lang}.json`,e);return{};}
  }

  function applyRTL(lang){
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==="ar"?"rtl":"ltr";
  }

  function translate(dict){
    let count=0;
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const k=el.getAttribute("data-i18n");
      if(dict[k]!=null){el.textContent=dict[k];count++;}
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
      const k=el.getAttribute("data-i18n-placeholder");
      if(dict[k]!=null){el.setAttribute("placeholder",dict[k]);count++;}
    });
    if(dict["meta.title"]){document.title=dict["meta.title"];count++;}
    if(dict["meta.desc"]){
      let m=document.querySelector('meta[name="description"]');
      if(!m){m=document.createElement("meta");m.name="description";document.head.appendChild(m);}
      m.content=dict["meta.desc"];count++;
    }
    log("Traductions appliquées:",count);
  }

  function activateFlag(lang){
    document.querySelectorAll(".lang-btn,[data-lang]").forEach(b=>{
      const bLang=normalizeLang(b.dataset.lang);
      const active=bLang===lang;
      b.classList.toggle("active",active);
      if(b.classList.contains("lang-btn")) b.setAttribute("aria-current",active?"true":"false");
    });
  }

  /* --- Ajout/maintien automatique de ?lang=... sur TOUS les liens internes --- */
  function decorateLinks(lang){
    const sel='a[href^="/"], a[href^="./"], a[href^="../"]';
    document.querySelectorAll(sel).forEach(a=>{
      try{
        const u=new URL(a.href,location.origin);
        if(u.origin!==location.origin) return;
        if(u.hash && u.pathname===location.pathname) return;
        u.searchParams.set("lang",lang);
        a.href=u.toString();
      }catch{}
    });
  }

  async function setLang(lang,push=true){
    if(switching) return;
    switching=true;

    lang=normalizeLang(lang);
    CURRENT=lang;
    const root=document.documentElement;
    root.classList.add("no-vt");

    try{
      localStorage.setItem("lang",lang);
      applyRTL(lang);
      const dict=await loadDict(lang);
      translate(dict);
      activateFlag(lang);
      decorateLinks(lang);
      retriggerEnter();

      if(push){
        const u=new URL(location.href);
        u.searchParams.set("lang",lang);
        history.replaceState({lang},"",u);
      }
    }catch(e){
      err("[i18n] setLang error:",e);
    }finally{
      requestAnimationFrame(()=>{
        if(document.documentElement.lang===CURRENT){
          root.classList.remove("no-vt");
          root.classList.remove("preload");
        }else{
          requestAnimationFrame(()=>{
            root.classList.remove("no-vt");
            root.classList.remove("preload");
          });
        }
        switching=false;
      });
    }
  }

  // Expose si besoin
  window.setLanguage=setLang;

  /* ---------- UI (drawer, flags, esc) ---------- */
  function bindUI(){
    const drawer=document.querySelector(".drawer");

    document.addEventListener("click",(e)=>{
      const openBtn=e.target.closest(".hamburger, .menu-toggle");
      const closeBtn=e.target.closest(".drawer-close, .overlay");
      const flagEl=e.target.closest(".lang-btn,[data-lang],#flag-en,#flag-fr,#flag-ar");

      if(openBtn) drawer?.classList.add("open");
      if(closeBtn) drawer?.classList.remove("open");

      if(flagEl){
        e.preventDefault(); e.stopPropagation();
        const attrLang=flagEl.dataset?.lang || (flagEl.id==="flag-en"?"en":flagEl.id==="flag-fr"?"fr":flagEl.id==="flag-ar"?"ar":"");
        setLang(attrLang);
      }
    },true);

    document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") drawer?.classList.remove("open"); });
  }

  /* ---------- Page transitions (VT + fallback) + re-clic pulse ---------- */
  function bindPageTransitions(){
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let navigating=false;

    document.addEventListener("click",(e)=>{
      // On ignore la langue et les opt-out
      if(e.target.closest(".lang-btn,[data-lang]") || e.target.closest("[data-no-transition]")) return;

      const a=e.target.closest("a[href]");
      if(!a) return;

      const href=a.getAttribute("href");
      if(!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url=new URL(a.href,location.href);
      const sameOrigin=url.origin===location.origin;
      const sameTab=a.target!=="_blank" && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
      if(!sameOrigin || !sameTab) return;

      // conserve la langue
      url.searchParams.set("lang",CURRENT);

      // Re-clic sur la même page = rejouer l'anim sans naviguer
      if(sameLocation(url.href)){
        e.preventDefault();
        pulseEnter();
        retriggerEnter();
        return;
      }

      // Navigation normale animée
      if(navigating) return;
      e.preventDefault();
      navigating=true;

      const goto=()=>location.href=url.href;

      if(document.startViewTransition){
        document.startViewTransition(()=>goto());
        return;
      }

      const root=getRoot();
      root.classList.remove("page-enter");
      void root.offsetWidth;
      root.classList.add("page-leave");

      const onEnd=(ev)=>{
        if(ev.target!==root) return;
        root.removeEventListener("animationend",onEnd);
        goto();
      };
      const fallbackTimer=setTimeout(goto,1200);
      root.addEventListener("animationend",(ev)=>{
        clearTimeout(fallbackTimer);
        onEnd(ev);
      },{once:true});
    },true);

    // Optionnel : tout élément [data-retrigger] rejoue l'anim à la demande
    document.addEventListener("click",(e)=>{
      const el=e.target.closest("[data-retrigger]");
      if(!el) return;
      e.preventDefault();
      pulseEnter();
      retriggerEnter();
    },true);
  }

  /* ---------- Contact form (Formspree) ---------- */
  function bindContactForm(){
    const form=document.getElementById("contact-form");
    if(!form) return;

    form.addEventListener("submit",async(e)=>{
      e.preventDefault();
      const msg=document.getElementById("contact-success");

      try{
        const resp=await fetch(form.action,{method:form.method||"POST",body:new FormData(form),headers:{Accept:"application/json"}});
        if(resp.ok){ if(msg) msg.hidden=false; form.reset(); }
        else{
          let details=null; try{details=await resp.json();}catch{}
          warn("Formspree error:",resp.status,details);
          alert("Une erreur est survenue. Merci de réessayer.");
        }
      }catch(err0){
        err(err0);
        alert("Réseau indisponible. Vérifiez votre connexion puis réessayez.");
      }
    });
  }

  /* ---------- Boot ---------- */
  function boot(){ bindUI(); bindPageTransitions(); bindContactForm(); }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>{ boot(); setLang(START,false); },{once:true});
  }else{
    boot(); setLang(START,false);
  }
})();
