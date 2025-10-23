/* ===== POWER LINK — i18n + UI + Form (premium transitions, scoped) ===== */
(function () {
  /* ---------- Page-root helpers ---------- */
  function getPageRoot() {
    // Privilégie <main>; fallback body
    const main = document.querySelector("main");
    if (main && !main.classList.contains("page-root")) {
      main.classList.add("page-root");
    }
    return main || document.body;
  }

  function retriggerEnter() {
    const root =
      document.querySelector(".page-root") ||
      document.querySelector("main") ||
      document.body;
    if (!root) return;
    root.classList.remove("page-enter");
    void root.offsetWidth; // force reflow
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
    // text nodes
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (dict[k] != null) el.textContent = dict[k];
    });
    // placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const k = el.getAttribute("data-i18n-placeholder");
      if (dict[k] != null) el.setAttribute("placeholder", dict[k]);
    });
    // meta
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
    retriggerEnter();
    if (push) {
      const u = new URL(location.href);
      u.searchParams.set("lang", lang);
      history.replaceState({}, "", u);
    }
  }

  // Expose si tu utilises onclick="setLanguage('xx')"
  window.setLanguage = setLang;

  /* ---------- UI (drawer, flags, esc) ---------- */
  function bindUI() {
    const drawer = document.querySelector(".drawer");
    const panel = drawer?.querySelector(".panel");

    let isClosing = false;

    function smoothOpenDrawer() {
      if (!drawer) return;
      if (drawer.classList.contains("open") || isClosing) return;
      drawer.classList.add("open");
    }

    function smoothCloseDrawer() {
      if (!drawer) return;
      if (!drawer.classList.contains("open") || isClosing) return;
      isClosing = true;
      drawer.classList.add("closing");
      drawer.classList.remove("open");

      const done = () => {
        drawer.classList.remove("closing");
        isClosing = false;
        panel?.removeEventListener("animationend", onAnimEnd);
      };

      const onAnimEnd = () => { clearTimeout(fallback); done(); };
      const fallback = setTimeout(done, 480);
      panel?.addEventListener("animationend", onAnimEnd);
    }

    document.addEventListener(
      "click",
      (e) => {
        const openBtn = e.target.closest(".hamburger, .menu-toggle");
        const closeBtn = e.target.closest(".drawer-close, .overlay");
        const flag = e.target.closest(".lang-btn");

        if (openBtn) { e.preventDefault(); smoothOpenDrawer(); return; }
        if (closeBtn) { e.preventDefault(); smoothCloseDrawer(); return; }

        if (flag) {
          e.preventDefault();
          e.stopPropagation();
          const lang = flag.dataset.lang;
          setLang(lang).then(() => { smoothCloseDrawer(); });
          return;
        }
      },
      true
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") smoothCloseDrawer();
    });
  }

  /* ---------- Page transitions (scopées à .page-root) ----------- */
  function bindPageTransitions() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.addEventListener(
      "click",
      (e) => {
        // pas de transition pour changement de langue / liens marqués
        if (e.target.closest(".lang-btn") || e.target.closest("[data-no-transition]")) return;

        const a = e.target.closest("a[href]");
        if (!a) return;

        const href = a.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

        const url = new URL(a.href, location.href);
        const sameOrigin = url.origin === location.origin;
        const sameTab = a.target !== "_blank" && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

        if (sameOrigin && sameTab) {
          e.preventDefault();
          const root =
            document.querySelector(".page-root") ||
            document.querySelector("main") ||
            document.body;
          root?.classList.add("page-leave");
          setTimeout(() => (location.href = url.href), 320);
        }
      },
      true
    );
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
    const root = getPageRoot();
    if (!root.classList.contains("page-enter")) {
      root.classList.add("page-enter");
    }
    bindUI();
    bindPageTransitions();
    bindContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        boot();
        setLang(START, false);
      },
      { once: true }
    );
  } else {
    boot();
    setLang(START, false);
  }
})();
