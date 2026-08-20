// ============================================================
// date-utils.js — Utility per date, formattazione e stagioni
// Le date di cambio stagione sono gestite qui, NON nel JSON.
// Estivo:   dall'ultima domenica di marzo → al sabato prima dell'ultima domenica di ottobre
// Invernale: dall'ultima domenica di ottobre → al sabato prima dell'ultima domenica di marzo
// ============================================================

// ============================================================
// GESTIONE FUSO ORARIO (stessa logica della Macelleria da Ketti)
// ------------------------------------------------------------
// Gli orari sono definiti nell'ora dell'attività (Europe/Rome).
// Il dispositivo del visitatore può avere un fuso diverso: senza
// correzione, "aperto/chiuso", stagione, festività e countdown
// verrebbero calcolati sull'ora sbagliata.
//
// - Il fuso si legge da data.timezone (default "Europe/Rome").
// - getShopNow() = "adesso" nell'ora dell'attività; i suoi getter
//   locali (getHours/getDay/...) restituiscono l'orario italiano,
//   così il resto del codice funziona senza modifiche.
// - getTimezoneOffsetHours()/formatTimezoneOffsetText() servono a
//   mostrare al visitatore lo scarto rispetto al suo fuso.
// - convertOrarioString() converte gli orari nel fuso del visitatore.
// ============================================================

function configuraTimezone(data) {
  if (data && data.timezone) {
    _shopTimezone = data.timezone;
  }
}

// Componenti "da orologio da muro" dell'attività per un dato istante
function _shopParts(instant) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: _shopTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const obj = {};
  formatter.formatToParts(instant).forEach((p) => {
    obj[p.type] = p.value;
  });
  return obj;
}

// Offset (in minuti) del fuso dell'attività rispetto a UTC per un dato istante.
// Passare un istante specifico serve per gestire correttamente i cambi di ora
// legale sui giorni futuri.
function getShopOffsetMinutesForDate(refInstant) {
  const now = refInstant || new Date();
  const o = _shopParts(now);
  let h = Number.parseInt(o.hour, 10);
  if (h === 24) h = 0;
  const asUTC = Date.UTC(
    Number.parseInt(o.year, 10),
    Number.parseInt(o.month, 10) - 1,
    Number.parseInt(o.day, 10),
    h,
    Number.parseInt(o.minute, 10),
    Number.parseInt(o.second, 10),
  );
  return (asUTC - now.getTime()) / 60000;
}

// Offset (in minuti) del fuso dell'attività rispetto a UTC, adesso
function getShopOffsetMinutes() {
  return getShopOffsetMinutesForDate(new Date());
}

// "Adesso" nell'ora dell'attività. I getter LOCALI di questo Date
// restituiscono l'orario italiano, indipendentemente dal fuso del
// dispositivo. Rispetta l'eventuale TEST_DATE definita in config.js.
function getShopNow() {
  if (typeof TEST_DATE !== "undefined" && TEST_DATE) {
    return new Date(TEST_DATE);
  }
  try {
    const o = _shopParts(new Date());
    let h = Number.parseInt(o.hour, 10);
    if (h === 24) h = 0;
    return new Date(
      Number.parseInt(o.year, 10),
      Number.parseInt(o.month, 10) - 1,
      Number.parseInt(o.day, 10),
      h,
      Number.parseInt(o.minute, 10),
      Number.parseInt(o.second, 10),
      0,
    );
  } catch (e) {
    return new Date(); // fallback legacy se Intl non disponibile
  }
}

// "Adesso" nel fuso del visitatore (per mostrargli la sua ora)
function getUserNow() {
  return new Date();
}

// Differenza in ore tra il fuso dell'attività e quello del visitatore,
// calcolata per una data specifica (tiene conto dell'ora legale di quel
// giorno, sia dell'attività che del visitatore).
function getTimezoneOffsetHoursForDate(refInstant) {
  const d = refInstant || new Date();
  const shopOffset = getShopOffsetMinutesForDate(d);
  const userOffset = -d.getTimezoneOffset();
  return (shopOffset - userOffset) / 60;
}

