// src/lib/metaPixel.ts
var metaPixelConfig = {
  enabled: false,
  pixelId: null,
  enabledEvents: []
  // Array of enabled event IDs, e.g., ["PageView", "Purchase"]
};
function initMetaPixelConfig(config) {
  if (config) {
    metaPixelConfig = {
      ...metaPixelConfig,
      ...config
    };
  }
}
function isEventEnabled(eventName) {
  return metaPixelConfig.enabled && !!metaPixelConfig.pixelId && (metaPixelConfig.enabledEvents ?? []).includes(eventName);
}
function fbq(...args) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}
function trackMetaPageView() {
  if (!isEventEnabled("PageView")) return;
  fbq("track", "PageView");
}
function trackMetaViewContent(product) {
  if (!isEventEnabled("ViewContent")) return;
  if (!product) return;
  fbq("track", "ViewContent", {
    content_ids: [product.id || product.sku || ""],
    content_name: product.name || "",
    content_type: "product",
    value: Number(product.price ? product.price / 100 : 0),
    currency: "INR"
  });
}
function trackMetaSearch(searchQuery) {
  if (!isEventEnabled("Search")) return;
  if (!searchQuery) return;
  fbq("track", "Search", {
    search_string: searchQuery
  });
}
function trackMetaAddToCart(product, qty = 1) {
  if (!isEventEnabled("AddToCart")) return;
  if (!product) return;
  fbq("track", "AddToCart", {
    content_ids: [product.id || product.sku || ""],
    content_name: product.name || "",
    content_type: "product",
    value: Number(product.price ? product.price / 100 : 0) * Number(qty),
    currency: "INR",
    contents: [
      {
        id: product.id || product.sku || "",
        quantity: Number(qty)
      }
    ]
  });
}
function trackMetaInitiateCheckout(cart) {
  if (!isEventEnabled("InitiateCheckout")) return;
  if (!cart) return;
  const contentIds = cart.line_items?.map((item) => item.variant_id || item.id) || [];
  const contents = cart.line_items?.map((item) => ({
    id: item.variant_id || item.id,
    quantity: item.quantity
  })) || [];
  fbq("track", "InitiateCheckout", {
    content_ids: contentIds,
    contents,
    value: Number(cart.total ? cart.total / 100 : 0),
    currency: "INR",
    num_items: cart.item_count || cart.line_items?.length || 0
  });
}
function trackMetaAddPaymentInfo(cart) {
  if (!isEventEnabled("AddPaymentInfo")) return;
  fbq("track", "AddPaymentInfo", {
    value: Number(cart?.total ? cart.total / 100 : 0),
    currency: "INR"
  });
}
function trackMetaPurchase(order) {
  if (!isEventEnabled("Purchase")) return;
  if (!order) return;
  const contentIds = order.line_items?.map((item) => item.variant_id || item.id) || [];
  const contents = order.line_items?.map((item) => ({
    id: item.variant_id || item.id,
    quantity: item.quantity
  })) || [];
  fbq("track", "Purchase", {
    content_ids: contentIds,
    contents,
    value: Number(order.total ? order.total / 100 : 0),
    currency: "INR",
    num_items: order.item_count || order.line_items?.length || 0
  });
}
function trackMetaCompleteRegistration() {
  if (!isEventEnabled("CompleteRegistration")) return;
  fbq("track", "CompleteRegistration", {
    status: "completed"
  });
}
function trackMetaLead() {
  if (!isEventEnabled("Lead")) return;
  fbq("track", "Lead");
}

export { initMetaPixelConfig, trackMetaAddPaymentInfo, trackMetaAddToCart, trackMetaCompleteRegistration, trackMetaInitiateCheckout, trackMetaLead, trackMetaPageView, trackMetaPurchase, trackMetaSearch, trackMetaViewContent };
//# sourceMappingURL=chunk-43QFS5VV.js.map
//# sourceMappingURL=chunk-43QFS5VV.js.map