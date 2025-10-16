
/* ===== i18n: EN / AR / FR ===== */
const I18N = {
  en: {
    _meta: { dir: 'ltr', title: 'Power Link' },
    nav: {
      home: 'Home',
      about: 'About us',
      services: 'Services',
      team: 'Team',
      contact: 'Contact',
      drawer: 'Main menu'
    },
    pages: {
      home:   { title: 'Power Link', lead: 'Premium energy consulting & services.' },
      about:  { title: 'About us', lead: 'Who we are and how we work.' },
      services:{ title: 'Services', lead: 'What we deliver, from strategy to execution.' },
      team:   { title: 'Our team', lead: 'Experienced professionals at your service.' }
    },
    contact: {
      title: 'Contact us',
      lead: 'Use the form below and our team will get back to you as soon as possible.',
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
      send: 'Send message',
      placeholder_name: 'Your name',
      placeholder_email: 'you@example.com',
      placeholder_subject: 'Subject',
      placeholder_message: 'How can we help?'
    },
    footer: { rights: 'Power Link — All rights reserved.' }
  },
  ar: {
    _meta: { dir: 'rtl', title: 'باور لينك' },
    nav: {
      home: 'الرئيسية',
      about: 'من نحن',
      services: 'الخدمات',
      team: 'الفريق',
      contact: 'اتصال',
      drawer: 'القائمة الرئيسية'
    },
    pages: {
      home:   { title: 'باور لينك', lead: 'استشارات وخدمات طاقة فاخرة.' },
      about:  { title: 'من نحن', lead: 'من نحن وكيف نعمل.' },
      services:{ title: 'الخدمات', lead: 'من الاستراتيجية إلى التنفيذ.' },
      team:   { title: 'الفريق', lead: 'محترفون ذوو خبرة في خدمتك.' }
    },
    contact: {
      title: 'اتصل بنا',
      lead: 'استخدم النموذج أدناه وسنتواصل معك في أقرب وقت ممكن.',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      subject: 'الموضوع',
      message: 'الرسالة',
      send: 'إرسال الرسالة',
      placeholder_name: 'اسمك',
      placeholder_email: 'you@example.com',
      placeholder_subject: 'الموضوع',
      placeholder_message: 'كيف يمكننا مساعدتك؟'
    },
    footer: { rights: 'باور لينك — جميع الحقوق محفوظة.' }
  },
  fr: {
    _meta: { dir: 'ltr', title: 'Power Link' },
    nav: {
      home: 'Accueil',
      about: 'Présentation',
      services: 'Services',
      team: 'Équipe',
      contact: 'Contact',
      drawer: 'Menu principal'
    },
    pages: {
      home:   { title: 'Power Link', lead: 'Conseil & services énergie haut de gamme.' },
      about:  { title: 'Présentation', lead: 'Qui nous sommes et notre approche.' },
      services:{ title: 'Services', lead: 'De la stratégie à l’exécution.' },
      team:   { title: 'Équipe', lead: 'Des experts à votre service.' }
    },
    contact: {
      title: 'Contactez-nous',
      lead: "Utilisez le formulaire ci-dessous et notre équipe vous répondra rapidement.",
      name: 'Nom',
      email: 'Email',
      subject: 'Objet',
      message: 'Message',
      send: 'Envoyer',
      placeholder_name: 'Votre nom',
      placeholder_email: 'vous@exemple.com',
      placeholder_subject: 'Objet',
      placeholder_message: 'Comment pouvons-nous aider ?'
    },
    footer: { rights: 'Power Link — Tous droits réservés.' }
  }
};

/* Helper: deep getter "a.b.c" */
function i18nGet(dict, path){
  return path.split('.').reduce((o,k)=> (o && k in o ? o[k] : null), dict);
}

/* Apply language to DOM */
function applyLanguage(lang){
  const dict = I18N[lang] || I18N.en;

  document.documentElement.lang = lang;
  document.documentElement.dir  = dict._meta?.dir || 'ltr';
  if (dict._meta?.title) document.title = dict._meta.title;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = i18nGet(dict, key);
    if (val == null) return;
    if ('placeholder' in el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      el.placeholder = val;
    } else {
      el.textContent = val;
    }
  });

  // Active state on flag buttons
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
}

window.setLanguage = function(lang){
  localStorage.setItem('lang', lang);
  applyLanguage(lang);
};

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('lang');
  const browser = (navigator.language || 'en').slice(0,2).toLowerCase();
  const initial = saved && I18N[saved] ? saved : (I18N[browser] ? browser : 'en');
  applyLanguage(initial);
});
