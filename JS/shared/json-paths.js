// ─────────────────────────────────────────────────────────────────────────────
// json-paths.js — Utility per i path dei JSON
// Se la pagina è in una cartella "projects" o "project", usa "../JSON/"
// altrimenti usa "JSON/"
// ─────────────────────────────────────────────────────────────────────────────
const JsonPaths = (() => {
  const pathSegments = window.location.pathname
    .split("/")
    .filter((seg) => seg.length > 0);

  // Rimuove l'ultimo segmento se è un file (contiene un punto)
  const last = pathSegments[pathSegments.length - 1];
  if (last && last.includes(".")) {
    pathSegments.pop();
  }

  // Controlla se uno dei segmenti è "projects" o "project" (case‑insensitive)
  const isInProjects = pathSegments.some(
    (seg) => seg.toLowerCase() === "projects" || seg.toLowerCase() === "project"
  );

  // Sceglie il prefisso giusto
  const basePath = isInProjects ? "../JSON/" : "JSON/";

  function get(jsonFilename) {
    if (!jsonFilename) throw new Error("JsonPaths.get: filename mancante");
    return basePath + jsonFilename;
  }

  return { get };
})();