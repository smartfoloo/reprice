var TSUBO = 3.305785;
var NOW = new Date().getFullYear();

var csvDataApartment = [];
var csvDataHouse = [];

var COL_APARTMENT = {
  TYPE: 0,
  STATION: 6,
  WALK_TIME: 7,
  PRICE: 8,
  LAYOUT: 9,
  AREA: 10,
  BUILD_YEAR: 11,
  STRUCTURE: 12,
  TRADE_PERIOD: 18
};

var COL_HOUSE = {
  TYPE: 0,
  STATION: 7,
  WALK_TIME: 8,
  PRICE: 9,
  LAYOUT: 11,
  AREA: 10,
  BUILD_YEAR: 14,
  STRUCTURE: 15,
  TRADE_PERIOD: 24
};

function detectPrefecture() {
  var PREFECTURE_MAP = { '東京': 'tokyo', '北海道': 'hokkaido', '大阪': 'osaka' };
  var url = window.location.href.toLowerCase();
  for (var key in PREFECTURE_MAP) {
    if (url.indexOf(key.toLowerCase()) !== -1) return PREFECTURE_MAP[key];
  }
  return 'tokyo';
}

function detectPropertyType() {
  var url = window.location.href;
  if (url.indexOf('/kodate/chuko/') !== -1) return 'house';
  if (url.indexOf('/mansion/chuko/') !== -1) return 'apartment';
  return null;
}

function checkEnabled(callback) {
  chrome.storage.sync.get({
    athomeEnabled: true,
    apartmentEnabled: true,
    houseEnabled: true
  }, function (data) {
    callback(data.athomeEnabled, data.apartmentEnabled, data.houseEnabled);
  });
}

