// ─────────────────────────────────────────────────────────────────────────────
// products-flat.js — Unisce i tre array del JSON progetti (prodotti/porte/serramenti)
// in un'unica lista, taggando ogni elemento con la sua sezione di origine (_sezione).
//
// Usato da: breadcrumb.js, nav-builder.js, product/product-page.js
// (prima leggevano erroneamente "data.Prodotti", chiave inesistente nel JSON:
// le chiavi reali sono minuscole "prodotti" / "porte" / "serramenti").
// ─────────────────────────────────────────────────────────────────────────────

const ProductsFlat = (() => {
  function _tag(arr, sezione) {
    return (arr || []).map((p) => Object.assign({ _sezione: sezione }, p));
  }

  // Ritorna TUTTI i prodotti (prodotti + porte + serramenti) in un solo array
  function getAll(data) {
    if (!data) return [];
    return [].concat(
      _tag(data.prodotti, "prodotti"),
      _tag(data.porte, "porte"),
      _tag(data.serramenti, "serramenti"),
    );
  }

  // Trova il prodotto il cui "link" punta al file HTML corrente
  function findByLink(data, currentFileName) {
    return getAll(data).find((p) => {
      if (!p.link || p.link === "#") return false;
      return p.link.split("/").pop() === currentFileName;
    });
  }

  return { getAll, findByLink };
})();
