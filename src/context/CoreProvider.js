"use client";

import React, {
  createContext,
  useCallback,
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
 * All Next.js/Clerk/store-specific logic is injected via props and the
 * component itself has zero framework dependencies.
 *
 * Props:
 *  - config      { storeId, regionId, currency, locale, authType: 'clerk' | 'own', ... }
 *  - actions     {
 *      // Cart actions
 *      getCart, createCart, updateCart, getCartById,
 *      updateLineItem, createLineItem, deleteLineItem,
 *      // Auth actions (for authType: 'own')
 *      login, signup, verifyOtp,
 *      // Razorpay actions
 *      createRazorOrder, updateRazorPayment,
 *      // Stripe actions (only needed when payment mode is "stripe")
 *      createStripePaymentIntent,
 *      // Address actions
 *      getUserAddress,
 *      ...
 *    }
 *  - components  {
 *      // Optional: inject StripeCheckout only in projects that use Stripe.
 *      // The core package has zero @stripe/* dependencies.
 *      StripeCheckout: <YourStripeCheckoutComponent>,
 *    }
 *  - toast       { success(msg), error(msg), info(msg) }  (optional)
 *  - auth        { isSignedIn, user, logout, ... }        (optional for 'clerk')
 *  - orgData     organisation JSON from the API           (optional)
 */
export const CoreProvider = ({
  children,
  config = {},
  actions = {},
  toast = null,
  auth: injectedAuth = null,
  orgData,
}) => {
  // ── Theme colors ────────────────────────────────────────────────────────────
  const primaryColor = config?.primaryColor ?? "#00214c";
  const secondaryColor = config?.secondaryColor ?? "#c8a95a";
  const [cart, setCart] = useState();
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [region, setRegion] = useState(config?.region ?? null);
  const [authState, setAuthState] = useState(() => injectedAuth ?? {});

  const authType = config?.authType ?? "clerk";

  useEffect(() => {
    if (!injectedAuth) return;

    setAuthState((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(injectedAuth).filter(([, value]) => value !== undefined),
      ),
    }));
  }, [injectedAuth]);

  const setAuth = useCallback(
    (nextAuth) => {
      setAuthState((prev) => {
        const resolved =
          typeof nextAuth === "function" ? nextAuth(prev ?? {}) : nextAuth ?? {};
        const token = resolved?.token ?? resolved?.access_token ?? null;
        const merged = {
          ...prev,
          ...resolved,
          token,
          access_token: resolved?.access_token ?? token,
        };

        injectedAuth?.setAuth?.(merged);
        return merged;
      });
    },
    [injectedAuth],
  );

  const clearAuth = useCallback(() => {
    setAuthState((prev) => ({
      ...prev,
      token: null,
      access_token: null,
      user: null,
      isSignedIn: false,
    }));
    injectedAuth?.clearAuth?.();
  }, [injectedAuth]);

  const auth = useMemo(() => {
    if (authType === "clerk") return injectedAuth;

    const token = authState?.token ?? authState?.access_token ?? null;

    return {
      ...authState,
      isSignedIn: !!token,
      token,
      access_token: authState?.access_token ?? token,
      setAuth,
      clearAuth,
    };
  }, [authType, injectedAuth, authState, setAuth, clearAuth]);

  useEffect(() => {
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
            typeof window !== "undefined" ? localStorage.getItem("cartid") : null;

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

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const prevPrimary = root.style.getPropertyValue("--core-primary");
    const prevSecondary = root.style.getPropertyValue("--core-secondary");

    root.style.setProperty("--core-primary", primaryColor);
    root.style.setProperty("--core-secondary", secondaryColor);

    return () => {
      if (prevPrimary) {
        root.style.setProperty("--core-primary", prevPrimary);
      } else {
        root.style.removeProperty("--core-primary");
      }

      if (prevSecondary) {
        root.style.setProperty("--core-secondary", prevSecondary);
      } else {
        root.style.removeProperty("--core-secondary");
      }
    };
  }, [primaryColor, secondaryColor]);

  const value = useMemo(
    () => ({
      cart,
      setCart,
      isCartLoading,
      region,
      setRegion,
      actions,
      toast,
      auth,
      config,
      orgData,
      primaryColor,
      secondaryColor,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, isCartLoading, region, actions, toast, auth, config, orgData, primaryColor, secondaryColor],
  );

  return (
    <CoreContext.Provider value={value}>
      <div
        style={{
          "--core-primary": primaryColor,
          "--core-secondary": secondaryColor,
        }}
      >
        {children}
      </div>
    </CoreContext.Provider>
  );
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
