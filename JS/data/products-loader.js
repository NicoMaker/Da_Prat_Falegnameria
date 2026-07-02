// ─────────────────────────────────────────────────────────────────────────────
// products-loader.js — Unico punto di fetch (home).
// Carica `JSON/progetti.json` e lo condivide tramite evento "prodottiCaricati".
// Dipende da: products-section-config.js (CONFIG globale)
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  JsonData.load(CONFIG.jsonKey)
    .then((data) => {
      const prodotti =
        typeof ProductsFlat !== "undefined"
          ? ProductsFlat.getAll(data)
          : data.prodotti || [];
      document.dispatchEvent(
        new CustomEvent("prodottiCaricati", {
          detail: { prodotti },
        }),
      );
    })
    .catch((error) => {
      console.error("Errore nel caricamento dei prodotti:", error);
      document.dispatchEvent(new CustomEvent("prodottiErrore"));
    });
});
