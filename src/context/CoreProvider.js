"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as storefrontActions from "../actions/storefrontActions";
import * as discountActions from "../actions/discountActions";

const CoreContext = createContext(null);

// Actions bundled inside the package — used as defaults when the host app
// does not inject its own action for a given key via the `actions` prop.
const inbuiltActions = {
  // Cart
  getCart: storefrontActions.getCartAction,
  getCartById: storefrontActions.getCartByIdAction,
  createCart: storefrontActions.createCartAction,
  updateCart: storefrontActions.updateCartAction,
  updateCartIdLineItems: storefrontActions.updateCartIdLineItemsAction,
  // Line items
  createLineItem: storefrontActions.createLineItemAction,
  updateLineItem: storefrontActions.updateLineItemAction,
  deleteLineItem: storefrontActions.deleteLineItemAction,
  // Payments
  createRazorOrder: storefrontActions.createRazorpayOrderAction,
  updateRazorPayment: storefrontActions.updateRazorpayPaymentAction,
  // Addresses
  getUserAddress: storefrontActions.getAddressesAction,
  createAddress: storefrontActions.createAddressAction,
  updateAddress: storefrontActions.updateAddressAction,
  deleteAddress: storefrontActions.deleteAddressAction,
  // Auth — wrappers align the (phone, code, countryCode) call signature used by
  // CustomOTPAuth with the payload shape expected by the Rails API.
  // Mirrors exactly what sbs-store-frontend/context/Coreproviders.js does.
  login: (phone, countryCode = "+91") =>
    storefrontActions.loginUser({ phone, country_code: countryCode }),

  signup: ({ firstName, lastName, phone, countryCode = "+91" }) =>
    storefrontActions.signUpUser({ firstName, lastName, phone, countryCode }),

  verifyOtp: (phone, code, countryCode = "+91") =>
    storefrontActions.verifyOtp({ phone, country_code: countryCode, code }),

  getUser: storefrontActions.getUserAction,
  updateUser: storefrontActions.updateUserAction,
  // Orders
  getOrders: storefrontActions.getOrdersAction,
  getOrderById: storefrontActions.getOrderByIdAction,
  getOrderInvoice: storefrontActions.getOrderInvoiceAction,
  // Discounts
  getAvailableDiscounts: storefrontActions.getAvailableDiscountsAction,
  applyDiscount: storefrontActions.applyDiscountAction,
  removeDiscount: storefrontActions.removeDiscountAction,
  removeDiscountById: discountActions.removeDiscountById,
  trackDiscountEvent: storefrontActions.trackDiscountEventAction,
};

// Stable empty defaults — avoids creating a new object reference on every render,
// which would cause useMemo/useEffect loops when no actions/config are passed.
const EMPTY_ACTIONS = {};
const EMPTY_CONFIG = {};

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
  config = EMPTY_CONFIG,
  actions = EMPTY_ACTIONS,
  toast = null,
  auth: injectedAuth = null,
  orgData,
}) => {
  // ── Region resolution ────────────────────────────────────────────────────
  // Read activeRegion directly from config without gating on isRegion flag,
  // because the flag can be falsy during the first render while the context
  // prop hasn't propagated yet (timing issue with async region detection).
  const isRegionBased = !!(config?.isRegion || config?.activeRegion || config?.region);
  const resolvedRegion = config?.activeRegion ?? config?.region ?? null;
  const resolvedRegionId = config?.regionId ?? resolvedRegion?.id ?? null;
  const resolvedCurrency =
    resolvedRegion?.currency ?? config?.currency ?? "INR";
  const resolvedLocale =
    resolvedRegion?.locale ?? config?.locale ?? "en-IN";
  const resolvedConfig = useMemo(
    () => ({
      ...config,
      isRegion: isRegionBased,
      currency: resolvedCurrency,
      locale: resolvedLocale,
      region: resolvedRegion,
      activeRegion: resolvedRegion,
      regionId: resolvedRegionId,
    }),
    [
      config,
      isRegionBased,
      resolvedCurrency,
      resolvedLocale,
      resolvedRegion,
      resolvedRegionId,
    ],
  );

  const primaryColor = resolvedConfig?.primaryColor ?? "#00214c";
  const secondaryColor = resolvedConfig?.secondaryColor ?? "#c8a95a";
  const [cart, setCart] = useState();
  const resolvedActions = useMemo(() => {
    const merged = { ...actions };
    Object.entries(inbuiltActions).forEach(([key, fn]) => {
      if (!merged[key]) {
        merged[key] = fn;
      }
    });
    return merged;
  }, [actions]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [region, setRegion] = useState(resolvedConfig?.region ?? null);
  const [authState, setAuthState] = useState(() => injectedAuth ?? {});
  const authType = resolvedConfig?.authType ?? "clerk";

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
          typeof nextAuth === "function"
            ? nextAuth(prev ?? {})
            : (nextAuth ?? {});
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
    if (!resolvedActions?.getCart) return;

    // Prevent fetching cart before region detection is complete 
    // if the storefront is configured to be region-based.
    if (resolvedConfig?.isRegion && !resolvedConfig?.regionId) {
      return;
    }

    const loadCart = async () => {
      try {
        setIsCartLoading(true);

        let resolvedCart = null;
        const isSignedIn = auth?.isSignedIn ?? false;

        if (isSignedIn) {
          const data = await resolvedActions.getCart(resolvedConfig?.regionId);
          resolvedCart = Array.isArray(data) ? data[0] : data;
        } else {
          const storedCartId =
            typeof window !== "undefined"
              ? localStorage.getItem("cartid")
              : null;

          if (storedCartId && resolvedActions?.getCartById) {
            resolvedCart = await resolvedActions.getCartById(
              storedCartId,
              resolvedConfig?.regionId,
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
  }, [resolvedConfig?.regionId, auth?.isSignedIn]);

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
      region: resolvedRegion,   // use the resolved region, not the stale local state
      setRegion,
      activeRegion: resolvedRegion,  // top-level convenience field
      actions: resolvedActions,
      toast,
      auth,
      config: resolvedConfig,   // consumers call useCore().config — key must be "config"
      orgData,
      primaryColor,
      secondaryColor,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cart,
      isCartLoading,
      resolvedRegion,   // was wrong: was "region" (stale local state) and "config" (raw prop)
      resolvedConfig,   // was wrong: was raw "config" prop
      resolvedActions,
      toast,
      auth,
      orgData,
      primaryColor,
      secondaryColor,
    ],
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
