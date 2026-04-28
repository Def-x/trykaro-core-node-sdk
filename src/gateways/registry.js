/**
 * Payment Gateway Registry
 *
 * A module-level singleton shared across the entire app bundle.
 * Payment gateway components register themselves here via side-effect imports.
 *
 * This file has ZERO external dependencies — it is safe to import from
 * anywhere in the main bundle without pulling in Stripe, Razorpay, etc.
 *
 * Usage:
 *   // In a gateway sub-package (e.g. src/stripe.js):
 *   import { registerPaymentGateway } from "./gateways/registry";
 *   registerPaymentGateway("stripe", StripeCheckoutComponent);
 *
 *   // In Checkout.jsx (reads at render time):
 *   import { getPaymentGateway } from "../../gateways/registry";
 *   const StripeCheckout = getPaymentGateway("stripe");
 */

const registry = {};

/**
 * Register a payment gateway component.
 * Called automatically when a gateway sub-package is imported.
 *
 * @param {string} name - Gateway key matching orgData payment.mode (e.g. "stripe")
 * @param {React.ComponentType} component - The checkout UI component
 */
export function registerPaymentGateway(name, component) {
  registry[name] = component;
}

/**
 * Retrieve a registered gateway component by name.
 * Returns null if the gateway was never registered (i.e. sub-package not imported).
 *
 * @param {string} name - Gateway key (e.g. "stripe", "razorpay")
 * @returns {React.ComponentType | null}
 */
export function getPaymentGateway(name) {
  return registry[name] ?? null;
}
