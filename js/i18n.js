/* ===== POWER LINK — i18n + UI + Form + Page Transitions (ViewTransitions) ===== */
(function () {
  // Anti-preload : retire la classe dès que le JS est chargé
  try { document.documentElement.classList.remove('preload'); } catch {}

  /* ---------- Helpers (root + transition enter) ---------- */
  function getRoot() {
    const el = document.querySelector(".page-root") || document.querySelector("main") || document.body;
    el.classList.add("page-root");
    return el;
  }

  function retriggerEnter() {
    const root = getRoot();
    root.classList.remove("page-leave");
    root.classList.remove("page-enter");
    void root.offsetWidth; // reflow
    root.classList.add("page-enter");
  }

  /* ---------- I18N ---------- */
  const SUPPORTED = ["en", "fr", "ar"];
  const DEFAULT = localStorage.getItem("lang") || "en";
  const queryLang = new URL(location.href).searchParams.get("lang");
  const START = SUPPORTED.includes(queryLang || "") ? queryLang : DEFAULT;

  async function loadDict(lang) {
    const res = await fetch("/i18n/" + lang + ".json", { cache: "no-cache" });
    return res.json();
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
      if (!m) {
        m = document.createElement("meta");
        m.name = "description";
        document.head.appendChild(m);
      }
      m.content = dict["meta.desc"];
    }
  }

  function activateFlag(lang) {
    document.querySelectorAll(".lang-btn").forEach((b) => {
      const active = b.dataset.lang === lang;
      b.classList.toggle("active", active);
      b.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  async function setLang(lang, push = true) {
    if (!SUPPORTED.includes(lang)) lang = "en";
    localStorage.setItem("lang", lang);
    applyRTL(lang);
    const dict = await loadDict(lang);
    translate(dict);
    activateFlag(lang);
    retriggerEnter(); // rejoue l'entrée après traduction
    if (push) {
      const u = new URL(location.href);
      u.searchParams.set("lang", lang);
      history.replaceState({}, "", u);
    }
  }

  // Expose pour éventuels handlers inline
  window.setLanguage = setLang;

  /* ---------- UI (drawer, flags, esc) ---------- */
  function bindUI() {
    const drawer = document.querySelector(".drawer");

    document.addEventListener(
      "click",
      (e) => {
        const openBtn = e.target.closest(".hamburger, .menu-toggle");
        const closeBtn = e.target.closest(".drawer-close, .overlay");
        const flag = e.target.closest(".lang-btn");

        if (openBtn) drawer?.classList.add("open");
        if (closeBtn) drawer?.classList.remove("open");
        if (flag) {
          e.preventDefault();
          e.stopPropagation();
          setLang(flag.dataset.lang);
        }
      },
      true
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") drawer?.classList.remove("open");
    });
  }

  /* ---------- Page transitions (View Transitions + fallback) ---------- */
  function bindPageTransitions() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let navigating = false;

    document.addEventListener("click", (e) => {
      if (navigating) return;
      if (e.target.closest(".lang-btn") || e.target.closest("[data-no-transition]")) return;

      const a = e.target.closest("a[href]");
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url = new URL(a.href, location.href);
      const sameOrigin = url.origin === location.origin;
      const sameTab = a.target !== "_blank" && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
      if (!sameOrigin || !sameTab) return;

      e.preventDefault();
      navigating = true;

      const goto = () => (location.href = url.href);

      // ✅ Moderne : View Transitions API (supprime le flash blanc)
      if (document.startViewTransition) {
        document.startViewTransition(() => goto());
        return;
      }

      // ♻️ Fallback : anim CSS existante
      const root = getRoot();
      root.classList.remove("page-enter");
      void root.offsetWidth;
      root.classList.add("page-leave");

      const onEnd = (ev) => {
        if (ev.target !== root) return;
        root.removeEventListener("animationend", onEnd);
        goto();
      };
      const fallbackTimer = setTimeout(goto, 1200);
      root.addEventListener(
        "animationend",
        (ev) => {
          clearTimeout(fallbackTimer);
          onEnd(ev);
        },
        { once: true }
      );
    }, true);
  }

  /* ---------- Contact form (Formspree) ---------- */
  function bindContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = document.getElementById("contact-success");

      try {
        const resp = await fetch(form.action, {
          method: form.method || "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (resp.ok) {
          if (msg) msg.hidden = false;
          form.reset();
        } else {
          let details = null;
          try { details = await resp.json(); } catch {}
          console.warn("Formspree error:", resp.status, details);
          alert("Une erreur est survenue. Merci de réessayer.");
        }
      } catch (err) {
        console.error(err);
        alert("Réseau indisponible. Vérifiez votre connexion puis réessayez.");
      }
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    bindUI();
    bindPageTransitions();
    bindContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        boot();
        setLang(START, false); // charge la langue et joue l'entrée
      },
      { once: true }
    );
  } else {
    boot();
    setLang(START, false);
  }
})();
