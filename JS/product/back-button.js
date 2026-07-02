// ─────────────────────────────────────────────────────────────────────────────
// back-button.js — "Torna a tutti i ..." dinamico in base al punto di riferimento
// Dipende da: entry-point.js (EntryPoint)
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const link = document.getElementById("product-back-button");
  const label = document.getElementById("product-back-label");
  if (!link || typeof EntryPoint === "undefined") return;

  const cfg = EntryPoint.getConfig(EntryPoint.get());

  link.href = `../index.html#${cfg.homeAnchor}`;
  if (label) label.textContent = cfg.backLabel;
});
