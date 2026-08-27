import { registerPaymentGateway } from './chunk-UP7U6KB6.js';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';

var CheckoutForm = ({ onSuccess, amount, currency }) => {
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
      setMessage(error.message);
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
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        disabled: isProcessing || !stripe || !elements,
        style: { backgroundColor: "var(--core-primary, #1a1a2e)" },
        className: "w-full text-white py-3.5 rounded-lg font-[var(--font-medium,sans-serif)] text-[15px] hover:opacity-90 transition-all duration-200 shadow-sm mt-2 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]",
        children: isProcessing ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
          "Processing\u2026"
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4" }),
          amount ? `Pay ${amount}` : "Pay Now"
        ] })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1.5 mt-1", children: [
      /* @__PURE__ */ jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-gray-400" }),
      /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-400 font-[var(--font-regular,sans-serif)]", children: "256-bit SSL encrypted \xB7 Secured by Stripe" })
    ] })
  ] });
};
function StripeCheckout({
  cartId,
  publishableKey,
  onSuccess,
  createStripePaymentIntent,
  amount,
  currency
}) {
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    }
  }, [publishableKey]);
  useEffect(() => {
    if (!cartId || !createStripePaymentIntent) return;
    const initIntent = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await createStripePaymentIntent(cartId);
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
          setError("Could not initialize payment. Please try again.");
        }
      } catch (err) {
        console.error("[StripeCheckout] Failed to create payment intent:", err);
        setError(
          err?.message || "Payment initialization failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    initIntent();
  }, [cartId, createStripePaymentIntent]);
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center p-10 gap-3 border border-gray-100 rounded-xl bg-gray-50/60", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-7 h-7 animate-spin text-[var(--core-primary,#1a1a2e)]" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 font-[var(--font-regular,sans-serif)]", children: "Initializing secure payment\u2026" })
    ] });
  }
  if (error || !clientSecret) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center p-8 gap-3 border border-red-100 rounded-xl bg-red-50/40", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 font-[var(--font-medium,sans-serif)] text-center", children: error || "Payment initialization failed." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setLoading(true);
            setError("");
          },
          className: "text-xs underline text-gray-500 hover:text-gray-700",
          children: "Try again"
        }
      )
    ] });
  }
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
        spacingUnit: "4px"
      },
      rules: {
        ".Tab": {
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "none"
        },
        ".Tab:hover": {
          color: "var(--core-primary, #1a1a2e)",
          borderColor: "var(--core-primary, #1a1a2e)"
        },
        ".Tab--selected": {
          borderColor: "var(--core-primary, #1a1a2e)",
          boxShadow: "0 0 0 1.5px var(--core-primary, #1a1a2e)",
          color: "var(--core-primary, #1a1a2e)",
          fontWeight: "600"
        },
        ".Input": {
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "10px 12px"
        },
        ".Input:focus": {
          boxShadow: "0 0 0 2px var(--core-primary, #1a1a2e)22",
          borderColor: "var(--core-primary, #1a1a2e)"
        },
        ".Label": {
          fontWeight: "500",
          fontSize: "13px",
          color: "#374151"
        }
      }
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50/50", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 text-green-600" }),
        /* @__PURE__ */ jsx("span", { className: "text-[13px] font-[var(--font-medium,sans-serif)] text-gray-700", children: "Secure Payment" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("div", { className: "h-5 px-1.5 bg-[#2A4BA0] rounded text-white text-[9px] font-bold flex items-center", children: "UPI" }),
        /* @__PURE__ */ jsx("div", { className: "h-5 px-1.5 bg-[#1A1F71] rounded text-white text-[9px] font-bold flex items-center italic", children: "VISA" }),
        /* @__PURE__ */ jsxs("div", { className: "h-5 w-8 relative flex items-center justify-center", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute left-0 w-5 h-5 bg-[#EB001B] rounded-full opacity-90" }),
          /* @__PURE__ */ jsx("div", { className: "absolute right-0 w-5 h-5 bg-[#F79E1B] rounded-full opacity-90" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-5 px-1.5 bg-[#1B6B3A] rounded text-white text-[9px] font-bold flex items-center", children: "RuPay" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsx(Elements, { stripe: stripePromise, options: elementsOptions, children: /* @__PURE__ */ jsx(
      CheckoutForm,
      {
        onSuccess,
        amount,
        currency
      }
    ) }) })
  ] });
}

// src/stripe.js
registerPaymentGateway("stripe", StripeCheckout);

export { StripeCheckout };
//# sourceMappingURL=stripe.js.map
//# sourceMappingURL=stripe.js.map