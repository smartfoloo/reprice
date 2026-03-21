/*
import { sendGAEvent } from "./ga4.js";

document.addEventListener('DOMContentLoaded', async function () {
  await sendGAEvent("popup_opened", {
    page: "popup",
  });

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

  suumoToggle.addEventListener("change", async function () {
    chrome.storage.sync.set({ suumoEnabled: suumoToggle.checked });
    await sendGAEvent("suumo_toggle", {
      trigger: "suumo_toggle",
      enabled: suumoToggle.checked,
    });
  });

  athomeToggle.addEventListener("change", async function () {
    chrome.storage.sync.set({ athomeEnabled: athomeToggle.checked });
    await sendGAEvent("athome_toggle", {
      trigger: "athome_toggle",
      enabled: athomeToggle.checked,
    });
  });

  yahooToggle.addEventListener("change", async function () {
    chrome.storage.sync.set({ yahooEnabled: yahooToggle.checked });
    await sendGAEvent("yahoo_toggle", {
      trigger: "yahoo_toggle",
      enabled: yahooToggle.checked,
    });
  });

});
*/

document.addEventListener('DOMContentLoaded', function () {
  var apartmentToggle = document.getElementById('apartmentToggle');
  var houseToggle = document.getElementById('houseToggle');
  var suumoToggle = document.getElementById('suumoToggle');
  var yahooToggle = document.getElementById('yahooToggle');
  var athomeToggle = document.getElementById('athomeToggle');

  chrome.storage.sync.get({
    apartmentEnabled: true,
    houseEnabled: true,
    suumoEnabled: true,
    yahooEnabled: true,
    athomeEnabled: true
  }, function (data) {
    apartmentToggle.checked = data.apartmentEnabled;
    houseToggle.checked = data.houseEnabled;
    suumoToggle.checked = data.suumoEnabled;
    yahooToggle.checked = data.yahooEnabled;
    athomeToggle.checked = data.athomeEnabled;
  });

  apartmentToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ apartmentEnabled: apartmentToggle.checked });
  });

  houseToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ houseEnabled: houseToggle.checked });
  });

  suumoToggle.addEventListener('change', async function () {
    await sendGAEvent("suumo_toggle", {
      trigger: "suumo_toggle",
      enabled: suumoToggle.checked,
    });
    chrome.storage.sync.set({ suumoEnabled: suumoToggle.checked });
  });

  yahooToggle.addEventListener('change', async function () {
    await sendGAEvent("yahoo_toggle", {
      trigger: "yahoo_toggle",
      enabled: yahooToggle.checked,
    });
    chrome.storage.sync.set({ yahooEnabled: yahooToggle.checked });
  });

  athomeToggle.addEventListener('change', async function () {
    await sendGAEvent("athome_toggle", {
      trigger: "athome_toggle",
      enabled: athomeToggle.checked,
    });
    chrome.storage.sync.set({ athomeEnabled: athomeToggle.checked });
  });
});