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
import { configureStorefront } from "../utils/request";
import { ThirdPartyScripts } from "../components/tracking/ThirdPartyScripts";
import {
  initDeveloperPostHog,
  getDeveloperPostHog,
  captureDeveloperException,
  setDeveloperSuperProperties,
  identifyDeveloperUser,
  devLogger,
} from "../lib/posthog";
import type { StorefrontConfig, Region } from "../types/config";
import type { AuthState } from "../types/auth";
import type { StorefrontActions } from "../types/actions";
import type { FrameworkAdapter } from "../types/adapters";
import type { Cart } from "../types/cart";

export interface CoreContextValue {
  cart: Cart | null | undefined;
  setCart: React.Dispatch<React.SetStateAction<Cart | null | undefined>>;
  isCartLoading: boolean;
  region: Region | null;
  setRegion: React.Dispatch<React.SetStateAction<Region | null>>;
  activeRegion: Region | null;
  actions: Record<string, any>;
  toast: any;
  auth: AuthState | null;
  config: StorefrontConfig;
  orgData: any;
  primaryColor: string;
  secondaryColor: string;
  devLogger: typeof devLogger;
  captureDeveloperException: typeof captureDeveloperException;
  posthogDeveloper: any;
  adapter?: FrameworkAdapter;
  linkComponent?: React.ComponentType<any>;
  addresses?: any[];
  isAddressLoading?: boolean;
  refreshAddresses?: () => Promise<any> | void;
  [key: string]: any;
}

const CoreContext = createContext<CoreContextValue | null>(null);

// Actions bundled inside the package — used as defaults when the host app
// does not inject its own action for a given key via the `actions` prop.
const inbuiltActions: Record<string, any> = {
  // Cart
  getCart: (storefrontActions as any).getCartAction,
  getCartById: (storefrontActions as any).getCartByIdAction,
  createCart: (storefrontActions as any).createCartAction,
  updateCart: (storefrontActions as any).updateCartAction,
  updateCartIdLineItems: (storefrontActions as any).updateCartIdLineItemsAction,
  // Line items
  createLineItem: (storefrontActions as any).createLineItemAction,
  updateLineItem: (storefrontActions as any).updateLineItemAction,
  deleteLineItem: (storefrontActions as any).deleteLineItemAction,
  // Payments
  createRazorOrder: (storefrontActions as any).createRazorpayOrderAction,
  updateRazorPayment: (storefrontActions as any).updateRazorpayPaymentAction,
  createCartPayment: (storefrontActions as any).createCartPaymentAction,
  updateCartPayment: (storefrontActions as any).updateCartPaymentAction,
  createPhonePeOrder: (storefrontActions as any).createPhonePeOrderAction,
  updatePhonePePayment: (storefrontActions as any).updatePhonePePaymentAction,
  createStripePaymentIntent: (storefrontActions as any).createStripePaymentIntentAction,
  // Addresses
  getUserAddress: (storefrontActions as any).getAddressesAction,
  createAddress: (storefrontActions as any).createAddressAction,
  updateAddress: (storefrontActions as any).updateAddressAction,
  deleteAddress: (storefrontActions as any).deleteAddressAction,
  // Auth
  login: (phone: string, countryCode = "+91") =>
    (storefrontActions as any).loginUser({ phone, country_code: countryCode }),

  signup: ({ firstName, lastName, phone, countryCode = "+91" }: any) =>
    (storefrontActions as any).signUpUser({ firstName, lastName, phone, countryCode }),

  verifyOtp: (phone: string, code: string, countryCode = "+91") =>
    (storefrontActions as any).verifyOtp({ phone, country_code: countryCode, code }),

  getUser: (storefrontActions as any).getUserAction,
  updateUser: (storefrontActions as any).updateUserAction,
  // Orders
  getOrders: (storefrontActions as any).getOrdersAction,
  getOrderById: (storefrontActions as any).getOrderByIdAction,
  getOrderInvoice: (storefrontActions as any).getOrderInvoiceAction,
  // Discounts
  getAvailableDiscounts: (storefrontActions as any).getAvailableDiscountsAction,
  applyDiscount: (storefrontActions as any).applyDiscountAction,
  removeDiscount: (storefrontActions as any).removeDiscountAction,
  removeDiscountById: (discountActions as any).removeDiscountById,
  trackDiscountEvent: (storefrontActions as any).trackDiscountEventAction,
};

