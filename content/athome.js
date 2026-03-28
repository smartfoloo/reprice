var TSUBO = 3.305785;
var NOW = new Date().getFullYear();

var csvDataApartment = [];
var csvDataHouse = [];

var COL_APARTMENT = {
  TYPE: 0, LOCATION: 5, STATION: 6, WALK_TIME: 7, PRICE: 8, LAYOUT: 9, AREA: 10,
  BUILD_YEAR: 11, STRUCTURE: 12, TRADE_PERIOD: 18
};

var COL_HOUSE = {
  TYPE: 0, LOCATION: 6, STATION: 7, WALK_TIME: 8, PRICE: 9, LAYOUT: 11, AREA: 10,
  BUILD_YEAR: 14, STRUCTURE: 15, TRADE_PERIOD: 24
};

var rankedCitiesByDensity = [
  { rank: 1, prefecture: "埼玉県", city: "蕨市", population_density: 14835.81 },
  { rank: 2, prefecture: "東京都", city: "武蔵野市", population_density: 13723.41 },
  { rank: 3, prefecture: "東京都", city: "西東京市", population_density: 13228.76 },
  { rank: 4, prefecture: "東京都", city: "狛江市", population_density: 13093.27 },
  { rank: 5, prefecture: "大阪府", city: "大阪市", population_density: 12497.77 },
  { rank: 6, prefecture: "東京都", city: "三鷹市", population_density: 11966.02 },
  { rank: 7, prefecture: "東京都", city: "国分寺市", population_density: 11599.30 },
  { rank: 8, prefecture: "東京都", city: "調布市", population_density: 11393.65 },
  { rank: 9, prefecture: "東京都", city: "小金井市", population_density: 11367.96 },
  { rank: 10, prefecture: "大阪府", city: "守口市", population_density: 11024.55 },
  { rank: 11, prefecture: "大阪府", city: "吹田市", population_density: 10982.96 },
  { rank: 12, prefecture: "大阪府", city: "豊中市", population_density: 10941.52 },
  { rank: 13, prefecture: "神奈川県", city: "川崎市", population_density: 10902.06 },
  { rank: 14, prefecture: "千葉県", city: "浦安市", population_density: 10026.03 },
  { rank: 15, prefecture: "東京都", city: "小平市", population_density: 9792.74 },
  { rank: 16, prefecture: "埼玉県", city: "川口市", population_density: 9610.91 },
  { rank: 17, prefecture: "東京都", city: "国立市", population_density: 9452.52 },
  { rank: 18, prefecture: "大阪府", city: "門真市", population_density: 9299.92 },
  { rank: 19, prefecture: "埼玉県", city: "草加市", population_density: 9124.07 },
  { rank: 20, prefecture: "神奈川県", city: "大和市", population_density: 9037.36 },
  { rank: 21, prefecture: "大阪府", city: "寝屋川市", population_density: 9009.88 },
  { rank: 22, prefecture: "東京都", city: "府中市", population_density: 8995.07 },
  { rank: 23, prefecture: "兵庫県", city: "尼崎市", population_density: 8969.17 },
  { rank: 24, prefecture: "東京都", city: "東久留米市", population_density: 8902.10 },
  { rank: 25, prefecture: "東京都", city: "東村山市", population_density: 8890.14 },
  { rank: 26, prefecture: "千葉県", city: "市川市", population_density: 8749.20 },
  { rank: 27, prefecture: "神奈川県", city: "横浜市", population_density: 8607.96 },
  { rank: 28, prefecture: "千葉県", city: "習志野市", population_density: 8391.27 },
  { rank: 29, prefecture: "埼玉県", city: "志木市", population_density: 8299.89 },
  { rank: 30, prefecture: "千葉県", city: "松戸市", population_density: 8163.57 },
  { rank: 31, prefecture: "埼玉県", city: "朝霞市", population_density: 7882.01 },
  { rank: 32, prefecture: "大阪府", city: "東大阪市", population_density: 7859.32 },
  { rank: 33, prefecture: "埼玉県", city: "戸田市", population_density: 7842.22 },
  { rank: 34, prefecture: "兵庫県", city: "伊丹市", population_density: 7798.64 },
  { rank: 35, prefecture: "埼玉県", city: "ふじみ野市", population_density: 7750.75 },
  { rank: 36, prefecture: "福岡県", city: "春日市", population_density: 7733.57 },
  { rank: 37, prefecture: "埼玉県", city: "和光市", population_density: 7682.61 },
  { rank: 38, prefecture: "東京都", city: "立川市", population_density: 7655.46 },
  { rank: 39, prefecture: "千葉県", city: "船橋市", population_density: 7605.93 },
  { rank: 40, prefecture: "東京都", city: "清瀬市", population_density: 7526.49 },
  { rank: 41, prefecture: "神奈川県", city: "座間市", population_density: 7506.55 },
  { rank: 42, prefecture: "沖縄県", city: "那覇市", population_density: 7457.72 },
  { rank: 43, prefecture: "埼玉県", city: "新座市", population_density: 7293.63 },
  { rank: 44, prefecture: "京都府", city: "向日市", population_density: 7176.55 },
  { rank: 45, prefecture: "愛知県", city: "名古屋市", population_density: 7164.57 },
  { rank: 46, prefecture: "東京都", city: "日野市", population_density: 6990.38 },
  { rank: 47, prefecture: "東京都", city: "多摩市", population_density: 6983.34 },
  { rank: 48, prefecture: "大阪府", city: "藤井寺市", population_density: 6920.58 },
  { rank: 49, prefecture: "大阪府", city: "松原市", population_density: 6875.99 },
  { rank: 50, prefecture: "神奈川県", city: "茅ヶ崎市", population_density: 6863.70 },
  { rank: 51, prefecture: "東京都", city: "昭島市", population_density: 6706.17 },
  { rank: 52, prefecture: "神奈川県", city: "藤沢市", population_density: 6375.73 },
  { rank: 53, prefecture: "大阪府", city: "大東市", population_density: 6288.29 },
  { rank: 54, prefecture: "埼玉県", city: "さいたま市", population_density: 6237.12 },
  { rank: 55, prefecture: "東京都", city: "東大和市", population_density: 6221.76 },
  { rank: 56, prefecture: "兵庫県", city: "明石市", population_density: 6203.93 },
  { rank: 57, prefecture: "大阪府", city: "八尾市", population_density: 6163.11 },
  { rank: 58, prefecture: "千葉県", city: "流山市", population_density: 6088.45 },
  { rank: 59, prefecture: "東京都", city: "町田市", population_density: 6043.45 },
  { rank: 60, prefecture: "大阪府", city: "枚方市", population_density: 5972.68 },
  { rank: 61, prefecture: "沖縄県", city: "浦添市", population_density: 5947.58 },
  { rank: 62, prefecture: "大阪府", city: "摂津市", population_density: 5856.83 },
  { rank: 63, prefecture: "埼玉県", city: "富士見市", population_density: 5736.22 },
  { rank: 64, prefecture: "埼玉県", city: "越谷市", population_density: 5613.11 },
  { rank: 65, prefecture: "東京都", city: "福生市", population_density: 5530.12 },
  { rank: 66, prefecture: "東京都", city: "羽村市", population_density: 5406.06 },
  { rank: 67, prefecture: "大阪府", city: "堺市", population_density: 5363.67 },
  { rank: 68, prefecture: "神奈川県", city: "海老名市", population_density: 5319.71 },
  { rank: 69, prefecture: "東京都", city: "稲城市", population_density: 5315.53 },
  { rank: 70, prefecture: "埼玉県", city: "八潮市", population_density: 5258.66 },
  { rank: 71, prefecture: "千葉県", city: "鎌ケ谷市", population_density: 5221.96 },
  { rank: 72, prefecture: "沖縄県", city: "宜野湾市", population_density: 5058.48 },
  { rank: 73, prefecture: "大阪府", city: "泉大津市", population_density: 5055.83 },
  { rank: 74, prefecture: "埼玉県", city: "上尾市", population_density: 5018.79 },
  { rank: 75, prefecture: "兵庫県", city: "芦屋市", population_density: 4977.21 },
  { rank: 76, prefecture: "福岡県", city: "福岡市", population_density: 4863.99 },
  { rank: 77, prefecture: "兵庫県", city: "西宮市", population_density: 4814.75 },
  { rank: 78, prefecture: "大阪府", city: "大阪狭山市", population_density: 4794.88 },
  { rank: 79, prefecture: "大阪府", city: "高石市", population_density: 4751.15 },
  { rank: 80, prefecture: "埼玉県", city: "所沢市", population_density: 4725.59 },
  { rank: 81, prefecture: "大阪府", city: "池田市", population_density: 4702.62 },
  { rank: 82, prefecture: "埼玉県", city: "三郷市", population_density: 4689.31 },
  { rank: 83, prefecture: "愛知県", city: "北名古屋市", population_density: 4688.73 },
  { rank: 84, prefecture: "愛知県", city: "岩倉市", population_density: 4582.04 },
  { rank: 85, prefecture: "東京都", city: "武蔵村山市", population_density: 4521.87 },
  { rank: 86, prefecture: "愛知県", city: "知立市", population_density: 4455.55 },
  { rank: 87, prefecture: "石川県", city: "野々市市", population_density: 4318.58 },
  { rank: 88, prefecture: "神奈川県", city: "鎌倉市", population_density: 4274.58 },
  { rank: 89, prefecture: "京都府", city: "長岡京市", population_density: 4258.63 },
  { rank: 90, prefecture: "千葉県", city: "八千代市", population_density: 4008.46 },
  { rank: 91, prefecture: "大阪府", city: "羽曳野市", population_density: 3975.05 },
  { rank: 92, prefecture: "埼玉県", city: "鶴ヶ島市", population_density: 3959.26 },
  { rank: 93, prefecture: "愛知県", city: "尾張旭市", population_density: 3944.13 },
  { rank: 94, prefecture: "福岡県", city: "大野城市", population_density: 3876.61 },
  { rank: 95, prefecture: "愛知県", city: "清須市", population_density: 3851.01 },
  { rank: 96, prefecture: "千葉県", city: "柏市", population_density: 3817.67 },
  { rank: 97, prefecture: "神奈川県", city: "平塚市", population_density: 3800.43 },
  { rank: 98, prefecture: "大阪府", city: "茨木市", population_density: 3798.95 },
  { rank: 99, prefecture: "神奈川県", city: "綾瀬市", population_density: 3735.46 },
  { rank: 100, prefecture: "神奈川県", city: "横須賀市", population_density: 3641.02 }
];

