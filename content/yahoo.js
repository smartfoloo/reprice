var TSUBO = 3.305785;
var NOW = new Date().getFullYear();

var csvDataApartment = [];
var csvDataHouse = [];

var COL_APARTMENT = {
  TYPE: 0, STATION: 6, WALK_TIME: 7, PRICE: 8, LAYOUT: 9, AREA: 10,
  BUILD_YEAR: 11, STRUCTURE: 12, TRADE_PERIOD: 18
};

var COL_HOUSE = {
  TYPE: 0, STATION: 7, WALK_TIME: 8, PRICE: 9, LAYOUT: 11, AREA: 10,
  BUILD_YEAR: 14, STRUCTURE: 15, TRADE_PERIOD: 24
};

function detectPrefecture() {
  var PREFECTURE_MAP = {
    '北海道': 'hokkaido', '青森': 'aomori', '岩手': 'iwate', '宮城': 'miyagi',
    '秋田': 'akita', '山形': 'yamagata', '福島': 'fukushima', '茨城': 'ibaraki',
    '栃木': 'tochigi', '群馬': 'gunma', '埼玉': 'saitama', '千葉': 'chiba',
    '東京': 'tokyo', '神奈川': 'kanagawa', '新潟': 'niigata', '富山': 'toyama',
    '石川': 'ishikawa', '福井': 'fukui', '山梨': 'yamanashi', '長野': 'nagano',
    '岐阜': 'gifu', '静岡': 'shizuoka', '愛知': 'aichi', '三重': 'mie',
    '滋賀': 'shiga', '京都': 'kyoto', '大阪': 'osaka', '兵庫': 'hyogo',
    '奈良': 'nara', '和歌山': 'wakayama', '鳥取': 'tottori', '島根': 'shimane',
    '岡山': 'okayama', '広島': 'hiroshima', '山口': 'yamaguchi', '徳島': 'tokushima',
    '香川': 'kagawa', '愛媛': 'ehime', '高知': 'kochi', '福岡': 'fukuoka',
    '佐賀': 'saga', '長崎': 'nagasaki', '熊本': 'kumamoto', '大分': 'oita',
    '宮崎': 'miyazaki', '鹿児島': 'kagoshima', '沖縄': 'okinawa'
  };
  var url = window.location.href.toLowerCase();
  for (var key in PREFECTURE_MAP) {
    if (url.indexOf(key.toLowerCase()) !== -1) return PREFECTURE_MAP[key];
  }
  return 'tokyo';
}

function detectPropertyType() {
  var url = window.location.href;
  if (url.indexOf('/house/search/') !== -1) return 'house';
  if (url.indexOf('/mansion/search/') !== -1 || url.indexOf('/apartment/') !== -1) return 'apartment';
  return null;
}

function checkEnabled(callback) {
  chrome.storage.sync.get({
    yahooEnabled: true, apartmentEnabled: true, houseEnabled: true
  }, function (data) {
    callback(data.yahooEnabled, data.apartmentEnabled, data.houseEnabled);
  });
}

function loadCSV(callback) {
  var prefecture = detectPrefecture();
  console.log('[Yahoo] Detected prefecture:', prefecture);

  if (typeof loadPrefectureCSV === 'undefined') {
    console.log('[Yahoo] CSV loader not found');
    callback();
    return;
  }

  chrome.storage.sync.get({ apartmentEnabled: true, houseEnabled: true }, function (data) {
    var pendingLoads = 0;

    if (data.apartmentEnabled) {
      pendingLoads++;
      loadPrefectureCSV(prefecture, COL_APARTMENT, 'apartment', function (csv) {
        csvDataApartment = csv;
        console.log('[Yahoo] Apartment CSV:', csvDataApartment.length);
        pendingLoads--;
        if (pendingLoads === 0) callback();
      });
    }

    if (data.houseEnabled) {
      pendingLoads++;
      loadPrefectureCSV(prefecture, COL_HOUSE, 'house', function (csv) {
        csvDataHouse = csv;
        console.log('[Yahoo] House CSV:', csvDataHouse.length);
        pendingLoads--;
        if (pendingLoads === 0) callback();
      });
    }

    if (pendingLoads === 0) callback();
  });
}

function parseBuildYear(text) {
  if (!text) return null;
  var match = text.match(/(\d{4})年/);
  if (match) return parseInt(match[1]);
  return null;
}

function getAgeRange(age) {
  if (age === null || age < 0) return null;
  if (age <= 10) return '1-10';
  if (age <= 20) return '11-20';
  if (age <= 30) return '21-30';
  if (age <= 40) return '31-40';
  return '41+';
}

function normalizeStation(name) {
  if (!name) return '';
  return name.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').replace(/駅$/, '')
    .replace(/中央本線|JR東日本|他/g, '').trim();
}

