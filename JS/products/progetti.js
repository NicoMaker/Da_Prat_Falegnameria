// ──────────────────────────────────────────────────────────────
// progetti.js — Solo sezioni Serramenti, Porte, Oscuranti
// ──────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const serramentiContainer = document.getElementById("serramenti-grid");
  const porteContainer = document.getElementById("porte-grid");
  const oscurantiContainer = document.getElementById("oscuranti-grid");

  let serramentiProducts = [];
  let porteProducts = [];
  let scorrevoliProducts = [];
  let oscurantiProducts = [];

  // ── Caricamento diretto del JSON ──────────────────────────
  async function caricaProdotti() {
    try {
      const data = await JsonData.load("progetti");
      console.log("📦 JSON caricato:", data);

      serramentiProducts = data.serramenti || [];
      porteProducts = data.porte || [];
      scorrevoliProducts = data.scorrevoli || [];
      oscurantiProducts = data.oscuranti || [];

      // Fallback solo se tutte le sezioni sono vuote
      if (
        serramentiProducts.length === 0 &&
        porteProducts.length === 0 &&
        scorrevoliProducts.length === 0 &&
        oscurantiProducts.length === 0
      ) {
        console.warn("⚠️ Nessun dato nel JSON. Uso fallback di esempio.");
        const fallback = [
          {
            id: "serramento-pvc",
            nome: "PVC",
            categorie: ["Serramenti PVC"],
            descrizione: "Infissi in PVC...",
            immagine: "Img/Serramenti_Section/PVC.png",
            link: "#",
          },
          {
            id: "serramento-alluminio",
            nome: "Alluminio",
            categorie: ["Serramenti Alluminio"],
            descrizione: "Infissi in alluminio...",
            immagine: "Img/Serramenti_Section/AlU.png",
            link: "#",
          },
          {
            id: "serramento-legno",
            nome: "Legno",
            categorie: ["Serramenti Legno"],
            descrizione: "Infissi in legno...",
            immagine: "Img/Serramenti_Section/Legno.png",
            link: "#",
          },
          {
            id: "porte-interne",
            nome: "Interne",
            categorie: ["Porte Interne"],
            descrizione: "Porte interne...",
            immagine: "Img/Porte_section/Interne/1.png",
            link: "#",
          },
          {
            id: "porte-scorrevoli",
            nome: "Scorrevoli",
            categorie: ["Porte Scorrevoli"],
            descrizione: "Sistemi scorrevoli...",
            immagine: "Img/Scorrevoli_Section/1.png",
            link: "#",
          },
          {
            id: "porte-blindate",
            nome: "Blindate",
            categorie: ["Porte Blindate"],
            descrizione: "Porte blindate...",
            immagine: "Img/Porte_section/ingresso/1.png",
            link: "#",
          },
        ];
        serramentiProducts = fallback.filter((p) =>
          p.categorie.some((c) => c.startsWith("Serramenti")),
        );
        porteProducts = fallback.filter((p) =>
          p.categorie.some((c) => /^Porte\s+(Interne|Blindate)/i.test(c)),
        );
        scorrevoliProducts = fallback.filter((p) =>
          p.categorie.some((c) => /^Porte\s+Scorrevoli/i.test(c)),
        );
      }

      console.log(
        `✅ Caricati: ${serramentiProducts.length} serramenti, ${porteProducts.length} porte, ${scorrevoliProducts.length} scorrevoli, ${oscurantiProducts.length} oscuranti`,
      );

      populateSerramenti();
      populatePorte();
      populateOscuranti();

      // Gestione anchor per scroll alla sezione
      if (window.location.hash === "#Prodotti") {
        const section = document.getElementById("Prodotti");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("❌ Errore caricamento JSON:", error);
      // Mostra messaggi di errore nei singoli contenitori
      if (serramentiContainer)
        serramentiContainer.innerHTML =
          "<p class='no-results'>Errore nel caricamento dei serramenti.</p>";
      if (porteContainer)
        porteContainer.innerHTML =
          "<p class='no-results'>Errore nel caricamento delle porte.</p>";
      if (oscurantiContainer)
        oscurantiContainer.innerHTML =
          "<p class='no-results'>Errore nel caricamento degli oscuranti.</p>";
    }
  }

  // ── Avvia il caricamento ────────────────────────────────────
  caricaProdotti();

  // ── Popola la sezione Serramenti ──────────────────────────
  function populateSerramenti() {
    if (!serramentiContainer) {
      console.warn("⚠️ Contenitore serramenti-grid non trovato");
      return;
    }
    serramentiContainer.innerHTML = "";
    if (serramentiProducts.length === 0) {
      serramentiContainer.innerHTML =
        "<p class='no-results'>Nessun serramento disponibile.</p>";
      return;
    }
    serramentiProducts.forEach((p) =>
      serramentiContainer.appendChild(createProductCard(p, "serramenti")),
    );
  }

  // ── Popola la sezione Sistemi Oscuranti ──────────────────
  function populateOscuranti() {
    if (!oscurantiContainer) {
      console.warn("⚠️ Contenitore oscuranti-grid non trovato");
      return;
    }
    oscurantiContainer.innerHTML = "";
    if (oscurantiProducts.length === 0) {
      oscurantiContainer.innerHTML =
        "<p class='no-results'>Nessun sistema oscurante disponibile.</p>";
      return;
    }
    oscurantiProducts.forEach((p) =>
      oscurantiContainer.appendChild(createProductCard(p, "oscuranti")),
    );
  }

  // ── Popola la sezione Porte (unisce porte + scorrevoli) ──
  function populatePorte() {
    if (!porteContainer) {
      console.warn("⚠️ Contenitore porte-grid non trovato");
      return;
    }
    const tutteLePorte = [...porteProducts, ...scorrevoliProducts];
    porteContainer.innerHTML = "";
    if (tutteLePorte.length === 0) {
      porteContainer.innerHTML =
        "<p class='no-results'>Nessuna porta disponibile.</p>";
      return;
    }
    const ordine = ["Interne", "Scorrevoli", "Blindate"];
    tutteLePorte.sort(
      (a, b) => ordine.indexOf(a.nome) - ordine.indexOf(b.nome),
    );
    tutteLePorte.forEach((p) =>
      porteContainer.appendChild(createProductCard(p, "porte")),
    );
  }

  // ── Crea una card prodotto (usata da tutte le sezioni) ──
  function createProductCard(item, sezione) {
    const card = document.createElement("div");
    card.className = "Progetti-card";
    card.addEventListener("click", () => {
      if (item.link && item.link !== "#") {
        if (typeof EntryPoint !== "undefined") {
          EntryPoint.set(sezione || "prodotti");
        }
        window.open(item.link, "_blank");
      }
    });

    const hasLink = item.link && item.link !== "#";
    if (hasLink) card.style.cursor = "pointer";

    card.innerHTML = `
      <div class="container-immagine">
        <img class="immagine" src="${item.immagine}" alt="${item.nome}" loading="lazy">
        ${hasLink ? '<div class="card-hover-overlay"><span class="material-icons">open_in_new</span></div>' : ""}
      </div>
      <div class="Progetti-card-content">
        <h3 class="nome">${item.nome}</h3>
        <p class="descrizione">${item.descrizione}</p>
      </div>
    `;
    return card;
  }
});