function getCityDensity(cityName) {
  if (!cityName) return null;
  for (var i = 0; i < rankedCitiesByDensity.length; i++) {
    var entry = rankedCitiesByDensity[i];
    if (cityName.indexOf(entry.city) !== -1 || entry.city.indexOf(cityName) !== -1) {
      return entry.population_density;
    }
  }
  return null;
}

function extractCityFromAddress(address) {
  if (!address) return null;
  var match = address.match(/(.{2,6}[市区町村])/);
  return match ? match[1] : null;
}

function extractLocationFromAddress(address) {
  if (!address) return null;
  // Strip prefecture (ends with 都/道/府/県)
  var s = address.replace(/^.+?[都道府県]/, '');
  // Strip city/county (市 or 郡)
  s = s.replace(/^.{1,6}?[市郡]/, '');
  // Optionally strip a sub-ward (e.g. 神奈川区 in 横浜市神奈川区...)
  var subWard = s.match(/^.{1,5}区/);
  if (subWard) s = s.slice(subWard[0].length);
  s = s.trim();
  if (!s) return null;
  // Take everything before the first digit (half-width or full-width)
  var m = s.match(/^([^\d０-９]+)/);
  var loc = m ? m[1].trim() : s.trim();
  return loc.length >= 2 ? loc : null;
}

