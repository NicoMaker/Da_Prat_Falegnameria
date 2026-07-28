// ──────────────────────────────────────────────────────────────
// progetti.js — Gestisce tutte le sezioni: Serramenti, Porte (scorrevoli, interne, ingresso),
//               Sistemi Oscuranti e Sistemi di Ombreggiatura
// ──────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Selettori dei container (devono esistere nell'HTML)
  const serramentiContainer = document.getElementById("serramenti-grid");
  const porteScorrevoliContainer = document.getElementById(
    "porte-scorrevoli-grid",
  );
  const porteInterneContainer = document.getElementById("porte-interne-grid");
  const porteIngressoContainer = document.getElementById("porte-ingresso-grid");
  const oscurantiContainer = document.getElementById("oscuranti-grid");
  const ombreggiaturaContainer = document.getElementById("ombreggiatura-grid");

  // Array per i dati
  let serramentiProducts = [];
  let porteScorrevoliProducts = [];
  let porteInterneProducts = [];
  let porteIngressoProducts = [];
  let oscurantiProducts = [];
  let ombreggiaturaProducts = [];

  // ── Caricamento JSON ──────────────────────────────────────
  async function caricaProdotti() {
    try {
      const data = await JsonData.load("progetti");
      console.log("📦 JSON caricato:", data);

      // 1. Serramenti
      serramentiProducts = data.serramenti || [];

      // 2. Porte Scorrevoli: filtro da data.porte (categorie che contengono "scorrevoli")
      const tutteLePorte = data.porte || [];
      porteScorrevoliProducts = tutteLePorte.filter((p) =>
        p.categorie.some((cat) => /scorrevoli/i.test(cat)),
      );

      // 3. Porte Interne
      porteInterneProducts = data.porte_interne || [];

      // 4. Porte Ingresso
      porteIngressoProducts = data.porte_ingresso || [];

      // 5. Sistemi Oscuranti (array esistente)
      oscurantiProducts = data.oscuranti || [];

      // 6. Sistemi di Ombreggiatura (oggetto → array piatto)
      const ombreggiaturaObj = data.sistemi_ombreggiatura || {};
      ombreggiaturaProducts = [];
      for (const key in ombreggiaturaObj) {
        if (Array.isArray(ombreggiaturaObj[key])) {
          ombreggiaturaProducts.push(...ombreggiaturaObj[key]);
        }
      }

      // Fallback di esempio (se tutti vuoti) – opzionale, lo lascio come sicurezza
      if (
        serramentiProducts.length === 0 &&
        porteScorrevoliProducts.length === 0 &&
        porteInterneProducts.length === 0 &&
        porteIngressoProducts.length === 0 &&
        oscurantiProducts.length === 0 &&
        ombreggiaturaProducts.length === 0
      ) {
        console.warn("⚠️ Nessun dato nel JSON. Uso fallback di esempio.");
        // Puoi inserire qui un set di prodotti di esempio o lasciare vuoto
      }

      console.log(
        `✅ Caricati: ${serramentiProducts.length} serramenti, ` +
          `${porteScorrevoliProducts.length} porte scorrevoli, ` +
          `${porteInterneProducts.length} porte interne, ` +
          `${porteIngressoProducts.length} porte ingresso, ` +
          `${oscurantiProducts.length} oscuranti, ` +
          `${ombreggiaturaProducts.length} ombreggiatura`,
      );

      // Popola tutte le griglie
      populateGrid(serramentiContainer, serramentiProducts, "serramenti");
      populateGrid(
        porteScorrevoliContainer,
        porteScorrevoliProducts,
        "porte_scorrevoli",
      );
      populateGrid(
        porteInterneContainer,
        porteInterneProducts,
        "porte_interne",
      );
      populateGrid(
        porteIngressoContainer,
        porteIngressoProducts,
        "porte_ingresso",
      );
      populateGrid(oscurantiContainer, oscurantiProducts, "oscuranti");
      populateGrid(
        ombreggiaturaContainer,
        ombreggiaturaProducts,
        "ombreggiatura",
      );

      // Segnala che tutte le griglie sono state popolate: active-section.js
      // usa questo evento per ricorreggere lo scroll verso l'ancora corretta
      // (le sezioni sotto le griglie si spostano quando le card vengono
      // inserite, quindi la posizione calcolata prima era sbagliata).
      document.dispatchEvent(new Event("productsGridsLoaded"));

      // Scroll all'ancora #Prodotti se presente
      if (window.location.hash === "#Prodotti") {
        const section = document.getElementById("Prodotti");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("❌ Errore caricamento JSON:", error);
      // Mostra errori in tutti i container
      const containers = [
        serramentiContainer,
        porteScorrevoliContainer,
        porteInterneContainer,
        porteIngressoContainer,
        oscurantiContainer,
        ombreggiaturaContainer,
      ];
      containers.forEach((cont) => {
        if (cont)
          cont.innerHTML =
            "<p class='no-results'>Errore nel caricamento dei dati.</p>";
      });
      // Anche in caso di errore, segnala la fine del caricamento così lo
      // scroll in sospeso non resta bloccato per sempre.
      document.dispatchEvent(new Event("productsGridsLoaded"));
    }
  }

  // ── Avvia il caricamento ──────────────────────────────────
  caricaProdotti();

  // ── Funzione generica per popolare una griglia ────────────
  function populateGrid(container, products, sezione) {
    if (!container) {
      console.warn(`⚠️ Contenitore per "${sezione}" non trovato`);
      return;
    }
    container.innerHTML = "";
    if (products.length === 0) {
      container.innerHTML = `<p class='no-results'>Nessun prodotto disponibile per ${sezione.replace("_", " ")}.</p>`;
      return;
    }
    products.forEach((p) =>
      container.appendChild(createProductCard(p, sezione)),
    );
  }

  // ── Crea una card prodotto ────────────────────────────────
  function createProductCard(item, sezione) {
    const card = document.createElement("div");
    card.className = "Progetti-card";
    card.addEventListener("click", () => {
      if (item.link && item.link !== "#") {
        if (typeof EntryPoint !== "undefined") {
          EntryPoint.set(sezione || "prodotti");
        }
        // 🔁 Apertura nella STESSA finestra (non più _blank)
        window.location.href = item.link;
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
