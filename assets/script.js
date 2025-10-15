/* ===== POWER LINK — SCRIPT propre & stable ===== */
document.addEventListener('DOMContentLoaded', () => {

  /* Footer year */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* Drawer mobile */
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.querySelector('.drawer');
  if (toggle && drawer) {
    const open = () => drawer.classList.add('open');
    const close = () => drawer.classList.remove('open');
    toggle.addEventListener('click', open);
    drawer.querySelector('.overlay')?.addEventListener('click', close);
    drawer.querySelector('.close-btn')?.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* i18n helper */
  const getLang = () => (window.i18n?.lang?.() || localStorage.getItem('lang') || 'en');
  const MESSAGES = {
    en:{sending:'Sending…',thanks:'✅ Thank you! Your message has been sent.',
        error_generic:'⚠️ Something went wrong. Please try again later.',
        network:'⚠️ Network error. Please try again.',
        v_required:'Please fill out this field.', v_email:'Please enter a valid email address.',
        v_min:n=>`Please enter at least ${n} characters.`},
    ar:{sending:'جارٍ الإرسال…',thanks:'✅ شكرًا لك! تم إرسال رسالتك.',
        error_generic:'⚠️ حدث خطأ ما. يُرجى المحاولة لاحقًا.',
        network:'⚠️ خطأ في الشبكة. يُرجى المحاولة مرة أخرى.',
        v_required:'يُرجى تعبئة هذه الخانة.', v_email:'يُرجى إدخال بريد إلكتروني صالح.',
        v_min:n=>`يُرجى إدخال ${n} أحرف على الأقل.`}
  };
  const tMsg = (key,...args)=>{const p=MESSAGES[getLang()]||MESSAGES.en; const v=p[key]; return typeof v==='function'?v(...args):v||key;};

  /* Contact form (Formspree) */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit');

  if (form && status) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      ['name','email','subject','message'].forEach(k => fd.set(k, (fd.get(k)||'').toString().trim()));

      status.style.display='block';
      status.textContent=tMsg('sending');
      submitBtn?.setAttribute('disabled','disabled');

      try{
        const resp = await fetch(form.action, {method:'POST', body:fd, headers:{Accept:'application/json'}});
        status.textContent = resp.ok ? tMsg('thanks') : tMsg('error_generic');
        if (resp.ok) form.reset();
      }catch{
        status.textContent=tMsg('network');
      }finally{
        submitBtn?.removeAttribute('disabled');
      }
    });
  }

  /* Transitions entre pages (uniforme) */
  document.querySelectorAll('a[href]').forEach(link=>{
    const href=link.getAttribute('href')||'';
    const external=/^https?:\/\//i.test(href) || /^(mailto:|tel:)/i.test(href) || link.target==='_blank' || link.hasAttribute('download');
    const anchor=href.startsWith('#');
    if (external || anchor || /\bexternal\b/i.test(link.rel) || link.dataset.noTransition==='true') return;
    link.addEventListener('click',e=>{
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(()=>{window.location.href=href;},280);
    });
  });

  /* Animation d’entrée (depuis le haut) */
  requestAnimationFrame(()=>document.body.classList.add('slide-in'));
});
