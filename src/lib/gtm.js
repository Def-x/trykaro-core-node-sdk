/**
 * GTM / GA4 Analytics Utility  —  @defx/storefront-core
 * ─────────────────────────────────────────────────────────────────────────────
 * All analytics events are pushed to window.dataLayer.
 * GA4 picks them up via the Generic GA4 Event Tag configured inside GTM.
 *
 * Convention:
 *  - Call these helpers ONLY after a successful user action (post-API call).
 *  - Every push follows the canonical payload structure agreed with GTM/GA4.
 *  - Do NOT import or call gtag.js directly – GTM handles GA4 internally.
 * ─────────────────────────────────────────────────────────────────────────────
 */

let gtmConfig = {
  enabled: false,
  gtmContainerId: null,
  ga4MeasurementId: null,
};

/**
 * Initialize GTM config dynamically from the frontend application.
 * @param {Object} config
 */
export function initGtmConfig(config) {
  if (config) {
    gtmConfig = {
      ...gtmConfig,
      ...config,
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Safe dataLayer push.
 * Guards against SSR environments where `window` is undefined.
 * @param {Object} payload
 */
export function pushToDataLayer(payload) {
  if (!gtmConfig.enabled || typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

/**
 * Clears the ecommerce object before every new ecommerce event push.
 * GA4 / GTM best practice to prevent data bleeding between events.
 */
export function clearEcommerce() {
  pushToDataLayer({ ecommerce: null });
}

// ─── Meta Builder ─────────────────────────────────────────────────────────────

/**
 * Builds the standard `meta` object.
 * @param {Object} [overrides]
 * @returns {Object}
 */
export function buildMeta(overrides = {}) {
  const isMobile =
    typeof window !== "undefined" &&
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  return {
    country: "IN",
    device: isMobile ? "mobile" : "desktop",
    platform: "web",
    source: "direct",
    ...overrides,
  };
}

// ─── Item Builder ─────────────────────────────────────────────────────────────

/**
 * Normalises a product/variant/line-item into the GA4 `items` array element shape.
 *
 * @param {Object} product  - Raw product, variant, or line_item object.
 * @param {number} [qty=1]  - Quantity for this item.
 * @returns {Object}
 */
export function buildItem(product, qty = 1) {
  return {
    item_id: product?.id ?? product?.sku ?? "",
    item_name: product?.name ?? product?.line_itemable?.name ?? "",
    item_category:
      product?.taxons?.[0]?.display_name ?? product?.category ?? "",
    price: Number(
      product?.display_price ??
        product?.price ??
        product?.line_itemable?.price ??
        0,
    ),
    quantity: Number(qty),
  };
}

// ─── Events ──────────────────────────────────────────────────────────────────

/**
 * page_view
 * Fired on SPA client-side route changes (GTM handles hard navigations automatically).
 */
export function trackPageView(userId, metaOverrides = {}) {
  clearEcommerce();
  pushToDataLayer({
    event: "page_view",
    user_id: userId ?? null,
    ecommerce: null,
    meta: buildMeta(metaOverrides),
  });
}

/**
 * search
 * Fired when a user performs a search.
 *
 * @param {string} userId
 * @param {string} searchTerm
 * @param {Object} [metaOverrides]
 */
export function trackSearch(userId, searchTerm, metaOverrides = {}) {
  clearEcommerce();
  pushToDataLayer({
    event: "search",
    user_id: userId ?? null,
    search_term: searchTerm,
    ecommerce: null,
    meta: buildMeta(metaOverrides),
  });
}

/**
 * view_item
 * Fired when a user views a product detail page.
 *
 * @param {Object} params
 * @param {string}  params.userId
 * @param {Object}  params.product    - Raw product / variant from API.
 * @param {string}  [params.currency]
 * @param {Object}  [params.metaOverrides]
 */
export function trackViewItem({
  userId,
  product,
  currency = "INR",
  metaOverrides = {},
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
      items: [buildItem(product)],
    },
    meta: buildMeta(metaOverrides),
  });
}

/**
 * add_to_cart
 * Fired after the add-to-cart API call succeeds.
 *
 * @param {Object} params
 * @param {string}  params.userId
 * @param {Object}  params.product    - Raw product / variant from API.
 * @param {number}  [params.qty]      - Quantity added.
 * @param {string}  [params.currency]
 * @param {Object}  [params.metaOverrides]
 */
export function trackAddToCart({
  userId,
  product,
  qty = 1,
  currency = "INR",
  metaOverrides = {},
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
      items: [buildItem(product, qty)],
    },
    meta: buildMeta(metaOverrides),
  });
}

/**
 * begin_checkout
 * Fired when the user initiates the checkout flow (payment intent created / Razorpay order opened).
 *
 * @param {Object} params
 * @param {string}  params.userId
 * @param {Object}  params.cart        - Current cart object from the API.
 * @param {string}  [params.currency]
 * @param {Object}  [params.metaOverrides]
 */
export function trackBeginCheckout({
  userId,
  cart,
  currency = "INR",
  metaOverrides = {},
  transactionId,
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const tax = Number(cart?.tax_total ?? 0);
  const shipping = Number(cart?.ship_total ?? 0);
  const discount = Number(cart?.promo_total ?? 0);

  const items = (cart?.line_items ?? []).map((li) =>
    buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1),
  );

  clearEcommerce();
  pushToDataLayer({
    event: "begin_checkout",
    user_id: userId ?? null,
    ecommerce: {
      transaction_id: transactionId ?? "", // optional, but recommended for GA4 funnel reports
      currency,
      value,
      tax,
      shipping,
      discount: Math.abs(discount),
      items,
    },
    meta: buildMeta(metaOverrides),
  });
}

/**
 * purchase
 * Fired after payment capture succeeds.
 * MUST include transaction_id — required for GA4 Purchase Journey & funnel reports.
 *
 * @param {Object} params
 * @param {string}  params.userId
 * @param {string}  params.transactionId  - Order ID / Razorpay order ID from the API response.
 * @param {Object}  params.cart           - The final cart object (still has line_items at this point).
 * @param {string}  [params.currency]
 * @param {Object}  [params.metaOverrides]
 */
export function trackPurchase({
  userId,
  transactionId,
  cart,
  currency = "INR",
  metaOverrides = {},
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const tax = Number(cart?.tax_total ?? 0);
  const shipping = Number(cart?.ship_total ?? 0);
  const discount = Number(cart?.promo_total ?? 0);

  const items = (cart?.line_items ?? []).map((li) =>
    buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1),
  );

  clearEcommerce();
  pushToDataLayer({
    event: "purchase",
    user_id: userId ?? null,
    ecommerce: {
      transaction_id: transactionId ?? "", // ← required for GA4 funnel reports
      currency,
      value,
      tax,
      shipping,
      discount: Math.abs(discount), // promo_total is usually negative
      items,
    },
    meta: buildMeta(metaOverrides),
  });
}

/**
 * add_shipping_info  (GA4 funnel step 2 — "Add delivery")
 * Fired when the user selects / confirms a shipping address during checkout.
 *
 * @param {Object} params
 * @param {string}  params.userId
 * @param {Object}  params.cart         - Current cart object.
 * @param {string}  [params.shippingTier] - e.g. "Standard", "Express".
 * @param {string}  [params.currency]
 * @param {Object}  [params.metaOverrides]
 */
export function trackAddShippingInfo({
  userId,
  cart,
  shippingTier = "Standard",
  currency = "INR",
  metaOverrides = {},
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const tax = Number(cart?.tax_total ?? 0);
  const shipping = Number(cart?.ship_total ?? 0);
  const discount = Number(cart?.promo_total ?? 0);

  const items = (cart?.line_items ?? []).map((li) =>
    buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1),
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
      items,
    },
    meta: buildMeta(metaOverrides),
  });
}

