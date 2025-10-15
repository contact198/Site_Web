/* ===== POWER LINK — SCRIPT (multilingue + transitions + drawer fiable) ===== */
document.addEventListener('DOMContentLoaded', () => {
  /* === Année automatique === */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* === Drawer menu (mobile) === */
  const toggle  = document.querySelector('.menu-toggle');
  const drawer  = document.querySelector('.drawer');
  const overlay = drawer?.querySelector('.overlay');
  const panel   = drawer?.querySelector('.panel');
  const closeBtn= drawer?.querySelector('.close-btn');

  if (toggle && drawer && overlay && panel) {
    const lockScroll = (lock) => {
      if (lock) {
        const top = -window.scrollY;
        document.documentElement.style.top = `${top}px`;
        document.documentElement.style.position = 'fixed';
        document.documentElement.style.width = '100%';
        document.body.classList.add('drawer-open');
      } else {
        const top = parseInt(document.documentElement.style.top || '0', 10);
        document.documentElement.style.position = '';
        document.documentElement.style.top = '';
        document.documentElement.style.width = '';
        document.body.classList.remove('drawer-open');
        window.scrollTo(0, -top);
      }
    };

    const open = () => {
      drawer.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      lockScroll(true);
    };
    const close = () => {
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      lockScroll(false);
    };

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (drawer.classList.contains('open')) close(); else open();
    }, { passive: true });

    overlay.addEventListener('click', close, { passive: true });
    closeBtn?.addEventListener('click', close, { passive: true });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    panel.addEventListener('click', (e) => e.stopPropagation());
  }

  /* === Transitions entre pages === */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href]').forEach(link => {
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
      if (reduceMotion) return;
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = href; }, 250);
    });
  });

  /* === Animation d’entrée === */
  requestAnimationFrame(() => document.body.classList.add('slide-in'));

  /* === Retour via bfcache (évite flash) === */
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      document.body.classList.remove('fade-out');
      document.body.classList.add('slide-in');
    }
  });
});
