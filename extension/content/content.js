// Keen content script — runs on Amazon product pages.
console.log("Keen content script loaded on this page.");

function isAmazonProductPage() {
  return /\/(dp|gp\/product)\/[A-Z0-9]{10}/i.test(window.location.pathname);
}

function extractPrice() {
  const whole = getText(".a-price .a-price-whole");
  const fraction = getText(".a-price .a-price-fraction");
  if (whole) {
    // Amazon's whole-number span often includes a trailing "." (e.g. "519.")
    // which caused the "$519..74" bug when concatenated with fraction.
    const cleanWhole = whole.replace(/[^\d]/g, "");
    const combined = fraction ? `${cleanWhole}.${fraction}` : cleanWhole;
    return parsePriceString(combined);
  }
  return parsePriceString(
    getText("#priceblock_ourprice") ||
      getText("#priceblock_dealprice") ||
      getText(".a-offscreen")
  );
}

function extractRating() {
  const ratingText = getText("#acrPopover") || getText("span[data-hook='rating-out-of-text']");
  if (!ratingText) return null;
  const match = ratingText.match(/([\d.]+)\s*out of/i);
  return match ? parseFloat(match[1]) : null;
}

function extractReviewCount() {
  const text = getText("#acrCustomerReviewText") || getText("span[data-hook='total-review-count']");
  if (!text) return null;
  const match = text.replace(/,/g, "").match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function extractAsin() {
  const match = window.location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return match ? match[1] : null;
}

function extractProduct() {
  if (!isAmazonProductPage()) return null;
  const jsonLd = extractJsonLdProduct();

  return {
    platform: "amazon",
    title: getText("#productTitle") || (jsonLd && jsonLd.title) || null,
    price: extractPrice() ?? (jsonLd && jsonLd.price) ?? null,
    currency: "EGP",
    rating: extractRating() ?? (jsonLd && jsonLd.rating) ?? null,
    reviewCount: extractReviewCount() ?? (jsonLd && jsonLd.reviewCount) ?? null,
    asin: extractAsin(),
    url: window.location.href,
    extractedAt: new Date().toISOString(),
  };
}

sendProduct(extractProduct());