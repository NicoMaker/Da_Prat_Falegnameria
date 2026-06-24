// Active section highlighting on scroll + product pages support
// Questo script è il SOLO responsabile di aggiornare l'hash dell'URL

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

  // Normalizza id per confronto case-insensitive
  function normalizeId(id) {
    return (id || "").toLowerCase();
  }

  function updateActiveLink(sectionId) {
    const normTarget = normalizeId(sectionId);
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      // Supporta href="#home", "#Home", "../index.html#prodotti" ecc.
      const hash = href.includes("#") ? href.split("#").pop() : "";
      const normHash = normalizeId(hash);
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
});

// ── Pagine prodotto: evidenzia "Prodotti" nel nav ──────────────────────────
function highlightProductPage() {
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    // Attiva il link che punta a #prodotti (anche con ../index.html#prodotti)
    if (href.toLowerCase().includes("prodotti")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}
