
function qs(s,root=document){return root.querySelector(s)}
function qsa(s,root=document){return [...root.querySelectorAll(s)]}

document.addEventListener("DOMContentLoaded", ()=>{
  const drawer = qs(".drawer");
  const openBtn = qs(".menu-toggle");
  const closeBtn = qs(".drawer .close");

  if(openBtn && drawer){
    openBtn.addEventListener("click", ()=> drawer.classList.add("open"));
  }
  if(closeBtn){
    closeBtn.addEventListener("click", ()=> drawer.classList.remove("open"));
  }
  qs(".drawer .overlay").addEventListener("click", ()=> drawer.classList.remove("open"));
});
