// Keen content script — runs on Noon product pages (any country: egypt-en, uae-en, etc.)
console.log("Keen content script loaded on Noon.");

function isNoonProductPage() {
  // Noon product URLs typically end in /N<id>/p/
  return /\/N\w+\/p\/?(\?|$)/i.test(window.location.pathname);
}

function extractNoonPrice(jsonLd) {
  if (jsonLd && jsonLd.price) return jsonLd.price;
  return parsePriceString(
    getText('[data-qa="pdp-product-price"]') ||
      getText(".priceNow") ||
      getText('[class*="priceNow"]') ||
      getText('[class*="Price"]')
  );
}

function extractProduct() {
  const jsonLd = extractJsonLdProduct();
  const isProductPage = isNoonProductPage() || Boolean(jsonLd);
  if (!isProductPage) return null;

  const title = getText('h1[data-qa="pdp-name"]') || getText("h1") || (jsonLd && jsonLd.title);
  if (!title) return null;

  return {
    platform: "noon",
    title,
    price: extractNoonPrice(jsonLd),
    currency: (jsonLd && jsonLd.currency) || (window.location.pathname.includes("egypt") ? "EGP" : null),
    rating:
      (jsonLd && jsonLd.rating) ||
      parseFloat(getText('[data-qa="pdp-review-rating"]')) ||
      null,
    reviewCount: (jsonLd && jsonLd.reviewCount) || null,
    url: window.location.href,
    extractedAt: new Date().toISOString(),
  };
}

sendProduct(extractProduct());