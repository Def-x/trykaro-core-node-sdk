"use client";

import React from "react";
import { useCart } from "../../hooks/useCart";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import { useCore } from "../../context/CoreProvider";

/**
 * CartMismatchBanner
 *
 * Renders a fixed amber top-banner when the cart total changed between
 * the user viewing the cart and clicking Pay (e.g. a coupon expired).
 *
 * Uses the exact same `display_total` key displayed in the cart and
 * checkout views, and formats using `useCurrencyFormat`.
 *
 * Clicking "Refresh Cart" immediately hydrates CoreProvider's cart state
 * with the pre-fetched `freshCart` object — updating `display_total` in the UI.
 *
 * Props:
 *  display_total {number|string} – Fresh display_total from server
 *  serverTotal   {number|string} – Fresh total from server
 *  clientTotal   {number|string} – Stale display_total visible in UI
 *  freshCart     {object}        – Full cart object returned by validation fetch
 *  onDismiss     {function}      – Called when banner is dismissed
 */
export default function CartMismatchBanner({
  display_total,
  serverTotal,
  clientTotal,
  freshCart,
  onDismiss,
}) {
  const { setCart } = useCart();
  const { formatCurrency } = useCurrencyFormat();
  const { actions, config } = useCore();

  // Same key for display total as shown in cart: display_total
  const updatedTotal = freshCart?.display_total ?? display_total ?? serverTotal;
  const currentTotal = clientTotal;

  const handleRefresh = async () => {
    // Hydrate cart with freshCart containing updated display_total
    if (freshCart) {
      setCart(freshCart);
    } else if (actions?.getCart) {
      try {
        const updated = await actions.getCart(config?.regionId);
        const resolvedCart = Array.isArray(updated) ? updated[0] : updated;
        if (resolvedCart) setCart(resolvedCart);
      } catch (err) {
        console.error("[CartMismatchBanner] Failed to refresh cart:", err);
      }
    }
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
          {updatedTotal != null && currentTotal != null ? (
            <>
              {" "}Your updated total is{" "}
              <strong>{formatCurrency(updatedTotal)}</strong>
              {" "}(was {formatCurrency(currentTotal)}).
            </>
          ) : null}{" "}
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
