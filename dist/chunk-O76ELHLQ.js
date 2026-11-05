// src/lib/gtm.ts
var gtmConfig = {
  enabled: false,
  gtmContainerId: null,
  ga4MeasurementId: null
};
function initGtmConfig(config) {
  if (config) {
    gtmConfig = {
      ...gtmConfig,
      ...config
    };
  }
}
function pushToDataLayer(payload) {
  if (!gtmConfig.enabled || typeof window === "undefined") return;
  const win = window;
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push(payload);
}
function clearEcommerce() {
  pushToDataLayer({ ecommerce: null });
}
function buildMeta(overrides = {}) {
  const isMobile = typeof window !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  return {
    country: "IN",
    device: isMobile ? "mobile" : "desktop",
    platform: "web",
    source: "direct",
    ...overrides
  };
}
function buildItem(product, qty = 1) {
  return {
    item_id: product?.id ?? product?.sku ?? "",
    item_name: product?.name ?? product?.line_itemable?.name ?? "",
    item_category: product?.taxons?.[0]?.display_name ?? product?.category ?? "",
    price: Number(
      product?.display_price ?? product?.price ?? product?.line_itemable?.price ?? 0
    ),
    quantity: Number(qty)
  };
}
function trackPageView(userId, metaOverrides = {}) {
  clearEcommerce();
  pushToDataLayer({
    event: "page_view",
    user_id: userId ?? null,
    ecommerce: null,
    meta: buildMeta(metaOverrides)
  });
}
function trackSearch(userId, searchTerm, metaOverrides = {}) {
  clearEcommerce();
  pushToDataLayer({
    event: "search",
    user_id: userId ?? null,
    search_term: searchTerm,
    ecommerce: null,
    meta: buildMeta(metaOverrides)
  });
}
function trackViewItem({
  userId,
  product,
  currency = "INR",
  metaOverrides = {}
}) {
  const price = Number(product?.display_price ?? product?.price ?? 0);
  clearEcommerce();
  pushToDataLayer({
    event: "view_item",
    user_id: userId ?? null,
    ecommerce: {
      currency,
      value: price,
      tax: 0,
      shipping: 0,
      discount: 0,
      items: [buildItem(product)]
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackAddToCart({
  userId,
  product,
  qty = 1,
  currency = "INR",
  metaOverrides = {}
}) {
  const price = Number(product?.display_price ?? product?.price ?? 0);
  clearEcommerce();
  pushToDataLayer({
    event: "add_to_cart",
    user_id: userId ?? null,
    ecommerce: {
      currency,
      value: price * qty,
      tax: 0,
      shipping: 0,
      discount: 0,
      items: [buildItem(product, qty)]
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackBeginCheckout({
  userId,
  cart,
  currency = "INR",
  metaOverrides = {},
  transactionId
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const tax = Number(cart?.tax_total ?? 0);
  const shipping = Number(cart?.ship_total ?? 0);
  const discount = Number(cart?.promo_total ?? 0);
  const items = (cart?.line_items ?? []).map(
    (li) => buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1)
  );
  clearEcommerce();
  pushToDataLayer({
    event: "begin_checkout",
    user_id: userId ?? null,
    ecommerce: {
      transaction_id: transactionId ?? "",
      // optional, but recommended for GA4 funnel reports
      currency,
      value,
      tax,
      shipping,
      discount: Math.abs(discount),
      items
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackPurchase({
  userId,
  transactionId,
  cart,
  currency = "INR",
  metaOverrides = {}
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const tax = Number(cart?.tax_total ?? 0);
  const shipping = Number(cart?.ship_total ?? 0);
  const discount = Number(cart?.promo_total ?? 0);
  const items = (cart?.line_items ?? []).map(
    (li) => buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1)
  );
  clearEcommerce();
  pushToDataLayer({
    event: "purchase",
    user_id: userId ?? null,
    ecommerce: {
      transaction_id: transactionId ?? "",
      // ← required for GA4 funnel reports
      currency,
      value,
      tax,
      shipping,
      discount: Math.abs(discount),
      // promo_total is usually negative
      items
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackAddShippingInfo({
  userId,
  cart,
  shippingTier = "Standard",
  currency = "INR",
  metaOverrides = {}
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const tax = Number(cart?.tax_total ?? 0);
  const shipping = Number(cart?.ship_total ?? 0);
  const discount = Number(cart?.promo_total ?? 0);
  const items = (cart?.line_items ?? []).map(
    (li) => buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1)
  );
  clearEcommerce();
  pushToDataLayer({
    event: "add_shipping_info",
    user_id: userId ?? null,
    ecommerce: {
      currency,
      value,
      tax,
      shipping,
      discount: Math.abs(discount),
      shipping_tier: shippingTier,
      items
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackAddPaymentInfo({
  userId,
  cart,
  paymentType = "Razorpay",
  currency = "INR",
  metaOverrides = {}
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const tax = Number(cart?.tax_total ?? 0);
  const shipping = Number(cart?.ship_total ?? 0);
  const discount = Number(cart?.promo_total ?? 0);
  const items = (cart?.line_items ?? []).map(
    (li) => buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1)
  );
  clearEcommerce();
  pushToDataLayer({
    event: "add_payment_info",
    user_id: userId ?? null,
    ecommerce: {
      currency,
      value,
      tax,
      shipping,
      discount: Math.abs(discount),
      payment_type: paymentType,
      items
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackApplyCoupon({
  userId,
  cart,
  couponCode,
  currency = "INR",
  metaOverrides = {}
}) {
  const discount = Math.abs(Number(cart?.promo_total ?? 0));
  const items = (cart?.line_items ?? []).map(
    (li) => buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1)
  );
  clearEcommerce();
  pushToDataLayer({
    event: "apply_coupon",
    user_id: userId ?? null,
    ecommerce: {
      currency,
      value: Number(cart?.total ?? 0),
      tax: Number(cart?.tax_total ?? 0),
      shipping: Number(cart?.ship_total ?? 0),
      discount,
      coupon: couponCode,
      items
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackPaymentFailed({
  userId,
  cart,
  errorCode = "",
  errorReason = "",
  currency = "INR",
  metaOverrides = {}
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const items = (cart?.line_items ?? []).map(
    (li) => buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1)
  );
  clearEcommerce();
  pushToDataLayer({
    event: "payment_failed",
    user_id: userId ?? null,
    ecommerce: {
      currency,
      value,
      tax: Number(cart?.tax_total ?? 0),
      shipping: Number(cart?.ship_total ?? 0),
      discount: Math.abs(Number(cart?.promo_total ?? 0)),
      items,
      error_code: errorCode,
      error_reason: errorReason
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackCustomEvent(eventName, userId, ecommerce = {}, metaOverrides = {}) {
  clearEcommerce();
  pushToDataLayer({
    event: eventName,
    user_id: userId ?? null,
    ecommerce: {
      currency: "INR",
      value: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      items: [],
      ...ecommerce
    },
    meta: buildMeta(metaOverrides)
  });
}

export { buildItem, buildMeta, clearEcommerce, initGtmConfig, pushToDataLayer, trackAddPaymentInfo, trackAddShippingInfo, trackAddToCart, trackApplyCoupon, trackBeginCheckout, trackCustomEvent, trackPageView, trackPaymentFailed, trackPurchase, trackSearch, trackViewItem };
//# sourceMappingURL=chunk-O76ELHLQ.js.map
//# sourceMappingURL=chunk-O76ELHLQ.js.map