// ─────────────────────────────────────────────────────────────────────────────
// product-page.js — Carica automaticamente le categorie dal JSON
// per qualsiasi pagina prodotto. Nessuno script inline necessario.
// Dipende da: category-colors.js
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const badgesEl = document.getElementById("product-category-badges");
  if (!badgesEl) return;

  // Ricava il nome del file HTML corrente (es. "prodotto-cotoletta.html")
  const currentFile = window.location.pathname.split("/").pop();

  JsonData.load(AppConfig.products.jsonKey)
    .then((data) => {
      // Cerca il prodotto il cui link termina con il file corrente
      // (cerca in prodotti + porte + serramenti, non solo in "prodotti")
      const prodotto = ProductsFlat.findByLink(data, currentFile);

      if (prodotto && prodotto.categorie && prodotto.categorie.length > 0) {
        badgesEl.innerHTML = CategoryColors.getBadgesHTML(prodotto.categorie);
      } else {
        badgesEl.style.display = "none";
      }
    })
    .catch((err) => {
      console.warn("product-page.js: impossibile caricare le categorie.", err);
      badgesEl.style.display = "none";
    });
});
