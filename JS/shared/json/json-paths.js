// ─────────────────────────────────────────────────────────────────────────────
// json-paths.js — Utility per i path dei JSON e della root del sito
//
// FIX: prima usava "../JSON/" per qualsiasi pagina dentro "Projects", ma le
// pagine prodotto stanno in Projects/<Categoria>/pagina.html (2 livelli sotto
// la root), quindi il percorso puntava a Projects/JSON/... (inesistente) e il
// footer/breadcrumb/menu non si caricavano.
//
// Ora la root del sito viene ricavata dall'URL di questo stesso script
// (JS/shared/json/json-paths.js -> 3 livelli sopra = root), quindi funziona
// ovunque: index.html, Projects/X/pagina.html, GitHub Pages in sottocartella,
// Live Server, ecc.
//
// Uso:
//   JsonPaths.get("footer.json")  -> URL assoluto del JSON
//   JsonPaths.root                -> URL assoluto della root del sito (con "/" finale)
//   JsonPaths.page("index.html#home") -> URL assoluto di una pagina della root
// ─────────────────────────────────────────────────────────────────────────────
const JsonPaths = (() => {
  const SCRIPT_DEPTH_UP = "../../../"; // da JS/shared/json/ alla root

  function _rootFromScript() {
    try {
      let src = document.currentScript && document.currentScript.src;
      if (!src) {
        const tag = Array.from(document.getElementsByTagName("script")).find(
          (s) => /json-paths\.js(\?.*)?$/.test(s.src || ""),
        );
        src = tag && tag.src;
      }
      if (src) return new URL(SCRIPT_DEPTH_UP, src).href;
    } catch (e) {
      /* passa al fallback */
    }
    return null;
  }

  function _rootFromPath() {
    // Fallback: conta i livelli dopo la cartella "Projects"
    const segs = window.location.pathname.split("/").filter(Boolean);
    const last = segs[segs.length - 1];
    if (last && last.includes(".")) segs.pop();
    const idx = segs.findIndex((s) => /^projects?$/i.test(s));
    const depth = idx === -1 ? 0 : segs.length - idx;
    return new URL("../".repeat(depth) || "./", window.location.href).href;
  }

  const root = _rootFromScript() || _rootFromPath();
  const basePath = root + "JSON/";

  function get(jsonFilename) {
    if (!jsonFilename) throw new Error("JsonPaths.get: filename mancante");
    return basePath + jsonFilename;
  }

  function page(path) {
    return root + String(path || "").replace(/^\/+/, "");
  }

  return { get, page, root };
})();
