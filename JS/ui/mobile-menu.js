// Mobile menu functionality
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  if (menuToggle && mobileMenu) {
    // Aggiunge pulsante × per chiudere
    const closeBtn = document.createElement("button");
    closeBtn.className = "mobile-menu-close";
    closeBtn.setAttribute("aria-label", "Chiudi menu");
    closeBtn.innerHTML = "&times;";
    mobileMenu.insertBefore(closeBtn, mobileMenu.firstChild);

    function openMenu() {
      menuToggle.classList.add("active");
      mobileMenu.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeMenu() {
      menuToggle.classList.remove("active");
      mobileMenu.classList.remove("active");
      document.body.style.overflow = "";
    }

    menuToggle.addEventListener("click", () => {
      if (mobileMenu.classList.contains("active")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    closeBtn.addEventListener("click", closeMenu);

    // Chiude cliccando sui link
    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Chiude cliccando fuori
    document.addEventListener("click", (e) => {
      if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        closeMenu();
      }
    });
  }
});

// Scroll to top per link #home / #Home
document.addEventListener("DOMContentLoaded", () => {
  const homeLinks = document.querySelectorAll('a[href="#home"], a[href="#Home"]');
  homeLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Solo su index (senza ../index.html nel path)
      if (!link.getAttribute("href").includes("index.html")) {
        e.preventDefault();
        const mobileMenu = document.querySelector(".mobile-menu");
        const toggle = document.querySelector(".mobile-menu-toggle");
        if (mobileMenu && toggle && mobileMenu.classList.contains("active")) {
          mobileMenu.classList.remove("active");
          toggle.classList.remove("active");
          document.body.style.overflow = "";
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
});
