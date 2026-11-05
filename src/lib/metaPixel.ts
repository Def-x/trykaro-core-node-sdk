/**
 * Meta Pixel Analytics Utility  -  @defx/storefront-core
 * ─────────────────────────────────────────────────────────────────────────────
 * All events are sent to window.fbq if it is available and configured.
 * Event enabling/disabling is determined dynamically via the `isEventEnabled` check.
 */

export interface MetaPixelConfig {
  enabled: boolean;
  pixelId?: string | null;
  enabledEvents?: string[];
}

// Global configuration that the frontend can inject
let metaPixelConfig: MetaPixelConfig = {
  enabled: false,
  pixelId: null,
  enabledEvents: [], // Array of enabled event IDs, e.g., ["PageView", "Purchase"]
};

/**
 * Initialize the module with configuration from the frontend.
 * Called once during application mount by the MetaPixelProvider.
 */
export function initMetaPixelConfig(config: Partial<MetaPixelConfig>): void {
  if (config) {
    metaPixelConfig = {
      ...metaPixelConfig,
      ...config,
    };
  }
}

function isEventEnabled(eventName: string): boolean {
  return (
    metaPixelConfig.enabled &&
    !!metaPixelConfig.pixelId &&
    (metaPixelConfig.enabledEvents ?? []).includes(eventName)
  );
}

/**
 * Safe Meta Pixel push.
 * Guards against SSR environments where `window` is undefined.
 */
function fbq(...args: unknown[]): void {
  if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
    (window as any).fbq(...args);
  }
}

// ─── Event Tracking ────────────────────────────────────────────────────────────

/**
 * PageView: Fires on every storefront page load.
 */
export function trackMetaPageView(): void {
  if (!isEventEnabled("PageView")) return;
  fbq("track", "PageView");
}

/**
 * ViewContent: Fires on product detail pages.
 */
export function trackMetaViewContent(product: any): void {
  if (!isEventEnabled("ViewContent")) return;
  if (!product) return;

  fbq("track", "ViewContent", {
    content_ids: [product.id || product.sku || ""],
    content_name: product.name || "",
    content_type: "product",
    value: Number(product.price ? product.price / 100 : 0),
    currency: "INR",
  });
}

/**
 * Search: Fires when a search is performed.
 */
export function trackMetaSearch(searchQuery: string): void {
  if (!isEventEnabled("Search")) return;
  if (!searchQuery) return;

  fbq("track", "Search", {
    search_string: searchQuery,
  });
}

/**
 * AddToCart: Fires when a product is added to the cart.
 */
export function trackMetaAddToCart(product: any, qty: number = 1): void {
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
        quantity: Number(qty),
      },
    ],
  });
}

/**
 * InitiateCheckout: Fires when checkout is started.
 */
export function trackMetaInitiateCheckout(cart: any): void {
  if (!isEventEnabled("InitiateCheckout")) return;
  if (!cart) return;

  const contentIds =
    cart.line_items?.map((item: any) => item.variant_id || item.id) || [];
  const contents =
    cart.line_items?.map((item: any) => ({
      id: item.variant_id || item.id,
      quantity: item.quantity,
    })) || [];

  fbq("track", "InitiateCheckout", {
    content_ids: contentIds,
    contents: contents,
    value: Number(cart.total ? cart.total / 100 : 0),
    currency: "INR",
    num_items: cart.item_count || cart.line_items?.length || 0,
  });
}

/**
 * AddPaymentInfo: Fires when payment details are submitted.
 */
export function trackMetaAddPaymentInfo(cart: any): void {
  if (!isEventEnabled("AddPaymentInfo")) return;

  fbq("track", "AddPaymentInfo", {
    value: Number(cart?.total ? cart.total / 100 : 0),
    currency: "INR",
  });
}

/**
 * Purchase: Fires when an order is successfully placed.
 */
export function trackMetaPurchase(order: any): void {
  if (!isEventEnabled("Purchase")) return;
  if (!order) return;

  const contentIds =
    order.line_items?.map((item: any) => item.variant_id || item.id) || [];
  const contents =
    order.line_items?.map((item: any) => ({
      id: item.variant_id || item.id,
      quantity: item.quantity,
    })) || [];

  fbq("track", "Purchase", {
    content_ids: contentIds,
    contents: contents,
    value: Number(order.total ? order.total / 100 : 0),
    currency: "INR",
    num_items: order.item_count || order.line_items?.length || 0,
  });
}

/**
 * CompleteRegistration: Fires when a user completes registration.
 */
export function trackMetaCompleteRegistration(): void {
  if (!isEventEnabled("CompleteRegistration")) return;

  fbq("track", "CompleteRegistration", {
    status: "completed",
  });
}

/**
 * Lead: Fires when a lead form is submitted.
 */
export function trackMetaLead(): void {
  if (!isEventEnabled("Lead")) return;

  fbq("track", "Lead");
}
