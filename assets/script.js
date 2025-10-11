/* ===== POWER LINK — SCRIPT (multilingue) ===== */
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

  /* ====== i18n helpers (utilise window.i18n si dispo) ====== */
  const getLang = () => (window.i18n?.lang?.() || localStorage.getItem('lang') || 'en');

  const MESSAGES = {
    en: {
      sending: 'Sending…',
      thanks: '✅ Thank you! Your message has been sent. Our team will get back to you as soon as possible.',
      error_generic: '⚠️ Something went wrong. Please try again later.',
      network: '⚠️ Network error. Please try again.',
      v_required: 'Please fill out this field.',
      v_email: 'Please enter a valid email address.',
      v_min: (n) => `Please enter at least ${n} characters.`
    },
    ar: {
      sending: 'جارٍ الإرسال…',
      thanks: '✅ شكرًا لك! تم إرسال رسالتك. سيتواصل فريقنا معك في أقرب وقت ممكن.',
      error_generic: '⚠️ حدث خطأ ما. يُرجى المحاولة لاحقًا.',
      network: '⚠️ خطأ في الشبكة. يُرجى المحاولة مرة أخرى.',
      v_required: 'يُرجى تعبئة هذه الخانة.',
      v_email: 'يُرجى إدخال بريد إلكتروني صالح.',
      v_min: (n) => `يُرجى إدخال ${n} أحرف على الأقل.`
    }
  };

  const tMsg = (key, ...args) => {
    const lang = getLang();
    const pack = MESSAGES[lang] || MESSAGES.en;
    const val = pack[key];
    return (typeof val === 'function') ? val(...args) : (val || key);
  };

  /* === Formulaire de contact (Formspree) — envoi + messages traduits === */
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

      // Validation native avec messages localisés
      const inputs = form.querySelectorAll('input[required], textarea[required]');
      inputs.forEach(input => input.setCustomValidity('')); // reset avant check
      let invalidFound = false;
      inputs.forEach(input => {
        if (!input.checkValidity()) {
          if (input.validity.valueMissing) {
            input.setCustomValidity(tMsg('v_required'));
          } else if (input.validity.typeMismatch && input.type === 'email') {
            input.setCustomValidity(tMsg('v_email'));
          } else if (input.validity.tooShort) {
            input.setCustomValidity(tMsg('v_min', input.minLength || 2));
          }
          invalidFound = true;
        }
      });
      if (invalidFound) {
        form.reportValidity();
        return;
      }

      // Envoi
      status.style.display = 'block';
      status.textContent = tMsg('sending');
      submitBtn?.setAttribute('disabled','disabled');

      try {
        const resp = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (resp.ok) {
          status.textContent = tMsg('thanks');
          form.reset();
        } else {
          let msg = tMsg('error_generic');
          try {
            const j = await resp.json();
            if (j && j.errors) {
              // Si Formspree renvoie des messages anglais, on garde notre message générique localisé
              msg = tMsg('error_generic');
            }
          } catch {}
          status.textContent = msg;
        }
      } catch {
        status.textContent = tMsg('network');
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

  /* === Messages de validation (runtime) si le navigateur ré-évalue après input === */
  document.querySelectorAll('input[required], textarea[required]').forEach(input => {
    input.addEventListener('invalid', () => {
      if (input.validity.valueMissing) {
        input.setCustomValidity(tMsg('v_required'));
      } else if (input.validity.typeMismatch && input.type === 'email') {
        input.setCustomValidity(tMsg('v_email'));
      } else if (input.validity.tooShort) {
        input.setCustomValidity(tMsg('v_min', input.minLength || 2));
      } else {
        input.setCustomValidity('');
      }
    });
    input.addEventListener('input', () => input.setCustomValidity(''));
  });

  /* === Animation d’entrée de la page (ajout) === */
  requestAnimationFrame(() => {
    document.body.classList.add('slide-in');
  });
});
