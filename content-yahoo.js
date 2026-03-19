var TSUBO = 3.305785;
var NOW = new Date().getFullYear();

var csvData = [];

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

function checkEnabled(callback) {
  chrome.storage.sync.get({ yahooEnabled: true }, function (data) {
    callback(data.yahooEnabled);
  });
}

function loadCSV(callback) {
  var prefecture = detectPrefecture();
  console.log('[Yahoo] Detected prefecture:', prefecture);

  loadPrefectureCSV(prefecture, COL, function (data) {
    csvData = data;
    console.log('[Yahoo] CSV loaded:', csvData.length, 'records');
    callback();
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

function findMatchingProperties(stationName, ageRange) {
  var normalizedTarget = normalizeStation(stationName);
  var matches = [];

  for (var i = 0; i < csvData.length; i++) {
    var row = csvData[i];
    var csvStation = normalizeStation(row[COL.STATION]);

    if (csvStation !== normalizedTarget) continue;

    var walkTime = row[COL.WALK_TIME];
    if (!walkTime || walkTime === '' || isNaN(parseInt(walkTime))) continue;

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
  text = text.replace(/,/g, '');
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

function parseAge(text) {
  if (!text) return null;

  var ageMatch = text.match(/築(\d+)年/);
  if (ageMatch) return parseInt(ageMatch[1]);

  var yearMatch = text.match(/(\d{4})年/);
  if (yearMatch) {
    return NOW - parseInt(yearMatch[1]);
  }

  return null;
}

function extractStationName(text) {
  if (!text) return null;
  var match = text.match(/「([^」]+)」/);
  if (match) return match[1];

  var altMatch = text.match(/([^\s「」]+)駅/);
  if (altMatch) return altMatch[1];

  return null;
}

function extractPropertyData(item) {
  var data = {
    price: null,
    area: null,
    age: null,
    station: null,
    ageRange: null,
    tsuboPrice: null
  };

  var priceEl = item.querySelector('.ListCassette2__info__price');
  if (priceEl) {
    data.price = parsePrice(priceEl.textContent);
  }

  var infoItems = item.querySelectorAll('.ListCassette2__info__dtl');
  for (var i = 0; i < infoItems.length; i++) {
    var text = infoItems[i].textContent.trim();

    if (text.indexOf('駅') !== -1 && text.indexOf('徒歩') !== -1) {
      data.station = extractStationName(text);
    }

    if (text.indexOf('築') !== -1) {
      data.age = parseAge(text);
      if (data.age !== null) {
        data.ageRange = getAgeRange(data.age);
      }
    }
  }

  var roomTitle = item.querySelector('.ListCassette2__ttl__txt--inner');
  if (roomTitle) {
    var roomText = roomTitle.textContent;
    data.area = parseArea(roomText);
  }

  if (data.price && data.area && data.area > 0) {
    data.tsuboPrice = Math.round(data.price / (data.area / TSUBO));
  }

  return data;
}

function appendComparison(item, data, reasonablePrice, matchCount, avgTsuboPrice) {
  if (item.querySelector('.yahoo-price-checker')) return;

  var infoList = item.querySelector('.ListCassette2__info');
  if (!infoList) return;

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

  var newEl = document.createElement('li');
  newEl.className = 'ListCassette2__info__dtl yahoo-price-checker';
  newEl.innerHTML = '<span class="price-checker-result ' + diffClass + '">' +
    '<span class="price-checker-diff">' + diffText + '</span>' +
    '</span> ' +
    '<span class="price-checker-detail">' +
    '適正: ' + yen(reasonablePrice) + ' / 坪単価: ' + yen(avgTsuboPrice) + '/坪' +
    '（' + data.station + '駅・築' + data.ageRange + '年 ' + matchCount + '件）' +
    '</span>';

  infoList.appendChild(newEl);
}

function appendNoData(item, reason) {
  if (item.querySelector('.yahoo-price-checker')) return;

  var infoList = item.querySelector('.ListCassette2__info');
  if (!infoList) return;

  var newEl = document.createElement('li');
  newEl.className = 'ListCassette2__info__dtl yahoo-price-checker';
  newEl.innerHTML = '<span class="price-checker-result nodata">' +
    '<span class="price-checker-label">データなし: </span>' +
    '<span class="price-checker-diff">' + reason + '</span>' +
    '</span>';

  infoList.appendChild(newEl);
}

function processProperties() {
  if (csvData.length === 0) {
    console.log('Yahoo Price Checker: CSVデータがありません');
    return;
  }

  var items = document.querySelectorAll('.ListBukken2__list__item');
  var processed = 0;

  console.log('[v0] Yahoo Price Checker: Found', items.length, 'property items');

  items.forEach(function (item, index) {
    var data = extractPropertyData(item);

    console.log('[v0] Yahoo Property #' + (index + 1) + ':', {
      station: data.station,
      price: data.price,
      area: data.area,
      age: data.age,
      ageRange: data.ageRange,
      tsuboPrice: data.tsuboPrice
    });

    if (!data.price || !data.area) {
      console.log('[v0] Skipping property #' + (index + 1) + ': missing price or area');
      return;
    }

    if (!data.station) {
      appendNoData(item, '駅名を取得できません');
      return;
    }

    if (!data.ageRange) {
      appendNoData(item, '築年数を取得できません');
      return;
    }

    var matches = findMatchingProperties(data.station, data.ageRange);

    console.log('[v0] === ' + data.station + '駅 築' + data.ageRange + '年 マッチング結果 ===');
    console.log('[v0] マッチ件数: ' + matches.length + '件');
    if (matches.length > 0) {
      matches.forEach(function (m, idx) {
        console.log('[v0]   #' + (idx + 1) + ': ' + m.station + ' 築' + m.buildYear + '年 ' +
          (m.area).toFixed(1) + '㎡ ' + yen(m.price) + ' (坪単価: ' + yen(m.tsuboPrice) + ', 徒歩' + m.walkTime + '分)');
      });
    }

    if (matches.length === 0) {
      appendNoData(item, data.station + '駅・築' + data.ageRange + '年の取引データなし');
      return;
    }

    var avgTsuboPrice = calculateAverageTsuboPrice(matches);
    console.log('[v0] 平均坪単価: ' + yen(avgTsuboPrice));

    var tsuboArea = data.area / TSUBO;
    var reasonablePrice = avgTsuboPrice * tsuboArea;

    appendComparison(item, data, reasonablePrice, matches.length, avgTsuboPrice);
    processed++;
  });

  console.log('Yahoo Price Checker: ' + processed + '/' + items.length + '件の物件を処理しました');
}

function init() {
  checkEnabled(function (enabled) {
    if (!enabled) {
      console.log('Yahoo Price Checker: 無効化されています');
      return;
    }

    loadCSV(function () {
      processProperties();

      var observer = new MutationObserver(function (mutations) {
        var hasNewItems = mutations.some(function (m) {
          return m.addedNodes.length > 0;
        });
        if (hasNewItems) {
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