function findMatchingProperties(stationName, ageRange, csvData, COL) {
  var normalizedTarget = normalizeStation(stationName);
  if (!normalizedTarget) return [];

  var matches = [];
  for (var i = 0; i < csvData.length; i++) {
    var row = csvData[i];
    var csvStation = normalizeStation(row[COL.STATION]);

    if (csvStation !== normalizedTarget) continue;

    var walkTime = row[COL.WALK_TIME];
    if (!walkTime || isNaN(parseInt(walkTime))) continue;

    var buildYear = parseBuildYear(row[COL.BUILD_YEAR]);
    if (!buildYear) continue;

    var csvAge = NOW - buildYear;
    var csvAgeRange = getAgeRange(csvAge);
    if (csvAgeRange !== ageRange) continue;

    var price = parseInt(row[COL.PRICE]);
    var area = parseFloat(row[COL.AREA]);
    if (!price || !area || area <= 0) continue;

    var tsuboArea = area / TSUBO;
    var tsuboPrice = price / tsuboArea;

    matches.push({ price, area, tsuboPrice });
  }
  return matches;
}

function calculateAverageTsuboPrice(matches) {
  if (matches.length === 0) return null;
  var sum = 0;
  for (var i = 0; i < matches.length; i++) {
    sum += matches[i].tsuboPrice;
  }
  return Math.round(sum / matches.length);
}

function yen(n) {
  if (!n) return '0円';
  if (n >= 1e8) {
    var o = Math.floor(n / 1e8);
    var m = Math.round((n % 1e8) / 1e4);
    return m > 0 ? o + '億' + m.toLocaleString() + '万円' : o + '億円';
  }
  return n >= 1e4 ? Math.round(n / 1e4).toLocaleString() + '万円' : n.toLocaleString() + '円';
}

function parsePrice(text) {
  if (!text) return null;
  text = text.replace(/[,\s]/g, '');
  var okuMatch = text.match(/(\d+)億/);
  var manMatch = text.match(/(\d+(?:,\d+)?)万/);
  var oku = okuMatch ? parseInt(okuMatch[1]) * 10000 : 0;
  var man = manMatch ? parseInt(manMatch[1].replace(/,/g, '')) : 0;
  return (oku + man) * 10000;
}

function parseFloors(text) {
  var match = text.match(/地上(\d+)階|(\d+)階建|(\d+)F/);
  return match ? parseInt(match[1] || match[2] || match[3]) || 2 : 2;
}

function calculateHouseAdjustment(floors, age, landArea, buildingArea) {
  var floorFactor = Math.max(0.8, Math.min(1.5, 3 / floors));
  var ageFactor = Math.max(0.3, 1 - (age || 0) / 100);
  var landWeight = age > 25 ? 0.7 : age > 15 ? 0.4 : 0.2;

  return {
    adjustment: floorFactor * ageFactor,
    note: `階数${floors}F・土地/建物考慮`
  };
}

function extractStationFromText(text) {
  var stationMatch = text.match(/「([^」]+)」駅|([^ \s「」徒歩]+)駅/);
  if (stationMatch) return stationMatch[1] || stationMatch[2];

  var fallbackMatch = text.match(/([^\s「」]+)駅\s*徒歩/);
  if (fallbackMatch) return fallbackMatch[1];

  return null;
}

function extractPropertyData(item, propertyType) {
  var data = {
    price: null, landArea: null, buildingArea: null, floors: 2, age: null,
    station: null, ageRange: null, tsuboPrice: null
  };

  var priceEl = item.querySelector('.ListCassette2__info__price');
  if (priceEl) data.price = parsePrice(priceEl.textContent.trim());

  var summarySection = item.querySelector('.ListCassette2__summary .ListCassette2__info');
  if (summarySection) {
    var summaryItems = summarySection.querySelectorAll('.ListCassette2__info__dtl');
    for (var i = 0; i < summaryItems.length; i++) {
      var text = summaryItems[i].textContent.trim();

      if (text.indexOf('駅') !== -1 && text.indexOf('徒歩') !== -1) {
        data.station = extractStationFromText(text);
      }

      var ageMatch = text.match(/築(\d+)年/);
      if (ageMatch) {
        data.age = parseInt(ageMatch[1]);
      } else {
        var yearMatch = text.match(/(\d{4})年/);
        if (yearMatch) data.age = NOW - parseInt(yearMatch[1]);
      }
      if (data.age !== null) data.ageRange = getAgeRange(data.age);
    }
  }

  var roomTitle = item.querySelector('.ListCassette2__ttl__txt--inner');
  if (roomTitle) {
    var areaMatch = roomTitle.textContent.match(/([\d.]+)m/);
    if (areaMatch) data.buildingArea = parseFloat(areaMatch[1]);
  }

  if (propertyType === 'house') {
    var infoItems = item.querySelectorAll('.ListCassette2__info__dtl');
    for (var j = 0; j < infoItems.length; j++) {
      var text = infoItems[j].textContent.trim();
      var landMatch = text.match(/土地\s*([\d.]+)m/);
      var buildingMatch = text.match(/建物\s*([\d.]+)m/);
      if (landMatch) data.landArea = parseFloat(landMatch[1]);
      if (buildingMatch) data.buildingArea = parseFloat(buildingMatch[1]);
    }
  }

  var baseArea = data.buildingArea || data.landArea;
  if (data.price && baseArea && baseArea > 0) {
    data.tsuboPrice = Math.round(data.price / (baseArea / TSUBO));
  }

  return data;
}

