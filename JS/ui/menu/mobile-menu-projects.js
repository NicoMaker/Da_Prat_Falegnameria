(function () {
  function initMobileAccordion(toggleSel, menuSel) {
    var toggle = document.querySelector(toggleSel);
    var menu = document.querySelector(menuSel);
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function (e) {
      var isOpen = menu.classList.contains("open");
      if (!isOpen) e.preventDefault();
      menu.classList.toggle("open");
      var arrow = this.querySelector(".dropdown-arrow");
      if (arrow) arrow.style.transform = isOpen ? "" : "rotate(180deg)";
    });
  }

  // Porte mobile accordion
  initMobileAccordion(".mobile-dropdown-toggle", ".mobile-dropdown-menu");
  // Prodotti mobile accordion
  initMobileAccordion(
    "#mobile-prodotti-toggle-sub",
    "#mobile-prodotti-menu-sub",
  );

  // Dropdown links: save chosen tab to sessionStorage and navigate
  document.querySelectorAll("[data-tab]").forEach(function (link) {
    link.addEventListener("click", function () {
      sessionStorage.setItem("porteTab", this.dataset.tab);
    });
  });
})();
