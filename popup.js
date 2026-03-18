document.addEventListener('DOMContentLoaded', function () {
  var suumoToggle = document.getElementById('suumoToggle');
  var yahooToggle = document.getElementById('yahooToggle');

  chrome.storage.sync.get({
    suumoEnabled: true,
    yahooEnabled: true
  }, function (data) {
    suumoToggle.checked = data.suumoEnabled;
    yahooToggle.checked = data.yahooEnabled;
  });

  suumoToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ suumoEnabled: suumoToggle.checked });
  });

  yahooToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ yahooEnabled: yahooToggle.checked });
  });
});