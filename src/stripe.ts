/**
 * @defx/storefront-core/stripe
 *
 * Import this module ONCE in any Stripe-enabled project (e.g. in your root
 * layout or providers file). It self-registers StripeCheckout into the payment
 * gateway registry — no prop passing or component wiring needed.
 *
 * Usage (in your Next.js app that has @stripe/stripe-js installed):
 *
 *   // app/layout.tsx  or  app/providers.tsx
 *   import "@defx/storefront-core/stripe";
 *
 * That's it. The Checkout component inside the core package will automatically
 * pick up and render StripeCheckout when orgData.payment.mode === "stripe".
 *
 * Razorpay-only projects: do NOT import this file. @stripe/* never loads.
 */
import { registerPaymentGateway } from "./gateways/registry";
import StripeCheckout from "./components/cart/StripeCheckout";

// Auto-register when this module is imported (side-effect)
registerPaymentGateway("stripe", StripeCheckout);

// Also export for consumers who want to use StripeCheckout directly
export { StripeCheckout };

