// Shared helpers used by content.js, noon.js, jumia.js

function getText(selector) {
  const el = document.querySelector(selector);
  return el ? el.textContent.trim() : null;
}

function parsePriceString(str) {
  if (!str) return null;
  const cleaned = String(str).replace(/,/g, "");
  const match = cleaned.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

// Tries to read structured Product data (schema.org JSON-LD), which most
// e-commerce sites embed for Google Shopping. Much more stable than CSS
// classes, which get renamed/A-B tested constantly.
function extractJsonLdProduct() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      const items = Array.isArray(data) ? data : data["@graph"] || [data];
      for (const item of items) {
        if (!item) continue;
        const type = item["@type"];
        const isProduct = type === "Product" || (Array.isArray(type) && type.includes("Product"));
        if (isProduct) {
          const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
          return {
            title: item.name || null,
            price: offer ? parsePriceString(offer.price) : null,
            currency: offer ? offer.priceCurrency : null,
            rating: item.aggregateRating ? parseFloat(item.aggregateRating.ratingValue) : null,
            reviewCount: item.aggregateRating ? parseInt(item.aggregateRating.reviewCount, 10) : null,
          };
        }
      }
    } catch (e) {
      // Malformed JSON-LD block — ignore and keep looking
    }
  }
  return null;
}

function sendProduct(product) {
  if (product && product.title) {
    console.log("Keen detected a product:", product);
    chrome.runtime.sendMessage({ type: "KEEN_PRODUCT_DETECTED", product });
  } else {
    console.log("Keen: not a recognizable product page.");
  }
}