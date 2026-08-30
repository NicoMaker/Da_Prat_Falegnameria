/**
 * Da Prat - Sistema di traduzione automatica IT/EN
 * -------------------------------------------------
 * - Rileva automaticamente la lingua del dispositivo dell'utente al primo
 *   accesso (navigator.language) e traduce l'intera pagina di conseguenza.
 * - Se l'utente seleziona manualmente una lingua, la preferenza viene
 *   salvata in localStorage e mantenuta automaticamente su TUTTE le pagine
 *   del sito (persistenza cross-page).
 * - La traduzione dell'intero contenuto della pagina (testi statici,
 *   contenuti caricati dinamicamente dai JSON, ecc.) avviene tramite il
 *   motore "Google Website Translator", pilotato in automatico da questo
 *   script: nessuna interazione richiesta con l'interfaccia standard di
 *   Google, che viene nascosta e sostituita dal selettore IT/EN del sito.
 *
 * Da includere in OGNI pagina .html del sito (vedi anche il relativo file
 * CSS: CSS/components/language-switcher/language-switcher.css).
 */
(function () {
  "use strict";

  var STORAGE_KEY = "daprat_lang";
  var SUPPORTED_LANGS = ["it", "en"];
  var SITE_SOURCE_LANG = "it";

  /* ---------------------------------------------------------------- */
  /*  Lettura / scrittura della preferenza utente                      */
  /* ---------------------------------------------------------------- */

  function getSavedLang() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGS.indexOf(saved) !== -1) {
        return saved;
      }
    } catch (err) {
      /* localStorage non disponibile (es. modalità privata): si ignora */
    }
    return null;
  }

  function saveLang(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      /* localStorage non disponibile: la scelta vale solo per la sessione */
    }
  }

  function detectDeviceLang() {
    var navLang =
      (navigator.language ||
        (navigator.languages && navigator.languages[0]) ||
        navigator.userLanguage ||
        "") + "";
    navLang = navLang.toLowerCase();

    /* Lingua del dispositivo italiana -> sito in italiano.
       Lingua del dispositivo inglese -> sito in inglese.
       Qualsiasi altra lingua (francese, tedesco, spagnolo, ecc.) -> di
       default, la prima volta, il sito parte in inglese. */
    if (navLang.indexOf("it") === 0) return "it";
    return "en";
  }

  /* Lingua attiva per questo caricamento pagina:
     1) preferenza salvata manualmente dall'utente (ha sempre la priorità)
     2) lingua rilevata automaticamente dal dispositivo/browser            */
  var savedLang = getSavedLang();
  var activeLang = savedLang || detectDeviceLang();

  document.documentElement.setAttribute("lang", activeLang);

  /* ---------------------------------------------------------------- */
  /*  Google Website Translator (motore di traduzione automatica)      */
  /* ---------------------------------------------------------------- */

  function setGoogTransCookie(lang) {
    var cookieValue =
      lang === SITE_SOURCE_LANG ? "" : "/" + SITE_SOURCE_LANG + "/" + lang;
    var expired = "expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    var host = window.location.hostname;

    /* Rimuove eventuali cookie precedenti su tutte le varianti di path/dominio */
    document.cookie = "googtrans=; " + expired + " path=/;";
    if (host) {
      document.cookie =
        "googtrans=; " + expired + " path=/; domain=" + host + ";";
      document.cookie =
        "googtrans=; " + expired + " path=/; domain=." + host + ";";
    }

    if (cookieValue) {
      document.cookie = "googtrans=" + cookieValue + "; path=/;";
      if (host) {
        document.cookie =
          "googtrans=" + cookieValue + "; path=/; domain=" + host + ";";
        document.cookie =
          "googtrans=" + cookieValue + "; path=/; domain=." + host + ";";
      }
    }
  }

  /* Il cookie va impostato PRIMA che lo script di Google venga caricato,
     così la traduzione viene applicata automaticamente ad ogni pagina. */
  setGoogTransCookie(activeLang);

  function loadGoogleTranslateWidget() {
    if (window.__dapratGTLoaded) return;
    window.__dapratGTLoaded = true;

    var container = document.createElement("div");
    container.id = "google_translate_element";
    container.setAttribute("aria-hidden", "true");
    document.body.appendChild(container);

    window.googleTranslateElementInit = function () {
      /* eslint-disable no-undef */
      new google.translate.TranslateElement(
        {
          pageLanguage: SITE_SOURCE_LANG,
          includedLanguages: SUPPORTED_LANGS.join(","),
          autoDisplay: false,
        },
        "google_translate_element",
      );
      /* eslint-enable no-undef */
    };

    var script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }

  /* ---------------------------------------------------------------- */
  /*  Cambio lingua (usato dal selettore IT / EN)                      */
  /* ---------------------------------------------------------------- */

  function setLanguage(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1 || lang === activeLang) return;
    saveLang(lang);
    setGoogTransCookie(lang);
    window.location.reload();
  }

  window.DaPratI18n = {
    getLang: function () {
      return activeLang;
    },
    setLang: setLanguage,
    supportedLangs: SUPPORTED_LANGS,
  };

  /* ---------------------------------------------------------------- */
  /*  Selettore lingua fluttuante (IT / EN) presente su ogni pagina    */
  /* ---------------------------------------------------------------- */

  function buildLanguageSwitcher() {
    if (document.querySelector(".lang-switcher")) return;

    var wrapper = document.createElement("div");
    wrapper.className = "lang-switcher notranslate";
    wrapper.setAttribute("translate", "no");
    wrapper.setAttribute("role", "group");
    wrapper.setAttribute("aria-label", "Selettore lingua / Language selector");

    /* Bandiere come immagini reali (non emoji): su molti PC/Windows le
       emoji-bandiera non vengono renderizzate come icona e mostrano solo
       il codice testuale ("IT"/"GB"). Con un'immagine sono sempre corrette
       e identiche su ogni dispositivo/browser. */
    var languages = [
      { code: "it", flagCountry: "it", label: "Italiano" },
      { code: "en", flagCountry: "gb", label: "English" },
    ];

    languages.forEach(function (langInfo) {
      var button = document.createElement("button");
      button.type = "button";
      button.className =
        "lang-switcher-btn" +
        (activeLang === langInfo.code ? " is-active" : "");
      button.setAttribute(
        "aria-pressed",
        activeLang === langInfo.code ? "true" : "false",
      );
      button.setAttribute("aria-label", langInfo.label);
      button.title = langInfo.label;

      var flagImg = document.createElement("img");
      flagImg.className = "lang-flag notranslate";
      flagImg.setAttribute("translate", "no");
      flagImg.alt = "";
      flagImg.setAttribute("aria-hidden", "true");
      flagImg.width = 20;
      flagImg.height = 15;
      flagImg.loading = "lazy";
      flagImg.src = "https://flagcdn.com/w40/" + langInfo.flagCountry + ".png";
      flagImg.srcset =
        "https://flagcdn.com/w40/" +
        langInfo.flagCountry +
        ".png 1x, https://flagcdn.com/w80/" +
        langInfo.flagCountry +
        ".png 2x";

      var codeSpan = document.createElement("span");
      codeSpan.className = "lang-code";
      codeSpan.textContent = langInfo.code.toUpperCase();

      button.appendChild(flagImg);
      button.appendChild(codeSpan);

      button.addEventListener("click", function () {
        setLanguage(langInfo.code);
      });

      wrapper.appendChild(button);
    });

    document.body.appendChild(wrapper);
  }

  /* Alcuni contenuti (numeri di telefono, email, nome del marchio, indirizzo)
     non vanno tradotti: Google a volte li altera se sono dentro frasi.
     Li marchiamo automaticamente come "notranslate" su ogni pagina. */
  function protectNonTranslatableContent() {
    var selectors = [
      'a[href^="tel:"]',
      'a[href^="mailto:"]',
      ".logo",
      ".logo-link",
      ".mobile-menu-logo",
      ".mobile-menu-logo-link",
      ".footer-brand",
      ".footer-logo",
      /* Le icone "Material Icons" (telefono, email, indirizzo nel footer,
         ecc.) sono in realtà parole normali ("phone", "email",
         "location_on") rese come glifo grazie al font delle icone. Se
         Google Translate le tocca, la legatura si rompe e prima
         dell'icona compare un carattere estraneo. Vanno sempre escluse
         dalla traduzione. */
      ".material-icons",
      ".material-symbols-outlined",
      ".material-symbols-rounded",
      "[class*='material-icon']",
    ];

    selectors.forEach(function (selector) {
      var nodes = document.querySelectorAll(selector);
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].classList.add("notranslate");
        nodes[i].setAttribute("translate", "no");
      }
    });
  }

  /* Footer, orari e altri blocchi vengono generati via JS dopo il caricamento
     della pagina: osserviamo il DOM e riapplichiamo la protezione ogni volta
     che compare nuovo contenuto (es. numero di telefono nel footer). */
  function watchDynamicContent() {
    if (!("MutationObserver" in window)) return;
    var observer = new MutationObserver(function () {
      protectNonTranslatableContent();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    protectNonTranslatableContent();
    buildLanguageSwitcher();
    watchDynamicContent();

    /* Molti contenuti (hero, progetti, footer, orari) vengono caricati in
       modo asincrono dai file JSON dopo il caricamento della pagina.
       Avviamo il traduttore automatico solo dopo che la pagina è
       completamente caricata (più un piccolo margine), così Google
       Translate trova già in pagina anche questi testi e li traduce
       correttamente invece di ignorarli. */
    if (document.readyState === "complete") {
      setTimeout(loadGoogleTranslateWidget, 900);
    } else {
      window.addEventListener("load", function () {
        setTimeout(loadGoogleTranslateWidget, 900);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
