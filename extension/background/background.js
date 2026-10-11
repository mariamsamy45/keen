console.log("Keen background service worker running.");

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "KEEN_PRODUCT_DETECTED") {
    chrome.storage.local.get("keen_latest", (result) => {
      const latest = result.keen_latest || {};
      latest[message.product.platform] = message.product;
      chrome.storage.local.set({ keen_latest: latest });
    });
  }
});