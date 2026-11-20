// ─────────────────────────────────────────────────────────────────────────────
// back-button.js — "Torna a tutti i ..." dinamico in base al punto di riferimento
// Dipende da: entry-point.js (EntryPoint)
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const link = document.getElementById("product-back-button");
  const label = document.getElementById("product-back-label");
  if (!link || typeof EntryPoint === "undefined") return;

  const cfg = EntryPoint.getConfig(EntryPoint.get());

  const root =
    typeof JsonPaths !== "undefined" && JsonPaths.root
      ? JsonPaths.root
      : new URL("../../", window.location.href).href;
  link.href = `${root}index.html#${cfg.homeAnchor}`;
  if (label) label.textContent = cfg.backLabel;
});
