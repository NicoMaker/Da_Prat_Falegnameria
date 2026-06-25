// ──────────────────────────────────────────────────────────────
// category-colors.js — Gestione colori FISSI (Sfondo Bianco / Scritta Nera)
// ──────────────────────────────────────────────────────────────

const CategoryColors = (() => {
  // Configurazione unica per TUTTI gli elementi
  const FIXED_COLOR = { bg: "#ffffff", text: "#000000", border: "#cccccc" };
  const ACTIVE_COLOR = { bg: "#000000", text: "#ffffff", border: "#000000" }; // Inverte al click per dare feedback di selezione

  let isLoaded = false;

  /**
   * Forziamo il caricamento con lo stile unico
   */
  async function init() {
    isLoaded = true;
    console.log("CategoryColors inizializzato in modalità Monochrome (Bianco/Nero).");
  }

  // Ritorna sempre lo stesso oggetto colore per qualsiasi categoria
  function getColor(categoryName) {
    return FIXED_COLOR;
  }

  function getBadgeStyle(categoryName) {
    return `background-color:${FIXED_COLOR.bg};color:${FIXED_COLOR.text};border:1px solid ${FIXED_COLOR.border};`;
  }

  // ─── applyFilterButtonStyle ottimizzato e uniformato ───
  function applyFilterButtonStyle(element, categoryName, isActive) {
    if (!element) return;

    // Reset totale dei listener per l'hover
    element.onmouseenter = null;
    element.onmouseleave = null;

    const isSelect = element.tagName.toLowerCase() === "select";
    const isDesktop = window.matchMedia("(pointer: fine)").matches;

    // 1. GESTIONE SE L'ELEMENTO È UNA SELECT (Mobile)
    if (isSelect) {
      if (isActive) {
        // Se attivo diventa sfondo nero e testo bianco
        element.style.cssText = `background-color:${ACTIVE_COLOR.bg};color:${ACTIVE_COLOR.text};border:2px solid ${ACTIVE_COLOR.border};outline:none;-webkit-tap-highlight-color:transparent;font-weight:bold;padding:6px 10px;border-radius:4px;font-size:14px;appearance:none;-webkit-appearance:none;`;
      } else {
        // Altrimenti sfondo bianco e testo nero
        element.style.cssText = `background-color:${FIXED_COLOR.bg};color:${FIXED_COLOR.text};border:2px solid ${FIXED_COLOR.border};outline:none;-webkit-tap-highlight-color:transparent;padding:6px 10px;border-radius:4px;font-size:14px;appearance:none;-webkit-appearance:none;`;
      }
      return;
    }

    // 2. GESTIONE SE L'ELEMENTO È UN BOTTONE (Desktop / Tablet)
    if (isActive) {
      // Bottone attivo: Sfondo Nero, Testo Bianco
      element.style.cssText = `background-color:${ACTIVE_COLOR.bg};color:${ACTIVE_COLOR.text};border:3px solid ${ACTIVE_COLOR.border};transform:none;box-shadow:0 0 0 3px #888;outline:none;-webkit-tap-highlight-color:transparent;`;
    } else {
      // Bottone normale: Sfondo Bianco, Testo Nero
      element.style.cssText = `background-color:${FIXED_COLOR.bg};color:${FIXED_COLOR.text};border:2px solid ${FIXED_COLOR.border};outline:none;-webkit-tap-highlight-color:transparent;`;
      
      // Hover discreto (diventa un grigio leggerissimo sullo sfondo per dare feedback visivo)
      if (isDesktop) {
        element.onmouseenter = () => {
          element.style.backgroundColor = "#f5f5f5";
          element.style.borderColor = "#333333";
          element.style.transform = "translateY(-3px)";
          element.style.boxShadow = "0 6px 18px rgba(0,0,0,0.1)";
        };
        element.onmouseleave = () => {
          element.style.backgroundColor = FIXED_COLOR.bg;
          element.style.borderColor = FIXED_COLOR.border;
          element.style.transform = "";
          element.style.boxShadow = "";
        };
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

  // Inizializza immediatamente
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