"use client";
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

// ─── Inner form rendered inside <Elements> ────────────────────────────────────
const CheckoutForm = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/account/orders`,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message);
      setIsProcessing(false);
    } else {
      setMessage("");
      setIsProcessing(false);
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {message && (
        <div className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg">
          {message}
        </div>
      )}
      <button
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-[#2A4BA0] text-white py-3.5 rounded-lg font-[Manrope-Bold] hover:bg-blue-800 transition shadow-sm mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
        {isProcessing ? "Processing..." : "Pay Now securely via Stripe"}
      </button>
    </form>
  );
};

// ─── Public component ─────────────────────────────────────────────────────────
/**
 * StripeCheckout
 *
 * Props:
 *  - cartId          (string)   – cart / order id used to create the PaymentIntent
 *  - publishableKey  (string)   – Stripe publishable key from orgData
 *  - onSuccess       (fn)       – called after successful payment confirmation
 *  - createStripePaymentIntent (fn) – server action injected from consuming app
 */
export default function StripeCheckout({
  cartId,
  publishableKey,
  onSuccess,
  createStripePaymentIntent,
}) {
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialise Stripe with the org's publishable key
  useEffect(() => {
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    }
  }, [publishableKey]);

  // Create a PaymentIntent and grab the client secret
  useEffect(() => {
    if (!cartId || !createStripePaymentIntent) return;

    const initIntent = async () => {
      try {
        setLoading(true);
        const res = await createStripePaymentIntent(cartId);

        let secret =
          res?.client_secret ||
          res?.stripe_payment_intent_client_secret ||
          res?.id;

        // Fallback: scan all string values for the pi_…_secret_ pattern
        if (!secret && typeof res === "object") {
          for (const key in res) {
            if (
              typeof res[key] === "string" &&
              res[key].startsWith("pi_") &&
              res[key].includes("_secret_")
            ) {
              secret = res[key];
              break;
            }
          }
        }

        setClientSecret(secret ?? "");
      } catch (err) {
        console.error("[StripeCheckout] Failed to fetch payment intent:", err);
      } finally {
        setLoading(false);
      }
    };

    initIntent();
  }, [cartId, createStripePaymentIntent]);

  // ── Loading / error state ──────────────────────────────────────────────
  if (loading || !clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4 border border-gray-100 rounded-xl bg-gray-50/50">
        <Loader2 className="w-8 h-8 animate-spin text-[#2A4BA0]" />
        <p className="text-sm text-gray-500 font-[Manrope-Medium]">
          Initializing Secure Stripe Payment Environment…
        </p>
        {!loading && !clientSecret && (
          <p className="text-red-500 text-xs">
            Failed to establish connection. Cannot locate client_secret in API
            response.
          </p>
        )}
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#2A4BA0",
        colorBackground: "#ffffff",
        colorText: "#1B262E",
        fontFamily: "var(--font-manrope), system-ui, sans-serif",
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <span className="text-[14px] font-[Manrope-Bold] text-gray-800">
          Credit / Debit Card
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase font-[Manrope-Bold] text-gray-400 bg-gray-100 px-2 py-0.5 rounded mr-1">
            Powered by Stripe
          </span>
          <div className="h-4 w-7 bg-blue-600 rounded" />
          <div className="h-4 w-7 bg-red-500 rounded" />
        </div>
      </div>
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm onSuccess={onSuccess} />
      </Elements>
    </div>
  );
}