function loadCSV(callback) {
  var prefecture = detectPrefecture();
  console.log('[Athome] Detected prefecture:', prefecture);

  if (typeof loadPrefectureCSV === 'undefined') {
    console.log('[Athome] CSV loader not found');
    callback();
    return;
  }

  chrome.storage.sync.get({ apartmentEnabled: true, houseEnabled: true }, function (data) {
    var pendingLoads = 0;

    if (data.apartmentEnabled) {
      pendingLoads++;
      loadPrefectureCSV(prefecture, COL_APARTMENT, 'apartment', function (csv) {
        csvDataApartment = csv;
        console.log('[Athome] Apartment CSV:', csvDataApartment.length);
        pendingLoads--;
        if (pendingLoads === 0) callback();
      });
    }

    if (data.houseEnabled) {
      pendingLoads++;
      loadPrefectureCSV(prefecture, COL_HOUSE, 'house', function (csv) {
        csvDataHouse = csv;
        console.log('[Athome] House CSV:', csvDataHouse.length);
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
  return name.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').replace(/駅$/, '').trim();
}

function findMatchingProperties(stationName, ageRange, csvData, COL) {
  var normalizedTarget = normalizeStation(stationName);
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
  text = text.replace(/,/g, '');
  var okuMatch = text.match(/(\d+)億/);
  var manMatch = text.match(/(\d+)万/);
  var oku = okuMatch ? parseInt(okuMatch[1]) * 10000 : 0;
  var man = manMatch ? parseInt(manMatch[1]) : 0;
  return (oku + man) * 10000;
}

function parseArea(text) {
  if (!text) return null;
  var match = text.match(/([\d.]+)m²/);
  return match ? parseFloat(match[1]) : null;
}

function parseFloorsFromTitle(titleText) {
  var floorMatch = titleText.match(/(\d+)階建/);
  return floorMatch ? parseInt(floorMatch[1]) : null;
}

function parseAgeFromText(text) {
  var ageMatch = text.match(/築(\d+(?:\.\d+)?)年/);
  if (ageMatch) return parseFloat(ageMatch[1]);

  var yearMatch = text.match(/(\d{4})年/);
  if (yearMatch) return NOW - parseInt(yearMatch[1]);
  return null;
}

function calculateHouseAdjustment(floors, age, landArea, buildingArea) {
  if (!floors) return { adjustment: 1.0, note: '階数不明' };

  var floorFactor = Math.max(0.8, Math.min(1.5, 3 / floors));
  var ageFactor = Math.max(0.3, 1 - (age || 0) / 100);
  var landWeight = age > 25 ? 0.7 : age > 15 ? 0.4 : 0.2;

  return {
    adjustment: floorFactor * ageFactor,
    note: `階数${floors}F・土地/建物考慮`
  };
}

function extractPropertyData(card, propType) {
  var data = {
    price: null,
    landArea: null,
    buildingArea: null,
    exclusiveArea: null,
    floors: null,
    age: null,
    station: null,
    ageRange: null,
    tsuboPrice: null
  };

  var priceEl = card.querySelector('.property-price');
  if (priceEl) data.price = parsePrice(priceEl.textContent);

  var titleEl = card.querySelector('.title-wrap__title-text');
  if (titleEl && propType === 'house') {
    data.floors = parseFloorsFromTitle(titleEl.textContent);
  }

  var blocks = card.querySelectorAll('.property-detail-table__block');
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    var label = block.querySelector('strong');
    var value = block.querySelector('span');

    if (!label || !value) continue;

    var labelText = label.textContent.trim();
    var valueText = value.textContent.trim();

    if (labelText === '土地面積') data.landArea = parseArea(valueText);
    if (labelText === '建物面積') data.buildingArea = parseArea(valueText);

    if (labelText === '専有面積') data.exclusiveArea = parseArea(valueText);

    if (labelText === '築年月') {
      data.age = parseAgeFromText(valueText);
      data.ageRange = data.age !== null ? getAgeRange(data.age) : null;
    }

    if (labelText === '交通') {
      var stationMatch = valueText.match(/「([^」]+)」|([^\s「」／]+)駅/);
      if (stationMatch) data.station = stationMatch[1] || stationMatch[2];
    }
  }

  var baseArea = propType === 'house'
    ? (data.buildingArea || data.landArea)
    : data.exclusiveArea;

  if (data.price && baseArea && baseArea > 0) {
    data.tsuboPrice = Math.round(data.price / (baseArea / TSUBO));
  }

  return data;
}

function appendComparison(card, data, reasonablePrice, matchCount, avgTsuboPrice, adjustmentNote) {
  if (card.querySelector('.athome-price-checker')) return;

  var detailDiv = card.querySelector('.card-box-inner__detail');
  if (!detailDiv) return;

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

  var newEl = document.createElement('div');
  newEl.className = 'athome-price-checker';
  newEl.style.marginTop = '10px';
  newEl.innerHTML = '<div class="price-checker-result ' + diffClass + '">' +
    '<span class="price-checker-diff">' + diffText + '</span>' +
    '</div>' +
    '<div class="price-checker-details"><div class="price-checker-detail">' +
    '<strong>適正価格</strong><p>' + yen(reasonablePrice) + '</p></div>' +
    '<div class="price-checker-detail">' +
    '<strong>基準坪単価</strong><p>' + yen(avgTsuboPrice) + '</p></div>' +
    '<div class="price-checker-detail">' +
    '<strong>条件</strong><p>' + data.station + '駅・築' + data.ageRange + '年 ' + matchCount + '件' + '</p>' +
    '</div>' +
    (adjustmentNote ? '<br><small>' + adjustmentNote + '</small>' : '') +
    '</div>';

  detailDiv.appendChild(newEl);
}

function appendNoData(card, reason) {
  if (card.querySelector('.athome-price-checker')) return;
  var detailDiv = card.querySelector('.card-box-inner__detail');
  if (!detailDiv) return;

  var newEl = document.createElement('div');
  newEl.className = 'athome-price-checker';
  newEl.style.marginTop = '10px';
  newEl.style.borderTop = '1px dashed #ccc';
  newEl.style.paddingTop = '10px';
  newEl.style.color = '#666';
  newEl.innerHTML = '<div class="price-checker-result nodata">' +
    '<span class="price-checker-label">' + reason + '</span>' +
    '</div>';

  detailDiv.appendChild(newEl);
}

function processProperties() {
  var propType = detectPropertyType();
  if (!propType) return console.log('[Athome] Unknown type');

  var csvData = propType === 'house' ? csvDataHouse : csvDataApartment;
  var COL = propType === 'house' ? COL_HOUSE : COL_APARTMENT;

  if (csvData.length === 0) return console.log('[Athome] No CSV');

  var cards = document.querySelectorAll('athome-csite-pc-part-bukken-card-ryutsu-sell-living');
  console.log('[Athome] Found', cards.length, propType, 'cards');

  var processed = 0;
  cards.forEach(function (card) {
    var data = extractPropertyData(card, propType);

    var hasArea = propType === 'house'
      ? (data.buildingArea || data.landArea)
      : data.exclusiveArea;

    if (!data.price || !hasArea) return;

    if (!data.station || !data.ageRange) {
      appendNoData(card, data.station ? '築年不明' : '駅不明');
      return;
    }

    if (propType === 'house' && !data.floors) {
      appendNoData(card, '階数不明（タイトル確認要）');
      return;
    }

    var matches = findMatchingProperties(data.station, data.ageRange, csvData, COL);
    if (matches.length === 0) {
      appendNoData(card, data.station + '駅・築' + data.ageRange + '年データなし');
      return;
    }

    var avgTsuboPrice = calculateAverageTsuboPrice(matches);
    var baseArea = propType === 'house'
      ? (data.buildingArea || data.landArea)
      : data.exclusiveArea;
    var baseReasonable = avgTsuboPrice * (baseArea / TSUBO);

    var finalReasonable = baseReasonable;
    var adjustmentNote = '';

    if (propType === 'house') {
      var adj = calculateHouseAdjustment(data.floors, data.age, data.landArea, data.buildingArea);
      finalReasonable = Math.round(baseReasonable * adj.adjustment);
      adjustmentNote = adj.note;
    }

    appendComparison(card, data, finalReasonable, matches.length, avgTsuboPrice, adjustmentNote);
    processed++;
  });

  console.log('[Athome] Processed', processed, '/', cards.length);
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