document.addEventListener('DOMContentLoaded',()=>{
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
});

// Mobile drawer controls
document.addEventListener('DOMContentLoaded', ()=>{
  const t = document.querySelector('.menu-toggle');
  const d = document.querySelector('.drawer');
  if(t && d){
    const open = ()=> d.classList.add('open');
    const close = ()=> d.classList.remove('open');
    t.addEventListener('click', open);
    d.querySelector('.overlay').addEventListener('click', close);
    d.querySelector('.close-btn').addEventListener('click', close);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
  }
});

