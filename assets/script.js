/* ===== POWER LINK — SCRIPT (multilingue + transitions + mobile fix) ===== */
document.addEventListener('DOMContentLoaded', () => {

  /* === Année automatique dans le footer === */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* === Drawer menu (mobile) === */
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.querySelector('.drawer');
  const overlay = drawer?.querySelector('.overlay');
  const closeBtn = drawer?.querySelector('.close-btn');
  if (toggle && drawer) {
    const open = () => {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    };
    toggle.addEventListener('click', open);
    overlay?.addEventListener('click', close);
    closeBtn?.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* === Transitions entre pages === */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href') || '';
    const isAnchor = href.startsWith('#');
    const isAbsolute = /^https?:\/\//i.test(href);
    const isMailTel = /^(mailto:|tel:)/i.test(href);
    const isDownload = link.hasAttribute('download');
    const newWindow = link.target === '_blank';
    const isExternal = /\bexternal\b/i.test(link.rel);
    const noFx = link.dataset.noTransition === 'true';
    if (isAnchor || isAbsolute || isMailTel || isDownload || newWindow || isExternal || noFx) return;

    link.addEventListener('click', e => {
      if (reduceMotion) return;
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = href; }, 250);
    });
  });

  /* === Animation d’entrée === */
  requestAnimationFrame(() => {
    document.body.classList.add('slide-in');
  });

  /* === Retour via historique (bfcache) === */
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      document.body.classList.remove('fade-out');
      document.body.classList.add('slide-in');
    }
  });
});
