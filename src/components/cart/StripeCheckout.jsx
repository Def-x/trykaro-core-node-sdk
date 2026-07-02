"use client";
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, Lock, ShieldCheck } from "lucide-react";

// ─── Inner form rendered inside <Elements> ────────────────────────────────────
const CheckoutForm = ({ onSuccess, amount, currency }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setMessage("");

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
      setIsProcessing(false);
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Stripe PaymentElement — shows ALL enabled methods as tabs:
          UPI, Cards, Netbanking, Google Pay, Apple Pay, etc.
          Tabs are enabled/disabled from your Stripe Dashboard →
          Settings → Payment Methods */}
      <PaymentElement
        options={{
          layout: {
            type: "tabs",
            defaultCollapsed: false,
          },
          // Disable Stripe Link (the "Save my info" autofill section).
          // Link requires HTTPS — it shows a browser warning on localhost HTTP.
          // Re-enable in production if you want Stripe Link.
          terms: {
            card: "never",
            usBankAccount: "never",
            auBecsDebit: "never",
            bancontact: "never",
            ideal: "never",
            sepaDebit: "never",
            sofort: "never",
          },
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
        }}
      />

      {message && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">
          <span className="mt-0.5">⚠</span>
          <span>{message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        style={{ backgroundColor: "var(--core-primary, #1a1a2e)" }}
        className="w-full text-white py-3.5 rounded-lg font-[var(--font-medium,sans-serif)] text-[15px] hover:opacity-90 transition-all duration-200 shadow-sm mt-2 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            {amount ? `Pay ${amount}` : "Pay Now"}
          </>
        )}
      </button>

      {/* Trust badge */}
      <div className="flex items-center justify-center gap-1.5 mt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[11px] text-gray-400 font-[var(--font-regular,sans-serif)]">
          256-bit SSL encrypted · Secured by Stripe
        </span>
      </div>
    </form>
  );
};

// ─── Public component ─────────────────────────────────────────────────────────
/**
 * StripeCheckout
 *
 * Props:
 *  - cartId                    (string) – cart id sent to createStripePaymentIntent
 *  - publishableKey            (string) – from activeRegion.payment_config.stripe_publishable_key
 *  - onSuccess                 (fn)     – called after successful payment
 *  - createStripePaymentIntent (fn)     – server action: POST { cart_id } → { client_secret }
 *  - amount                    (string) – optional formatted amount string e.g. "₹1,200"
 *  - currency                  (string) – optional e.g. "INR"
 */
export default function StripeCheckout({
  cartId,
  publishableKey,
  onSuccess,
  createStripePaymentIntent,
  amount,
  currency,
}) {
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initialise Stripe with the org's publishable key
  useEffect(() => {
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    }
  }, [publishableKey]);

  // Create a PaymentIntent → get client_secret
  // Backend receives: POST { cart_id: cartId }
  useEffect(() => {
    if (!cartId || !createStripePaymentIntent) return;

    const initIntent = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await createStripePaymentIntent(cartId);

        // Support multiple response shapes from different backend versions
        let secret =
          res?.client_secret ||
          res?.stripe_payment_intent_client_secret ||
          null;

        // Fallback: scan all string values for pi_…_secret_ pattern
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

        if (secret) {
          setClientSecret(secret);
        } else {
          setError("Could not initialize payment. Please try again.");
        }
      } catch (err) {
        console.error("[StripeCheckout] Failed to create payment intent:", err);
        setError(
          err?.message || "Payment initialization failed. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    initIntent();
  }, [cartId, createStripePaymentIntent]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 gap-3 border border-gray-100 rounded-xl bg-gray-50/60">
        <Loader2 className="w-7 h-7 animate-spin text-[var(--core-primary,#1a1a2e)]" />
        <p className="text-sm text-gray-500 font-[var(--font-regular,sans-serif)]">
          Initializing secure payment…
        </p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-3 border border-red-100 rounded-xl bg-red-50/40">
        <p className="text-sm text-red-600 font-[var(--font-medium,sans-serif)] text-center">
          {error || "Payment initialization failed."}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setError("");
            // Re-trigger by re-mounting; consumers should wrap in a key prop
          }}
          className="text-xs underline text-gray-500 hover:text-gray-700"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Stripe Elements appearance ─────────────────────────────────────────────
  const elementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "var(--core-primary, #1a1a2e)",
        colorBackground: "#ffffff",
        colorText: "#1B262E",
        colorDanger: "#ef4444",
        fontFamily: "var(--font-regular, system-ui, sans-serif)",
        borderRadius: "8px",
        spacingUnit: "4px",
      },
      rules: {
        ".Tab": {
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "none",
        },
        ".Tab:hover": {
          color: "var(--core-primary, #1a1a2e)",
          borderColor: "var(--core-primary, #1a1a2e)",
        },
        ".Tab--selected": {
          borderColor: "var(--core-primary, #1a1a2e)",
          boxShadow: "0 0 0 1.5px var(--core-primary, #1a1a2e)",
          color: "var(--core-primary, #1a1a2e)",
          fontWeight: "600",
        },
        ".Input": {
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "10px 12px",
        },
        ".Input:focus": {
          boxShadow: "0 0 0 2px var(--core-primary, #1a1a2e)22",
          borderColor: "var(--core-primary, #1a1a2e)",
        },
        ".Label": {
          fontWeight: "500",
          fontSize: "13px",
          color: "#374151",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-green-600" />
          <span className="text-[13px] font-[var(--font-medium,sans-serif)] text-gray-700">
            Secure Payment
          </span>
        </div>
        {/* Payment method logos */}
        <div className="flex items-center gap-1.5">
          {/* UPI */}
          <div className="h-5 px-1.5 bg-[#2A4BA0] rounded text-white text-[9px] font-bold flex items-center">
            UPI
          </div>
          {/* Visa */}
          <div className="h-5 px-1.5 bg-[#1A1F71] rounded text-white text-[9px] font-bold flex items-center italic">
            VISA
          </div>
          {/* Mastercard */}
          <div className="h-5 w-8 relative flex items-center justify-center">
            <div className="absolute left-0 w-5 h-5 bg-[#EB001B] rounded-full opacity-90" />
            <div className="absolute right-0 w-5 h-5 bg-[#F79E1B] rounded-full opacity-90" />
          </div>
          {/* RuPay */}
          <div className="h-5 px-1.5 bg-[#1B6B3A] rounded text-white text-[9px] font-bold flex items-center">
            RuPay
          </div>
        </div>
      </div>

      {/* Payment form */}
      <div className="p-5">
        <Elements stripe={stripePromise} options={elementsOptions}>
          <CheckoutForm
            onSuccess={onSuccess}
            amount={amount}
            currency={currency}
          />
        </Elements>
      </div>
    </div>
  );
}
