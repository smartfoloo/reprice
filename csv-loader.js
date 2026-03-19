var PREFECTURE_MAP = {
  '北海道': 'hokkaido',
  '青森': 'aomori',
  '岩手': 'iwate',
  '宮城': 'miyagi',
  '秋田': 'akita',
  '山形': 'yamagata',
  '福島': 'fukushima',
  '茨城': 'ibaraki',
  '栃木': 'tochigi',
  '群馬': 'gunma',
  '埼玉': 'saitama',
  '千葉': 'chiba',
  '東京': 'tokyo',
  '神奈川': 'kanagawa',
  '新潟': 'niigata',
  '富山': 'toyama',
  '石川': 'ishikawa',
  '福井': 'fukui',
  '山梨': 'yamanashi',
  '長野': 'nagano',
  '岐阜': 'gifu',
  '静岡': 'shizuoka',
  '愛知': 'aichi',
  '三重': 'mie',
  '滋賀': 'shiga',
  '京都': 'kyoto',
  '大阪': 'osaka',
  '兵庫': 'hyogo',
  '奈良': 'nara',
  '和歌山': 'wakayama',
  '鳥取': 'tottori',
  '島根': 'shimane',
  '岡山': 'okayama',
  '広島': 'hiroshima',
  '山口': 'yamaguchi',
  '徳島': 'tokushima',
  '香川': 'kagawa',
  '愛媛': 'ehime',
  '高知': 'kochi',
  '福岡': 'fukuoka',
  '佐賀': 'saga',
  '長崎': 'nagasaki',
  '熊本': 'kumamoto',
  '大分': 'oita',
  '宮崎': 'miyazaki',
  '鹿児島': 'kagoshima',
  '沖縄': 'okinawa'
};

function detectPrefectureFromURL() {
  var url = window.location.href.toLowerCase();

  for (var key in PREFECTURE_MAP) {
    if (url.indexOf(key) !== -1) {
      return PREFECTURE_MAP[key];
    }
  }

  return null;
}

function detectPrefectureFromMeta() {
  var metaTags = document.querySelectorAll('meta[name*="prefecture"], meta[property*="prefecture"]');
  for (var i = 0; i < metaTags.length; i++) {
    var content = metaTags[i].getAttribute('content');
    if (content) {
      for (var key in PREFECTURE_MAP) {
        if (content.toLowerCase().indexOf(key) !== -1) {
          return PREFECTURE_MAP[key];
        }
      }
    }
  }
  return null;
}

function detectPrefectureFromBreadcrumb() {
  var breadcrumbs = document.querySelectorAll('.breadcrumbs, .breadcrumb, [class*="breadcrumb"]');
  for (var i = 0; i < breadcrumbs.length; i++) {
    var text = breadcrumbs[i].textContent.toLowerCase();
    for (var key in PREFECTURE_MAP) {
      if (text.indexOf(key) !== -1) {
        return PREFECTURE_MAP[key];
      }
    }
  }
  return null;
}

function detectPrefecture() {
  var pref = detectPrefectureFromURL();
  if (pref) return pref;

  pref = detectPrefectureFromMeta();
  if (pref) return pref;

  pref = detectPrefectureFromBreadcrumb();
  if (pref) return pref;

  return 'tokyo';
}

function decompressGzip(compressedData) {
  return new Promise(function (resolve, reject) {
    if (typeof DecompressionStream !== 'undefined') {
      var stream = new DecompressionStream('gzip');
      var writer = stream.writable.getWriter();
      writer.write(compressedData);
      writer.close();

      var reader = stream.readable.getReader();
      var chunks = [];

      function read() {
        reader.read().then(function (result) {
          if (result.done) {
            var totalLength = 0;
            for (var i = 0; i < chunks.length; i++) {
              totalLength += chunks[i].length;
            }
            var combined = new Uint8Array(totalLength);
            var offset = 0;
            for (var i = 0; i < chunks.length; i++) {
              combined.set(chunks[i], offset);
              offset += chunks[i].length;
            }
            resolve(combined);
            return;
          }
          chunks.push(result.value);
          read();
        }).catch(reject);
      }
      read();
    } else {
      reject(new Error('DecompressionStream not supported'));
    }
  });
}

function loadPrefectureCSV(prefecture, COL, callback) {
  var csvUrl = chrome.runtime.getURL('data/' + prefecture + '.csv.gz');

  console.log('[CSV Loader] Loading prefecture:', prefecture, 'from', csvUrl);

  fetch(csvUrl)
    .then(function (response) {
      if (!response.ok) {
        console.warn('[CSV Loader] Gzipped file not found, trying uncompressed');
        return fetch(chrome.runtime.getURL('data/' + prefecture + '.csv'));
      }
      return response;
    })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('HTTP error ' + response.status);
      }
      return response.arrayBuffer();
    })
    .then(function (buffer) {
      var isGzipped = csvUrl.indexOf('.gz') !== -1;

      if (isGzipped) {
        return decompressGzip(new Uint8Array(buffer));
      } else {
        return new Uint8Array(buffer);
      }
    })
    .then(function (decompressedData) {
      var decoder = new TextDecoder('shift-jis');
      var text = decoder.decode(decompressedData);

      console.log('[CSV Loader] CSV loaded successfully, size:', text.length);

      var csvData = parseCSV(text, COL);
      console.log('[CSV Loader] Parsed', csvData.length, 'records');

      callback(csvData);
    })
    .catch(function (err) {
      console.error('[CSV Loader] Failed to load CSV:', err);
      callback([]);
    });
}

function parseCSV(text, COL) {
  var lines = text.split('\n');
  var result = [];

  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    var row = [];
    var inQuote = false;
    var field = '';

    for (var j = 0; j < line.length; j++) {
      var c = line[j];
      if (c === '"') {
        inQuote = !inQuote;
      } else if (c === ',' && !inQuote) {
        row.push(field.trim());
        field = '';
      } else {
        field += c;
      }
    }
    row.push(field.trim());

    if (row[COL.TYPE] && row[COL.TYPE].indexOf('中古マンション') !== -1) {
      result.push(row);
    }
  }

  return result;
}
