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
interface GtmConfig {
    enabled: boolean;
    gtmContainerId?: string | null;
    ga4MeasurementId?: string | null;
}
/**
 * Initialize GTM config dynamically from the frontend application.
 * @param {Object} config
 */
declare function initGtmConfig(config: Partial<GtmConfig>): void;
/**
 * Safe dataLayer push.
 * Guards against SSR environments where `window` is undefined.
 * @param {Object} payload
 */
declare function pushToDataLayer(payload: Record<string, unknown>): void;
/**
 * Clears the ecommerce object before every new ecommerce event push.
 * GA4 / GTM best practice to prevent data bleeding between events.
 */
declare function clearEcommerce(): void;
/**
 * Builds the standard `meta` object.
 * @param {Object} [overrides]
 * @returns {Object}
 */
declare function buildMeta(overrides?: Record<string, unknown>): Record<string, unknown>;
/**
 * Normalises a product/variant/line-item into the GA4 `items` array element shape.
 *
 * @param {Object} product  - Raw product, variant, or line_item object.
 * @param {number} [qty=1]  - Quantity for this item.
 * @returns {Object}
 */
declare function buildItem(product: any, qty?: number): {
    item_id: string;
    item_name: string;
    item_category: string;
    price: number;
    quantity: number;
};
/**
 * page_view
 * Fired on SPA client-side route changes (GTM handles hard navigations automatically).
 */
declare function trackPageView(userId: string | null | undefined, metaOverrides?: Record<string, unknown>): void;
/**
 * search
 * Fired when a user performs a search.
 *
 * @param {string} userId
 * @param {string} searchTerm
 * @param {Object} [metaOverrides]
 */
declare function trackSearch(userId: string | null | undefined, searchTerm: string, metaOverrides?: Record<string, unknown>): void;
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
declare function trackViewItem({ userId, product, currency, metaOverrides, }: {
    userId: string | null | undefined;
    product: any;
    currency?: string;
    metaOverrides?: Record<string, unknown>;
}): void;
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
declare function trackAddToCart({ userId, product, qty, currency, metaOverrides, }: {
    userId: string | null | undefined;
    product: any;
    qty?: number;
    currency?: string;
    metaOverrides?: Record<string, unknown>;
}): void;
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
declare function trackBeginCheckout({ userId, cart, currency, metaOverrides, transactionId, }: {
    userId: string | null | undefined;
    cart: any;
    currency?: string;
    metaOverrides?: Record<string, unknown>;
    transactionId?: string;
}): void;
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
declare function trackPurchase({ userId, transactionId, cart, currency, metaOverrides, }: {
    userId: string | null | undefined;
    transactionId: string;
    cart: any;
    currency?: string;
    metaOverrides?: Record<string, unknown>;
}): void;
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
declare function trackAddShippingInfo({ userId, cart, shippingTier, currency, metaOverrides, }: {
    userId: string | null | undefined;
    cart: any;
    shippingTier?: string;
    currency?: string;
    metaOverrides?: Record<string, unknown>;
}): void;
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
declare function trackAddPaymentInfo({ userId, cart, paymentType, currency, metaOverrides, }: {
    userId: string | null | undefined;
    cart: any;
    paymentType?: string;
    currency?: string;
    metaOverrides?: Record<string, unknown>;
}): void;
/**
 * apply_coupon
 * Fired after a discount/coupon is successfully applied to the cart.
 */
declare function trackApplyCoupon({ userId, cart, couponCode, currency, metaOverrides, }: {
    userId: string | null | undefined;
    cart: any;
    couponCode: string;
    currency?: string;
    metaOverrides?: Record<string, unknown>;
}): void;
/**
 * payment_failed
 * Fired inside Razorpay's `payment.failed` callback.
 */
declare function trackPaymentFailed({ userId, cart, errorCode, errorReason, currency, metaOverrides, }: {
    userId: string | null | undefined;
    cart: any;
    errorCode?: string;
    errorReason?: string;
    currency?: string;
    metaOverrides?: Record<string, unknown>;
}): void;
/**
 * Generic event pusher for future events sharing the same payload shape.
 */
declare function trackCustomEvent(eventName: string, userId: string | null | undefined, ecommerce?: Record<string, unknown>, metaOverrides?: Record<string, unknown>): void;

export { type GtmConfig, buildItem, buildMeta, clearEcommerce, initGtmConfig, pushToDataLayer, trackAddPaymentInfo, trackAddShippingInfo, trackAddToCart, trackApplyCoupon, trackBeginCheckout, trackCustomEvent, trackPageView, trackPaymentFailed, trackPurchase, trackSearch, trackViewItem };
