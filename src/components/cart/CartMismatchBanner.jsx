"use client";

import React from "react";
import { useCart } from "../../hooks/useCart";

/**
 * CartMismatchBanner
 *
 * Renders a fixed amber top-banner when the cart total changed between
 * the user viewing the cart and clicking Pay (e.g. a coupon expired).
 *
 * Clicking "Refresh Cart" immediately hydrates CoreProvider's cart state
 * with the pre-fetched `freshCart` object — no extra API call needed.
 *
 * Props:
 *  serverTotal  {number}   – Fresh total from the server (in paise/cents)
 *  clientTotal  {number}   – Stale total that was visible in the UI (in paise/cents)
 *  freshCart    {object}   – Full cart object returned by the validation fetch
 *  onDismiss    {function} – Called when the banner is dismissed
 *  currency     {string}   – e.g. "INR"  (default)
 *  locale       {string}   – e.g. "en-IN" (default)
 */
export default function CartMismatchBanner({
  serverTotal,
  clientTotal,
  freshCart,
  onDismiss,
  currency = "INR",
  locale = "en-IN",
}) {
  const { setCart } = useCart();

  const fmt = (amount) => {
    if (amount == null) return "—";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  };

  const handleRefresh = () => {
    // Use the cart we already fetched during validation — zero extra API calls.
    if (freshCart) setCart(freshCart);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        backgroundColor: "#fffbeb",
        borderBottom: "2px solid #f59e0b",
        padding: "12px 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* Icon */}
      <span
        style={{
          fontSize: "1.25rem",
          lineHeight: 1,
          marginTop: "2px",
          flexShrink: 0,
        }}
      >
        ⚠️
      </span>

      {/* Message */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            color: "#78350f",
            fontSize: "0.9rem",
          }}
        >
          Your cart total has changed
        </p>
        <p
          style={{
            margin: "2px 0 0",
            color: "#92400e",
            fontSize: "0.8rem",
            lineHeight: 1.4,
          }}
        >
          A coupon or offer on your cart has expired.
          {serverTotal != null && clientTotal != null
            ? ` Your updated total is ${fmt(freshCart ? freshCart.display_total : serverTotal / 100)} (was ${fmt(clientTotal / 100)}).`
            : ""}{" "}
          Please refresh and review before paying.
        </p>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        <button
          onClick={handleRefresh}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#f59e0b",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🔄 Refresh Cart
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "none",
            color: "#b45309",
            fontSize: "1rem",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
