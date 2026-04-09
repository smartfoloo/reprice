var TSUBO = 3.305785;
var NOW = new Date().getFullYear();

var csvDataApartment = [];
var csvDataHouse = [];

var COL_HOUSE = {
  TYPE: 0, LOCATION: 6, STATION: 7, WALK_TIME: 8, PRICE: 9, LAYOUT: 11, LAND_AREA: 10,
  BUILD_YEAR: 14, STRUCTURE: 15, PURPOSE: 16, TRADE_PERIOD: 24
};

var COL_APARTMENT = {
  TYPE: 0, LOCATION: 5, STATION: 6, WALK_TIME: 7, PRICE: 8, LAYOUT: 9, AREA: 10,
  BUILD_YEAR: 11, STRUCTURE: 12, TRADE_PERIOD: 18
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
  { rank: 100, prefecture: "神奈川県", city: "横須賀市", population_density: 3641.02 },
  { rank: 101, prefecture: "北海道", city: "札幌市", population_density: 1741 },
  { rank: 102, prefecture: "宮城県", city: "仙台市", population_density: 1380 },
  { rank: 103, prefecture: "広島県", city: "広島市", population_density: 1330 },
  { rank: 104, prefecture: "静岡県", city: "静岡市", population_density: 240 },
  { rank: 105, prefecture: "新潟県", city: "新潟市", population_density: 520 },
  { rank: 106, prefecture: "熊本県", city: "熊本市", population_density: 1955 },
  { rank: 107, prefecture: "岡山県", city: "岡山市", population_density: 876 },
  { rank: 108, prefecture: "浜松市", city: "浜松市", population_density: 511 }
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
  var s = address.replace(/^.+?[都道府県]/, '');
  s = s.replace(/^.{1,6}?[市郡]/, '');
  var subWard = s.match(/^.{1,5}区/);
  if (subWard) s = s.slice(subWard[0].length);
  s = s.trim();
  if (!s) return null;
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
  if (url.indexOf('bs=021') !== -1) return 'house';
  if (url.indexOf('bs=011') !== -1) return 'apartment';
  if (url.indexOf('/chukoikkodate/') !== -1) return 'house';
  if (url.indexOf('/ms/chuko/') !== -1) return 'apartment';
  return null;
}

function checkEnabled(callback) {
  chrome.storage.sync.get({
    suumoEnabled: true, apartmentEnabled: true, houseEnabled: true
  }, function (data) {
    callback(data.suumoEnabled, data.apartmentEnabled, data.houseEnabled);
  });
}

