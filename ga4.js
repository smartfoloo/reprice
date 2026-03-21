const MEASUREMENT_ID = "G-07DGZCBFB3";
const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";

async function getOrCreateClientId() {
  const result = await chrome.storage.local.get("clientId");
  let clientId = result.clientId;
  if (!clientId) {
    clientId = self.crypto.randomUUID();
    await chrome.storage.local.set({ clientId });
  }
  return clientId;
}

async function sendGAEvent(name, params = {}) {
  const clientId = await getOrCreateClientId();

  const payload = {
    client_id: clientId,
    events: [
      {
        name,
        params,
      },
    ],
  };

  const url = `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}`;
  const options = {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload),
  };
  
  await fetch(url, options);
}
