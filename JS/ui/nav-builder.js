// ─────────────────────────────────────────────────────────────────────────────
// nav-builder.js — Costruisce il dropdown "Prodotti" (desktop + mobile)
//                  leggendo le categorie dal JSON progetti.
//
// Funziona sia su index.html che sulle pagine prodotto (Projects/).
// Il percorso corretto del JSON viene risolto da JsonPaths (json-paths.js).
//
// Dipende da: json-paths.js (JsonPaths), json-loader.js (JsonData)
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  // ── Costanti ────────────────────────────────────────────────────────────────
  var PORTE_SUBCATEGORIES = [
    "Porte Interne",
    "Porte Scorrevoli",
    "Porte Blindate",
  ];
  var PORTE_GROUP = "Porte";

  // ── Rileva se siamo su una sotto-pagina (Projects/) ─────────────────────────
  var pathSegments = window.location.pathname.split("/").filter(Boolean);
  var last = pathSegments[pathSegments.length - 1];
  if (last && last.includes(".")) pathSegments.pop();
  var isSubPage = pathSegments.some(function (seg) {
    return seg.toLowerCase() === "projects" || seg.toLowerCase() === "project";
  });

  // Prefisso per i link del menu (su index.html è "", su sub-page è "../")
  var linkBase = isSubPage ? "../index.html" : "";

  // ── Costruisce le voci ordinate partendo dalle categorie raw ─────────────────
  function buildOrderedCategories(rawCategories) {
    var seen = new Set(["Tutti"]);
    var ordered = ["Tutti"];
    rawCategories.forEach(function (c) {
      if (PORTE_SUBCATEGORIES.includes(c)) {
        if (!seen.has(PORTE_GROUP)) {
          seen.add(PORTE_GROUP);
          ordered.push(PORTE_GROUP);
        }
      } else {
        if (!seen.has(c)) {
          seen.add(c);
          ordered.push(c);
        }
      }
    });
    return ordered;
  }

  // ── Popola i menu nel DOM ────────────────────────────────────────────────────
  function populateMenus(categories) {
    var desktopMenu = document.getElementById("nav-prodotti-menu");
    var mobileMenu = document.getElementById("mobile-prodotti-menu");

    if (!desktopMenu && !mobileMenu) return;

    if (desktopMenu) desktopMenu.innerHTML = "";
    if (mobileMenu) mobileMenu.innerHTML = "";

    categories.forEach(function (cat) {
      var href = linkBase + "#prodotti";

      // ── Desktop ──────────────────────────────────────────────────────────────
      if (desktopMenu) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = href;
        a.className = "nav-dropdown-link";
        a.dataset.prodFilter = cat;
        a.textContent = cat;
        li.appendChild(a);
        desktopMenu.appendChild(li);
      }

      // ── Mobile ───────────────────────────────────────────────────────────────
      if (mobileMenu) {
        var liM = document.createElement("li");
        var aM = document.createElement("a");
        aM.href = href;
        aM.className = "mobile-nav-link mobile-nav-sub";
        aM.dataset.prodFilter = cat;
        aM.textContent = cat;
        liM.appendChild(aM);
        mobileMenu.appendChild(liM);
      }
    });

    // ── Aggancia i click (solo se siamo su index.html, altrimenti naviga) ─────
    if (!isSubPage) {
      attachFilterClicks();
    } else {
      attachSubPageClicks();
    }

    // ── Accordion mobile ──────────────────────────────────────────────────────
    initMobileAccordion(
      "#mobile-prodotti-toggle, #mobile-prodotti-toggle-sub",
      "#mobile-prodotti-menu",
    );
  }

  // ── Click su index.html: applica filtro senza navigare ──────────────────────
  function attachFilterClicks() {
    document.querySelectorAll("[data-prod-filter]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var filter = this.dataset.prodFilter;
        // Aspetta un tick per permettere lo scroll al anchor prima del filtro
        setTimeout(function () {
          applyFilterOnIndex(filter);
        }, 200);
      });
    });
  }

  function applyFilterOnIndex(filterName) {
    // Cerca il bottone corrispondente nel filtro desktop
    var buttons = document.querySelectorAll("#filter-buttons .filter-button");
    buttons.forEach(function (btn) {
      if (btn.dataset.category === filterName) btn.click();
    });
    // Fallback: select mobile
    var sel = document.getElementById("filter-select");
    if (sel) {
      Array.from(sel.options).forEach(function (opt) {
        if (opt.value === filterName) {
          sel.value = filterName;
          sel.dispatchEvent(new Event("change"));
        }
      });
    }
  }

  // ── Click su sub-page: salva filtro in sessionStorage e naviga ──────────────
  function attachSubPageClicks() {
    document.querySelectorAll("[data-prod-filter]").forEach(function (link) {
      link.addEventListener("click", function () {
        sessionStorage.setItem("prodFilter", this.dataset.prodFilter);
      });
    });
  }

  // ── Accordion mobile generico ────────────────────────────────────────────────
  function initMobileAccordion(toggleSel, menuSel) {
    var toggles = document.querySelectorAll(toggleSel);
    var menu = document.querySelector(menuSel);
    if (!menu) return;
    toggles.forEach(function (toggle) {
      toggle.addEventListener("click", function (e) {
        var isOpen = menu.classList.contains("open");
        if (!isOpen) e.preventDefault();
        menu.classList.toggle("open");
        var arrow = this.querySelector(".dropdown-arrow");
        if (arrow) arrow.style.transform = isOpen ? "" : "rotate(180deg)";
      });
    });
  }

  // ── Carica il JSON e avvia tutto ────────────────────────────────────────────
  function init() {
    // Usa JsonData se disponibile (già caricato da json-loader.js)
    if (typeof JsonData !== "undefined") {
      JsonData.load("progetti")
        .then(function (data) {
          var rawCats = [];
          (data.Prodotti || []).forEach(function (p) {
            (p.categorie || []).forEach(function (c) {
              rawCats.push(c);
            });
          });
          populateMenus(buildOrderedCategories(rawCats));
        })
        .catch(function (err) {
          console.warn("nav-builder: impossibile caricare progetti.json", err);
        });
      return;
    }

    // Fallback fetch diretto
    var jsonPath = (isSubPage ? "../JSON/" : "JSON/") + "progetti.json";
    fetch(jsonPath)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var rawCats = [];
        (data.Prodotti || []).forEach(function (p) {
          (p.categorie || []).forEach(function (c) {
            rawCats.push(c);
          });
        });
        populateMenus(buildOrderedCategories(rawCats));
      })
      .catch(function (err) {
        console.warn("nav-builder: fetch fallback fallito", err);
      });
  }

  // Avvia dopo il DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Su index.html il nav viene anche aggiornato dopo "prodottiCaricati"
  // (già gestito da porte.js); ma se porte.js viene rimosso in futuro,
  // nav-builder gestisce anche quell'evento per sicurezza.
  document.addEventListener("prodottiCaricati", function (e) {
    var rawCats = [];
    (e.detail.prodotti || []).forEach(function (p) {
      (p.categorie || []).forEach(function (c) {
        rawCats.push(c);
      });
    });
    populateMenus(buildOrderedCategories(rawCats));

    // Leggi filtro da sessionStorage (es. arrivo da una product page)
    if (!isSubPage) {
      var savedFilter = sessionStorage.getItem("prodFilter");
      if (savedFilter) {
        sessionStorage.removeItem("prodFilter");
        setTimeout(function () {
          applyFilterOnIndex(savedFilter);
          var prodSection = document.getElementById("prodotti");
          if (prodSection) {
            var headerH =
              (document.querySelector(".site-header") || {}).offsetHeight || 0;
            var top =
              prodSection.getBoundingClientRect().top +
              window.scrollY -
              headerH;
            window.scrollTo({ top: top, behavior: "smooth" });
          }
        }, 300);
      }
    }
  });
})();
