// Keen content script — runs on Jumia product pages (jumia.com.eg, etc.)
console.log("Keen content script loaded on Jumia.");

function isJumiaProductPage() {
  // Jumia product URLs typically end in -<id>.html
  return /-\d+\.html?(\?|$)/i.test(window.location.pathname);
}

function extractJumiaPrice(jsonLd) {
  if (jsonLd && jsonLd.price) return jsonLd.price;
  return parsePriceString(
    getText(".-b.-ltr.-tal.-fs24") || getText(".-prc") || getText('[class*="prc"]')
  );
}

function extractProduct() {
  const jsonLd = extractJsonLdProduct();
  const isProductPage = isJumiaProductPage() || Boolean(jsonLd);
  if (!isProductPage) return null;

  const title = getText("h1.-fs20") || getText("h1") || (jsonLd && jsonLd.title);
  if (!title) return null;

  return {
    platform: "jumia",
    title,
    price: extractJumiaPrice(jsonLd),
    currency: (jsonLd && jsonLd.currency) || "EGP",
    rating: (jsonLd && jsonLd.rating) || null,
    reviewCount: (jsonLd && jsonLd.reviewCount) || null,
    url: window.location.href,
    extractedAt: new Date().toISOString(),
  };
}

sendProduct(extractProduct());