// js/i18n.js — robust build
(function () {
  function retriggerEnter() {
    const el =
      document.querySelector(".page-enter") ||
      document.querySelector("main") ||
      document.body;
    if (!el) return;
    el.classList.remove("page-enter");
    void el.offsetWidth;
    el.classList.add("page-enter");
  }

  const SUPPORTED = ["en", "fr", "ar"];
  const DEFAULT = localStorage.getItem("lang") || "en";
  const q = new URL(location.href).searchParams.get("lang");
  const START = SUPPORTED.includes(q || "") ? q : DEFAULT;

  async function loadDict(lang) {
    const r = await fetch(`i18n/${lang}.json`, { cache: "no-cache" });
    return r.json();
  }

  function applyRTL(lang) {
    const rtl = lang === "ar";
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }

  function translate(dict) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (dict[k] != null) el.textContent = dict[k];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const k = el.getAttribute("data-i18n-placeholder");
      if (dict[k] != null) el.setAttribute("placeholder", dict[k]);
    });
    if (dict["meta.title"]) document.title = dict["meta.title"];
    if (dict["meta.desc"]) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
      m.content = dict["meta.desc"];
    }
  }

  function activateFlag(lang) {
    document.querySelectorAll(".lang-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === lang);
      b.setAttribute("aria-current", b.dataset.lang === lang ? "true" : "false");
    });
  }

  async function setLang(lang, push = true) {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem("lang", lang);
    applyRTL(lang);
    const d = await loadDict(lang);
    translate(d);
    activateFlag(lang);
    retriggerEnter();
    if (push) {
      const u = new URL(location.href);
      u.searchParams.set("lang", lang);
      history.replaceState({}, "", u);
    }
  }

  window.setLanguage = setLang; // optionnel si tu veux l'appeler en inline

  function bindUI() {
    const drawer = document.querySelector(".drawer");

    document.addEventListener("click", (e) => {
      const openBtn = e.target.closest(".hamburger, .menu-toggle");
      if (openBtn) { drawer?.classList.add("open"); }

      const closeBtn = e.target.closest(".drawer-close, .overlay");
      if (closeBtn) { drawer?.classList.remove("open"); }

      const flagBtn = e.target.closest(".lang-btn");
      if (flagBtn) { setLang(flagBtn.dataset.lang); }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") drawer?.classList.remove("open");
    });

    const form = document.getElementById("contact-form");
    if (form) {
      form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const msg = document.getElementById("contact-success");
        await new Promise((r) => setTimeout(r, 300));
        if (msg) msg.hidden = false;
        form.reset();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      bindUI(); setLang(START, false);
    }, { once: true });
  } else {
    bindUI(); setLang(START, false);
  }
})();
