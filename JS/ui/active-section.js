// Active section highlighting on scroll + product pages support
// Questo script è il SOLO responsabile di aggiornare l'hash dell'URL

// ── Raggruppamento "Porte" ──────────────────────────────────────────────────
// In index.html esiste UN SOLO pulsante di nav "Porte" (che punta a
// #porte-scorrevoli), ma le sezioni reali sono tre: porte-scorrevoli,
// porte-interne, porte-ingresso. Quando una di queste tre è attiva (per
// scroll sulla home, o come sezione di provenienza in una pagina prodotto),
// va evidenziato comunque il pulsante "Porte" nell'header.
const PORTE_SECTION_IDS = [
  "porte-scorrevoli",
  "porte-interne",
  "porte-ingresso",
];
const groupAnchor = (id) =>
  PORTE_SECTION_IDS.includes(id) ? "porte-scorrevoli" : id;

document.addEventListener("DOMContentLoaded", () => {
  // ── Rileva se siamo su una pagina prodotto (Projects/) ──────────────────
  const isProductPage = window.location.pathname.includes("/Projects/");

  // Su pagine prodotto: evidenzia sempre "Prodotti" fisso
  if (isProductPage) {
    highlightProductPage();
    return;
  }

  // ── LOGICA INDEX ─────────────────────────────────────────────────────────
  const sections = document.querySelectorAll("section[id], footer#Contatti");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

  let isManualNavigation = false;
  let scrollTimeout;
  let preventHashUpdate = false;
  let isInitialLoad = true;
  // Ancora verso cui stiamo scrollando: serve per poter ricorreggere la
  // posizione quando le griglie prodotti (caricate in modo asincrono da
  // progetti.js) finiscono di popolarsi e cambiano l'altezza della pagina.
  let pendingScrollTarget = null;

  // Normalizza id per confronto case-insensitive
  function normalizeId(id) {
    return (id || "").toLowerCase();
  }

  function updateActiveLink(sectionId) {
    const normTarget = groupAnchor(normalizeId(sectionId));
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      // Supporta href="#home", "#Home", "../index.html#prodotti" ecc.
      const hash = href.includes("#") ? href.split("#").pop() : "";
      const normHash = groupAnchor(normalizeId(hash));
      if (normHash === normTarget) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  function highlightNavigation() {
    if (isInitialLoad) return;

    const scrollY = window.pageYOffset;
    let currentSectionId = "";

    const sectionPositions = Array.from(sections).map((section) => ({
      id: section.getAttribute("id"),
      top: section.offsetTop,
      bottom: section.offsetTop + section.offsetHeight,
    }));

    const windowBottom = scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (windowBottom >= documentHeight - 50) {
      currentSectionId = "Contatti";
    } else {
      const header = document.querySelector(".site-header");
      const headerHeight = header ? header.offsetHeight : 80;
      const scrollPosition = scrollY + headerHeight + 100;

      for (let i = sectionPositions.length - 1; i >= 0; i--) {
        const section = sectionPositions[i];
        if (scrollPosition >= section.top) {
          currentSectionId = section.id;
          break;
        }
      }

      if (scrollY < 100) {
        currentSectionId = "home";
      }
    }

    if (!currentSectionId) {
      currentSectionId = "home";
    }

    updateActiveLink(currentSectionId);

    if (preventHashUpdate) return;

    const currentHash = window.location.hash.substring(1);
    if (normalizeId(currentHash) !== normalizeId(currentSectionId)) {
      try {
        history.replaceState(null, null, `#${currentSectionId}`);
      } catch (e) {}
    }
  }

  // Click su link nav
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";

      // Link verso altra pagina (es. ../index.html#prodotti) — lascia navigare
      if (href.includes("index.html") || href.startsWith("http")) return;

      event.preventDefault();
      const targetId = href.includes("#") ? href.split("#").pop() : "";
      if (!targetId) return;

      // Se il link ha data-tab (dropdown Porte), salva il tab e poi scrolla
      const tab = link.getAttribute("data-tab");
      if (tab) {
        sessionStorage.setItem("porteTab", tab);
        // Attiva subito il tab senza reload di pagina
        const activateTab = (tabName) => {
          document.querySelectorAll(".porte-tab").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.tab === tabName);
          });
          document.querySelectorAll(".porte-tab-content").forEach((panel) => {
            panel.classList.toggle("active", panel.dataset.content === tabName);
          });
        };
        activateTab(tab);
      }

      if (targetId === "Contatti" && !document.getElementById("Contatti")) {
        document.addEventListener(
          "footerLoaded",
          () => {
            scrollToSection(targetId);
          },
          { once: true },
        );
        return;
      }
      scrollToSection(targetId);
    });
  });

  function scrollToSection(targetId) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
      console.warn(`⚠️ Sezione ${targetId} non trovata`);
      return;
    }

    isManualNavigation = true;
    preventHashUpdate = true;

    updateActiveLink(targetId);
    history.replaceState(null, null, `#${targetId}`);

    const header = document.querySelector(".site-header");
    const totalOffset = header ? header.offsetHeight : 80;
    const offsetPosition = targetElement.offsetTop - totalOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });

    // Se le griglie prodotti non hanno ancora finito di caricarsi, la
    // posizione appena calcolata potrebbe diventare sbagliata non appena
    // le card vengono inserite (la pagina si allunga). Segniamo questa
    // ancora come "in sospeso" così l'evento productsGridsLoaded potrà
    // ricorreggere lo scroll.
    pendingScrollTarget = targetId;

    setTimeout(() => {
      preventHashUpdate = false;
      isManualNavigation = false;
    }, 800);
  }

  window.addEventListener("scroll", () => {
    if (isManualNavigation || isInitialLoad) return;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(highlightNavigation, 150);
  });

  function initializePage() {
    const hash = window.location.hash.substring(1);

    const scrollToHash = (targetId) => {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        updateActiveLink(targetId);
        const header = document.querySelector(".site-header");
        const headerHeight = header ? header.offsetHeight : 80;

        if (normalizeId(targetId) === "contatti") {
          setTimeout(() => {
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "auto",
            });
          }, 100);
        } else if (normalizeId(targetId) === "home") {
          // no scroll needed
        } else {
          window.scrollTo({
            top: targetElement.offsetTop - headerHeight,
            behavior: "auto",
          });
          // Le griglie prodotti sopra questa sezione potrebbero non essere
          // ancora state popolate: quando lo saranno, l'evento
          // productsGridsLoaded ricorreggerà lo scroll sulla posizione reale.
          pendingScrollTarget = targetId;
        }

        preventHashUpdate = true;
        setTimeout(() => {
          preventHashUpdate = false;
          isInitialLoad = false;
        }, 1500);
      } else {
        preventHashUpdate = false;
        isInitialLoad = false;
        highlightNavigation();
      }
    };

    if (hash) {
      if (normalizeId(hash) === "contatti") {
        preventHashUpdate = true;
        document.addEventListener(
          "footerLoaded",
          () => {
            scrollToHash(hash);
          },
          { once: true },
        );
        setTimeout(() => {
          if (!document.getElementById("Contatti")) {
            preventHashUpdate = false;
            isInitialLoad = false;
            highlightNavigation();
          }
        }, 5000);
      } else {
        scrollToHash(hash);
      }
    } else {
      // Nessun hash: siamo in cima → Home attivo
      updateActiveLink("home");
      history.replaceState(null, null, "#home");
      setTimeout(() => {
        preventHashUpdate = false;
        isInitialLoad = false;
      }, 500);
    }
  }

  initializePage();

  // ── Ricorrezione post-caricamento griglie prodotti ──────────────────────
  // progetti.js popola le griglie in modo asincrono (fetch del JSON). Se lo
  // scroll verso un'ancora è già avvenuto ma la pagina si è nel frattempo
  // allungata (card aggiunte sopra la sezione target), qui ricalcoliamo e
  // correggiamo la posizione sulla sezione GIUSTA.
  document.addEventListener("productsGridsLoaded", () => {
    if (!pendingScrollTarget) return;
    const norm = normalizeId(pendingScrollTarget);
    if (norm === "home" || norm === "contatti") {
      pendingScrollTarget = null;
      return;
    }
    const targetElement = document.getElementById(pendingScrollTarget);
    if (!targetElement) {
      pendingScrollTarget = null;
      return;
    }
    const header = document.querySelector(".site-header");
    const headerHeight = header ? header.offsetHeight : 80;
    preventHashUpdate = true;
    window.scrollTo({
      top: targetElement.offsetTop - headerHeight,
      behavior: "auto",
    });
    pendingScrollTarget = null;
    setTimeout(() => {
      preventHashUpdate = false;
    }, 300);
  });
});

// ── Pagine prodotto: evidenzia il link nav della sezione di provenienza ────
function highlightProductPage() {
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

  // Punto di riferimento: se disponibile, evidenzia la sezione da cui
  // l'utente è entrato (Serramenti/Porte/Oscuranti); altrimenti "Prodotti".
  const rawAnchor =
    typeof EntryPoint !== "undefined"
      ? EntryPoint.getConfig(EntryPoint.get()).homeAnchor
      : "prodotti";
  const anchor = groupAnchor(rawAnchor.toLowerCase());

  navLinks.forEach((link) => {
    const href = (link.getAttribute("href") || "").toLowerCase();
    if (href.includes("#" + anchor)) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}