// Differenza in ore tra il fuso dell'attività e quello del visitatore, adesso
function getTimezoneOffsetHours() {
  return getTimezoneOffsetHoursForDate(new Date());
}

// Converte gli orari testuali (HH:MM) nel fuso del visitatore.
// - Lavora in MINUTI totali → i fusi con mezz'ora (es. +5:30) sono corretti.
// - Se un orario scavalca la mezzanotte e vengono passati baseDate + nomiGiorni,
//   l'orario viene scritto col NOME del giorno reale (es. "Mercoledì alle 05:00").
//   Se baseDate/nomiGiorni non ci sono, ripiega sul marcatore (+1g)/(-1g).
//
// Parametri:
//   orarioStr  — stringa con gli orari (es. "09:00 - 22:00")
//   diffHours  — differenza in ore da applicare (può essere frazionaria)
//   baseDate   — (opzionale) Date del giorno a cui appartengono gli orari
//   nomiGiorni — (opzionale) array nomi giorni indicizzato come getDay() (0 = Domenica)
function convertOrarioString(orarioStr, diffHours, baseDate, nomiGiorni) {
  if (Math.abs(diffHours) < 0.01) return orarioStr;
  const deltaMin = Math.round(diffHours * 60);

  return orarioStr.replace(/(\d{1,2}):(\d{2})/g, (match, hh, mm) => {
    const totale = Number(hh) * 60 + Number(mm) + deltaMin;
    const shift = Math.floor(totale / 1440); // -1 = giorno prima, +1 = giorno dopo
    const wrapped = ((totale % 1440) + 1440) % 1440;
    const nh = Math.floor(wrapped / 60);
    const nm = wrapped % 60;

    let s = `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;

    if (shift !== 0) {
      if (baseDate && nomiGiorni) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + shift);
        const nome = nomiGiorni[d.getDay()];
        // Es. "Mercoledì alle 05:00" quando l'orario finisce in un altro giorno
        if (nome) s = `${nome} alle ${s}`;
        else s += shift > 0 ? `(+${shift}g)` : `(${shift}g)`;
      } else {
        s += shift > 0 ? `(+${shift}g)` : `(${shift}g)`;
      }
    }
    return s;
  });
}

// Compone la riga orario con le etichette che chiariscono quale blocco è
// l'ora dell'attività e quale l'ora locale del visitatore.
//   testoBase        → orario nel fuso dell'attività (es. "Domenica: 09:00 - 22:00")
//   orarioConvertito → stesso orario convertito nel fuso del visitatore
function formattaOrarioConFuso(testoBase, orarioConvertito) {
  const lbl =
    "font-size:0.8em;opacity:0.55;font-weight:400;letter-spacing:0.02em;";
  return (
    testoBase +
    ` <span style="${lbl}">(negozio)</span> → ` +
    orarioConvertito +
    ` <span style="${lbl}">(tua ora)</span>`
  );
}

// Testo leggibile della differenza di fuso (plurale corretto)
function formatTimezoneOffsetText(offsetHours, shopName) {
  const abs = Math.abs(offsetHours);
  const ore = Math.floor(abs);
  const minuti = Math.round((abs - ore) * 60);

  if (ore === 0 && minuti === 0) {
    return "Sei nello stesso fuso orario dell'attività";
  }

  let oreFinale = ore;
  let minutiFinali = minuti;
  if (minutiFinali >= 60) {
    oreFinale += 1;
    minutiFinali = 0;
  }

  let diffText = "";
  if (oreFinale > 0 && minutiFinali > 0) {
    diffText = `${oreFinale}h ${minutiFinali}m`;
  } else if (oreFinale > 0) {
    diffText = `${oreFinale} ${oreFinale === 1 ? "ora" : "ore"}`;
  } else {
    diffText = `${minutiFinali} minuti`;
  }

  const direction = offsetHours > 0 ? "avanti" : "indietro";
  return `L'attività è ${diffText} ${direction} rispetto a te`;
}

// Millisecondi alla prossima mezzanotte NELL'ORA DELL'ATTIVITÀ
function msUntilNextShopMidnight() {
  const wall = getShopNow();
  const into =
    wall.getHours() * 3600000 +
    wall.getMinutes() * 60000 +
    wall.getSeconds() * 1000 +
    wall.getMilliseconds();
  let rem = 24 * 3600000 - into;
  if (rem <= 0) rem += 24 * 3600000;
  return rem + 1000;
}

const formatDateDM = (date) => {
  const giorno = String(date.getDate()).padStart(2, "0");
  const mese = String(date.getMonth() + 1).padStart(2, "0");
  return `${giorno}/${mese}`;
};

function formatPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\s/g, "");

  if (cleaned.startsWith("+39")) {
    const prefix = "+39";
    const rest = cleaned.substring(3);

    if (rest.length === 10) {
      return `${prefix} ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6)}`;
    } else if (rest.length === 9) {
      return `${prefix} ${rest.substring(0, 3)} ${rest.substring(3, 7)} ${rest.substring(7)}`;
    }
  }

  return phoneNumber;
}

