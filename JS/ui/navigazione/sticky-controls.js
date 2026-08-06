// sticky-controls.js
// Gestisce il calcolo dinamico dell'altezza dell'header per i controlli sticky

document.addEventListener("DOMContentLoaded", () => {
  const siteHeader = document.querySelector(".site-header");
  const stickyControls = document.getElementById("product-controls-sticky");

  // Funzione per calcolare e impostare l'altezza dell'header
  function setHeaderHeight() {
    if (siteHeader && stickyControls) {
      const headerHeight = siteHeader.offsetHeight;

      // Imposta la posizione sticky in base all'altezza reale dell'header
      // Aggiungiamo 5px di margine per evitare sovrapposizioni
      const stickyTop = headerHeight + 5;
      stickyControls.style.top = `${stickyTop}px`;

      console.log(
        `🔧 Header height: ${headerHeight}px - Sticky top: ${stickyTop}px`,
      );
    }

    // Trova la tua select dei filtri mobile tramite la classe o l'id reale che usi nell'HTML
    const selectFiltroMobile =
      document.querySelector(".product-select-filter") ||
      document.getElementById("mobile-category-select");

    if (selectFiltroMobile) {
      // Gestione del cambio di selezione
      selectFiltroMobile.addEventListener("change", (e) => {
        const categoriaScelta = e.target.value; // Legge ad esempio "Marrone" o "Tutti"

        // Cambia in tempo reale il colore di sfondo della select in base alla categoria scelta
        CategoryColors.applyFilterButtonStyle(
          selectFiltroMobile,
          categoriaScelta,
          true,
        );
      });

      // Imposta lo stile iniziale (Default su "Tutti") al caricamento della pagina
      CategoryColors.applyFilterButtonStyle(selectFiltroMobile, "Tutti", true);
    }
  }

  // Imposta l'altezza iniziale
  setHeaderHeight();

  // Ricalcola quando la finestra viene ridimensionata
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setHeaderHeight, 100);
  });

  // Ricalcola quando cambia l'orientamento del dispositivo
  window.addEventListener("orientationchange", () => {
    setTimeout(setHeaderHeight, 300);
  });

  // Ricalcola quando si scrolla verso la sezione prodotti
  window.addEventListener(
    "scroll",
    () => {
      setHeaderHeight();
    },
    { passive: true },
  );

  console.log("✅ Sistema sticky controls inizializzato");
});