function appendComparison(item, data, reasonablePrice, matchCount, avgTsuboPrice, adjustmentNote) {
  if (item.querySelector('.yahoo-price-checker')) return;

  var infoList = item.querySelector('.ListCassette2__info');
  if (!infoList) return;

  var diff = data.price - reasonablePrice;
  var diffPercent = reasonablePrice ? (diff / reasonablePrice) * 100 : 0;
  var diffText = '', diffClass = '';

  if (diffPercent > 3) {
    diffText = '↑ ' + Math.abs(diffPercent).toFixed(1) + '%高い';
    diffClass = 'expensive';
  } else if (diffPercent < -3) {
    diffText = '↓ ' + Math.abs(diffPercent).toFixed(1) + '%安い';
    diffClass = 'cheap';
  } else {
    diffText = '→ 適正価格';
    diffClass = 'fair';
  }

  var newEl = document.createElement('li');
  newEl.className = 'ListCassette2__info__dtl yahoo-price-checker';
  newEl.innerHTML = '<span class="price-checker-result ' + diffClass + '">' +
    '<span class="price-checker-diff">' + diffText + '</span>' +
    '</span> ' +
    '<span class="price-checker-detail">' +
    '適正: ' + yen(reasonablePrice) +
    ' / 基準坪単価: ' + yen(avgTsuboPrice) + '/坪' +
    '（' + data.station + '駅・築' + data.ageRange + '年 ' + matchCount + '件）' +
    (adjustmentNote ? '<br><small>' + adjustmentNote + '</small>' : '') +
    '</span>';

  infoList.appendChild(newEl);
}

function appendNoData(item, reason) {
  if (item.querySelector('.yahoo-price-checker')) return;
  var infoList = item.querySelector('.ListCassette2__info');
  if (!infoList) return;

  var newEl = document.createElement('li');
  newEl.className = 'ListCassette2__info__dtl yahoo-price-checker';
  newEl.innerHTML = '<span class="price-checker-result nodata">データなし: ' + reason + '</span>';
  infoList.appendChild(newEl);
}

function processProperties() {
  var propType = detectPropertyType();
  if (!propType) return console.log('[Yahoo] Unknown type');

  var csvData = propType === 'house' ? csvDataHouse : csvDataApartment;
  var COL = propType === 'house' ? COL_HOUSE : COL_APARTMENT;

  if (csvData.length === 0) {
    console.log('[Yahoo] No CSV for', propType);
    return;
  }

  var items = document.querySelectorAll('.ListBukken2__list__item');
  console.log('[Yahoo] Found', items.length, propType, 'items');

  var processed = 0;
  items.forEach(function (item) {
    var data = extractPropertyData(item, propType);

    var hasArea = propType === 'house'
      ? (data.buildingArea || data.landArea)
      : data.buildingArea;

    if (!data.price || !hasArea) return;

    if (!data.station || !data.ageRange) {
      appendNoData(item, data.station ? '築年不明' : '駅不明');
      return;
    }

    var matches = findMatchingProperties(data.station, data.ageRange, csvData, COL);
    if (matches.length === 0) {
      appendNoData(item, data.station + '駅・築' + data.ageRange + '年データなし');
      return;
    }

    var avgTsuboPrice = calculateAverageTsuboPrice(matches);
    var baseArea = data.buildingArea || data.landArea;
    var baseReasonable = avgTsuboPrice * (baseArea / TSUBO);

    var finalReasonable = baseReasonable;
    var adjustmentNote = '';

    if (propType === 'house') {
      var adj = calculateHouseAdjustment(data.floors, data.age, data.landArea, data.buildingArea);
      finalReasonable = Math.round(baseReasonable * adj.adjustment);
      adjustmentNote = adj.note;
    }

    appendComparison(item, data, finalReasonable, matches.length, avgTsuboPrice, adjustmentNote);
    processed++;
  });

  console.log('[Yahoo] Processed', processed, '/', items.length);
}

function init() {
  checkEnabled(function (enabled, apartmentEnabled, houseEnabled) {
    if (!enabled) return;

    var propType = detectPropertyType();
    if (!propType) return;

    if (propType === 'apartment' && !apartmentEnabled) return;
    if (propType === 'house' && !houseEnabled) return;

    loadCSV(function () {
      processProperties();

      var observer = new MutationObserver(function () {
        setTimeout(processProperties, 500);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}