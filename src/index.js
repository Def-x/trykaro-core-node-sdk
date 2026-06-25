
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

// ─── Auth Components ──────────────────────────────────────────────────────────
export { AuthManager } from "./components/auth/AuthManager";
export { CustomOTPAuth } from "./components/auth/CustomOTPAuth";

// ─── Cart Components ──────────────────────────────────────────────────────────
export { CartPage } from "./components/cart/CartPage";
export { CartItem } from "./components/cart/CartItem";
export { CartSummary } from "./components/cart/CartSummary";
export { ViewCart } from "./components/cart/ViewCart";
export { default as CouponSection } from "./components/cart/CouponSection";

// ─── Account Components ───────────────────────────────────────────────────────
export { AccountPage } from "./components/account/AccountPage";
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