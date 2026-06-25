// ──────────────────────────────────────────────────────────────
// category-colors.js — Gestione colori FISSI (Sfondo Bianco / Scritta Nera SEMPRE)
// ──────────────────────────────────────────────────────────────

const CategoryColors = (() => {
  // Unico schema colore per tutto, sia attivo che inattivo
  const FIXED_COLOR = { bg: "#ffffff", text: "#000000", border: "#cccccc" };
  const ACTIVE_BORDER = "#000000"; // Bordo più scuro/spesso per l'elemento selezionato

  let isLoaded = false;

  async function init() {
    isLoaded = true;
    console.log("CategoryColors inizializzato: Tutto Bianco e Nero.");
  }

  function getColor(categoryName) {
    return FIXED_COLOR;
  }

  function getBadgeStyle(categoryName) {
    return `background-color:${FIXED_COLOR.bg};color:${FIXED_COLOR.text};border:1px solid ${FIXED_COLOR.border};`;
  }

  function applyFilterButtonStyle(element, categoryName, isActive) {
    if (!element) return;

    // Reset listener hover
    element.onmouseenter = null;
    element.onmouseleave = null;

    const isSelect = element.tagName.toLowerCase() === "select";
    const isDesktop = window.matchMedia("(pointer: fine)").matches;

    // 1. GESTIONE SELECT (Mobile)
    if (isSelect) {
      if (isActive) {
        // Rimane bianco e nero, ma con bordo nero più spesso per indicare che è attivo
        element.style.cssText = `background-color:${FIXED_COLOR.bg};color:${FIXED_COLOR.text};border:2px solid ${ACTIVE_BORDER};font-weight:bold;outline:none;-webkit-tap-highlight-color:transparent;padding:6px 10px;border-radius:4px;font-size:14px;appearance:none;-webkit-appearance:none;`;
      } else {
        // Stato normale
        element.style.cssText = `background-color:${FIXED_COLOR.bg};color:${FIXED_COLOR.text};border:2px solid ${FIXED_COLOR.border};outline:none;-webkit-tap-highlight-color:transparent;padding:6px 10px;border-radius:4px;font-size:14px;appearance:none;-webkit-appearance:none;`;
      }
      return;
    }

    // 2. GESTIONE BOTTONE (Desktop / Tablet)
    if (isActive) {
      // Bottone attivo: Sfondo Bianco, Testo Nero, ma evidenziato da bordo più spesso e ombra di focus
      element.style.cssText = `background-color:${FIXED_COLOR.bg};color:${FIXED_COLOR.text};border:3px solid ${ACTIVE_BORDER};transform:none;box-shadow:0 0 0 3px rgba(0,0,0,0.1);outline:none;-webkit-tap-highlight-color:transparent;font-weight:bold;`;
    } else {
      // Bottone normale
      element.style.cssText = `background-color:${FIXED_COLOR.bg};color:${FIXED_COLOR.text};border:2px solid ${FIXED_COLOR.border};outline:none;-webkit-tap-highlight-color:transparent;`;

      if (isDesktop) {
        element.onmouseenter = () => {
          element.style.backgroundColor = "#f9f9f9"; // Un briciolo di feedback all'hover
          element.style.borderColor = "#888888";
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