const EMPTY_ACTIONS: Record<string, any> = {};
const EMPTY_CONFIG: StorefrontConfig = {};

export interface CoreProviderProps {
  children: React.ReactNode;
  config?: StorefrontConfig;
  actions?: StorefrontActions | Record<string, any>;
  toast?: any;
  auth?: AuthState | null;
  orgData?: any;
  adapter?: FrameworkAdapter;
  linkComponent?: React.ComponentType<any>;
}

/**
 * CoreProvider
 *
 * Root context provider for @defx/storefront-core.
 */
export const CoreProvider: React.FC<CoreProviderProps> = ({
  children,
  config = EMPTY_CONFIG,
  actions = EMPTY_ACTIONS,
  toast = null,
  auth: injectedAuth = null,
  orgData,
  adapter,
  linkComponent,
}) => {
  const isRegionBased = !!(config?.isRegion || config?.activeRegion || config?.region);
  const resolvedRegion = (config?.activeRegion ?? config?.region ?? null) as Region | null;
  const resolvedRegionId = (config?.regionId ?? resolvedRegion?.id ?? null) as string | null;
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

  // Sync SDK global action config whenever CoreProvider config updates
  useEffect(() => {
    if (config?.apiBaseUrl || config?.storeId || adapter) {
      configureStorefront({
        apiBaseUrl: config?.apiBaseUrl,
        storeId: config?.storeId,
        countryCode: config?.countryCode,
        currency: resolvedCurrency,
        adapter,
      });
    }
  }, [config?.apiBaseUrl, config?.storeId, config?.countryCode, resolvedCurrency, adapter]);

  const [cart, setCart] = useState<Cart | null | undefined>();
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(resolvedConfig?.region ?? null);
  const [authState, setAuthState] = useState<AuthState>(() => injectedAuth ?? {});
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
    (nextAuth: any) => {
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

  const resolvedActions = useMemo(() => {
    const merged = { ...actions };
    Object.entries(inbuiltActions).forEach(([key, fn]) => {
      if (!merged[key]) {
        merged[key] = fn;
      }
    });
    return merged;
  }, [actions]);

  // PostHog Developer Instance Initialization
  useEffect(() => {
    const devToken =
      resolvedConfig?.posthogDeveloperToken ||
      config?.posthogDeveloperToken ||
      (typeof process !== "undefined"
        ? process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN_DEVELOPER
        : null);

    const devHost =
      resolvedConfig?.posthogDeveloperHost ||
      config?.posthogDeveloperHost ||
      (typeof process !== "undefined"
        ? process.env.NEXT_PUBLIC_POSTHOG_HOST_DEVELOPER
        : null) ||
      "https://us.i.posthog.com";

    if (devToken) {
      const devPh = initDeveloperPostHog({
        token: devToken,
        apiHost: devHost,
        enabledInDev:
          resolvedConfig?.enablePosthogInDev || config?.enablePosthogInDev,
      });

      if (devPh) {
        setDeveloperSuperProperties({
          storeId: resolvedConfig?.storeId || resolvedConfig?.orgId || null,
          regionId: resolvedRegionId,
          currency: resolvedCurrency,
          locale: resolvedLocale,
          authType,
          environment:
            typeof process !== "undefined" && process.env?.NODE_ENV
              ? process.env.NODE_ENV
              : "unknown",
        });
      }
    }
  }, [
    resolvedConfig?.posthogDeveloperToken,
    resolvedConfig?.posthogDeveloperHost,
    resolvedConfig?.storeId,
    resolvedConfig?.orgId,
    resolvedRegionId,
    resolvedCurrency,
    resolvedLocale,
    authType,
    config?.posthogDeveloperToken,
    config?.posthogDeveloperHost,
  ]);

  // Sync user identity to developer PostHog
  useEffect(() => {
    const userId = auth?.user?.id || auth?.user?.userId || null;
    if (userId) {
      identifyDeveloperUser(String(userId), {
        phone: auth?.user?.phone || null,
        email: auth?.user?.email || null,
      });
    }
  }, [auth?.user?.id, auth?.user?.userId, auth?.user?.phone, auth?.user?.email]);

  useEffect(() => {
    if (!resolvedActions?.getCart) return;

    if (resolvedConfig?.isRegion && !resolvedConfig?.regionId) {
      return;
    }

    const loadCart = async () => {
      try {
        setIsCartLoading(true);

        let resolvedCart = null;
        const token = auth?.token ?? auth?.access_token ?? null;
        const isActuallySignedIn = !!((auth?.isSignedIn ?? false) && token);

        if (isActuallySignedIn && token) {
          const data = await resolvedActions.getCart(resolvedConfig?.regionId, { token });
          const candidate = Array.isArray(data) ? data[0] : data;
          resolvedCart = candidate && !candidate.serverError && !candidate.error ? candidate : null;
        } else {
          const storedCartId =
            typeof window !== "undefined"
              ? localStorage.getItem("cartid")
              : null;

          if (storedCartId && resolvedActions?.getCartById) {
            const candidate = await resolvedActions.getCartById(
              storedCartId,
              resolvedConfig?.regionId,
              { token: null },
            );
            resolvedCart = candidate && !candidate.serverError && !candidate.error ? candidate : null;
          }
        }

        setCart(resolvedCart ?? null);
      } catch (err) {
        console.error("[CoreProvider] cart load error:", err);
        captureDeveloperException(err, {
          source: "CoreProvider.loadCart",
          regionId: resolvedConfig?.regionId,
          isSignedIn: auth?.isSignedIn ?? false,
        });
      } finally {
        setIsCartLoading(false);
      }
    };

    loadCart();
  }, [resolvedConfig?.regionId, auth?.isSignedIn, auth?.token, auth?.access_token]);

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

  const value: CoreContextValue = useMemo(
    () => ({
      cart,
      setCart,
      isCartLoading,
      region: resolvedRegion,
      setRegion,
      activeRegion: resolvedRegion,
      actions: resolvedActions,
      toast,
      auth,
      config: resolvedConfig,
      orgData,
      primaryColor,
      secondaryColor,
      devLogger,
      captureDeveloperException,
      posthogDeveloper: getDeveloperPostHog(),
      adapter,
      linkComponent,
    }),
    [
      cart,
      isCartLoading,
      resolvedRegion,
      resolvedConfig,
      resolvedActions,
      toast,
      auth,
      orgData,
      primaryColor,
      secondaryColor,
      adapter,
      linkComponent,
    ],
  );

  return (
    <CoreContext.Provider value={value}>
      <ThirdPartyScripts
        apiBaseUrl={resolvedConfig?.apiBaseUrl || config?.apiBaseUrl}
        orgId={resolvedConfig?.storeId || config?.storeId || resolvedConfig?.orgId}
        orgData={orgData}
      />
      <div
        style={
          {
            "--core-primary": primaryColor,
            "--core-secondary": secondaryColor,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </CoreContext.Provider>
  );
};

export const useCore = (): CoreContextValue => {
  const context = useContext(CoreContext);

  if (!context) {
    throw new Error(
      "[useCore] must be used inside <CoreProvider>. " +
        "Wrap your app (or the relevant subtree) with <CoreProvider>.",
    );
  }

  return context;
};

