/**
 * Meta Pixel Analytics Utility  -  @defx/storefront-core
 * ─────────────────────────────────────────────────────────────────────────────
 * All events are sent to window.fbq if it is available and configured.
 * Event enabling/disabling is determined dynamically via the `isEventEnabled` check.
 */
interface MetaPixelConfig {
    enabled: boolean;
    pixelId?: string | null;
    enabledEvents?: string[];
}
/**
 * Initialize the module with configuration from the frontend.
 * Called once during application mount by the MetaPixelProvider.
 */
declare function initMetaPixelConfig(config: Partial<MetaPixelConfig>): void;
/**
 * PageView: Fires on every storefront page load.
 */
declare function trackMetaPageView(): void;
/**
 * ViewContent: Fires on product detail pages.
 */
declare function trackMetaViewContent(product: any): void;
/**
 * Search: Fires when a search is performed.
 */
declare function trackMetaSearch(searchQuery: string): void;
/**
 * AddToCart: Fires when a product is added to the cart.
 */
declare function trackMetaAddToCart(product: any, qty?: number): void;
/**
 * InitiateCheckout: Fires when checkout is started.
 */
declare function trackMetaInitiateCheckout(cart: any): void;
/**
 * AddPaymentInfo: Fires when payment details are submitted.
 */
declare function trackMetaAddPaymentInfo(cart: any): void;
/**
 * Purchase: Fires when an order is successfully placed.
 */
declare function trackMetaPurchase(order: any): void;
/**
 * CompleteRegistration: Fires when a user completes registration.
 */
declare function trackMetaCompleteRegistration(): void;
/**
 * Lead: Fires when a lead form is submitted.
 */
declare function trackMetaLead(): void;

export { type MetaPixelConfig, initMetaPixelConfig, trackMetaAddPaymentInfo, trackMetaAddToCart, trackMetaCompleteRegistration, trackMetaInitiateCheckout, trackMetaLead, trackMetaPageView, trackMetaPurchase, trackMetaSearch, trackMetaViewContent };