function loadCSV(prefecture, callback) {
  console.log('[SUUMO] Detected prefecture:', prefecture);
  if (typeof loadPrefectureCSV === 'undefined') {
    console.log('[SUUMO] CSV loader not found');
    callback();
    return;
  }
  chrome.storage.sync.get({ apartmentEnabled: true, houseEnabled: true }, function (settings) {
    var pending = 0;
    if (settings.apartmentEnabled) {
      pending++;
      loadPrefectureCSV(prefecture, COL_APARTMENT, 'apartment', function (d) {
        csvDataApartment = d;
        console.log('[SUUMO] Apartment CSV:', csvDataApartment.length);
        if (--pending === 0) callback();
      });
    }
    if (settings.houseEnabled) {
      pending++;
      loadPrefectureCSV(prefecture, COL_HOUSE, 'house', function (d) {
        csvDataHouse = d;
        console.log('[SUUMO] House CSV:', csvDataHouse.length);
        if (--pending === 0) callback();
      });
    }
    if (pending === 0) callback();
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

function removeOutliers(matches) {
  if (matches.length < 4) return matches;
  var prices = matches.map(function (m) { return m.tsuboPrice; }).sort(function (a, b) { return a - b; });
  var q1 = prices[Math.floor(prices.length * 0.25)];
  var q3 = prices[Math.floor(prices.length * 0.75)];
  var iqr = q3 - q1;
  var lower = q1 - 1.5 * iqr;
  var upper = q3 + 1.5 * iqr;
  return matches.filter(function (m) { return m.tsuboPrice >= lower && m.tsuboPrice <= upper; });
}

function findMatchingByStation(stationName, ageRange, csvData, COL) {
  var normalizedTarget = normalizeStation(stationName);
  if (!normalizedTarget) return [];
  var areaIdx = COL.LAND_AREA !== undefined ? COL.LAND_AREA : COL.AREA;
  var matches = [];
  for (var i = 0; i < csvData.length; i++) {
    var row = csvData[i];
    if (normalizeStation(row[COL.STATION]) !== normalizedTarget) continue;
    if (COL.PURPOSE !== undefined && (row[COL.PURPOSE] || '').indexOf('住宅') === -1) continue;
    var buildYear = parseBuildYear(row[COL.BUILD_YEAR]);
    if (!buildYear || getAgeRange(NOW - buildYear) !== ageRange) continue;
    var price = parseInt(row[COL.PRICE]);
    var area = parseFloat(row[areaIdx]);
    if (!price || !area || area <= 0) continue;
    matches.push({ price: price, area: area, tsuboPrice: price / (area / TSUBO) });
  }
  return matches;
}

function findMatchingByLocation(locationName, ageRange, csvData, COL) {
  if (!locationName) return [];
  var areaIdx = COL.LAND_AREA !== undefined ? COL.LAND_AREA : COL.AREA;
  var matches = [];
  for (var i = 0; i < csvData.length; i++) {
    var row = csvData[i];
    var csvLocation = (row[COL.LOCATION] || '').trim();
    if (!csvLocation) continue;
    if (csvLocation.indexOf(locationName) === -1 && locationName.indexOf(csvLocation) === -1) continue;
    if (COL.PURPOSE !== undefined && (row[COL.PURPOSE] || '').indexOf('住宅') === -1) continue;
    var buildYear = parseBuildYear(row[COL.BUILD_YEAR]);
    if (!buildYear || getAgeRange(NOW - buildYear) !== ageRange) continue;
    var price = parseInt(row[COL.PRICE]);
    var area = parseFloat(row[areaIdx]);
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
  text = text.replace(/[,\s]/g, '');
  var okuMatch = text.match(/(\d+)億/);
  var manMatch = text.match(/(\d+)万/);
  var oku = okuMatch ? parseInt(okuMatch[1]) * 10000 : 0;
  var man = manMatch ? parseInt(manMatch[1]) : 0;
  if (oku === 0 && man === 0) return null;
  return (oku + man) * 10000;
}

function parseArea(text) {
  if (!text) return null;
  var match = text.match(/([\d.]+)\s*m/);
  return match ? parseFloat(match[1]) : null;
}


function extractDottableData(unit) {
  var result = {};
  var dts = unit.querySelectorAll('dt');
  dts.forEach(function (dt) {
    var label = dt.textContent.trim();
    var dd = dt.nextElementSibling;
    if (dd && dd.tagName === 'DD') {
      result[label] = dd.textContent.trim();
    }
  });
  return result;
}

function extractPropertyData(unit) {
  var data = {
    price: null,
    exclusiveArea: null,
    landArea: null,
    buildingArea: null,
    age: null,
    ageRange: null,
    station: null,
    address: null
  };

  var lv = extractDottableData(unit);

  var priceSpan = unit.querySelector('.dottable-value');
  if (priceSpan) {
    data.price = parsePrice(priceSpan.textContent);
  } else {
    data.price = parsePrice(lv['販売価格'] || lv['価格'] || '');
  }

  if (lv['専有面積']) data.exclusiveArea = parseArea(lv['専有面積']);
  if (lv['土地面積']) data.landArea = parseArea(lv['土地面積']);
  if (lv['建物面積']) data.buildingArea = parseArea(lv['建物面積']);

  var buildText = lv['築年月'] || lv['築年'] || '';
  if (buildText) {
    var yearMatch = buildText.match(/(\d{4})年/);
    if (yearMatch) {
      data.age = NOW - parseInt(yearMatch[1]);
      data.ageRange = getAgeRange(data.age);
    }
  }

  data.address = lv['所在地'] || null;

  var trafficText = lv['沿線・駅'] || lv['交通'] || lv['アクセス'] || '';
  if (trafficText) {
    var sm = trafficText.match(/「([^」]+)」/) || trafficText.match(/([^\s「」／\n]{1,10})駅/);
    if (sm) data.station = normalizeStation(sm[1]);
  }

  return data;
}


function appendComparison(unit, data, reasonablePrice, matchCount, avgTsuboPrice, conditionLabel) {
  if (unit.querySelector('.suumo-price-checker')) return;
  var dottable = unit.querySelector('.dottable');
  if (!dottable) return;
  var loadingEl = dottable.querySelector('.reprice-loading');
  if (loadingEl) loadingEl.remove();

  var diff = data.price - reasonablePrice;
  var diffSign = diff >= 0 ? '+' : '-';
  var diffColor = diff > 0 ? '#f23c56' : '#06c';

  var newLine = document.createElement('div');
  newLine.className = 'dottable-line suumo-price-checker';
  newLine.innerHTML =
    '<dl><dd class="dottable-vm">' +
    '<div class="price-checker-details">' +
    '<div class="price-checker-detail"><strong>相場価格との差額</strong></div>' +
    '<p class="price-checker-result" style="color:' + diffColor + ';">' + diffSign + yen(Math.abs(diff)) + '</p>' +
    '<div class="price-checker-detail"><strong>参考相場価格</strong><p>' + yen(reasonablePrice) + '</p></div>' +
    '<div class="price-checker-detail"><strong>相場坪単価</strong><p>' + yen(avgTsuboPrice) + '</p></div>' +
    '<div class="price-checker-detail"><strong>条件</strong><p>' + conditionLabel + '・築' + data.ageRange + '年 ' + matchCount + '件</p></div>' +
    '</div></dd></dl>';
  dottable.appendChild(newLine);
}

function appendLoading(unit) {
  var dottable = unit.querySelector('.dottable');
  if (!dottable || dottable.querySelector('.reprice-loading, .suumo-price-checker')) return;
  var el = document.createElement('div');
  el.className = 'dottable-line reprice-loading';
  el.innerHTML = '<dl><dd class="dottable-vm">相場取得中...</dd></dl>';
  dottable.appendChild(el);
}

function appendNoData(unit, reason) {
  if (unit.querySelector('.suumo-price-checker')) return;
  var dottable = unit.querySelector('.dottable');
  if (!dottable) return;
  var loadingEl = dottable.querySelector('.reprice-loading');
  if (loadingEl) loadingEl.remove();
  var newLine = document.createElement('div');
  newLine.className = 'dottable-line suumo-price-checker';
  newLine.innerHTML =
    '<dl><dd class="dottable-vm">' +
    '<span class="price-checker-result nodata">' + reason + '</span>' +
    '</dd></dl>';
  dottable.appendChild(newLine);
}


function processUnit(unit, propType, csvData, COL) {
  if (unit.querySelector('.suumo-price-checker')) return false;

  var data = extractPropertyData(unit);

  var baseArea;
  if (propType === 'house') {
    baseArea = data.landArea || data.buildingArea;
  } else {
    baseArea = data.exclusiveArea;
  }

  if (!data.price) { appendNoData(unit, '価格取得不可'); return true; }
  if (!baseArea) { appendNoData(unit, '面積取得不可'); return true; }
  if (!data.ageRange) { appendNoData(unit, '築年不明'); return true; }

  var matches, avgTsuboPrice, reasonablePrice;

  if (isRuralAddress(data.address)) {
    var locationName = extractLocationFromAddress(data.address);
    if (!locationName) { appendNoData(unit, '地区名不明'); return true; }
    matches = findMatchingByLocation(locationName, data.ageRange, csvData, COL);
    if (propType === 'house') matches = removeOutliers(matches);
    if (matches.length === 0) { appendNoData(unit, locationName + '・築' + data.ageRange + '年データなし'); return true; }
    avgTsuboPrice = calculateAverageTsuboPrice(matches);
    reasonablePrice = Math.round(avgTsuboPrice * (baseArea / TSUBO));
    appendComparison(unit, data, reasonablePrice, matches.length, avgTsuboPrice, locationName + '地区');
  } else {
    if (!data.station) { appendNoData(unit, '駅不明'); return true; }
    matches = findMatchingByStation(data.station, data.ageRange, csvData, COL);
    if (propType === 'house') matches = removeOutliers(matches);
    if (matches.length === 0) { appendNoData(unit, data.station + '駅・築' + data.ageRange + '年データなし'); return true; }
    avgTsuboPrice = calculateAverageTsuboPrice(matches);
    reasonablePrice = Math.round(avgTsuboPrice * (baseArea / TSUBO));
    appendComparison(unit, data, reasonablePrice, matches.length, avgTsuboPrice, data.station + '駅');
  }

  return true;
}

function processProperties() {
  var propType = detectPropertyType();
  if (!propType) return console.log('[SUUMO] Unknown property type');

  var csvData = propType === 'house' ? csvDataHouse : csvDataApartment;
  var COL = propType === 'house' ? COL_HOUSE : COL_APARTMENT;

  if (csvData.length === 0) return console.log('[SUUMO] No CSV data for', propType);

  var units = document.querySelectorAll('.property_unit');
  console.log('[SUUMO] Found', units.length, propType, 'units');

  var processed = 0;
  units.forEach(function (unit) {
    if (processUnit(unit, propType, csvData, COL)) processed++;
  });

  console.log('[SUUMO] Processed', processed, '/', units.length);
}


function init() {
  checkEnabled(function (enabled, apartmentEnabled, houseEnabled) {
    if (!enabled) return;
    var propType = detectPropertyType();
    if (!propType) return;
    if (propType === 'apartment' && !apartmentEnabled) return;
    if (propType === 'house' && !houseEnabled) return;

    var units = document.querySelectorAll('.property_unit');
    units.forEach(appendLoading);

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