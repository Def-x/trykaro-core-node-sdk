import { trackDiscountEventAction, removeDiscountById, removeDiscountAction, applyDiscountAction, getAvailableDiscountsAction, getOrderInvoiceAction, getOrderByIdAction, getOrdersAction, updateUserAction, getUserAction, deleteAddressAction, updateAddressAction, createAddressAction, getAddressesAction, updateRazorpayPaymentAction, createRazorpayOrderAction, deleteLineItemAction, updateLineItemAction, createLineItemAction, updateCartIdLineItemsAction, updateCartAction, createCartAction, getCartByIdAction, getCartAction, getCurrentUserLikedProductsAction, verifyOtp, signUpUser, loginUser, validateCartTotal } from './chunk-IBZ56ABS.js';
export { applyDiscount, applyDiscountAction, createAddressAction, createCartAction, createLineItemAction, createRazorpayOrderAction, deleteAddressAction, deleteLineItemAction, getAddressesAction, getAllTaxonsAction, getAvailableDiscountsAction, getCartAction, getCartByIdAction, getCurrentUserLikedProductsAction, getLikedProductsAction, getOrderByIdAction, getOrderInvoiceAction, getOrdersAction, getOrgVideosAction, getOrganizationAction, getProductByIdAction, getProductsAction, getProductsByIdsAction, getProductsFilterAction, getRecentlyViewedProductsAction, getRelatedProductsAction, getTaxonByIdAction, getTaxonomiesAction, getTaxonomyByIdAction, getUserAction, likeProductAction, loginUser, removeDiscountAction, removeDiscountById, signUpUser, trackDiscountEventAction, unlikeProductAction, updateAddressAction, updateCartAction, updateCartIdLineItemsAction, updateLineItemAction, updateRazorpayPaymentAction, updateUserAction, validateCartTotal, verifyOtp } from './chunk-IBZ56ABS.js';
import { getPaymentGateway } from './chunk-ZXSZ7SQJ.js';
import React8, { createContext, useEffect, useMemo, useState, useCallback, useContext, useRef, Component } from 'react';
import posthog from 'posthog-js';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { flatten, map, compact, filter, uniqBy } from 'lodash';
import Link from 'next/link';
import { useRazorpay } from 'react-razorpay';
import { createPortal } from 'react-dom';

// src/lib/thirdPartyScripts.js
function nameToSlug(name = "") {
  const n = String(name || "").toLowerCase().trim();
  if (n.includes("google analytics")) return "google-analytics";
  if (n.includes("google search console")) return "google-search-console";
  if (n.includes("meta pixel")) return "meta-pixel";
  if (n.includes("instagram shopping")) return "instagram-shopping";
  if (n.includes("whatsapp business")) return "whatsapp-business";
  if (n.includes("whatsapp catalog") || n.includes("whatsapp catelog")) return "whatsapp-catalog";
  if (n.includes("whatsapp")) return "whatsapp";
  if (n.includes("shiprocket")) return "shiprocket";
  if (n.includes("razorpay")) return "razorpay";
  if (n.includes("stripe")) return "stripe";
  if (n.includes("contentsquare") || n.includes("content square")) return "content-square";
  if (n.includes("hotjar")) return "hotjar";
  if (n.includes("microsoft clarity") || n.includes("clarity")) return "microsoft-clarity";
  return n.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function injectOnce(id, fn) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  fn();
}
function injectContentSquare(rawScriptHtml) {
  if (!rawScriptHtml || typeof rawScriptHtml !== "string") return;
  const trimmed = rawScriptHtml.trim();
  injectOnce("cs-tracking-script", () => {
    try {
      const script = document.createElement("script");
      script.id = "cs-tracking-script";
      script.async = true;
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("//")) {
        script.src = trimmed;
      } else if (trimmed.includes("<script")) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, "text/html");
        const sourceScript = doc.querySelector("script");
        if (sourceScript) {
          Array.from(sourceScript.attributes).forEach((attr) => {
            script.setAttribute(attr.name, attr.value);
          });
          if (sourceScript.src) {
            script.src = sourceScript.src;
          } else {
            script.textContent = sourceScript.textContent || sourceScript.innerHTML;
          }
        } else {
          script.textContent = trimmed;
        }
      } else {
        script.textContent = trimmed;
      }
      document.head.appendChild(script);
    } catch (err) {
      console.error("[ThirdPartyScripts] ContentSquare injection failed:", err);
    }
  });
}
function injectHotjar(siteId, version = 6) {
  if (!siteId) return;
  injectOnce("hotjar-tracking-script", () => {
    const script = document.createElement("script");
    script.id = "hotjar-tracking-script";
    script.textContent = [
      `(function(h,o,t,j,a,r){`,
      `  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};`,
      `  h._hjSettings={hjid:${siteId},hjsv:${version}};`,
      `  a=o.getElementsByTagName('head')[0];`,
      `  r=o.createElement('script');r.async=1;`,
      `  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;`,
      `  a.appendChild(r);`,
      `})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`
    ].join("\n");
    document.head.appendChild(script);
  });
}
function injectClarity(projectId) {
  if (!projectId || typeof projectId !== "string") return;
  const trimmed = projectId.trim();
  if (!trimmed) return;
  injectOnce("clarity-tracking-script", () => {
    try {
      const script = document.createElement("script");
      script.id = "clarity-tracking-script";
      script.type = "text/javascript";
      script.textContent = [
        `(function(c,l,a,r,i,t,y){`,
        `  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};`,
        `  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;`,
        `  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);`,
        `})(window, document, "clarity", "script", "${trimmed}");`
      ].join("\n");
      document.head.appendChild(script);
    } catch (err) {
      console.error(
        "[ThirdPartyScripts] Microsoft Clarity injection failed:",
        err
      );
    }
  });
}

