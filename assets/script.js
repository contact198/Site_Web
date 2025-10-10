/* ===== POWER LINK — SCRIPT ===== */
document.addEventListener('DOMContentLoaded', () => {
  /* === Année automatique dans le footer === */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* === Drawer menu (mobile) === */
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

  /* === Formulaire de contact (Formspree) — validation stricte === */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit');

  if (form && status) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Trim des champs
      const fd = new FormData(form);
      ['name','email','subject','message'].forEach(k => {
        const v = (fd.get(k) || '').toString().trim();
        fd.set(k, v);
      });
      for (const [k,v] of fd.entries()) {
        const el = form.querySelector(`[name="${k}"]`);
        if (el && typeof el.value === 'string') el.value = v;
      }

      // Validation native
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Envoi
      status.style.display = 'block';
      status.textContent = 'Sending...';
      submitBtn?.setAttribute('disabled','disabled');

      try {
        const resp = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (resp.ok) {
          status.textContent = '✅ Thank you! Your message has been sent. Our team will get back to you as soon as possible.';
          form.reset();
        } else {
          let msg = '⚠️ Something went wrong. Please try again later.';
          try {
            const j = await resp.json();
            if (j && j.errors) msg = j.errors.map(e => e.message).join(', ');
          } catch {}
          status.textContent = msg;
        }
      } catch {
        status.textContent = '⚠️ Network error. Please try again.';
      } finally {
        submitBtn?.removeAttribute('disabled');
      }
    });
  }

  /* === Transition entre les pages (effet Apple) — version sûre === */
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    const isAnchor   = href.startsWith('#');
    const isAbsolute = /^https?:\/\//i.test(href);
    const isMailTel  = /^(mailto:|tel:)/i.test(href);
    const isDownload = link.hasAttribute('download');
    const newWindow  = link.target === '_blank';
    const isExternal = /\bexternal\b/i.test(link.rel);
    const noFx       = link.dataset.noTransition === 'true';

    if (isAnchor || isAbsolute || isMailTel || isDownload || newWindow || isExternal || noFx) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = href; }, 300);
    });
  });

  /* === Custom English validation messages === */
  document.querySelectorAll('input[required], textarea[required]').forEach(input => {
    input.addEventListener('invalid', () => {
      if (input.validity.valueMissing) {
        input.setCustomValidity('Please fill out this field.');
      } else if (input.validity.typeMismatch && input.type === 'email') {
        input.setCustomValidity('Please enter a valid email address.');
      } else if (input.validity.tooShort) {
        input.setCustomValidity(`Please enter at least ${input.minLength} characters.`);
      } else {
        input.setCustomValidity('');
      }
    });
    input.addEventListener('input', () => input.setCustomValidity(''));
  });
});
