
// ===== Simple i18n =====
const MESSAGES = {
  fr: {
    menu: {home:"Accueil", about:"À propos", services:"Services", team:"Équipe", contact:"Contact", title:"MENU"},
    hero_h1:"Power Link — une énergie propre élégante et très performante.",
    hero_p:"Systèmes photovoltaïques et bornes de recharge intelligentes. Du conseil et design à l'installation et la maintenance longue durée.",
    cta1:"Découvrir Power Link", cta2:"Obtenir un devis",
    contact_title:"Contactez-nous",
    name:"Nom", email:"E‑mail", subject:"Sujet", message:"Message", send:"Envoyer",
    sent_ok:"✅ Merci ! Votre message a bien été envoyé.<br>Nos équipes vous répondront dès que possible.",
    sent_err:"❌ Une erreur est survenue. Merci de réessayer."
  },
  en: {
    menu: {home:"Home", about:"About us", services:"Services", team:"Team", contact:"Contact", title:"MAIN MENU"},
    hero_h1:"Power Link — clean energy that looks good and performs even better.",
    hero_p:"Photovoltaic systems and smart EV charging. From consulting and design to installation and long‑term maintenance.",
    cta1:"Discover Power Link", cta2:"Get a quote",
    contact_title:"Contact us",
    name:"Name", email:"Email", subject:"Subject", message:"Message", send:"Send",
    sent_ok:"✅ Thanks! Your message has been sent.<br>Our team will get back to you as soon as possible.",
    sent_err:"❌ Something went wrong. Please try again."
  },
  ar: {
    menu: {home:"الرئيسية", about:"من نحن", services:"الخدمات", team:"الفريق", contact:"اتصل بنا", title:"القائمة الرئيسية"},
    hero_h1:"باور لينك — طاقة نظيفة أنيقة وعالية الأداء.",
    hero_p:"أنظمة كهروضوئية ومحطات شحن ذكية. من الاستشارة والتصميم إلى التركيب والصيانة طويلة الأجل.",
    cta1:"اكتشف باور لينك", cta2:"احصل على عرض",
    contact_title:"اتصل بنا",
    name:"الاسم", email:"البريد الإلكتروني", subject:"الموضوع", message:"الرسالة", send:"إرسال",
    sent_ok:"✅ شكرًا! تم إرسال رسالتك بنجاح.<br>سنتواصل معك في أقرب وقت ممكن.",
    sent_err:"❌ حدث خطأ، يرجى المحاولة مرة أخرى."
  }
};

const $ = (s,ctx=document)=>ctx.querySelector(s);
const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));

function setDir(lang){
  document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";
}

function applyLang(lang){
  const t = MESSAGES[lang] || MESSAGES.fr;
  setDir(lang);
  // Nav
  $$(".nav a[data-i18n=home]").forEach(n=>n.textContent=t.menu.home);
  $$(".nav a[data-i18n=about]").forEach(n=>n.textContent=t.menu.about);
  $$(".nav a[data-i18n=services]").forEach(n=>n.textContent=t.menu.services);
  $$(".nav a[data-i18n=team]").forEach(n=>n.textContent=t.menu.team);
  $$(".nav a[data-i18n=contact]").forEach(n=>n.textContent=t.menu.contact);
  // Hero
  const h1 = $("#hero-h1"); if(h1) h1.textContent = t.hero_h1;
  const hp = $("#hero-p"); if(hp) hp.textContent = t.hero_p;
  $("#cta1") && ($("#cta1").textContent = t.cta1);
  $("#cta2") && ($("#cta2").textContent = t.cta2);
  // Contact form
  $("#contact-title") && ($("#contact-title").textContent = t.contact_title);
  $("label[for=name] .i18n") && ($("label[for=name] .i18n").textContent = t.name);
  $("label[for=email] .i18n") && ($("label[for=email] .i18n").textContent = t.email);
  $("label[for=subject] .i18n") && ($("label[for=subject] .i18n").textContent = t.subject);
  $("label[for=message] .i18n") && ($("label[for=message] .i18n").textContent = t.message);
  $("#send-btn") && ($("#send-btn").textContent = t.send);
  // Drawer title
  $("#drawer-title") && ($("#drawer-title").textContent = t.menu.title);

  // Active ring
  $$(".lang button").forEach(b=>b.classList.toggle("active", b.dataset.lang===lang));
}

function chooseLang(lang){
  localStorage.setItem("lang", lang);
  applyLang(lang);
}

document.addEventListener("DOMContentLoaded", () => {
  // Default language: FR (as requested)
  const saved = localStorage.getItem("lang") || "fr";
  applyLang(saved);

  // Flag clicks
  $$(".lang button").forEach(btn=>btn.addEventListener("click",()=>chooseLang(btn.dataset.lang)));

  // Burger / drawer
  const burger = $(".burger");
  const drawer = $(".drawer");
  if(burger && drawer){
    burger.addEventListener("click", ()=> drawer.classList.add("open"));
    $(".drawer .overlay").addEventListener("click", ()=> drawer.classList.remove("open"));
    $(".drawer .close").addEventListener("click", ()=> drawer.classList.remove("open"));
  }

  // Contact form submit
  const form = $("#contact-form");
  const status = $("#form-status");
  if(form){
    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const lang = localStorage.getItem("lang") || "fr";
      try{
        const res = await fetch(form.action || "#", {method:"POST", body:new FormData(form)});
        const ok = (res.ok || res.status===0); // status 0 for demo
        status.className = "form-status show " + (ok ? "success":"error");
        status.innerHTML = ok ? MESSAGES[lang].sent_ok : MESSAGES[lang].sent_err;
        if(ok) form.reset();
      }catch(err){
        status.className = "form-status show error";
        status.textContent = (MESSAGES[saved]||MESSAGES.fr).sent_err;
      }
    });
  }
});
