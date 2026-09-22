"use client";

import React, { useState } from "react";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import { Spinner } from "../ui/Spinner";

/**
 * CartItem
 *
 * Renders a single cart line item with quantity controls and delete button.
 * Calls useAddToCart() internally — no extra props needed for mutations.
 *
 * Props:
 *  - item          line item object from cart.line_items
 *  - renderImage   (item) => ReactNode  — optional custom image renderer
 *  - renderActions (item) => ReactNode  — replaces default +/- controls
 *  - className     string
 */
export const CartItem = ({
    item,
    renderImage = null,
    renderActions = null,
    className = "",
}) => {
    const {
        handleAddToCart,
        handleDecreaseQty,
        handleDeleteLineItem,
        isAddToCartLoading,
        deletingLineItemId,
    } = useAddToCart();
    const { formatCurrency } = useCurrencyFormat();
    const [isDeleting, setIsDeleting] = useState(false);

    const product = item?.line_itemable;
    const name = product?.name ?? item?.name ?? "Product";
    const price = item?.price ?? product?.price ?? 0;
    const quantity = item?.quantity ?? 0;
    const imageUrl =
        product?.product_images?.[0]?.product_image_url ??
        product?.image_url ??
        null;

    const isItemDeleting =
        isDeleting || (Boolean(item?.id) && deletingLineItemId === item?.id);
    const isActionDisabled = isAddToCartLoading || isItemDeleting;

    const handleDelete = async () => {
        if (isActionDisabled) return;
        try {
            setIsDeleting(true);
            await handleDeleteLineItem(item);
        } finally {
            setIsDeleting(false);
        }
    };

    const s = {
        row: {
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            padding: "1rem 0",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
        },
        image: {
            width: 72,
            height: 72,
            objectFit: "cover",
            borderRadius: 8,
            flexShrink: 0,
            background: "#f3f4f6",
        },
        imagePlaceholder: {
            width: 72,
            height: 72,
            borderRadius: 8,
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            flexShrink: 0,
        },
        info: { flex: 1, minWidth: 0 },
        name: {
            fontSize: "0.9rem",
            fontWeight: 600,
            margin: "0 0 0.25rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        price: { fontSize: "0.85rem", opacity: 0.7, margin: 0 },
        controls: {
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "0.5rem",
        },
        qtyBtn: {
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "1px solid rgba(0,0,0,0.15)",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            fontWeight: 700,
            lineHeight: 1,
        },
        qty: { fontSize: "0.9rem", fontWeight: 600, minWidth: 20, textAlign: "center" },
        deleteBtn: {
            marginLeft: "auto",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            opacity: 0.5,
            fontSize: "1.1rem",
            padding: "0.25rem",
            borderRadius: 4,
            transition: "opacity 0.15s",
        },
    };

    return (
        <div style={s.row} className={className}>
            {/* Image */}
            {renderImage ? (
                renderImage(item)
            ) : imageUrl ? (
                <img src={imageUrl} alt={name} style={s.image} />
            ) : (
                <div style={s.imagePlaceholder}>🛍️</div>
            )}

            {/* Info */}
            <div style={s.info}>
                <p style={s.name} title={name}>{name}</p>
                <p style={s.price}>{formatCurrency(price)} × {quantity}</p>

                {/* Controls */}
                {renderActions ? (
                    renderActions(item)
                ) : (
                    <div style={s.controls}>
                        <button
                            style={s.qtyBtn}
                            onClick={() => handleDecreaseQty(product)}
                            disabled={isActionDisabled}
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <span style={s.qty}>
                            {isItemDeleting || isAddToCartLoading ? <Spinner size="sm" /> : quantity}
                        </span>
                        <button
                            style={s.qtyBtn}
                            onClick={() => handleAddToCart(product)}
                            disabled={isActionDisabled}
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>
                )}
            </div>

            {/* Delete */}
            <button
                style={{
                    ...s.deleteBtn,
                    ...(isActionDisabled
                        ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }
                        : {}),
                }}
                onClick={handleDelete}
                disabled={isActionDisabled}
                aria-label="Remove item"
                title="Remove"
            >
                {isItemDeleting ? <Spinner size="sm" /> : "✕"}
            </button>
        </div>
    );
};
