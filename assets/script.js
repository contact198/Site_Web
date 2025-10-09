

document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('mobile-nav-select');
  if (sel) {
    const path = location.pathname.split('/').pop() || 'index.html';
    if ([...sel.options].some(o => o.value === path)) sel.value = path;
    sel.addEventListener('change', () => { if (sel.value) location.href = sel.value; });
  }
});
