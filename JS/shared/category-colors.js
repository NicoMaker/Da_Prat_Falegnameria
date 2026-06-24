// ──────────────────────────────────────────────────────────────
// category-colors.js — Gestione colori per badge e filtri
// ──────────────────────────────────────────────────────────────

const CategoryColors = (() => {
  let PALETTE = [];
  const _cache = {};
  let isLoaded = false;

  /**
   * Inizializzazione asincrona: carica i dati dal JSON.
   */
  async function init() {
    try {
      PALETTE = await JsonData.load(AppConfig.palette.jsonKey);
      isLoaded = true;
      console.log("Palette caricata:", PALETTE.length, "colori.");
    } catch (err) {
      console.error("Errore caricamento colori:", err);
      // Fallback
      PALETTE = [{ bg: "#eee", text: "#333", border: "#ccc" }];
      isLoaded = true;
    }
  }

  function _hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h) ^ str.charCodeAt(i);
    }
    return Math.abs(h);
  }

  function getColor(categoryName) {
    if (!isLoaded || PALETTE.length === 0)
      return { bg: "#eee", text: "#333", border: "#ccc" };
    if (_cache[categoryName] === undefined) {
      _cache[categoryName] = _hash(categoryName) % PALETTE.length;
    }
    return PALETTE[_cache[categoryName]];
  }

  function getBadgeStyle(categoryName) {
    const c = getColor(categoryName);
    return `background-color:${c.bg};color:${c.text};border:1px solid ${c.border};`;
  }

  // ─── applyFilterButtonStyle con colori dedicati per "Tutti" ───
  function applyFilterButtonStyle(button, categoryName, isActive) {
    // Caso "Tutti" (o categoria vuota)
    if (categoryName === "Tutti" || !categoryName) {
      if (isActive) {
        // Stato attivo: sfondo scuro, testo bianco, bordo marcato
        button.style.cssText =
          "background-color:#2d2d2d;color:#ffffff;border:3px solid #2d2d2d;transform:none;box-shadow:0 0 0 3px #888, 0 4px 14px rgba(0,0,0,0.2);";
      } else {
        // Stato inattivo: sfondo grigio chiaro, testo scuro
        button.style.cssText =
          "background-color:#e0e0e0;color:#333333;border:2px solid #aaaaaa;";
        // Hover per stato inattivo
        button.onmouseenter = () => {
          button.style.backgroundColor = "#d0d0d0";
          button.style.borderColor = "#888";
          button.style.transform = "translateY(-3px)";
          button.style.boxShadow = "0 6px 18px rgba(0,0,0,0.18)";
        };
        button.onmouseleave = () => {
          button.style.backgroundColor = "#e0e0e0";
          button.style.borderColor = "#aaaaaa";
          button.style.transform = "";
          button.style.boxShadow = "";
        };
      }
      return;
    }

    // Altre categorie: usa i colori dalla palette
    const c = getColor(categoryName);
    // Rimuovi eventuali listener precedenti
    button.onmouseenter = null;
    button.onmouseleave = null;

    if (isActive) {
      // Stato attivo: sfondo = colore del testo (scuro), testo bianco, bordo marcato
      button.style.cssText = `background-color:${c.text};color:#ffffff;border:3px solid ${c.text};transform:none;box-shadow:0 0 0 3px ${c.border}, 0 4px 14px ${c.border}88;`;
    } else {
      // Stato inattivo: sfondo chiaro, testo colorato
      button.style.cssText = `background-color:${c.bg};color:${c.text};border:2px solid ${c.border};`;
      button.onmouseenter = () => {
        button.style.backgroundColor = c.text;
        button.style.color = "#fff";
        button.style.borderColor = c.text;
        button.style.transform = "translateY(-3px)";
        button.style.boxShadow = `0 6px 18px ${c.border}88`;
      };
      button.onmouseleave = () => {
        button.style.backgroundColor = c.bg;
        button.style.color = c.text;
        button.style.borderColor = c.border;
        button.style.transform = "";
        button.style.boxShadow = "";
      };
    }
  }

  function createBadge(categoryName) {
    const span = document.createElement("span");
    span.className = "categoria-badge";
    span.textContent = categoryName;
    span.style.cssText = getBadgeStyle(categoryName);
    return span;
  }

  function getBadgesHTML(categories, prefix) {
    if (!categories || categories.length === 0) return "";
    const prefixHtml = prefix
      ? `<span class="categoria-label">${prefix}</span>`
      : "";
    const badgesHtml = categories
      .map(
        (cat) =>
          `<span class="categoria-badge" style="${getBadgeStyle(cat)}">${cat}</span>`
      )
      .join("");
    return `<p class="categoria-badges-wrapper">${prefixHtml}${badgesHtml}</p>`;
  }

  // Avvia il caricamento della palette
  init();

  return {
    init,
    getColor,
    getBadgeStyle,
    createBadge,
    getBadgesHTML,
    applyFilterButtonStyle,
  };
})();