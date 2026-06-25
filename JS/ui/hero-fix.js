/**
 * FIX: elimina lo spazio nero sotto l'hero
 * Gestisce: caricamento, resize, pageshow, hashchange e click su Home/logo.
 */

function fixHeroHeight() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;

  // Imposta l'altezza al 92% della viewport in pixel
  hero.style.minHeight = (window.innerHeight * 0.92) + 'px';

  // Se siamo quasi in cima, forza lo scroll esattamente a 0
  // per eliminare qualsiasi micro-spazio residuo
  if (window.scrollY < 20) {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
}

// Esegui subito e al caricamento
fixHeroHeight();
document.addEventListener('DOMContentLoaded', fixHeroHeight);

// Ridimensionamento finestra (con debounce)
let resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(fixHeroHeight, 150);
});

// Tasto "Indietro" del browser
window.addEventListener('pageshow', fixHeroHeight);

// ================================================
// 1. Listener per cambi di hash (es. #home)
// ================================================
window.addEventListener('hashchange', function() {
  if (window.location.hash === '#home' || window.location.hash === '') {
    attendiScrollInCimaEApplica();
  }
});

// ================================================
// 2. Intercetta click su Home e Logo
// ================================================
document.querySelectorAll(
  '.logo-link, ' +
  'a[href="#home"], ' +
  'a[href="index.html#home"], ' +
  'a[href="../index.html#home"]'
).forEach(link => {
  link.addEventListener('click', function(e) {
    setTimeout(attendiScrollInCimaEApplica, 50);
  });
});

// ================================================
// 3. Scroll generico (per sicurezza)
// ================================================
let scrollTimer;
window.addEventListener('scroll', function() {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(function() {
    if (window.scrollY < 10) {
      fixHeroHeight();
    }
  }, 100);
});

// ================================================
// Funzione di supporto: aspetta lo scroll in cima
// ================================================
function attendiScrollInCimaEApplica() {
  if (window.scrollY < 5) {
    fixHeroHeight();
    return;
  }

  function onScroll() {
    if (window.scrollY < 5) {
      fixHeroHeight();
      window.removeEventListener('scroll', onScroll);
    }
  }
  window.addEventListener('scroll', onScroll);

  // Controllo immediato (per sicurezza)
  setTimeout(() => {
    if (window.scrollY < 5) {
      fixHeroHeight();
      window.removeEventListener('scroll', onScroll);
    }
  }, 100);
}