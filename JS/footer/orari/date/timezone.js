// ============================================================
// timezone.js — Gestione del fuso orario (stessa logica della
// Macelleria da Ketti / Giri in Bici)
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

let _shopTimezone = "Europe/Rome";

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
