// ─────────────────────────────────────────────────────────────────────────────
// entry-point.js — "Punto di riferimento" tra Home e pagina prodotto
//
// Quando l'utente clicca una card in Home (Serramenti / Porte / Sistemi
// Oscuranti / Prodotti) salviamo QUI da quale sezione arriva. La pagina
// prodotto legge questo valore per:
//   1) colorare automaticamente breadcrumb, barra sotto il titolo e icone
//      con l'accento della sezione di provenienza (data-entry-section + CSS var --entry-accent)
//   2) scrivere il nome corretto della sezione nel breadcrumb
//   3) far puntare "Torna a tutti i ..." alla sezione giusta della Home
//
// IMPORTANTE: le chiavi qui sotto devono corrispondere ESATTAMENTE alle
// stringhe "sezione" passate da progetti.js a EntryPoint.set(sezione), e i
// vari "homeAnchor" devono corrispondere ESATTAMENTE agli id="..." reali
// presenti in index.html. Se non corrispondono, i pulsanti "Torna a..."
// e l'evidenziazione della sezione puntano al posto sbagliato.
//
// Nessuna dipendenza. Va incluso PRESTO (subito dopo <body>) sia in index.html
// sia nelle pagine di Projects/, così l'accento viene applicato prima del paint.
// ─────────────────────────────────────────────────────────────────────────────

const EntryPoint = (() => {
  const STORAGE_KEY = "dapratEntryPoint";

  const SECTIONS = {
    serramenti: {
      key: "serramenti",
      label: "Serramenti",
      backLabel: "Torna a tutti i Serramenti",
      homeAnchor: "serramenti",
      accent: "#b2a68d", // beige — colore secondario del brand
    },
    porte_scorrevoli: {
      key: "porte_scorrevoli",
      label: "Porte Scorrevoli",
      backLabel: "Torna a tutte le Porte Scorrevoli",
      homeAnchor: "porte-scorrevoli",
      accent: "#a15c3e", // terracotta
    },
    porte_interne: {
      key: "porte_interne",
      label: "Porte Interne",
      backLabel: "Torna a tutte le Porte Interne",
      homeAnchor: "porte-interne",
      accent: "#a15c3e", // terracotta
    },
    porte_ingresso: {
      key: "porte_ingresso",
      label: "Porte d'Ingresso",
      backLabel: "Torna a tutte le Porte d'Ingresso",
      homeAnchor: "porte-ingresso",
      accent: "#a15c3e", // terracotta
    },
    oscuranti: {
      key: "oscuranti",
      label: "Sistemi Oscuranti",
      backLabel: "Torna ai Sistemi Oscuranti",
      homeAnchor: "oscuranti",
      accent: "#20252d", // blu notte
    },
    ombreggiatura: {
      key: "ombreggiatura",
      label: "Sistemi d'Ombreggiatura",
      backLabel: "Torna ai Sistemi d'Ombreggiatura",
      homeAnchor: "sistemi-ombreggiatura",
      accent: "#20252d", // blu notte
    },
    prodotti: {
      key: "prodotti",
      label: "Prodotti",
      backLabel: "Torna a tutti i Prodotti",
      homeAnchor: "serramenti", // fallback: non esiste una sezione unica "prodotti" in index.html
      accent: "#b2a68d",
    },
  };

  // Salva la sezione di provenienza (chiamato dalle card in Home al click)
  function set(sectionKey) {
    const key = SECTIONS[sectionKey] ? sectionKey : "prodotti";
    try {
      sessionStorage.setItem(STORAGE_KEY, key);
    } catch (e) {
      /* storage non disponibile: ignora */
    }
  }

  // Legge la sezione di provenienza corrente (default: "prodotti")
  function get() {
    let key = "prodotti";
    try {
      key = sessionStorage.getItem(STORAGE_KEY) || "prodotti";
    } catch (e) {
      key = "prodotti";
    }
    return SECTIONS[key] ? key : "prodotti";
  }

  function getConfig(sectionKey) {
    return SECTIONS[sectionKey] || SECTIONS[get()] || SECTIONS.prodotti;
  }

  // Applica subito l'accento colore + attributo su <html>, per evitare "flash"
  // del colore sbagliato prima che gli altri script (breadcrumb, ecc.) girino.
  function applyAccent() {
    const cfg = getConfig(get());
    document.documentElement.style.setProperty("--entry-accent", cfg.accent);
    document.documentElement.setAttribute("data-entry-section", cfg.key);
    return cfg;
  }

  applyAccent();

  return { set, get, getConfig, applyAccent, SECTIONS };
})();
