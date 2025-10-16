
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
  const overlay = qs(".drawer .overlay");
  if(overlay){
    overlay.addEventListener("click", ()=> drawer.classList.remove("open"));
  }

  // Contact form ajax (Formspree)
  const form = qs("#contact-form");
  const status = qs("#form-status");
  if(form){
    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const data = new FormData(form);
      try{
        const res = await fetch(form.action, { method:"POST", body:data, headers: { "Accept":"application/json" } });
        if(res.ok){
          status.className = "form-status success";
          status.textContent = document.querySelector('[data-i18n="sent_ok"]').textContent || "Message sent.";
          status.style.display = "block";
          form.reset();
        } else {
          throw new Error("Network error");
        }
      }catch(err){
        status.className = "form-status error";
        status.textContent = document.querySelector('[data-i18n="sent_err"]').textContent || "Error. Try again.";
        status.style.display = "block";
      }
    });
  }
});
