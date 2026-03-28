// Service Worker - handles CSV fetching from GitHub with in-memory cache

var csvCache = {};

var GITHUB_BASE = 'https://raw.githubusercontent.com/smartfoloo/reprice-data/main';

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type !== 'loadCSV') return false;

  var prefecture = message.prefecture;
  var dataType = message.dataType; // 'cm' (apartment) or 'ci' (house)
  var cacheKey = dataType + '_' + prefecture;

  if (csvCache[cacheKey]) {
    sendResponse({ text: csvCache[cacheKey] });
    return false;
  }

  var url = GITHUB_BASE + '/' + dataType + '/' + prefecture + '.csv';

  fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
      return res.arrayBuffer();
    })
    .then(function (buffer) {
      // Try Shift-JIS first (Japanese government data), fall back to UTF-8
      var text;
      try {
        text = new TextDecoder('shift-jis').decode(buffer);
      } catch (e) {
        text = new TextDecoder('utf-8').decode(buffer);
      }
      csvCache[cacheKey] = text;
      sendResponse({ text: text });
    })
    .catch(function (err) {
      console.error('[Background] CSV fetch failed:', url, err.message);
      sendResponse({ error: err.message });
    });

  return true; // async response
});