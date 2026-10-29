/**
 * Payment Gateway Registry — @defx/storefront-core
 *
 * A module-level singleton shared across the entire app bundle.
 * Payment gateway components register themselves here via side-effect imports.
 *
 * This file has ZERO external dependencies — it is safe to import from
 * anywhere in the main bundle without pulling in Stripe, Razorpay, etc.
 *
 * Usage:
 *   // In a gateway sub-package (e.g. src/stripe.ts):
 *   import { registerPaymentGateway } from "./gateways/registry";
 *   registerPaymentGateway("stripe", StripeCheckoutComponent);
 *
 *   // In Checkout.tsx (reads at render time):
 *   import { getPaymentGateway } from "../../gateways/registry";
 *   const StripeCheckout = getPaymentGateway("stripe");
 */

import type React from "react";

const registry: Record<string, React.ComponentType<any>> = {};

/**
 * Register a payment gateway component.
 * Called automatically when a gateway sub-package is imported.
 *
 * @param name - Gateway key matching orgData payment.mode (e.g. "stripe")
 * @param component - The checkout UI component
 */
export function registerPaymentGateway(name: string, component: React.ComponentType<any>): void {
  registry[name] = component;
}

/**
 * Retrieve a registered gateway component by name.
 * Returns null if the gateway was never registered (i.e. sub-package not imported).
 *
 * @param name - Gateway key (e.g. "stripe", "razorpay")
 * @returns The registered component or null
 */
export function getPaymentGateway(name: string): React.ComponentType<any> | null {
  return registry[name] ?? null;
}

