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

  // ─── applyFilterButtonStyle ottimizzato sia per Button che per Select ───
  function applyFilterButtonStyle(element, categoryName, isActive) {
    if (!element) return;

    // Reset totale dei listener per evitare che l'hover rimanga "appeso" o bloccato su mobile
    element.onmouseenter = null;
    element.onmouseleave = null;

    // Rileva se l'elemento è una <select> (mobile) o un <button> (desktop)
    const isSelect = element.tagName.toLowerCase() === "select";
    const isDesktop = window.matchMedia("(pointer: fine)").matches;

    // Recupera i colori (se "Tutti", usa i grigi/neri di default di sistema)
    const isTutti = categoryName === "Tutti" || !categoryName;
    const c = isTutti ? { bg: "#e0e0e0", text: "#2d2d2d", border: "#aaaaaa" } : getColor(categoryName);

    // 1. GESTIONE SPECIFICA SE L'ELEMENTO È UNA SELECT (Stato Selezionato su Mobile)
    if (isSelect) {
      if (isActive) {
        // Quando la select ha la categoria correntemente selezionata e attiva
        element.style.cssText = isTutti
          ? "background-color:#2d2d2d;color:#ffffff;border:2px solid #2d2d2d;outline:none;-webkit-tap-highlight-color:transparent;font-weight:bold;padding:6px 10px;border-radius:4px;font-size:14px;appearance:none;-webkit-appearance:none;"
          : `background-color:${c.text};color:#ffffff;border:2px solid ${c.text};outline:none;-webkit-tap-highlight-color:transparent;font-weight:bold;padding:6px 10px;border-radius:4px;font-size:14px;appearance:none;-webkit-appearance:none;`;
      } else {
        // Stato normale / inattivo della select
        element.style.cssText = `background-color:${c.bg};color:${c.text};border:2px solid ${c.border};outline:none;-webkit-tap-highlight-color:transparent;padding:6px 10px;border-radius:4px;font-size:14px;appearance:none;-webkit-appearance:none;`;
      }
      return; // Interrompe l'esecuzione qui per gli elementi select
    }

    // 2. GESTIONE SE L'ELEMENTO È UN BOTTONE CLASSICO (Layout Desktop / Tablet)
    if (isTutti) {
      if (isActive) {
        element.style.cssText =
          "background-color:#2d2d2d;color:#ffffff;border:3px solid #2d2d2d;transform:none;box-shadow:0 0 0 3px #888;outline:none;-webkit-tap-highlight-color:transparent;";
      } else {
        element.style.cssText =
          "background-color:#e0e0e0;color:#333333;border:2px solid #aaaaaa;outline:none;-webkit-tap-highlight-color:transparent;";
        
        if (isDesktop) {
          element.onmouseenter = () => {
            element.style.backgroundColor = "#d0d0d0";
            element.style.borderColor = "#888";
            element.style.transform = "translateY(-3px)";
            element.style.boxShadow = "0 6px 18px rgba(0,0,0,0.18)";
          };
          element.onmouseleave = () => {
            element.style.backgroundColor = "#e0e0e0";
            element.style.borderColor = "#aaaaaa";
            element.style.transform = "";
            element.style.boxShadow = "";
          };
        }
      }
    } else {
      if (isActive) {
        element.style.cssText = `background-color:${c.text};color:#ffffff;border:3px solid ${c.text};transform:none;box-shadow:0 0 0 3px ${c.border};outline:none;-webkit-tap-highlight-color:transparent;`;
      } else {
        element.style.cssText = `background-color:${c.bg};color:${c.text};border:2px solid ${c.border};outline:none;-webkit-tap-highlight-color:transparent;`;
        
        if (isDesktop) {
          element.onmouseenter = () => {
            element.style.backgroundColor = c.text;
            element.style.color = "#fff";
            element.style.borderColor = c.text;
            element.style.transform = "translateY(-3px)";
            element.style.boxShadow = `0 6px 18px ${c.border}88`;
          };
          element.onmouseleave = () => {
            element.style.backgroundColor = c.bg;
            element.style.color = c.text;
            element.style.borderColor = c.border;
            element.style.transform = "";
            element.style.boxShadow = "";
          };
        }
      }
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
          `<span class="categoria-badge" style="${getBadgeStyle(cat)}">${cat}</span>`,
      )
      .join("");
    return `<p class="categoria-badges-wrapper">${prefixHtml}${badgesHtml}</p>`;
  }

  // Inizializza i colori
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