// src/components/tracking/ThirdPartyScripts.js
function ThirdPartyScripts({
  apiBaseUrl,
  orgId,
  marketplaces: prefetched,
  orgData
}) {
  useEffect(() => {
    async function run() {
      let records = prefetched;
      if (!records && orgData) {
        const candidateArray = orgData.organization_marketplaces;
        if (Array.isArray(candidateArray)) {
          records = candidateArray;
        }
      }
      const targetApiUrl = apiBaseUrl || (typeof process !== "undefined" ? process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL : "");
      const targetOrgId = orgId || (typeof process !== "undefined" ? process.env.ORG_ID || process.env.NEXT_PUBLIC_ORG_ID : "");
      if (!records && targetApiUrl && targetOrgId) {
        try {
          const res = await fetch(
            `${targetApiUrl.replace(/\/$/, "")}/api/organization_marketplaces`,
            {
              headers: {
                "Content-Type": "application/json",
                accept: "application/vnd.defx-store.v2",
                "Set-Organization": targetOrgId
              },
              cache: "no-store"
            }
          );
          if (res.ok) {
            records = await res.json();
          }
        } catch (err) {
          console.warn(
            "[ThirdPartyScripts] Failed to fetch marketplaces:",
            err
          );
        }
      }
      if (!Array.isArray(records)) return;
      records.forEach((record) => {
        const json = record.market_place_json || record.market_place || record || {};
        if (record.is_installed === false || json.enabled === false) return;
        const name = record.market_place?.name || record.name || record.appName || json.name || json.appName || "";
        const slug = nameToSlug(name);
        switch (slug) {
          case "content-square":
            const csCode = json.trackingCode || record.market_place?.metadata?.trackingCode;
            if (csCode) {
              injectContentSquare(csCode);
            }
            break;
          case "hotjar":
            const siteId = json.siteId || record.market_place?.metadata?.siteId;
            if (siteId) {
              injectHotjar(siteId, json.hotjarVersion || 6);
            }
            break;
          case "microsoft-clarity":
          case "clarity":
            const clarityId = json.projectId || json.projectIdFromInput || json.clarityId || json.project_id || json.id || record.market_place?.metadata?.projectId || record.market_place?.metadata?.clarityId;
            if (clarityId) {
              injectClarity(clarityId);
            }
            break;
        }
      });
    }
    run();
  }, [apiBaseUrl, orgId, prefetched, orgData]);
  return null;
}
var POSTHOG_INSTANCES = {
  DEVELOPER: "developer",
  MERCHANT: "merchant"
};
var instanceRegistry = {
  developer: null,
  merchant: null
};
var globalListenersAttached = false;
function getPostHogModule() {
  if (posthog && typeof posthog.init === "function") return posthog;
  if (posthog?.default && typeof posthog.default.init === "function") {
    return posthog.default;
  }
  return posthog;
}
function sanitizePostHogToken(token) {
  if (!token || typeof token !== "string") return "";
  return token.trim();
}
function attachGlobalErrorListeners() {
  if (globalListenersAttached || typeof window === "undefined") return;
  window.addEventListener("error", (event) => {
    try {
      const error = event.error || new Error(event.message || "Unhandled Window Error");
      captureDeveloperException(error, {
        source: "window.onerror",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    } catch (_) {
    }
  });
  window.addEventListener("unhandledrejection", (event) => {
    try {
      const reason = event.reason;
      const error = reason instanceof Error ? reason : new Error(typeof reason === "string" ? reason : "Unhandled Promise Rejection");
      captureDeveloperException(error, {
        source: "window.onunhandledrejection",
        reason: typeof reason === "object" ? JSON.stringify(reason) : String(reason)
      });
    } catch (_) {
    }
  });
  globalListenersAttached = true;
}
function initPostHog(instanceName, config = {}) {
  if (typeof window === "undefined") return null;
  if (instanceRegistry[instanceName]) {
    return instanceRegistry[instanceName];
  }
  const isProd = typeof process !== "undefined" && process.env?.NODE_ENV === "production";
  const forceEnable = config.enabledInDev || config.forceEnable || typeof process !== "undefined" && process.env?.NEXT_PUBLIC_POSTHOG_DEVELOPER_ENABLE_IN_DEV === "true";
  if (!isProd && !forceEnable) {
    return null;
  }
  const rawToken = config.token;
  const token = sanitizePostHogToken(rawToken);
  if (!token) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[PostHog] No token provided for "${instanceName}" instance. Telemetry will be disabled.`
      );
    }
    return null;
  }
  const apiHost = config.apiHost || config.host || typeof process !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_HOST_DEVELOPER || "https://us.i.posthog.com";
  try {
    const isDeveloper = instanceName === POSTHOG_INSTANCES.DEVELOPER;
    const options = {
      api_host: apiHost,
      // Use isolated storage key so developer instance never clashes with merchant session
      persistence_name: isDeveloper ? "ph_developer" : "ph_merchant",
      autocapture: config.autocapture ?? false,
      capture_pageview: config.capturePageview ?? false,
      capture_exceptions: config.captureExceptions ?? (isDeveloper ? {
        capture_unhandled_errors: true,
        capture_unhandled_rejections: true,
        capture_console_errors: true
      } : true),
      disable_session_recording: config.disableSessionRecording ?? true,
      loaded: (phInstance) => {
        if (process.env.NODE_ENV === "development") {
          phInstance.debug();
        }
        if (typeof config.onLoaded === "function") {
          config.onLoaded(phInstance);
        }
      },
      ...config.customOptions
    };
    const ph = getPostHogModule();
    const client = ph.init(token, options, instanceName);
    instanceRegistry[instanceName] = client || ph?.[instanceName] || null;
    if (isDeveloper && instanceRegistry[instanceName]) {
      attachGlobalErrorListeners();
      if (typeof window !== "undefined") {
        window.__posthog_developer = instanceRegistry[instanceName];
        window.devLogger = devLogger;
      }
    }
    return instanceRegistry[instanceName];
  } catch (err) {
    console.error(`[PostHog] Failed to initialize "${instanceName}" instance:`, err);
    return null;
  }
}
function initDeveloperPostHog(options = {}) {
  const token = options.token || (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN_DEVELOPER : null);
  const apiHost = options.apiHost || options.host || (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_POSTHOG_HOST_DEVELOPER : null) || "https://us.i.posthog.com";
  return initPostHog(POSTHOG_INSTANCES.DEVELOPER, {
    ...options,
    token,
    apiHost
  });
}
function initMerchantPostHog(options = {}) {
  return initPostHog(POSTHOG_INSTANCES.MERCHANT, options);
}
function getPostHogInstance(instanceName) {
  if (typeof window === "undefined") return null;
  const ph = getPostHogModule();
  return instanceRegistry[instanceName] || ph?.[instanceName] || null;
}
function getDeveloperPostHog() {
  return getPostHogInstance(POSTHOG_INSTANCES.DEVELOPER);
}
function getMerchantPostHog() {
  return getPostHogInstance(POSTHOG_INSTANCES.MERCHANT);
}
function setDeveloperSuperProperties(properties = {}) {
  const client = getDeveloperPostHog();
  if (client && typeof client.register === "function") {
    client.register(properties);
  }
}
function identifyDeveloperUser(userId, userProperties = {}) {
  const client = getDeveloperPostHog();
  if (client && userId && typeof client.identify === "function") {
    client.identify(String(userId), userProperties);
  }
}
function resetDeveloperPostHog() {
  const client = getDeveloperPostHog();
  if (client && typeof client.reset === "function") {
    client.reset();
  }
}
function captureDeveloperException(error, properties = {}) {
  const client = getDeveloperPostHog();
  const errObj = error instanceof Error ? error : new Error(typeof error === "string" ? error : "Unknown Developer Error");
  const payload = {
    $exception_message: errObj.message,
    $exception_type: errObj.name || "Error",
    $exception_stack_trace_raw: errObj.stack || null,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    url: typeof window !== "undefined" ? window.location.href : null,
    ...properties
  };
  if (client) {
    if (typeof client.captureException === "function") {
      client.captureException(errObj, payload);
    } else {
      client.capture("$exception", payload);
    }
  } else {
    if (process.env.NODE_ENV === "development") {
      console.error("[DeveloperError - Unreported]", errObj, properties);
    }
  }
}
function logDeveloper(message, level = "info", properties = {}) {
  const client = getDeveloperPostHog();
  const logPayload = {
    level,
    message: typeof message === "string" ? message : JSON.stringify(message),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    url: typeof window !== "undefined" ? window.location.href : null,
    ...properties
  };
  if (client) {
    if (typeof client.log === "function") {
      try {
        client.log(logPayload.message, level === "debug" ? "log" : level);
      } catch (_) {
      }
    }
    client.capture("developer_log", logPayload);
  }
  if (level === "error" && properties?.error) {
    captureDeveloperException(properties.error, {
      logMessage: message,
      ...properties
    });
  }
}
var devLogger = {
  debug: (message, meta = {}) => logDeveloper(message, "debug", meta),
  info: (message, meta = {}) => logDeveloper(message, "info", meta),
  warn: (message, meta = {}) => logDeveloper(message, "warn", meta),
  error: (message, errorOrMeta = null, extraMeta = {}) => {
    if (errorOrMeta instanceof Error) {
      logDeveloper(message, "error", { ...extraMeta, error: errorOrMeta });
    } else {
      logDeveloper(message, "error", { ...errorOrMeta, ...extraMeta });
    }
  }
};
var CoreContext = createContext(null);
var inbuiltActions = {
  // Cart
  getCart: getCartAction,
  getCartById: getCartByIdAction,
  createCart: createCartAction,
  updateCart: updateCartAction,
  updateCartIdLineItems: updateCartIdLineItemsAction,
  // Line items
  createLineItem: createLineItemAction,
  updateLineItem: updateLineItemAction,
  deleteLineItem: deleteLineItemAction,
  // Payments
  createRazorOrder: createRazorpayOrderAction,
  updateRazorPayment: updateRazorpayPaymentAction,
  // Addresses
  getUserAddress: getAddressesAction,
  createAddress: createAddressAction,
  updateAddress: updateAddressAction,
  deleteAddress: deleteAddressAction,
  // Auth — wrappers align the (phone, code, countryCode) call signature used by
  // CustomOTPAuth with the payload shape expected by the Rails API.
  // Mirrors exactly what sbs-store-frontend/context/Coreproviders.js does.
  login: (phone, countryCode = "+91") => loginUser({ phone, country_code: countryCode }),
  signup: ({ firstName, lastName, phone, countryCode = "+91" }) => signUpUser({ firstName, lastName, phone, countryCode }),
  verifyOtp: (phone, code, countryCode = "+91") => verifyOtp({ phone, country_code: countryCode, code }),
  getUser: getUserAction,
  updateUser: updateUserAction,
  // Orders
  getOrders: getOrdersAction,
  getOrderById: getOrderByIdAction,
  getOrderInvoice: getOrderInvoiceAction,
  // Discounts
  getAvailableDiscounts: getAvailableDiscountsAction,
  applyDiscount: applyDiscountAction,
  removeDiscount: removeDiscountAction,
  removeDiscountById,
  trackDiscountEvent: trackDiscountEventAction
};
var EMPTY_ACTIONS = {};
var EMPTY_CONFIG = {};
var CoreProvider = ({
  children,
  config = EMPTY_CONFIG,
  actions = EMPTY_ACTIONS,
  toast = null,
  auth: injectedAuth = null,
  orgData
}) => {
  const isRegionBased = !!(config?.isRegion || config?.activeRegion || config?.region);
  const resolvedRegion = config?.activeRegion ?? config?.region ?? null;
  const resolvedRegionId = config?.regionId ?? resolvedRegion?.id ?? null;
  const resolvedCurrency = resolvedRegion?.currency ?? config?.currency ?? "INR";
  const resolvedLocale = resolvedRegion?.locale ?? config?.locale ?? "en-IN";
  const resolvedConfig = useMemo(
    () => ({
      ...config,
      isRegion: isRegionBased,
      currency: resolvedCurrency,
      locale: resolvedLocale,
      region: resolvedRegion,
      activeRegion: resolvedRegion,
      regionId: resolvedRegionId
    }),
    [
      config,
      isRegionBased,
      resolvedCurrency,
      resolvedLocale,
      resolvedRegion,
      resolvedRegionId
    ]
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
        Object.entries(injectedAuth).filter(([, value2]) => value2 !== void 0)
      )
    }));
  }, [injectedAuth]);
  const setAuth = useCallback(
    (nextAuth) => {
      setAuthState((prev) => {
        const resolved = typeof nextAuth === "function" ? nextAuth(prev ?? {}) : nextAuth ?? {};
        const token = resolved?.token ?? resolved?.access_token ?? null;
        const merged = {
          ...prev,
          ...resolved,
          token,
          access_token: resolved?.access_token ?? token
        };
        injectedAuth?.setAuth?.(merged);
        return merged;
      });
    },
    [injectedAuth]
  );
  const clearAuth = useCallback(() => {
    setAuthState((prev) => ({
      ...prev,
      token: null,
      access_token: null,
      user: null,
      isSignedIn: false
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
      clearAuth
    };
  }, [authType, injectedAuth, authState, setAuth, clearAuth]);
  useEffect(() => {
    const devToken = resolvedConfig?.posthogDeveloperToken || config?.posthogDeveloperToken || (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN_DEVELOPER : null);
    const devHost = resolvedConfig?.posthogDeveloperHost || config?.posthogDeveloperHost || (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_POSTHOG_HOST_DEVELOPER : null) || "https://us.i.posthog.com";
    if (devToken) {
      const devPh = initDeveloperPostHog({
        token: devToken,
        apiHost: devHost,
        enabledInDev: resolvedConfig?.enablePosthogInDev || config?.enablePosthogInDev
      });
      if (devPh) {
        setDeveloperSuperProperties({
          storeId: resolvedConfig?.storeId || resolvedConfig?.orgId || null,
          regionId: resolvedRegionId,
          currency: resolvedCurrency,
          locale: resolvedLocale,
          authType,
          environment: typeof process !== "undefined" && process.env?.NODE_ENV ? process.env.NODE_ENV : "unknown"
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
    config?.posthogDeveloperHost
  ]);
  useEffect(() => {
    const userId = auth?.user?.id || auth?.userId || null;
    if (userId) {
      identifyDeveloperUser(userId, {
        phone: auth?.user?.phone || null,
        email: auth?.user?.email || null
      });
    }
  }, [auth?.user?.id, auth?.userId, auth?.user?.phone, auth?.user?.email]);
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
          const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cartid") : null;
          if (storedCartId && resolvedActions?.getCartById) {
            const candidate = await resolvedActions.getCartById(
              storedCartId,
              resolvedConfig?.regionId,
              { token: null }
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
          isSignedIn: auth?.isSignedIn ?? false
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
  const value = useMemo(
    () => ({
      cart,
      setCart,
      isCartLoading,
      region: resolvedRegion,
      // use the resolved region, not the stale local state
      setRegion,
      activeRegion: resolvedRegion,
      // top-level convenience field
      actions: resolvedActions,
      toast,
      auth,
      config: resolvedConfig,
      // consumers call useCore().config — key must be "config"
      orgData,
      primaryColor,
      secondaryColor,
      devLogger,
      captureDeveloperException,
      posthogDeveloper: getDeveloperPostHog()
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cart,
      isCartLoading,
      resolvedRegion,
      // was wrong: was "region" (stale local state) and "config" (raw prop)
      resolvedConfig,
      // was wrong: was raw "config" prop
      resolvedActions,
      toast,
      auth,
      orgData,
      primaryColor,
      secondaryColor
    ]
  );
  return /* @__PURE__ */ jsxs(CoreContext.Provider, { value, children: [
    /* @__PURE__ */ jsx(
      ThirdPartyScripts,
      {
        apiBaseUrl: resolvedConfig?.apiBaseUrl || config?.apiBaseUrl,
        orgId: resolvedConfig?.storeId || config?.storeId || resolvedConfig?.orgId,
        orgData
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          "--core-primary": primaryColor,
          "--core-secondary": secondaryColor
        },
        children
      }
    )
  ] });
};
var useCore = () => {
  const context = useContext(CoreContext);
  if (!context) {
    throw new Error(
      "[useCore] must be used inside <CoreProvider>. Wrap your app (or the relevant subtree) with <CoreProvider>."
    );
  }
  return context;
};

// src/hooks/useCart.js
var useCart = () => {
  const { cart, setCart, isCartLoading, config } = useCore();
  return { cart, setCart, isCartLoading, config };
};

// src/lib/gtm.js
var gtmConfig = {
  enabled: false,
  gtmContainerId: null,
  ga4MeasurementId: null
};
function initGtmConfig(config) {
  if (config) {
    gtmConfig = {
      ...gtmConfig,
      ...config
    };
  }
}
function pushToDataLayer(payload) {
  if (!gtmConfig.enabled || typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}
function clearEcommerce() {
  pushToDataLayer({ ecommerce: null });
}
function buildMeta(overrides = {}) {
  const isMobile = typeof window !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  return {
    country: "IN",
    device: isMobile ? "mobile" : "desktop",
    platform: "web",
    source: "direct",
    ...overrides
  };
}
function buildItem(product, qty = 1) {
  return {
    item_id: product?.id ?? product?.sku ?? "",
    item_name: product?.name ?? product?.line_itemable?.name ?? "",
    item_category: product?.taxons?.[0]?.display_name ?? product?.category ?? "",
    price: Number(
      product?.display_price ?? product?.price ?? product?.line_itemable?.price ?? 0
    ),
    quantity: Number(qty)
  };
}
function trackPageView(userId, metaOverrides = {}) {
  clearEcommerce();
  pushToDataLayer({
    event: "page_view",
    user_id: userId ?? null,
    ecommerce: null,
    meta: buildMeta(metaOverrides)
  });
}
function trackSearch(userId, searchTerm, metaOverrides = {}) {
  clearEcommerce();
  pushToDataLayer({
    event: "search",
    user_id: userId ?? null,
    search_term: searchTerm,
    ecommerce: null,
    meta: buildMeta(metaOverrides)
  });
}
function trackViewItem({
  userId,
  product,
  currency = "INR",
  metaOverrides = {}
}) {
  const price = Number(product?.display_price ?? product?.price ?? 0);
  clearEcommerce();
  pushToDataLayer({
    event: "view_item",
    user_id: userId ?? null,
    ecommerce: {
      currency,
      value: price,
      tax: 0,
      shipping: 0,
      discount: 0,
      items: [buildItem(product)]
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackAddToCart({
  userId,
  product,
  qty = 1,
  currency = "INR",
  metaOverrides = {}
}) {
  const price = Number(product?.display_price ?? product?.price ?? 0);
  clearEcommerce();
  pushToDataLayer({
    event: "add_to_cart",
    user_id: userId ?? null,
    ecommerce: {
      currency,
      value: price * qty,
      tax: 0,
      shipping: 0,
      discount: 0,
      items: [buildItem(product, qty)]
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackBeginCheckout({
  userId,
  cart,
  currency = "INR",
  metaOverrides = {},
  transactionId
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const tax = Number(cart?.tax_total ?? 0);
  const shipping = Number(cart?.ship_total ?? 0);
  const discount = Number(cart?.promo_total ?? 0);
  const items = (cart?.line_items ?? []).map(
    (li) => buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1)
  );
  clearEcommerce();
  pushToDataLayer({
    event: "begin_checkout",
    user_id: userId ?? null,
    ecommerce: {
      transaction_id: transactionId ?? "",
      // optional, but recommended for GA4 funnel reports
      currency,
      value,
      tax,
      shipping,
      discount: Math.abs(discount),
      items
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackPurchase({
  userId,
  transactionId,
  cart,
  currency = "INR",
  metaOverrides = {}
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const tax = Number(cart?.tax_total ?? 0);
  const shipping = Number(cart?.ship_total ?? 0);
  const discount = Number(cart?.promo_total ?? 0);
  const items = (cart?.line_items ?? []).map(
    (li) => buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1)
  );
  clearEcommerce();
  pushToDataLayer({
    event: "purchase",
    user_id: userId ?? null,
    ecommerce: {
      transaction_id: transactionId ?? "",
      // ← required for GA4 funnel reports
      currency,
      value,
      tax,
      shipping,
      discount: Math.abs(discount),
      // promo_total is usually negative
      items
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackAddShippingInfo({
  userId,
  cart,
  shippingTier = "Standard",
  currency = "INR",
  metaOverrides = {}
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const tax = Number(cart?.tax_total ?? 0);
  const shipping = Number(cart?.ship_total ?? 0);
  const discount = Number(cart?.promo_total ?? 0);
  const items = (cart?.line_items ?? []).map(
    (li) => buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1)
  );
  clearEcommerce();
  pushToDataLayer({
    event: "add_shipping_info",
    user_id: userId ?? null,
    ecommerce: {
      currency,
      value,
      tax,
      shipping,
      discount: Math.abs(discount),
      shipping_tier: shippingTier,
      items
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackAddPaymentInfo({
  userId,
  cart,
  paymentType = "Razorpay",
  currency = "INR",
  metaOverrides = {}
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const tax = Number(cart?.tax_total ?? 0);
  const shipping = Number(cart?.ship_total ?? 0);
  const discount = Number(cart?.promo_total ?? 0);
  const items = (cart?.line_items ?? []).map(
    (li) => buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1)
  );
  clearEcommerce();
  pushToDataLayer({
    event: "add_payment_info",
    user_id: userId ?? null,
    ecommerce: {
      currency,
      value,
      tax,
      shipping,
      discount: Math.abs(discount),
      payment_type: paymentType,
      items
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackApplyCoupon({
  userId,
  cart,
  couponCode,
  currency = "INR",
  metaOverrides = {}
}) {
  const discount = Math.abs(Number(cart?.promo_total ?? 0));
  const items = (cart?.line_items ?? []).map(
    (li) => buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1)
  );
  clearEcommerce();
  pushToDataLayer({
    event: "apply_coupon",
    user_id: userId ?? null,
    ecommerce: {
      currency,
      value: Number(cart?.total ?? 0),
      tax: Number(cart?.tax_total ?? 0),
      shipping: Number(cart?.ship_total ?? 0),
      discount,
      coupon: couponCode,
      items
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackPaymentFailed({
  userId,
  cart,
  errorCode = "",
  errorReason = "",
  currency = "INR",
  metaOverrides = {}
}) {
  const value = Number(cart?.total ?? cart?.display_total ?? 0);
  const items = (cart?.line_items ?? []).map(
    (li) => buildItem(li?.variant ?? li?.line_itemable ?? li, li?.quantity ?? 1)
  );
  clearEcommerce();
  pushToDataLayer({
    event: "payment_failed",
    user_id: userId ?? null,
    ecommerce: {
      currency,
      value,
      tax: Number(cart?.tax_total ?? 0),
      shipping: Number(cart?.ship_total ?? 0),
      discount: Math.abs(Number(cart?.promo_total ?? 0)),
      items,
      error_code: errorCode,
      error_reason: errorReason
    },
    meta: buildMeta(metaOverrides)
  });
}
function trackCustomEvent(eventName, userId, ecommerce = {}, metaOverrides = {}) {
  clearEcommerce();
  pushToDataLayer({
    event: eventName,
    user_id: userId ?? null,
    ecommerce: {
      currency: "INR",
      value: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      items: [],
      ...ecommerce
    },
    meta: buildMeta(metaOverrides)
  });
}

// src/lib/metaPixel.js
var metaPixelConfig = {
  enabled: false,
  pixelId: null,
  enabledEvents: []
  // Array of enabled event IDs, e.g., ["PageView", "Purchase"]
};
function initMetaPixelConfig(config) {
  if (config) {
    metaPixelConfig = {
      ...metaPixelConfig,
      ...config
    };
  }
}
function isEventEnabled(eventName) {
  return metaPixelConfig.enabled && metaPixelConfig.pixelId && metaPixelConfig.enabledEvents.includes(eventName);
}
function fbq(...args) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}
function trackMetaPageView() {
  if (!isEventEnabled("PageView")) return;
  fbq("track", "PageView");
}
function trackMetaViewContent(product) {
  if (!isEventEnabled("ViewContent")) return;
  if (!product) return;
  fbq("track", "ViewContent", {
    content_ids: [product.id || product.sku || ""],
    content_name: product.name || "",
    content_type: "product",
    value: Number(product.price ? product.price / 100 : 0),
    currency: "INR"
  });
}
function trackMetaSearch(searchQuery) {
  if (!isEventEnabled("Search")) return;
  if (!searchQuery) return;
  fbq("track", "Search", {
    search_string: searchQuery
  });
}
function trackMetaAddToCart(product, qty = 1) {
  if (!isEventEnabled("AddToCart")) return;
  if (!product) return;
  fbq("track", "AddToCart", {
    content_ids: [product.id || product.sku || ""],
    content_name: product.name || "",
    content_type: "product",
    value: Number(product.price ? product.price / 100 : 0) * Number(qty),
    currency: "INR",
    contents: [
      {
        id: product.id || product.sku || "",
        quantity: Number(qty)
      }
    ]
  });
}
function trackMetaInitiateCheckout(cart) {
  if (!isEventEnabled("InitiateCheckout")) return;
  if (!cart) return;
  const contentIds = cart.line_items?.map((item) => item.variant_id || item.id) || [];
  const contents = cart.line_items?.map((item) => ({
    id: item.variant_id || item.id,
    quantity: item.quantity
  })) || [];
  fbq("track", "InitiateCheckout", {
    content_ids: contentIds,
    contents,
    value: Number(cart.total ? cart.total / 100 : 0),
    currency: "INR",
    num_items: cart.item_count || cart.line_items?.length || 0
  });
}
function trackMetaAddPaymentInfo(cart) {
  if (!isEventEnabled("AddPaymentInfo")) return;
  fbq("track", "AddPaymentInfo", {
    value: Number(cart?.total ? cart.total / 100 : 0),
    currency: "INR"
  });
}
function trackMetaPurchase(order) {
  if (!isEventEnabled("Purchase")) return;
  if (!order) return;
  const contentIds = order.line_items?.map((item) => item.variant_id || item.id) || [];
  const contents = order.line_items?.map((item) => ({
    id: item.variant_id || item.id,
    quantity: item.quantity
  })) || [];
  fbq("track", "Purchase", {
    content_ids: contentIds,
    contents,
    value: Number(order.total ? order.total / 100 : 0),
    currency: "INR",
    num_items: order.item_count || order.line_items?.length || 0
  });
}
function trackMetaCompleteRegistration() {
  if (!isEventEnabled("CompleteRegistration")) return;
  fbq("track", "CompleteRegistration", {
    status: "completed"
  });
}
function trackMetaLead() {
  if (!isEventEnabled("Lead")) return;
  fbq("track", "Lead");
}

// src/hooks/useAddToCart.js
function useAddToCart() {
  const { cart, setCart, actions, toast, auth, config } = useCore();
  const [quantity, setQuantity] = useState(1);
  const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);
  const userToken = auth?.token ?? auth?.access_token ?? null;
  const isActuallySignedIn = !!((auth?.isSignedIn ?? false) && userToken);
  const regionId = config?.regionId ?? null;
  const cartItems = cart?.line_items ?? [];
  const normalizeCustomizations = (c) => {
    if (!c) return [];
    if (Array.isArray(c)) {
      return c.map((item) => ({
        id: item.product_customization_id || item.id,
        value: item.value
      }));
    }
    if (typeof c === "object") {
      return Object.entries(c).map(([id, val]) => ({
        id: parseInt(id),
        value: typeof val === "object" ? val?.value : val
      }));
    }
    return [];
  };
  const areCustomizationsEqual = (c1, c2) => {
    const norm1 = normalizeCustomizations(c1);
    const norm2 = normalizeCustomizations(c2);
    if (norm1.length !== norm2.length) return false;
    norm1.sort((a, b) => a.id - b.id);
    norm2.sort((a, b) => a.id - b.id);
    return norm1.every(
      (item, index) => item.id === norm2[index].id && String(item.value) === String(norm2[index].value)
    );
  };
  const getCartItem = (product, customizations = []) => {
    if (!cart?.line_items) return null;
    return cart.line_items.find(
      (item) => item.line_itemable?.id === product?.id && areCustomizationsEqual(
        item.line_items_customizations,
        customizations
      )
    ) ?? null;
  };
  const refreshCart = async (cartId) => {
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
  const addItemToCart = async (product, resolvedCartId, customizations = [], overrideQty = null) => {
    const sellingQTY = product?.selling_quantity?.values?.[0]?.label;
    const qty = overrideQty !== null ? overrideQty : quantity ?? 1;
    const existingLineItem = getCartItem(product, customizations);
    if (existingLineItem && !sellingQTY) {
      const newQty = existingLineItem.quantity + qty;
      await actions.updateLineItem?.(
        existingLineItem.id,
        { quantity: newQty },
        { token: userToken }
      );
    } else {
      const body = {
        line_itemable_id: product?.id,
        quantity: qty,
        line_items_customizations: customizations,
        ...resolvedCartId && !isActuallySignedIn ? { cart_id: resolvedCartId } : {},
        ...regionId ? { region_id: regionId } : {}
      };
      await actions.createLineItem?.(body, { token: userToken });
    }
    setQuantity(sellingQTY ? Number(sellingQTY) : 1);
    if (resolvedCartId) {
      await refreshCart(resolvedCartId);
    }
  };
  const handleAddToCart = async (product, customizations = [], overrideQty = null) => {
    try {
      setIsAddToCartLoading(true);
      const storedCartId = typeof window !== "undefined" ? localStorage.getItem("cartid") : null;
      let resolvedCartId = cart?.id ?? storedCartId;
      if (!cart) {
        const payload = {
          number: "",
          item_total: 0,
          total: 0,
          currency: "",
          cart_sales_channels: "web",
          order_type: "delivery",
          ...regionId ? { region_id: regionId } : {}
        };
        const createdCart = await actions.createCart?.(payload, {
          token: userToken
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
      const userId = auth?.user?.id ?? auth?.user?.userId ?? null;
      const currency = config?.currency ?? "INR";
      const qty = overrideQty !== null ? overrideQty : quantity ?? 1;
      trackAddToCart({ userId, product, qty, currency });
      trackMetaAddToCart(product, qty);
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
  const handleDecreaseQty = async (product, customizations = []) => {
    const existingLineItem = getCartItem(product, customizations);
    if (!existingLineItem) return;
    try {
      setIsAddToCartLoading(true);
      if (existingLineItem.quantity <= 1) {
        await actions.deleteLineItem?.(existingLineItem.id, {
          token: userToken
        });
      } else {
        await actions.updateLineItem?.(
          existingLineItem.id,
          { quantity: existingLineItem.quantity - 1 },
          { token: userToken }
        );
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
  const handleDeleteLineItem = async (product) => {
    try {
      await actions.deleteLineItem?.(product?.id);
      const activeCartId = cart?.id;
      if (activeCartId) {
        await refreshCart(activeCartId);
      }
      const userId = auth?.user?.id ?? auth?.user?.userId ?? null;
      const currency = config?.currency ?? "INR";
      trackCustomEvent("remove_from_cart", userId, {
        currency,
        value: Number(product?.line_itemable?.price ?? 0) * (product?.quantity ?? 1),
        items: [buildItem(product, product?.quantity ?? 1)]
      });
      toast?.success?.(
        `${product?.line_itemable?.name || "Item"} removed from cart`
      );
    } catch (err) {
      console.error("[useAddToCart] handleDeleteLineItem error:", err);
      const errorMsg = err?.data?.error || err?.message;
      if (errorMsg && typeof errorMsg === "string") {
        toast?.error?.(errorMsg);
      } else {
        toast?.error?.(
          `Failed to remove ${product?.line_itemable?.name || "item"}`
        );
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

// src/hooks/useCurrencyFormat.js
function useCurrencyFormat() {
  const { config, orgData } = useCore();
  const activeRegion = config?.isRegion ? config?.activeRegion ?? config?.region ?? null : null;
  const currency = activeRegion?.currency ?? config?.currency ?? orgData?.organization_setting?.currency ?? "INR";
  const locale = activeRegion?.locale ?? config?.locale ?? orgData?.organization_setting?.locale ?? "en-IN";
  const currencySymbol = activeRegion?.invoice_setting?.currency_symbol ?? activeRegion?.currency_symbol ?? null;
  const formatCurrency = (amount) => {
    if (amount == null) return "";
    const numericAmount = Number(amount);
    const formattedAmount = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
    if (currencySymbol) {
      return `${currencySymbol}${formattedAmount}`;
    }
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency
    }).format(numericAmount);
  };
  return { formatCurrency };
}

// src/hooks/useAuth.js
var useAuth = () => {
  const { auth } = useCore();
  return auth ?? {};
};
var useLogout = () => {
  const { auth } = useCore();
  const router = useRouter();
  const logout = async () => {
    if (auth?.logout) {
      await auth.logout();
    } else {
      if (auth?.clearAuth) {
        auth.clearAuth();
      }
      localStorage.removeItem("cartid");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      try {
        Cookies.remove("access_token", { path: "/" });
      } catch (e) {
        console.error("Failed to remove cookies using js-cookie:", e);
      }
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      try {
        await fetch("/api/logout", { method: "POST" });
      } catch (e) {
        console.error("Failed to call /api/logout:", e);
      }
      router.push("/");
    }
    router.refresh();
  };
  return logout;
};
function useVariantSelection(rawProduct) {
  const [selectedOptionsType, setSelectedOptionsType] = useState([]);
  const allVariantOptions = flatten(
    map(
      rawProduct?.variants,
      (variant) => map(variant?.variant_options, (variantOption) => ({
        types: variantOption.option_type,
        values: {
          ...variantOption.option_value,
          // Attach variant image when applicable (e.g. Color swatches)
          image: variantOption.option_type?.name?.toLowerCase() === "color" ? variant.product_images?.[0] : "",
          variant_id: variantOption?.variant?.id,
          // All variant IDs that share this option value (useful for filtering)
          variant_ids: flatten(
            compact(
              map(rawProduct?.variants, (v) => {
                const matched = filter(v?.variant_options, [
                  "option_value.id",
                  variantOption?.option_value?.id
                ]);
                return matched?.length ? v?.id : false;
              })
            )
          )
        }
      }))
    )
  );
  const variantOptionTypes = uniqBy(
    map(allVariantOptions, (v) => v?.types).filter(Boolean),
    "id"
  );
  const hasVariants = variantOptionTypes.length > 0;
  useEffect(() => {
    if (!rawProduct?.variants?.length || !hasVariants) return;
    const firstVariant = rawProduct.variants.find((v) => v.in_stock || v.purchasable) ?? rawProduct.variants[0];
    if (!firstVariant?.variant_options?.length) return;
    const autoSelections = firstVariant.variant_options.map((vo) => ({
      types: vo.option_type,
      values: vo.option_value
    }));
    setSelectedOptionsType(autoSelections);
  }, [rawProduct?.id]);
  const selectedVariant = (() => {
    if (!selectedOptionsType.length || !rawProduct?.variants?.length) return null;
    return rawProduct.variants.find(
      (variant) => selectedOptionsType.every(
        (sel) => variant.variant_options.some(
          (vo) => vo.option_type?.id === sel.types?.id && vo.option_value?.id === sel.values?.id
        )
      )
    ) ?? null;
  })();
  const isOptionAvailable = (optionType, optionValue) => {
    if (!rawProduct?.variants?.length) return false;
    return rawProduct.variants.some(
      (variant) => (variant.in_stock || variant.purchasable) && variant.variant_options.some(
        (vo) => vo.option_type?.id === optionType?.id && vo.option_value?.id === optionValue?.id
      )
    );
  };
  const getValuesForType = (optionType) => {
    if (!rawProduct?.variants) return [];
    const seen = /* @__PURE__ */ new Set();
    const vals = [];
    rawProduct.variants.forEach((v) => {
      v.variant_options?.forEach((vo) => {
        if (vo.option_type?.id === optionType?.id && !seen.has(vo.option_value?.id)) {
          seen.add(vo.option_value?.id);
          vals.push(vo.option_value);
        }
      });
    });
    return vals;
  };
  const selectOption = (optionValue, optionType) => {
    setSelectedOptionsType((prev) => {
      const isAlreadySelected = prev.some(
        (s) => s.types?.id === optionType?.id && s.values?.id === optionValue?.id
      );
      if (isAlreadySelected) {
        return prev.filter((s) => s.types?.id !== optionType?.id);
      }
      const withNewValue = [
        ...prev.filter((p) => p.types?.id !== optionType?.id),
        { types: optionType, values: optionValue }
      ];
      const exactMatch = rawProduct?.variants?.find(
        (v) => withNewValue.every(
          (sel) => v.variant_options.some(
            (vo) => vo.option_type?.id === sel.types?.id && vo.option_value?.id === sel.values?.id
          )
        )
      );
      const matchingVariant = exactMatch ?? rawProduct?.variants?.find(
        (v) => v.variant_options.some(
          (vo) => vo.option_type?.id === optionType?.id && vo.option_value?.id === optionValue?.id
        )
      );
      if (!matchingVariant) return withNewValue;
      const autoFilled = [{ types: optionType, values: optionValue }];
      matchingVariant.variant_options.forEach((vo) => {
        if (vo.option_type?.id === optionType?.id) return;
        if (!autoFilled.some((s) => s.types?.id === vo.option_type?.id)) {
          autoFilled.push({ types: vo.option_type, values: vo.option_value });
        }
      });
      return autoFilled;
    });
  };
  const getDisplayImages = (productImages = []) => {
    if (!selectedVariant?.product_images?.length) return productImages;
    return selectedVariant.product_images.map((img) => ({
      id: img.id,
      position: img.position ?? 0,
      url: img.product_image_url ?? null,
      videoUrl: img.product_video_url ?? null
    }));
  };
  return {
    /** Array of { types, values } for whatever the user has selected */
    selectedOptionsType,
    /** The matched product variant (null if no full match yet) */
    selectedVariant,
    /** Unique option types array, e.g. [Size, Color] */
    variantOptionTypes,
    /** True when the product has at least one selectable option type */
    hasVariants,
    /** fn(optionType, optionValue) → boolean – drives the disabled state of chips */
    isOptionAvailable,
    /** fn(optionType) → option value array – used to render chips per type */
    getValuesForType,
    /** Call when user taps an option chip */
    selectOption,
    /**
     * fn(fallbackImages) → image array
     * Pass your product's default images; the hook swaps them for variant
     * images when a variant with images is selected.
     */
    getDisplayImages
  };
}

// src/hooks/userCartInfo.js
var useCartInfo = () => {
  const initialCartInfo = {
    number: "",
    item_total: 0,
    total: 0,
    ship_total: 0,
    adjustment_total: 0,
    completed_at: "",
    included_tax_total: 0,
    additional_tax_total: 0,
    tax_total: 0,
    currency: "",
    email: "",
    promo_total: 0,
    item_count: 0,
    special_instructions: "",
    pre_tax_item_amount: 0,
    pre_tax_total: 0,
    shipment_state: "",
    payment_state: "",
    cart_sales_channels: "web",
    order_type: "delivery"
  };
  return { initialCartInfo };
};
var userCartInfo_default = useCartInfo;
var likedCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 5 * 60 * 1e3;
var isFresh = (entry) => entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS;
var likedSubscribers = /* @__PURE__ */ new Set();
function useGetCurrentUserLikedProductsQuery(token = null, { page = 1, perPage = 11, skip = false } = {}) {
  const isSkip = skip || !token;
  const cacheKey = token ? `likedProducts-${token}-${page}-${perPage}` : null;
  const [data, setData] = useState(
    () => cacheKey && isFresh(likedCache.get(cacheKey)) ? likedCache.get(cacheKey).data : void 0
  );
  const [isLoading, setIsLoading] = useState(
    !isSkip && !(cacheKey && isFresh(likedCache.get(cacheKey)))
  );
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const inFlightRef = useRef(null);
  const runFetch = useCallback(
    async (forceRefresh = false) => {
      if (isSkip) return;
      if (!forceRefresh && cacheKey && isFresh(likedCache.get(cacheKey))) {
        setData(likedCache.get(cacheKey).data);
        setIsLoading(false);
        return likedCache.get(cacheKey).data;
      }
      if (inFlightRef.current) {
        return inFlightRef.current;
      }
      setIsFetching(true);
      const promise = (async () => {
        try {
          const result = await getCurrentUserLikedProductsAction(page, perPage, {
            token,
            cache: forceRefresh ? "no-store" : void 0
          });
          if (cacheKey) {
            likedCache.set(cacheKey, { data: result, fetchedAt: Date.now() });
          }
          setData(result);
          setError(null);
          return result;
        } catch (err) {
          setError(err);
          return void 0;
        } finally {
          setIsLoading(false);
          setIsFetching(false);
          inFlightRef.current = null;
        }
      })();
      inFlightRef.current = promise;
      return promise;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSkip, cacheKey, token, page, perPage]
  );
  useEffect(() => {
    if (!isSkip) {
      runFetch();
    } else {
      setIsLoading(false);
    }
  }, [runFetch, isSkip]);
  useEffect(() => {
    if (isSkip) return;
    const listener = () => {
      runFetch(true);
    };
    likedSubscribers.add(listener);
    return () => {
      likedSubscribers.delete(listener);
    };
  }, [runFetch, isSkip]);
  return {
    data,
    isLoading,
    isFetching,
    isSuccess: !isLoading && !error && data !== void 0,
    isError: !!error,
    error,
    refetch: () => runFetch(true)
  };
}
function invalidateLikedProductsCache(token) {
  if (!token) return;
  for (const key of likedCache.keys()) {
    if (key.startsWith(`likedProducts-${token}`)) {
      likedCache.delete(key);
    }
  }
  likedSubscribers.forEach((subscriber) => {
    try {
      subscriber();
    } catch (e) {
      console.error("[invalidateLikedProductsCache] Subscriber error:", e);
    }
  });
}
var normalizeMode = (value) => {
  if (value === "sign-up" || value === "signup") return "signup";
  return "signin";
};
var buildOtpArray = (length) => Array.from({ length }, () => "");
var CustomOTPAuth = ({ mode = "sign-in", onLoginSuccess }) => {
  const { actions, auth, config, toast } = useCore();
  const [authMode, setAuthMode] = useState(() => normalizeMode(mode));
  const [step, setStep] = useState("phone");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef([]);
  const countryCode = config?.countryCode ?? "+91";
  const otpLength = Number(config?.otpLength ?? 6);
  const [otp, setOtp] = useState(() => buildOtpArray(otpLength));
  useEffect(() => {
    setAuthMode(normalizeMode(mode));
    setStep("phone");
    setOtp(buildOtpArray(otpLength));
  }, [mode, otpLength]);
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1e3);
    }
    return () => clearInterval(interval);
  }, [timer]);
  const isSignup = authMode === "signup";
  const otpValue = useMemo(() => otp.join(""), [otp]);
  const resetOtpStep = () => {
    setStep("phone");
    setOtp(buildOtpArray(otpLength));
    setTimer(0);
  };
  const setOtpFromResponse = (value) => {
    if (!value) return;
    const digits = value.toString().replace(/\D/g, "").slice(0, otpLength).split("");
    if (!digits.length) return;
    setOtp(
      (prev) => prev.map((_, index) => {
        return digits[index] ?? "";
      })
    );
  };
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (phone.length < 10) {
      toast?.error("Please enter a valid phone number");
      return;
    }
    if (isSignup && (!firstName.trim() || !lastName.trim())) {
      toast?.error("Please enter your first and last name");
      return;
    }
    setIsLoading(true);
    try {
      let response;
      if (isSignup) {
        if (!actions?.signup) {
          toast?.error("Signup action not configured");
          return;
        }
        response = await actions.signup({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone,
          countryCode
        });
      } else {
        if (!actions?.login) {
          toast?.error("Login action not configured");
          return;
        }
        response = await actions.login(phone, countryCode);
      }
      setStep("otp");
      setTimer(60);
      setOtp(buildOtpArray(otpLength));
      setOtpFromResponse(response?.otp_secret_key || response?.otp);
      toast?.success(
        isSignup ? "Signup OTP sent successfully" : "OTP sent successfully"
      );
    } catch (err) {
      toast?.error(err?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (otpValue.length < otpLength) {
      toast?.error(`Please enter the full ${otpLength}-digit OTP`);
      return;
    }
    setIsLoading(true);
    try {
      if (!actions?.verifyOtp) {
        toast?.error("Verify OTP action not configured");
        return;
      }
      const response = await actions.verifyOtp(
        phone,
        otpValue,
        countryCode,
        authMode
      );
      const token = response?.token ?? response?.access_token;
      if (!token) {
        toast?.error("Invalid response from server");
        return;
      }
      auth?.setAuth?.({
        token,
        access_token: response?.access_token ?? token,
        user: response?.user ?? auth?.user ?? null
      });
      toast?.success(
        isSignup ? "Account created successfully" : "Logged in successfully"
      );
      onLoginSuccess?.(response);
    } catch (err) {
      toast?.error(err?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const nextValue = value.substring(value.length - 1);
    setOtp((prev) => {
      const nextOtp = [...prev];
      nextOtp[index] = nextValue;
      return nextOtp;
    });
    if (nextValue && index < otpLength - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };
  const switchMode = (nextMode) => {
    setAuthMode(nextMode);
    setFirstName("");
    setLastName("");
    setPhone("");
    setOtp(buildOtpArray(otpLength));
    setTimer(0);
    setStep("phone");
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-[400px] mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-[var(--font-bold)] text-[var(--core-primary)]", children: step === "phone" ? isSignup ? "Create Your Account" : "Welcome Back" : "Verify OTP" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-2 font-[var(--font-regular)]", children: step === "phone" ? isSignup ? "Enter your details to create an account" : "Enter your mobile number to sign in" : `Enter the ${otpLength}-digit code sent to ${countryCode} ${phone}` })
    ] }),
    step === "phone" ? /* @__PURE__ */ jsxs("form", { onSubmit: handleSendOtp, className: "space-y-6", children: [
      isSignup && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: firstName,
            onChange: (event) => setFirstName(event.target.value),
            placeholder: "First Name",
            className: "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--core-primary)]/20 focus:border-[var(--core-primary)] outline-none transition-all font-[var(--font-medium)]",
            required: true
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: lastName,
            onChange: (event) => setLastName(event.target.value),
            placeholder: "Last Name",
            className: "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--core-primary)]/20 focus:border-[var(--core-primary)] outline-none transition-all font-[var(--font-medium)]",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-[var(--font-medium)]", children: countryCode }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "tel",
            value: phone,
            onChange: (event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10)),
            placeholder: "Mobile Number",
            className: "w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--core-primary)]/20 focus:border-[var(--core-primary)] outline-none transition-all font-[var(--font-medium)]",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isLoading || phone.length < 10,
          className: `w-full py-3 rounded-xl font-[var(--font-bold)] text-white transition-all ${isLoading || phone.length < 10 ? "bg-gray-300 cursor-not-allowed" : "bg-[var(--core-primary)] hover:bg-[var(--core-primary)] active:scale-[0.98]"}`,
          children: isLoading ? /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            "Sending..."
          ] }) : "Get OTP"
        }
      ),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-center text-gray-500 font-[var(--font-medium)]", children: [
        isSignup ? "Already have an account?" : "New here?",
        " ",
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => switchMode(isSignup ? "signin" : "signup"),
            className: "text-[var(--core-primary)] font-[var(--font-bold)] hover:underline",
            children: isSignup ? "Sign In" : "Create Account"
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleVerifyOtp, className: "space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-between gap-2", children: otp.map((digit, index) => /* @__PURE__ */ jsx(
        "input",
        {
          ref: (element) => {
            otpRefs.current[index] = element;
          },
          type: "text",
          inputMode: "numeric",
          value: digit,
          onChange: (event) => handleOtpChange(index, event.target.value),
          onKeyDown: (event) => handleKeyDown(index, event),
          className: "w-12 h-14 text-center text-xl font-[var(--font-bold)] bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--core-primary)]/20 focus:border-[var(--core-primary)] outline-none transition-all"
        },
        index
      )) }),
      /* @__PURE__ */ jsx("div", { className: "text-center", children: timer > 0 ? /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 font-[var(--font-regular)]", children: [
        "Resend OTP in ",
        /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-bold)]", children: [
          timer,
          "s"
        ] })
      ] }) : /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: handleSendOtp,
          className: "text-xs text-[var(--core-primary)] font-[var(--font-bold)] hover:underline",
          children: "Resend OTP"
        }
      ) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isLoading || otpValue.length < otpLength,
          className: `w-full py-3 rounded-xl font-[var(--font-bold)] text-white transition-all ${isLoading || otpValue.length < otpLength ? "bg-gray-300 cursor-not-allowed" : "bg-[var(--core-primary)] hover:bg-[var(--core-primary)] active:scale-[0.98]"}`,
          children: isLoading ? /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            "Verifying..."
          ] }) : isSignup ? "Verify & Create Account" : "Verify & Sign In"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: resetOtpStep,
          className: "w-full text-sm text-gray-500 font-[var(--font-medium)] hover:text-[var(--core-primary)] transition-colors",
          children: "Change Details"
        }
      )
    ] })
  ] });
};
var AuthManager = ({ mode = "sign-in", onLoginSuccess }) => {
  const { config, auth } = useCore();
  const authType = config?.authType ?? "clerk";
  if (authType === "clerk") {
    return /* @__PURE__ */ jsxs("div", { className: "w-full text-center py-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-[var(--font-bold)] text-[var(--core-primary)] mb-6", children: "Sign in to continue" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => auth?.openSignIn?.(),
            className: "w-full py-3 bg-[var(--core-primary)] text-white rounded-xl font-[var(--font-bold)] hover:opacity-90 transition-all",
            children: "Sign In"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => auth?.openSignUp?.(),
            className: "w-full py-3 border border-[var(--core-primary)] text-[var(--core-primary)] rounded-xl font-[var(--font-bold)] hover:bg-gray-50 transition-all",
            children: "Create Account"
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsx(CustomOTPAuth, { mode, onLoginSuccess });
};
var Spinner = ({ size = "md", color = "currentColor", className = "" }) => {
  const sizeMap = {
    sm: { width: 16, border: 2 },
    md: { width: 24, border: 3 },
    lg: { width: 40, border: 4 }
  };
  const { width, border } = sizeMap[size] ?? sizeMap.md;
  const style = {
    width,
    height: width,
    borderWidth: border,
    borderStyle: "solid",
    borderColor: `${color} transparent transparent transparent`,
    borderRadius: "50%",
    display: "inline-block",
    animation: "defx-spin 0.75s linear infinite",
    flexShrink: 0
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: `
                @keyframes defx-spin {
                    0%   { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            ` }),
    /* @__PURE__ */ jsx(
      "span",
      {
        role: "status",
        "aria-label": "Loading",
        style,
        className
      }
    )
  ] });
};
var CartItem = ({
  item,
  renderImage = null,
  renderActions = null,
  className = ""
}) => {
  const { handleAddToCart, handleDecreaseQty, handleDeleteLineItem, isAddToCartLoading } = useAddToCart();
  const { formatCurrency } = useCurrencyFormat();
  const product = item?.line_itemable;
  const name = product?.name ?? item?.name ?? "Product";
  const price = item?.price ?? product?.price ?? 0;
  const quantity = item?.quantity ?? 0;
  const imageUrl = product?.product_images?.[0]?.product_image_url ?? product?.image_url ?? null;
  const s = {
    row: {
      display: "flex",
      alignItems: "flex-start",
      gap: "1rem",
      padding: "1rem 0",
      borderBottom: "1px solid rgba(0,0,0,0.08)"
    },
    image: {
      width: 72,
      height: 72,
      objectFit: "cover",
      borderRadius: 8,
      flexShrink: 0,
      background: "#f3f4f6"
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
      flexShrink: 0
    },
    info: { flex: 1, minWidth: 0 },
    name: {
      fontSize: "0.9rem",
      fontWeight: 600,
      margin: "0 0 0.25rem",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    },
    price: { fontSize: "0.85rem", opacity: 0.7, margin: 0 },
    controls: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginTop: "0.5rem"
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
      lineHeight: 1
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
      transition: "opacity 0.15s"
    }
  };
  return /* @__PURE__ */ jsxs("div", { style: s.row, className, children: [
    renderImage ? renderImage(item) : imageUrl ? /* @__PURE__ */ jsx("img", { src: imageUrl, alt: name, style: s.image }) : /* @__PURE__ */ jsx("div", { style: s.imagePlaceholder, children: "\u{1F6CD}\uFE0F" }),
    /* @__PURE__ */ jsxs("div", { style: s.info, children: [
      /* @__PURE__ */ jsx("p", { style: s.name, title: name, children: name }),
      /* @__PURE__ */ jsxs("p", { style: s.price, children: [
        formatCurrency(price),
        " \xD7 ",
        quantity
      ] }),
      renderActions ? renderActions(item) : /* @__PURE__ */ jsxs("div", { style: s.controls, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            style: s.qtyBtn,
            onClick: () => handleDecreaseQty(product),
            disabled: isAddToCartLoading,
            "aria-label": "Decrease quantity",
            children: "\u2212"
          }
        ),
        /* @__PURE__ */ jsx("span", { style: s.qty, children: isAddToCartLoading ? /* @__PURE__ */ jsx(Spinner, { size: "sm" }) : quantity }),
        /* @__PURE__ */ jsx(
          "button",
          {
            style: s.qtyBtn,
            onClick: () => handleAddToCart(product),
            disabled: isAddToCartLoading,
            "aria-label": "Increase quantity",
            children: "+"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        style: s.deleteBtn,
        onClick: () => handleDeleteLineItem(product),
        disabled: isAddToCartLoading,
        "aria-label": "Remove item",
        title: "Remove",
        children: "\u2715"
      }
    )
  ] });
};
var CartSummary = ({
  className = "",
  renderFooter = null,
  labels = {}
}) => {
  const { cart } = useCart();
  const { formatCurrency } = useCurrencyFormat();
  const l = {
    subtotal: "Subtotal",
    shipping: "Shipping",
    tax: "Tax",
    total: "Total",
    itemCount: "items",
    estimatedShipping: "Calculated at checkout",
    ...labels
  };
  const itemCount = cart?.item_count ?? cart?.line_items?.length ?? 0;
  const itemTotal = cart?.item_total ?? 0;
  const shipTotal = cart?.ship_total ?? 0;
  const taxTotal = cart?.tax_total ?? 0;
  const grandTotal = cart?.total ?? itemTotal + shipTotal + taxTotal;
  const s = {
    wrapper: {
      background: "rgba(0,0,0,0.03)",
      borderRadius: 12,
      padding: "1.25rem"
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.4rem 0",
      fontSize: "0.875rem"
    },
    label: { opacity: 0.7 },
    divider: {
      height: 1,
      background: "rgba(0,0,0,0.1)",
      margin: "0.5rem 0"
    },
    totalRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.5rem 0",
      fontWeight: 700,
      fontSize: "1rem"
    }
  };
  return /* @__PURE__ */ jsxs("div", { style: s.wrapper, className, children: [
    /* @__PURE__ */ jsxs("div", { style: s.row, children: [
      /* @__PURE__ */ jsxs("span", { style: s.label, children: [
        l.subtotal,
        " (",
        itemCount,
        " ",
        l.itemCount,
        ")"
      ] }),
      /* @__PURE__ */ jsx("span", { children: formatCurrency(itemTotal) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: s.row, children: [
      /* @__PURE__ */ jsx("span", { style: s.label, children: l.shipping }),
      /* @__PURE__ */ jsx("span", { children: shipTotal > 0 ? formatCurrency(shipTotal) : l.estimatedShipping })
    ] }),
    taxTotal > 0 && /* @__PURE__ */ jsxs("div", { style: s.row, children: [
      /* @__PURE__ */ jsx("span", { style: s.label, children: l.tax }),
      /* @__PURE__ */ jsx("span", { children: formatCurrency(taxTotal) })
    ] }),
    /* @__PURE__ */ jsx("div", { style: s.divider }),
    /* @__PURE__ */ jsxs("div", { style: s.totalRow, children: [
      /* @__PURE__ */ jsx("span", { children: l.total }),
      /* @__PURE__ */ jsx("span", { children: formatCurrency(grandTotal) })
    ] }),
    renderFooter?.()
  ] });
};
var EmptyState = ({
  icon = null,
  title = "Nothing here yet",
  description = "",
  action = null,
  className = ""
}) => {
  const styles = {
    wrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem 1.5rem",
      textAlign: "center",
      gap: "0.75rem"
    },
    icon: {
      fontSize: "2.5rem",
      lineHeight: 1,
      opacity: 0.5
    },
    title: {
      fontSize: "1.125rem",
      fontWeight: 600,
      margin: 0,
      color: "inherit"
    },
    description: {
      fontSize: "0.875rem",
      opacity: 0.6,
      margin: 0,
      maxWidth: 320
    }
  };
  return /* @__PURE__ */ jsxs("div", { style: styles.wrapper, className, children: [
    icon && /* @__PURE__ */ jsx("span", { style: styles.icon, children: icon }),
    /* @__PURE__ */ jsx("p", { style: styles.title, children: title }),
    description && /* @__PURE__ */ jsx("p", { style: styles.description, children: description }),
    action
  ] });
};
var CartPage = ({
  className = "",
  header = null,
  emptyState = null,
  renderItem = null,
  renderSummary = null,
  renderCheckoutBtn = null,
  summaryLabels = {}
}) => {
  const { cart, isCartLoading } = useCart();
  const lineItems = cart?.line_items ?? [];
  const isEmpty = !isCartLoading && lineItems.length === 0;
  const s = {
    page: {
      maxWidth: 900,
      margin: "0 auto",
      padding: "2rem 1rem",
      fontFamily: "inherit"
    },
    heading: {
      fontSize: "1.5rem",
      fontWeight: 700,
      marginBottom: "1.5rem"
    },
    layout: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "2rem"
    },
    layoutDesktop: {
      display: "grid",
      gridTemplateColumns: "1fr 320px",
      gap: "2rem"
    },
    loadingWrapper: {
      display: "flex",
      justifyContent: "center",
      padding: "4rem 0"
    },
    items: {}
  };
  const [isWide, setIsWide] = React8.useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  React8.useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  if (isCartLoading) {
    return /* @__PURE__ */ jsxs("div", { style: s.page, className, children: [
      header ?? /* @__PURE__ */ jsx("h1", { style: s.heading, children: "Your Cart" }),
      /* @__PURE__ */ jsx("div", { style: s.loadingWrapper, children: /* @__PURE__ */ jsx(Spinner, { size: "lg" }) })
    ] });
  }
  if (isEmpty) {
    return /* @__PURE__ */ jsxs("div", { style: s.page, className, children: [
      header ?? /* @__PURE__ */ jsx("h1", { style: s.heading, children: "Your Cart" }),
      emptyState ?? /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: "\u{1F6D2}",
          title: "Your cart is empty",
          description: "Add items from the store to get started."
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { style: s.page, className, children: [
    header ?? /* @__PURE__ */ jsx("h1", { style: s.heading, children: "Your Cart" }),
    /* @__PURE__ */ jsxs("div", { style: isWide ? s.layoutDesktop : s.layout, children: [
      /* @__PURE__ */ jsx("div", { style: s.items, children: lineItems.map(
        (item) => renderItem ? /* @__PURE__ */ jsx(React8.Fragment, { children: renderItem(item) }, item.id) : /* @__PURE__ */ jsx(CartItem, { item }, item.id)
      ) }),
      renderSummary ? renderSummary() : /* @__PURE__ */ jsx(
        CartSummary,
        {
          labels: summaryLabels,
          renderFooter: renderCheckoutBtn
        }
      )
    ] })
  ] });
};
var CustomizationModal = ({
  isOpen,
  onClose,
  product,
  customizationsList,
  onConfirm,
  initialValues = {},
  initialQuantity = 1,
  isEditMode = false,
  isAddToCartLoading = false
}) => {
  const [customizations, setCustomizations] = useState({});
  const [quantity, setQuantity] = useState(initialQuantity);
  useEffect(() => {
    if (isOpen) {
      setCustomizations(initialValues);
      setQuantity(initialQuantity);
    }
  }, [isOpen, initialValues, initialQuantity]);
  const handleCustomizationChange = (customizationId, value) => {
    setCustomizations((prev) => ({
      ...prev,
      [customizationId]: value
    }));
  };
  const handleConfirm = () => {
    onConfirm(customizations, quantity);
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-xl font-[var(--font-bold)] text-[var(--main)] mb-4", children: [
      isEditMode ? "Edit" : "Customize",
      " ",
      product?.name
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4 mb-6 max-h-[400px] overflow-y-auto", children: customizationsList.map((customization) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-[var(--font-medium)] text-[var(--main)] mb-2", children: customization.name }),
      customization.customization_type === "select" ? /* @__PURE__ */ jsxs(
        "select",
        {
          value: customizations[customization.id]?.value || "",
          onChange: (e) => handleCustomizationChange(customization.id, e.target.value),
          className: "w-full border border-[#e8e5df] rounded-md p-2 text-sm",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select an option" }),
            customization.customization_values?.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.value, children: opt.label }, opt.id))
          ]
        }
      ) : /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: customizations[customization.id]?.value || "",
          onChange: (e) => handleCustomizationChange(customization.id, e.target.value),
          placeholder: `Enter ${customization.name}`,
          className: "w-full border border-[#e8e5df] rounded-md p-2 text-sm"
        }
      )
    ] }, customization.id)) }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-[var(--font-medium)] text-[var(--main)] mb-2", children: "Quantity" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center border border-[#e8e5df] rounded-md w-fit", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setQuantity(Math.max(1, quantity - 1)),
            disabled: isAddToCartLoading,
            className: "w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[var(--core-primary)] disabled:opacity-50",
            children: "-"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "w-10 text-center font-semibold text-[var(--core-primary)]", children: quantity }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setQuantity(quantity + 1),
            disabled: isAddToCartLoading,
            className: "w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[var(--core-primary)] disabled:opacity-50",
            children: "+"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          disabled: isAddToCartLoading,
          className: "flex-1 px-4 py-2 border border-[#e8e5df] rounded-md text-sm font-[var(--font-medium)] hover:bg-gray-50 disabled:opacity-50",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleConfirm,
          disabled: isAddToCartLoading,
          className: "flex-1 px-4 py-2 bg-[var(--core-primary)] text-white rounded-md text-sm font-[var(--font-medium)] hover:bg-[var(--core-primary)] disabled:opacity-50",
          children: isAddToCartLoading ? "Loading..." : isEditMode ? "Update" : "Add to Cart"
        }
      )
    ] })
  ] }) });
};
var CustomizationModal_default = CustomizationModal;
var ViewCustomizationModal = ({
  isOpen,
  onClose,
  customizations = [],
  productName = ""
}) => {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-xl font-[var(--font-bold)] text-[var(--main)] mb-4", children: [
      "Customizations for ",
      productName
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3 mb-6 max-h-[400px] overflow-y-auto", children: customizations.length > 0 ? customizations.map((customization, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "border border-[#e8e5df] rounded-md p-3",
        children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-[var(--font-medium)] text-[var(--main)]", children: customization.name || `Custom ${index + 1}` }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mt-1", children: customization.value })
        ]
      },
      `${customization.product_customization_id}-${index}`
    )) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "No customizations added" }) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "w-full px-4 py-2 bg-[var(--core-primary)] text-white rounded-md text-sm font-[var(--font-medium)] hover:bg-[var(--core-primary)]",
        children: "Close"
      }
    )
  ] }) });
};
var ViewCustomizationModal_default = ViewCustomizationModal;
var DeleteIcon = ({ onClick, disabled, className, title }) => /* @__PURE__ */ jsx(
  "button",
  {
    type: "button",
    onClick,
    disabled,
    className,
    title,
    "aria-label": title || "Delete",
    children: /* @__PURE__ */ jsxs(
      "svg",
      {
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
          /* @__PURE__ */ jsx("polyline", { points: "3 6 5 6 21 6" }),
          /* @__PURE__ */ jsx("path", { d: "M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" }),
          /* @__PURE__ */ jsx("path", { d: "M10 11v6M14 11v6" }),
          /* @__PURE__ */ jsx("path", { d: "M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" })
        ]
      }
    )
  }
);
var noProductImage = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#E0E0E0"/>
    <path d="M152.5 313.5L190.369 275.63C192.526 273.475 195.451 272.263 198.5 272.263C201.549 272.263 204.474 273.475 206.631 275.63L213.37 282.37C215.526 284.525 218.451 285.737 221.5 285.737C224.549 285.737 227.474 284.525 229.63 282.37L262.739 249.261C267.052 244.949 272.901 242.527 279 242.527C285.099 242.527 290.948 244.949 295.261 249.261L359.5 313.5M152.5 175.5V336.5C152.5 339.55 153.712 342.475 155.868 344.632C158.025 346.788 160.95 348 164 348H348C351.05 348 353.975 346.788 356.132 344.632C358.288 342.475 359.5 339.55 359.5 336.5V175.5C359.5 172.45 358.288 169.525 356.132 167.368C353.975 165.212 351.05 164 348 164H164C160.95 164 158.025 165.212 155.868 167.368C153.712 169.525 152.5 172.45 152.5 175.5ZM210 210C210 213.05 211.212 215.975 213.368 218.132C215.525 220.288 218.45 221.5 221.5 221.5C224.55 221.5 227.475 220.288 229.632 218.132C231.788 215.975 233 213.05 233 210C233 206.95 231.788 204.025 229.632 201.868C227.475 199.712 224.55 198.5 221.5 198.5C218.45 198.5 215.525 199.712 213.368 201.868C211.212 204.025 210 206.95 210 210Z" stroke="#7B7B7B" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
)}`;
var ProductlistCard = ({ product, component, orderType }) => {
  const { name, price, shipping_charge } = product?.line_itemable ?? {};
  const productImage = product?.image;
  const quantity = product?.quantity;
  const displayPrice = (price ?? 0) / 100;
  const isSellingQty = !!product?.line_itemable?.selling_quantity_id;
  const variantOptions = product?.line_itemable?.variant_options ?? [];
  const { formatCurrency } = useCurrencyFormat();
  const {
    handleDeleteLineItem,
    handleDecreaseQty,
    handleAddToCart,
    isAddToCartLoading
  } = useAddToCart();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const handleNavigateToProduct = () => {
    const lineItemable = product?.line_itemable;
    if (!lineItemable) return;
    const productId = lineItemable?.product_id ?? lineItemable?.id;
    const variantId = lineItemable?.product_id ? lineItemable?.id : null;
    const taxonId = lineItemable?.taxons?.[0]?.id ?? "taxon";
    let url = `/product/${productId}?taxonid=${taxonId}`;
    if (variantId) url += `&variantId=${variantId}`;
    if (quantity && quantity > 1) url += `&qty=${quantity}`;
    window.location.href = url;
  };
  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = noProductImage;
  };
  const handleDeleteItem = async () => {
    await handleDeleteLineItem(product);
  };
  const handleEditConfirm = async (newCustomizations, newQty) => {
    try {
      await handleDeleteLineItem(product);
      await handleAddToCart(product?.line_itemable, newCustomizations, newQty);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };
  const initialCustomizationObj = (product?.line_items_customizations || []).reduce((acc, c) => {
    acc[c.product_customization_id] = c;
    return acc;
  }, {});
  const customizationsList = product?.line_itemable?.product_customizations || [];
  const hasCustomizations = product?.line_items_customizations?.length > 0 || customizationsList.length > 0;
  const isDeleted = !product?.line_itemable || product?.line_itemable_deleted;
  if (isDeleted) {
    return /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-[10px] flex-1 min-w-0 opacity-50", children: [
        /* @__PURE__ */ jsxs("div", { className: "w-[112px] h-[124px] flex-shrink-0 overflow-hidden relative", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: productImage || noProductImage,
              alt: name || "Product",
              className: "w-[112px] h-[124px] object-cover rounded-lg",
              onError: handleImageError
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-white text-xs font-[var(--font-bold)] text-center", children: "UNAVAILABLE" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between h-[124px] flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-base text-[var(--main)] line-clamp-1", children: name }),
            /* @__PURE__ */ jsx("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-[var(--font-medium)] flex-shrink-0", children: "Deleted" })
          ] }) }),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-medium)] text-base text-[var(--main)]", children: [
            quantity,
            " x ",
            formatCurrency(displayPrice)
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between items-end h-[124px] flex-shrink-0", children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-col items-end text-right opacity-50", children: /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-base text-[var(--main)] line-clamp-2", children: formatCurrency(displayPrice * quantity) }) }),
        component !== "order" && /* @__PURE__ */ jsx(
          DeleteIcon,
          {
            onClick: handleDeleteItem,
            className: "cursor-pointer opacity-100 hover:opacity-80 transition-opacity",
            title: "Delete item"
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex gap-[10px] flex-1 min-w-0 cursor-pointer",
        onClick: handleNavigateToProduct,
        title: "View product",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-[112px] h-[124px] flex-shrink-0 overflow-hidden", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: productImage || noProductImage,
              alt: name || "Product",
              className: "w-[112px] h-[124px] object-cover rounded-lg hover:opacity-90 transition-opacity",
              onError: handleImageError
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between h-[124px] flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-base text-[var(--main)] line-clamp-1 hover:underline", children: name }),
                product?.bogo_benefit?.benefit_type === "free" && /* @__PURE__ */ jsx("span", { className: "text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-[var(--font-medium)] flex-shrink-0 whitespace-nowrap", children: "FREE" })
              ] }),
              variantOptions.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-1 flex flex-wrap gap-1", children: variantOptions.map((vo, i) => /* @__PURE__ */ jsxs(
                "span",
                {
                  className: "text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-[var(--font-medium)]",
                  children: [
                    vo?.option_type?.presentation ?? vo?.option_type?.name,
                    ":",
                    " ",
                    vo?.option_value?.presentation ?? vo?.option_value?.name
                  ]
                },
                i
              )) }),
              product?.line_items_customizations?.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-1 flex flex-col gap-0.5", children: product.line_items_customizations.length > 3 ? /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    setIsViewModalOpen(true);
                  },
                  className: "text-xs text-[var(--core-primary)] underline hover:text-[var(--core-primary)] transition-colors text-left font-medium",
                  children: "customizations: view"
                }
              ) : product.line_items_customizations.map((c) => /* @__PURE__ */ jsxs(
                "p",
                {
                  className: "text-xs text-gray-500 line-clamp-1",
                  children: [
                    /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                      c.name || "Custom",
                      ":"
                    ] }),
                    " ",
                    c.value
                  ]
                },
                c.product_customization_id
              )) })
            ] }),
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-medium)] text-base text-[var(--main)]", children: [
              quantity,
              " x ",
              formatCurrency(displayPrice)
            ] }) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between items-end h-[124px] flex-shrink-0", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-col items-end text-right", children: component !== "order" ? /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-base text-[var(--main)] line-clamp-1", children: formatCurrency(displayPrice * quantity) }) : /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-base text-[var(--main)] line-clamp-2", children: formatCurrency(displayPrice * quantity) }) }),
      component !== "order" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        !isSellingQty ? /* @__PURE__ */ jsxs("div", { className: "flex items-center border border-[#e8e5df] rounded-md h-[28px] bg-[#f9f9f9]", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleDecreaseQty(
                product?.line_itemable,
                product?.line_items_customizations
              ),
              disabled: isAddToCartLoading,
              className: "w-7 h-full flex items-center justify-center text-lg text-gray-500 hover:text-[var(--core-primary)] transition-colors disabled:opacity-50 pb-0.5",
              children: "-"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "w-6 text-center text-sm font-semibold text-[var(--core-primary)] bg-white h-full flex items-center justify-center border-x border-[#e8e5df]", children: quantity }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleAddToCart(
                product?.line_itemable,
                product?.line_items_customizations,
                1
              ),
              disabled: isAddToCartLoading,
              className: "w-7 h-full flex items-center justify-center text-base text-gray-500 hover:text-[var(--core-primary)] transition-colors disabled:opacity-50 pb-0.5",
              children: "+"
            }
          )
        ] }) : /* @__PURE__ */ jsx("div", { className: "flex items-center border border-[#e8e5df] rounded-md h-[28px] bg-[#f9f9f9] px-3", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-[var(--core-primary)]", children: quantity }) }),
        /* @__PURE__ */ jsx(
          DeleteIcon,
          {
            onClick: handleDeleteItem,
            disabled: isAddToCartLoading,
            className: "cursor-pointer opacity-100 hover:opacity-80 transition-opacity disabled:opacity-50",
            title: "Delete item"
          }
        )
      ] })
    ] }),
    hasCustomizations && /* @__PURE__ */ jsx(
      CustomizationModal_default,
      {
        isOpen: isEditModalOpen,
        onClose: () => setIsEditModalOpen(false),
        product: product?.line_itemable,
        customizationsList,
        onConfirm: handleEditConfirm,
        initialValues: initialCustomizationObj,
        initialQuantity: quantity,
        isEditMode: true,
        isAddToCartLoading
      }
    ),
    /* @__PURE__ */ jsx(
      ViewCustomizationModal_default,
      {
        isOpen: isViewModalOpen,
        onClose: () => setIsViewModalOpen(false),
        customizations: product?.line_items_customizations || [],
        productName: name
      }
    )
  ] });
};
var ProductlistCard_default = ProductlistCard;
var Popup = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-[600px]",
  style = {}
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      setMounted(false);
    };
  }, [isOpen]);
  if (!isOpen || !mounted) return null;
  const modalContent = /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-[2px] transition-all duration-300 sm:p-4",
      onClick: (e) => {
        if (e.target === e.currentTarget) onClose();
      },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: `relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-2xl animate-in fade-in zoom-in duration-200 ${maxWidth}`,
          style,
          children: [
            (title || onClose) && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10", children: [
              title && /* @__PURE__ */ jsx("h2", { className: "text-[20px] font-[var(--font-bold)] text-[var(--core-primary)] uppercase tracking-wide", children: title }),
              onClose && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onClose,
                  className: "text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 ml-auto",
                  "aria-label": "Close",
                  children: /* @__PURE__ */ jsx(
                    "svg",
                    {
                      className: "w-6 h-6",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24",
                      children: /* @__PURE__ */ jsx(
                        "path",
                        {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M6 18L18 6M6 6l12 12"
                        }
                      )
                    }
                  )
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto p-4 sm:p-6", children })
          ]
        }
      )
    }
  );
  return createPortal(modalContent, document.body);
};
var AddressForm = ({
  initialData,
  onSuccess,
  onCancel,
  submitLabel = "Save Address"
}) => {
  const { actions, toast } = useCore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    address_type: initialData?.address_type || "shipping",
    address1: initialData?.address1 || "",
    address2: initialData?.address2 || "",
    city: initialData?.city || "",
    zipcode: initialData?.zipcode || "",
    phone: initialData?.phone || "",
    firstname: initialData?.firstname || "",
    lastname: initialData?.lastname || "",
    state_name: initialData?.state_name || "",
    country_name: initialData?.country_name || "India",
    country_iso3: initialData?.country_iso3 || "IND",
    country_iso: initialData?.country_iso || "IN",
    state_code: initialData?.state_code || "",
    label: initialData?.label || "Home"
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        if (actions?.updateAddress) {
          await actions.updateAddress(initialData.id, formData);
          toast?.success?.("Address updated successfully!");
        } else {
          throw new Error("actions.updateAddress is not defined");
        }
      } else {
        if (actions?.createAddress) {
          await actions.createAddress(formData);
          toast?.success?.("Address added successfully!");
        } else {
          throw new Error("actions.createAddress is not defined");
        }
      }
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save address:", err);
      toast?.error?.(err.message || "Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const inputCls = "w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--core-primary)] font-[var(--font-regular)]";
  const labelCls = "text-sm font-[var(--font-bold)] text-[var(--core-primary)]";
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("label", { className: labelCls, children: "First Name *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "firstname",
            value: formData.firstname,
            onChange: handleChange,
            placeholder: "First name",
            required: true,
            className: inputCls
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("label", { className: labelCls, children: "Last Name *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "lastname",
            value: formData.lastname,
            onChange: handleChange,
            placeholder: "Last name",
            required: true,
            className: inputCls
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("label", { className: labelCls, children: "Phone *" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          name: "phone",
          value: formData.phone,
          onChange: handleChange,
          placeholder: "Phone number",
          required: true,
          className: inputCls
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("label", { className: labelCls, children: "Address Line 1 *" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          name: "address1",
          value: formData.address1,
          onChange: handleChange,
          placeholder: "Street address",
          required: true,
          className: inputCls
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("label", { className: labelCls, children: "Address Line 2" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          name: "address2",
          value: formData.address2,
          onChange: handleChange,
          placeholder: "Apartment, suite, etc.",
          className: inputCls
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("label", { className: labelCls, children: "City *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "city",
            value: formData.city,
            onChange: handleChange,
            placeholder: "City",
            required: true,
            className: inputCls
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("label", { className: labelCls, children: "State/Province *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "state_name",
            value: formData.state_name,
            onChange: handleChange,
            placeholder: "State",
            required: true,
            className: inputCls
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("label", { className: labelCls, children: "Country *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "country_name",
            value: formData.country_name,
            onChange: handleChange,
            placeholder: "Country",
            required: true,
            className: `${inputCls} bg-gray-50`
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("label", { className: labelCls, children: "Postal Code *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "zipcode",
            value: formData.zipcode,
            onChange: handleChange,
            placeholder: "Postal code",
            required: true,
            className: inputCls
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("label", { className: labelCls, children: "Label (e.g., Home, Office)" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          name: "label",
          value: formData.label,
          onChange: handleChange,
          placeholder: "Label",
          className: inputCls
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-gray-100 bg-white px-4 pt-4 pb-1 sm:-mx-6 sm:px-6", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          className: `w-full py-3 bg-[var(--core-primary)] text-white rounded-md font-[var(--font-bold)] transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-[12px] shadow-lg shadow-blue-100 ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`,
          children: [
            isSubmitting && /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }),
            isSubmitting ? "Saving..." : submitLabel
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        onCancel && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onCancel,
            className: "flex-1 py-3 border border-gray-100 rounded-md text-[var(--core-primary)] font-[var(--font-bold)] hover:bg-gray-50 transition-colors uppercase tracking-widest text-[12px]",
            children: "Cancel"
          }
        ),
        initialData?.id && actions?.deleteAddress && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            disabled: isSubmitting,
            onClick: async () => {
              if (window.confirm("Are you sure you want to delete this address?")) {
                setIsSubmitting(true);
                try {
                  await actions.deleteAddress(initialData.id);
                  toast?.success?.("Address deleted successfully.");
                  onSuccess?.();
                } catch (err) {
                  toast?.error?.("Failed to delete address.");
                } finally {
                  setIsSubmitting(false);
                }
              }
            },
            className: "flex-1 py-3 border border-red-100 text-red-500 rounded-md font-[var(--font-bold)] hover:bg-red-50 transition-colors uppercase tracking-widest text-[12px]",
            children: "Delete Address"
          }
        )
      ] })
    ] })
  ] });
};
var AddressFormInline = ({ refetch }) => {
  const [isOpen, setIsOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[14px] text-[var(--secondary)] mb-3", children: "No addresses saved yet." }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "font-[var(--font-medium)] text-[var(--main)] underline text-sm",
        children: "+ Add your first address"
      }
    ),
    /* @__PURE__ */ jsx(
      AddAddressForm,
      {
        isOpen,
        onClose: () => setIsOpen(false),
        refetch
      }
    )
  ] });
};
var AddAddressForm = ({ isOpen, onClose, refetch }) => {
  return /* @__PURE__ */ jsx(Popup, { isOpen, onClose, title: "Add New Address", children: /* @__PURE__ */ jsx(
    AddressForm,
    {
      onSuccess: () => {
        refetch?.();
        onClose();
      },
      onCancel: onClose,
      submitLabel: "Add Address"
    }
  ) });
};
var AddressSelection = ({
  cart,
  setCart,
  address,
  sameAsShipping,
  user,
  setSameAsShipping,
  shippingAddressId,
  billingAddressId,
  setSelectedAddress,
  isCartHaveBillingAddress,
  isCarthaveShippingAddress,
  refetch
}) => {
  const { actions } = useCore();
  const [isOpenAddAddress, setIsOpenAddAddress] = useState(false);
  const updateCart = useCallback(
    async (apiData) => {
      try {
        if (actions?.updateCart) {
          const res = await actions.updateCart(apiData?.id, apiData);
          setCart((prev) => res);
        }
      } catch (err) {
        console.error("Failed to update cart address:", err);
      }
    },
    [actions, setCart]
  );
  const onSwitchChange = () => {
    const next = !sameAsShipping;
    setSameAsShipping(next);
    if (next) {
      updateCart({
        id: cart?.id,
        billing_address_id: shippingAddressId,
        shipping_address_id: shippingAddressId
      });
    } else {
      const billingAddr = address.find((a) => a?.id !== shippingAddressId);
      updateCart({
        id: cart?.id,
        billing_address_id: billingAddr?.id,
        shipping_address_id: shippingAddressId
      });
    }
  };
  const onSelectedAddress = (addressId, type) => {
    const apiData = { id: cart?.id };
    if (type === "billing") {
      setSelectedAddress((prev) => ({ ...prev, billingAddressId: addressId }));
      apiData.billing_address_id = addressId;
    } else {
      setSelectedAddress((prev) => ({ ...prev, shippingAddressId: addressId }));
      apiData.shipping_address_id = addressId;
    }
    updateCart(apiData);
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full flex justify-center", children: [
    /* @__PURE__ */ jsxs("div", { className: "w-full space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-[var(--font-medium)] text-[20px] text-[var(--main)] tracking-wide", children: "SHIPPING ADDRESS" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "text-base font-[var(--font-medium)] text-[var(--main)] hover:underline",
              onClick: () => setIsOpenAddAddress(true),
              children: "Add new address"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full flex flex-col gap-y-[8px]", children: address.map((data) => /* @__PURE__ */ jsx(
          AddressSelectionCard,
          {
            data,
            isSelected: data?.id === shippingAddressId,
            onClick: () => onSelectedAddress(data?.id, "shipping")
          },
          data?.id
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-[var(--font-medium)] text-[20px] text-[var(--main)] tracking-wide", children: "BILLING ADDRESS" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "text-base font-[var(--font-medium)] text-[var(--main)] hover:underline",
              onClick: () => setIsOpenAddAddress(true),
              children: "Add new address"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex items-center justify-between mb-6 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${sameAsShipping ? "border-[var(--core-primary)] bg-gray-50 shadow-sm" : "border-gray-200 hover:border-gray-300"}`,
            onClick: onSwitchChange,
            children: [
              /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-base text-[var(--main)]", children: "Same as Shipping address" }),
              /* @__PURE__ */ jsxs("div", { className: "relative w-12 h-6 flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `w-full h-full rounded-full transition-colors duration-300 ${sameAsShipping ? "bg-[var(--core-primary)]" : "bg-gray-300"}`
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `absolute left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${sameAsShipping ? "translate-x-6" : "translate-x-0"}`
                  }
                )
              ] })
            ]
          }
        ),
        !sameAsShipping && /* @__PURE__ */ jsx("div", { className: "w-full flex flex-col gap-y-[8px]", children: address.map((data) => {
          const isShipping = data?.id === shippingAddressId;
          if (isShipping) return null;
          return /* @__PURE__ */ jsx(
            AddressSelectionCard,
            {
              data,
              isSelected: data?.id === billingAddressId,
              onClick: () => onSelectedAddress(data?.id, "billing")
            },
            data?.id
          );
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      AddAddressForm,
      {
        isOpen: isOpenAddAddress,
        onClose: () => setIsOpenAddAddress(false),
        refetch
      }
    )
  ] });
};
var AddressSelectionCard = ({
  data,
  isSelected,
  onClick,
  isShippingAddress
}) => {
  const {
    label,
    firstname,
    lastname,
    phone,
    address1,
    address2,
    city,
    country_name,
    state_name
  } = data || {};
  const fullName = `${firstname ?? ""} ${lastname ?? ""}`.trim();
  const fullAddress = [address1, address2, city, state_name, country_name].filter(Boolean).join(", ");
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onClick,
      className: `w-full flex flex-col border-2 cursor-pointer transition-all duration-200 rounded-lg p-[16px] gap-y-[8px] ${isSelected ? "border-[var(--core-primary)] bg-gray-50 shadow-sm" : "border-gray-200 hover:border-gray-300"}`,
      children: [
        /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-medium)] text-[var(--main)] text-base truncate", children: [
          label,
          isShippingAddress && /* @__PURE__ */ jsx("span", { className: "font-[var(--font-regular)] text-[14px] text-[var(--secondary)] ml-1", children: "(Current shipping address)" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-[var(--borders)]" }),
        /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-regular)] text-[14px] text-[var(--main)] break-words", children: [
          fullName,
          " | ",
          phone
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-[var(--borders)]" }),
        /* @__PURE__ */ jsx(
          "p",
          {
            className: "font-[var(--font-regular)] text-[14px] text-[var(--main)] w-full break-words overflow-hidden text-ellipsis",
            style: {
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical"
            },
            children: fullAddress
          }
        )
      ]
    }
  );
};
var AddressCard = ({
  addressType,
  address,
  type,
  isSelected,
  onClick,
  paymentLabel
}) => {
  const isPayment = type === "stripe" || type === "payment";
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `w-full border-2 p-[16px] transition-all duration-200 rounded-lg ${isSelected || isPayment ? "border-[var(--core-primary)] bg-gray-50 shadow-sm" : "border-gray-200 hover:border-gray-300"} ${!isPayment ? "cursor-pointer" : ""}`,
      onClick,
      children: isPayment ? /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between", children: [
          /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-base text-[var(--main)]", children: addressType }),
          /* @__PURE__ */ jsx(
            "p",
            {
              className: "font-[var(--font-regular)] text-[var(--main)] text-[14px] mt-[8px] break-words",
              style: {
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              },
              children: address
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "ml-4 flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-[60px] h-[30px] bg-[var(--secondaryBg)] border border-[var(--borders)] rounded flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-[var(--font-bold)] text-[var(--main)]", children: paymentLabel ?? (type === "stripe" ? "Razorpay" : "Payment") }) }) })
      ] }) : /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-row justify-between items-center", children: /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-base text-[var(--main)]", children: addressType }) }),
        /* @__PURE__ */ jsx(
          "p",
          {
            className: "font-[var(--font-regular)] text-[var(--main)] text-[14px] mt-[8px] break-words",
            style: {
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            },
            children: address
          }
        )
      ] })
    }
  );
};
function CartMismatchBanner({
  serverTotal,
  clientTotal,
  freshCart,
  onDismiss,
  currency = "INR",
  locale = "en-IN"
}) {
  const { setCart } = useCart();
  const fmt = (amount) => {
    if (amount == null) return "\u2014";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  };
  const handleRefresh = () => {
    if (freshCart) setCart(freshCart);
    onDismiss?.();
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "alert",
      "aria-live": "assertive",
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        backgroundColor: "#fffbeb",
        borderBottom: "2px solid #f59e0b",
        padding: "12px 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      },
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              fontSize: "1.25rem",
              lineHeight: 1,
              marginTop: "2px",
              flexShrink: 0
            },
            children: "\u26A0\uFE0F"
          }
        ),
        /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsx(
            "p",
            {
              style: {
                margin: 0,
                fontWeight: 600,
                color: "#78350f",
                fontSize: "0.9rem"
              },
              children: "Your cart total has changed"
            }
          ),
          /* @__PURE__ */ jsxs(
            "p",
            {
              style: {
                margin: "2px 0 0",
                color: "#92400e",
                fontSize: "0.8rem",
                lineHeight: 1.4
              },
              children: [
                "A coupon or offer on your cart has expired.",
                serverTotal != null && clientTotal != null ? ` Your updated total is ${fmt(freshCart ? freshCart.display_total : serverTotal / 100)} (was ${fmt(clientTotal / 100)}).` : "",
                " ",
                "Please refresh and review before paying."
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
              marginTop: "2px"
            },
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleRefresh,
                  style: {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "#f59e0b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  },
                  children: "\u{1F504} Refresh Cart"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onDismiss,
                  "aria-label": "Dismiss",
                  style: {
                    background: "none",
                    border: "none",
                    color: "#b45309",
                    fontSize: "1rem",
                    cursor: "pointer",
                    padding: "4px"
                  },
                  children: "\u2715"
                }
              )
            ]
          }
        )
      ]
    }
  );
}
var Checkout = ({ hasDeletedItems }) => {
  const { auth, config } = useCore();
  const { isSignedIn, isLoading } = auth || {};
  if (isLoading)
    return /* @__PURE__ */ jsx("div", { className: "w-full h-[400px] flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-[var(--core-primary)] border-t-transparent rounded-full animate-spin" }) });
  return !isSignedIn ? /* @__PURE__ */ jsx(LoginPage, {}) : /* @__PURE__ */ jsx(OrderInfo, { user: auth.user, hasDeletedItems });
};
var LoginPage = () => {
  return /* @__PURE__ */ jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center gap-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center", children: /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-[var(--core-primary)]/5 rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(
      "svg",
      {
        className: "w-8 h-8 text-[var(--core-primary)]",
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          }
        )
      }
    ) }) }),
    /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(AuthManager, {}) })
  ] });
};
var OrderInfo = ({ user, hasDeletedItems }) => {
  const router = useRouter();
  const { Razorpay } = useRazorpay();
  const { cart, setCart, actions, config, auth, orgData, primaryColor, toast } = useCore();
  const activeRegion = config?.activeRegion ?? config?.region ?? null;
  const orgPaymentConfig = orgData?.organization_setting?.payment ?? {};
  const regionPaymentConfig = activeRegion?.payment_config ?? null;
  const paymentConfig = regionPaymentConfig ?? orgPaymentConfig;
  const rawPaymentGateway = activeRegion?.payment_gateway || // ← primary: region.payment_gateway
  orgPaymentConfig?.mode || orgPaymentConfig?.gateway || "";
  const paymentGateway = String(rawPaymentGateway || "razorpay").toLowerCase();
  const isStripeGateway = paymentGateway === "stripe";
  const stripePublishableKey = paymentConfig?.stripe_publishable_key ?? orgPaymentConfig?.stripe_publishable_key ?? "";
  const razorpayKeyId = paymentConfig?.razor_pay_key_id ?? orgPaymentConfig?.razor_pay_key_id ?? "";
  const paymentGatewayLabel = paymentGateway ? paymentGateway.charAt(0).toUpperCase() + paymentGateway.slice(1).replace(/_/g, " ") : "Razorpay";
  const [StripeCheckout, setStripeCheckout] = useState(
    () => getPaymentGateway("stripe")
  );
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cartMismatch, setCartMismatch] = useState(null);
  useEffect(() => {
    let isMounted = true;
    const loadStripeGateway = async () => {
      try {
        await import('./stripe.js');
        if (isMounted) {
          setStripeCheckout(() => getPaymentGateway("stripe"));
        }
      } catch (error) {
        console.error("[Checkout] Failed to load Stripe gateway:", error);
      }
    };
    const cached = getPaymentGateway("stripe");
    if (cached) {
      setStripeCheckout(() => cached);
    } else {
      loadStripeGateway();
    }
    return () => {
      isMounted = false;
    };
  }, []);
  const isCartHaveBillingAddress = !!cart?.billing_address;
  const isCarthaveShippingAddress = !!cart?.shipping_address;
  const [orderType, setOrderType] = useState(cart?.order_type ?? "delivery");
  const [sameAsShipping, setSameAsShipping] = useState(
    cart?.billing_address?.id === cart?.shipping_address?.id
  );
  const [selectedAddress, setSelectedAddress] = useState({
    shippingAddressId: cart?.shipping_address?.id ?? null,
    billingAddressId: cart?.billing_address?.id ?? null
  });
  const { shippingAddressId, billingAddressId } = selectedAddress;
  const fetchAddresses = useCallback(async () => {
    try {
      setIsAddressLoading(true);
      if (actions?.getUserAddress && auth?.isSignedIn) {
        const data = await actions.getUserAddress();
        setAddresses(Array.isArray(data) ? data : [data]);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
      setAddresses([]);
    } finally {
      setIsAddressLoading(false);
    }
  }, [actions, auth?.isSignedIn]);
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);
  useEffect(() => {
    setOrderType(cart?.order_type ?? "delivery");
    const hasShipping = !!cart?.shipping_address?.id;
    const hasBilling = !!cart?.billing_address?.id;
    const defaultAddressId = addresses?.[0]?.id;
    const shippingId = cart?.shipping_address?.id ?? defaultAddressId;
    const billingId = cart?.billing_address?.id ?? defaultAddressId;
    setSelectedAddress({
      shippingAddressId: shippingId,
      billingAddressId: billingId
    });
    setSameAsShipping(billingId === shippingId);
    if ((!hasShipping || !hasBilling) && defaultAddressId && cart?.id && actions?.updateCart) {
      const apiData = { id: cart.id };
      if (!hasShipping) apiData.shipping_address_id = defaultAddressId;
      if (!hasBilling) apiData.billing_address_id = defaultAddressId;
      actions.updateCart(cart.id, apiData).then((updatedCart) => {
        if (updatedCart) setCart(updatedCart);
      }).catch(
        (err) => console.error("Failed to auto-set cart addresses:", err)
      );
    }
  }, [
    cart?.shipping_address?.id,
    cart?.billing_address?.id,
    addresses?.length
  ]);
  const onUpdateOrderType = async (type) => {
    try {
      setOrderType(type);
      if (actions?.updateCart && cart?.id) {
        await actions.updateCart(cart.id, {
          id: cart.id,
          order_type: type
        });
        setCart((prev) => ({ ...prev, order_type: type }));
      }
    } catch (err) {
      console.error("Failed to update order type:", err);
      const errorMsg = err?.data?.error || err?.message;
      if (errorMsg && typeof errorMsg === "string") {
        toast?.error?.(errorMsg);
      } else {
        toast?.error?.("Failed to update order type");
      }
    }
  };
  const onRazorPayHandler = (res) => {
    const isClerk = config?.authType === "clerk";
    const name = isClerk ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() : user?.name || user?.first_name || "";
    const email = isClerk ? user?.primaryEmailAddress?.emailAddress : user?.email;
    const contact = isClerk ? user?.primaryPhoneNumber?.phoneNumber : user?.phone || user?.mobile;
    const options = {
      key: razorpayKeyId,
      amount: res?.cart?.total / 100,
      currency: "INR",
      name: "Store",
      description: "Order Payment",
      order_id: res?.razor_order_id,
      handler: async (response) => {
        try {
          setIsProcessingPayment(true);
          const MAX_ATTEMPTS = 5;
          const RETRY_DELAY_MS = 1e3;
          let order = null;
          let lastError = null;
          for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
              if (actions?.updateRazorPayment) {
                const result = await actions.updateRazorPayment(
                  res?.id,
                  response.razorpay_payment_id
                );
                if (result?.serverError) {
                  lastError = result.serverError;
                  console.warn(
                    `[Checkout] updateRazorPayment attempt ${attempt} failed:`,
                    result.serverError
                  );
                } else if (result?.order_id) {
                  order = result;
                  break;
                } else {
                  lastError = "Payment update returned no order ID";
                  console.warn(
                    `[Checkout] updateRazorPayment attempt ${attempt}: no order_id`,
                    result
                  );
                }
              }
            } catch (err) {
              lastError = err?.data?.error || err?.message || "Payment update failed";
              console.error(
                `[Checkout] updateRazorPayment attempt ${attempt} threw:`,
                err
              );
            }
            if (attempt < MAX_ATTEMPTS) {
              await new Promise(
                (resolve) => setTimeout(resolve, RETRY_DELAY_MS)
              );
            }
          }
          if (order?.order_id) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("cartid");
            }
            const userId = auth?.userId ?? auth?.user?.id ?? user?.id ?? null;
            const currency = config?.currency ?? "INR";
            trackPurchase({
              userId,
              transactionId: String(order.order_id),
              cart,
              currency,
              metaOverrides: { source: "checkout" }
            });
            trackMetaPurchase(cart);
            setCart(null);
            router.push(`/account/orders/${order?.order_id}`);
          } else {
            setIsProcessingPayment(false);
            const msg = typeof lastError === "string" ? lastError : "Payment could not be updated. Please contact support.";
            toast?.error?.(msg);
          }
        } catch (err) {
          console.error("Payment handler error:", err);
          setIsProcessingPayment(false);
          const errorMsg = err?.data?.error || err?.message;
          if (errorMsg && typeof errorMsg === "string") {
            toast?.error?.(errorMsg);
          } else {
            toast?.error?.(
              "Payment could not be updated. Please contact support."
            );
          }
        }
      },
      prefill: {
        name,
        email,
        contact
      },
      theme: { color: primaryColor }
    };
    const razorpay = new Razorpay(options);
    razorpay.on("payment.failed", (response) => {
      console.error("Razorpay payment failed:", response);
      toast?.error?.(response?.error?.description || "Payment failed");
      const userId = auth?.userId ?? auth?.user?.id ?? user?.id ?? null;
      const currency = config?.currency ?? "INR";
      trackPaymentFailed({
        userId,
        cart,
        currency,
        errorCode: response?.error?.code ?? "",
        errorReason: response?.error?.reason ?? response?.error?.description ?? ""
      });
    });
    razorpay.open();
  };
  const onPlaceOrder = async () => {
    if (hasDeletedItems || !cart?.id) return;
    const clientTotal = Number(cart?.total ?? cart?.display_total ?? 0);
    const validation = await validateCartTotal(cart.id, clientTotal, {
      apiBaseUrl: config?.apiBaseUrl,
      orgId: config?.storeId
    });
    if (!validation.valid && validation.reason === "price_mismatch") {
      setCartMismatch({
        serverTotal: validation.serverTotal,
        clientTotal: validation.clientTotal,
        cart: validation.cart
      });
      toast?.error?.(
        "Your cart total has changed \u2014 a coupon or offer has expired. Please refresh and try again."
      );
      return;
    }
    if (isStripeGateway) {
      setShowStripeForm(true);
      return;
    }
    try {
      setIsPlacingOrder(true);
      if (actions?.createRazorOrder) {
        const orderResponse = await actions.createRazorOrder(cart.id);
        const userId = auth?.userId ?? auth?.user?.id ?? user?.id ?? null;
        const currency = config?.currency ?? "INR";
        trackBeginCheckout({
          userId,
          cart,
          currency,
          transactionId: String(orderResponse?.id ?? ""),
          metaOverrides: { source: "checkout" }
        });
        trackMetaInitiateCheckout(cart);
        trackAddShippingInfo({
          userId,
          cart,
          shippingTier: orderType === "pickup" ? "Pickup" : "Standard",
          currency,
          metaOverrides: { source: "checkout" }
        });
        trackAddPaymentInfo({
          userId,
          cart,
          paymentType: paymentGatewayLabel,
          currency,
          metaOverrides: { source: "checkout" }
        });
        trackMetaAddPaymentInfo(cart);
        onRazorPayHandler(orderResponse);
      }
    } catch (err) {
      console.error("Failed to create order:", err);
      const errorMsg = err?.data?.error || err?.message;
      if (errorMsg && typeof errorMsg === "string") {
        toast?.error?.(errorMsg);
      } else {
        toast?.error?.("Failed to process payment");
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    cartMismatch && /* @__PURE__ */ jsx(
      CartMismatchBanner,
      {
        serverTotal: cartMismatch.serverTotal,
        clientTotal: cartMismatch.clientTotal,
        freshCart: cartMismatch.cart,
        currency: config?.currency ?? "INR",
        onDismiss: () => setCartMismatch(null)
      }
    ),
    /* @__PURE__ */ jsx("h1", { className: "font-[var(--font-medium)] text-[20px] text-[var(--main)] leading-[24px]", children: "ORDER TYPE" }),
    /* @__PURE__ */ jsx("div", { className: "mt-[16px] flex flex-col gap-y-[16px]", children: /* @__PURE__ */ jsx(
      AddressCard,
      {
        onClick: () => onUpdateOrderType("delivery"),
        isSelected: orderType === "delivery",
        addressType: "Delivery",
        address: "Get your order delivered to your address at ease",
        type: "delivery"
      }
    ) }),
    orderType !== "pickup" && /* @__PURE__ */ jsx("div", { className: "mt-[32px]", children: isAddressLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[var(--secondary)] text-sm font-[var(--font-regular)]", children: [
      /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-[var(--core-primary)] border-t-transparent rounded-full animate-spin" }),
      "Loading addresses\u2026"
    ] }) : addresses.length > 0 ? /* @__PURE__ */ jsx(
      AddressSelection,
      {
        address: addresses,
        cart,
        setCart,
        user,
        refetch: fetchAddresses,
        sameAsShipping,
        setSameAsShipping,
        shippingAddressId,
        billingAddressId,
        setSelectedAddress,
        isCartHaveBillingAddress,
        isCarthaveShippingAddress
      }
    ) : /* @__PURE__ */ jsx(AddressFormInline, { refetch: fetchAddresses }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-[32px]", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-[var(--font-medium)] text-[20px] text-[var(--main)]", children: "PAYMENT" }),
      /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[14px] text-[var(--secondary)]", children: "All transactions are secure and encrypted." }),
      /* @__PURE__ */ jsx("div", { className: "mt-[16px]", children: isStripeGateway ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          AddressCard,
          {
            addressType: `Pay with ${paymentGatewayLabel}`,
            address: "Enter your card details securely via Stripe to complete your payment.",
            type: "stripe",
            paymentLabel: paymentGatewayLabel
          }
        ),
        showStripeForm && stripePublishableKey && StripeCheckout && /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(
          StripeCheckout,
          {
            cartId: cart?.id,
            publishableKey: stripePublishableKey,
            createStripePaymentIntent: actions?.createStripePaymentIntent ? async (cartId) => {
              const clientTotal = Number(
                cart?.total ?? cart?.display_total ?? 0
              );
              const validation = await validateCartTotal(
                cartId,
                clientTotal,
                {
                  apiBaseUrl: config?.apiBaseUrl,
                  orgId: config?.storeId
                }
              );
              if (!validation.valid && validation.reason === "price_mismatch") {
                setCartMismatch({
                  serverTotal: validation.serverTotal,
                  clientTotal: validation.clientTotal,
                  cart: validation.cart
                });
                setShowStripeForm(false);
                throw new Error(
                  "Your cart total has changed \u2014 a coupon or offer has expired. Please refresh and try again."
                );
              }
              return actions.createStripePaymentIntent(cartId);
            } : void 0,
            amount: cart?.display_total ?? "",
            currency: config?.currency ?? "INR",
            onSuccess: async () => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("cartid");
              }
              try {
                const regionId = config?.regionId ?? null;
                const updatedCart = await actions?.getCart?.(regionId);
                const cartData = Array.isArray(updatedCart) ? updatedCart[0] : updatedCart;
                const orderId = cartData?.order_id;
                setCart(null);
                if (orderId) {
                  router.push(`/account/orders/${orderId}`);
                } else {
                  router.push("/account/orders");
                }
              } catch {
                setCart(null);
                router.push("/account/orders");
              }
            }
          }
        ) }),
        showStripeForm && !StripeCheckout && /* @__PURE__ */ jsxs("p", { className: "mt-4 text-sm text-red-500 p-3 bg-red-50 rounded-lg", children: [
          "StripeCheckout component is not configured. Pass it via",
          " ",
          /* @__PURE__ */ jsxs("code", { className: "font-mono", children: [
            "CoreProvider components=",
            { StripeCheckout }
          ] }),
          "."
        ] })
      ] }) : /* @__PURE__ */ jsx(
        AddressCard,
        {
          addressType: `Pay with ${paymentGatewayLabel}`,
          address: `Once you click Checkout, you'll be redirected to a secure ${paymentGatewayLabel} payment window to complete your payment.`,
          type: "stripe",
          paymentLabel: paymentGatewayLabel
        }
      ) })
    ] }),
    !(isStripeGateway && showStripeForm) && /* @__PURE__ */ jsxs("div", { className: "mt-[32px]", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onPlaceOrder,
          disabled: hasDeletedItems || isPlacingOrder || isAddressLoading,
          className: `px-5 py-3 w-full rounded-lg cursor-pointer font-[var(--font-medium)] text-[15px] transition-all duration-300 ${hasDeletedItems || isPlacingOrder || isAddressLoading ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" : "bg-[var(--core-primary)] text-white hover:opacity-90 hover:shadow-lg transform active:scale-[0.98]"}`,
          children: isPlacingOrder ? "Processing\u2026" : hasDeletedItems ? "Remove Deleted Items to Checkout" : isStripeGateway ? "Proceed to Card Payment" : "Checkout"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 text-center", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-[#8c92a4] font-[var(--font-regular)] leading-relaxed", children: [
          "By placing your order, you agree to our",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              href: config?.termsUrl || "/term-conditions",
              prefetch: false,
              className: "text-[var(--core-primary)] underline hover:text-[var(--core-secondary)] transition-colors",
              children: "Terms & Conditions"
            }
          ),
          " ",
          "and",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              href: config?.privacyUrl || "/privacy-policy",
              prefetch: false,
              className: "text-[var(--core-primary)] underline hover:text-[var(--core-secondary)] transition-colors",
              children: "Privacy Policy"
            }
          ),
          "."
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 flex justify-center gap-3", children: /* @__PURE__ */ jsx(
          Link,
          {
            href: config?.refundUrl || config?.returnUrl || "/return-policy",
            prefetch: false,
            className: "text-[10px] text-[#8c92a4] hover:text-[var(--core-primary)] transition-colors underline uppercase tracking-wider",
            children: "Refund Policy"
          }
        ) })
      ] }),
      hasDeletedItems && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-600 mt-2 font-[var(--font-regular)]", children: "Please remove unavailable items before proceeding to checkout." })
    ] }),
    isProcessingPayment && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-fadeIn", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-8 max-w-md w-full px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "w-24 h-24 border-[3px] border-[var(--core-primary)]/5 rounded-full" }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-24 h-24 border-[3px] border-[var(--core-secondary)] border-t-transparent rounded-full animate-spin" }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", children: /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-[var(--core-primary)] rounded-full animate-pulse shadow-[0_0_15px_rgba(0,33,76,0.3)]" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-serif italic text-3xl text-[var(--core-primary)] tracking-tight", children: "Processing your payment" }),
          /* @__PURE__ */ jsx("div", { className: "w-12 h-[1px] bg-[var(--core-secondary)] mx-auto opacity-50" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-medium)] text-[#2d2d2d] text-base", children: [
            "We're finalizing your order with ",
            paymentGatewayLabel,
            "."
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-regular)] text-[#8c92a4] text-sm leading-relaxed", children: [
            "Please do not refresh the page or close this window. ",
            /* @__PURE__ */ jsx("br", {}),
            "This will only take a moment."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 mt-2", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-1.5 h-1.5 bg-[var(--core-secondary)] rounded-full opacity-20 animate-pulse",
          style: { animationDelay: `${i * 0.2}s` }
        },
        i
      )) })
    ] }) })
  ] });
};
var Checkout_default = Checkout;
var CouponSection = () => {
  const { cart, setCart, actions, auth, config, toast } = useCore();
  const token = auth?.token ?? auth?.access_token ?? null;
  const { formatCurrency } = useCurrencyFormat();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);
  const triggerToast = {
    success: (msg) => {
      if (toast?.success) toast.success(msg);
      else console.log("Success:", msg);
    },
    error: (msg) => {
      if (toast?.error) toast.error(msg);
      else console.error("Error:", msg);
    }
  };
  useEffect(() => {
    if (!actions?.getAvailableDiscounts || !cart?.id || !token) return;
    let isMounted = true;
    const fetchDiscounts = async () => {
      try {
        setDiscountsLoading(true);
        const data = await actions.getAvailableDiscounts({
          token,
          cart_id: cart?.id,
          region_id: config?.regionId,
          apiBaseUrl: config?.apiBaseUrl,
          orgId: config?.storeId
        });
        if (isMounted) {
          setAvailableDiscounts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch available discounts:", err);
      } finally {
        if (isMounted) {
          setDiscountsLoading(false);
        }
      }
    };
    fetchDiscounts();
    return () => {
      isMounted = false;
    };
  }, [actions, cart?.id, token, config?.regionId]);
  const availableDiscountsWithCode = availableDiscounts || [];
  const rawDiscounts = cart?.cart_discounts || [];
  const appliedDiscounts = rawDiscounts.filter(
    (coupon) => coupon.code || coupon.id
  );
  if (cart && rawDiscounts.length === 0) {
    console.warn(
      "[CouponSection] No discounts found on cart. Cart keys:",
      Object.keys(cart)
    );
  }
  const firstAppliedDiscount = appliedDiscounts?.[0];
  const showInput = !firstAppliedDiscount || firstAppliedDiscount.stackable;
  const handleApply = async () => {
    if (!inputValue.trim()) return;
    if (!token) {
      setErrorMessage("Please sign in to apply a coupon");
      return;
    }
    setIsApplying(true);
    setErrorMessage(null);
    try {
      if (!actions?.applyDiscount) {
        throw new Error("applyDiscount action is not configured");
      }
      const result = await actions.applyDiscount({
        token,
        code: inputValue.trim(),
        source: "web",
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId
      });
      if (result?.serverError) {
        setErrorMessage(result.serverError);
        return;
      }
      const updatedCart = result?.cart ?? result;
      setCart(updatedCart);
      const userId = auth?.userId ?? auth?.user?.id ?? auth?.user?.userId ?? null;
      const currency = config?.currency ?? "INR";
      setIsOpen(false);
      setInputValue("");
      setErrorMessage(null);
    } catch (error) {
      const msg = error?.data?.error || error?.message || "Failed to apply coupon";
      setErrorMessage(msg);
      if (msg.toLowerCase().includes("already applied") || msg.toLowerCase().includes("discount is already")) {
        if (actions?.getCart && auth?.isSignedIn) {
          const res = await actions.getCart(config?.regionId, {
            token: auth?.token ?? auth?.access_token
          });
          setCart(Array.isArray(res) ? res[0] : res);
        } else if (actions?.getCartById && cart?.id) {
          const res = await actions.getCartById(cart.id, config?.regionId);
          setCart(res);
        }
      }
    } finally {
      setIsApplying(false);
    }
  };
  const applyById = async (coupon) => {
    if (!coupon?.id) return;
    if (!token) {
      setErrorMessage("Please sign in to apply a coupon");
      return;
    }
    setIsApplying(true);
    setErrorMessage(null);
    try {
      if (!actions?.applyDiscount) {
        throw new Error("applyDiscount action is not configured");
      }
      const result = await actions.applyDiscount({
        token,
        discount_id: coupon.id,
        source: "web",
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId
      });
      if (result?.serverError) {
        setErrorMessage(result.serverError);
        return;
      }
      const updatedCart = result?.cart ?? result;
      setCart(updatedCart);
      const userId = auth?.userId ?? auth?.user?.id ?? auth?.user?.userId ?? null;
      const currency = config?.currency ?? "INR";
      setIsOpen(false);
      setInputValue("");
      setErrorMessage(null);
    } catch (error) {
      const msg = error?.data?.error || error?.message || "Failed to apply coupon";
      setErrorMessage(msg);
      if (msg.toLowerCase().includes("already applied") || msg.toLowerCase().includes("discount is already")) {
        if (actions?.getCart && auth?.isSignedIn) {
          const res = await actions.getCart(config?.regionId, {
            token: auth?.token ?? auth?.access_token
          });
          setCart(Array.isArray(res) ? res[0] : res);
        } else if (actions?.getCartById && cart?.id) {
          const res = await actions.getCartById(cart.id, config?.regionId);
          setCart(res);
        }
      }
    } finally {
      setIsApplying(false);
    }
  };
  const handleRemove = async ({ code, discount_id }) => {
    setRemovingId(discount_id);
    try {
      if (!actions?.removeDiscountById && !actions?.removeDiscount) {
        throw new Error("removeDiscount action is not configured");
      }
      const removeFn = actions?.removeDiscountById || actions?.removeDiscount;
      const result = await removeFn({
        token,
        discount_id,
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId
      });
      const updatedCart = result?.cart ?? result;
      setCart(updatedCart);
      setIsOpen(true);
    } catch (error) {
      console.log({ error });
      triggerToast.error(`Failed to remove coupon ${code || "discount"}`);
    } finally {
      setRemovingId(null);
    }
  };
  const getEligibility = (coupon) => {
    if (coupon.min_order_value > 0 && (cart?.item_total ?? 0) < coupon.min_order_value) {
      return {
        eligible: false,
        reason: `Add ${coupon.display_min_order_value} more to apply`
      };
    }
    return { eligible: true, reason: null };
  };
  const formatEndDate = (end_at) => {
    if (!end_at) return null;
    return new Date(end_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short"
    });
  };
  if (!token) {
    return /* @__PURE__ */ jsx("div", { className: "my-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full flex items-center justify-between border-t border-b border-[var(--borders)] px-1 py-3", children: [
      /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-medium)] text-[14px] text-[var(--secondary)]", children: [
        "\u{1F3F7} Have a coupon code?",
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-[var(--core-primary)] text-[12px] font-[var(--font-regular)]", children: "Sign in to apply" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-[var(--secondary)] text-[16px]", children: "\u25BE" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "my-4", children: [
    appliedDiscounts?.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 mb-3", children: appliedDiscounts?.map((coupon) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center justify-between bg-[#f0faf0] border border-[#00b300] rounded-lg px-4 py-3 gap-2",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0", children: [
            /* @__PURE__ */ jsx("span", { className: "text-base", children: "\u2705" }),
            /* @__PURE__ */ jsx("span", { className: "font-[var(--font-bold)] text-[#0f0f0f] text-[13px] tracking-wide", children: coupon.code ? coupon.code : coupon.display_action_value || "Discount" }),
            /* @__PURE__ */ jsx("span", { className: "font-[var(--font-regular)] text-[#0f0f0f] text-[12px]", children: "applied" }),
            /* @__PURE__ */ jsx("span", { className: "text-[#0f0f0f] text-[12px] hidden sm:inline", children: "\xB7" }),
            /* @__PURE__ */ jsxs("span", { className: "text-[#00b300] text-[12px] font-[var(--font-bold)]", children: [
              "You save",
              " ",
              formatCurrency(
                coupon.display_discount_amount || coupon.discount_amount / 100
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => handleRemove({
                code: coupon.code,
                discount_id: coupon.discount_id ?? coupon.id
              }),
              disabled: removingId === (coupon.discount_id ?? coupon.id),
              className: "text-[#8e9194] text-lg bg-transparent border-0 cursor-pointer disabled:opacity-50",
              "aria-label": `Remove coupon ${coupon.code || "discount"}`,
              children: removingId === (coupon.discount_id ?? coupon.id) ? "\u2026" : "\u2715"
            }
          )
        ]
      },
      coupon.code || coupon.id
    )) }),
    showInput && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => setIsOpen((prev) => !prev),
          "aria-expanded": isOpen,
          className: "w-full flex items-center justify-between border-t border-b border-[var(--borders)] px-1 py-3 cursor-pointer",
          children: [
            /* @__PURE__ */ jsx("span", { className: "font-[var(--font-medium)] text-[14px] text-[var(--main)]", children: "\u{1F3F7} Have a coupon code?" }),
            /* @__PURE__ */ jsx("span", { className: "text-[var(--main)] text-[16px]", children: isOpen ? "\u25B4" : "\u25BE" })
          ]
        }
      ),
      isOpen && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              "aria-label": "Coupon code",
              value: inputValue,
              onChange: (e) => setInputValue(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && handleApply(),
              placeholder: "ENTER CODE",
              className: "border border-[var(--borders)] rounded-lg px-3 py-2 text-[13px] text-[var(--main)] font-[var(--font-regular)] uppercase tracking-widest outline-none flex-1"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleApply,
              disabled: isApplying || !inputValue.trim(),
              className: "text-white text-[12px] font-[var(--font-bold)] px-4 py-2 rounded-lg border-none cursor-pointer tracking-wide disabled:opacity-60 shrink-0",
              style: { background: "var(--core-primary)" },
              children: isApplying ? "APPLYING..." : "APPLY"
            }
          )
        ] }),
        errorMessage && /* @__PURE__ */ jsx("p", { className: "text-red-600 text-[12px] font-[var(--font-regular)]", children: errorMessage }),
        !discountsLoading && availableDiscountsWithCode.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 mt-1", children: [
          /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-[12px] text-[var(--secondary)]", children: "Available coupons" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: availableDiscountsWithCode.map((coupon) => {
            const endDate = formatEndDate(coupon.end_at);
            const { eligible, reason } = getEligibility(coupon);
            const conditionParts = [];
            if (endDate) conditionParts.push(`Ends ${endDate}`);
            const conditionText = conditionParts.join(" \xB7 ");
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex flex-col gap-[2px]",
                children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        if (!eligible) return;
                        if (!coupon.code) {
                          applyById(coupon);
                        } else {
                          setInputValue(coupon.code);
                        }
                      },
                      disabled: !eligible || isApplying,
                      className: `border border-dashed text-[11px] font-[var(--font-bold)] px-3 py-1 rounded ${!eligible || isApplying ? "opacity-40 cursor-not-allowed" : ""}`,
                      style: {
                        color: "var(--core-primary)",
                        borderColor: "var(--core-primary)",
                        backgroundColor: "color-mix(in srgb, var(--core-primary) 10%, transparent)"
                      },
                      children: [
                        coupon.code ? `${coupon.code} \u2014 ` : "",
                        coupon.display_action_value || "Discount"
                      ]
                    }
                  ),
                  reason && /* @__PURE__ */ jsx("span", { className: "text-[11px] text-[#8e9194]", children: reason }),
                  !reason && conditionText && /* @__PURE__ */ jsx("span", { className: "text-[11px] text-[#8e9194]", children: conditionText })
                ]
              },
              coupon?.code || coupon?.id
            );
          }) })
        ] })
      ] })
    ] })
  ] });
};
var CouponSection_default = CouponSection;
var ViewCart = () => {
  const [discountOpen, setDiscountOpen] = useState(false);
  const { cart, cartItems } = useAddToCart();
  const { isCartLoading } = useCart();
  const { formatCurrency } = useCurrencyFormat();
  const { actions, auth, config, toast } = useCore();
  const token = auth?.token ?? auth?.access_token ?? null;
  const {
    line_items: cartItem = cartItems,
    display_total,
    display_item_total,
    display_ship_total,
    display_tax_total,
    order_type
  } = cart || {};
  const items = cartItems ?? [];
  const isLoading = isCartLoading;
  const deletedItems = items.filter(
    (item) => !item?.line_itemable || item?.line_itemable_deleted
  );
  const hasDeletedItems = deletedItems.length > 0;
  const appliedDiscounts = (cart?.cart_discounts || []).filter(
    (coupon) => coupon.code || coupon.display_action_value || coupon.id || coupon.discount_id
  );
  const activeDiscountId = appliedDiscounts?.[0]?.id || cart?.discount_id;
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeDiscountId && actions?.trackDiscountEvent) {
        actions.trackDiscountEvent({
          token,
          discount_id: activeDiscountId,
          event_type: "abandoned",
          source: "web",
          region_id: config?.regionId
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [activeDiscountId, actions, token, config?.regionId]);
  const prevDiscountIdRef = useRef(void 0);
  useEffect(() => {
    const prev = prevDiscountIdRef.current;
    if (prev !== void 0 && prev && !activeDiscountId && items?.length > 0) {
      if (toast?.info) {
        toast.info("Coupon removed \u2014 conditions no longer met");
      }
    }
    prevDiscountIdRef.current = activeDiscountId;
  }, [activeDiscountId, items?.length, toast]);
  return /* @__PURE__ */ jsx("div", { className: "mx-4 md:mx-[24px] my-[100px] flex justify-center", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center w-full h-[400px]", children: /* @__PURE__ */ jsx(
    "div",
    {
      className: "animate-spin rounded-full h-10 w-10 border-t-2 border-b-2",
      style: { borderColor: "var(--core-primary)" }
    }
  ) }) : items.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center p-12 bg-gray-50/50 border border-gray-100 rounded-2xl min-h-[400px] gap-y-6 max-w-[600px] w-full mx-auto", children: [
    /* @__PURE__ */ jsx("div", { className: "p-4 bg-white rounded-full shadow-sm border border-gray-100", children: /* @__PURE__ */ jsxs(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "32",
        height: "32",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        style: { color: "var(--core-primary)" },
        children: [
          /* @__PURE__ */ jsx("path", { d: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" }),
          /* @__PURE__ */ jsx("path", { d: "M3 6h18" }),
          /* @__PURE__ */ jsx("path", { d: "M16 10a4 4 0 0 1-8 0" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "font-[var(--font-bold)] text-[22px] text-gray-800", children: "Your cart is empty" }),
      /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[15px] text-gray-500 max-w-[400px]", children: "Looks like you haven't added anything to your cart yet. Explore our collections and find something you love!" })
    ] }),
    /* @__PURE__ */ jsx(
      "a",
      {
        href: "/",
        className: "mt-4 px-8 py-3 rounded-full text-white font-[var(--font-medium)] transition-opacity hover:opacity-90",
        style: { backgroundColor: "var(--core-primary)" },
        children: "Continue Shopping"
      }
    )
  ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-row flex-wrap gap-[16px] max-w-[1248px] w-full", children: [
    /* @__PURE__ */ jsx("div", { className: "flex-1 mt-8 md:mt-0", children: /* @__PURE__ */ jsx(Checkout_default, { hasDeletedItems }) }),
    /* @__PURE__ */ jsx("div", { className: "border border-[var(--borders)] sticky hidden md:block" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 md:sticky top-4 self-start mt-[18px] md:mt-0 order-first md:order-last", children: [
      hasDeletedItems && /* @__PURE__ */ jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-800 font-[var(--font-medium)]", children: "\u26A0\uFE0F Some items in your cart are no longer available. Please remove them before checkout." }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "font-[var(--font-medium)] text-[20px] text-[var(--main)]", children: [
          "ORDER ITEMS (",
          items.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-h-[500px] overflow-auto mt-3", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-y-[16px]", children: items.map((item) => /* @__PURE__ */ jsx(
          ProductlistCard_default,
          {
            product: item,
            orderType: order_type
          },
          item?.id
        )) }) }),
        /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(CouponSection_default, {}) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
          /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-[20px] text-[var(--main)]", children: "Bill summary" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-[24px] space-y-[8px]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[14px] text-[var(--main)]", children: "Item total" }),
              /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[14px] text-[var(--main)]", children: display_item_total ? formatCurrency(display_item_total) : "\u2014" })
            ] }),
            (appliedDiscounts?.length > 0 || cart?.promo_total > 0 || parseFloat(cart?.display_promo_total) > 0) && (() => {
              const totalDiscount = appliedDiscounts?.length > 0 ? appliedDiscounts.reduce((sum, c) => {
                const amt = c.display_discount_amount ?? (c.discount_amount != null ? c.discount_amount / 100 : 0);
                return sum + parseFloat(amt || 0);
              }, 0) : parseFloat(cart?.display_promo_total || 0);
              return /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setDiscountOpen((o) => !o),
                    style: {
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: appliedDiscounts?.length > 1 ? "pointer" : "default"
                    },
                    children: [
                      /* @__PURE__ */ jsxs(
                        "span",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontFamily: "var(--font-regular)",
                            fontSize: "14px",
                            color: "#FF6500"
                          },
                          children: [
                            appliedDiscounts?.length === 1 ? `Discount (${appliedDiscounts[0].code ? appliedDiscounts[0].code : appliedDiscounts[0].display_action_value || "Coupon"})` : "Discount",
                            appliedDiscounts?.length > 1 && /* @__PURE__ */ jsx(
                              "svg",
                              {
                                width: "12",
                                height: "12",
                                viewBox: "0 0 24 24",
                                fill: "none",
                                stroke: "#FF6500",
                                strokeWidth: "2.5",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                style: {
                                  transition: "transform 0.25s",
                                  transform: discountOpen ? "rotate(180deg)" : "rotate(0deg)"
                                },
                                children: /* @__PURE__ */ jsx("polyline", { points: "6 9 12 15 18 9" })
                              }
                            )
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxs(
                        "span",
                        {
                          style: {
                            fontFamily: "var(--font-regular)",
                            fontSize: "14px",
                            color: "#FF6500"
                          },
                          children: [
                            "-",
                            formatCurrency(totalDiscount)
                          ]
                        }
                      )
                    ]
                  }
                ),
                appliedDiscounts?.length > 1 && discountOpen && /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      marginTop: "6px",
                      paddingLeft: "8px",
                      borderLeft: "2px solid #FF650033",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    },
                    children: appliedDiscounts.map((coupon) => {
                      const amt = coupon.display_discount_amount ?? (coupon.discount_amount != null ? coupon.discount_amount / 100 : 0);
                      return /* @__PURE__ */ jsxs(
                        "div",
                        {
                          style: {
                            display: "flex",
                            justifyContent: "space-between"
                          },
                          children: [
                            /* @__PURE__ */ jsx(
                              "span",
                              {
                                style: {
                                  fontFamily: "var(--font-regular)",
                                  fontSize: "13px",
                                  color: "#FF6500",
                                  opacity: 0.85
                                },
                                children: coupon.code ? `${coupon.code}` : coupon.display_action_value || "Coupon"
                              }
                            ),
                            /* @__PURE__ */ jsxs(
                              "span",
                              {
                                style: {
                                  fontFamily: "var(--font-regular)",
                                  fontSize: "13px",
                                  color: "#FF6500",
                                  opacity: 0.85
                                },
                                children: [
                                  "-",
                                  formatCurrency(amt)
                                ]
                              }
                            )
                          ]
                        },
                        coupon.code || coupon.id
                      );
                    })
                  }
                )
              ] });
            })(),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[14px] text-[var(--main)]", children: "Tax" }),
              /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[14px] text-[var(--main)]", children: display_tax_total ? formatCurrency(display_tax_total) : "\u2014" })
            ] }),
            order_type !== "pickup" && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[14px] text-[var(--main)]", children: "Shipping" }),
              /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[14px] text-[var(--main)]", children: display_ship_total === "0.00" || display_ship_total === 0 ? "Free" : display_ship_total ? formatCurrency(display_ship_total) : "\u2014" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-[16px] border-t border-[var(--borders)]", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-[16px] text-[var(--main)]", children: "Total payment" }),
                /* @__PURE__ */ jsx("p", { className: "font-[var(--font-bold)] text-[16px] text-[var(--main)]", children: display_total ? formatCurrency(display_total) : "\u2014" })
              ] }),
              (cart?.promo_total > 0 || parseFloat(cart?.display_promo_total) > 0) && /* @__PURE__ */ jsxs("p", { className: "text-[13px] font-[var(--font-bold)] text-[#00b300] mt-[6px] text-right", children: [
                "You save ",
                formatCurrency(cart?.display_promo_total),
                " on this order \u{1F389}"
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] }) });
};
var AddressCard2 = ({ address, onEdit, onDelete }) => {
  const { actions, toast } = useCore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (actions?.deleteAddress) {
        await actions.deleteAddress(address.id);
        toast?.success?.("Address deleted successfully.");
        onDelete?.();
      } else {
        throw new Error("actions.deleteAddress is not defined");
      }
    } catch (err) {
      console.error("Failed to delete address:", err);
      toast?.error?.("Could not delete address. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };
  const {
    label,
    firstname,
    lastname,
    phone,
    address1,
    address2,
    city,
    country_name,
    state_name
  } = address || {};
  const fullName = `${firstname ?? ""} ${lastname ?? ""}`.trim();
  const fullAddress = [address1, address2, city, state_name, country_name].filter(Boolean).join(", ");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "border border-gray-100 p-6 flex flex-col gap-y-4 hover:border-[var(--core-primary)] transition-all duration-300 bg-white shadow-sm hover:shadow-md group", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-[var(--font-bold)] text-[13px] text-[var(--core-primary)] uppercase tracking-widest bg-gray-50 px-2 py-1", children: label || "Address" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: "flex items-center gap-1.5 font-[var(--font-medium)] text-[12px] text-[var(--core-primary)] hover:opacity-80 transition-colors uppercase tracking-widest",
              onClick: onEdit,
              children: [
                /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }),
                "Edit"
              ]
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-gray-200 text-[10px]", children: "|" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: "flex items-center gap-1.5 font-[var(--font-medium)] text-[12px] text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest",
              onClick: () => setShowConfirm(true),
              children: [
                /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }),
                "Delete"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "border-t border-gray-50" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("p", { className: "font-[var(--font-bold)] text-[14px] text-[#2d2d2d] uppercase", children: fullName }),
        /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-[13px] text-gray-500", children: phone })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[13px] text-gray-400 leading-relaxed line-clamp-2", children: fullAddress })
    ] }),
    /* @__PURE__ */ jsx(
      Popup,
      {
        isOpen: showConfirm,
        onClose: () => setShowConfirm(false),
        title: "Delete Address",
        maxWidth: "max-w-[400px]",
        style: { maxWidth: "400px" },
        children: /* @__PURE__ */ jsxs("div", { className: "text-center py-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-regular)] text-[15px] text-gray-600 mb-8", children: [
            "Are you sure you want to delete ",
            /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-bold)] text-[var(--core-primary)]", children: [
              '"',
              label || "this address",
              '"'
            ] }),
            "? This action cannot be undone."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setShowConfirm(false),
                disabled: isDeleting,
                className: "flex-1 h-[48px] text-[14px] font-[var(--font-bold)] border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors uppercase tracking-widest",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleDelete,
                disabled: isDeleting,
                className: "flex-1 h-[48px] text-[14px] font-[var(--font-bold)] bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-red-100",
                children: isDeleting ? /* @__PURE__ */ jsx(Spinner, { size: "sm", color: "white" }) : "Delete"
              }
            )
          ] })
        ] })
      }
    )
  ] });
};
var ProfileForm = ({ user, onSuccess, onCancel }) => {
  const { actions, toast, config } = useCore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userData = user?.attributes || user?.data?.attributes || user || {};
  const [formData, setFormData] = useState({
    firstName: userData.first_name || "",
    lastName: userData.last_name || "",
    contactInfo: config?.authType === "own" ? userData.phone || userData.mobile || userData.phone_number || "" : userData.email || ""
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (actions?.updateUser) {
        await actions.updateUser(userData?.id, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          ...config?.authType === "own" ? { phone: formData.contactInfo } : { email: formData.contactInfo }
        });
        toast?.success?.("Profile updated successfully!");
        onSuccess?.();
      } else {
        throw new Error("actions.updateUser is not defined");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast?.error?.(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const inputCls = "w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--core-primary)] font-[var(--font-regular)]";
  const labelCls = "text-sm font-[var(--font-bold)] text-[var(--core-primary)] uppercase tracking-widest text-[11px]";
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("label", { className: labelCls, children: "First Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "firstName",
            value: formData.firstName,
            onChange: handleChange,
            placeholder: "Enter first name",
            required: true,
            className: inputCls
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("label", { className: labelCls, children: "Last Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "lastName",
            value: formData.lastName,
            onChange: handleChange,
            placeholder: "Enter last name",
            required: true,
            className: inputCls
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("label", { className: labelCls, children: config?.authType === "own" ? "Phone Number" : "Email Address" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: config?.authType === "own" ? "tel" : "email",
          name: "contactInfo",
          value: formData.contactInfo,
          onChange: handleChange,
          placeholder: `Enter ${config?.authType === "own" ? "phone number" : "email address"}`,
          required: true,
          className: inputCls
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-4 border-t border-gray-100 bg-white px-4 pt-4 pb-1 sm:-mx-6 sm:flex-row sm:px-6", children: [
      onCancel && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onCancel,
          className: "flex-1 py-3 border border-gray-300 rounded-md text-[var(--core-primary)] font-[var(--font-bold)] hover:bg-gray-50 transition-colors uppercase tracking-widest text-[12px]",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          className: `flex-1 py-3 bg-[var(--core-primary)] text-white rounded-md font-[var(--font-bold)] transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-[12px] shadow-lg shadow-blue-100 ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`,
          children: isSubmitting ? /* @__PURE__ */ jsx(Spinner, { size: "sm", color: "white" }) : "Save Changes"
        }
      )
    ] })
  ] });
};
var UserInfo = ({ user, isLoading, refetch }) => {
  const { actions, config } = useCore();
  const [addresses, setAddresses] = useState([]);
  const [isAddrLoading, setIsAddrLoading] = useState(false);
  const [modalState, setModalState] = useState({ type: null, data: null });
  const fetchAddresses = useCallback(async () => {
    if (!actions?.getUserAddress) return;
    setIsAddrLoading(true);
    try {
      const addrs = await actions.getUserAddress();
      setAddresses(addrs || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsAddrLoading(false);
    }
  }, [actions]);
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);
  const closeModal = () => setModalState({ type: null, data: null });
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsx(Spinner, {}) });
  }
  const userData = user || {};
  return /* @__PURE__ */ jsxs("div", { className: "animate-in fade-in slide-in-from-bottom-4 duration-500", children: [
    /* @__PURE__ */ jsx("h1", { className: "font-[var(--font-regular)] text-[32px] text-[var(--core-primary)] mb-10 tracking-tight", children: "MY PROFILE" }),
    /* @__PURE__ */ jsxs("section", { className: "mb-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-[var(--font-medium)] text-[20px] text-[#2d2d2d] uppercase tracking-wider", children: "Profile" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setModalState({ type: "profile", data: user }),
            className: "text-[14px] font-[var(--font-medium)] text-[var(--core-primary)] hover:underline uppercase tracking-widest transition-all",
            children: "Edit"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "border border-gray-100 p-8 shadow-sm bg-white hover:shadow-md transition-shadow duration-300", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[12px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest", children: "First name" }),
          /* @__PURE__ */ jsx("p", { className: "border-b border-gray-100 pb-2 text-[15px] font-[var(--font-medium)] text-[var(--core-primary)]", children: userData.first_name || userData.firstName || "\u2014" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[12px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest", children: "Last name" }),
          /* @__PURE__ */ jsx("p", { className: "border-b border-gray-100 pb-2 text-[15px] font-[var(--font-medium)] text-[var(--core-primary)]", children: userData.last_name || userData.lastName || "\u2014" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 md:col-span-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[12px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest", children: config?.authType === "own" ? "Phone number" : "Email address" }),
          /* @__PURE__ */ jsx("p", { className: "border-b border-gray-100 pb-2 text-[15px] font-[var(--font-medium)] text-[var(--core-primary)]", children: config?.authType === "own" ? userData.phone || userData.mobile || userData.phone_number || "\u2014" : userData.email || userData.primaryEmailAddress?.emailAddress || "\u2014" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-[var(--font-medium)] text-[20px] text-[#2d2d2d] uppercase tracking-wider", children: "Addresses" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setModalState({ type: "new_address", data: null }),
            className: "text-[14px] font-[var(--font-medium)] text-[var(--core-primary)] hover:underline uppercase tracking-widest transition-all",
            children: "Add new address"
          }
        )
      ] }),
      isAddrLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Spinner, {}) }) : addresses.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: addresses.map((addr) => /* @__PURE__ */ jsx(
        AddressCard2,
        {
          address: addr,
          onEdit: () => setModalState({ type: "edit_address", data: addr }),
          onDelete: fetchAddresses
        },
        addr.id
      )) }) : /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: "\u{1F4CD}",
          title: "No Addresses Saved",
          description: "You haven't added any shipping or billing addresses yet. Add one to make your checkout faster.",
          action: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setModalState({ type: "new_address", data: null }),
              className: "mt-4 px-8 py-3 bg-[var(--core-primary)] text-white font-[var(--font-bold)] text-[13px] uppercase tracking-widest hover:opacity-90 transition-colors",
              children: "Add Your First Address"
            }
          ),
          className: "border border-dashed border-gray-200 bg-gray-50/10"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      Popup,
      {
        isOpen: !!modalState.type,
        onClose: closeModal,
        title: modalState.type === "profile" ? "Edit Profile" : modalState.type === "new_address" ? "Add New Address" : "Edit Address",
        children: modalState.type === "profile" ? /* @__PURE__ */ jsx(
          ProfileForm,
          {
            user,
            onSuccess: () => {
              refetch();
              closeModal();
            },
            onCancel: closeModal
          }
        ) : /* @__PURE__ */ jsx(
          AddressForm,
          {
            initialData: modalState.data,
            onSuccess: () => {
              fetchAddresses();
              closeModal();
            },
            onCancel: closeModal,
            submitLabel: modalState.type === "new_address" ? "Add Address" : "Update Address"
          }
        )
      }
    )
  ] });
};
var OrdersList = ({ initialOrders }) => {
  const { actions, config } = useCore();
  const { formatCurrency } = useCurrencyFormat();
  const [orders, setOrders] = useState(initialOrders || []);
  const [isLoading, setIsLoading] = useState(!initialOrders);
  useEffect(() => {
    if (initialOrders) return;
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        if (actions?.getOrders) {
          const data = await actions.getOrders(config?.regionId);
          setOrders(data?.orders || data || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [actions, config?.regionId, initialOrders]);
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsx(Spinner, {}) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "animate-in fade-in slide-in-from-bottom-4 duration-500", children: [
    /* @__PURE__ */ jsx("h1", { className: "font-[var(--font-regular)] text-[32px] text-[var(--core-primary)] mb-10 tracking-tight uppercase", children: "MY ORDERS" }),
    orders.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-6", children: orders.map((order) => /* @__PURE__ */ jsx(OrderCard, { order, formatCurrency }, order.id)) }) : /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: "\u{1F4E6}",
        title: "No Orders Found",
        description: "It looks like you haven't placed any orders yet. Once you do, they will appear here.",
        action: /* @__PURE__ */ jsx("button", { className: "mt-4 px-8 py-3 bg-[var(--core-primary)] text-white font-[var(--font-bold)] text-[13px] uppercase tracking-widest hover:opacity-90 transition-colors rounded-none", children: "Start Shopping" }),
        className: "border border-dashed border-gray-200 bg-gray-50/30"
      }
    )
  ] });
};
var OrderCard = ({ order, formatCurrency }) => {
  const router = useRouter();
  const o = order.order || order || {};
  const cart = o.cart || order.cart || {};
  const {
    id,
    order_number,
    order_status,
    payment_status
  } = o;
  const {
    number: cartNumber,
    display_total,
    line_items = []
  } = cart;
  const dateStr = order?.created_at ? new Date(order?.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }) : "Pending";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer rounded-lg overflow-hidden flex flex-col group/card",
      onClick: () => router.push(`/account/orders/${id}`),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50/80 p-5 border-b border-gray-100 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "font-[var(--font-bold)] text-[16px] text-[var(--core-primary)]", children: order_number || cartNumber || id }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "text-[10px] font-[var(--font-bold)] uppercase tracking-wider",
                  style: {
                    padding: "3px 10px",
                    borderRadius: "999px",
                    backgroundColor: order_status?.toLowerCase() === "placed" ? "#dcfce7" : "#f3f4f6",
                    color: order_status?.toLowerCase() === "placed" ? "#15803d" : "#374151",
                    border: `1px solid ${order_status?.toLowerCase() === "placed" ? "#bbf7d0" : "#e5e7eb"}`
                  },
                  children: order_status || "Processing"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-[13px] font-[var(--font-medium)] text-gray-500", children: [
              "Placed on ",
              /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: dateStr })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start md:items-end gap-1.5 w-full md:w-auto", children: [
            /* @__PURE__ */ jsx("span", { className: "font-[var(--font-bold)] text-[18px] text-[var(--core-primary)]", children: display_total ? formatCurrency(display_total) : "\u2014" }),
            /* @__PURE__ */ jsxs("p", { className: "text-[12px] font-[var(--font-medium)] flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-400 uppercase tracking-wider text-[10px] font-[var(--font-bold)]", children: "Payment:" }),
              /* @__PURE__ */ jsx("span", { className: `uppercase font-[var(--font-bold)] tracking-tight ${payment_status === "received" || payment_status === "paid" ? "text-green-600" : "text-orange-500"}`, children: payment_status || "Pending" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-5 pt-6 flex flex-wrap gap-8 items-center relative", children: [
          line_items.map((item, idx) => {
            const lineItemable = item.line_itemable || {};
            const product = lineItemable.product || {};
            const imgUrl = item?.image;
            return /* @__PURE__ */ jsxs("div", { className: "relative group shrink-0", children: [
              /* @__PURE__ */ jsx("div", { className: "w-20 h-20 md:w-24 md:h-24 rounded-md border border-gray-200 bg-gray-50/50 flex items-center justify-center p-2 overflow-hidden transition-colors duration-300 group-hover:border-gray-300", children: imgUrl ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: imgUrl,
                  alt: item.name || product.name || "Product",
                  className: "w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                }
              ) : /* @__PURE__ */ jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center text-gray-300", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[20px] mb-1", children: "\u{1F4E6}" }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase tracking-wider font-[var(--font-medium)]", children: "No Image" })
              ] }) }),
              /* @__PURE__ */ jsx("span", { className: "absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 bg-[var(--core-primary)] text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10", children: item.quantity })
            ] }, idx);
          }),
          line_items.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-gray-400 italic text-sm py-4", children: "No items info" }),
          /* @__PURE__ */ jsx("div", { className: "absolute right-5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 hidden md:flex items-center text-[var(--core-primary)] text-[13px] font-[var(--font-bold)] bg-white/90 backdrop-blur-sm py-2 px-4 rounded-full shadow-sm border border-gray-200 pointer-events-none", children: "View Details \u2192" })
        ] })
      ]
    }
  );
};
var AccountPage = ({ initialTab = "profile" }) => {
  const { auth, actions } = useCore();
  const logout = useLogout();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      if (actions?.getUser) {
        const user = await actions.getUser();
        setUserData(user);
      } else {
        setUserData(auth?.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchUserData();
  }, [auth?.user]);
  const navItems = [
    { id: "profile", label: "My Profile" },
    { id: "orders", label: "My Orders" }
  ];
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-white", children: /* @__PURE__ */ jsxs("div", { className: "px-4 md:px-8 lg:px-[32px] py-[40px] md:py-[100px] flex flex-col md:flex-row items-start justify-between gap-8 w-full", children: [
    /* @__PURE__ */ jsxs("aside", { className: "w-full md:w-[280px] lg:w-[320px] md:sticky top-[40px]", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-[var(--font-regular)] text-[40px] md:text-[48px] leading-[1.05] text-[var(--core-primary)] mb-8 tracking-tight uppercase", children: "MY ACCOUNT" }),
      /* @__PURE__ */ jsx("nav", { children: /* @__PURE__ */ jsxs("ul", { className: "space-y-1 font-[var(--font-medium)]", children: [
        navItems.map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setActiveTab(item.id),
            className: `w-full text-left px-4 py-3 text-[14px] uppercase tracking-wider transition-all duration-200 ${activeTab === item.id ? "bg-[var(--core-primary)] text-white" : "text-[#2d2d2d] hover:bg-[#f5f2ec]"}`,
            children: item.label
          }
        ) }, item.id)),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: logout,
            className: "w-full text-left px-4 py-3 text-[14px] uppercase tracking-wider text-[#2d2d2d] hover:bg-[#f5f2ec] transition-all duration-200 mt-4 border-t border-gray-100 pt-5",
            children: "Logout"
          }
        ) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 min-w-0 w-full max-w-[860px]", children: activeTab === "profile" ? /* @__PURE__ */ jsx(
      UserInfo,
      {
        user: userData,
        isLoading,
        refetch: fetchUserData
      }
    ) : /* @__PURE__ */ jsx(OrdersList, {}) })
  ] }) });
};
var IconBase = ({ children, className = "h-5 w-5", strokeWidth = 1.75, fill = "none", ...props }) => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill, stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", className, "aria-hidden": "true", ...props, children });
var AccountMapPinIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" }),
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "10", r: "3" })
] });
var AccountShoppingBagIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M6 8h12l-1 13H7L6 8Z" }),
  /* @__PURE__ */ jsx("path", { d: "M9 8a3 3 0 0 1 6 0" })
] });
var AccountHeartIcon = ({ filled = false, ...props }) => /* @__PURE__ */ jsx(IconBase, { ...props, fill: filled ? "currentColor" : "none", children: /* @__PURE__ */ jsx("path", { d: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" }) });
var AccountLogOutIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
  /* @__PURE__ */ jsx("path", { d: "M16 17l5-5-5-5" }),
  /* @__PURE__ */ jsx("path", { d: "M21 12H9" })
] });
var AccountPlusIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M12 5v14" }),
  /* @__PURE__ */ jsx("path", { d: "M5 12h14" })
] });
var AccountPencilIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M12 20h9" }),
  /* @__PURE__ */ jsx("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" })
] });
var AccountTrashIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M3 6h18" }),
  /* @__PURE__ */ jsx("path", { d: "M8 6V4h8v2" }),
  /* @__PURE__ */ jsx("path", { d: "M19 6l-1 14H6L5 6" }),
  /* @__PURE__ */ jsx("path", { d: "M10 11v6" }),
  /* @__PURE__ */ jsx("path", { d: "M14 11v6" })
] });
var AccountPackageIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M21 8l-9-5-9 5 9 5 9-5Z" }),
  /* @__PURE__ */ jsx("path", { d: "M3 8v8l9 5 9-5V8" }),
  /* @__PURE__ */ jsx("path", { d: "M12 13v8" })
] });
var AccountCalendarIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
  /* @__PURE__ */ jsx("path", { d: "M16 2v4" }),
  /* @__PURE__ */ jsx("path", { d: "M8 2v4" }),
  /* @__PURE__ */ jsx("path", { d: "M3 10h18" })
] });
var AccountTagIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" }),
  /* @__PURE__ */ jsx("circle", { cx: "7.5", cy: "7.5", r: "1.5" })
] });
var AccountArrowLeftIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("path", { d: "M19 12H5" }),
  /* @__PURE__ */ jsx("path", { d: "M12 19l-7-7 7-7" })
] });
var AccountCopyIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2" }),
  /* @__PURE__ */ jsx("rect", { x: "2", y: "2", width: "13", height: "13", rx: "2" })
] });
var AccountCheckIcon = (props) => /* @__PURE__ */ jsx(IconBase, { ...props, children: /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" }) });
var DEFAULT_NAV_ITEMS = [
  { label: "My Addresses", href: "/account/addresses", icon: AccountMapPinIcon },
  { label: "My Orders", href: "/account/orders", icon: AccountShoppingBagIcon },
  { label: "My Wishlist", href: "/account/wishlist", icon: AccountHeartIcon }
];
var getContactInfo = (user) => user?.phone || user?.mobile || user?.email || user?.email_address || user?.primaryPhoneNumber?.phoneNumber || user?.primaryEmailAddress?.emailAddress || "Guest User";
var AccountSidebar = ({
  navItems = DEFAULT_NAV_ITEMS,
  user,
  contactInfo,
  onNavigate,
  onLogout,
  className = "",
  showLogout = true,
  logoutLabel = "Logout"
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const coreLogout = useLogout();
  const { auth } = useCore();
  const resolvedContactInfo = contactInfo ?? getContactInfo(user ?? auth?.user);
  const handleNavigate = (href) => {
    if (onNavigate) {
      onNavigate(href);
      return;
    }
    router.push(href);
  };
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    coreLogout();
  };
  return /* @__PURE__ */ jsxs("aside", { className: `w-[220px] flex-shrink-0 border-r border-gray-100 bg-white max-md:w-full max-md:border-b max-md:border-r-0 ${className}`, children: [
    /* @__PURE__ */ jsx("div", { className: "border-b border-gray-100 px-5 py-5 text-center", children: /* @__PURE__ */ jsx("p", { className: "truncate px-2 text-[13px] font-[var(--font-medium)] tracking-wide text-[#555555]", children: resolvedContactInfo }) }),
    /* @__PURE__ */ jsxs("nav", { className: "flex flex-col py-2 max-md:flex-row max-md:overflow-x-auto max-md:py-0", children: [
      navItems.map(({ label, href, icon: Icon = AccountMapPinIcon }) => {
        const isActive = href === "/account" ? pathname === href : pathname.startsWith(href);
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => handleNavigate(href),
            className: `flex items-center gap-3 border-l-[3px] px-5 py-[13px] text-left transition-colors max-md:min-w-max max-md:border-b-[3px] max-md:border-l-0 ${isActive ? "border-l-[var(--core-primary)] bg-[#EBF0FC] text-[#1C1C1C] max-md:border-b-[var(--core-primary)]" : "border-l-transparent text-[#555555] hover:bg-[#FAFAFA] max-md:border-b-transparent"}`,
            children: [
              /* @__PURE__ */ jsx(Icon, { className: `h-[18px] w-[18px] flex-shrink-0 ${isActive ? "text-[var(--core-primary)]" : "text-[#888888]"}` }),
              /* @__PURE__ */ jsx("span", { className: `text-[14px] ${isActive ? "font-[var(--font-semibold)] text-[#1C1C1C]" : "font-[var(--font-medium)] text-[#555555]"}`, children: label })
            ]
          },
          href
        );
      }),
      showLogout && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "mx-5 my-2 border-t border-gray-100 max-md:hidden" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: handleLogout,
            className: "flex items-center gap-3 border-l-[3px] border-l-transparent px-5 py-[13px] text-left text-[#555555] transition-colors hover:bg-[#FAFAFA] max-md:ml-auto max-md:min-w-max max-md:border-l-0",
            children: [
              /* @__PURE__ */ jsx(AccountLogOutIcon, { className: "h-[18px] w-[18px] flex-shrink-0 text-[#888888]" }),
              /* @__PURE__ */ jsx("span", { className: "text-[14px] font-[var(--font-medium)]", children: logoutLabel })
            ]
          }
        )
      ] })
    ] })
  ] });
};
var AccountLayout = ({
  children,
  sidebarProps,
  className = "",
  containerClassName = "",
  panelClassName = "",
  mainClassName = ""
}) => {
  return /* @__PURE__ */ jsx("div", { className: `min-h-screen bg-[#F0F0F0] ${className}`, children: /* @__PURE__ */ jsx("div", { className: `mx-auto max-w-[900px] px-4 py-8 ${containerClassName}`, children: /* @__PURE__ */ jsxs("div", { className: `flex min-h-[520px] overflow-hidden rounded-lg bg-white shadow-sm max-md:flex-col ${panelClassName}`, children: [
    /* @__PURE__ */ jsx(AccountSidebar, { ...sidebarProps }),
    /* @__PURE__ */ jsx("main", { className: `flex-1 p-8 max-md:p-5 ${mainClassName}`, children })
  ] }) }) });
};
var normalizeAddresses = (payload) => payload?.data ?? payload?.addresses ?? (Array.isArray(payload) ? payload : []);
var AccountAddressesPage = () => {
  const { actions, toast } = useCore();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await actions?.getUserAddress?.();
      setAddresses(normalizeAddresses(res));
    } catch (error) {
      console.error("Failed to fetch addresses", error);
      toast?.error?.("Failed to fetch addresses");
    } finally {
      setIsLoading(false);
    }
  }, [actions, toast]);
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);
  const openAddModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };
  const openEditModal = (address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };
  const deleteAddress = async (addressId) => {
    if (!addressId) return;
    setDeletingId(addressId);
    try {
      await actions?.deleteAddress?.(addressId);
      await fetchAddresses();
      toast?.success?.("Address deleted successfully");
    } catch (error) {
      console.error("Failed to delete address", error);
      toast?.error?.("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { className: "mb-4 text-[20px] font-[var(--font-bold)] text-[#1C1C1C]", children: "My addresses" }),
    /* @__PURE__ */ jsxs("button", { onClick: openAddModal, className: "mb-5 flex items-center gap-1.5 text-[14px] font-[var(--font-semibold)] text-[var(--core-primary)] transition-opacity hover:opacity-80", children: [
      /* @__PURE__ */ jsx(AccountPlusIcon, { className: "h-4 w-4", strokeWidth: 2.5 }),
      "Add new address"
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "py-4 text-[14px] text-gray-500 animate-pulse", children: "Loading addresses..." }) : addresses.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-4 text-[14px] text-gray-500", children: "You have no saved addresses." }) : addresses.map((address) => /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between border-b border-gray-100 py-4 last:border-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-[var(--core-primary)]", children: /* @__PURE__ */ jsx(AccountMapPinIcon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[15px] font-[var(--font-bold)] leading-snug text-[#1C1C1C]", children: address.label || address.address_type || "Home" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-0.5 max-w-[480px] text-[13px] font-[var(--font-regular)] leading-relaxed text-[#888888]", children: [
            address.firstname,
            " ",
            address.lastname,
            /* @__PURE__ */ jsx("br", {}),
            address.address1,
            address.address2 ? `, ${address.address2}` : "",
            /* @__PURE__ */ jsx("br", {}),
            [address.city, address.state_name].filter(Boolean).join(", "),
            address.zipcode ? ` - ${address.zipcode}` : ""
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-1 flex flex-shrink-0 items-center gap-2", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => openEditModal(address), className: "flex items-center justify-center rounded-full p-1.5 text-[#888888] transition-colors hover:bg-gray-100 hover:text-[var(--core-primary)]", children: /* @__PURE__ */ jsx(AccountPencilIcon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx("button", { type: "button", disabled: deletingId === address.id, onClick: () => deleteAddress(address.id), className: "flex items-center justify-center rounded-full p-1.5 text-[#888888] transition-colors hover:bg-gray-100 hover:text-red-500 disabled:opacity-50", children: deletingId === address.id ? /* @__PURE__ */ jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" }) : /* @__PURE__ */ jsx(AccountTrashIcon, { className: "h-4 w-4" }) })
      ] })
    ] }, address.id)) }),
    /* @__PURE__ */ jsx(Popup, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), children: /* @__PURE__ */ jsx(
      AddressForm,
      {
        initialData: editingAddress,
        onCancel: () => setIsModalOpen(false),
        onSuccess: () => {
          setIsModalOpen(false);
          fetchAddresses();
        },
        submitLabel: editingAddress?.id ? "Save Changes" : "Save Address"
      }
    ) })
  ] });
};
var AccountOrdersPage = ({ initialOrders = [], pagination }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { formatCurrency } = useCurrencyFormat();
  const itemsPerPage = 10;
  const isServerPaginated = pagination && pagination.total_pages !== void 0;
  const currentPage = isServerPaginated ? pagination.current_page : parseInt(searchParams.get("page") || "1", 10);
  const totalPages = isServerPaginated ? pagination.total_pages : Math.ceil(initialOrders.length / itemsPerPage) || 1;
  const currentOrders = isServerPaginated ? initialOrders : initialOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  const getVisiblePages = (current, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 2)
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  };
  const visiblePages = getVisiblePages(currentPage, totalPages);
  return /* @__PURE__ */ jsxs("div", { className: "animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxs("h1", { className: "mb-6 flex items-center gap-2 text-[20px] font-[var(--font-bold)] text-[#1C1C1C]", children: [
      /* @__PURE__ */ jsx(AccountShoppingBagIcon, { className: "h-5 w-5 text-[var(--core-primary)]" }),
      "My Orders"
    ] }),
    initialOrders.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-100 bg-white py-16 shadow-sm", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F5]", children: /* @__PURE__ */ jsx(
        AccountShoppingBagIcon,
        {
          className: "h-8 w-8 text-[#BBBBBB]",
          strokeWidth: 1.5
        }
      ) }),
      /* @__PURE__ */ jsx("p", { className: "text-[15px] font-[var(--font-semibold)] text-[#1C1C1C]", children: "No orders yet!" }),
      /* @__PURE__ */ jsx("p", { className: "max-w-[260px] text-center text-[13px] text-[#888888]", children: "Looks like you haven't placed any orders yet." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => router.push("/"),
          className: "mt-2 rounded-lg bg-[var(--core-primary)] px-8 py-2.5 text-[13px] font-[var(--font-bold)] text-white transition-colors hover:opacity-90",
          children: "Start Shopping"
        }
      )
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
      currentOrders.map((order) => {
        const o = order.attributes || order;
        const date = o.created_at ? new Date(o.created_at).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }) : "Pending";
        const total = formatCurrency(
          o?.cart?.display_total ?? o?.display_total ?? 0
        );
        const status = o.order_status || o.status || "placed";
        const paymentStatus = o.payment_status || o.cart?.payment_state || "Pending";
        const lineItems = o.cart?.line_items || o.line_items || [];
        return /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => router.push(`/account/orders/${o.number || o.id}`),
            className: "group flex cursor-pointer flex-col justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[var(--core-primary)] hover:shadow-md md:flex-row md:items-center",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-[15px] font-[var(--font-bold)] text-gray-900", children: [
                    "Order #",
                    o.number || o.order_number || o.id
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "rounded bg-blue-50 px-2 py-0.5 text-[11px] font-[var(--font-bold)] uppercase text-[var(--core-primary)]", children: status })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-[13px] font-[var(--font-medium)] text-gray-500", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(AccountCalendarIcon, { className: "h-3.5 w-3.5" }),
                    " ",
                    date
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(AccountTagIcon, { className: "h-3.5 w-3.5" }),
                    " ",
                    total
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 border-l border-gray-200 pl-4", children: [
                    "Payment:",
                    " ",
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: `uppercase text-[11px] font-[var(--font-bold)] tracking-tight ${paymentStatus.toLowerCase() === "received" || paymentStatus.toLowerCase() === "paid" ? "text-green-600" : "text-orange-500"}`,
                        children: paymentStatus
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 flex w-full items-center justify-between gap-6 md:mt-0 md:w-auto md:justify-end", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex -space-x-3", children: [
                  lineItems.slice(0, 3).map((item, index) => /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "relative z-[1] flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white p-1",
                      children: /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: item.image || "/NoProductImage.png",
                          alt: item.name || "item",
                          className: "h-full w-full object-contain"
                        }
                      )
                    },
                    item.id || index
                  )),
                  lineItems.length > 3 && /* @__PURE__ */ jsxs("div", { className: "relative z-0 flex h-10 w-10 items-center justify-center rounded-full border border-white bg-gray-100 text-[10px] font-bold text-gray-600", children: [
                    "+",
                    lineItems.length - 3
                  ] }),
                  lineItems.length === 0 && /* @__PURE__ */ jsx("div", { className: "relative z-[1] flex h-10 w-10 items-center justify-center rounded-full border border-white bg-[#F0F4FF]", children: /* @__PURE__ */ jsx(AccountPackageIcon, { className: "h-5 w-5 text-[var(--core-primary)]" }) })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[13px] font-[var(--font-bold)] text-[var(--core-primary)] group-hover:underline", children: "View Details >" })
              ] })
            ]
          },
          o.id || o.number
        );
      }),
      totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handlePageChange(Math.max(1, currentPage - 1)),
            disabled: currentPage === 1,
            className: "flex h-9 items-center justify-center rounded-lg border border-gray-200 px-3 text-[13px] font-[var(--font-medium)] text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent",
            children: "Previous"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center justify-center gap-1", children: visiblePages.map(
          (page, index) => page === "..." ? /* @__PURE__ */ jsx(
            "span",
            {
              className: "flex h-9 w-6 items-center justify-center text-gray-400",
              children: "..."
            },
            `ellipsis-${index}`
          ) : /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handlePageChange(page),
              className: `flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-[var(--font-bold)] transition-colors ${currentPage === page ? "bg-[var(--core-primary)] text-white" : "text-gray-600 hover:bg-gray-100"}`,
              children: page
            },
            page
          )
        ) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handlePageChange(Math.min(totalPages, currentPage + 1)),
            disabled: currentPage === totalPages,
            className: "flex h-9 items-center justify-center rounded-lg border border-gray-200 px-3 text-[13px] font-[var(--font-medium)] text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent",
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
};
var AccountOrderDetailContent = ({ order, id }) => {
  const { formatCurrency } = useCurrencyFormat();
  const { config } = useCore();
  const [copied, setCopied] = useState(false);
  if (!order) return null;
  const o = order.cart || order;
  const date = new Date(
    order.created_at || o.created_at || Date.now()
  ).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const status = order.order_status || order.payment_state || order.state || "placed";
  const shippingAddress = order.shipping_address || o.shipping_address || {};
  const lineItems = o.line_items || [];
  const orderNumber = order.order_number || o.number || o.order_id || id;
  const appliedDiscounts = o?.cart_discounts || o?.cart_detail_json?.discounts || [];
  const getDiscountAmount = (coupon) => {
    if (coupon?.display_discount_amount != null && coupon?.display_discount_amount !== "") {
      const num = Number(coupon.display_discount_amount);
      if (!isNaN(num)) return num;
    }
    if (coupon?.discount_amount != null) {
      return Number(coupon.discount_amount) / 100;
    }
    return null;
  };
  const promoTotal = Number(o.display_promo_total) || (o.promo_total ? Number(o.promo_total) / 100 : 0);
  const hasPromo = promoTotal > 0 || o.display_promo_total && o.display_promo_total !== "0.00" && o.display_promo_total !== "0" && o.display_promo_total !== 0;
  const totalCalculatedDiscount = appliedDiscounts.reduce((sum, coupon) => {
    const amt = getDiscountAmount(coupon);
    return sum + (amt || 0);
  }, 0);
  const totalSavings = totalCalculatedDiscount > 0 ? totalCalculatedDiscount : promoTotal;
  const handleCopy = () => {
    navigator.clipboard?.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxs("div", { className: "animate-in fade-in w-full pb-6 duration-300", children: [
    /* @__PURE__ */ jsxs("div", { className: "sticky top-0 z-10 mb-2 flex items-center gap-3 border-b border-gray-50/50 bg-white/95 py-2.5 backdrop-blur-md", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/account/orders",
          className: "ml-[-4px] rounded-full p-1.5 transition hover:bg-gray-100",
          children: /* @__PURE__ */ jsx(AccountArrowLeftIcon, { className: "h-5 w-5 text-[#1C1C1C]" })
        }
      ),
      /* @__PURE__ */ jsx("h1", { className: "text-[17px] font-[var(--font-bold)] text-[#1C1C1C]", children: "Order Details" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-2 flex flex-col gap-0.5 rounded-xl border border-gray-100 bg-white p-3 shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[14px] font-[var(--font-bold)] text-black", children: status === "placed" ? "Order Placed" : status.charAt(0).toUpperCase() + status.slice(1) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-[11.5px] font-[var(--font-medium)] text-[#666666]", children: [
              "Order ID: ",
              orderNumber
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleCopy,
                className: "group relative rounded p-1 transition-colors hover:bg-gray-50",
                title: "Copy Order ID",
                children: [
                  copied ? /* @__PURE__ */ jsx(AccountCheckIcon, { className: "h-3 w-3 text-green-600" }) : /* @__PURE__ */ jsx(AccountCopyIcon, { className: "h-3 w-3 text-[#BBBBBB] group-hover:text-[var(--core-primary)]" }),
                  copied && /* @__PURE__ */ jsx("span", { className: "absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-[10px] text-white shadow-lg", children: "Copied!" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "rounded-full bg-[#E8F5E9] px-2 py-0.5 text-[10px] font-[var(--font-bold)] uppercase tracking-tight text-[#2E7D32]", children: status })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-1.5 text-[11px] font-[var(--font-medium)] text-[#888888]", children: [
        /* @__PURE__ */ jsx(AccountCalendarIcon, { className: "h-3 w-3" }),
        " Placed on ",
        date
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b border-gray-50 bg-gray-50/50 px-3 py-2", children: /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-[12px] font-[var(--font-bold)] text-[#1C1C1C]", children: [
        /* @__PURE__ */ jsx(AccountPackageIcon, { className: "h-3.5 w-3.5 text-[var(--core-primary)]" }),
        lineItems.length,
        " ",
        lineItems.length === 1 ? "Item" : "Items"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col", children: lineItems.map((item, index) => {
        const unitValue = item.line_itemable?.selling_quantity?.values?.[0]?.label;
        const amount = item.display_price ?? item.line_itemable?.display_price ?? (item.line_itemable?.price || 0) / 100;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex gap-3 border-b border-gray-50 p-3 transition last:border-0 hover:bg-gray-50",
            children: [
              /* @__PURE__ */ jsx("div", { className: "h-14 w-14 shrink-0 rounded-lg border border-gray-50 bg-[#F8F8F8] p-1", children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.image || "/NoProductImage.png",
                  alt: item.name || item.line_itemable?.name || "item",
                  className: "h-full w-full object-contain"
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col justify-center gap-0.5", children: [
                /* @__PURE__ */ jsx("h3", { className: "line-clamp-1 text-[13px] font-[var(--font-semibold)] leading-snug text-[#1C1C1C]", children: item.name || item.line_itemable?.name }),
                /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    unitValue && /* @__PURE__ */ jsx("span", { className: "text-[11px] font-[var(--font-medium)] text-[#888888]", children: unitValue }),
                    /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-[var(--font-medium)] text-[#888888]", children: [
                      "x ",
                      item.quantity || 1
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-[13px] font-[var(--font-bold)] text-[#1C1C1C]", children: formatCurrency(amount) })
                ] })
              ] })
            ]
          },
          item.id || index
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-2.5 text-[13px] font-[var(--font-bold)] text-[#1C1C1C]", children: "Bill Details" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[12.5px] font-[var(--font-medium)] text-[#555555]", children: [
          /* @__PURE__ */ jsx("span", { children: "Item Total" }),
          /* @__PURE__ */ jsx("span", { children: formatCurrency(
            o.display_item_total ?? (o.item_total || 0) / 100
          ) })
        ] }),
        appliedDiscounts?.length > 0 ? appliedDiscounts.map((coupon, idx) => {
          const amt = getDiscountAmount(coupon) ?? (appliedDiscounts.length === 1 ? totalSavings : 0);
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex justify-between text-[12.5px] font-[var(--font-medium)] text-[#FF6500]",
              children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 flex-wrap", children: [
                  /* @__PURE__ */ jsx("span", { children: "Discount" }),
                  coupon?.code && /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-orange-50 text-[#FF6500] border border-orange-200", children: coupon.code }),
                  coupon?.display_action_value && /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-[#FF6500]/90", children: [
                    "(",
                    coupon.display_action_value,
                    ")"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "-",
                  formatCurrency(amt)
                ] })
              ]
            },
            coupon?.id || coupon?.discount_id || coupon?.code || idx
          );
        }) : hasPromo ? /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[12.5px] font-[var(--font-medium)] text-[#FF6500]", children: [
          /* @__PURE__ */ jsx("span", { children: "Discount" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "-",
            formatCurrency(promoTotal)
          ] })
        ] }) : null,
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[12.5px] font-[var(--font-medium)] text-[#555555]", children: [
          /* @__PURE__ */ jsx("span", { children: "Delivery Charge" }),
          /* @__PURE__ */ jsx("span", { children: formatCurrency(
            o.display_ship_total ?? (o.ship_total || 0) / 100
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[12.5px] font-[var(--font-medium)] text-[#555555]", children: [
          /* @__PURE__ */ jsx("span", { children: "Taxes" }),
          /* @__PURE__ */ jsx("span", { children: formatCurrency(o.display_tax_total ?? (o.tax_total || 0) / 100) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-0.5 flex items-center justify-between border-t border-dashed border-gray-100 pt-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[14px] font-[var(--font-bold)] text-black", children: "Grand Total" }),
          /* @__PURE__ */ jsx("span", { className: "text-[14px] font-[var(--font-bold)] text-black", children: formatCurrency(o.display_total ?? (o.total || 0) / 100) })
        ] }),
        totalSavings > 0 && /* @__PURE__ */ jsxs("p", { className: "text-[12px] font-[var(--font-bold)] text-[#16a34a] pt-1 text-right", children: [
          "You save ",
          formatCurrency(totalSavings),
          " on this order \u{1F389}"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10 rounded-xl border border-gray-100 bg-white p-3 shadow-sm", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-3 text-[13px] font-[var(--font-bold)] text-[#1C1C1C]", children: "Order Details" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F7FA]", children: /* @__PURE__ */ jsx(AccountMapPinIcon, { className: "h-3.5 w-3.5 text-[#888888]" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-[var(--font-bold)] uppercase tracking-wide text-[#888888]", children: "Delivery Address" }),
          /* @__PURE__ */ jsxs("div", { className: "text-[12.5px] font-[var(--font-medium)] leading-relaxed text-[#444444]", children: [
            (shippingAddress.firstname || order.user?.first_name) && /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-bold)] text-[#1C1C1C]", children: [
              shippingAddress.firstname || order.user?.first_name,
              " ",
              shippingAddress.lastname || order.user?.last_name
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              shippingAddress.address1,
              shippingAddress.address2 ? `, ${shippingAddress.address2}` : ""
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              shippingAddress.city,
              shippingAddress.zipcode ? ` - ${shippingAddress.zipcode}` : ""
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-gray-50 flex gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F7FA]", children: /* @__PURE__ */ jsx(AccountPackageIcon, { className: "h-3.5 w-3.5 text-[#888888]" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5 w-full", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-[var(--font-bold)] uppercase tracking-wide text-[#888888]", children: "Order Information" }),
          /* @__PURE__ */ jsxs("div", { className: "text-[12.5px] font-[var(--font-medium)] leading-relaxed text-[#444444] mt-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Order ID: ",
                orderNumber
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleCopy,
                  className: "group relative rounded p-1 transition-colors hover:bg-gray-50",
                  title: "Copy Order ID",
                  children: copied ? /* @__PURE__ */ jsx(AccountCheckIcon, { className: "h-3 w-3 text-green-600" }) : /* @__PURE__ */ jsx(AccountCopyIcon, { className: "h-3 w-3 text-[#BBBBBB] group-hover:text-[var(--core-primary)]" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              "Payment:",
              " ",
              order.payment_status || order.cart?.payment_state || "Pending"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
};
var AccountWishlistPage = ({
  products = [],
  pagination,
  isLoading = false,
  renderProduct
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const itemsPerPage = 12;
  const isServerPaginated = pagination && pagination.total_pages !== void 0;
  const currentPage = isServerPaginated ? pagination.current_page : parseInt(searchParams?.get("page") || "1", 10);
  const totalPages = isServerPaginated ? pagination.total_pages : Math.ceil(products.length / itemsPerPage) || 1;
  const currentProducts = isServerPaginated ? products : products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  const getVisiblePages = (current, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 2)
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  };
  const visiblePages = getVisiblePages(currentPage, totalPages);
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { className: "flex min-h-[400px] flex-col items-center justify-center py-20", children: [
      /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 font-[var(--font-medium)] text-gray-500", children: "Loading your wishlist..." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex w-full flex-col animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxs("h1", { className: "mb-6 flex items-center gap-2 text-[20px] font-[var(--font-bold)] text-[#1C1C1C]", children: [
      /* @__PURE__ */ jsx(AccountHeartIcon, { filled: true, className: "h-5 w-5 text-red-500" }),
      "My Wishlist"
    ] }),
    products.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50", children: /* @__PURE__ */ jsx(
        AccountHeartIcon,
        {
          className: "h-8 w-8 text-red-300",
          strokeWidth: 2
        }
      ) }),
      /* @__PURE__ */ jsx("h2", { className: "mb-2 text-[18px] font-[var(--font-bold)] text-gray-800", children: "Your wishlist is empty" }),
      /* @__PURE__ */ jsx("p", { className: "mb-6 text-[14px] font-[var(--font-medium)] text-gray-500", children: "Save items you love and buy them later." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => router.push("/"),
          className: "rounded-lg bg-[var(--core-primary)] px-6 py-2.5 font-[var(--font-bold)] text-white shadow-sm transition hover:opacity-90",
          children: "Start Shopping"
        }
      )
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5", children: currentProducts.map(
        (product, index) => renderProduct ? renderProduct(product, index) : /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => router.push(`/product/${product.id}`),
            className: "overflow-hidden rounded-lg border border-gray-100 bg-white text-left shadow-sm transition hover:shadow-md",
            children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: product.image || product.product_image_url || "/NoProductImage.png",
                  alt: product.name || "Product",
                  className: "h-40 w-full object-cover"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "p-3", children: /* @__PURE__ */ jsx("p", { className: "line-clamp-2 text-[13px] font-[var(--font-semibold)] text-[#1C1C1C]", children: product.name || "Product" }) })
            ]
          },
          product.id ?? index
        )
      ) }),
      totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap items-center justify-center gap-2 md:gap-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handlePageChange(Math.max(1, currentPage - 1)),
            disabled: currentPage === 1,
            className: "flex h-9 items-center justify-center rounded-lg border border-gray-200 px-3 text-[13px] font-[var(--font-medium)] text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent",
            children: "Previous"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center justify-center gap-1", children: visiblePages.map(
          (page, index) => page === "..." ? /* @__PURE__ */ jsx(
            "span",
            {
              className: "flex h-9 w-6 items-center justify-center text-gray-400",
              children: "..."
            },
            `ellipsis-${index}`
          ) : /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handlePageChange(page),
              className: `flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-[var(--font-bold)] transition-colors ${currentPage === page ? "bg-[var(--core-primary)] text-white" : "text-gray-600 hover:bg-gray-100"}`,
              children: page
            },
            page
          )
        ) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handlePageChange(Math.min(totalPages, currentPage + 1)),
            disabled: currentPage === totalPages,
            className: "flex h-9 items-center justify-center rounded-lg border border-gray-200 px-3 text-[13px] font-[var(--font-medium)] text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent",
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
};
var DownloadIcon = () => /* @__PURE__ */ jsxs(
  "svg",
  {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
      /* @__PURE__ */ jsx("polyline", { points: "7 10 12 15 17 10" }),
      /* @__PURE__ */ jsx("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
    ]
  }
);
var OrderConfirmationIcon = () => /* @__PURE__ */ jsxs(
  "svg",
  {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      /* @__PURE__ */ jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
      /* @__PURE__ */ jsx("polyline", { points: "22 4 12 14.01 9 11.01" })
    ]
  }
);
var fallbackToast = {
  error: (msg) => console.error(msg),
  success: (msg) => console.log(msg)
};
var Order = (props) => {
  const params = useParams();
  const id = params?.orderid;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { formatCurrency } = useCurrencyFormat();
  const show = searchParams.get("show") === "true";
  const { actions, config, orgData, toast = fallbackToast } = useCore();
  const orgDetail = orgData;
  const orgRaffles = [];
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFetchingInvoice, setIsFetchingInvoice] = useState(false);
  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        if (!actions?.getOrderById) {
          throw new Error("getOrderById action is not available");
        }
        const orderData = await actions.getOrderById(id);
        setData(orderData);
      } catch (err) {
        console.error("Failed to fetch order", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id, actions, config?.storeId]);
  const {
    order_number,
    created_at,
    cart,
    order_type,
    state,
    order_status,
    payment_state,
    payment_status
  } = data || {};
  const {
    shipping_address,
    billing_address,
    line_items,
    display_total,
    display_item_total,
    display_ship_total,
    display_tax_total,
    discount_id,
    display_promo_total,
    promo_total,
    cart_detail_json
  } = cart || {};
  const appliedDiscounts = cart?.cart_discounts || cart?.cart_detail_json?.discounts || [];
  const getDiscountAmount = (coupon) => {
    if (coupon?.display_discount_amount != null && coupon?.display_discount_amount !== "") {
      const num = Number(coupon.display_discount_amount);
      if (!isNaN(num)) return num;
    }
    if (coupon?.discount_amount != null) {
      return Number(coupon.discount_amount) / 100;
    }
    return null;
  };
  const hasPromoTotal = display_promo_total !== void 0 && display_promo_total !== null && Number(display_promo_total) > 0 && display_promo_total !== "0.00" && display_promo_total !== "0" || promo_total !== void 0 && promo_total !== null && Number(promo_total) > 0;
  const promoTotalAmount = Number(display_promo_total) || (promo_total ? Number(promo_total) / 100 : 0);
  const totalCalculatedDiscount = appliedDiscounts.reduce((sum, coupon) => {
    const amt = getDiscountAmount(coupon);
    return sum + (amt || 0);
  }, 0);
  const totalSavings = totalCalculatedDiscount > 0 ? totalCalculatedDiscount : promoTotalAmount;
  const fullShippingAddress = [
    shipping_address?.address1,
    shipping_address?.address2,
    shipping_address?.city,
    shipping_address?.state_name,
    shipping_address?.zipcode,
    shipping_address?.country_name
  ].filter(Boolean).join(", ");
  const fullBillingAddress = [
    billing_address?.address1,
    billing_address?.address2,
    billing_address?.city,
    billing_address?.state_name,
    billing_address?.zipcode,
    billing_address?.country_name
  ].filter(Boolean).join(", ");
  const storePickUpAddress = orgDetail?.organization_setting?.store_pickup_info?.store_pickup_address;
  const orderDate = created_at ? new Date(created_at).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }) : "";
  const onDownloadReceipt = async () => {
    try {
      setIsFetchingInvoice(true);
      if (!actions?.getOrderInvoice) {
        throw new Error("getOrderInvoice action is not available");
      }
      const res = await actions.getOrderInvoice(id);
      if (res) {
        window.open(res, "_blank");
      }
    } catch (err) {
      console.error("Invoice download failed", err);
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setIsFetchingInvoice(false);
    }
  };
  return isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsx(Spinner, {}) }) : isError ? /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(EmptyState, { title: "Order not found" }) }) : /* @__PURE__ */ jsx("div", { className: "flex justify-center items-start mx-[16px] md:mx-[32px] mt-[100px] mb-[100px]", children: /* @__PURE__ */ jsx("div", { className: "w-full overflow-hidden flex justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row flex-wrap gap-[15px] max-w-[1248px] w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col gap-8", children: [
      show && /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-start gap-3 p-4 rounded-lg border-l-4",
          style: {
            borderColor: "var(--core-secondary)",
            background: "color-mix(in srgb, var(--core-secondary) 8%, white)"
          },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "mt-0.5 shrink-0",
                style: { color: "var(--core-secondary)" },
                children: /* @__PURE__ */ jsx(OrderConfirmationIcon, {})
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx("p", { className: "font-[var(--font-bold)] text-[16px] text-[var(--core-primary)] uppercase tracking-wide", children: "Thank you. Your order has been received" }),
              /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-regular)] text-[13px] text-gray-500", children: [
                "Order\xA0",
                /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-bold)] text-[var(--core-primary)]", children: [
                  "#",
                  order_number
                ] }),
                " ",
                "is confirmed and being processed."
              ] })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-[var(--font-bold)] text-[18px] text-[var(--core-primary)] uppercase tracking-wider", children: "Order Details" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "flex items-center gap-1.5 px-3 py-2 rounded font-[var(--font-bold)] text-[13px] text-white transition-opacity hover:opacity-85 disabled:opacity-60 cursor-pointer",
              style: { background: "var(--core-primary)" },
              onClick: onDownloadReceipt,
              disabled: isFetchingInvoice,
              children: isFetchingInvoice ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsxs(Fragment, { children: [
                "Receipt ",
                /* @__PURE__ */ jsx(DownloadIcon, {})
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "border rounded-lg overflow-hidden",
            style: {
              borderColor: "color-mix(in srgb, var(--core-primary) 20%, #e8e5df)"
            },
            children: [
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "grid grid-cols-2 divide-x",
                  style: {
                    divideColor: "color-mix(in srgb, var(--core-primary) 15%, #e8e5df)"
                  },
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "p-4 flex flex-col gap-1", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest", children: "Order Number" }),
                      /* @__PURE__ */ jsx("p", { className: "font-[var(--font-bold)] text-[14px] text-[var(--core-primary)]", children: order_number || "\u2014" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "p-4 flex flex-col gap-1", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest", children: "Order Status" }),
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: "inline-flex self-start font-[var(--font-bold)] text-[12px] px-2.5 py-0.5 rounded-full uppercase tracking-wide",
                          style: {
                            background: "color-mix(in srgb, var(--core-secondary) 15%, white)",
                            color: "var(--core-primary)",
                            border: "1px solid color-mix(in srgb, var(--core-secondary) 40%, white)"
                          },
                          children: order_status || "Processing"
                        }
                      )
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "border-t",
                  style: {
                    borderColor: "color-mix(in srgb, var(--core-primary) 12%, #e8e5df)"
                  }
                }
              ),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "grid grid-cols-2 divide-x",
                  style: {
                    divideColor: "color-mix(in srgb, var(--core-primary) 15%, #e8e5df)"
                  },
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "p-4 flex flex-col gap-1", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest", children: "Order Date" }),
                      /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-[14px] text-[var(--core-primary)]", children: orderDate || "\u2014" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "p-4 flex flex-col gap-1", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest", children: "Payment Status" }),
                      /* @__PURE__ */ jsx(
                        "p",
                        {
                          className: "font-[var(--font-bold)] text-[13px] uppercase",
                          style: {
                            color: payment_status === "paid" || payment_status === "received" ? "#16a34a" : "var(--core-secondary)"
                          },
                          children: payment_status || "Pending"
                        }
                      )
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "border-t",
                  style: {
                    borderColor: "color-mix(in srgb, var(--core-primary) 12%, #e8e5df)"
                  }
                }
              ),
              order_type === "pickup" ? /* @__PURE__ */ jsxs("div", { className: "p-4 flex flex-col gap-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest", children: "Pickup Address" }),
                /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-[14px] text-[var(--core-primary)]", children: storePickUpAddress || "\u2014" })
              ] }) : /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x",
                  style: {
                    borderColor: "color-mix(in srgb, var(--core-primary) 12%, #e8e5df)"
                  },
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "p-4 flex flex-col gap-2", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest", children: "Delivery Address" }),
                      shipping_address?.label && /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: "self-start text-[10px] font-[var(--font-bold)] px-2 py-0.5 rounded-full uppercase tracking-widest",
                          style: {
                            background: "color-mix(in srgb, var(--core-primary) 10%, white)",
                            color: "var(--core-primary)"
                          },
                          children: shipping_address.label
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
                        /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-bold)] text-[13px] text-[var(--core-primary)]", children: [
                          `${shipping_address?.firstname ?? ""} ${shipping_address?.lastname ?? ""}`.trim(),
                          shipping_address?.phone && /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-regular)] text-gray-500", children: [
                            " ",
                            "\xB7 ",
                            shipping_address.phone
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[13px] text-gray-500 leading-relaxed", children: fullShippingAddress })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "p-4 flex flex-col gap-2", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest", children: "Billing Address" }),
                      billing_address?.label && /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: "self-start text-[10px] font-[var(--font-bold)] px-2 py-0.5 rounded-full uppercase tracking-widest",
                          style: {
                            background: "color-mix(in srgb, var(--core-primary) 10%, white)",
                            color: "var(--core-primary)"
                          },
                          children: billing_address.label
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
                        /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-bold)] text-[13px] text-[var(--core-primary)]", children: [
                          `${billing_address?.firstname ?? ""} ${billing_address?.lastname ?? ""}`.trim(),
                          billing_address?.phone && /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-regular)] text-gray-500", children: [
                            " ",
                            "\xB7 ",
                            billing_address.phone
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[13px] text-gray-500 leading-relaxed", children: fullBillingAddress })
                      ] })
                    ] })
                  ]
                }
              )
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "text-white py-3 hidden md:block transition cursor-pointer font-[var(--font-bold)] text-[14px] uppercase tracking-widest hover:opacity-85",
          style: { background: "var(--core-primary)" },
          onClick: () => router.push("/"),
          children: "Continue Shopping"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border border-[#e8e5df] hidden md:block" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col gap-8 mt-[32px] md:mt-0", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h3", { className: "font-[var(--font-bold)] text-[18px] text-[var(--core-primary)] uppercase tracking-wider mb-6", children: [
          "Ordered Items (",
          line_items?.length || 0,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4", children: line_items?.map((item, idx) => {
          const orgRaffleId = item?.line_itemable?.organization_raffle_id;
          const associateRaffle = orgRaffles?.find(
            (data2) => data2?.id === orgRaffleId
          );
          return /* @__PURE__ */ jsx(
            ProductlistCard_default,
            {
              product: item,
              component: "order",
              raffleName: associateRaffle?.raffle_name,
              orderType: order_type
            },
            idx
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "border rounded-lg overflow-hidden",
          style: {
            borderColor: "color-mix(in srgb, var(--core-primary) 20%, #e8e5df)"
          },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "px-4 py-3",
                style: {
                  background: "color-mix(in srgb, var(--core-primary) 6%, white)"
                },
                children: /* @__PURE__ */ jsx("h3", { className: "font-[var(--font-bold)] text-[15px] text-[var(--core-primary)] uppercase tracking-wider", children: "Bill Summary" })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "p-4 flex flex-col gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsx("span", { className: "font-[var(--font-regular)] text-[14px] text-gray-500", children: "Item Total" }),
                /* @__PURE__ */ jsx("span", { className: "font-[var(--font-medium)] text-[14px] text-[var(--core-primary)]", children: formatCurrency(display_item_total) })
              ] }),
              appliedDiscounts?.length > 0 ? appliedDiscounts.map((coupon, idx) => {
                const amt = getDiscountAmount(coupon) ?? (appliedDiscounts.length === 1 ? totalSavings : 0);
                return /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "flex justify-between items-center text-[14px]",
                    children: [
                      /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-medium)] text-[#FF6500] flex items-center gap-1.5 flex-wrap", children: [
                        /* @__PURE__ */ jsx("span", { children: "Discount" }),
                        coupon?.code && /* @__PURE__ */ jsx("span", { className: "font-mono text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-[#FF6500] border border-orange-200", children: coupon.code }),
                        coupon?.display_action_value && /* @__PURE__ */ jsxs("span", { className: "text-xs text-[#FF6500]/90", children: [
                          "(",
                          coupon.display_action_value,
                          ")"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-medium)] text-[#FF6500]", children: [
                        "-",
                        formatCurrency(amt)
                      ] })
                    ]
                  },
                  coupon?.id || coupon?.discount_id || coupon?.code || idx
                );
              }) : hasPromoTotal ? /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-[14px]", children: [
                /* @__PURE__ */ jsx("span", { className: "font-[var(--font-medium)] text-[#FF6500]", children: "Discount" }),
                /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-medium)] text-[#FF6500]", children: [
                  "-",
                  formatCurrency(promoTotalAmount)
                ] })
              ] }) : null,
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsx("span", { className: "font-[var(--font-regular)] text-[14px] text-gray-500", children: "Tax" }),
                /* @__PURE__ */ jsx("span", { className: "font-[var(--font-medium)] text-[14px] text-[var(--core-primary)]", children: formatCurrency(display_tax_total) })
              ] }),
              order_type !== "pickup" && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsx("span", { className: "font-[var(--font-regular)] text-[14px] text-gray-500", children: "Shipping" }),
                /* @__PURE__ */ jsx("span", { className: "font-[var(--font-medium)] text-[14px] text-[var(--core-primary)]", children: display_ship_total === "0.00" || display_ship_total === 0 || display_ship_total === "0" ? /* @__PURE__ */ jsx(
                  "span",
                  {
                    style: { color: "#16a34a" },
                    className: "font-[var(--font-bold)]",
                    children: "Free"
                  }
                ) : formatCurrency(display_ship_total) })
              ] }),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-px my-1",
                  style: {
                    background: "color-mix(in srgb, var(--core-secondary) 35%, #e8e5df)"
                  }
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsx("span", { className: "font-[var(--font-bold)] text-[15px] text-[var(--core-primary)]", children: "Total" }),
                /* @__PURE__ */ jsx("span", { className: "font-[var(--font-bold)] text-[17px] text-[var(--core-primary)]", children: formatCurrency(display_total) })
              ] }),
              totalSavings > 0 && /* @__PURE__ */ jsxs("p", { className: "text-[13px] font-[var(--font-bold)] text-[#16a34a] mt-[6px] text-right", children: [
                "You save ",
                formatCurrency(totalSavings),
                " on this order \u{1F389}"
              ] })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "text-white py-3 mt-8 block md:hidden transition cursor-pointer font-[var(--font-bold)] text-[14px] uppercase tracking-widest hover:opacity-85",
        style: { background: "var(--core-primary)" },
        onClick: () => router.push("/"),
        children: "Continue Shopping"
      }
    )
  ] }) }) });
};
var Hello = () => {
  const { cart, isCartLoading } = useCore();
  return /* @__PURE__ */ jsx("div", { children: isCartLoading ? "Loading..." : "Core Working \u2705" });
};
var DeveloperErrorBoundary = class extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    captureDeveloperException(error, {
      componentStack: errorInfo?.componentStack,
      source: "DeveloperErrorBoundary",
      name: this.props.name || "UnnamedBoundary"
    });
    if (typeof this.props.onError === "function") {
      this.props.onError(error, errorInfo);
    }
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === "function" ? this.props.fallback(this.state.error) : this.props.fallback;
      }
      if (process.env.NODE_ENV === "development") {
        return /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              padding: "16px",
              margin: "12px 0",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              backgroundColor: "#fef2f2",
              color: "#991b1b",
              fontFamily: "monospace",
              fontSize: "13px"
            },
            children: [
              /* @__PURE__ */ jsx("strong", { children: "Developer Error Caught:" }),
              /* @__PURE__ */ jsx("p", { style: { margin: "6px 0 0 0" }, children: this.state.error?.message })
            ]
          }
        );
      }
      return null;
    }
    return this.props.children;
  }
};

