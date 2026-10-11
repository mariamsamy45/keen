const PLATFORM_LABELS = { amazon: "Amazon", noon: "Noon", jumia: "Jumia" };

chrome.storage.local.get("keen_latest", (result) => {
  const latest = result.keen_latest || {};
  const listEl = document.getElementById("store-list");
  const titleEl = document.getElementById("product-title");
  const platforms = Object.keys(PLATFORM_LABELS);

  const seen = platforms.map((p) => latest[p]).filter(Boolean);
  if (seen.length) {
    titleEl.textContent = seen[0].title;
  }

  const prices = seen
    .filter((p) => typeof p.price === "number")
    .map((p) => p.price);
  const lowestPrice = prices.length ? Math.min(...prices) : null;

  platforms.forEach((platform) => {
    const data = latest[platform];
    const card = document.createElement("div");

    if (!data) {
      card.className = "store-card empty";
      card.innerHTML = `
        <div class="store-row">
          <span class="store-name">${PLATFORM_LABELS[platform]}</span>
        </div>
        <div class="store-empty-text">No data yet — visit a product page</div>
      `;
      listEl.appendChild(card);
      return;
    }

    const isBest = typeof data.price === "number" && data.price === lowestPrice;
    const priceDisplay =
      typeof data.price === "number" ? `${data.price.toFixed(2)} ${data.currency || ""}`.trim() : "N/A";
    const ratingDisplay = data.rating ? `${data.rating} out of 5` : "No rating found";

    card.className = `store-card${isBest ? " best" : ""}`;
    card.innerHTML = `
      ${isBest ? '<span class="best-tag">Lowest price</span>' : ""}
      <div class="store-row">
        <span class="store-name">${PLATFORM_LABELS[platform]}</span>
        <span class="store-price">${priceDisplay}</span>
      </div>
      <div class="store-meta">${ratingDisplay}</div>
    `;
    listEl.appendChild(card);
  });
});