"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { useCart } from "@/context/CartContext";
import useCartInfo from "./userCartInfo";
import {
  createCartAction,
  getCartAction,
  getCartByIdAction,
} from "@/app/actions/createCartAction";
import {
  createLineItemAction,
  updateLineItemAction,
  deleteLineItemAction,
} from "@/app/actions/createLineItem";
import { useRegionContext } from "@/context/RegionContext";

export function useAddToCart() {
  const { isSignedIn } = useUser();
  const { initialCartInfo } = useCartInfo();
  const { cart, setCart } = useCart();
  const { activeRegion } = useRegionContext();

  const [quantity, setQuantity] = useState(1);
  const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);

  console.log({ cart })
  const refreshCart = async (cartId) => {
    try {
      let updatedCart;
      if (isSignedIn) {
        const data = await getCartAction(activeRegion?.id);
        updatedCart = data?.[0];
      } else {
        updatedCart = await getCartByIdAction(cartId, activeRegion?.id);
      }
      setCart(updatedCart || null);
    } catch (err) {
      console.error("Failed to refresh cart:", err);
    }
  };

  const getCartItem = (product) => {
    if (!cart?.line_items) return null;
    return cart.line_items.find(
      (item) => item.line_itemable?.id === product?.id
    ) ?? null;
  };

  const addItemToCart = async (product, resolvedCartId) => {
    const sellingQTY = product?.selling_quantity?.values?.[0]?.label;
    const qty = quantity ?? 1;

    // Check for an existing line item with the same product variant
    const existingLineItem = getCartItem(product);
    if (existingLineItem) {
      // Update quantity instead of creating a duplicate
      const newQty = existingLineItem.quantity + qty;
      console.log("updatecartline item")
      await updateLineItemAction(existingLineItem.id, { quantity: newQty });
    } else {
      console.log("createcartline item")
      const body = {

        line_itemable_id: product?.id,
        quantity: qty,
        ...(resolvedCartId && !isSignedIn ? { cart_id: resolvedCartId } : {}),
        ...(activeRegion?.id ? { region_id: activeRegion.id } : {}),
      };

      await createLineItemAction(body);
    }

    // Reset quantity to selling unit default
    setQuantity(sellingQTY ? Number(sellingQTY) : 1);

    // Always refresh so the cart context reflects the latest state
    if (resolvedCartId) {
      await refreshCart(resolvedCartId);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      setIsAddToCartLoading(true);

      let cartId = typeof window !== "undefined"
        ? localStorage.getItem("cartid")
        : null;

      // Track the resolved cart ID — may come from an existing cart or a newly created one
      let resolvedCartId = cart?.id ?? cartId;

      // Create a cart if one doesn't exist yet
      if (!cart) {
        const payload = { ...initialCartInfo };
        if (activeRegion?.id) {
          payload.region_id = activeRegion.id;
        }
        console.log("createcart")
        const createdCart = await createCartAction(payload);
        if (createdCart?.id) {
          resolvedCartId = createdCart.id;
          if (!isSignedIn) {
            cartId = createdCart.id;
            localStorage.setItem("cartid", cartId);
          }
          setCart(createdCart);
        }
      }

      await addItemToCart(product, resolvedCartId);

      toast.success("Item added to cart", {
        position: "top-right",
        className: "mt-0 md:mt-[60px]",
      });
    } catch (err) {
      console.error("Error adding product:", err);
      toast.error("Failed to add item to cart", {
        position: "top-right",
        className: "mt-0 md:mt-[60px]",
      });
    } finally {
      setIsAddToCartLoading(false);
    }
  };

  /** Returns the existing cart line item for a given product, or null */


  /**
   * Decrease quantity by 1. If qty reaches 0, delete the line item entirely.
   */
  const handleDecreaseQty = async (product) => {
    const existingLineItem = getCartItem(product);
    if (!existingLineItem) return;

    try {
      setIsAddToCartLoading(true);
      if (existingLineItem.quantity <= 1) {
        await deleteLineItemAction(existingLineItem.id);
      } else {
        await updateLineItemAction(existingLineItem.id, {
          quantity: existingLineItem.quantity - 1,
        });
      }

      const activeCartId = cart?.id;
      if (activeCartId) {
        await refreshCart(activeCartId);
      }
    } catch (err) {
      console.error("Error decreasing quantity:", err);
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
    console.log({ product, existingLineItem })
    try {
      setIsAddToCartLoading(true);
      await deleteLineItemAction(existingLineItem.id);

      const activeCartId = cart?.id;
      if (activeCartId) {
        await refreshCart(activeCartId);
      }
      toast.success("Item removed from cart");
    } catch (err) {
      console.error("Error deleting line item:", err);
      toast.error("Failed to remove item");
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
