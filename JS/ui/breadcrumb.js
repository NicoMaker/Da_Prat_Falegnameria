/**
 * breadcrumb.js
 * Genera automaticamente il breadcrumb nelle pagine prodotto
 * leggendo l'<h1> e il <title> della pagina corrente.
 *
 * Struttura HTML attesa: <div class="product-breadcrumb"></div>
 *
 * Risultato: Home › Prodotti › <nome prodotto>
 */
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".product-breadcrumb");
  if (!container) return;

  // Determina il nome prodotto:
  // 1. Cerca h1.product-title
  // 2. Fallback: primo <h1>
  // 3. Fallback: <title> (parte prima di " —")
  let productName = "";
  const h1 =
    document.querySelector("h1.product-title") || document.querySelector("h1");
  if (h1) {
    // Prende il testo pulito (rimuove eventuali <br> sostituendoli con spazio)
    productName = h1.innerText.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  }
  if (!productName) {
    const titleTag = document.querySelector("title");
    if (titleTag) {
      productName = titleTag.textContent.split("—")[0].trim();
    }
  }

  // Calcola il percorso relativo verso la root
  // Se siamo in /Projects/xxx.html → root è ../
  const depth = window.location.pathname.split("/").filter(Boolean).length - 1;
  const root = depth > 0 ? "../".repeat(depth) : "./";

  // Costruisce il breadcrumb
  container.innerHTML = `
    <a href="${root}index.html">Home</a>
    <span class="sep">›</span>
    <a href="${root}index.html#prodotti">Prodotti</a>
    <span class="sep">›</span>
    <span>${productName}</span>
  `;
});
