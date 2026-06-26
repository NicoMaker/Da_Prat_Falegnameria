/**
 * breadcrumb.js
 * Genera il breadcrumb nelle pagine prodotto con dropdown categorie su "Prodotti".
 */
document.addEventListener("DOMContentLoaded", function() {
  var container = document.querySelector(".product-breadcrumb");
  if (!container) return;

  // Nome prodotto
  var productName = "";
  var h1 = document.querySelector("h1.product-title") || document.querySelector("h1");
  if (h1) productName = h1.innerText.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  if (!productName) {
    var titleTag = document.querySelector("title");
    if (titleTag) productName = titleTag.textContent.split("—")[0].trim();
  }

  // Percorso root
  var depth = window.location.pathname.split("/").filter(Boolean).length - 1;
  var root = depth > 0 ? "../".repeat(depth) : "./";

  // Categorie (Porte raggruppate)
  var PORTE = ["Porte Interne", "Porte Scorrevoli", "Porte Blindate"];
  var ALL_CATS = ["Tutti", "Serramenti PVC", "Serramenti Alluminio", "Serramenti Legno", "Porte", "Ombreggiatura"];

  // Costruisce il breadcrumb con dropdown su "Prodotti"
  container.innerHTML =
    '<a href="' + root + 'index.html" class="bc-link">Home</a>' +
    '<span class="bc-sep">›</span>' +
    '<span class="bc-prodotti-wrapper">' +
      '<a href="' + root + 'index.html#prodotti" class="bc-link bc-prodotti-toggle">' +
        'Prodotti <span class="bc-arrow">▾</span>' +
      '</a>' +
      '<ul class="bc-dropdown">' +
        ALL_CATS.map(function(cat) {
          return '<li><a href="' + root + 'index.html#prodotti" class="bc-dropdown-link" data-prod-filter="' + cat + '">' + cat + '</a></li>';
        }).join("") +
      '</ul>' +
    '</span>' +
    '<span class="bc-sep">›</span>' +
    '<span class="bc-current">' + productName + '</span>';

  // Salva filtro in sessionStorage prima di navigare
  container.querySelectorAll(".bc-dropdown-link").forEach(function(link) {
    link.addEventListener("click", function() {
      sessionStorage.setItem("prodFilter", this.dataset.prodFilter);
    });
  });

  // Toggle dropdown al click sul toggle (mobile + desktop)
  var toggle = container.querySelector(".bc-prodotti-toggle");
  var dropdown = container.querySelector(".bc-dropdown");
  if (toggle && dropdown) {
    toggle.addEventListener("click", function(e) {
      var open = dropdown.classList.contains("bc-open");
      if (!open) e.preventDefault();
      dropdown.classList.toggle("bc-open");
      var arrow = this.querySelector(".bc-arrow");
      if (arrow) arrow.style.transform = open ? "" : "rotate(180deg)";
    });
    // Chiudi cliccando fuori
    document.addEventListener("click", function(e) {
      if (!container.contains(e.target)) {
        dropdown.classList.remove("bc-open");
        var arrow = toggle.querySelector(".bc-arrow");
        if (arrow) arrow.style.transform = "";
      }
    });
  }
});
