
// Tiny i18n helper
const messages = {
  en: {
    menu: "Main Menu",
    home: "Home",
    about: "About Us",
    services: "Services",
    team: "Team",
    contact: "Contact",
    hero_title: "Power Link — clean energy that looks good and performs even better.",
    hero_lead: "Photovoltaic systems and smart EV charging solutions. From consulting and design to installation and long-term maintenance.",
    cta_primary: "Discover Power Link",
    cta_secondary: "Get a quote",
    about_title: "About Power Link",
    contact_title: "Contact us",
    contact_lead: "Use the form below and our team will get back to you as soon as possible."
  },
  fr: {
    menu: "Menu principal",
    home: "Accueil",
    about: "À propos",
    services: "Services",
    team: "Équipe",
    contact: "Contact",
    hero_title: "Power Link — une énergie propre élégante et très performante.",
    hero_lead: "Systèmes photovoltaïques et bornes de recharge intelligentes. Du conseil et design à l'installation et la maintenance longue durée.",
    cta_primary: "Découvrir Power Link",
    cta_secondary: "Obtenir un devis",
    about_title: "À propos de Power Link",
    contact_title: "Contactez‑nous",
    contact_lead: "Remplissez le formulaire ci‑dessous, notre équipe vous répondra rapidement."
  },
  ar: {
    menu: "القائمة الرئيسية",
    home: "الرئيسية",
    about: "من نحن",
    services: "الخدمات",
    team: "الفريق",
    contact: "اتصل بنا",
    hero_title: "باور لينك — طاقة نظيفة بمظهر أنيق وأداء أفضل.",
    hero_lead: "أنظمة كهروضوئية وشحن مركبات ذكية. من الاستشارة والتصميم إلى التركيب والصيانة طويلة الأمد.",
    cta_primary: "اكتشف باور لينك",
    cta_secondary: "احصل على عرض سعر",
    about_title: "حول باور لينك",
    contact_title: "تواصل معنا",
    contact_lead: "استخدم النموذج أدناه وسنتواصل معك في أقرب وقت."
  }
};

const defaultLang = localStorage.getItem("lang") || "en";

function applyLang(lang){
  const dict = messages[lang] || messages.en;
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if(dict[key]) el.textContent = dict[key];
  });
  // nav links
  document.querySelectorAll("[data-i18n-href]").forEach(a=>{
    const base = a.getAttribute("data-i18n-href");
    a.href = base + "?lang=" + lang;
  });
  // flag active
  document.querySelectorAll(".lang-switch button").forEach(b=>{
    b.classList.toggle("active", b.dataset.lang === lang);
  });
  localStorage.setItem("lang", lang);
}

function initI18n(){
  const params = new URLSearchParams(location.search);
  const requested = params.get("lang");
  const lang = requested || localStorage.getItem("lang") || defaultLang;
  applyLang(lang);

  document.querySelectorAll(".lang-switch button").forEach(btn=>{
    btn.addEventListener("click", ()=> applyLang(btn.dataset.lang));
  });
}

document.addEventListener("DOMContentLoaded", initI18n);
