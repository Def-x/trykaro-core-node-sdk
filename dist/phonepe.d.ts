import React__default from 'react';
export { c as createCartPaymentAction, a as createPhonePeOrderAction, u as updateCartPaymentAction, b as updatePhonePePaymentAction } from './storefrontActions-CJKIC8g-.js';

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

/**
 * Register a payment gateway component.
 * Called automatically when a gateway sub-package is imported.
 *
 * @param name - Gateway key matching orgData payment.mode (e.g. "stripe")
 * @param component - The checkout UI component
 */
declare function registerPaymentGateway(name: string, component: React__default.ComponentType<any>): void;
/**
 * Retrieve a registered gateway component by name.
 * Returns null if the gateway was never registered (i.e. sub-package not imported).
 *
 * @param name - Gateway key (e.g. "stripe", "razorpay")
 * @returns The registered component or null
 */
declare function getPaymentGateway(name: string): React__default.ComponentType<any> | null;

/**
 * @defx/storefront-core/phonepe
 *
 * PhonePe payment gateway registration and utilities.
 * PhonePe standard checkout redirect flow is already supported out-of-the-box
 * in the Checkout component. This module can also be used to register a custom
 * PhonePe component or import PhonePe action helpers.
 */

declare function registerPhonePeGateway(component: React__default.ComponentType<any>): void;

export { getPaymentGateway, registerPaymentGateway, registerPhonePeGateway };