// Algoritmo di Gauss per il calcolo della data di Pasqua
function calcolaPasqua(anno) {
  const a = anno % 19;
  const b = Math.floor(anno / 100);
  const c = anno % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mese = Math.floor((h + l - 7 * m + 114) / 31);
  const giorno = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(anno, mese - 1, giorno);
}

function getDatePasquali(anno) {
  const pasqua = calcolaPasqua(anno);
  const pasquetta = new Date(pasqua);
  pasquetta.setDate(pasquetta.getDate() + 1);

  return {
    pasqua: formatDateDM(pasqua),
    pasquetta: formatDateDM(pasquetta),
  };
}

// ============================================================
// Calcola l'ultima domenica di un dato mese e anno.
// ============================================================
function ultimaDomenica(anno, mese) {
  const ultimo = new Date(anno, mese, 0, 0, 0, 0, 0);
  while (ultimo.getDay() !== 0) {
    ultimo.setDate(ultimo.getDate() - 1);
  }
  return ultimo;
}

// ============================================================
// Date di cambio stagione per un dato anno.
// I mesi di cambio si leggono da data.cambioStagione nel JSON:
//   { "meseEstivo": 3, "meseInvernale": 10 }
// Se assenti, si usano i valori di default (marzo=3, ottobre=10).
//
//   inizioEstivo    = ultima domenica del mese estivo
//   fineEstivo      = sabato prima dell'ultima domenica del mese invernale
//   inizioInvernale = ultima domenica del mese invernale
//   fineInvernale   = sabato prima dell'ultima domenica del mese estivo
// ============================================================

// Cache globale dei mesi (viene popolata al primo uso)
let _meseEstivo = 3;
let _meseInvernale = 10;

function configuraCambioStagione(data) {
  if (data && data.cambioStagione) {
    _meseEstivo = data.cambioStagione.meseEstivo || 3;
    _meseInvernale = data.cambioStagione.meseInvernale || 10;
  }
}

function getDateCambioStagione(anno) {
  const ultimaDomEstivo = ultimaDomenica(anno, _meseEstivo);
  const ultimaDomInvernale = ultimaDomenica(anno, _meseInvernale);
  const ultimaDomMarzo = ultimaDomEstivo;
  const ultimaDomOttobre = ultimaDomInvernale;

  const fineEstivo = new Date(ultimaDomOttobre);
  fineEstivo.setDate(fineEstivo.getDate() - 1); // sabato prima

  const fineInvernale = new Date(ultimaDomMarzo);
  fineInvernale.setDate(fineInvernale.getDate() - 1); // sabato prima

  return {
    inizioEstivo: ultimaDomMarzo,
    fineEstivo: fineEstivo,
    inizioInvernale: ultimaDomOttobre,
    fineInvernale: fineInvernale,
  };
}

