"use client";

import { useState } from "react";
import { useCore } from "../context/CoreProvider";
import { trackAddToCart, trackCustomEvent, buildItem } from "../lib/gtm";

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
    const cartItems = cart?.line_items ?? [];

    // ─── Helpers ────────────────────────────────────────────────────────────
    /** Normalize customizations into a standard format: [{ id, value }] */
    const normalizeCustomizations = (c) => {
        if (!c) return [];
        if (Array.isArray(c)) {
            return c.map((item) => ({
                id: item.product_customization_id || item.id,
                value: item.value,
            }));
        }
        if (typeof c === "object") {
            return Object.entries(c).map(([id, val]) => ({
                id: parseInt(id),
                value: typeof val === "object" ? val?.value : val,
            }));
        }
        return [];
    };

    /** Compare two sets of customizations for equality */
    const areCustomizationsEqual = (c1, c2) => {
        const norm1 = normalizeCustomizations(c1);
        const norm2 = normalizeCustomizations(c2);

        if (norm1.length !== norm2.length) return false;

        // Sort by id for consistent comparison
        norm1.sort((a, b) => a.id - b.id);
        norm2.sort((a, b) => a.id - b.id);

        return norm1.every(
            (item, index) =>
                item.id === norm2[index].id &&
                String(item.value) === String(norm2[index].value)
        );
    };

    /** Returns the existing line item for a product + customizations, or null */
    const getCartItem = (product, customizations = []) => {
        if (!cart?.line_items) return null;
        return (
            cart.line_items.find(
                (item) =>
                    item.line_itemable?.id === product?.id &&
                    areCustomizationsEqual(item.line_items_customizations, customizations)
            ) ?? null
        );
    };

    /** Re-fetch the cart after a mutation and sync context */
    const refreshCart = async (cartId) => {
        try {
            let updatedCart;
            if (isSignedIn) {
                const data = await actions.getCart?.(regionId);
                updatedCart = Array.isArray(data) ? data[0] : data;
            } else {
                updatedCart = await actions.getCartById?.(cartId, regionId);
            }
            console.log("refreshCart", { updatedCart })
            setCart(updatedCart ?? null);
        } catch (err) {
            console.error("[useAddToCart] refreshCart error:", err);
        }
    };

    // ─── Internal: add or update a line item ────────────────────────────────
    const addItemToCart = async (product, resolvedCartId, customizations = [], overrideQty = null) => {
        console.log({ product, resolvedCartId, customizations, overrideQty })
        const sellingQTY = product?.selling_quantity?.values?.[0]?.label;
        const qty = overrideQty !== null ? overrideQty : (quantity ?? 1);
        const existingLineItem = getCartItem(product, customizations);
        
        if (existingLineItem && !sellingQTY) {
            // Quantity already exists and no sellingQTY → increment
            const newQty = existingLineItem.quantity + qty;
            await actions.updateLineItem?.(existingLineItem.id, { quantity: newQty });
        } else {
            // New line item
            const body = {
                line_itemable_id: product?.id,
                quantity: qty,
                line_items_customizations: customizations,
                ...(resolvedCartId && !isSignedIn ? { cart_id: resolvedCartId } : {}),
                ...(regionId ? { region_id: regionId } : {}),
            };

            await actions.createLineItem?.(body);
        }

        // Reset quantity to selling-unit default
        setQuantity(sellingQTY ? Number(sellingQTY) : 1);
        console.log({ resolvedCartId })
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
    const handleAddToCart = async (product, customizations = [], overrideQty = null) => {
        console.log({ product, customizations, overrideQty })
        try {
            setIsAddToCartLoading(true);

            const storedCartId =
                typeof window !== "undefined"
                    ? localStorage.getItem("cartid")
                    : null;

            let resolvedCartId = cart?.id ?? storedCartId;
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
                if (createdCart?.id) {
                    resolvedCartId = createdCart.id;
                    if (!isSignedIn) {
                        localStorage.setItem("cartid", createdCart.id);
                    }
                    console.log("createdCart", { createdCart })
                    setCart(createdCart);
                }
            }

            await addItemToCart(product, resolvedCartId, customizations, overrideQty);

            // ── GA4 via GTM ───────────────────────────────────────────────
            const userId = auth?.user?.id ?? auth?.user?.userId ?? null;
            const currency = config?.currency ?? "INR";
            const qty = overrideQty !== null ? overrideQty : (quantity ?? 1);
            trackAddToCart({ userId, product, qty, currency });
            // ───────────────────────────────────────────────────────────────

            toast?.success?.(`${product?.name || "Item"} added to cart`);
        } catch (err) {
            console.error("[useAddToCart] handleAddToCart error:", err);
            const errorMsg = err?.data?.error || err?.message;
            if (errorMsg && typeof errorMsg === "string") {
                toast?.error?.(errorMsg);
            } else {
                toast?.error?.(`Failed to add ${product?.name || "item"} to cart`);
            }
        } finally {
            setIsAddToCartLoading(false);
        }
    };

    /**
     * Decrease quantity by 1.
     * Deletes the line item entirely if quantity reaches 0.
     */
    const handleDecreaseQty = async (product, customizations = []) => {
        const existingLineItem = getCartItem(product, customizations);
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
            const errorMsg = err?.data?.error || err?.message;
            if (errorMsg && typeof errorMsg === "string") {
                toast?.error?.(errorMsg);
            } else {
                toast?.error?.("Failed to update item quantity");
            }
        } finally {
            setIsAddToCartLoading(false);
        }
    };

    /**
     * Remove a line item entirely from the cart.
     */
    const handleDeleteLineItem = async (product) => {

        try {
            // setIsAddToCartLoading(true);
            await actions.deleteLineItem?.(product?.id);

            const activeCartId = cart?.id;
            if (activeCartId) {
                await refreshCart(activeCartId);
            }

            // ── GA4 via GTM (remove_from_cart) ────────────────────────────────
            const userId = auth?.user?.id ?? auth?.user?.userId ?? null;
            const currency = config?.currency ?? "INR";
            trackCustomEvent(
                "remove_from_cart",
                userId,
                {
                    currency,
                    value: Number(product?.line_itemable?.price ?? 0) * (product?.quantity ?? 1),
                    items: [buildItem(product, product?.quantity ?? 1)],
                }
            );
            // ───────────────────────────────────────────────────────────────

            toast?.success?.(`${product?.line_itemable?.name || "Item"} removed from cart`);
        } catch (err) {
            console.error("[useAddToCart] handleDeleteLineItem error:", err);
            const errorMsg = err?.data?.error || err?.message;
            if (errorMsg && typeof errorMsg === "string") {
                toast?.error?.(errorMsg);
            } else {
                toast?.error?.(`Failed to remove ${product?.line_itemable?.name || "item"}`);
            }
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
        cartItems,
        cart
    };
}
