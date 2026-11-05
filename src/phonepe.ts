/**
 * @defx/storefront-core/phonepe
 *
 * PhonePe payment gateway registration and utilities.
 * PhonePe standard checkout redirect flow is already supported out-of-the-box
 * in the Checkout component. This module can also be used to register a custom
 * PhonePe component or import PhonePe action helpers.
 */
import type React from "react";
import { registerPaymentGateway, getPaymentGateway } from "./gateways/registry";
import {
  createPhonePeOrderAction,
  updatePhonePePaymentAction,
  createCartPaymentAction,
  updateCartPaymentAction,
} from "./actions/storefrontActions";

export function registerPhonePeGateway(component: React.ComponentType<any>): void {
  registerPaymentGateway("phonepe", component);
}

export {
  registerPaymentGateway,
  getPaymentGateway,
  createPhonePeOrderAction,
  updatePhonePePaymentAction,
  createCartPaymentAction,
  updateCartPaymentAction,
};

