"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CoreContext = createContext(null);

/**
 * CoreProvider
 *
 * Root context provider for @defx/storefront-core.
 * All Next.js/Clerk/store-specific logic is injected via props — this
 * component itself has zero framework dependencies.
 *
 * Props:
 *  - config    { storeId, regionId, currency, locale, ... }
 *  - actions   {
 *      // Cart actions
 *      getCart, createCart, updateCart, getCartById,
 *      updateLineItem, createLineItem, deleteLineItem,
 *      // Razorpay actions
 *      createRazorOrder, updateRazorPayment,
 *      // Address actions
 *      getUserAddress,
 *      ...
 *    }
 *  - toast     { success(msg), error(msg), info(msg) }  (optional)
 *  - auth      { isSignedIn, user, logout, ... }         (optional)
 *  - initialCart  cart object from SSR (optional, avoids first-load flash)
 */
export const CoreProvider = ({
  children,
  config = {},
  actions = {},
  toast = null,
  auth = null,
  orgData
}) => {
  const [cart, setCart] = useState();
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [region, setRegion] = useState(config?.region ?? null);

  // ─── Initial Cart Load ─────────────────────────────────────────────────
  useEffect(() => {
    // Skip if cart was already hydrated from SSR or no action available
    if (!actions?.getCart) return;

    const loadCart = async () => {
      try {
        setIsCartLoading(true);

        let resolvedCart = null;
        const isSignedIn = auth?.isSignedIn ?? false;

        if (isSignedIn) {
          const data = await actions.getCart(config?.regionId);
          resolvedCart = Array.isArray(data) ? data[0] : data;
        } else {
          const storedCartId =
            typeof window !== "undefined"
              ? localStorage.getItem("cartid")
              : null;
          if (storedCartId && actions?.getCartById) {
            resolvedCart = await actions.getCartById(
              storedCartId,
              config?.regionId,
            );
          }
        }
        setCart(resolvedCart ?? null);
      } catch (err) {
        console.error("[CoreProvider] cart load error:", err);
      } finally {
        setIsCartLoading(false);
      }
    };

    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.regionId, auth?.isSignedIn]);

  // ─── Memoised context value (avoids unnecessary re-renders) ───────────
  const value = useMemo(
    () => ({
      // Cart state
      cart,
      setCart,
      isCartLoading,

      // Region state
      region,
      setRegion,

      // Injected dependencies
      actions,
      toast,
      auth,
      config,

      //organization data
      orgData,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, isCartLoading, region, actions, toast, auth, config],
  );

  return <CoreContext.Provider value={value}>{children}</CoreContext.Provider>;
};

/**
 * useCore()
 * Must be called inside a <CoreProvider> tree.
 */
export const useCore = () => {
  const context = useContext(CoreContext);

  if (!context) {
    throw new Error(
      "[useCore] must be used inside <CoreProvider>. " +
      "Wrap your app (or the relevant subtree) with <CoreProvider>.",
    );
  }

  return context;
};