var TOKYO_23_WARDS = [
  '千代田区', '中央区', '港区', '新宿区', '文京区', '台東区', '墨田区', '江東区',
  '品川区', '目黒区', '大田区', '世田谷区', '渋谷区', '中野区', '杉並区', '豊島区',
  '北区', '荒川区', '板橋区', '練馬区', '足立区', '葛飾区', '江戸川区'
];

function isTokyoWard(address) {
  if (!address) return false;
  for (var i = 0; i < TOKYO_23_WARDS.length; i++) {
    if (address.indexOf(TOKYO_23_WARDS[i]) !== -1) return true;
  }
  return false;
}

function isRuralAddress(address) {
  if (isTokyoWard(address)) return false;
  var city = extractCityFromAddress(address);
  if (!city) return true;
  var density = getCityDensity(city);
  if (density === null) return true;
  return density < 5000;
}

function detectPropertyType() {
  var url = window.location.href;
  if (url.indexOf('/kodate/chuko/') !== -1) return 'house';
  if (url.indexOf('/mansion/chuko/') !== -1) return 'apartment';
  return null;
}

function checkEnabled(callback) {
  chrome.storage.sync.get({
    athomeEnabled: true, apartmentEnabled: true, houseEnabled: true
  }, function (data) {
    callback(data.athomeEnabled, data.apartmentEnabled, data.houseEnabled);
  });
}

