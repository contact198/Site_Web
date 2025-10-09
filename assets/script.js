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

  /* === Formulaire de contact (Formspree) === */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      status.style.display = 'block';
      status.textContent = 'Sending...';
      try {
        const data = new FormData(form);
        const resp = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (resp.ok) {
          status.textContent = '✅ Thank you! Your message has been sent successfully. Our team will get back to you as soon as possible.';
          form.reset();
        } else {
          let msg = '⚠️ Something went wrong. Please try again later.';
          try {
            const j = await resp.json();
            if (j && j.errors) msg = j.errors.map(e => e.message).join(', ');
          } catch { }
          status.textContent = msg;
        }
      } catch {
        status.textContent = '⚠️ Network error. Please try again later.';
      }
    });
  }

  /* === Transition entre les pages (effet Apple) === */
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    const url = link.getAttribute('href');
    // on ignore les liens externes ou ancres (#)
    if (!url.startsWith('#') && !url.startsWith('http')) {
      link.addEventListener('click', e => {
        e.preventDefault();
        document.body.classList.add('fade-out');
        setTimeout(() => {
          window.location.href = url;
        }, 300); // durée du fondu avant changement de page
      });
    }
  });

});
