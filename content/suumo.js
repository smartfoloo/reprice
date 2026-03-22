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

function detectPrefecture() {
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
  var url = window.location.href.toLowerCase();
  for (var key in PREFECTURE_MAP) {
    if (url.indexOf(key.toLowerCase()) !== -1) return PREFECTURE_MAP[key];
  }
  return 'tokyo';
}

function detectPropertyType() {
  var url = window.location.href;
  if (url.indexOf('bs=021') !== -1) return 'house';
  if (url.indexOf('bs=011') !== -1) return 'apartment';
  return null;
}

function checkEnabled(callback) {
  chrome.storage.sync.get({
    suumoEnabled: true,
    apartmentEnabled: true,
    houseEnabled: true
  }, function (data) {
    callback(data.suumoEnabled, data.apartmentEnabled, data.houseEnabled);
  });
}

function loadCSV(callback) {
  var prefecture = detectPrefecture();
  console.log('[SUUMO] Detected prefecture:', prefecture);

  if (typeof loadPrefectureCSV === 'undefined') {
    console.log('[SUUMO] CSV loader not found');
    callback();
    return;
  }

  chrome.storage.sync.get({ apartmentEnabled: true }, function (data) {
    if (!data.apartmentEnabled) {
      callback();
      return;
    }

    loadPrefectureCSV(prefecture, COL_APARTMENT, 'apartment', function (data) {
      csvDataApartment = data;
      console.log('[SUUMO] Apartment CSV:', csvDataApartment.length, 'records');
      callback();
    });
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

function findMatchingProperties(stationName, ageRange, csvData) {
  var normalizedTarget = normalizeStation(stationName);
  if (!normalizedTarget) return [];

  var matches = [];
  for (var i = 0; i < csvData.length; i++) {
    var row = csvData[i];
    var csvStation = normalizeStation(row[COL_APARTMENT.STATION]);

    if (csvStation !== normalizedTarget) continue;

    var walkTime = row[COL_APARTMENT.WALK_TIME];
    if (!walkTime || isNaN(parseInt(walkTime))) continue;

    var buildYear = parseBuildYear(row[COL_APARTMENT.BUILD_YEAR]);
    if (!buildYear) continue;

    var csvAge = NOW - buildYear;
    var csvAgeRange = getAgeRange(csvAge);
    if (csvAgeRange !== ageRange) continue;

    var price = parseInt(row[COL_APARTMENT.PRICE]);
    var area = parseFloat(row[COL_APARTMENT.AREA]);
    if (!price || !area || area <= 0) continue;

    var tsuboArea = area / TSUBO;
    var tsuboPrice = price / tsuboArea;

    matches.push({ price: price, area: area, tsuboPrice: tsuboPrice });
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
  var manMatch = text.match(/(\d+)万/);
  var oku = okuMatch ? parseInt(okuMatch[1]) * 10000 : 0;
  var man = manMatch ? parseInt(manMatch[1]) : 0;
  return (oku + man) * 10000;
}

function parseArea(text) {
  if (!text) return null;
  var match = text.match(/([\d.]+)m/);
  return match ? parseFloat(match[1]) : null;
}

function extractStationName(unit) {
  var lines = unit.querySelectorAll('.dottable-line');
  for (var i = 0; i < lines.length; i++) {
    var dts = lines[i].querySelectorAll('dt');
    var dds = lines[i].querySelectorAll('dd');

    for (var j = 0; j < dts.length; j++) {
      var label = dts[j].textContent.trim();
      if (label.indexOf('沿線') !== -1 || label.indexOf('駅') !== -1) {
        var dd = dds[j];
        if (dd) {
          var text = dd.textContent.trim();
          var stationMatch = text.match(/「([^」]+)」|([^\s「」／]+)駅/);
          if (stationMatch) return stationMatch[1] || stationMatch[2];
        }
      }
    }
  }
  return null;
}

function extractPropertyData(unit) {
  var data = {
    price: null,
    area: null,
    age: null,
    station: null,
    ageRange: null,
    tsuboPrice: null
  };

  data.station = extractStationName(unit);

  var lines = unit.querySelectorAll('.dottable-line');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var dts = line.querySelectorAll('dt');
    var dds = line.querySelectorAll('dd');

    for (var j = 0; j < dts.length; j++) {
      var label = dts[j].textContent.trim();
      var dd = dds[j];
      if (!dd) continue;
      var value = dd.textContent.trim();

      if (label.indexOf('販売価格') !== -1 || label.indexOf('価格') !== -1) {
        data.price = parsePrice(value);
      }

      if (label.indexOf('専有面積') !== -1 || label.indexOf('面積') !== -1) {
        data.area = parseArea(value);
      }

      if (label.indexOf('築年月') !== -1 || label.indexOf('築年') !== -1) {
        var yearMatch = value.match(/(\d{4})年/);
        if (yearMatch) {
          data.age = NOW - parseInt(yearMatch[1]);
          data.ageRange = getAgeRange(data.age);
        }
      }
    }
  }

  if (data.price && data.area && data.area > 0) {
    data.tsuboPrice = Math.round(data.price / (data.area / TSUBO));
  }

  return data;
}

function appendComparison(unit, data, reasonablePrice, matchCount, avgTsuboPrice) {
  if (unit.querySelector('.suumo-price-checker')) return;

  var dottable = unit.querySelector('.dottable');
  if (!dottable) return;

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

  var newLine = document.createElement('div');
  newLine.className = 'dottable-line suumo-price-checker';
  newLine.innerHTML = '<dl>' +
    '<dd class="dottable-vm">' +
    '<span class="price-checker-result ' + diffClass + '">' +
    '<span class="price-checker-diff">' + diffText + '</span>' +
    '</span>' +
    '<div class="price-checker-details"><div class="price-checker-detail">' +
    '<strong>適正価格</strong><p>' + yen(reasonablePrice) + '</p></div>' +
    '<div class="price-checker-detail">' +
    '<strong>基準坪単価</strong><p>' + yen(avgTsuboPrice) + '</p></div>' +
    '<div class="price-checker-detail">' +
    '<strong>条件</strong><p>' + data.station + '駅・築' + data.ageRange + '年 ' + matchCount + '件' + '</p>' +
    '</div>' + '</div>' + '</dd>' + '</dl>';

  dottable.appendChild(newLine);
}

function appendNoData(unit, reason) {
  if (unit.querySelector('.suumo-price-checker')) return;
  var dottable = unit.querySelector('.dottable');
  if (!dottable) return;

  var newLine = document.createElement('div');
  newLine.className = 'dottable-line suumo-price-checker';
  newLine.innerHTML = '<dl>' +
    '<dt class="dottable-vm">適正価格比較</dt>' +
    '<dd class="dottable-vm">' +
    '<span class="price-checker-result nodata">' +
    '戸建非対応: ' + reason +
    '</span>' +
    '</dd>' +
    '</dl>';

  dottable.appendChild(newLine);
}

function processProperties() {
  var propType = detectPropertyType();
  if (!propType) return console.log('SUUMO: Unknown property type');

  if (propType === 'house') {
    var units = document.querySelectorAll('.property_unit');
    units.forEach(function (unit) {
      appendNoData(unit, '階数情報なし（マンションのみ対応）');
    });
    console.log('SUUMO: House pages - INCOMPATIBLE');
    return;
  }

  if (csvDataApartment.length === 0) {
    console.log('SUUMO: No apartment CSV data');
    return;
  }

  var units = document.querySelectorAll('.property_unit');
  console.log('SUUMO: Found', units.length, 'apartment units');

  var processed = 0;
  units.forEach(function (unit, index) {
    var data = extractPropertyData(unit);

    if (!data.price || !data.area) {
      return console.log('SUUMO Skip #' + (index + 1));
    }

    if (!data.station || !data.ageRange) {
      appendNoData(unit, data.station ? '築年不明' : '駅不明');
      return;
    }

    var matches = findMatchingProperties(data.station, data.ageRange, csvDataApartment);
    if (matches.length === 0) {
      appendNoData(unit, data.station + '駅・築' + data.ageRange + '年データなし');
      return;
    }

    var avgTsuboPrice = calculateAverageTsuboPrice(matches);
    var tsuboArea = data.area / TSUBO;
    var reasonablePrice = avgTsuboPrice * tsuboArea;

    appendComparison(unit, data, reasonablePrice, matches.length, avgTsuboPrice);
    processed++;
  });

  console.log('SUUMO: Processed', processed, '/', units.length, 'apartments');
}

function init() {
  checkEnabled(function (enabled, apartmentEnabled, houseEnabled) {
    if (!enabled || !apartmentEnabled) return;

    var propType = detectPropertyType();
    if (!propType) return;

    if (propType === 'house') {
      console.log('SUUMO: House pages disabled');
      return;
    }

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