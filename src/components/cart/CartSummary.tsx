"use client";

import React from "react";
import { useCart } from "../../hooks/useCart";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";

/**
 * CartSummary
 *
 * Order summary panel — subtotal, item count, totals.
 *
 * Props:
 *  - className      string
 *  - renderFooter   () => ReactNode — renders below the totals (e.g. checkout btn)
 *  - labels         object — override default label strings
 *    { subtotal, shipping, tax, total, itemCount, estimatedShipping }
 */
interface CartSummaryLabels {
  subtotal?: string;
  shipping?: string;
  tax?: string;
  total?: string;
  itemCount?: string;
  estimatedShipping?: string;
}

interface CartSummaryProps {
  className?: string;
  renderFooter?: (() => React.ReactNode) | null;
  labels?: CartSummaryLabels;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
    className = "",
    renderFooter = null,
    labels = {},
}) => {
    const { cart } = useCart();
    const { formatCurrency } = useCurrencyFormat();

    const l: Required<CartSummaryLabels> = {
        subtotal: "Subtotal",
        shipping: "Shipping",
        tax: "Tax",
        total: "Total",
        itemCount: "items",
        estimatedShipping: "Calculated at checkout",
        ...labels,
    };

    const itemCount = cart?.item_count ?? cart?.line_items?.length ?? 0;
    const itemTotal = cart?.item_total ?? 0;
    const shipTotal = cart?.ship_total ?? 0;
    const taxTotal = cart?.tax_total ?? 0;
    const grandTotal = cart?.total ?? itemTotal + shipTotal + taxTotal;

    const s: Record<string, React.CSSProperties> = {
        wrapper: {
            background: "rgba(0,0,0,0.03)",
            borderRadius: 12,
            padding: "1.25rem",
        },
        row: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.4rem 0",
            fontSize: "0.875rem",
        },
        label: { opacity: 0.7 },
        divider: {
            height: 1,
            background: "rgba(0,0,0,0.1)",
            margin: "0.5rem 0",
        },
        totalRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.5rem 0",
            fontWeight: 700,
            fontSize: "1rem",
        },
    };

    return (
        <div style={s.wrapper} className={className}>
            <div style={s.row}>
                <span style={s.label}>
                    {l.subtotal} ({itemCount} {l.itemCount})
                </span>
                <span>{formatCurrency(itemTotal)}</span>
            </div>

            <div style={s.row}>
                <span style={s.label}>{l.shipping}</span>
                <span>{shipTotal > 0 ? formatCurrency(shipTotal) : l.estimatedShipping}</span>
            </div>

            {taxTotal > 0 && (
                <div style={s.row}>
                    <span style={s.label}>{l.tax}</span>
                    <span>{formatCurrency(taxTotal)}</span>
                </div>
            )}

            <div style={s.divider} />

            <div style={s.totalRow}>
                <span>{l.total}</span>
                <span>{formatCurrency(grandTotal)}</span>
            </div>

            {renderFooter?.()}
        </div>
    );
};
