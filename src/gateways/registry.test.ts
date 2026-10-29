import { describe, it, expect, beforeEach } from "vitest";
import { registerPaymentGateway, getPaymentGateway } from "./registry";
import React from "react";

describe("src/gateways/registry", () => {
  const MockStripeComponent: React.FC = () => React.createElement("div", null, "Stripe");
  const MockPhonePeComponent: React.FC = () => React.createElement("div", null, "PhonePe");

  it("returns null for unregistered gateway", () => {
    expect(getPaymentGateway("nonexistent")).toBeNull();
  });

  it("registers and retrieves gateway components correctly", () => {
    registerPaymentGateway("test_stripe", MockStripeComponent);
    registerPaymentGateway("test_phonepe", MockPhonePeComponent);

    expect(getPaymentGateway("test_stripe")).toBe(MockStripeComponent);
    expect(getPaymentGateway("test_phonepe")).toBe(MockPhonePeComponent);
  });
});