/**
 * add_payment_info  (GA4 funnel step 3 — "Add payment")
 * Fired when the user selects a payment method during checkout.
 *
 * @param {Object} params
 * @param {string}  params.userId
 * @param {Object}  params.cart          - Current cart object.
 * @param {string}  [params.paymentType] - e.g. "Razorpay", "Stripe".
 * @param {string}  [params.currency]
 * @param {Object}  [params.metaOverrides]
 */
export function trackAddPaymentInfo({
  userId,
  cart,
  paymentType = "Razorpay",
  currency = "INR",
  metaOverrides = {},
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const tax = Number(cart?.tax_total ?? 0);
  const shipping = Number(cart?.ship_total ?? 0);
  const discount = Number(cart?.promo_total ?? 0);

  const items = (cart?.line_items ?? []).map((li) =>
    buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1),
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
      items,
    },
    meta: buildMeta(metaOverrides),
  });
}

/**
 * apply_coupon
 * Fired after a discount/coupon is successfully applied to the cart.
 */
export function trackApplyCoupon({
  userId,
  cart,
  couponCode,
  currency = "INR",
  metaOverrides = {},
}) {
  const discount = Math.abs(Number(cart?.promo_total ?? 0));
  const items = (cart?.line_items ?? []).map((li) =>
    buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1),
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
      items,
    },
    meta: buildMeta(metaOverrides),
  });
}

/**
 * payment_failed
 * Fired inside Razorpay's `payment.failed` callback.
 */
export function trackPaymentFailed({
  userId,
  cart,
  errorCode = "",
  errorReason = "",
  currency = "INR",
  metaOverrides = {},
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const items = (cart?.line_items ?? []).map((li) =>
    buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1),
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
      error_reason: errorReason,
    },
    meta: buildMeta(metaOverrides),
  });
}

/**
 * Generic event pusher for future events sharing the same payload shape.
 */
export function trackCustomEvent(
  eventName,
  userId,
  ecommerce = {},
  metaOverrides = {},
) {
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
      ...ecommerce,
    },
    meta: buildMeta(metaOverrides),
  });
}
