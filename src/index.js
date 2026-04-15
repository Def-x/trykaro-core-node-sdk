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

// ─── Cart Components ──────────────────────────────────────────────────────────
export { CartPage } from "./components/cart/CartPage";
export { CartItem } from "./components/cart/CartItem";
export { CartSummary } from "./components/cart/CartSummary";

// ─── UI Primitives ────────────────────────────────────────────────────────────
export { Spinner } from "./components/ui/Spinner";
export { EmptyState } from "./components/ui/EmptyState";

// ─── Debug / Dev ──────────────────────────────────────────────────────────────
export { Hello } from "./components/hello";
export { ViewCart } from "./components/cart/ViewCart"