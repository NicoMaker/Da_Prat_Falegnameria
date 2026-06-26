(function () {
  // ── Porte tabs ──────────────────────────────────────────
  function activateTab(tabName) {
    document.querySelectorAll(".porte-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });
    document.querySelectorAll(".porte-tab-content").forEach(function (panel) {
      panel.classList.toggle("active", panel.dataset.content === tabName);
    });
  }

  document.querySelectorAll(".porte-tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      activateTab(this.dataset.tab);
    });
  });

  // ── Dropdown / sub-links → attiva tab direttamente + scroll ──
  document.querySelectorAll("[data-tab]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var tab = this.dataset.tab;
      sessionStorage.setItem("porteTab", tab);

      // Se siamo già sulla stessa pagina (index), attiva il tab senza reload
      if (!this.href || this.href.includes(window.location.pathname)) {
        e.preventDefault();
        activateTab(tab);
        var porteSection = document.getElementById("porte");
        if (porteSection) {
          var headerH =
            (document.querySelector(".site-header") || {}).offsetHeight || 0;
          var top =
            porteSection.getBoundingClientRect().top + window.scrollY - headerH;
          window.scrollTo({ top: top, behavior: "smooth" });
        }
      }
    });
  });

  // ── On load: open tab from sessionStorage if arriving at #porte ──
  var savedTab = sessionStorage.getItem("porteTab");
  if (savedTab) {
    sessionStorage.removeItem("porteTab");
    var porteSection = document.getElementById("porte");
    if (porteSection) {
      activateTab(savedTab);
      setTimeout(function () {
        var headerH =
          (document.querySelector(".site-header") || {}).offsetHeight || 0;
        var top =
          porteSection.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top: top, behavior: "smooth" });
      }, 150);
    }
  }

  // ── Mobile accordion helper ──────────────────────────────
  function initMobileAccordion(toggleSel, menuSel) {
    var toggle = document.querySelector(toggleSel);
    var menu = document.querySelector(menuSel);
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function (e) {
      var isOpen = menu.classList.contains("open");
      if (!isOpen) e.preventDefault();
      menu.classList.toggle("open");
      var arrow = this.querySelector(".dropdown-arrow");
      if (arrow) arrow.style.transform = isOpen ? "" : "rotate(180deg)";
    });
  }

  // Porte mobile accordion
  initMobileAccordion(".mobile-dropdown-toggle", ".mobile-dropdown-menu");

  // ── Prodotti: popola dropdown con categorie dal JSON ─────
  function buildProdottiDropdown(categories) {
    var desktopMenu = document.getElementById("nav-prodotti-menu");
    var mobileMenu = document.getElementById("mobile-prodotti-menu");
    if (!desktopMenu || !mobileMenu) return;

    // Gruppa porte in un'unica voce
    var PORTE = ["Porte Interne", "Porte Scorrevoli", "Porte Blindate"];
    var shown = new Set(["Tutti"]);
    var ordered = ["Tutti"];
    categories.forEach(function (c) {
      if (PORTE.includes(c)) {
        if (!shown.has("Porte")) {
          shown.add("Porte");
          ordered.push("Porte");
        }
      } else {
        if (!shown.has(c)) {
          shown.add(c);
          ordered.push(c);
        }
      }
    });

    desktopMenu.innerHTML = "";
    mobileMenu.innerHTML = "";

    ordered.forEach(function (cat) {
      // Desktop
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#prodotti";
      a.className = "nav-dropdown-link";
      a.dataset.prodFilter = cat;
      a.textContent = cat;
      li.appendChild(a);
      desktopMenu.appendChild(li);

      // Mobile
      var liM = document.createElement("li");
      var aM = document.createElement("a");
      aM.href = "#prodotti";
      aM.className = "mobile-nav-link mobile-nav-sub";
      aM.dataset.prodFilter = cat;
      aM.textContent = cat;
      liM.appendChild(aM);
      mobileMenu.appendChild(liM);
    });

    // Click su una voce → scrolla a #prodotti e applica filtro
    document.querySelectorAll("[data-prod-filter]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var filter = this.dataset.prodFilter;
        // Attendi che il DOM sia aggiornato poi triggera il filtro
        setTimeout(function () {
          applyNavFilter(filter);
        }, 200);
      });
    });
  }

  function applyNavFilter(filterName) {
    // Trova il bottone corrispondente nel filter-buttons desktop
    var PORTE = ["Porte Interne", "Porte Scorrevoli", "Porte Blindate"];
    var targetCat = filterName;

    var buttons = document.querySelectorAll("#filter-buttons .filter-button");
    buttons.forEach(function (btn) {
      var cat = btn.dataset.category;
      // "Porte" nel nav corrisponde al gruppo porte nel filtro
      var match =
        filterName === "Porte"
          ? PORTE.includes(cat) // non esiste bottone gruppo, cerca alternativa
          : cat === filterName;
      if (match) btn.click();
    });

    // Fallback: usa il select mobile
    var sel = document.getElementById("filter-select");
    if (sel) {
      // Prova a trovare la voce nel select
      Array.from(sel.options).forEach(function (opt) {
        if (opt.value === targetCat) {
          sel.value = targetCat;
          sel.dispatchEvent(new Event("change"));
        }
      });
    }
  }

  // ── Aspetta il caricamento prodotti per popolare il dropdown ──
  document.addEventListener("prodottiCaricati", function (e) {
    var cats = new Set();
    (e.detail.prodotti || []).forEach(function (p) {
      (p.categorie || []).forEach(function (c) {
        cats.add(c);
      });
    });
    buildProdottiDropdown(Array.from(cats));

    // Accordion mobile Prodotti (creato dopo il build)
    initMobileAccordion("#mobile-prodotti-toggle", "#mobile-prodotti-menu");

    // ── Leggi filtro da sessionStorage (arrivo da breadcrumb o nav esterno) ──
    var savedFilter = sessionStorage.getItem("prodFilter");
    if (savedFilter) {
      sessionStorage.removeItem("prodFilter");
      setTimeout(function () {
        applyNavFilter(savedFilter);
        var prodSection = document.getElementById("prodotti");
        if (prodSection) {
          var headerH =
            (document.querySelector(".site-header") || {}).offsetHeight || 0;
          var top =
            prodSection.getBoundingClientRect().top + window.scrollY - headerH;
          window.scrollTo({ top: top, behavior: "smooth" });
        }
      }, 300);
    }
  });
})();
