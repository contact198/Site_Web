
(function(){
  const I18N = {
    current: localStorage.getItem('lang') || 'en',
    data: {},
    async load(lang){
      if(I18N.data[lang]) return I18N.data[lang];
      const res = await fetch(`assets/i18n/${lang}.json`);
      const json = await res.json();
      I18N.data[lang] = json; return json;
    },
    async apply(lang){
      const pack = await I18N.load(lang);
      if(!pack) return;
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', pack.dir || 'ltr');
      localStorage.setItem('lang', lang);

      document.querySelectorAll('[data-i18n]').forEach(el=>{
        const key = el.getAttribute('data-i18n');
        const t = (pack.translations||{})[key];
        if(typeof t !== 'string') return;

        if(el.matches('input,textarea')){
          el.placeholder = t;
          return;
        }

        if(el.matches('label') && el.querySelector('input,textarea,select')){
          let span = el.querySelector('.i18n-label-text');
          if(!span){
            span = document.createElement('span');
            span.className = 'i18n-label-text';
            el.insertBefore(span, el.firstChild);
          }
          span.textContent = t;
          return;
        }

        const span = el.querySelector(':scope > .i18n-text');
        if(span){ span.textContent = t; return; }

        el.textContent = t;
      });

      document.querySelectorAll('.lang-switch button').forEach(btn=>{
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });
    }
  };
  window.setLanguage = (lang)=>I18N.apply(lang);
  document.addEventListener('DOMContentLoaded', ()=> {
    I18N.apply(I18N.current);
    const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();
  });
})();
