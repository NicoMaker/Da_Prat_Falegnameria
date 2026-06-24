// ─────────────────────────────────────────────────────────────────────────────
// json-paths.js — Utility unica per calcolare i path dei JSON
// Uso:
//   JsonPaths.get("progetti.json")  -> "JSON/progetti.json" oppure "../JSON/progetti.json"
//   JsonPaths.get("footer.json")    -> "JSON/footer.json"   oppure "../JSON/footer.json"
//   JsonPaths.get("palette.json")   -> "JSON/palette.json"  oppure "../JSON/palette.json"
// ─────────────────────────────────────────────────────────────────────────────
const JsonPaths = (() => {
  // Calcola il percorso base per raggiungere la cartella JSON
  // a partire dalla posizione della pagina HTML corrente.
  const pathSegments = window.location.pathname.split('/').filter(seg => seg.length > 0);
  
  // Rimuove l'ultimo segmento se è un nome di file (contiene un punto)
  const last = pathSegments[pathSegments.length - 1];
  if (last && last.includes('.')) {
    pathSegments.pop();
  }
  
  // Numero di cartelle da risalire per tornare alla root
  const upLevels = pathSegments.length;
  // Se siamo nella root, base = "JSON/", altrimenti base = "../" * upLevels + "JSON/"
  const basePath = upLevels > 0 ? '../'.repeat(upLevels) + 'JSON/' : 'JSON/';

  function get(jsonFilename) {
    if (!jsonFilename) throw new Error("JsonPaths.get: filename mancante");
    return basePath + jsonFilename;
  }

  return { get };
})();