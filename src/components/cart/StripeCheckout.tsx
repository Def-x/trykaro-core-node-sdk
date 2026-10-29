"use client";

import React, { useState, useEffect, useRef } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, Lock, ShieldCheck } from "lucide-react";

interface CheckoutFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  amount?: string;
  currency?: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess, onCancel, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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
      setMessage(error.message || "Payment failed");
      setIsProcessing(false);
    } else {
      setIsProcessing(false);
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement
        options={{
          layout: {
            type: "tabs",
            defaultCollapsed: false,
          },
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

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
        <button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          style={{ backgroundColor: "var(--core-primary, #1a1a2e)" }}
          className="w-full sm:flex-1 text-white py-3.5 rounded-lg font-[var(--font-medium,sans-serif)] text-[15px] hover:opacity-90 transition-all duration-200 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
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

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-3.5 text-sm font-[var(--font-medium,sans-serif)] text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            Change Method
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[11px] text-gray-400 font-[var(--font-regular,sans-serif)]">
          256-bit SSL encrypted · Secured by Stripe
        </span>
      </div>
    </form>
  );
};

export interface StripeCheckoutProps {
  cartId?: string | number;
  publishableKey?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  createStripePaymentIntent?: (cartId: string | number) => Promise<any>;
  amount?: string;
  currency?: string;
}

/**
 * StripeCheckout
 *
 * Embeddable Stripe payment form supporting cards, Apple Pay, Google Pay, and localized methods.
 */
export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  cartId,
  publishableKey,
  onSuccess,
  onCancel,
  createStripePaymentIntent,
  amount,
  currency,
}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const createIntentRef = useRef(createStripePaymentIntent);
  createIntentRef.current = createStripePaymentIntent;

  useEffect(() => {
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    }
  }, [publishableKey]);

  useEffect(() => {
    const createFn = createIntentRef.current;
    if (!createFn) {
      setError("Stripe payment action is not configured.");
      setLoading(false);
      return;
    }
    if (!cartId) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    const initIntent = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await createFn(cartId);
        if (!isSubscribed) return;

        let secret =
          res?.client_secret ||
          res?.stripe_payment_intent_client_secret ||
          null;

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
          setError(res?.error || res?.message || "Could not initialize payment. Please try again.");
        }
      } catch (err: any) {
        if (!isSubscribed) return;
        console.error("[StripeCheckout] Failed to create payment intent:", err);
        setError(
          err?.message || "Payment initialization failed. Please try again.",
        );
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    initIntent();

    return () => {
      isSubscribed = false;
    };
  }, [cartId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--core-primary,inherit)]" />
        <span className="text-sm font-[var(--font-regular,sans-serif)]">
          Initializing secure payment…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        <div className="flex items-center gap-2 font-medium">
          <span>⚠</span>
          <span>Payment Error</span>
        </div>
        <p className="text-xs text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError("");
            setLoading(true);
            if (createStripePaymentIntent && cartId) {
              createStripePaymentIntent(cartId)
                .then((res: any) => {
                  const s =
                    res?.client_secret ||
                    res?.stripe_payment_intent_client_secret;
                  if (s) setClientSecret(s);
                  else setError("Could not initialize payment.");
                })
                .catch((e: any) => setError(e?.message || "Failed to retry."))
                .finally(() => setLoading(false));
            }
          }}
          className="self-start text-xs font-semibold text-red-700 underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!stripePromise || !clientSecret) return null;

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "var(--core-primary, #1a1a2e)",
              colorBackground: "#ffffff",
              colorText: "#1a1a2e",
              colorDanger: "#ef4444",
              fontFamily: "var(--font-regular, -apple-system, BlinkMacSystemFont, sans-serif)",
              borderRadius: "8px",
              spacingUnit: "4px",
            },
            rules: {
              ".Tab": {
                border: "1px solid #e5e7eb",
                boxShadow: "none",
              },
              ".Tab--selected": {
                borderColor: "var(--core-primary, #1a1a2e)",
                borderWidth: "1.5px",
                boxShadow: "none",
              },
              ".Input": {
                border: "1px solid #d1d5db",
                boxShadow: "none",
              },
              ".Input:focus": {
                borderColor: "var(--core-primary, #1a1a2e)",
                boxShadow: "0 0 0 1px var(--core-primary, #1a1a2e)",
              },
            },
          },
        }}
      >
        <CheckoutForm
          onSuccess={onSuccess}
          amount={amount}
          currency={currency}
        />
      </Elements>
    </div>
  );
};

export default StripeCheckout;

