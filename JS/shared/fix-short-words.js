(function () {
  // Carica le parole corte dal JSON
  var shortWordsPromise = fetch('data/short-words.json')
    .then(function (response) { return response.json(); })
    .catch(function () {
      console.warn('⚠️ Impossibile caricare short-words.json, uso fallback.');
      return [
        "a", "al", "alla", "alle", "allo", "ai", "agli", "alle",
        "col", "con", "da", "dal", "dalla", "dalle", "dallo",
        "dei", "degli", "del", "della", "delle", "di",
        "e", "ed", "fra",
        "il", "lo", "la", "le", "li", "lo",
        "ne", "nel", "nella", "nelle", "nello",
        "o", "per", "se", "su", "sul", "sulla", "sulle",
        "tra", "un", "una", "uno", "vi"
      ];
    });

  // Conserviamo il metodo originale di JsonData.load
  var originalLoad = JsonData.load;

  // Sostituiamo il metodo con uno che prima carica le parole corte
  JsonData.load = function (key) {
    return shortWordsPromise.then(function (shortWords) {
      // Crea la regex per trovare le parole corte seguite da spazio
      var pattern = new RegExp('\\b(' + shortWords.join('|') + ')\\s(?=\\w)', 'gi');

      function fixText(text) {
        if (!text || typeof text !== 'string') return text;
        return text.replace(pattern, function (match, p1) {
          return p1 + '\u00A0'; // spazio unificatore (&nbsp;)
        });
      }

      function processObject(obj) {
        if (!obj || typeof obj !== 'object') return;
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            var val = obj[key];
            if (typeof val === 'string') {
              obj[key] = fixText(val);
            } else if (Array.isArray(val)) {
              for (var i = 0; i < val.length; i++) {
                if (typeof val[i] === 'string') {
                  val[i] = fixText(val[i]);
                } else if (typeof val[i] === 'object') {
                  processObject(val[i]);
                }
              }
            } else if (typeof val === 'object') {
              processObject(val);
            }
          }
        }
      }

      // Chiamiamo il metodo originale e poi processiamo i dati
      return originalLoad.call(JsonData, key).then(function (data) {
        processObject(data);
        return data;
      });
    });
  };

  console.log('✅ Fix parole corte attivo.');
})();