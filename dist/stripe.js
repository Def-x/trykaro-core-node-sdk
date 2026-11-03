import { registerPaymentGateway } from './chunk-UG7KTLQ5.js';
import './chunk-V6TY7KAL.js';
import { useState, useRef, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';

var CheckoutForm = ({ onSuccess, onCancel, amount }) => {
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
        return_url: `${window.location.origin}/account/orders`
      },
      redirect: "if_required"
    });
    if (error) {
      setMessage(error.message || "Payment failed");
      setIsProcessing(false);
    } else {
      setIsProcessing(false);
      onSuccess?.();
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(
      PaymentElement,
      {
        options: {
          layout: {
            type: "tabs",
            defaultCollapsed: false
          },
          terms: {
            card: "never",
            usBankAccount: "never",
            auBecsDebit: "never",
            bancontact: "never",
            ideal: "never",
            sepaDebit: "never",
            sofort: "never"
          },
          wallets: {
            applePay: "auto",
            googlePay: "auto"
          }
        }
      }
    ),
    message && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg", children: [
      /* @__PURE__ */ jsx("span", { className: "mt-0.5", children: "\u26A0" }),
      /* @__PURE__ */ jsx("span", { children: message })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-3 mt-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isProcessing || !stripe || !elements,
          style: { backgroundColor: "var(--core-primary, #1a1a2e)" },
          className: "w-full sm:flex-1 text-white py-3.5 rounded-lg font-[var(--font-medium,sans-serif)] text-[15px] hover:opacity-90 transition-all duration-200 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]",
          children: isProcessing ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
            "Processing\u2026"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4" }),
            amount ? `Pay ${amount}` : "Pay Now"
          ] })
        }
      ),
      onCancel && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onCancel,
          disabled: isProcessing,
          className: "w-full sm:w-auto px-4 py-3.5 text-sm font-[var(--font-medium,sans-serif)] text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200",
          children: "Change Method"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1.5 mt-1", children: [
      /* @__PURE__ */ jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-gray-400" }),
      /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-400 font-[var(--font-regular,sans-serif)]", children: "256-bit SSL encrypted \xB7 Secured by Stripe" })
    ] })
  ] });
};
var StripeCheckout = ({
  cartId,
  publishableKey,
  onSuccess,
  onCancel,
  createStripePaymentIntent,
  amount,
  currency
}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState(null);
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
        let secret = res?.client_secret || res?.stripe_payment_intent_client_secret || null;
        if (!secret && typeof res === "object") {
          for (const key in res) {
            if (typeof res[key] === "string" && res[key].startsWith("pi_") && res[key].includes("_secret_")) {
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
      } catch (err) {
        if (!isSubscribed) return;
        console.error("[StripeCheckout] Failed to create payment intent:", err);
        setError(
          err?.message || "Payment initialization failed. Please try again."
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
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-10 gap-3 text-gray-500 bg-gray-50/50 rounded-lg border border-dashed border-gray-200", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin text-[var(--core-primary,inherit)]" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-[var(--font-regular,sans-serif)]", children: "Initializing secure payment\u2026" })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-medium", children: [
        /* @__PURE__ */ jsx("span", { children: "\u26A0" }),
        /* @__PURE__ */ jsx("span", { children: "Payment Error" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setError("");
            setLoading(true);
            if (createStripePaymentIntent && cartId) {
              createStripePaymentIntent(cartId).then((res) => {
                const s = res?.client_secret || res?.stripe_payment_intent_client_secret;
                if (s) setClientSecret(s);
                else setError("Could not initialize payment.");
              }).catch((e) => setError(e?.message || "Failed to retry.")).finally(() => setLoading(false));
            }
          },
          className: "self-start text-xs font-semibold text-red-700 underline hover:no-underline",
          children: "Try again"
        }
      )
    ] });
  }
  if (!stripePromise || !clientSecret) return null;
  return /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-5", children: /* @__PURE__ */ jsx(
    Elements,
    {
      stripe: stripePromise,
      options: {
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
            spacingUnit: "4px"
          },
          rules: {
            ".Tab": {
              border: "1px solid #e5e7eb",
              boxShadow: "none"
            },
            ".Tab--selected": {
              borderColor: "var(--core-primary, #1a1a2e)",
              borderWidth: "1.5px",
              boxShadow: "none"
            },
            ".Input": {
              border: "1px solid #d1d5db",
              boxShadow: "none"
            },
            ".Input:focus": {
              borderColor: "var(--core-primary, #1a1a2e)",
              boxShadow: "0 0 0 1px var(--core-primary, #1a1a2e)"
            }
          }
        }
      },
      children: /* @__PURE__ */ jsx(
        CheckoutForm,
        {
          onSuccess,
          amount,
          currency
        }
      )
    }
  ) });
};
var StripeCheckout_default = StripeCheckout;

// src/stripe.ts
registerPaymentGateway("stripe", StripeCheckout_default);

export { StripeCheckout_default as StripeCheckout };
//# sourceMappingURL=stripe.js.map
//# sourceMappingURL=stripe.js.map