document.addEventListener('DOMContentLoaded', function () {
  var suumoToggle = document.getElementById('suumoToggle');
  var athomeToggle = document.getElementById('athomeToggle');
  var yahooToggle = document.getElementById('yahooToggle');

  chrome.storage.sync.get({
    suumoEnabled: true,
    athomeEnabled: true,
    yahooEnabled: true
  }, function (data) {
    suumoToggle.checked = data.suumoEnabled;
    athomeToggle.checked = data.athomeEnabled;
    yahooToggle.checked = data.yahooEnabled;
  });

  suumoToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ suumoEnabled: suumoToggle.checked });
  });

  athomeToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ athomeEnabled: athomeToggle.checked });
  });

  yahooToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ yahooEnabled: yahooToggle.checked });
  });
});