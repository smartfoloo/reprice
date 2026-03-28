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
  var url = window.location.href;
  // Handle hokkaido_ style (suumo uses trailing underscore)
  var urlLower = url.toLowerCase().replace('hokkaido_', 'hokkaido');
  for (var key in PREFECTURE_MAP) {
    if (urlLower.indexOf(key.toLowerCase()) !== -1) {
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
        if (content.indexOf(key) !== -1) {
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
    var text = breadcrumbs[i].textContent;
    for (var key in PREFECTURE_MAP) {
      if (text.indexOf(key) !== -1) {
        return PREFECTURE_MAP[key];
      }
    }
  }
  return null;
}

// Last-resort: scan property addresses on the page for a prefecture name
function detectPrefectureFromAddresses() {
  // Look for text nodes or dd/span containing Japanese addresses
  var addressSelectors = [
    '.dottable-vm', // suumo
    '.ListCassette2__info__dtl', // yahoo
    '.property-detail-table__block span', // athome
    'dd', 'td', '.address', '[class*="address"]'
  ];
  var textSamples = [];
  for (var s = 0; s < addressSelectors.length; s++) {
    var els = document.querySelectorAll(addressSelectors[s]);
    for (var e = 0; e < els.length && textSamples.length < 50; e++) {
      textSamples.push(els[e].textContent);
    }
  }
  for (var t = 0; t < textSamples.length; t++) {
    var text = textSamples[t];
    for (var key in PREFECTURE_MAP) {
      if (text.indexOf(key + '県') !== -1 || text.indexOf(key + '都') !== -1 ||
        text.indexOf(key + '府') !== -1 || text.indexOf(key + '道') !== -1) {
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
  pref = detectPrefectureFromAddresses();
  if (pref) return pref;
  return 'tokyo';
}

function parseCSVLine(line) {
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
  return row;
}

function parseCSV(text, COL, propertyType) {
  var lines = text.split('\n');
  var result = [];
  var useTypeFilter = propertyType === 'apartment';

  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    var row = parseCSVLine(line);

    while (row.length <= Math.max(COL.PRICE, COL.AREA, COL.STATION, COL.BUILD_YEAR)) {
      row.push('');
    }

    var price = parseInt(row[COL.PRICE] || 0);
    var area = parseFloat(row[COL.AREA] || 0);
    var station = row[COL.STATION] || '';
    var buildYear = row[COL.BUILD_YEAR] || '';

    if (price > 0 && area > 0 && buildYear) {
      if (useTypeFilter && (!row[COL.TYPE] || row[COL.TYPE].indexOf('中古マンション') === -1)) {
        continue;
      }
      result.push(row);
    }
  }

  console.log('[CSV Loader] Parsed', result.length, 'valid records for', propertyType);
  return result;
}

function loadPrefectureCSV(prefecture, COL, propertyType, callback) {
  var dataType = propertyType === 'house' ? 'ci' : 'cm';

  console.log('[CSV Loader] Requesting', propertyType, 'CSV for', prefecture, '(type:', dataType + ')');

  chrome.runtime.sendMessage(
    { type: 'loadCSV', prefecture: prefecture, dataType: dataType },
    function (response) {
      if (chrome.runtime.lastError) {
        console.error('[CSV Loader] Message error:', chrome.runtime.lastError.message);
        callback([]);
        return;
      }
      if (!response || response.error) {
        console.error('[CSV Loader] Background error:', response && response.error);
        callback([]);
        return;
      }
      var csvData = parseCSV(response.text, COL, propertyType);
      console.log('[CSV Loader] Got', csvData.length, 'records for', prefecture, propertyType);
      callback(csvData);
    }
  );
}