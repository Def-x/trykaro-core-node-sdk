"use client";

import React from "react";
import { useCart } from "../../hooks/useCart";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";

/**
 * CartPage
 *
 * Full cart page component.
 * Reads cart state from CoreProvider — no props required for data fetching.
 *
 * Props:
 *  - className          string — wrapper class
 *  - header             ReactNode — custom header (replaces default "Your Cart" h1)
 *  - emptyState         ReactNode — replaces default empty cart message
 *  - renderItem         (item) => ReactNode  — custom line item renderer
 *  - renderSummary      () => ReactNode      — replaces CartSummary
 *  - renderCheckoutBtn  () => ReactNode      — checkout CTA inside summary
 *  - summaryLabels      object — forwarded to <CartSummary labels={...} />
 */
export const CartPage = ({
    className = "",
    header = null,
    emptyState = null,
    renderItem = null,
    renderSummary = null,
    renderCheckoutBtn = null,
    summaryLabels = {},
}) => {
    const { cart, isCartLoading } = useCart();

    const lineItems = cart?.line_items ?? [];
    const isEmpty = !isCartLoading && lineItems.length === 0;

    const s = {
        page: {
            maxWidth: 900,
            margin: "0 auto",
            padding: "2rem 1rem",
            fontFamily: "inherit",
        },
        heading: {
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
        },
        layout: {
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2rem",
        },
        layoutDesktop: {
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "2rem",
        },
        loadingWrapper: {
            display: "flex",
            justifyContent: "center",
            padding: "4rem 0",
        },
        items: {},
    };

    // Responsive layout via inline media check (window width)
    const [isWide, setIsWide] = React.useState(
        typeof window !== "undefined" ? window.innerWidth >= 768 : true
    );

    React.useEffect(() => {
        const handleResize = () => setIsWide(window.innerWidth >= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (isCartLoading) {
        return (
            <div style={s.page} className={className}>
                {header ?? <h1 style={s.heading}>Your Cart</h1>}
                <div style={s.loadingWrapper}>
                    <Spinner size="lg" />
                </div>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div style={s.page} className={className}>
                {header ?? <h1 style={s.heading}>Your Cart</h1>}
                {emptyState ?? (
                    <EmptyState
                        icon="🛒"
                        title="Your cart is empty"
                        description="Add items from the store to get started."
                    />
                )}
            </div>
        );
    }

    return (
        <div style={s.page} className={className}>
            {header ?? <h1 style={s.heading}>Your Cart</h1>}

            <div style={isWide ? s.layoutDesktop : s.layout}>
                {/* Line items */}
                <div style={s.items}>
                    {lineItems.map((item) =>
                        renderItem ? (
                            <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
                        ) : (
                            <CartItem key={item.id} item={item} />
                        )
                    )}
                </div>

                {/* Summary */}
                {renderSummary ? (
                    renderSummary()
                ) : (
                    <CartSummary
                        labels={summaryLabels}
                        renderFooter={renderCheckoutBtn}
                    />
                )}
            </div>
        </div>
    );
};
