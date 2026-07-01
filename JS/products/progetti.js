// ──────────────────────────────────────────────────────────────
// progetti.js — Gestione filtri con colori identici ai bottoni
// ──────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const progettiContainer = document.querySelector(".progetti-container");
  const filterButtonsContainer = document.getElementById("filter-buttons");
  const filterSelect = document.getElementById("filter-select");
  const searchInput = document.getElementById("search-progetti");

  if (!progettiContainer) return;

  let allProducts = [];
  let serramentiProducts = [];
  let porteProducts = [];
  let scorrevoliProducts = [];
  let currentFilter = CONFIG.defaultFilter;
  let currentSearchTerm = "";

  // ── Caricamento diretto del JSON ──────────────────────────
  async function caricaProdotti() {
    try {
      const data = await JsonData.load("progetti");
      console.log("📦 JSON caricato:", data);

      // Estrai i quattro array
      serramentiProducts = data.serramenti || [];
      allProducts = data.prodotti || [];
      porteProducts = data.porte || [];
      scorrevoliProducts = data.scorrevoli || [];

      // Fallback se non ci sono dati
      if (
        allProducts.length === 0 &&
        serramentiProducts.length === 0 &&
        porteProducts.length === 0 &&
        scorrevoliProducts.length === 0
      ) {
        console.warn("⚠️ Nessun dato nel JSON. Uso fallback di esempio.");
        // Dati di esempio (solo per debug)
        const fallback = [
          {
            id: "serramento-pvc",
            nome: "PVC",
            categorie: ["Serramenti PVC"],
            descrizione: "Infissi in PVC...",
            immagine: "Img/Serramenti_Section/PVC.png",
            link: "#",
          },
          {
            id: "serramento-alluminio",
            nome: "Alluminio",
            categorie: ["Serramenti Alluminio"],
            descrizione: "Infissi in alluminio...",
            immagine: "Img/Serramenti_Section/AlU.png",
            link: "#",
          },
          {
            id: "serramento-legno",
            nome: "Legno",
            categorie: ["Serramenti Legno"],
            descrizione: "Infissi in legno...",
            immagine: "Img/Serramenti_Section/Legno.png",
            link: "#",
          },
          {
            id: "porte-interne",
            nome: "Interne",
            categorie: ["Porte Interne"],
            descrizione: "Porte interne...",
            immagine: "Img/Porte_section/Interne/1.png",
            link: "#",
          },
          {
            id: "porte-scorrevoli",
            nome: "Scorrevoli",
            categorie: ["Porte Scorrevoli"],
            descrizione: "Sistemi scorrevoli...",
            immagine: "Img/Scorrevoli_Section/1.png",
            link: "#",
          },
          {
            id: "porte-blindate",
            nome: "Blindate",
            categorie: ["Porte Blindate"],
            descrizione: "Porte blindate...",
            immagine: "Img/Porte_section/ingresso/1.png",
            link: "#",
          },
        ];
        serramentiProducts = fallback.filter((p) =>
          p.categorie.some((c) => c.startsWith("Serramenti")),
        );
        porteProducts = fallback.filter((p) =>
          p.categorie.some((c) => /^Porte\s+(Interne|Blindate)/i.test(c)),
        );
        scorrevoliProducts = fallback.filter((p) =>
          p.categorie.some((c) => /^Porte\s+Scorrevoli/i.test(c)),
        );
        allProducts = fallback;
      }

      console.log(
        `✅ Caricati: ${allProducts.length} prodotti, ${serramentiProducts.length} serramenti, ${porteProducts.length} porte, ${scorrevoliProducts.length} scorrevoli`,
      );

      // Popola tutto
      populateFilters();
      loadStateFromStorage();
      applyFiltersAndSearch();
      updateFilterUI();
      populateSerramenti();
      populatePorte();

      if (window.location.hash === "#Prodotti") {
        const section = document.getElementById("Prodotti");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("❌ Errore caricamento JSON:", error);
      progettiContainer.innerHTML =
        "<p class='no-results'>Errore nel caricamento dei prodotti.</p>";
    }
  }

  // ── Avvia il caricamento ────────────────────────────────────
  caricaProdotti();

  // ── Popola la sezione Serramenti ──────────────────────────
  function populateSerramenti() {
    const container = document.getElementById("serramenti-grid");
    if (!container) {
      console.warn("⚠️ Contenitore serramenti-grid non trovato");
      return;
    }
    container.innerHTML = "";
    if (serramentiProducts.length === 0) {
      container.innerHTML =
        "<p class='no-results'>Nessun serramento disponibile.</p>";
      return;
    }
    serramentiProducts.forEach((p) =>
      container.appendChild(createProductCard(p)),
    );
  }

  // ── Popola la sezione Porte (unisce porte + scorrevoli) ──
  function populatePorte() {
    const container = document.getElementById("porte-grid");
    if (!container) {
      console.warn("⚠️ Contenitore porte-grid non trovato");
      return;
    }
    const tutteLePorte = [...porteProducts, ...scorrevoliProducts];
    container.innerHTML = "";
    if (tutteLePorte.length === 0) {
      container.innerHTML =
        "<p class='no-results'>Nessuna porta disponibile.</p>";
      return;
    }
    const ordine = ["Interne", "Scorrevoli", "Blindate"];
    tutteLePorte.sort(
      (a, b) => ordine.indexOf(a.nome) - ordine.indexOf(b.nome),
    );
    tutteLePorte.forEach((p) => container.appendChild(createProductCard(p)));
  }

  // ── Ottiene i colori per una categoria ──
  function getCategoryColors(category) {
    if (category === "Tutti") {
      return {
        bg: "#ffffff",
        text: "#000000",
        border: "#cccccc",
        activeBg: "#ffffff",
        activeText: "#000000",
      };
    }
    const c = CategoryColors.getColor(category);
    if (!c) {
      return {
        bg: "#ffffff",
        text: "#000000",
        border: "#cccccc",
        activeBg: "#ffffff",
        activeText: "#000000",
      };
    }
    return {
      bg: c.bg,
      text: c.text,
      border: c.border,
      activeBg: c.text,
      activeText: "#ffffff",
    };
  }

  // ── Popola bottoni e select ──────────────────────────────
  const PORTE_GROUP = "Porte";
  const PORTE_SUBCATEGORIES = [
    "Porte Interne",
    "Porte Scorrevoli",
    "Porte Blindate",
  ];

  function isPorteGroup(cat) {
    return cat === PORTE_GROUP;
  }

  function matchesFilter(product, filter) {
    if (filter === CONFIG.defaultFilter) return true;
    if (isPorteGroup(filter))
      return product.categorie.some((c) => PORTE_SUBCATEGORIES.includes(c));
    return product.categorie.includes(filter);
  }

  function populateFilters() {
    const categories = new Set([CONFIG.defaultFilter]);
    allProducts.forEach((p) =>
      p.categorie.forEach((c) => {
        if (PORTE_SUBCATEGORIES.includes(c)) {
          categories.add(PORTE_GROUP);
        } else {
          categories.add(c);
        }
      }),
    );

    filterButtonsContainer.innerHTML = "";
    filterSelect.innerHTML = "";

    categories.forEach((category) => {
      const button = document.createElement("button");
      button.classList.add("filter-button");
      button.textContent = category;
      button.dataset.category = category;
      CategoryColors.applyFilterButtonStyle(button, category, false);
      button.addEventListener("click", () => {
        currentFilter = category;
        saveStateToLocalStorage();
        applyFiltersAndSearch();
        updateFilterUI();
        scrollToProductGrid();
      });
      filterButtonsContainer.appendChild(button);

      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      const colors = getCategoryColors(category);
      option.style.backgroundColor = colors.bg;
      option.style.color = colors.text;
      option.style.fontWeight = "bold";
      option.style.border = `1px solid ${colors.border}`;
      option.style.padding = "6px 10px";
      filterSelect.appendChild(option);
    });

    filterSelect.addEventListener("change", () => {
      currentFilter = filterSelect.value;
      applyColorsToSelect();
      saveStateToLocalStorage();
      applyFiltersAndSearch();
      updateFilterUI();
      scrollToProductGrid();
    });

    applyColorsToSelect();
  }

  function applyColorsToSelect() {
    const selected = filterSelect.value;
    if (!selected) return;
    filterSelect.style.backgroundColor = "#ffffff";
    filterSelect.style.color = "#000000";
    filterSelect.style.border = "2px solid #cccccc";
    filterSelect.style.outline = "none";
    filterSelect.style.outlineOffset = "0";
    Array.from(filterSelect.options).forEach((opt) => {
      opt.style.backgroundColor = "#ffffff";
      opt.style.color = "#000000";
    });
  }

  function updateFilterUI() {
    document
      .querySelectorAll("#filter-buttons .filter-button")
      .forEach((btn) => {
        const isActive = btn.dataset.category === currentFilter;
        btn.classList.toggle("active", isActive);
        CategoryColors.applyFilterButtonStyle(
          btn,
          btn.dataset.category,
          isActive,
        );
      });
    if (filterSelect) {
      filterSelect.value = currentFilter;
      applyColorsToSelect();
    }
  }

  function scrollToProductGrid() {
    const grid = document.querySelector(".progetti-container");
    if (!grid) return;
    const header = document.querySelector(".site-header");
    const controls = document.getElementById("product-controls-sticky");
    const totalOffset =
      (header ? header.offsetHeight : 0) +
      (controls ? controls.offsetHeight : 0) +
      CONFIG.scrollMargin;
    const offsetPosition =
      grid.getBoundingClientRect().top + window.pageYOffset - totalOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  }

  function applyFiltersAndSearch() {
    let filtered = allProducts;
    if (currentFilter !== CONFIG.defaultFilter) {
      filtered = filtered.filter((p) => matchesFilter(p, currentFilter));
    }
    if (currentSearchTerm) {
      const term = currentSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nome.toLowerCase().includes(term) ||
          p.descrizione.toLowerCase().includes(term) ||
          p.categorie.some((c) => c.toLowerCase().includes(term)),
      );
    }
    displayProducts(filtered);
    updateFilterUI();
  }

  function displayProducts(products) {
    progettiContainer.innerHTML = "";
    if (products.length === 0) {
      progettiContainer.innerHTML =
        "<p class='no-results'>Nessun prodotto trovato.</p>";
      return;
    }
    products.forEach((p) =>
      progettiContainer.appendChild(createProductCard(p)),
    );
  }

  function createProductCard(item) {
    const card = document.createElement("div");
    card.className = "Progetti-card";
    card.addEventListener("click", () => {
      saveStateToLocalStorage();
      if (item.link && item.link !== "#") {
        window.open(item.link, "_blank");
      }
    });

    const categories = item.categorie || [];
    let categoriaHtml = "";
    if (categories.length > 0 && currentFilter === CONFIG.defaultFilter) {
      categoriaHtml = CategoryColors.getBadgesHTML(categories);
    }

    const hasLink = item.link && item.link !== "#";
    if (hasLink) card.style.cursor = "pointer";

    card.innerHTML = `
      <div class="container-immagine">
        <img class="immagine" src="${item.immagine}" alt="${item.nome}" loading="lazy">
        ${hasLink ? '<div class="card-hover-overlay"><span class="material-icons">open_in_new</span></div>' : ""}
      </div>
      <div class="Progetti-card-content">
        <h3 class="nome">${item.nome}</h3>
        <p class="descrizione">${item.descrizione}</p>
      </div>
    `;
    return card;
  }

  // ── LocalStorage ────────────────────────────────────────────
  function saveStateToLocalStorage() {
    try {
      localStorage.setItem(CONFIG.storageKeyCategory, currentFilter);
      localStorage.setItem(CONFIG.storageKeySearch, currentSearchTerm);
    } catch (e) {
      console.error("Impossibile salvare lo stato:", e);
    }
  }

  function loadStateFromStorage() {
    try {
      const storedCategory = localStorage.getItem(CONFIG.storageKeyCategory);
      const storedSearchTerm = localStorage.getItem(CONFIG.storageKeySearch);
      if (storedCategory && storedCategory !== "null") {
        currentFilter = storedCategory;
      } else {
        currentFilter = "Tutti";
      }
      if (storedSearchTerm && storedSearchTerm !== "null") {
        currentSearchTerm = storedSearchTerm;
        if (searchInput) searchInput.value = storedSearchTerm;
      } else {
        currentSearchTerm = "";
        if (searchInput) searchInput.value = "";
      }
    } catch (e) {
      console.error("Impossibile caricare lo stato:", e);
      currentFilter = "Tutti";
      currentSearchTerm = "";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentSearchTerm = searchInput.value;
      saveStateToLocalStorage();
      applyFiltersAndSearch();
      scrollToProductGrid();
    });
  }

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      loadStateFromStorage();
      applyFiltersAndSearch();
      updateFilterUI();
    }
  });

  window.addEventListener("focus", () => {
    loadStateFromStorage();
    if (searchInput) searchInput.value = currentSearchTerm;
    applyFiltersAndSearch();
    updateFilterUI();
  });
});