function loadCSV(prefecture, callback) {
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
  return match ? parseInt(match[1]) : null;
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

function findMatchingByStation(stationName, ageRange, csvData, COL) {
  var normalizedTarget = normalizeStation(stationName);
  if (!normalizedTarget) return [];

  var matches = [];
  for (var i = 0; i < csvData.length; i++) {
    var row = csvData[i];
    if (normalizeStation(row[COL.STATION]) !== normalizedTarget) continue;

    var buildYear = parseBuildYear(row[COL.BUILD_YEAR]);
    if (!buildYear || getAgeRange(NOW - buildYear) !== ageRange) continue;

    var price = parseInt(row[COL.PRICE]);
    var area = parseFloat(row[COL.AREA]);
    if (!price || !area || area <= 0) continue;

    matches.push({ price: price, area: area, tsuboPrice: price / (area / TSUBO) });
  }
  return matches;
}

function findMatchingByLocation(locationName, ageRange, csvData, COL) {
  if (!locationName) return [];
  var matches = [];
  for (var i = 0; i < csvData.length; i++) {
    var row = csvData[i];
    var csvLocation = (row[COL.LOCATION] || '').trim();
    if (!csvLocation) continue;
    if (csvLocation.indexOf(locationName) === -1 && locationName.indexOf(csvLocation) === -1) continue;

    var buildYear = parseBuildYear(row[COL.BUILD_YEAR]);
    if (!buildYear || getAgeRange(NOW - buildYear) !== ageRange) continue;

    var price = parseInt(row[COL.PRICE]);
    var area = parseFloat(row[COL.AREA]);
    if (!price || !area || area <= 0) continue;

    matches.push({ price: price, area: area, tsuboPrice: price / (area / TSUBO) });
  }
  return matches;
}

function calculateAverageTsuboPrice(matches) {
  if (matches.length === 0) return null;
  var sum = 0;
  for (var i = 0; i < matches.length; i++) sum += matches[i].tsuboPrice;
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
  var floorFactor = Math.max(0.8, Math.min(1.5, 3 / (floors || 2)));
  var ageFactor = Math.max(0.3, 1 - (age || 0) / 100);
  return {
    adjustment: floorFactor * ageFactor,
    note: '階数' + (floors || 2) + 'F・土地/建物考慮'
  };
}

function extractPropertyData(card, propType) {
  var data = {
    price: null, landArea: null, buildingArea: null, exclusiveArea: null,
    floors: null, age: null, station: null, address: null, ageRange: null
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

    if (labelText === '所在地') data.address = valueText;

    if (labelText === '交通') {
      var stationMatch = valueText.match(/「([^」]+)」|([^\s「」／]+)駅/);
      if (stationMatch) data.station = stationMatch[1] || stationMatch[2];
    }
  }

  return data;
}

function appendComparison(card, data, reasonablePrice, matchCount, avgTsuboPrice, conditionLabel, adjustmentNote) {
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
    diffText = '→ 標準価格';
    diffClass = 'fair';
  }

  var newEl = document.createElement('div');
  newEl.className = 'athome-price-checker';
  newEl.style.marginTop = '10px';
  newEl.innerHTML = '<div class="price-checker-result ' + diffClass + '">' +
    '<span class="price-checker-diff">' + diffText + '</span>' +
    '</div>' +
    '<div class="price-checker-details">' +
    '<div class="price-checker-detail"><strong>標準価格</strong><p>' + yen(reasonablePrice) + '</p></div>' +
    '<div class="price-checker-detail"><strong>基準坪単価</strong><p>' + yen(avgTsuboPrice) + '</p></div>' +
    '<div class="price-checker-detail"><strong>条件</strong><p>' + conditionLabel + '・築' + data.ageRange + '年 ' + matchCount + '件</p></div>' +
    (adjustmentNote ? '<div class="price-checker-detail"><small>' + adjustmentNote + '</small></div>' : '') +
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
  newEl.innerHTML = '<div class="price-checker-result nodata">' + reason + '</div>';
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
    var hasArea = propType === 'house' ? (data.buildingArea || data.landArea) : data.exclusiveArea;
    if (!data.price || !hasArea) return;

    if (!data.ageRange) { appendNoData(card, '築年不明'); return; }

    var baseArea = propType === 'house' ? (data.buildingArea || data.landArea) : data.exclusiveArea;
    var rural = isRuralAddress(data.address);
    var matches, avgTsuboPrice, baseReasonable, finalReasonable, adjustmentNote;

    if (rural) {
      var locationName = extractLocationFromAddress(data.address);
      if (!locationName) { appendNoData(card, '地区名不明'); return; }
      matches = findMatchingByLocation(locationName, data.ageRange, csvData, COL);
      if (matches.length === 0) { appendNoData(card, locationName + '・築' + data.ageRange + '年データなし'); return; }
      avgTsuboPrice = calculateAverageTsuboPrice(matches);
      baseReasonable = avgTsuboPrice * (baseArea / TSUBO);
      finalReasonable = baseReasonable;
      adjustmentNote = '';
      if (propType === 'house') {
        var adj = calculateHouseAdjustment(data.floors, data.age, data.landArea, data.buildingArea);
        finalReasonable = Math.round(baseReasonable * adj.adjustment);
        adjustmentNote = adj.note;
      }
      appendComparison(card, data, finalReasonable, matches.length, avgTsuboPrice, locationName + '地区', adjustmentNote);
    } else {
      if (!data.station) { appendNoData(card, '駅不明'); return; }
      matches = findMatchingByStation(data.station, data.ageRange, csvData, COL);
      if (matches.length === 0) { appendNoData(card, data.station + '駅・築' + data.ageRange + '年データなし'); return; }
      avgTsuboPrice = calculateAverageTsuboPrice(matches);
      baseReasonable = avgTsuboPrice * (baseArea / TSUBO);
      finalReasonable = baseReasonable;
      adjustmentNote = '';
      if (propType === 'house') {
        var adj = calculateHouseAdjustment(data.floors, data.age, data.landArea, data.buildingArea);
        finalReasonable = Math.round(baseReasonable * adj.adjustment);
        adjustmentNote = adj.note;
      }
      appendComparison(card, data, finalReasonable, matches.length, avgTsuboPrice, data.station + '駅', adjustmentNote);
    }

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

    var prefecture = (typeof detectPrefecture === 'function') ? detectPrefecture() : 'tokyo';

    loadCSV(prefecture, function () {
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