// ============================================================
// Determina la stagione attiva in base alla data fornita.
// Cerca tra le stagioni del JSON abbinando per nome "Estivo"/"Invernale".
// Restituisce: { stagione, annoInizio, annoFine } oppure null.
// ============================================================
function getStagioneAttivaConDate(data, dataRiferimento) {
  const stagioni = data.orariStagionali || [];
  if (!stagioni.length) return null;

  const ref = dataRiferimento || getShopNow();
  const oggi = new Date(ref);
  oggi.setHours(0, 0, 0, 0);
  const anno = oggi.getFullYear();

  // Controlla anni corrente e adiacenti per gestire cavallo d'anno
  for (const offset of [-1, 0, 1]) {
    const a = anno + offset;
    const date = getDateCambioStagione(a);

    // Stagione Estiva: inizioEstivo(a) → fineEstivo(a)
    const stagEstiva = stagioni.find(
      (s) => s.nome && s.nome.toLowerCase() === "estivo",
    );
    if (stagEstiva) {
      const ini = new Date(date.inizioEstivo);
      ini.setHours(0, 0, 0, 0);
      const fin = new Date(date.fineEstivo);
      fin.setHours(0, 0, 0, 0);
      if (oggi >= ini && oggi <= fin) {
        return { stagione: stagEstiva, annoInizio: a, annoFine: a };
      }
    }

    // Stagione Invernale: inizioInvernale(a) → fineInvernale(a+1)
    const stagInvernale = stagioni.find(
      (s) => s.nome && s.nome.toLowerCase() === "invernale",
    );
    if (stagInvernale) {
      const ini = new Date(date.inizioInvernale);
      ini.setHours(0, 0, 0, 0);
      const dateNext = getDateCambioStagione(a + 1);
      const fin = new Date(dateNext.fineInvernale);
      fin.setHours(0, 0, 0, 0);
      if (oggi >= ini && oggi <= fin) {
        return { stagione: stagInvernale, annoInizio: a, annoFine: a + 1 };
      }
    }
  }

  // Fallback: nessun match (non dovrebbe succedere con Estivo+Invernale completi)
  // Usa la stagione il cui inizio è più recente prima di oggi
  const valide = stagioni.filter((s) => s.orari);
  if (!valide.length) return null;

  // Prova a trovare quella più vicina
  let best = null;
  let bestDelta = Infinity;

  for (const stagione of valide) {
    const isEstivo = stagione.nome && stagione.nome.toLowerCase() === "estivo";
    for (const offset of [-1, 0, 1]) {
      const a = anno + offset;
      const date = getDateCambioStagione(a);
      const ini = isEstivo ? date.inizioEstivo : date.inizioInvernale;
      const dataInizio = new Date(ini);
      dataInizio.setHours(0, 0, 0, 0);
      const delta = oggi.getTime() - dataInizio.getTime();
      if (delta >= 0 && delta < bestDelta) {
        bestDelta = delta;
        const annoFine = isEstivo ? a : a + 1;
        best = { stagione, annoInizio: a, annoFine };
      }
    }
  }

  return best;
}

// ============================================================
// Wrapper per compatibilità: restituisce solo la stagione
// ============================================================
function getStagioneAttiva(data, dataRiferimento) {
  const result = getStagioneAttivaConDate(data, dataRiferimento);
  return result ? result.stagione : null;
}

// ============================================================
// Restituisce gli orari da usare oggi:
// stagione attiva > orari base
// ============================================================
function getOrariAttiviOggi(data, dataRiferimento) {
  const result = getStagioneAttivaConDate(data, dataRiferimento);
  return {
    orari: result ? result.stagione.orari : data.orari || [],
    nomeStagione: result ? result.stagione.nome : null,
  };
}

