var TSUBO = 3.305785;
var NOW = new Date().getFullYear();

var csvDataApartment = [];
var csvDataHouse = [];

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

var COL = {
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

function loadCSV(callback) {
  var prefecture = detectPrefecture();
  console.log('[SUUMO] Detected prefecture:', prefecture);

  var apartmentLoaded = false;
  var houseLoaded = false;

  chrome.storage.sync.get({
    apartmentEnabled: true,
    houseEnabled: true
  }, function (data) {
    var pendingLoads = 0;

    if (data.apartmentEnabled) {
      pendingLoads++;
      loadPrefectureCSV(prefecture, COL, 'apartment', function (data) {
        csvDataApartment = data;
        console.log('[SUUMO] Apartment CSV loaded:', csvDataApartment.length, 'records');
        apartmentLoaded = true;
        pendingLoads--;
        if (pendingLoads === 0) callback();
      });
    }

    if (data.houseEnabled) {
      pendingLoads++;
      loadPrefectureCSV(prefecture, COL, 'house', function (data) {
        csvDataHouse = data;
        console.log('[SUUMO] House CSV loaded:', csvDataHouse.length, 'records');
        houseLoaded = true;
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

  if (text.indexOf('令和') !== -1) return 2018 + parseInt(text.replace(/[^0-9]/g, ''));
  if (text.indexOf('平成') !== -1) return 1988 + parseInt(text.replace(/[^0-9]/g, ''));
  if (text.indexOf('昭和') !== -1) return 1925 + parseInt(text.replace(/[^0-9]/g, ''));

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
  return name
    .replace(/\(.*?\)/g, '')
    .replace(/（.*?）/g, '')
    .replace(/駅$/, '')
    .trim();
}

function findMatchingProperties(stationName, ageRange, csvData) {
  var normalizedTarget = normalizeStation(stationName);
  var matches = [];

  for (var i = 0; i < csvData.length; i++) {
    var row = csvData[i];
    var csvStation = normalizeStation(row[COL.STATION]);

    if (csvStation !== normalizedTarget) {
      continue;
    }

    var walkTime = row[COL.WALK_TIME];
    if (!walkTime || walkTime === '' || isNaN(parseInt(walkTime))) {
      continue;
    }

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

    matches.push({
      price: price,
      area: area,
      tsuboPrice: tsuboPrice,
      buildYear: buildYear,
      station: row[COL.STATION],
      walkTime: parseInt(walkTime)
    });
  }

  return matches;
}

function calculateAverageTsuboPrice(matches) {
  if (matches.length === 0) return null;

  var sum = 0;
  for (var i = 0; i < matches.length; i++) {
    sum += matches[i].tsuboPrice;
  }
  return sum / matches.length;
}

function yen(n) {
  if (n >= 1e8) {
    var o = Math.floor(n / 1e8);
    var m = Math.round((n % 1e8) / 1e4);
    return m > 0 ? o + '億' + m.toLocaleString() + '万円' : o + '億円';
  }
  return n >= 1e4 ? Math.round(n / 1e4).toLocaleString() + '万円' : n.toLocaleString() + '円';
}

function parsePrice(text) {
  if (!text) return null;
  var oku = 0;
  var man = 0;

  var okuMatch = text.match(/(\d+)億/);
  if (okuMatch) oku = parseInt(okuMatch[1]) * 10000;

  var manMatch = text.match(/(\d+)万/);
  if (manMatch) man = parseInt(manMatch[1]);

  if (oku === 0 && man === 0) {
    var numMatch = text.replace(/[^0-9]/g, '');
    return numMatch ? parseInt(numMatch) * 10000 : null;
  }

  return (oku + man) * 10000;
}

function parseArea(text) {
  if (!text) return null;
  var match = text.match(/([\d.]+)\s*m/);
  return match ? parseFloat(match[1]) : null;
}

function parseYear(text) {
  if (!text) return null;

  var match = text.match(/(\d{4})年/);
  if (match) return parseInt(match[0]);

  if (text.indexOf('令和') !== -1) return 2018 + parseInt(text.replace(/[^0-9]/g, ''));
  if (text.indexOf('平成') !== -1) return 1988 + parseInt(text.replace(/[^0-9]/g, ''));
  if (text.indexOf('昭和') !== -1) return 1925 + parseInt(text.replace(/[^0-9]/g, ''));

  return null;
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
          var stationMatch = text.match(/「([^」]+)」/);
          if (stationMatch) return stationMatch[1];

          var altMatch = text.match(/([^\s「」／]+)駅/);
          if (altMatch) return altMatch[1];
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
    year: null,
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
        data.year = parseYear(value);
        if (data.year) {
          data.age = NOW - data.year;
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
  var diffPercent = (diff / reasonablePrice) * 100;
  var diffText = '';
  var diffClass = '';

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
    '<dt class="dottable-vm">適正価格比較</dt>' +
    '<dd class="dottable-vm">' +
    '<span class="price-checker-result ' + diffClass + '">' +
    '<span class="price-checker-diff">' + diffText + '</span>' +
    '</span>' +
    '<span class="price-checker-detail">' +
    '適正: ' + yen(reasonablePrice) + ' / 坪単価: ' + yen(avgTsuboPrice) + '/坪' +
    '（' + data.station + '駅・築' + data.ageRange + '年 ' + matchCount + '件）' +
    '</span>' +
    '</dd>' +
    '</dl>';

  dottable.appendChild(newLine);
}

function appendNoData(unit, data, reason) {
  if (unit.querySelector('.suumo-price-checker')) return;

  var dottable = unit.querySelector('.dottable');
  if (!dottable) return;

  var newLine = document.createElement('div');
  newLine.className = 'dottable-line suumo-price-checker';
  newLine.innerHTML = '<dl>' +
    '<dt class="dottable-vm">適正価格比較</dt>' +
    '<dd class="dottable-vm">' +
    '<span class="price-checker-result nodata">' +
    '<span class="price-checker-label">データなし</span>' +
    '<span class="price-checker-diff">' + reason + '</span>' +
    '</span>' +
    '</dd>' +
    '</dl>';

  dottable.appendChild(newLine);
}

function processProperties() {
  var propType = detectPropertyType();
  if (!propType) {
    console.log('SUUMO Price Checker: Could not detect property type');
    return;
  }

  var csvData = propType === 'house' ? csvDataHouse : csvDataApartment;

  if (csvData.length === 0) {
    console.log('SUUMO Price Checker: CSVデータがありません');
    return;
  }

  var units = document.querySelectorAll('.property_unit');
  var processed = 0;

  console.log('SUUMO Price Checker: Found', units.length, 'property units');

  units.forEach(function (unit, index) {
    var data = extractPropertyData(unit);

    if (!data.price || !data.area) {
      console.log('Skipping property #' + (index + 1) + ': missing price or area');
      return;
    }

    if (!data.station) {
      appendNoData(unit, data, '駅名を取得できません');
      return;
    }

    if (!data.ageRange) {
      appendNoData(unit, data, '築年数を取得できません');
      return;
    }

    var matches = findMatchingProperties(data.station, data.ageRange, csvData);

    if (matches.length === 0) {
      appendNoData(unit, data, data.station + '駅・築' + data.ageRange + '年の取引データなし');
      return;
    }

    var avgTsuboPrice = calculateAverageTsuboPrice(matches);

    var tsuboArea = data.area / TSUBO;
    var reasonablePrice = avgTsuboPrice * tsuboArea;

    appendComparison(unit, data, reasonablePrice, matches.length, avgTsuboPrice);
    processed++;
  });

  console.log('SUUMO Price Checker: ' + processed + '/' + units.length + '件の物件を処理しました');
}

function init() {
  checkEnabled(function (enabled, apartmentEnabled, houseEnabled) {
    if (!enabled) {
      console.log('SUUMO Price Checker: 無効化されています');
      return;
    }

    var propType = detectPropertyType();
    if (!propType) {
      console.log('SUUMO Price Checker: Could not detect property type from URL');
      return;
    }

    var isApartment = propType === 'apartment';
    if (isApartment && !apartmentEnabled) {
      console.log('SUUMO Price Checker: 中古マンションが無効化されています');
      return;
    }

    if (!isApartment && !houseEnabled) {
      console.log('SUUMO Price Checker: 中古一戸建てが無効化されています');
      return;
    }

    loadCSV(function () {
      processProperties();

      var observer = new MutationObserver(function (mutations) {
        var hasNewUnits = mutations.some(function (m) {
          return m.addedNodes.length > 0;
        });
        if (hasNewUnits) {
          setTimeout(processProperties, 500);
        }
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
