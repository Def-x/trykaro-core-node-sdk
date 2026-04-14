"use client";

import { useCore } from "../context/CoreProvider";

/**
 * useCart()
 *
 * Convenience hook — returns cart state without exposing the full CoreContext.
 * Use this in components that only need to read/update the cart.
 *
 * Returns:
 *  - cart            current cart object (null if no cart yet)
 *  - setCart         update cart state
 *  - isCartLoading   true while the cart is being fetched or mutated
 *  - config          store config (storeId, regionId, currency, locale, …)
 */
export const useCart = () => {
    const { cart, setCart, isCartLoading, config } = useCore();
    return { cart, setCart, isCartLoading, config };
};
