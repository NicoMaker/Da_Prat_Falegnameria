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
  let currentFilter = CONFIG.defaultFilter;
  let currentSearchTerm = "";

  // ── Evento caricamento prodotti ──────────────────────────
  document.addEventListener("prodottiCaricati", (e) => {
    allProducts = e.detail.prodotti;
    populateFilters();
    loadStateFromStorage();
    applyFiltersAndSearch();
    updateFilterUI();

    if (window.location.hash === "#Prodotti") {
      const section = document.getElementById("Prodotti");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  });

  document.addEventListener("prodottiErrore", () => {
    progettiContainer.innerHTML =
      "<p class='no-results'>Errore nel caricamento dei prodotti.</p>";
  });

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
      // Bottone desktop
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

      // Option per il select mobile (colori inattivi)
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

    // Evento cambio select
    filterSelect.addEventListener("change", () => {
      currentFilter = filterSelect.value;
      applyColorsToSelect();
      saveStateToLocalStorage();
      applyFiltersAndSearch();
      updateFilterUI();
      scrollToProductGrid();
    });

    // Imposta il colore iniziale del select
    applyColorsToSelect();
  }

  // ── Applica al select i colori della categoria selezionata (stato attivo) ──
  function applyColorsToSelect() {
    const selected = filterSelect.value;
    if (!selected) return;

    // Sempre bianco con testo nero
    filterSelect.style.backgroundColor = "#ffffff";
    filterSelect.style.color = "#000000";
    filterSelect.style.border = "2px solid #cccccc";
    filterSelect.style.outline = "none";
    filterSelect.style.outlineOffset = "0";

    // Aggiorna il colore di ogni option
    Array.from(filterSelect.options).forEach((opt) => {
      opt.style.backgroundColor = "#ffffff";
      opt.style.color = "#000000";
    });
  }

  // ── Aggiorna UI bottoni e select ──────────────────────────
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

  // ── Scroll ──────────────────────────────────────────────────
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

  // ── Filtra e cerca ──────────────────────────────────────────
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
      if (item.link && item.link !== "#") window.location.href = item.link;
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
        ${hasLink ? '<p class="card-link-hint">Scopri di più →</p>' : ""}
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
      
      // Se non c'è un filtro salvato, imposta "Tutti" (forzato)
      if (storedCategory && storedCategory !== "null") {
        currentFilter = storedCategory;
      } else {
        currentFilter = "Tutti"; // FORZATO: se nessun dato, usa "Tutti"
      }
      
      if (storedSearchTerm && storedSearchTerm !== "null") {
        currentSearchTerm = storedSearchTerm;
        if (searchInput) searchInput.value = storedSearchTerm;
      } else {
        // Se non c'è termine di ricerca, lo resettiamo
        currentSearchTerm = "";
        if (searchInput) searchInput.value = "";
      }
    } catch (e) {
      console.error("Impossibile caricare lo stato:", e);
      // In caso di errore, forziamo "Tutti"
      currentFilter = "Tutti";
      currentSearchTerm = "";
    }
  }

  // ── Ricerca ──────────────────────────────────────────────────
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentSearchTerm = searchInput.value;
      saveStateToLocalStorage();
      applyFiltersAndSearch();
      scrollToProductGrid();
    });
  }

  // ── Recupero stato al rientro ──────────────────────────────
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