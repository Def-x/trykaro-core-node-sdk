
// ─── Context ──────────────────────────────────────────────────────────────────
export { CoreProvider, useCore } from "./context/CoreProvider";

// ─── Hooks ────────────────────────────────────────────────────────────────────
export { useCart } from "./hooks/useCart";
export { useAddToCart } from "./hooks/useAddToCart";
export { useCurrencyFormat } from "./hooks/useCurrencyFormat";
export { useAuth } from "./hooks/useAuth";
export { useLogout } from "./hooks/useLogout";
export { useVariantSelection } from "./hooks/useVariantSelection";
export { default as useCartInfo } from "./hooks/userCartInfo";
export {
  useGetCurrentUserLikedProductsQuery,
  invalidateLikedProductsCache,
} from "./hooks/useLikedProducts";


// ─── Auth Components ──────────────────────────────────────────────────────────
export { AuthManager } from "./components/auth/AuthManager";
export { CustomOTPAuth } from "./components/auth/CustomOTPAuth";

// ─── Cart Components ──────────────────────────────────────────────────────────
export { CartPage } from "./components/cart/CartPage";
export { CartItem } from "./components/cart/CartItem";
export { CartSummary } from "./components/cart/CartSummary";
export { ViewCart } from "./components/cart/ViewCart";
export { default as CouponSection } from "./components/cart/CouponSection";
export { default as CartMismatchBanner } from "./components/cart/CartMismatchBanner";

// ─── Actions & Cart Utilities ──────────────────────────────────────────────────
export * from "./actions/storefrontActions";
export * from "./actions/discountActions";

// ─── Account Components ───────────────────────────────────────────────────────
export { AccountPage } from "./components/account/AccountPage";
export { AccountLayout } from "./components/account/AccountLayout";
export { AccountSidebar, DEFAULT_ACCOUNT_NAV_ITEMS } from "./components/account/AccountSidebar";
export { AccountAddressesPage } from "./components/account/AccountAddressesPage";
export { AccountOrdersPage } from "./components/account/AccountOrdersPage";
export { AccountOrderDetailContent } from "./components/account/AccountOrderDetailContent";
export { AccountWishlistPage } from "./components/account/AccountWishlistPage";
export { UserInfo } from "./components/account/UserInfo";
export { AddressCard } from "./components/account/AddressCard";
export { OrdersList } from "./components/account/OrdersList";
export { ProfileForm } from "./components/account/ProfileForm";

// ─── Order Components ─────────────────────────────────────────────────────────
export { Order } from "./components/orders/Order";

// ─── UI Primitives ────────────────────────────────────────────────────────────
export { Spinner } from "./components/ui/Spinner";
export { EmptyState } from "./components/ui/EmptyState";
export { Popup } from "./components/ui/Popup";

// ─── Common Components ────────────────────────────────────────────────────────
export { AddressForm } from "./components/common/AddressForm";

// ─── Debug / Dev ──────────────────────────────────────────────────────────────
export { Hello } from "./components/hello";

// ─── Analytics (GTM / GA4) ────────────────────────────────────────────────────
export {
  initGtmConfig,
  pushToDataLayer,
  clearEcommerce,
  buildMeta,
  buildItem,
  trackPageView,
  trackSearch,
  trackViewItem,
  trackAddToCart,
  trackBeginCheckout,
  trackAddShippingInfo,
  trackAddPaymentInfo,
  trackPurchase,
  trackApplyCoupon,
  trackPaymentFailed,
  trackCustomEvent,
} from "./lib/gtm";

// ─── Analytics (Meta Pixel) ──────────────────────────────────────────────────
export {
  initMetaPixelConfig,
  trackMetaPageView,
  trackMetaViewContent,
  trackMetaSearch,
  trackMetaAddToCart,
  trackMetaInitiateCheckout,
  trackMetaAddPaymentInfo,
  trackMetaPurchase,
  trackMetaCompleteRegistration,
  trackMetaLead,
} from "./lib/metaPixel";

// ─── Third-Party Script Injection ────────────────────────────────────────────
export { ThirdPartyScripts } from "./components/tracking/ThirdPartyScripts";
export {
  nameToSlug,
  injectContentSquare,
  injectHotjar,
} from "./lib/thirdPartyScripts";

// ─── PostHog Multi-Instance & Developer Telemetry ────────────────────────────
export {
  POSTHOG_INSTANCES,
  sanitizePostHogToken,
  initPostHog,
  initDeveloperPostHog,
  initMerchantPostHog,
  getPostHogInstance,
  getDeveloperPostHog,
  getMerchantPostHog,
  setDeveloperSuperProperties,
  identifyDeveloperUser,
  resetDeveloperPostHog,
  captureDeveloperException,
  logDeveloper,
  devLogger,
} from "./lib/posthog";
export { DeveloperErrorBoundary } from "./components/posthog/DeveloperErrorBoundary";




