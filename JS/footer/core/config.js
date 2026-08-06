// ============================================================
// footer-main.js — Entry point e scheduler mezzanotte
// Dipende da: tutti gli altri file footer-*.js
// ============================================================

// Per testare una data specifica, decommentare la riga sotto.
// NB: la data di test viene interpretata come ora italiana da muro.
// const TEST_DATE = new Date("2024-12-25T10:30:00");
//
// getNow() parte con l'ora del dispositivo, ma appena il JSON è
// caricato viene riassegnata a getShopNow() (ora dell'attività,
// fuso da data.timezone). Così tutta la logica orari è ancorata al
// fuso dell'attività, non a quello del visitatore.
let getNow = () =>
  typeof TEST_DATE !== "undefined" && TEST_DATE ? new Date(TEST_DATE) : new Date();

// Anno mostrato nel footer al momento della costruzione. Guardia: se la scheda
// resta aperta oltre la mezzanotte del 1° gennaio e il timer di mezzanotte non
// scatta (dispositivo sospeso, tab congelato dal browser), il giro al minuto se
// ne accorge e ricostruisce il footer aggiornando anche l'anno del ©.
let _annoFooterCostruzione = null;

// Giro eseguito ogni minuto: aggiorna gli orari, ma se è cambiato l'anno
// ricostruisce l'intero footer.
function _giroAlMinuto(data) {
  const annoOra = getNow().getFullYear();
  if (_annoFooterCostruzione !== null && annoOra !== _annoFooterCostruzione) {
    _annoFooterCostruzione = annoOra;
    _ricostruisciFooter(data);
  } else {
    aggiornaColoreOrari(data);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("Contatti");
  if (!footer) return;

  JsonData.load(AppConfig.footer.jsonKey)
    .then((data) => {
      // Configura il fuso dell'attività e aggancia getNow all'ora locale del negozio
      configuraTimezone(data);
      getNow = getShopNow;

      footer.innerHTML = createFooterHTML(data, getNow());
      _annoFooterCostruzione = getNow().getFullYear();

      setTimeout(() => {
        if (data.mappa && data.mappa.latitudine && data.mappa.longitudine) {
          initMap(data.mappa.latitudine, data.mappa.longitudine);
        }

        document.dispatchEvent(new CustomEvent("footerLoaded"));

        const now = getNow();
        const secondsToNextMinute = 60 - now.getSeconds();

        setTimeout(() => {
          aggiornaColoreOrari(data);
          setInterval(() => _giroAlMinuto(data), 60000);
        }, secondsToNextMinute * 1000);

        aggiornaColoreOrari(data);

        // Schedula il refresh intelligente a mezzanotte
        scheduleFooterRefreshAtMidnight(data);
      }, 100);
    })
    .catch((error) => {
      console.error("Errore nel caricamento dei dati del footer:", error);
      footer.innerHTML = `<p style="text-align:center; color: white;">Impossibile caricare le informazioni del footer.</p>`;
    });
});

// ── Ricostruisce il footer e reinizializza la mappa ──────────
function _ricostruisciFooter(data) {
  const footer = document.getElementById("Contatti");
  if (!footer || !data) return;

  footer.innerHTML = createFooterHTML(data, getNow());
  _annoFooterCostruzione = getNow().getFullYear();

  setTimeout(() => {
    // Forza la reinizializzazione della mappa azzerando le coordinate salvate
    if (data.mappa && data.mappa.latitudine && data.mappa.longitudine) {
      currentMapCoordinates = null;
      initMap(data.mappa.latitudine, data.mappa.longitudine);
    }

    aggiornaColoreOrari(data);
  }, 100);
}

function scheduleFooterRefreshAtMidnight(data) {
  // Millisecondi alla prossima mezzanotte NELL'ORA DELL'ATTIVITÀ:
  // il footer si ricostruisce al cambio di giorno italiano.
  const msUntilMidnight = msUntilNextShopMidnight();

  console.log(
    `Prossimo aggiornamento footer schedulato tra ${Math.round(
      msUntilMidnight / 1000 / 60,
    )} minuti`,
  );

  setTimeout(() => {
    _ricostruisciFooter(data);

    // Ripristina l'interval degli aggiornamenti al minuto
    setInterval(() => _giroAlMinuto(data), 60000);

    // Riprogramma il refresh per la prossima mezzanotte
    scheduleFooterRefreshAtMidnight(data);
  }, msUntilMidnight);
}