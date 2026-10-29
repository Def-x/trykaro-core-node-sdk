"use client";

import { useState } from "react";
import { useCore } from "../context/CoreProvider";
import { trackAddToCart, trackCustomEvent, buildItem } from "../lib/gtm";
import { trackMetaAddToCart } from "../lib/metaPixel";

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
  const [deletingLineItemId, setDeletingLineItemId] = useState<any>(null);

  const userToken = auth?.token ?? auth?.access_token ?? null;
  const isActuallySignedIn = !!((auth?.isSignedIn ?? false) && userToken);
  const regionId = config?.regionId ?? null;
  const cartItems = cart?.line_items ?? [];

  // ─── Helpers ────────────────────────────────────────────────────────────
  /** Normalize customizations into a standard format: [{ id, value }] */
  const normalizeCustomizations = (
    c: Array<{ id?: number | string; value?: unknown; product_customization_id?: number | string }> | Record<string, unknown> | null | undefined
  ) => {
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
        value: typeof val === "object" ? (val as any)?.value : val,
      }));
    }
    return [];
  };

  /** Compare two sets of customizations for equality */
  const areCustomizationsEqual = (c1: any, c2: any) => {
    const norm1 = normalizeCustomizations(c1);
    const norm2 = normalizeCustomizations(c2);

    if (norm1.length !== norm2.length) return false;

    // Sort by id for consistent comparison
    norm1.sort((a: any, b: any) => a.id - b.id);
    norm2.sort((a: any, b: any) => a.id - b.id);

    return norm1.every(
      (item: any, index: number) =>
        item.id === norm2[index].id &&
        String(item.value) === String(norm2[index].value),
    );
  };

  /** Returns the existing line item for a product + customizations, or null */
  const getCartItem = (product: any, customizations: any[] = []) => {
    if (!cart?.line_items) return null;
    return (
      cart.line_items.find(
        (item: any) =>
          item.line_itemable?.id === product?.id &&
          areCustomizationsEqual(
            item.line_items_customizations,
            customizations,
          ),
      ) ?? null
    );
  };

  /** Re-fetch the cart after a mutation and sync context */
  const refreshCart = async (cartId: any) => {
    try {
      let updatedCart;
      if (isActuallySignedIn && userToken) {
        const data = await actions.getCart?.(regionId, { token: userToken });
        updatedCart = Array.isArray(data) ? data[0] : data;
      } else if (cartId) {
        updatedCart = await actions.getCartById?.(cartId, regionId);
      }

      setCart(updatedCart ?? null);
    } catch (err) {
      console.error("[useAddToCart] refreshCart error:", err);
    }
  };

  // ─── Internal: add or update a line item ────────────────────────────────
  const addItemToCart = async (
    product: any,
    resolvedCartId: any,
    customizations: any[] = [],
    overrideQty: number | null = null,
  ) => {
    const sellingQTY = product?.selling_quantity?.values?.[0]?.label;
    const qty = overrideQty !== null ? overrideQty : (quantity ?? 1);
    const existingLineItem = getCartItem(product, customizations);

    if (existingLineItem && !sellingQTY) {
      // Quantity already exists and no sellingQTY → increment
      const newQty = existingLineItem.quantity + qty;
      await actions.updateLineItem?.(
        existingLineItem.id,
        { quantity: newQty },
        { token: userToken },
      );
    } else {
      // New line item: only send cart_id when user is not logged in
      const body = {
        line_itemable_id: product?.id,
        quantity: qty,
        line_items_customizations: customizations,
        ...(resolvedCartId && !isActuallySignedIn
          ? { cart_id: resolvedCartId }
          : {}),
        ...(regionId ? { region_id: regionId } : {}),
      };

      await actions.createLineItem?.(body, { token: userToken });
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
  const handleAddToCart = async (
    product: any,
    customizations: any[] = [],
    overrideQty: number | null = null,
  ) => {
    try {
      setIsAddToCartLoading(true);

      const storedCartId =
        typeof window !== "undefined" ? localStorage.getItem("cartid") : null;

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

        const createdCart = await actions.createCart?.(payload, {
          token: userToken,
        });
        if (createdCart?.id) {
          resolvedCartId = createdCart.id;
          if (!isActuallySignedIn) {
            localStorage.setItem("cartid", createdCart.id);
          }
          setCart(createdCart);
        }
      }

      await addItemToCart(product, resolvedCartId, customizations, overrideQty);

      // ── GA4 via GTM ───────────────────────────────────────────────
      const rawUserId = auth?.user?.id ?? auth?.user?.userId ?? null;
      const userId = rawUserId !== null ? String(rawUserId) : null;
      const currency = config?.currency ?? "INR";
      const qty = overrideQty !== null ? overrideQty : (quantity ?? 1);
      trackAddToCart({ userId, product, qty, currency });
      // ───────────────────────────────────────────────────────────────
      // ── Meta Pixel ────────────────────────────────────────────────
      trackMetaAddToCart(product, qty);
      // ───────────────────────────────────────────────────────────────

      toast?.success?.(`${product?.name || "Item"} added to cart`);
    } catch (err: any) {
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
  const handleDecreaseQty = async (product: any, customizations: any[] = []) => {
    const existingLineItem = getCartItem(product, customizations);
    if (!existingLineItem) return;

    try {
      setIsAddToCartLoading(true);

      if (existingLineItem.quantity <= 1) {
        setDeletingLineItemId(existingLineItem.id);
        await actions.deleteLineItem?.(existingLineItem.id, {
          token: userToken,
        });
      } else {
        await actions.updateLineItem?.(
          existingLineItem.id,
          { quantity: existingLineItem.quantity - 1 },
          { token: userToken },
        );
      }

      const activeCartId = cart?.id;
      if (activeCartId) {
        await refreshCart(activeCartId);
      }
    } catch (err: any) {
      console.error("[useAddToCart] handleDecreaseQty error:", err);
      const errorMsg = err?.data?.error || err?.message;
      if (errorMsg && typeof errorMsg === "string") {
        toast?.error?.(errorMsg);
      } else {
        toast?.error?.("Failed to update item quantity");
      }
    } finally {
      setIsAddToCartLoading(false);
      setDeletingLineItemId(null);
    }
  };

  /**
   * Remove a line item entirely from the cart.
   */
  const handleDeleteLineItem = async (product: any) => {
    try {
      setIsAddToCartLoading(true);
      const lineItem = product?.line_itemable
        ? product
        : (getCartItem(product) || product);
      const lineItemId = lineItem?.id;
      if (lineItemId) {
        setDeletingLineItemId(lineItemId);
      }
      await actions.deleteLineItem?.(lineItemId || product?.id);

      const activeCartId = cart?.id;
      if (activeCartId) {
        await refreshCart(activeCartId);
      }

      // ── GA4 via GTM (remove_from_cart) ────────────────────────────────
      const rawUserId = auth?.user?.id ?? auth?.user?.userId ?? null;
      const userId = rawUserId !== null ? String(rawUserId) : null;
      const currency = config?.currency ?? "INR";
      trackCustomEvent("remove_from_cart", userId, {
        currency,
        value:
          Number(product?.line_itemable?.price ?? 0) * (product?.quantity ?? 1),
        items: [buildItem(product, product?.quantity ?? 1)],
      });
      // ───────────────────────────────────────────────────────────────

      toast?.success?.(
        `${product?.line_itemable?.name || "Item"} removed from cart`,
      );
    } catch (err: any) {
      console.error("[useAddToCart] handleDeleteLineItem error:", err);
      const errorMsg = err?.data?.error || err?.message;
      if (errorMsg && typeof errorMsg === "string") {
        toast?.error?.(errorMsg);
      } else {
        toast?.error?.(
          `Failed to remove ${product?.line_itemable?.name || "item"}`,
        );
      }
    } finally {
      setIsAddToCartLoading(false);
      setDeletingLineItemId(null);
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
    deletingLineItemId,
    cartItems,
    cart,
  };
}
