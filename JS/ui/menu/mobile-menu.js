// mobile-menu.js — Gestione completa del menu hamburger

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const body = document.body;

  // Se non esistono gli elementi, esci
  if (!menuToggle || !mobileMenu) return;

  // Funzioni di apertura/chiusura
  function openMenu() {
    menuToggle.classList.add("active");
    mobileMenu.classList.add("active");
    body.style.overflow = "hidden"; // blocca lo scroll della pagina
  }

  function closeMenu() {
    menuToggle.classList.remove("active");
    mobileMenu.classList.remove("active");
    body.style.overflow = "";
  }

  // Toggle al click sull'hamburger
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (mobileMenu.classList.contains("active")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // ─── CHIUDI MENU CLICCANDO SU QUALSIASI LINK ALL'INTERNO ───
  // Questo cattura tutti i link, anche quelli senza classe .mobile-nav-link
  mobileMenu.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) {
      // Se il link è un'ancora interna (#) o un link a una pagina con ancora
      const href = link.getAttribute("href");
      if (href && href.includes("#")) {
        // Chiudi il menu PRIMA che lo scroll inizi
        closeMenu();
        // Non blocchiamo il comportamento predefinito così lo scroll avviene
        // ma lo gestiamo dopo per assicurarci che lo scroll-padding sia corretto
      } else {
        // Link esterno: chiudi e lascia navigare
        closeMenu();
      }
    }
  });

  // ─── CHIUDI CLICCANDO FUORI ───
  document.addEventListener("click", (e) => {
    if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMenu();
    }
  });

  // ─── CHIUDI CON TASTO ESC ───
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
      closeMenu();
    }
  });

  // ─── GESTIONE SCROLL PER ANCORE (opzionale ma utile) ───
  // Se clicchi su un link che punta a un'ancora, ci assicuriamo che
  // lo scroll tenga conto dell'altezza dell'header.
  // Nota: questo è un miglioramento, ma puoi anche gestirlo con CSS scroll-padding-top.
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || targetId === "") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight =
          document.querySelector(".site-header")?.offsetHeight || 0;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.scrollY -
          headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
        // Se il menu era aperto, chiudilo (già fatto sopra, ma per sicurezza)
        closeMenu();
      }
    });
  });

  // ─── GESTIONE SPECIALE PER IL LOGO (torna a #home) ───
  const logoLink = document.querySelector(".logo-link");
  if (logoLink) {
    logoLink.addEventListener("click", (e) => {
      // Se il logo è già in home, non fare nulla, altrimenti scrolla in cima
      if (
        window.location.pathname.endsWith("index.html") ||
        window.location.pathname === "/"
      ) {
        e.preventDefault();
        closeMenu();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }
});
