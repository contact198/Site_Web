/* ===== POWER LINK — SCRIPT (multilingue + transitions premium) ===== */
document.addEventListener('DOMContentLoaded', () => {
  /* === Année automatique === */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* === Menu drawer (mobile) === */
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.querySelector('.drawer');
  if (toggle && drawer) {
    const open = () => drawer.classList.add('open');
    const close = () => drawer.classList.remove('open');
    toggle.addEventListener('click', open);
    drawer.addEventListener('click', e => { if (e.target === drawer) close(); });
  }

  /* === i18n helpers === */
  const getLang = () => (window.i18n?.lang?.() || localStorage.getItem('lang') || 'en');
  const MESSAGES = {
    en: { sending:'Sending…', thanks:'✅ Thank you! Message sent.', error_generic:'⚠️ Error. Try again.' },
    ar: { sending:'جارٍ الإرسال…', thanks:'✅ شكرًا لك! تم الإرسال.', error_generic:'⚠️ حدث خطأ ما.' }
  };
  const tMsg = (key)=> MESSAGES[getLang()]?.[key] || key;

  /* === Formulaire === */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit');
  if (form && status) {
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      status.style.display='block';
      status.textContent=tMsg('sending');
      submitBtn?.setAttribute('disabled','disabled');
      try {
        const resp = await fetch(form.action,{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}});
        status.textContent = resp.ok ? tMsg('thanks') : tMsg('error_generic');
        if(resp.ok) form.reset();
      } catch {
        status.textContent = tMsg('error_generic');
      } finally { submitBtn?.removeAttribute('disabled'); }
    });
  }

  /* === Premium overlay transitions === */
  let overlay=document.querySelector('.page-overlay');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.className='page-overlay';
    document.body.prepend(overlay);
  }

  requestAnimationFrame(()=>{ document.body.classList.add('body-ready'); });

  const navLinks=document.querySelectorAll('a[href]');
  navLinks.forEach(link=>{
    const href=link.getAttribute('href')||'';
    const external=/^(#|mailto:|tel:|https?:)/i.test(href);
    if(external||link.target==='_blank'||link.hasAttribute('download'))return;
    link.addEventListener('click',e=>{
      e.preventDefault();
      document.body.classList.remove('body-ready');
      document.body.classList.add('body-cover');
      const go=()=>{ window.location.href=href; };
      const onEnd=(evt)=>{
        if(evt.target===overlay){ overlay.removeEventListener('animationend',onEnd); go(); }
      };
      overlay.addEventListener('animationend',onEnd);
      setTimeout(go,450);
    });
  });

  window.addEventListener('pageshow',e=>{
    if(e.persisted){ document.body.classList.remove('body-cover'); document.body.classList.add('body-ready'); }
  });

  const isHome=document.body?.id==='home'||document.body?.dataset?.route==='home';
  if(isHome){ requestAnimationFrame(()=>{ document.body.classList.add('slide-in'); }); }
});