// ============================================================
// Calcola il testo descrittivo di una stagione con le date reali
// Es: "Orario Estivo: dal 30/03/2025 al 25/10/2025"
// ============================================================
function _testoStagioneConAnni(stagione, annoInizio, annoFine) {
  const nome = stagione.nome || "";
  const isEstivo = nome.toLowerCase() === "estivo";

  const dateIni = getDateCambioStagione(annoInizio);
  const dateFin = getDateCambioStagione(annoFine);

  let dataInizio, dataFine;
  if (isEstivo) {
    dataInizio = dateIni.inizioEstivo;
    dataFine = dateFin.fineEstivo;
  } else {
    dataInizio = dateIni.inizioInvernale;
    dataFine = dateFin.fineInvernale;
  }

  const strIni = `${formatDateDM(dataInizio)}/${annoInizio}`;
  const strFin = `${formatDateDM(dataFine)}/${annoFine}`;

  return `Orario ${nome}: dal ${strIni} al ${strFin}`;
}

// ============================================================
// Calcola la prossima istanza futura di una stagione
// Usata per le stagioni non attive
// ============================================================
function _getProssimaIstanzaStagione(stagione, dataRiferimento) {
  const ref = dataRiferimento || getShopNow();
  const oggi = new Date(ref);
  oggi.setHours(0, 0, 0, 0);
  const anno = oggi.getFullYear();
  const isEstivo = stagione.nome && stagione.nome.toLowerCase() === "estivo";

  for (const offset of [0, 1, 2]) {
    const a = anno + offset;
    const date = getDateCambioStagione(a);
    const ini = new Date(isEstivo ? date.inizioEstivo : date.inizioInvernale);
    ini.setHours(0, 0, 0, 0);
    if (ini.getTime() >= oggi.getTime()) {
      const annoFine = isEstivo ? a : a + 1;
      return { annoInizio: a, annoFine };
    }
  }

  return { annoInizio: anno + 1, annoFine: anno + 1 };
}

// ============================================================
// Rileva se nei prossimi 7 giorni a partire da dataRiferimento
// avviene un cambio stagione, e se sì quale.
//
// Restituisce:
//   null → nessun cambio nella settimana
//   { da: "Invernale", a: "Estivo" }   → cambio verso estivo
//   { da: "Estivo",    a: "Invernale" } → cambio verso invernale
// ============================================================
function getRilevaTransizioneStagione(data, dataRiferimento) {
  const stagioni = data.orariStagionali || [];
  if (stagioni.length < 2) return null;

  const ref = dataRiferimento || getShopNow();
  const oggi = new Date(ref);
  oggi.setHours(0, 0, 0, 0);
  const anno = oggi.getFullYear();

  const fine7gg = new Date(oggi);
  fine7gg.setDate(fine7gg.getDate() + 6);
  fine7gg.setHours(0, 0, 0, 0);

  // Helper: differenza in giorni interi (dateA - dateB)
  const diffGiorni = (dateA, dateB) =>
    Math.round((dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));

  for (const offset of [-1, 0, 1]) {
    const a = anno + offset;
    const date = getDateCambioStagione(a);

    // Cambio verso Estivo: inizioEstivo cade nei 7 giorni?
    const iniEst = new Date(date.inizioEstivo);
    iniEst.setHours(0, 0, 0, 0);
    if (iniEst >= oggi && iniEst <= fine7gg) {
      const giorni = diffGiorni(iniEst, oggi);
      return {
        da: "Invernale",
        a: "Estivo",
        giorniMancanti: giorni,
        eCambioOggi: giorni === 0,
      };
    }

    // Cambio verso Invernale: inizioInvernale cade nei 7 giorni?
    const iniInv = new Date(date.inizioInvernale);
    iniInv.setHours(0, 0, 0, 0);
    if (iniInv >= oggi && iniInv <= fine7gg) {
      const giorni = diffGiorni(iniInv, oggi);
      return {
        da: "Estivo",
        a: "Invernale",
        giorniMancanti: giorni,
        eCambioOggi: giorni === 0,
      };
    }
  }

  return null;
}
