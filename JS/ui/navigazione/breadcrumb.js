/**
 * breadcrumb.js
 * Genera il breadcrumb nelle pagine prodotto con dropdown categorie su "Prodotti",
 * leggendo le categorie dinamicamente dal file JSON dei prodotti.
 */
document.addEventListener("DOMContentLoaded", function () {
  var container = document.querySelector(".product-breadcrumb");
  if (!container) return;

  // Nome prodotto
  var productName = "";
  var h1 =
    document.querySelector("h1.product-title") || document.querySelector("h1");
  if (h1)
    productName = h1.innerText.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  if (!productName) {
    var titleTag = document.querySelector("title");
    if (titleTag) productName = titleTag.textContent.split("—")[0].trim();
  }

  // Percorso root — risali di un solo livello da Projects/
  var pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts[pathParts.length - 1].includes(".")) pathParts.pop();
  var root = pathParts.length > 0 ? "../" : "./";

  // Percorso del file JSON prodotti (un solo livello sopra "root", non due)
  var JSON_PATH = root + "JSON/progetti.json";

  // Punto di riferimento: sezione della Home da cui l'utente è entrato
  // (Serramenti / Porte / Sistemi Oscuranti / Prodotti). Se il modulo non è
  // caricato, si ricade sempre su "Prodotti" come prima.
  var entryCfg =
    typeof EntryPoint !== "undefined"
      ? EntryPoint.getConfig(EntryPoint.get())
      : {
          label: "Prodotti",
          homeAnchor: "prodotti",
        };

  // Costruisce lo scheletro del breadcrumb (senza dropdown, riempito dopo il fetch)
  function renderBreadcrumb(catLinksHtml) {
    container.innerHTML =
      '<a href="' +
      root +
      'index.html" class="bc-link">Home</a>' +
      '<span class="bc-sep">›</span>' +
      '<span class="bc-prodotti-wrapper">' +
      '<a href="' +
      root +
      "index.html#" +
      entryCfg.homeAnchor +
      '" class="bc-link bc-prodotti-toggle">' +
      entryCfg.label +
      "</a>" +
      "</span>" +
      '<span class="bc-sep">›</span>' +
      '<span class="bc-current">' +
      productName +
      "</span>";

    attachDropdownEvents();
  }

  function attachDropdownEvents() {
    // Salva filtro in sessionStorage prima di navigare
    container.querySelectorAll(".bc-dropdown-link").forEach(function (link) {
      link.addEventListener("click", function () {
        sessionStorage.setItem("prodFilter", this.dataset.prodFilter);
      });
    });

    // Toggle dropdown al click sul toggle (mobile + desktop)
    var toggle = container.querySelector(".bc-prodotti-toggle");
    var dropdown = container.querySelector(".bc-dropdown");
    if (toggle && dropdown) {
      toggle.addEventListener("click", function (e) {
        var open = dropdown.classList.contains("bc-open");
        if (!open) e.preventDefault();
        dropdown.classList.toggle("bc-open");
        var arrow = this.querySelector(".bc-arrow");
        if (arrow) arrow.style.transform = open ? "" : "rotate(180deg)";
      });
      // Chiudi cliccando fuori
      document.addEventListener("click", function (e) {
        if (!container.contains(e.target)) {
          dropdown.classList.remove("bc-open");
          var arrow = toggle.querySelector(".bc-arrow");
          if (arrow) arrow.style.transform = "";
        }
      });
    }
  }

  // Carica il JSON e costruisce le categorie uniche dinamicamente
  fetch(JSON_PATH)
    .then(function (res) {
      if (!res.ok) throw new Error("Impossibile caricare " + JSON_PATH);
      return res.json();
    })
    .then(function (data) {
      var prodotti =
        typeof ProductsFlat !== "undefined"
          ? ProductsFlat.getAll(data)
          : [].concat(
              (data && data.prodotti) || [],
              (data && data.porte) || [],
              (data && data.serramenti) || [],
            );
      var catSet = new Set();
      prodotti.forEach(function (p) {
        (p.categorie || []).forEach(function (cat) {
          catSet.add(cat);
        });
      });
      var ALL_CATS = Array.from(catSet);

      var catLinksHtml = ALL_CATS.map(function (cat) {
        return (
          '<li><a href="' +
          root +
          'index.html#prodotti" class="bc-dropdown-link" data-prod-filter="' +
          cat +
          '">' +
          cat +
          "</a></li>"
        );
      }).join("");

      renderBreadcrumb(catLinksHtml);
    })
    .catch(function (err) {
      console.error("Errore caricamento categorie breadcrumb:", err);
      // Fallback: breadcrumb senza dropdown popolato, in caso di errore di fetch
      renderBreadcrumb("");
    });
});
