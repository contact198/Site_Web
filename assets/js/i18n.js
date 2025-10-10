
(function(){
  const I18N = {
    current: localStorage.getItem('lang') || 'en',
    data: {},
    async load(lang){
      if(I18N.data[lang]) return I18N.data[lang];
      try{
        const res = await fetch(`assets/i18n/${lang}.json`);
        const json = await res.json();
        I18N.data[lang] = json;
        return json;
      }catch(e){
        console.error('Failed to load lang', lang, e);
        return null;
      }
    },
    async apply(lang){
      const pack = await I18N.load(lang);
      if(!pack) return;
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', pack.dir || 'ltr');
      localStorage.setItem('lang', lang);
      // replace [data-i18n]
      document.querySelectorAll('[data-i18n]').forEach(el=>{
        const key = el.getAttribute('data-i18n');
        const t = pack.translations[key];
        if(typeof t === 'string'){
          if(el.placeholder !== undefined && el.matches('input,textarea')){
            el.placeholder = t;
          } else {
            el.textContent = t;
          }
        }
      });
      // swap text by literal content for common nav labels (fallback)
      const swapMap = pack.translations;
      document.querySelectorAll('a, button, nav a, nav button').forEach(el=>{
        const txt = el.textContent.trim();
        const candidates = {
          "Home":"nav.home","Accueil":"nav.home","الرئيسية":"nav.home","الصفحة الرئيسية":"nav.home",
          "About":"nav.about","À propos":"nav.about","من نحن":"nav.about",
          "Services":"nav.services","الخدمات":"nav.services","Prestations":"nav.services",
          "Contact":"nav.contact","اتصل بنا":"nav.contact","Contactez-nous":"nav.contact",
          "Blog":"nav.blog","مدونة":"nav.blog","La FAQ":"nav.faq"
        };
        const key = candidates[txt];
        if(key && swapMap[key]){
          el.textContent = swapMap[key];
        }
      });
      // update lang switch active state
      document.querySelectorAll('.lang-switch button').forEach(btn=>{
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });
    }
  };
  window.setLanguage = (lang)=>I18N.apply(lang);
  document.addEventListener('DOMContentLoaded', ()=> {
    I18N.apply(I18N.current);
  });
})();
