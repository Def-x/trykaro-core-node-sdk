"use client";

import { useState } from "react";
import { useCore } from "../context/CoreProvider";

/**
 * useAddToCart()
 *
 * Production-ready cart mutation hook.
 * ⚡ Zero Next.js / Clerk / store-specific imports.
 *
 * All API calls are resolved through injected `actions` in CoreProvider:
 *  actions.getCart(regionId)                       → cart[]
 *  actions.getCartById(cartId, regionId)           → cart
 *  actions.createCart(payload)                     → cart
 *  actions.createLineItem(payload)                 → lineItem
 *  actions.updateLineItem(lineItemId, payload)     → lineItem
 *  actions.deleteLineItem(lineItemId)              → void
 *
 * Auth awareness is handled via injected `auth`:
 *  auth.isSignedIn  → boolean
 *
 * Toast notifications are handled via injected `toast`:
 *  toast.success(msg)
 *  toast.error(msg)
 */
export function useAddToCart() {
    const { cart, setCart, actions, toast, auth, config } = useCore();
    const [quantity, setQuantity] = useState(1);
    const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);

    const isSignedIn = auth?.isSignedIn ?? false;
    const regionId = config?.regionId ?? null;

    // ─── Helpers ────────────────────────────────────────────────────────────

    /** Returns the existing line item for a product, or null */
    const getCartItem = (product) => {
        console.log("getCartItem", { product, cart })
        if (!cart?.line_items) return null;
        return (
            cart.line_items.find(
                (item) => item.line_itemable?.id === product?.id
            ) ?? null
        );
    };

    /** Re-fetch the cart after a mutation and sync context */
    const refreshCart = async (cartId) => {
        console.log("refersh cart", { cartId, isSignedIn })
        try {
            let updatedCart;
            if (isSignedIn) {
                const data = await actions.getCart?.(regionId);
                updatedCart = Array.isArray(data) ? data[0] : data;
            } else {
                updatedCart = await actions.getCartById?.(cartId, regionId);
            }

            console.log({ updatedCart })
            setCart(updatedCart ?? null);
        } catch (err) {
            console.error("[useAddToCart] refreshCart error:", err);
        }
    };

    // ─── Internal: add or update a line item ────────────────────────────────
    const addItemToCart = async (product, resolvedCartId) => {
        console.log("addItemToCart", { product, resolvedCartId })
        const sellingQTY = product?.selling_quantity?.values?.[0]?.label;
        const qty = quantity ?? 1;

        const existingLineItem = getCartItem(product);

        if (existingLineItem) {
            // Quantity already exists → increment
            const newQty = existingLineItem.quantity + qty;
            await actions.updateLineItem?.(existingLineItem.id, { quantity: newQty });
        } else {
            // New line item
            const body = {
                line_itemable_id: product?.id,
                quantity: qty,
                ...(resolvedCartId && !isSignedIn ? { cart_id: resolvedCartId } : {}),
                ...(regionId ? { region_id: regionId } : {}),
            };
            console.log({ body })
            await actions.createLineItem?.(body);
        }

        // Reset quantity to selling-unit default
        setQuantity(sellingQTY ? Number(sellingQTY) : 1);

        // Always refresh to keep context in sync
        if (resolvedCartId) {
            await refreshCart(resolvedCartId);
        }
    };

    // ─── Public API ─────────────────────────────────────────────────────────

    /**
     * Add a product to the cart.
     * Creates a cart first if one doesn't exist yet.
     */
    const handleAddToCart = async (product) => {
        try {
            setIsAddToCartLoading(true);

            const storedCartId =
                typeof window !== "undefined"
                    ? localStorage.getItem("cartid")
                    : null;

            let resolvedCartId = cart?.id ?? storedCartId;
            console.log("handleAddToCart before cart check", { cart, storedCartId, resolvedCartId, storedCartId })
            // Create cart if needed
            if (!cart) {
                const payload = {
                    number: "",
                    item_total: 0,
                    total: 0,
                    currency: "",
                    cart_sales_channels: "web",
                    order_type: "delivery",
                    ...(regionId ? { region_id: regionId } : {}),
                };

                const createdCart = await actions.createCart?.(payload);
                console.log("handleAddToCart", { createdCart })
                if (createdCart?.id) {
                    resolvedCartId = createdCart.id;
                    if (!isSignedIn) {
                        localStorage.setItem("cartid", createdCart.id);
                    }
                    setCart(createdCart);
                }
            }

            await addItemToCart(product, resolvedCartId);

            toast?.success?.("Item added to cart");
        } catch (err) {
            console.error("[useAddToCart] handleAddToCart error:", err);
            toast?.error?.("Failed to add item to cart");
        } finally {
            setIsAddToCartLoading(false);
        }
    };

    /**
     * Decrease quantity by 1.
     * Deletes the line item entirely if quantity reaches 0.
     */
    const handleDecreaseQty = async (product) => {
        const existingLineItem = getCartItem(product);
        if (!existingLineItem) return;

        try {
            setIsAddToCartLoading(true);

            if (existingLineItem.quantity <= 1) {
                await actions.deleteLineItem?.(existingLineItem.id);
            } else {
                await actions.updateLineItem?.(existingLineItem.id, {
                    quantity: existingLineItem.quantity - 1,
                });
            }

            const activeCartId = cart?.id;
            if (activeCartId) {
                await refreshCart(activeCartId);
            }
        } catch (err) {
            console.error("[useAddToCart] handleDecreaseQty error:", err);
        } finally {
            setIsAddToCartLoading(false);
        }
    };

    /**
     * Remove a line item entirely from the cart.
     */
    const handleDeleteLineItem = async (product) => {
        const existingLineItem = getCartItem(product);
        if (!existingLineItem) return;

        try {
            setIsAddToCartLoading(true);
            await actions.deleteLineItem?.(existingLineItem.id);

            const activeCartId = cart?.id;
            if (activeCartId) {
                await refreshCart(activeCartId);
            }

            toast?.success?.("Item removed from cart");
        } catch (err) {
            console.error("[useAddToCart] handleDeleteLineItem error:", err);
            toast?.error?.("Failed to remove item");
        } finally {
            setIsAddToCartLoading(false);
        }
    };

    return {
        handleAddToCart,
        handleDecreaseQty,
        handleDeleteLineItem,
        getCartItem,
        quantity,
        setQuantity,
        isAddToCartLoading,
    };
}