export { AccountAddressesPage, AccountLayout, AccountOrderDetailContent, AccountOrdersPage, AccountPage, AccountSidebar, AccountWishlistPage, AddressCard2 as AddressCard, AddressForm, AuthManager, CartItem, CartMismatchBanner, CartPage, CartSummary, CoreProvider, CouponSection_default as CouponSection, CustomOTPAuth, DEFAULT_NAV_ITEMS as DEFAULT_ACCOUNT_NAV_ITEMS, DeveloperErrorBoundary, EmptyState, Hello, Order, OrdersList, POSTHOG_INSTANCES, Popup, ProfileForm, Spinner, ThirdPartyScripts, UserInfo, ViewCart, buildItem, buildMeta, captureDeveloperException, clearEcommerce, devLogger, getDeveloperPostHog, getMerchantPostHog, getPostHogInstance, identifyDeveloperUser, initDeveloperPostHog, initGtmConfig, initMerchantPostHog, initMetaPixelConfig, initPostHog, injectContentSquare, injectHotjar, invalidateLikedProductsCache, logDeveloper, nameToSlug, pushToDataLayer, resetDeveloperPostHog, sanitizePostHogToken, setDeveloperSuperProperties, trackAddPaymentInfo, trackAddShippingInfo, trackAddToCart, trackApplyCoupon, trackBeginCheckout, trackCustomEvent, trackMetaAddPaymentInfo, trackMetaAddToCart, trackMetaCompleteRegistration, trackMetaInitiateCheckout, trackMetaLead, trackMetaPageView, trackMetaPurchase, trackMetaSearch, trackMetaViewContent, trackPageView, trackPaymentFailed, trackPurchase, trackSearch, trackViewItem, useAddToCart, useAuth, useCart, userCartInfo_default as useCartInfo, useCore, useCurrencyFormat, useGetCurrentUserLikedProductsQuery, useLogout, useVariantSelection };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map