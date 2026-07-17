// ─────────────────────────────────────────────────────────────
// modern-animations.js — Motore animazioni condiviso (tutte le pagine)
// • Reveal allo scroll (IntersectionObserver) anche su contenuti
//   generati dinamicamente dal JS (MutationObserver)
// • Header "glass" che si compatta allo scroll + barra di progresso
// • Pulsante "torna su"
// • Entrata orchestrata della hero
// Rispetta prefers-reduced-motion.
// ─────────────────────────────────────────────────────────────
(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ── 1. Hero: avvia l'entrata orchestrata ──
  function initHero() {
    var hero = document.querySelector(".hero-section");
    if (!hero) return;
    // piccola attesa per far partire le transizioni CSS
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add("hero-loaded");
      });
    });
    // indicatore di scroll
    if (!hero.querySelector(".hero-scroll-hint") && !reduceMotion) {
      var hint = document.createElement("div");
      hint.className = "hero-scroll-hint";
      hint.setAttribute("aria-hidden", "true");
      hero.appendChild(hint);
    }
  }

  // ── 2. Header + barra di progresso ──
  function initHeader() {
    var header = document.querySelector(".site-header");
    var progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || document.documentElement.scrollTop;
        if (header) header.classList.toggle("is-scrolled", y > 24);
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(y / max, 1) : 0;
        progress.style.transform = "scaleX(" + p + ")";
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ── 3. Pulsante "torna su" ──
  function initBackToTop() {
    var btn = document.createElement("button");
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Torna all'inizio della pagina");
    btn.innerHTML = "&#8593;";
    document.body.appendChild(btn);

    btn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });

    window.addEventListener(
      "scroll",
      function () {
        btn.classList.toggle("visible", window.scrollY > 600);
      },
      { passive: true }
    );
  }

  // ── 4. Reveal allo scroll ──
  var observer = null;

  function getObserver() {
    if (observer) return observer;
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    return observer;
  }

  function markReveal(el, type, index) {
    if (el.hasAttribute("data-reveal")) return;
    el.setAttribute("data-reveal", type || "up");
    if (typeof index === "number") {
      el.style.setProperty("--reveal-index", String(index % 6));
    }
    // Se l'elemento è già nel viewport iniziale sopra la piega, mostralo subito
    getObserver().observe(el);
  }

  // Seleziona i target di reveal (statici + generati dal JS del sito)
  function scanForTargets(root) {
    root = root || document;

    // Titoli e sottotitoli di sezione
    root
      .querySelectorAll(
        ".section-title, .section-subtitle, .consulenza-title, .consulenza-text, .product-title, .product-description, .product-breadcrumb"
      )
      .forEach(function (el) {
        markReveal(el, "up");
      });

    // Card (home) — stagger per griglia
    root
      .querySelectorAll(".materiali-grid")
      .forEach(function (grid) {
        Array.prototype.forEach.call(grid.children, function (card, i) {
          markReveal(card, "up", i);
        });
      });

    // Gallery realizzazioni
    root.querySelectorAll(".gallery-grid .gallery-item").forEach(function (el, i) {
      markReveal(el, "zoom", i);
    });

    // Consulenza: immagine da sinistra, testo da destra
    root.querySelectorAll(".consulenza-image").forEach(function (el) {
      markReveal(el, "left");
    });
    root.querySelectorAll(".consulenza-content").forEach(function (el) {
      markReveal(el, "right");
    });

    // Pagina prodotto
    root.querySelectorAll(".product-image-gallery, .slider-container").forEach(
      function (el) {
        markReveal(el, "left");
      }
    );
    root.querySelectorAll(".product-info").forEach(function (el) {
      markReveal(el, "right");
    });
    root.querySelectorAll(".product-feature").forEach(function (el, i) {
      markReveal(el, "up", i);
    });

    // Manifesto del mestiere
    root.querySelectorAll(".craft-statement").forEach(function (el) {
      markReveal(el, "up");
    });
    root.querySelectorAll(".craft-pillar").forEach(function (el, i) {
      markReveal(el, "up", i);
    });

    // Footer
    root
      .querySelectorAll(".footer-grid > .footer-section, .footer-grid > *")
      .forEach(function (el, i) {
        markReveal(el, "up", i);
      });
  }

  // Contenuti generati dinamicamente (card prodotti, footer, slider…)
  function watchDynamicContent() {
    var mo = new MutationObserver(function (mutations) {
      var needsScan = false;
      mutations.forEach(function (m) {
        if (m.addedNodes && m.addedNodes.length) needsScan = true;
      });
      if (needsScan) scanForTargets(document);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Anche sull'evento custom del sito
    document.addEventListener("prodottiCaricati", function () {
      // le card vengono create subito dopo l'evento
      setTimeout(function () {
        scanForTargets(document);
      }, 50);
    });
  }


  // ── 5. Ispirazione "migliori siti" ──

  // 5a. Coordinazione cromatica per sezione (stile With Us):
  // ogni sezione della home prende l'accento della sua categoria.
  function initSectionAccents() {
    var map = {
      serramenti: "var(--color-serramenti)",
      "porte-scorrevoli": "var(--color-porte)",
      "porte-interne": "var(--color-porte)",
      "porte-ingresso": "var(--color-porte)",
      oscuranti: "var(--color-oscuranti)",
      "sistemi-ombreggiatura": "var(--color-oscuranti)",
    };
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) sec.style.setProperty("--section-accent", map[id]);
    });
  }

  // 5b. Eyebrow sopra il titolo hero (contesto artigianale)
  function initHeroEyebrow() {
    var content = document.querySelector(".hero-content");
    var title = document.querySelector(".hero-title");
    if (!content || !title || content.querySelector(".hero-eyebrow")) return;
    var eb = document.createElement("p");
    eb.className = "hero-eyebrow";
    eb.innerHTML =
      'Falegnameria<span class="sep">·</span>Serramenti su misura<span class="sep">·</span>Spilimbergo';
    content.insertBefore(eb, title);
  }

  // 5c. Didascalie eleganti nella gallery (dal testo alt delle immagini)
  function initGalleryCaptions() {
    document.querySelectorAll(".gallery-item").forEach(function (item) {
      if (item.querySelector(".gallery-caption")) return;
      var img = item.querySelector("img");
      if (!img) return;
      var cap = document.createElement("span");
      cap.className = "gallery-caption";
      cap.textContent = img.getAttribute("alt") || "Realizzazione";
      item.appendChild(cap);
    });
  }

  // 5d. Contatto sempre accessibile: pulsante chiamata flottante
  function initQuickCall() {
    if (document.querySelector(".quick-call")) return;
    var a = document.createElement("a");
    a.className = "quick-call";
    a.href = "tel:+393391792590";
    a.setAttribute("aria-label", "Chiama Da Prat");
    a.innerHTML = '<span class="material-icons" aria-hidden="true">call</span>';
    document.body.appendChild(a);
  }

  // 5e. Separatori artigianali tra le sezioni della home
  function initSectionDividers() {
    var sections = document.querySelectorAll("section.materiali-section");
    sections.forEach(function (sec, i) {
      if (i === 0) return; // niente divisore prima della prima sezione
      if (sec.previousElementSibling &&
          sec.previousElementSibling.classList.contains("section-divider")) return;
      var div = document.createElement("div");
      div.className = "section-divider";
      div.setAttribute("aria-hidden", "true");
      div.innerHTML = "<span></span>";
      sec.parentNode.insertBefore(div, sec);
    });
  }

  // 5f. Pulsante WhatsApp flottante (apre la chat col numero aziendale)
  function initQuickWhatsApp() {
    if (document.querySelector(".quick-whatsapp")) return;
    var a = document.createElement("a");
    a.className = "quick-whatsapp";
    a.href =
      "https://wa.me/393391792590?text=" +
      encodeURIComponent("Buongiorno, vorrei informazioni sui vostri serramenti.");
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("aria-label", "Scrivi a Da Prat su WhatsApp");
    a.innerHTML =
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.04 3C9.02 3 3.32 8.7 3.32 15.72c0 2.24.59 4.42 1.71 6.35L3.2 28.8l6.9-1.8a12.66 12.66 0 0 0 5.94 1.51h.01c7.01 0 12.72-5.7 12.72-12.72 0-3.4-1.32-6.6-3.72-9-2.4-2.4-5.6-3.79-9.01-3.79zm0 23.36h-.01c-1.9 0-3.76-.51-5.38-1.47l-.39-.23-4.1 1.07 1.1-3.99-.25-.41a10.53 10.53 0 0 1-1.62-5.61c0-5.83 4.75-10.57 10.58-10.57 2.83 0 5.48 1.1 7.48 3.1a10.5 10.5 0 0 1 3.1 7.48c0 5.83-4.75 10.63-10.51 10.63zm5.8-7.92c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.5-2.55-1.58-.94-.84-1.58-1.88-1.77-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.28c.16.21 2.24 3.42 5.42 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37z"/></svg>';
    document.body.appendChild(a);
  }

  // ── Avvio ──
  function init() {
    initHeader();
    initBackToTop();
    initSectionAccents();
    initHeroEyebrow();
    initGalleryCaptions();
    initQuickCall();
    initQuickWhatsApp();
    initSectionDividers();

    if (reduceMotion || !("IntersectionObserver" in window)) {
      // Nessuna animazione: assicurati che tutto sia visibile
      document.body.classList.add("hero-loaded");
      return;
    }

    initHero();
    scanForTargets(document);
    watchDynamicContent();

    // Rete di sicurezza: dopo 4s qualsiasi elemento non ancora rivelato
    // ma visibile viene mostrato (evita contenuti "bloccati" invisibili)
    setTimeout(function () {
      document.querySelectorAll("[data-reveal]:not(.reveal-in)").forEach(
        function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            el.classList.add("reveal-in");
          }
        }
      );
    }, 4000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
