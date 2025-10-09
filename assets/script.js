document.addEventListener('DOMContentLoaded',()=>{
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

  const t=document.querySelector('.menu-toggle');
  const d=document.querySelector('.drawer');
  if(t && d){
    const open=()=>d.classList.add('open');
    const close=()=>d.classList.remove('open');
    t.addEventListener('click',open);
    d.querySelector('.overlay').addEventListener('click',close);
    const cb=d.querySelector('.close-btn'); if(cb) cb.addEventListener('click',close);
    document.addEventListener('keydown',e=>{if(e.key==='Escape') close();});
  }

  const form=document.getElementById('contact-form');
  const status=document.getElementById('form-status');
  if(form && status){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      status.style.display='block';
      status.textContent='Sending...';
      try{
        const data=new FormData(form);
        const resp=await fetch(form.action,{method:'POST',body:data,headers:{'Accept':'application/json'}});
        if(resp.ok){
          status.textContent='✅ Thank you! Your message has been sent successfully. Our team will get back to you as soon as possible.';
          form.reset();
        }else{
          let msg='⚠️ Something went wrong. Please try again later.';
          try{const j=await resp.json(); if(j && j.errors){msg=j.errors.map(e=>e.message).join(', ');} }catch{}
          status.textContent=msg;
        }
      }catch(err){
        status.textContent='⚠️ Network error. Please try again later.';
      }
    });
  }
});