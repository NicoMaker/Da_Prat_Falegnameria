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
    progettiContainer.innerHTML = "<p class='no-results'>Errore nel caricamento dei prodotti.</p>";
  });

  // ── Ottiene i colori per una categoria, con fallback per "Tutti" ──
  function getCategoryColors(category) {
    if (category === "Tutti") {
      return { bg: "#2d2d2d", text: "#ffffff", border: "#2d2d2d" };
    }
    const c = CategoryColors.getColor(category);
    return c || { bg: "#eee", text: "#333", border: "#ccc" };
  }

  // ── Popola bottoni e select ──────────────────────────────
  function populateFilters() {
    const categories = new Set([CONFIG.defaultFilter]);
    allProducts.forEach((p) => p.categorie.forEach((c) => categories.add(c)));

    filterButtonsContainer.innerHTML = "";
    filterSelect.innerHTML = "";

    categories.forEach((category) => {
      // Bottone
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

      // Option con colori (identici ai bottoni non attivi)
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;

      const colors = getCategoryColors(category);
      option.style.backgroundColor = colors.bg;
      option.style.color = colors.text;
      option.style.fontWeight = "bold";
      // Alcuni browser supportano il bordo sulle option
      option.style.border = `1px solid ${colors.border}`;
      option.style.padding = "6px 10px";

      filterSelect.appendChild(option);
    });

    // Evento cambio select – aggiorna il colore del select stesso
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

  // ── Applica al select i colori della categoria selezionata (come bottone attivo) ──
  function applyColorsToSelect() {
    const selected = filterSelect.value;
    if (!selected) return;

    const colors = getCategoryColors(selected);
    // Stile "attivo": sfondo = colore del testo, testo = bianco, bordo spesso
    filterSelect.style.backgroundColor = colors.text;   // sfondo scuro
    filterSelect.style.color = "#ffffff";               // testo bianco
    filterSelect.style.border = `3px solid ${colors.border}`;
    filterSelect.style.outline = `2px solid ${colors.border}`;
    filterSelect.style.outlineOffset = "1px";
  }

  // ── Aggiorna UI bottoni e select ──────────────────────────
  function updateFilterUI() {
    // Bottoni
    document.querySelectorAll("#filter-buttons .filter-button").forEach((btn) => {
      const isActive = btn.dataset.category === currentFilter;
      btn.classList.toggle("active", isActive);
      CategoryColors.applyFilterButtonStyle(btn, btn.dataset.category, isActive);
    });

    // Select: aggiorna il valore e il colore
    if (filterSelect) {
      filterSelect.value = currentFilter;
      applyColorsToSelect();
    }
  }

  // ── Scroll alla griglia prodotti ──────────────────────────
  function scrollToProductGrid() {
    const grid = document.querySelector(".progetti-container");
    if (!grid) return;
    const header = document.querySelector(".site-header");
    const controls = document.getElementById("product-controls-sticky");
    const totalOffset = (header ? header.offsetHeight : 0) +
                        (controls ? controls.offsetHeight : 0) +
                        CONFIG.scrollMargin;
    const offsetPosition = grid.getBoundingClientRect().top + window.pageYOffset - totalOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  }

  // ── Filtra e cerca ──────────────────────────────────────────
  function applyFiltersAndSearch() {
    let filtered = allProducts;

    if (currentFilter !== CONFIG.defaultFilter) {
      filtered = filtered.filter((p) => p.categorie.includes(currentFilter));
    }

    if (currentSearchTerm) {
      const term = currentSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nome.toLowerCase().includes(term) ||
          p.descrizione.toLowerCase().includes(term) ||
          p.categorie.some((c) => c.toLowerCase().includes(term))
      );
    }

    displayProducts(filtered);
    updateFilterUI();
  }

  function displayProducts(products) {
    progettiContainer.innerHTML = "";
    if (products.length === 0) {
      progettiContainer.innerHTML = "<p class='no-results'>Nessun prodotto trovato.</p>";
      return;
    }
    products.forEach((p) => progettiContainer.appendChild(createProductCard(p)));
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
        ${hasLink ? '<div class="card-hover-overlay"><span class="material-icons">open_in_new</span></div>' : ''}
      </div>
      <div class="Progetti-card-content">
        <h3 class="nome">${item.nome}</h3>
        <p class="descrizione">${item.descrizione}</p>
        ${categoriaHtml}
        ${hasLink ? '<p class="card-link-hint">Scopri di più →</p>' : ''}
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
      if (storedCategory && storedCategory !== "null") currentFilter = storedCategory;
      if (storedSearchTerm && storedSearchTerm !== "null") {
        currentSearchTerm = storedSearchTerm;
        if (searchInput) searchInput.value = storedSearchTerm;
      }
    } catch (e) {
      console.error("Impossibile caricare lo stato:", e);
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

  // ── Recupero stato al rientro nella pagina ──────────────────
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