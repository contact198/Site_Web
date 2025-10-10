
/* ===== POWER LINK — SCRIPT ===== */
document.addEventListener('DOMContentLoaded', () => {
  /* === Year in footer === */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* === Drawer (mobile menu) === */
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.querySelector('.drawer');
  const overlay = drawer ? drawer.querySelector('.overlay') : null;
  const closeBtn = drawer ? drawer.querySelector('.close-btn') : null;

  const openDrawer = () => {
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
  };
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
  };

  if (toggle) toggle.addEventListener('click', openDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Close when a link in the panel is clicked
  if (drawer) {
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
  }
});
