
// Basic drawer toggle + active nav sync
document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.querySelector('.drawer');
  const overlay = drawer?.querySelector('.overlay');
  const panel = drawer?.querySelector('.panel');
  const menuBtn = document.querySelector('.menu-toggle');
  const closeBtn = drawer?.querySelector('.close-btn');

  const open = () => drawer.classList.add('open');
  const close = () => drawer.classList.remove('open');

  menuBtn && menuBtn.addEventListener('click', open);
  overlay && overlay.addEventListener('click', close);
  closeBtn && closeBtn.addEventListener('click', close);

  // Mark current page in nav
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a, .drawer .panel a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
});
