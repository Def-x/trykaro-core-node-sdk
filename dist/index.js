import { getLoyaltyProfileAction, getLoyaltyRewardsAction, getLoyaltyTransactionsAction, applyLoyaltyPointsAction, removeDiscountById } from './chunk-FU6T37BZ.js';
export { applyDiscount, applyLoyaltyPointsAction, getLoyaltyProfileAction, getLoyaltyRewardsAction, getLoyaltyTransactionsAction, removeDiscountById } from './chunk-FU6T37BZ.js';
import { configureStorefront, trackDiscountEventAction, removeDiscountAction, applyDiscountAction, getAvailableDiscountsAction, getOrderInvoiceAction, getOrderByIdAction, getOrdersAction, updateUserAction, getUserAction, deleteAddressAction, updateAddressAction, createAddressAction, getAddressesAction, createStripePaymentIntentAction, updatePhonePePaymentAction, createPhonePeOrderAction, updateCartPaymentAction, createCartPaymentAction, updateRazorpayPaymentAction, createRazorpayOrderAction, deleteLineItemAction, updateLineItemAction, createLineItemAction, updateCartIdLineItemsAction, updateCartAction, createCartAction, getCartByIdAction, getCartAction, getRegionsAction, loginUser, signUpUser, verifyOtp, getCurrentUserLikedProductsAction, validateCartTotal } from './chunk-EV4KF7EK.js';
export { applyDiscountAction, buildHeaders, configureStorefront, createAddressAction, createCartAction, createCartPaymentAction, createLineItemAction, createPhonePeOrderAction, createRazorpayOrderAction, createStripePaymentIntentAction, deleteAddressAction, deleteLineItemAction, getAddressesAction, getAllTaxonsAction, getApiBaseUrl, getAvailableDiscountsAction, getCartAction, getCartByIdAction, getCurrentUserLikedProductsAction, getEnv, getLikedProductsAction, getOrderByIdAction, getOrderInvoiceAction, getOrdersAction, getOrgVideosAction, getOrganizationAction, getOrganizationId, getProductByIdAction, getProductsAction, getProductsByIdsAction, getProductsFilterAction, getRecentlyViewedProductsAction, getRegionsAction, getRelatedProductsAction, getServerToken, getStorefrontGlobalConfig, getTaxonByIdAction, getTaxonomiesAction, getTaxonomyByIdAction, getUserAction, likeProductAction, loginUser, removeDiscountAction, revalidateCacheTag, signUpUser, trackDiscountEventAction, unlikeProductAction, updateAddressAction, updateCartAction, updateCartIdLineItemsAction, updateCartPaymentAction, updateLineItemAction, updatePhonePePaymentAction, updateRazorpayPaymentAction, updateUserAction, validateCartTotal, verifyOtp } from './chunk-EV4KF7EK.js';
import { getPaymentGateway } from './chunk-UG7KTLQ5.js';
import { trackBeginCheckout, trackAddShippingInfo, trackAddPaymentInfo, trackPurchase, trackPaymentFailed, trackAddToCart, trackCustomEvent, buildItem } from './chunk-O76ELHLQ.js';
export { buildItem, buildMeta, clearEcommerce, initGtmConfig, pushToDataLayer, trackAddPaymentInfo, trackAddShippingInfo, trackAddToCart, trackApplyCoupon, trackBeginCheckout, trackCustomEvent, trackPageView, trackPaymentFailed, trackPurchase, trackSearch, trackViewItem } from './chunk-O76ELHLQ.js';
import { trackMetaInitiateCheckout, trackMetaAddPaymentInfo, trackMetaPurchase, trackMetaAddToCart } from './chunk-RHCZFTL4.js';
export { initMetaPixelConfig, trackMetaAddPaymentInfo, trackMetaAddToCart, trackMetaCompleteRegistration, trackMetaInitiateCheckout, trackMetaLead, trackMetaPageView, trackMetaPurchase, trackMetaSearch, trackMetaViewContent } from './chunk-RHCZFTL4.js';
import { initDeveloperPostHog, setDeveloperSuperProperties, identifyDeveloperUser, captureDeveloperException, devLogger, getDeveloperPostHog } from './chunk-W6GQUMET.js';
export { POSTHOG_INSTANCES, captureDeveloperException, devLogger, getDeveloperPostHog, getMerchantPostHog, getPostHogInstance, identifyDeveloperUser, initDeveloperPostHog, initMerchantPostHog, initPostHog, logDeveloper, resetDeveloperPostHog, sanitizePostHogToken, setDeveloperSuperProperties } from './chunk-W6GQUMET.js';
import { __publicField } from './chunk-V6TY7KAL.js';
import React6, { createContext, useEffect, useState, useCallback, useMemo, useContext, useRef, Component } from 'react';
import { createPortal } from 'react-dom';
import { useRazorpay } from 'react-razorpay';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import Cookies from 'js-cookie';
import { useUser, useClerk } from '@clerk/nextjs';
import { flatten, map, compact, filter, uniqBy } from 'lodash';

// src/lib/thirdPartyScripts.ts
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
  if (n.includes("phonepe") || n.includes("phone-pe") || n.includes("phone_pe")) return "phonepe";
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

// src/components/tracking/ThirdPartyScripts.tsx
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
function useAddToCart() {
  const { cart, setCart, actions, toast, auth, config, openCartDrawer } = useCore();
  const [quantity, setQuantity] = useState(1);
  const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);
  const [deletingLineItemId, setDeletingLineItemId] = useState(null);
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
  const handleAddToCart = async (product, customizations = [], overrideQty = null, options) => {
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
      const rawUserId = auth?.user?.id ?? auth?.user?.userId ?? null;
      const userId = rawUserId !== null ? String(rawUserId) : null;
      const currency = config?.currency ?? "INR";
      const qty = overrideQty !== null ? overrideQty : quantity ?? 1;
      trackAddToCart({ userId, product, qty, currency });
      trackMetaAddToCart(product, qty);
      toast?.success?.(`${product?.name || "Item"} added to cart`);
      if (options?.openDrawer !== false) {
        openCartDrawer?.();
      }
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
        setDeletingLineItemId(existingLineItem.id);
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
      setDeletingLineItemId(null);
    }
  };
  const handleDeleteLineItem = async (productOrId) => {
    try {
      setIsAddToCartLoading(true);
      let lineItemId = null;
      let targetProduct = null;
      if (typeof productOrId === "string" || typeof productOrId === "number") {
        const strId = String(productOrId);
        const directMatch = cart?.line_items?.find(
          (it) => String(it.id) === strId
        );
        if (directMatch) {
          lineItemId = directMatch.id;
          targetProduct = directMatch;
        } else {
          const productMatch = cart?.line_items?.find(
            (it) => String(it.line_itemable?.id) === strId
          );
          if (productMatch) {
            lineItemId = productMatch.id;
            targetProduct = productMatch;
          } else {
            lineItemId = productOrId;
          }
        }
      } else if (productOrId && typeof productOrId === "object") {
        if (productOrId.line_itemable && productOrId.id != null) {
          lineItemId = productOrId.id;
          targetProduct = productOrId;
        } else {
          const found = getCartItem(productOrId) || cart?.line_items?.find(
            (it) => String(it.id) === String(productOrId.id) || String(it.line_itemable?.id) === String(productOrId.id)
          );
          lineItemId = found?.id ?? productOrId.line_item_id ?? productOrId.id ?? null;
          targetProduct = found ?? productOrId;
        }
      }
      if (!lineItemId || lineItemId === "undefined" || lineItemId === "null") {
        console.error("[useAddToCart] handleDeleteLineItem: Invalid lineItemId", productOrId);
        return;
      }
      setDeletingLineItemId(lineItemId);
      await actions.deleteLineItem?.(lineItemId, { token: userToken });
      const activeCartId = cart?.id;
      if (activeCartId) {
        await refreshCart(activeCartId);
      }
      const rawUserId = auth?.user?.id ?? auth?.user?.userId ?? null;
      const userId = rawUserId !== null ? String(rawUserId) : null;
      const currency = config?.currency ?? "INR";
      const itemToTrack = targetProduct || productOrId;
      trackCustomEvent("remove_from_cart", userId, {
        currency,
        value: Number(itemToTrack?.line_itemable?.price ?? itemToTrack?.price ?? 0) * (itemToTrack?.quantity ?? 1),
        items: [buildItem(itemToTrack, itemToTrack?.quantity ?? 1)]
      });
      toast?.success?.(
        `${itemToTrack?.line_itemable?.name || itemToTrack?.name || "Item"} removed from cart`
      );
    } catch (err) {
      console.error("[useAddToCart] handleDeleteLineItem error:", err);
      const errorMsg = err?.data?.error || err?.message;
      if (errorMsg && typeof errorMsg === "string") {
        toast?.error?.(errorMsg);
      } else {
        toast?.error?.("Failed to remove item");
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
    cart
  };
}

// src/hooks/useCurrencyFormat.ts
var SYMBOL_TO_ISO = {
  "\u20B9": "INR",
  Rs: "INR",
  "Rs.": "INR",
  "$": "USD",
  "\u20AC": "EUR",
  "\xA3": "GBP",
  "\xA5": "JPY",
  "A$": "AUD",
  "C$": "CAD",
  AED: "AED"
};
function useCurrencyFormat() {
  const { config, orgData } = useCore();
  const isRegionBased = Boolean(config?.isRegion);
  const activeRegion = isRegionBased ? config?.activeRegion ?? config?.region ?? null : null;
  const rawCurrency = isRegionBased ? activeRegion?.currency ?? config?.currency ?? orgData?.organization_setting?.currency ?? "INR" : config?.currency ?? orgData?.organization_setting?.currency ?? "INR";
  const locale = isRegionBased ? activeRegion?.locale ?? config?.locale ?? orgData?.organization_setting?.locale ?? "en-IN" : config?.locale ?? orgData?.organization_setting?.locale ?? "en-IN";
  const isIsoCode = typeof rawCurrency === "string" && /^[A-Z]{3}$/i.test(rawCurrency.trim());
  const mappedIso = !isIsoCode && typeof rawCurrency === "string" ? SYMBOL_TO_ISO[rawCurrency.trim()] : null;
  const currency = isIsoCode ? rawCurrency.trim().toUpperCase() : mappedIso ?? config?.currency ?? orgData?.organization_setting?.currency ?? "INR";
  const symbolFromCurrency = !isIsoCode && typeof rawCurrency === "string" ? rawCurrency.trim() : null;
  const orgSymbol = orgData?.invoice_setting?.currency_symbol || orgData?.organization_setting?.invoice_setting?.currency_symbol || orgData?.organization_setting?.currency_symbol;
  const currencySymbol = isRegionBased ? activeRegion?.invoice_setting?.currency_symbol || activeRegion?.currency_symbol || config?.currencySymbol || orgSymbol || symbolFromCurrency || null : config?.currencySymbol || orgSymbol || symbolFromCurrency || (currency === "INR" ? "\u20B9" : null);
  const formatCurrency = (amount) => {
    if (amount == null) return "";
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return String(amount);
    const formattedAmount = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
    if (currencySymbol) {
      return `${currencySymbol}${formattedAmount}`;
    }
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: isIsoCode ? currency : "INR"
      }).format(numericAmount);
    } catch {
      return `${currencySymbol || currency} ${formattedAmount}`;
    }
  };
  return { formatCurrency };
}
var useLoyalty = (options = {}) => {
  const { autoFetch = true } = options;
  const { actions, auth, config, cart, setCart, toast } = useCore();
  const token = auth?.token ?? auth?.access_token ?? null;
  const signedIn = !!((auth?.isSignedIn ?? false) || token);
  const [profile, setProfile] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionsTotalCount, setTransactionsTotalCount] = useState(0);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsPerPage, setTransactionsPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [isRewardsLoading, setIsRewardsLoading] = useState(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState(null);
  const fetchProfile = useCallback(async () => {
    if (!token && !signedIn) {
      setProfile(null);
      setCustomer(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const getProfileFn = actions?.getLoyaltyProfile || getLoyaltyProfileAction;
      const res = await getProfileFn({
        token,
        config,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId
      });
      if (res?.customer) {
        setProfile(res);
        setCustomer(res.customer);
      } else {
        setProfile(res || null);
        setCustomer(null);
      }
    } catch (err) {
      console.warn("Failed to fetch loyalty profile:", err);
      setProfile(null);
      setCustomer(null);
      setError(err?.message || "Failed to fetch loyalty profile");
    } finally {
      setIsLoading(false);
    }
  }, [actions?.getLoyaltyProfile, token, signedIn, config]);
  const fetchRewards = useCallback(async () => {
    if (!token && !signedIn) {
      setRewards([]);
      return;
    }
    setIsRewardsLoading(true);
    try {
      const getRewardsFn = actions?.getLoyaltyRewards || getLoyaltyRewardsAction;
      const res = await getRewardsFn({
        token,
        config,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId
      });
      if (res && Array.isArray(res.rewards)) {
        setRewards(res.rewards);
      } else {
        setRewards([]);
      }
    } catch (err) {
      console.error("Failed to fetch loyalty rewards:", err);
    } finally {
      setIsRewardsLoading(false);
    }
  }, [actions?.getLoyaltyRewards, token, signedIn, config]);
  const fetchTransactions = useCallback(
    async (params = {}) => {
      const page = params.page ?? transactionsPage;
      const perPage = params.per_page ?? transactionsPerPage;
      if (!token && !signedIn) {
        setTransactions([]);
        setTransactionsTotalCount(0);
        return;
      }
      setIsTransactionsLoading(true);
      try {
        const getTransactionsFn = actions?.getLoyaltyTransactions || getLoyaltyTransactionsAction;
        const res = await getTransactionsFn(
          { page, per_page: perPage },
          {
            token,
            config,
            apiBaseUrl: config?.apiBaseUrl,
            orgId: config?.storeId
          }
        );
        if (res?.transactions && Array.isArray(res.transactions)) {
          setTransactions(res.transactions);
          setTransactionsTotalCount(res.total_count ?? res.transactions.length);
          if (res.page) setTransactionsPage(res.page);
          if (res.per_page) setTransactionsPerPage(res.per_page);
        } else {
          setTransactions([]);
          setTransactionsTotalCount(0);
        }
      } catch (err) {
        console.warn("Failed to fetch loyalty transactions:", err);
        setTransactions([]);
        setTransactionsTotalCount(0);
      } finally {
        setIsTransactionsLoading(false);
      }
    },
    [actions?.getLoyaltyTransactions, token, signedIn, config, transactionsPage, transactionsPerPage]
  );
  useEffect(() => {
    if (autoFetch && (token || signedIn)) {
      fetchProfile();
      fetchRewards();
      fetchTransactions({ page: 1, per_page: 20 });
    }
  }, [autoFetch, token, signedIn, fetchProfile, fetchRewards, fetchTransactions]);
  const applyPoints = useCallback(
    async ({
      cart_id,
      points_to_use
    }) => {
      const targetCartId = cart_id || cart?.id;
      if (!targetCartId) {
        const errMsg = "Cart ID is required to apply loyalty points";
        toast?.error?.(errMsg);
        return { success: false, serverError: errMsg };
      }
      if (!points_to_use || points_to_use <= 0) {
        const errMsg = "Please enter a valid amount of points to redeem";
        toast?.error?.(errMsg);
        return { success: false, serverError: errMsg };
      }
      setIsApplying(true);
      try {
        const applyFn = actions?.applyLoyaltyPoints || applyLoyaltyPointsAction;
        const res = await applyFn(
          {
            cart_id: String(targetCartId),
            points_to_use: Number(points_to_use)
          },
          {
            token,
            config,
            apiBaseUrl: config?.apiBaseUrl,
            orgId: config?.storeId
          }
        );
        if (res?.serverError) {
          toast?.error?.(res.serverError);
          return res;
        }
        if (res?.cart && setCart) {
          setCart(res.cart);
        } else if (actions?.getCart && token) {
          try {
            const updated = await actions.getCart(config?.regionId, { token });
            if (setCart && updated) {
              setCart(Array.isArray(updated) ? updated[0] : updated);
            }
          } catch {
          }
        }
        toast?.success?.(
          `Successfully applied ${points_to_use} points to your cart!`
        );
        const convRate = customer && customer.available_points > 0 && customer.monetary_value_inr > 0 ? customer.monetary_value_inr / customer.available_points : 0.877;
        setCustomer(
          (prev) => prev ? {
            ...prev,
            available_points: Math.max(
              0,
              prev.available_points - Number(points_to_use)
            ),
            total_redeemed: (prev.total_redeemed || 0) + Number(points_to_use),
            monetary_value_inr: Math.max(
              0,
              Math.round(
                (prev.available_points - Number(points_to_use)) * convRate * 100
              ) / 100
            )
          } : null
        );
        return {
          success: true,
          cart_id: String(targetCartId),
          points_to_use,
          ...res
        };
      } catch (err) {
        const errMsg = err?.message || "Failed to apply points to cart";
        toast?.error?.(errMsg);
        return {
          success: false,
          serverError: errMsg
        };
      } finally {
        setIsApplying(false);
      }
    },
    [cart?.id, actions, token, config, setCart, toast]
  );
  const copyReferralCode = useCallback(async () => {
    const code = customer?.referral_code;
    if (!code) return false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        toast?.success?.(`Referral code ${code} copied to clipboard!`);
        return true;
      }
      return false;
    } catch {
      toast?.error?.("Failed to copy referral code");
      return false;
    }
  }, [customer?.referral_code, toast]);
  const copyReferralLink = useCallback(async () => {
    const link = customer?.referral_link;
    if (!link) return false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(link);
        toast?.success?.("Referral link copied to clipboard!");
        return true;
      }
      return false;
    } catch {
      toast?.error?.("Failed to copy referral link");
      return false;
    }
  }, [customer?.referral_link, toast]);
  const shareWhatsApp = useCallback(
    (customText) => {
      const link = customer?.referral_link;
      const code = customer?.referral_code;
      const text = customText || `Hey! Sign up using my referral link to get exciting discounts on fine fabrics at SBS Textiles: ${link || ""} (Code: ${code || ""})`;
      if (typeof window !== "undefined") {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }
    },
    [customer?.referral_link, customer?.referral_code]
  );
  const availablePoints = customer?.available_points ?? 0;
  const monetaryValue = customer?.monetary_value_inr ?? 0;
  const pointsName = customer?.points_name ?? "Points";
  const totalEarned = customer?.total_earned ?? availablePoints;
  const totalRedeemed = customer?.total_redeemed ?? 0;
  const totalExpired = customer?.total_expired ?? 0;
  const referralCode = customer?.referral_code ?? "";
  const referralLink = customer?.referral_link ?? "";
  const tier = customer?.tier || (totalEarned >= 5e3 ? "PLATINUM MEMBER" : totalEarned >= 2e3 ? "GOLD MEMBER" : "SILVER MEMBER");
  return {
    profile,
    customer,
    rewards,
    availablePoints,
    monetaryValue,
    pointsName,
    totalEarned,
    totalRedeemed,
    totalExpired,
    referralCode,
    referralLink,
    tier,
    transactions,
    transactionsTotalCount,
    transactionsPage,
    transactionsPerPage,
    isLoading,
    isRewardsLoading,
    isTransactionsLoading,
    isApplying,
    error,
    refetch: fetchProfile,
    refetchRewards: fetchRewards,
    refetchTransactions: fetchTransactions,
    applyPoints,
    copyReferralCode,
    copyReferralLink,
    shareWhatsApp
  };
};

// src/hooks/usePaymentGateway.ts
function usePaymentGateway() {
  const { config, orgData } = useCore();
  const isRegionBased = Boolean(config?.isRegion);
  const activeRegion = isRegionBased ? config?.activeRegion ?? config?.region ?? null : null;
  const orgPaymentConfig = orgData?.organization_setting?.payment ?? {};
  const regionPaymentConfig = activeRegion?.payment_config ?? null;
  const paymentConfig = isRegionBased && regionPaymentConfig ? regionPaymentConfig : orgPaymentConfig;
  const rawPaymentGateway = isRegionBased && activeRegion?.payment_gateway || orgPaymentConfig?.mode || orgPaymentConfig?.gateway || "";
  const paymentGateway = String(rawPaymentGateway || "razorpay").toLowerCase();
  const isStripeGateway = paymentGateway === "stripe";
  const isPhonePeGateway = paymentGateway === "phonepe" || paymentGateway === "phone_pe" || paymentGateway === "phonepe_pg" || paymentGateway === "phone-pe";
  const isRazorpayGateway = !isStripeGateway && !isPhonePeGateway;
  const stripePublishableKey = (isRegionBased ? paymentConfig?.stripe_publishable_key : null) ?? orgPaymentConfig?.stripe_publishable_key ?? orgPaymentConfig?.publishable_key ?? "";
  const razorpayKeyId = (isRegionBased ? paymentConfig?.razor_pay_key_id : null) ?? orgPaymentConfig?.razor_pay_key_id ?? orgPaymentConfig?.key_id ?? "";
  const paymentGatewayLabel = isPhonePeGateway ? "PhonePe" : isStripeGateway ? "Stripe" : isRazorpayGateway ? "Razorpay" : paymentGateway ? paymentGateway.charAt(0).toUpperCase() + paymentGateway.slice(1).replace(/_/g, " ") : "Razorpay";
  return {
    gateway: paymentGateway,
    label: paymentGatewayLabel,
    isPhonePe: isPhonePeGateway,
    isRazorpay: isRazorpayGateway,
    isStripe: isStripeGateway,
    stripePublishableKey,
    razorpayKeyId,
    paymentConfig,
    rawGateway: rawPaymentGateway
  };
}
var useStorefrontRouter = (overrideRouter) => {
  const core = useCore();
  const routerAdapter = overrideRouter ?? core?.adapter?.router;
  return useMemo(() => {
    if (routerAdapter) {
      return {
        push: (url) => {
          if (routerAdapter.push) return routerAdapter.push(url);
          if (typeof window !== "undefined") window.location.href = url;
        },
        replace: (url) => {
          if (routerAdapter.replace) return routerAdapter.replace(url);
          if (typeof window !== "undefined") window.location.replace(url);
        },
        prefetch: (url) => {
          routerAdapter.prefetch?.(url);
        },
        refresh: () => {
          if (routerAdapter.refresh) return routerAdapter.refresh();
          if (typeof window !== "undefined") window.location.reload();
        },
        back: () => {
          if (routerAdapter.back) return routerAdapter.back();
          if (typeof window !== "undefined") window.history.back();
        },
        pathname: routerAdapter.pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/"),
        searchParams: routerAdapter.searchParams ?? (typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams())
      };
    }
    return {
      push: (url) => {
        if (typeof window !== "undefined") window.location.href = url;
      },
      replace: (url) => {
        if (typeof window !== "undefined") window.location.replace(url);
      },
      prefetch: (_url) => {
      },
      refresh: () => {
        if (typeof window !== "undefined") window.location.reload();
      },
      back: () => {
        if (typeof window !== "undefined") window.history.back();
      },
      pathname: typeof window !== "undefined" ? window.location.pathname : "/",
      searchParams: typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()
    };
  }, [routerAdapter]);
};
var FastCheckoutDrawer = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  router: overrideRouter
}) => {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  const router = useStorefrontRouter(overrideRouter);
  const { Razorpay } = useRazorpay();
  const {
    cart,
    setCart,
    actions,
    config,
    auth,
    orgData,
    primaryColor = "#00214c",
    toast
  } = useCore();
  const { formatCurrency } = useCurrencyFormat();
  const {
    gateway: paymentGateway,
    label: paymentGatewayLabel,
    isPhonePe: isPhonePeGateway,
    isRazorpay: isRazorpayGateway,
    isStripe: isStripeGateway,
    stripePublishableKey,
    razorpayKeyId
  } = usePaymentGateway();
  const token = auth?.token ?? auth?.access_token ?? null;
  const isSignedIn = Boolean((auth?.isSignedIn ?? false) && token);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [shippingAddressId, setShippingAddressId] = useState(
    cart?.shipping_address?.id ?? cart?.shipping_address_id ?? null
  );
  const [billingAddressId, setBillingAddressId] = useState(
    cart?.billing_address?.id ?? cart?.billing_address_id ?? null
  );
  const [sameAsShipping, setSameAsShipping] = useState(() => {
    if (cart?.billing_address?.id && cart?.shipping_address?.id) {
      return String(cart.billing_address.id) === String(cart.shipping_address.id);
    }
    return true;
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [newAddrName, setNewAddrName] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState("");
  const [newAddrLine1, setNewAddrLine1] = useState("");
  const [newAddrLine2, setNewAddrLine2] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("");
  const [newAddrState, setNewAddrState] = useState("");
  const [newAddrZipcode, setNewAddrZipcode] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [cartMismatch, setCartMismatch] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);
  useEffect(() => {
    if (!isPlacingOrder) return;
    const timer = setTimeout(() => {
      setIsPlacingOrder(false);
    }, 12e3);
    return () => clearTimeout(timer);
  }, [isPlacingOrder]);
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setIsPlacingOrder(false);
    }
    return () => {
      document.body.style.overflow = "";
      setIsPlacingOrder(false);
    };
  }, [isOpen]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isPlacingOrder) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPlacingOrder, onClose]);
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1e3);
    return () => clearInterval(interval);
  }, [resendTimer]);
  const fetchAddresses = useCallback(async () => {
    if (!actions?.getUserAddress || !token) return;
    try {
      setIsAddressLoading(true);
      const res = await actions.getUserAddress();
      const addrList = res?.data ?? res?.addresses ?? (Array.isArray(res) ? res : []);
      setAddresses(addrList);
      const cartShipId = cart?.shipping_address?.id ?? cart?.shipping_address_id;
      const cartBillId = cart?.billing_address?.id ?? cart?.billing_address_id;
      const activeShipId = cartShipId || (addrList.length > 0 ? addrList[0].id : null);
      const isSame = cartBillId && cartShipId ? String(cartBillId) === String(cartShipId) : true;
      const activeBillId = isSame ? activeShipId : cartBillId || activeShipId;
      setShippingAddressId(activeShipId);
      setBillingAddressId(activeBillId);
      setSameAsShipping(isSame);
      if (addrList.length === 0) {
        setShowNewAddressForm("shipping");
      } else if (activeShipId && (!cart?.shipping_address?.id || !cart?.billing_address?.id) && cart?.id && actions?.updateCart) {
        actions.updateCart(cart.id, {
          id: cart.id,
          shipping_address_id: activeShipId,
          billing_address_id: activeBillId || activeShipId
        }).then((updated) => {
          if (updated && !updated.serverError) setCart(updated);
        }).catch((err) => console.warn("Failed to set default address on cart:", err));
      }
    } catch (err) {
      console.error("[FastCheckoutDrawer] fetchAddresses error:", err);
    } finally {
      setIsAddressLoading(false);
    }
  }, [actions, token, cart?.id, cart?.shipping_address?.id, cart?.shipping_address_id, cart?.billing_address?.id, cart?.billing_address_id, setCart]);
  useEffect(() => {
    if (isOpen && isSignedIn) {
      fetchAddresses();
    }
  }, [isOpen, isSignedIn, fetchAddresses]);
  useEffect(() => {
    const userPhone = auth?.user?.phone;
    const userName = auth?.user?.name || auth?.user?.firstName;
    if (userPhone && !newAddrPhone) {
      setNewAddrPhone(userPhone);
    }
    if (userName && !newAddrName) {
      setNewAddrName(userName);
    }
  }, [auth?.user, newAddrPhone, newAddrName]);
  useEffect(() => {
    if (!actions?.getAvailableDiscounts || !cart?.id) return;
    let isMounted = true;
    setDiscountsLoading(true);
    actions.getAvailableDiscounts({
      token,
      cart_id: cart.id,
      region_id: config?.regionId,
      apiBaseUrl: config?.apiBaseUrl,
      orgId: config?.storeId
    }).then((res) => {
      if (isMounted) {
        const list = Array.isArray(res) ? res : res?.data || res?.discounts || [];
        setAvailableDiscounts(Array.isArray(list) ? list : []);
      }
    }).catch((err) => {
      console.warn("[FastCheckoutDrawer] Failed to fetch available discounts:", err);
    }).finally(() => {
      if (isMounted) setDiscountsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [actions, cart?.id, token, config?.regionId, config?.apiBaseUrl, config?.storeId]);
  const appliedDiscounts = (cart?.cart_discounts || []).filter(
    (c) => c.code || c.id || c.name || c.display_action_value || c.discount_id
  );
  const activeDiscount = appliedDiscounts[0] || null;
  const rawPromoTotal = parseFloat(
    cart?.display_promo_total?.replace(/[^0-9.]/g, "") || String((cart?.promo_total ?? 0) > 1e4 ? (cart?.promo_total ?? 0) / 100 : cart?.promo_total ?? 0)
  ) || 0;
  const rawAdjustmentTotal = parseFloat(
    String(cart?.display_adjustment_total ?? "").replace(/[^0-9.]/g, "") || String(cart?.adjustment_total != null ? Number(cart.adjustment_total) / 100 : 0)
  ) || 0;
  const totalSavings = rawAdjustmentTotal > 0 ? rawAdjustmentTotal : rawPromoTotal;
  const applyCouponByCode = async (codeToApply) => {
    if (!codeToApply.trim() || !cart?.id || !actions?.applyDiscount) {
      toast?.error?.("Unable to apply discount");
      return;
    }
    try {
      setCouponApplying(true);
      const res = await actions.applyDiscount({
        token,
        cart_id: cart.id,
        code: codeToApply.trim(),
        source: "web",
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId
      });
      if (res?.serverError || res?.error) {
        toast?.error?.(res.serverError || res.error || "Invalid coupon code");
        return;
      }
      toast?.success?.(`Coupon "${codeToApply.trim()}" applied! \u{1F389}`);
      setCouponCode("");
      const updatedCart = res?.cart ?? res;
      setCart(updatedCart);
    } catch (err) {
      toast?.error?.(err?.message || "Failed to apply coupon");
    } finally {
      setCouponApplying(false);
    }
  };
  const applyCouponById = async (discountId) => {
    if (!discountId || !cart?.id || !actions?.applyDiscount) return;
    try {
      setCouponApplying(true);
      const res = await actions.applyDiscount({
        token,
        cart_id: cart.id,
        discount_id: discountId,
        source: "web",
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId
      });
      if (res?.serverError || res?.error) {
        toast?.error?.(res.serverError || res.error || "Failed to apply coupon");
        return;
      }
      toast?.success?.("Coupon applied successfully! \u{1F389}");
      const updatedCart = res?.cart ?? res;
      setCart(updatedCart);
    } catch (err) {
      toast?.error?.(err?.message || "Failed to apply coupon");
    } finally {
      setCouponApplying(false);
    }
  };
  const handleRemoveCoupon = async (discountId) => {
    if (!cart?.id) return;
    const removeFn = actions?.removeDiscountById || actions?.removeDiscount;
    if (!removeFn) return;
    try {
      setCouponApplying(true);
      const res = await removeFn({
        token,
        cart_id: cart.id,
        discount_id: discountId || activeDiscount?.id || activeDiscount?.discount_id,
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId
      });
      toast?.info?.("Coupon removed");
      const updatedCart = res?.cart ?? res;
      setCart(updatedCart);
    } catch (err) {
      toast?.error?.(err?.message || "Failed to remove coupon");
    } finally {
      setCouponApplying(false);
    }
  };
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast?.error?.("Please enter a valid 10-digit mobile number");
      return;
    }
    try {
      setAuthLoading(true);
      const countryCode = String(config?.countryCode ?? "+91");
      const res = await actions?.login?.(cleanPhone, countryCode);
      if (res?.serverError || res?.error) {
        toast?.error?.(res?.serverError || res?.error || "Failed to send OTP");
        return;
      }
      setIsOtpSent(true);
      setResendTimer(30);
      toast?.success?.("OTP sent successfully to your mobile number");
    } catch (err) {
      console.error("[FastCheckoutDrawer] send OTP error:", err);
      toast?.error?.(err?.message || "Failed to send OTP");
    } finally {
      setAuthLoading(false);
    }
  };
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const enteredOtp = otp.join("").trim();
    if (enteredOtp.length < 4) {
      toast?.error?.("Please enter the complete OTP");
      return;
    }
    try {
      setAuthLoading(true);
      const cleanPhone = phone.trim().replace(/\D/g, "");
      const countryCode = String(config?.countryCode ?? "+91");
      const res = await actions?.verifyOtp?.(cleanPhone, enteredOtp, countryCode);
      if (res?.serverError || res?.error) {
        toast?.error?.(res?.serverError || res?.error || "Invalid OTP code");
        return;
      }
      if (res?.token || res?.access_token) {
        const nextToken = res.token || res.access_token;
        const nextUser = res.user ?? { phone: cleanPhone };
        auth?.setAuth?.({
          token: nextToken,
          access_token: nextToken,
          user: nextUser,
          userId: nextUser?.id || null
        });
        toast?.success?.("Logged in successfully!");
        setIsOtpSent(false);
      }
    } catch (err) {
      console.error("[FastCheckoutDrawer] verify OTP error:", err);
      toast?.error?.(err?.message || "OTP verification failed");
    } finally {
      setAuthLoading(false);
    }
  };
  const handleSelectShippingAddress = async (addrId) => {
    setShippingAddressId(addrId);
    if (!cart?.id || !actions?.updateCart) return;
    try {
      const payload = {
        id: cart.id,
        shipping_address_id: addrId
      };
      if (sameAsShipping) {
        setBillingAddressId(addrId);
        payload.billing_address_id = addrId;
      }
      const updated = await actions.updateCart(cart.id, payload);
      if (updated && !updated.serverError) {
        setCart(updated);
      }
    } catch (err) {
      console.error("[FastCheckoutDrawer] Failed to set shipping address on cart:", err);
    }
  };
  const handleSelectBillingAddress = async (addrId) => {
    setBillingAddressId(addrId);
    if (!cart?.id || !actions?.updateCart) return;
    try {
      const updated = await actions.updateCart(cart.id, {
        id: cart.id,
        shipping_address_id: shippingAddressId || addrId,
        billing_address_id: addrId
      });
      if (updated && !updated.serverError) {
        setCart(updated);
      }
    } catch (err) {
      console.error("[FastCheckoutDrawer] Failed to set billing address on cart:", err);
    }
  };
  const handleToggleSameAsShipping = async () => {
    const nextVal = !sameAsShipping;
    setSameAsShipping(nextVal);
    if (!cart?.id || !actions?.updateCart) return;
    try {
      if (nextVal) {
        setBillingAddressId(shippingAddressId);
        const updated = await actions.updateCart(cart.id, {
          id: cart.id,
          shipping_address_id: shippingAddressId,
          billing_address_id: shippingAddressId
        });
        if (updated && !updated.serverError) setCart(updated);
      } else {
        const alternate = addresses.find((a) => String(a.id) !== String(shippingAddressId))?.id || null;
        if (alternate) {
          setBillingAddressId(alternate);
          const updated = await actions.updateCart(cart.id, {
            id: cart.id,
            shipping_address_id: shippingAddressId,
            billing_address_id: alternate
          });
          if (updated && !updated.serverError) setCart(updated);
        }
      }
    } catch (err) {
      console.error("[FastCheckoutDrawer] toggle sameAsShipping error:", err);
    }
  };
  const handleSaveNewAddress = async (e, target) => {
    e.preventDefault();
    if (!newAddrName.trim() || !newAddrPhone.trim() || !newAddrLine1.trim() || !newAddrZipcode.trim()) {
      toast?.error?.("Please fill in all required address fields");
      return;
    }
    try {
      setAddressSaving(true);
      const payload = {
        name: newAddrName.trim(),
        phone: newAddrPhone.trim(),
        address_line_1: newAddrLine1.trim(),
        address_line_2: newAddrLine2.trim() || void 0,
        city: newAddrCity.trim(),
        state: newAddrState.trim(),
        zipcode: newAddrZipcode.trim(),
        country_code: "IN",
        address_type: target
      };
      if (!actions?.createAddress) {
        toast?.error?.("Address action not configured");
        return;
      }
      const created = await actions.createAddress(payload);
      if (created?.serverError || created?.error) {
        toast?.error?.(created.serverError || created.error || "Failed to save address");
        return;
      }
      const newId = created?.id || created?.data?.id;
      toast?.success?.("Address added successfully");
      setShowNewAddressForm(null);
      setNewAddrLine1("");
      setNewAddrLine2("");
      setNewAddrCity("");
      setNewAddrState("");
      setNewAddrZipcode("");
      await fetchAddresses();
      if (newId) {
        if (target === "shipping") {
          await handleSelectShippingAddress(newId);
        } else {
          await handleSelectBillingAddress(newId);
        }
      }
    } catch (err) {
      console.error("[FastCheckoutDrawer] handleSaveNewAddress error:", err);
      toast?.error?.(err?.message || "Failed to save address");
    } finally {
      setAddressSaving(false);
    }
  };
  const handlePlaceOrder = async () => {
    if (!cart?.id) {
      toast?.error?.("Cart not found. Please refresh and try again.");
      return;
    }
    if (!shippingAddressId) {
      toast?.error?.("Please select or add a delivery address.");
      return;
    }
    const effectiveBillingId = sameAsShipping ? shippingAddressId : billingAddressId;
    if (!effectiveBillingId) {
      toast?.error?.("Please select or add a billing address.");
      return;
    }
    if (String(cart?.shipping_address?.id) !== String(shippingAddressId) || String(cart?.billing_address?.id) !== String(effectiveBillingId)) {
      try {
        const updated = await actions?.updateCart?.(cart.id, {
          id: cart.id,
          shipping_address_id: shippingAddressId,
          billing_address_id: effectiveBillingId
        });
        if (updated && !updated.serverError) {
          setCart(updated);
        }
      } catch (err) {
        console.warn("[FastCheckoutDrawer] Cart address sync error:", err);
      }
    }
    const clientTotal = Number(cart?.total ?? cart?.display_total ?? 0);
    const validation = await validateCartTotal(String(cart.id), clientTotal, {
      apiBaseUrl: config?.apiBaseUrl,
      orgId: config?.storeId
    });
    if (!validation.valid && validation.reason === "price_mismatch") {
      setCartMismatch({
        serverTotal: validation.serverTotal,
        clientTotal: validation.clientTotal,
        cart: validation.cart
      });
      toast?.error?.("Cart prices or coupons have changed. Please review your total.");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const rawUserId = auth?.userId ?? auth?.user?.id ?? null;
      const userId = rawUserId != null ? String(rawUserId) : null;
      const currency = config?.currency ?? "INR";
      if (isPhonePeGateway) {
        const createOrderFn = actions?.createPhonePeOrder || actions?.createCartPayment || actions?.createRazorOrder;
        if (!createOrderFn) {
          toast?.error?.("PhonePe action not configured");
          setIsPlacingOrder(false);
          return;
        }
        const orderRes = await createOrderFn(cart.id);
        if (orderRes?.serverError || orderRes?.error) {
          toast?.error?.(orderRes.serverError || orderRes.error || "Failed to create order");
          setIsPlacingOrder(false);
          return;
        }
        trackBeginCheckout({
          userId,
          cart,
          currency,
          transactionId: String(orderRes?.id ?? ""),
          metaOverrides: { source: "fast_checkout" }
        });
        trackMetaInitiateCheckout(cart);
        trackAddShippingInfo({
          userId,
          cart,
          shippingTier: "Standard",
          currency,
          metaOverrides: { source: "fast_checkout" }
        });
        trackAddPaymentInfo({
          userId,
          cart,
          paymentType: "PhonePe",
          currency,
          metaOverrides: { source: "fast_checkout" }
        });
        trackMetaAddPaymentInfo(cart);
        const redirectUrl = orderRes?.redirect_url || orderRes?.url || orderRes?.redirectUrl || orderRes?.data?.instrumentResponse?.redirectInfo?.url || orderRes?.data?.redirectUrl;
        if (redirectUrl) {
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(
                "defx_phonepe_pending",
                JSON.stringify({
                  cartId: cart.id,
                  paymentId: orderRes?.id || orderRes?.cart_payment_id || null,
                  orderId: orderRes?.order_id || null,
                  timestamp: Date.now()
                })
              );
            } catch (e) {
              console.warn("Failed to store phonepe session:", e);
            }
          }
          window.location.href = redirectUrl;
          return;
        }
        if (orderRes?.order_id) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("cartid");
          }
          onPaymentSuccess?.();
          setCart(null);
          onClose();
          router.replace(`/account/orders/${orderRes.order_id}`);
          return;
        }
        toast?.error?.("Could not initialize PhonePe payment redirect");
        setIsPlacingOrder(false);
        return;
      }
      if (isRazorpayGateway) {
        const createOrderFn = actions?.createRazorOrder || actions?.createCartPayment;
        if (!createOrderFn) {
          toast?.error?.("Razorpay action not configured");
          setIsPlacingOrder(false);
          return;
        }
        const orderRes = await createOrderFn(cart.id);
        if (orderRes?.serverError || orderRes?.error) {
          toast?.error?.(orderRes.serverError || orderRes.error || "Payment order creation failed");
          setIsPlacingOrder(false);
          return;
        }
        trackBeginCheckout({
          userId,
          cart,
          currency,
          transactionId: String(orderRes?.id ?? ""),
          metaOverrides: { source: "fast_checkout" }
        });
        trackMetaInitiateCheckout(cart);
        trackAddPaymentInfo({
          userId,
          cart,
          paymentType: "Razorpay",
          currency,
          metaOverrides: { source: "fast_checkout" }
        });
        trackMetaAddPaymentInfo(cart);
        const options = {
          key: razorpayKeyId,
          amount: (orderRes?.cart?.total ?? cart?.total) / 100,
          currency: "INR",
          name: orgData?.name || "Store",
          description: "Order Payment",
          order_id: orderRes?.razor_order_id,
          handler: async (response) => {
            try {
              setIsPlacingOrder(true);
              if (actions?.updateRazorPayment) {
                const result = await actions.updateRazorPayment(
                  orderRes?.id,
                  response.razorpay_payment_id
                );
                if (result?.order_id) {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("cartid");
                  }
                  trackPurchase({
                    userId,
                    transactionId: String(result.order_id),
                    cart,
                    currency,
                    metaOverrides: { source: "fast_checkout" }
                  });
                  trackMetaPurchase(cart);
                  onPaymentSuccess?.();
                  setCart(null);
                  onClose();
                  router.replace(`/account/orders/${result.order_id}`);
                } else {
                  toast?.error?.(result?.serverError || "Failed to confirm payment");
                }
              }
            } catch (err) {
              console.error("Razorpay update error:", err);
              toast?.error?.(err?.message || "Failed to update payment");
            } finally {
              setIsPlacingOrder(false);
            }
          },
          prefill: {
            name: auth?.user?.name || auth?.user?.firstName || "",
            email: auth?.user?.email || "",
            contact: auth?.user?.phone || phone || ""
          },
          theme: { color: primaryColor },
          modal: {
            ondismiss: () => {
              setIsPlacingOrder(false);
            }
          }
        };
        try {
          const razorpay = new Razorpay(options);
          razorpay.on("payment.failed", (response) => {
            console.error("Razorpay payment failed:", response);
            toast?.error?.(response?.error?.description || "Payment failed");
            trackPaymentFailed({
              userId,
              cart,
              currency,
              errorCode: response?.error?.code ?? "",
              errorReason: response?.error?.description ?? ""
            });
            setIsPlacingOrder(false);
          });
          setIsPlacingOrder(false);
          razorpay.open();
        } catch (err) {
          console.error("Failed to open Razorpay modal:", err);
          toast?.error?.("Failed to open payment gateway");
          setIsPlacingOrder(false);
        }
        return;
      }
      if (isStripeGateway) {
        toast?.info?.("Redirecting to Stripe checkout...");
        onClose();
        router.push("/cart");
        return;
      }
      toast?.error?.("No supported payment gateway configured");
      setIsPlacingOrder(false);
    } catch (err) {
      console.error("[FastCheckoutDrawer] handlePlaceOrder error:", err);
      toast?.error?.(err?.message || "Failed to process payment");
      setIsPlacingOrder(false);
    }
  };
  if (!shouldRender || !mounted) return null;
  const totalAmount = cart?.display_total ? formatCurrency(cart.display_total) : cart?.total ? formatCurrency(cart.total) : "\u2014";
  const totalItems = cart?.line_items?.reduce(
    (sum, it) => sum + (it.quantity || 1),
    0
  ) || 0;
  const modalContent = /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-[1000000] flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-[3px] overflow-hidden sm:overflow-y-auto",
      style: {
        opacity: isVisible ? 1 : 0,
        transition: "opacity 300ms ease-in-out",
        pointerEvents: isVisible ? "auto" : "none"
      },
      onClick: (e) => {
        if (e.target === e.currentTarget && !isPlacingOrder) onClose();
      },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "relative w-full sm:max-w-[500px] h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[92dvh] bg-white rounded-none sm:rounded-2xl shadow-2xl overflow-hidden border-0 sm:border border-gray-100 flex flex-col",
          style: {
            transform: isVisible ? "translateY(0)" : "translateY(24px)",
            opacity: isVisible ? 1 : 0,
            transition: "transform 350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease-out",
            willChange: "transform, opacity"
          },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white sticky top-0 z-20", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm",
                    style: { backgroundColor: primaryColor },
                    children: "\u26A1"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-[var(--font-bold,sans-serif)] text-[16px] text-gray-900 leading-tight", children: "Quick Checkout" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-gray-500 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx("span", { children: "\u{1F512} 100% Safe & Secure" }),
                    /* @__PURE__ */ jsx("span", { children: "\u2022" }),
                    /* @__PURE__ */ jsx("span", { children: "Direct Gateway Pay" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    setIsPlacingOrder(false);
                    onClose();
                  },
                  className: "w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer",
                  "aria-label": "Close checkout",
                  children: "\u2715"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-5 space-y-4 text-gray-800", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200/60 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-medium)] text-gray-600", children: [
                  "Order Total (",
                  totalItems,
                  " ",
                  totalItems === 1 ? "item" : "items",
                  "):"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "font-[var(--font-bold)] text-sm block",
                      style: { color: primaryColor },
                      children: totalAmount
                    }
                  ),
                  totalSavings > 0 && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-emerald-600 font-bold block", children: [
                    "Savings of ",
                    formatCurrency(totalSavings),
                    " applied"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-gray-50/90 border border-gray-200/90 rounded-xl shadow-xs", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 font-[var(--font-bold)] text-xs text-gray-800", children: [
                    /* @__PURE__ */ jsx("span", { children: "\u{1F3F7}\uFE0F" }),
                    /* @__PURE__ */ jsx("span", { children: "Offers & Coupons" })
                  ] }),
                  activeDiscount && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full", children: "Applied" })
                ] }),
                activeDiscount ? /* @__PURE__ */ jsxs("div", { className: "p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { children: "\u2705" }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "font-bold tracking-wide text-xs", children: activeDiscount.code || activeDiscount.display_action_value || "Coupon Applied" }),
                      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-emerald-600 font-medium", children: totalSavings > 0 ? `You save ${formatCurrency(totalSavings)}` : "Discount applied to order" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleRemoveCoupon(activeDiscount.id || activeDiscount.discount_id),
                      disabled: couponApplying,
                      className: "text-red-500 font-bold hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 cursor-pointer transition-colors",
                      children: couponApplying ? "..." : "Remove"
                    }
                  )
                ] }) : (
                  /* Coupon Input Form */
                  /* @__PURE__ */ jsxs(
                    "form",
                    {
                      onSubmit: (e) => {
                        e.preventDefault();
                        applyCouponByCode(couponCode);
                      },
                      className: "flex gap-2",
                      children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "text",
                            placeholder: "ENTER COUPON CODE",
                            value: couponCode,
                            onChange: (e) => setCouponCode(e.target.value.toUpperCase()),
                            className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs uppercase font-semibold tracking-wider text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "submit",
                            disabled: couponApplying || !couponCode.trim(),
                            className: "px-4 py-2 text-white text-xs font-bold rounded-lg transition-opacity disabled:opacity-50 cursor-pointer shrink-0 tracking-wider shadow-xs",
                            style: { backgroundColor: primaryColor },
                            children: couponApplying ? "..." : "APPLY"
                          }
                        )
                      ]
                    }
                  )
                ),
                !activeDiscount && availableDiscounts.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2.5 pt-2 border-t border-gray-200/60 space-y-1.5", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] font-[var(--font-medium)] text-gray-500", children: "Available offers:" }),
                  /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: availableDiscounts.map((coupon) => {
                    const code = coupon.code;
                    const label = coupon.display_action_value || coupon.name || "Special Offer";
                    return /* @__PURE__ */ jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () => {
                          if (code) {
                            setCouponCode(code);
                            applyCouponByCode(code);
                          } else if (coupon.id) {
                            applyCouponById(coupon.id);
                          }
                        },
                        disabled: couponApplying,
                        className: "px-2.5 py-1 rounded-md text-[11px] font-bold border border-dashed transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center gap-1.5 bg-white shadow-2xs",
                        style: {
                          color: primaryColor,
                          borderColor: primaryColor
                        },
                        children: [
                          /* @__PURE__ */ jsxs("span", { children: [
                            "\u{1F3F7}\uFE0F ",
                            code ? `${code}` : label
                          ] }),
                          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-emerald-600 font-bold uppercase", children: "\u2022 Apply" })
                        ]
                      },
                      coupon.code || coupon.id
                    );
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-xs font-[var(--font-bold)] uppercase tracking-wider text-gray-500 flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white",
                        style: { backgroundColor: primaryColor },
                        children: "1"
                      }
                    ),
                    "Contact & Account"
                  ] }),
                  isSignedIn && /* @__PURE__ */ jsx("span", { className: "text-emerald-600 text-[11px] font-[var(--font-bold)] flex items-center gap-1", children: "\u2713 Verified" })
                ] }),
                isSignedIn ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between bg-emerald-50/60 border border-emerald-100 rounded-lg p-2.5 text-xs", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "font-[var(--font-bold)] text-emerald-950", children: auth?.user?.name || auth?.user?.firstName || "Customer" }),
                    /* @__PURE__ */ jsx("p", { className: "text-emerald-700", children: auth?.user?.phone || auth?.user?.email || "Phone verified" })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        auth?.clearAuth?.();
                        setIsOtpSent(false);
                      },
                      className: "text-xs text-gray-500 underline hover:text-gray-800 cursor-pointer",
                      children: "Change"
                    }
                  )
                ] }) : !isOtpSent ? /* @__PURE__ */ jsxs("form", { onSubmit: handleSendOtp, className: "space-y-3", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: "Enter your mobile number to sign in and proceed with checkout." }),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 flex items-center", children: "+91" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "tel",
                        maxLength: 10,
                        placeholder: "Enter 10-digit mobile",
                        value: phone,
                        onChange: (e) => setPhone(e.target.value.replace(/\D/g, "")),
                        className: "flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400",
                        autoFocus: true
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "submit",
                        disabled: authLoading || phone.length < 10,
                        className: "px-4 py-2 text-white text-xs font-bold rounded-lg transition-opacity disabled:opacity-50 cursor-pointer",
                        style: { backgroundColor: primaryColor },
                        children: authLoading ? "Sending..." : "Send OTP"
                      }
                    )
                  ] })
                ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleVerifyOtp, className: "space-y-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                    /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
                      "Enter code sent to +91 ",
                      phone
                    ] }),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setIsOtpSent(false),
                        className: "text-xs text-gray-500 underline hover:text-gray-800",
                        children: "Edit"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "flex justify-between gap-1.5", children: otp.map((digit, idx) => /* @__PURE__ */ jsx(
                    "input",
                    {
                      id: `fast-otp-${idx}`,
                      type: "text",
                      maxLength: 1,
                      value: digit,
                      onChange: (e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const next = [...otp];
                        next[idx] = val;
                        setOtp(next);
                        if (val && idx < 5) {
                          const nextInput = document.getElementById(`fast-otp-${idx + 1}`);
                          nextInput?.focus();
                        }
                      },
                      onKeyDown: (e) => {
                        if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                          const prevInput = document.getElementById(`fast-otp-${idx - 1}`);
                          prevInput?.focus();
                        }
                      },
                      className: "w-10 h-11 text-center font-bold text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    },
                    idx
                  )) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-1", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        disabled: resendTimer > 0 || authLoading,
                        onClick: () => handleSendOtp(),
                        className: "text-xs text-gray-500 underline hover:text-gray-800 disabled:opacity-50 cursor-pointer",
                        children: resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "submit",
                        disabled: authLoading || otp.join("").length < 4,
                        className: "px-5 py-2 text-white text-xs font-bold rounded-lg transition-opacity disabled:opacity-50 cursor-pointer",
                        style: { backgroundColor: primaryColor },
                        children: authLoading ? "Verifying..." : "Verify & Continue"
                      }
                    )
                  ] })
                ] })
              ] }),
              isSignedIn && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs space-y-4", children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("span", { className: "text-xs font-[var(--font-bold)] uppercase tracking-wider text-gray-500 flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white",
                      style: { backgroundColor: primaryColor },
                      children: "2"
                    }
                  ),
                  "Delivery & Billing Address"
                ] }) }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-[var(--font-bold)] text-gray-800 flex items-center gap-1.5", children: /* @__PURE__ */ jsx("span", { children: "\u{1F4E6} Delivery Address" }) }),
                    showNewAddressForm !== "shipping" && /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShowNewAddressForm("shipping"),
                        className: "text-xs font-[var(--font-bold)] underline cursor-pointer hover:opacity-80",
                        style: { color: primaryColor },
                        children: "+ Add New Delivery"
                      }
                    )
                  ] }),
                  isAddressLoading ? /* @__PURE__ */ jsx("div", { className: "py-4 flex justify-center", children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "w-5 h-5 border-2 border-t-transparent rounded-full animate-spin",
                      style: { borderColor: primaryColor }
                    }
                  ) }) : showNewAddressForm === "shipping" ? /* @__PURE__ */ jsxs("form", { onSubmit: (e) => handleSaveNewAddress(e, "shipping"), className: "space-y-3 pt-1 bg-gray-50/70 p-3 rounded-lg border border-gray-200", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-1 border-b border-gray-200", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-xs font-[var(--font-bold)] text-gray-800", children: "New Delivery Address" }),
                      addresses.length > 0 && /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => setShowNewAddressForm(null),
                          className: "text-xs text-gray-400 hover:text-gray-600 cursor-pointer",
                          children: "\u2715"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "text",
                          placeholder: "Full Name *",
                          value: newAddrName,
                          onChange: (e) => setNewAddrName(e.target.value),
                          className: "px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white",
                          required: true
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "tel",
                          maxLength: 10,
                          placeholder: "10-digit Phone *",
                          value: newAddrPhone,
                          onChange: (e) => setNewAddrPhone(e.target.value.replace(/\D/g, "")),
                          className: "px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white",
                          required: true
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        placeholder: "House / Flat / Street / Area *",
                        value: newAddrLine1,
                        onChange: (e) => setNewAddrLine1(e.target.value),
                        className: "w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white",
                        required: true
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "text",
                          placeholder: "Pincode *",
                          maxLength: 6,
                          value: newAddrZipcode,
                          onChange: (e) => setNewAddrZipcode(e.target.value.replace(/\D/g, "")),
                          className: "px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white",
                          required: true
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "text",
                          placeholder: "City *",
                          value: newAddrCity,
                          onChange: (e) => setNewAddrCity(e.target.value),
                          className: "px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white",
                          required: true
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "text",
                          placeholder: "State *",
                          value: newAddrState,
                          onChange: (e) => setNewAddrState(e.target.value),
                          className: "px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white",
                          required: true
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-end pt-1", children: [
                      addresses.length > 0 && /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => setShowNewAddressForm(null),
                          className: "px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 cursor-pointer",
                          children: "Cancel"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "submit",
                          disabled: addressSaving,
                          className: "px-4 py-1.5 text-white text-xs font-bold rounded-lg transition-opacity disabled:opacity-50 cursor-pointer",
                          style: { backgroundColor: primaryColor },
                          children: addressSaving ? "Saving..." : "Save Delivery Address"
                        }
                      )
                    ] })
                  ] }) : addresses.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-2.5", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-2", children: "No saved addresses found." }),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShowNewAddressForm("shipping"),
                        className: "px-3.5 py-1.5 text-white text-xs font-bold rounded-lg cursor-pointer",
                        style: { backgroundColor: primaryColor },
                        children: "+ Add Delivery Address"
                      }
                    )
                  ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-1.5 max-h-[140px] overflow-y-auto pr-1", children: addresses.map((addr) => {
                    const isSelected = String(shippingAddressId) === String(addr.id);
                    return /* @__PURE__ */ jsxs(
                      "div",
                      {
                        onClick: () => handleSelectShippingAddress(addr.id),
                        className: `p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2 ${isSelected ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500" : "border-gray-200 hover:border-gray-300"}`,
                        children: [
                          /* @__PURE__ */ jsx(
                            "input",
                            {
                              type: "radio",
                              name: "delivery_address_selection",
                              checked: isSelected,
                              onChange: () => handleSelectShippingAddress(addr.id),
                              className: "mt-0.5"
                            }
                          ),
                          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                            /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-bold)] text-gray-900 truncate", children: [
                              addr.name || addr.first_name || "Recipient",
                              /* @__PURE__ */ jsx("span", { className: "font-normal text-gray-500 ml-2", children: addr.phone || addr.mobile })
                            ] }),
                            /* @__PURE__ */ jsxs("p", { className: "text-gray-600 line-clamp-1 mt-0.5 text-[11px]", children: [
                              addr.address_line_1 || addr.address1,
                              ",",
                              " ",
                              addr.city,
                              ", ",
                              addr.state,
                              " - ",
                              addr.zipcode || addr.zip
                            ] })
                          ] })
                        ]
                      },
                      `shipping-${addr.id}`
                    );
                  }) })
                ] }),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    onClick: handleToggleSameAsShipping,
                    className: "flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-gray-50/80 hover:bg-gray-100/70 cursor-pointer transition-colors",
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            type: "checkbox",
                            checked: sameAsShipping,
                            onChange: handleToggleSameAsShipping,
                            className: "w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                          }
                        ),
                        /* @__PURE__ */ jsx("span", { className: "text-xs font-[var(--font-medium)] text-gray-800", children: "Billing address is same as delivery address" })
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase font-bold text-gray-500", children: sameAsShipping ? "\u2713 Same" : "Different" })
                    ]
                  }
                ),
                !sameAsShipping && /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t border-gray-100 space-y-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-[var(--font-bold)] text-gray-800 flex items-center gap-1.5", children: /* @__PURE__ */ jsx("span", { children: "\u{1F9FE} Billing Address" }) }),
                    showNewAddressForm !== "billing" && /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShowNewAddressForm("billing"),
                        className: "text-xs font-[var(--font-bold)] underline cursor-pointer hover:opacity-80",
                        style: { color: primaryColor },
                        children: "+ Add New Billing"
                      }
                    )
                  ] }),
                  showNewAddressForm === "billing" ? /* @__PURE__ */ jsxs("form", { onSubmit: (e) => handleSaveNewAddress(e, "billing"), className: "space-y-3 pt-1 bg-gray-50/70 p-3 rounded-lg border border-gray-200", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-1 border-b border-gray-200", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-xs font-[var(--font-bold)] text-gray-800", children: "New Billing Address" }),
                      addresses.length > 0 && /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => setShowNewAddressForm(null),
                          className: "text-xs text-gray-400 hover:text-gray-600 cursor-pointer",
                          children: "\u2715"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "text",
                          placeholder: "Full Name *",
                          value: newAddrName,
                          onChange: (e) => setNewAddrName(e.target.value),
                          className: "px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white",
                          required: true
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "tel",
                          maxLength: 10,
                          placeholder: "10-digit Phone *",
                          value: newAddrPhone,
                          onChange: (e) => setNewAddrPhone(e.target.value.replace(/\D/g, "")),
                          className: "px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white",
                          required: true
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        placeholder: "House / Flat / Street / Area *",
                        value: newAddrLine1,
                        onChange: (e) => setNewAddrLine1(e.target.value),
                        className: "w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white",
                        required: true
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "text",
                          placeholder: "Pincode *",
                          maxLength: 6,
                          value: newAddrZipcode,
                          onChange: (e) => setNewAddrZipcode(e.target.value.replace(/\D/g, "")),
                          className: "px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white",
                          required: true
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "text",
                          placeholder: "City *",
                          value: newAddrCity,
                          onChange: (e) => setNewAddrCity(e.target.value),
                          className: "px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white",
                          required: true
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "text",
                          placeholder: "State *",
                          value: newAddrState,
                          onChange: (e) => setNewAddrState(e.target.value),
                          className: "px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white",
                          required: true
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-end pt-1", children: [
                      addresses.length > 0 && /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => setShowNewAddressForm(null),
                          className: "px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 cursor-pointer",
                          children: "Cancel"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "submit",
                          disabled: addressSaving,
                          className: "px-4 py-1.5 text-white text-xs font-bold rounded-lg transition-opacity disabled:opacity-50 cursor-pointer",
                          style: { backgroundColor: primaryColor },
                          children: addressSaving ? "Saving..." : "Save Billing Address"
                        }
                      )
                    ] })
                  ] }) : addresses.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-2.5", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-2", children: "No saved billing addresses." }),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShowNewAddressForm("billing"),
                        className: "px-3.5 py-1.5 text-white text-xs font-bold rounded-lg cursor-pointer",
                        style: { backgroundColor: primaryColor },
                        children: "+ Add Billing Address"
                      }
                    )
                  ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-1.5 max-h-[140px] overflow-y-auto pr-1", children: addresses.map((addr) => {
                    const isSelected = String(billingAddressId) === String(addr.id);
                    return /* @__PURE__ */ jsxs(
                      "div",
                      {
                        onClick: () => handleSelectBillingAddress(addr.id),
                        className: `p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2 ${isSelected ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500" : "border-gray-200 hover:border-gray-300"}`,
                        children: [
                          /* @__PURE__ */ jsx(
                            "input",
                            {
                              type: "radio",
                              name: "billing_address_selection",
                              checked: isSelected,
                              onChange: () => handleSelectBillingAddress(addr.id),
                              className: "mt-0.5"
                            }
                          ),
                          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                            /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-bold)] text-gray-900 truncate", children: [
                              addr.name || addr.first_name || "Recipient",
                              /* @__PURE__ */ jsx("span", { className: "font-normal text-gray-500 ml-2", children: addr.phone || addr.mobile })
                            ] }),
                            /* @__PURE__ */ jsxs("p", { className: "text-gray-600 line-clamp-1 mt-0.5 text-[11px]", children: [
                              addr.address_line_1 || addr.address1,
                              ",",
                              " ",
                              addr.city,
                              ", ",
                              addr.state,
                              " - ",
                              addr.zipcode || addr.zip
                            ] })
                          ] })
                        ]
                      },
                      `billing-${addr.id}`
                    );
                  }) })
                ] })
              ] }),
              isSignedIn && shippingAddressId && (sameAsShipping || billingAddressId) && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-xs font-[var(--font-bold)] uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-3", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white",
                      style: { backgroundColor: primaryColor },
                      children: "3"
                    }
                  ),
                  "Payment Method"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "p-3 bg-gray-50 border border-gray-200/80 rounded-xl space-y-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-lg", children: "\u{1F4B3}" }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsxs("p", { className: "text-xs font-[var(--font-bold)] text-gray-900", children: [
                        paymentGatewayLabel,
                        " Secure Payment"
                      ] }),
                      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-500", children: isPhonePeGateway ? "UPI (GPay, PhonePe, Paytm), Cards, NetBanking" : isRazorpayGateway ? "UPI, Cards, Wallets, NetBanking" : "Direct Gateway Checkout" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full", children: "Instant" })
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-gray-100 bg-white sticky bottom-0 z-20 space-y-2", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handlePlaceOrder,
                  disabled: !isSignedIn || !shippingAddressId || !sameAsShipping && !billingAddressId || isPlacingOrder,
                  className: "w-full py-3.5 px-5 text-white rounded-xl font-[var(--font-bold)] text-sm flex items-center justify-between shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                  style: { backgroundColor: primaryColor },
                  children: [
                    /* @__PURE__ */ jsx("span", { children: isPlacingOrder ? "Connecting to Payment..." : !isSignedIn ? "Sign In to Complete Order" : !shippingAddressId ? "Select Delivery Address" : !sameAsShipping && !billingAddressId ? "Select Billing Address" : `Pay ${totalAmount} via ${paymentGatewayLabel}` }),
                    /* @__PURE__ */ jsx("span", { children: isPlacingOrder ? /* @__PURE__ */ jsx("span", { className: "inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }) : "\u2192" })
                  ]
                }
              ),
              isPlacingOrder && /* @__PURE__ */ jsx("div", { className: "text-center pt-0.5", children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setIsPlacingOrder(false),
                  className: "text-xs text-red-500 hover:text-red-700 underline font-medium cursor-pointer",
                  children: "Cancel / Reopen Payment Window"
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 text-[11px] text-gray-400 pt-1", children: [
                /* @__PURE__ */ jsx("span", { children: "\u{1F6E1}\uFE0F 256-bit Encryption" }),
                /* @__PURE__ */ jsx("span", { children: "\u2022" }),
                /* @__PURE__ */ jsx("span", { children: "\u26A1 Instant Confirmation" }),
                /* @__PURE__ */ jsx("span", { children: "\u2022" }),
                /* @__PURE__ */ jsx("span", { children: "\u{1F512} Safe Gateway" })
              ] })
            ] })
          ]
        }
      )
    }
  );
  return createPortal(modalContent, document.body);
};
var FastCheckoutDrawer_default = FastCheckoutDrawer;
var CartDrawer = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  freeShippingThreshold: propThreshold
}) => {
  const [mounted, setMounted] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);
  const {
    cart,
    setCart,
    actions,
    config,
    auth,
    primaryColor = "#00214c",
    toast,
    isCartDrawerOpen: contextIsOpen,
    closeCartDrawer: contextCloseDrawer
  } = useCore();
  const {
    cartItems = [],
    handleAddToCart,
    handleDecreaseQty,
    handleDeleteLineItem,
    isAddToCartLoading,
    deletingLineItemId
  } = useAddToCart();
  const { formatCurrency } = useCurrencyFormat();
  const isOpen = propIsOpen !== void 0 ? propIsOpen : contextIsOpen ?? false;
  const onClose = propOnClose !== void 0 ? propOnClose : contextCloseDrawer ?? (() => {
  });
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  const token = auth?.token ?? auth?.access_token ?? null;
  const {
    availablePoints,
    monetaryValue,
    isApplying: isApplyingLoyalty,
    applyPoints
  } = useLoyalty({ autoFetch: Boolean(token) });
  const [loyaltyPointsInput, setLoyaltyPointsInput] = useState(100);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const pointsConversionRate = availablePoints > 0 && monetaryValue > 0 ? monetaryValue / availablePoints : 0.877;
  const freeShippingThreshold = propThreshold ?? config?.freeShippingThreshold;
  const hasFreeShippingConfig = typeof freeShippingThreshold === "number" && freeShippingThreshold > 0;
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isCheckoutOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isCheckoutOpen, onClose]);
  const items = cartItems || [];
  const totalItemsCount = items.reduce(
    (sum, it) => sum + (it.quantity || 1),
    0
  );
  const rawItemTotal = parseFloat(
    cart?.display_item_total?.replace(/[^0-9.]/g, "") || String((cart?.item_total ?? 0) > 1e4 ? (cart?.item_total ?? 0) / 100 : cart?.item_total ?? 0)
  ) || 0;
  const rawTotal = parseFloat(
    cart?.display_total?.replace(/[^0-9.]/g, "") || String((cart?.total ?? 0) > 1e4 ? (cart?.total ?? 0) / 100 : cart?.total ?? 0)
  ) || 0;
  const rawPromoTotal = parseFloat(
    cart?.display_promo_total?.replace(/[^0-9.]/g, "") || String((cart?.promo_total ?? 0) > 1e4 ? (cart?.promo_total ?? 0) / 100 : cart?.promo_total ?? 0)
  ) || 0;
  const rawShipTotal = parseFloat(
    String(cart?.display_ship_total ?? "").replace(/[^0-9.]/g, "") || String((cart?.ship_total ?? 0) > 1e4 ? (cart?.ship_total ?? 0) / 100 : cart?.ship_total ?? 0)
  ) || 0;
  const rawTaxTotal = parseFloat(
    String(cart?.display_tax_total ?? "").replace(/[^0-9.]/g, "") || String((cart?.tax_total ?? 0) > 1e4 ? (cart?.tax_total ?? 0) / 100 : cart?.tax_total ?? 0)
  ) || 0;
  const rawAdjustmentTotal = parseFloat(
    String(cart?.display_adjustment_total ?? "").replace(/[^0-9.]/g, "") || String(cart?.adjustment_total != null ? Number(cart.adjustment_total) / 100 : 0)
  ) || 0;
  const freeShippingUnlocked = hasFreeShippingConfig && rawItemTotal >= (freeShippingThreshold || 0);
  const amountNeededForFreeShipping = hasFreeShippingConfig ? Math.max(0, (freeShippingThreshold || 0) - rawItemTotal) : 0;
  const shippingProgressPct = hasFreeShippingConfig ? Math.min(100, Math.round(rawItemTotal / (freeShippingThreshold || 1) * 100)) : 0;
  const appliedDiscounts = (cart?.cart_discounts || []).filter(
    (c) => c.code || c.id || c.name || c.display_action_value || c.discount_id
  );
  const activeDiscount = appliedDiscounts[0] || null;
  useEffect(() => {
    if (!actions?.getAvailableDiscounts || !cart?.id) return;
    let isMounted = true;
    setDiscountsLoading(true);
    actions.getAvailableDiscounts({
      token,
      cart_id: cart.id,
      region_id: config?.regionId,
      apiBaseUrl: config?.apiBaseUrl,
      orgId: config?.storeId
    }).then((res) => {
      if (isMounted) {
        const list = Array.isArray(res) ? res : res?.data || res?.discounts || [];
        setAvailableDiscounts(Array.isArray(list) ? list : []);
      }
    }).catch((err) => {
      console.warn("[CartDrawer] Failed to fetch available discounts:", err);
    }).finally(() => {
      if (isMounted) setDiscountsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [actions, cart?.id, token, config?.regionId, config?.apiBaseUrl, config?.storeId]);
  const applyCouponByCode = async (codeToApply) => {
    if (!codeToApply.trim() || !cart?.id || !actions?.applyDiscount) {
      toast?.error?.("Unable to apply discount");
      return;
    }
    try {
      setCouponApplying(true);
      const res = await actions.applyDiscount({
        token,
        cart_id: cart.id,
        code: codeToApply.trim(),
        source: "web",
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId
      });
      if (res?.serverError || res?.error) {
        toast?.error?.(res.serverError || res.error || "Invalid coupon code");
        return;
      }
      toast?.success?.(`Coupon "${codeToApply.trim()}" applied! \u{1F389}`);
      setCouponCode("");
      const updatedCart = res?.cart ?? res;
      setCart(updatedCart);
    } catch (err) {
      toast?.error?.(err?.message || "Failed to apply coupon");
    } finally {
      setCouponApplying(false);
    }
  };
  const applyCouponById = async (discountId) => {
    if (!discountId || !cart?.id || !actions?.applyDiscount) return;
    try {
      setCouponApplying(true);
      const res = await actions.applyDiscount({
        token,
        cart_id: cart.id,
        discount_id: discountId,
        source: "web",
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId
      });
      if (res?.serverError || res?.error) {
        toast?.error?.(res.serverError || res.error || "Failed to apply coupon");
        return;
      }
      toast?.success?.("Coupon applied successfully! \u{1F389}");
      const updatedCart = res?.cart ?? res;
      setCart(updatedCart);
    } catch (err) {
      toast?.error?.(err?.message || "Failed to apply coupon");
    } finally {
      setCouponApplying(false);
    }
  };
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    await applyCouponByCode(couponCode);
  };
  const handleRemoveCoupon = async (discountId) => {
    if (!cart?.id) return;
    const removeFn = actions?.removeDiscountById || actions?.removeDiscount;
    if (!removeFn) return;
    try {
      setCouponApplying(true);
      const res = await removeFn({
        token,
        cart_id: cart.id,
        discount_id: discountId || activeDiscount?.id || activeDiscount?.discount_id,
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId
      });
      toast?.info?.("Coupon removed");
      const updatedCart = res?.cart ?? res;
      setCart(updatedCart);
    } catch (err) {
      toast?.error?.(err?.message || "Failed to remove coupon");
    } finally {
      setCouponApplying(false);
    }
  };
  if (!shouldRender || !mounted) return null;
  const drawerContent = /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[999998] flex justify-end", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/50 backdrop-blur-[2px]",
        style: {
          opacity: isVisible ? 1 : 0,
          transition: "opacity 350ms cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: isVisible ? "auto" : "none"
        },
        onClick: () => {
          if (!isCheckoutOpen) onClose();
        }
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "relative w-full max-w-[460px] h-[100dvh] bg-white shadow-2xl flex flex-col z-10",
        style: {
          transform: isVisible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 350ms cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform"
        },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("h2", { className: "font-[var(--font-bold,sans-serif)] text-[18px] text-gray-900 tracking-tight", children: "Your Bag" }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "text-white text-xs font-bold px-2 py-0.5 rounded-full",
                  style: { backgroundColor: primaryColor },
                  children: totalItemsCount
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-base",
                "aria-label": "Close cart drawer",
                children: "\u2715"
              }
            )
          ] }),
          items.length > 0 && hasFreeShippingConfig && /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 bg-gray-50/80 border-b border-gray-100 shrink-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs mb-1.5 font-[var(--font-medium)]", children: [
              freeShippingUnlocked && rawShipTotal === 0 ? /* @__PURE__ */ jsxs("span", { className: "text-emerald-700 font-bold flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("span", { children: "\u{1F389}" }),
                " You unlocked ",
                /* @__PURE__ */ jsx("strong", { children: "FREE Delivery!" })
              ] }) : /* @__PURE__ */ jsxs("span", { className: "text-gray-700 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("span", { children: "\u{1F69A}" }),
                " Add",
                " ",
                /* @__PURE__ */ jsx("strong", { className: "text-gray-900 font-bold", children: formatCurrency(amountNeededForFreeShipping) }),
                " ",
                "more for ",
                /* @__PURE__ */ jsx("strong", { children: "FREE Delivery" })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-gray-500 font-semibold text-[11px]", children: [
                shippingProgressPct,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-full h-1.5 bg-gray-200 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full rounded-full transition-all duration-500 ease-out",
                style: {
                  width: `${shippingProgressPct}%`,
                  backgroundColor: freeShippingUnlocked && rawShipTotal === 0 ? "#10b981" : primaryColor
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto px-4 py-3 divide-y divide-gray-100", children: [
            items.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center p-6 space-y-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl shadow-inner border border-gray-100", children: "\u{1F6CD}\uFE0F" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-[var(--font-bold)] text-lg text-gray-800", children: "Your cart is empty" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 max-w-[260px] mx-auto", children: "Looks like you haven't added anything yet. Discover our latest collections and find something you love!" })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onClose,
                  className: "px-6 py-2.5 text-white text-xs font-[var(--font-bold)] rounded-full transition-opacity hover:opacity-90 cursor-pointer shadow-md",
                  style: { backgroundColor: primaryColor },
                  children: "Start Shopping \u2192"
                }
              )
            ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4 py-2", children: items.map((item) => {
              const product = item?.line_itemable || item;
              const name = product?.name || item?.name || "Product";
              const price = item?.price ?? product?.price ?? 0;
              const quantity = item?.quantity ?? 1;
              const imageUrl = product?.product_images?.[0]?.product_image_url ?? product?.image_url ?? item?.image ?? null;
              const isDeleting = deletingLineItemId === item?.id;
              const isItemBusy = isAddToCartLoading || isDeleting;
              const displayItemPrice = (price ?? 0) > 1e4 ? price / 100 : price;
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex gap-3 py-3 items-start group",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "w-18 h-18 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center", children: imageUrl ? /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: imageUrl,
                        alt: name,
                        className: "w-full h-full object-cover"
                      }
                    ) : /* @__PURE__ */ jsx("span", { className: "text-xl opacity-40", children: "\u{1F6CD}\uFE0F" }) }),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-1", children: [
                        /* @__PURE__ */ jsx(
                          "h4",
                          {
                            className: "font-[var(--font-bold)] text-xs text-gray-900 line-clamp-2 leading-snug",
                            title: name,
                            children: name
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            onClick: () => handleDeleteLineItem(item),
                            disabled: isItemBusy,
                            className: "text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors cursor-pointer shrink-0",
                            title: "Remove item",
                            "aria-label": "Remove",
                            children: isDeleting ? /* @__PURE__ */ jsx("span", { className: "inline-block w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsx(
                              "svg",
                              {
                                className: "w-4 h-4",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /* @__PURE__ */ jsx(
                                  "path",
                                  {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: "1.8",
                                    d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  }
                                )
                              }
                            )
                          }
                        )
                      ] }),
                      item?.line_items_customizations?.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: item.line_items_customizations.map((c, idx) => /* @__PURE__ */ jsxs(
                        "span",
                        {
                          className: "text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded",
                          children: [
                            c.label || c.name || "Custom",
                            ": ",
                            c.value
                          ]
                        },
                        idx
                      )) }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2 pt-1", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden", children: [
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => handleDecreaseQty(product),
                              disabled: isItemBusy,
                              className: "w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all text-xs font-bold disabled:opacity-40 cursor-pointer",
                              "aria-label": "Decrease quantity",
                              children: "\u2212"
                            }
                          ),
                          /* @__PURE__ */ jsx("span", { className: "w-8 text-center text-xs font-[var(--font-bold)] text-gray-800", children: isItemBusy ? "..." : quantity }),
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => handleAddToCart(product),
                              disabled: isItemBusy,
                              className: "w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all text-xs font-bold disabled:opacity-40 cursor-pointer",
                              "aria-label": "Increase quantity",
                              children: "+"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                          /* @__PURE__ */ jsx("span", { className: "font-[var(--font-bold)] text-xs text-gray-900", children: formatCurrency(displayItemPrice * quantity) }),
                          quantity > 1 && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-400", children: [
                            formatCurrency(displayItemPrice),
                            " each"
                          ] })
                        ] })
                      ] })
                    ] })
                  ]
                },
                item?.id || item?.line_itemable_id
              );
            }) }),
            items.length > 0 && /* @__PURE__ */ jsxs("div", { className: "my-3 p-3 bg-gray-50/90 border border-gray-200/90 rounded-xl shadow-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 font-[var(--font-bold)] text-xs text-gray-800", children: [
                  /* @__PURE__ */ jsx("span", { children: "\u{1F3F7}\uFE0F" }),
                  /* @__PURE__ */ jsx("span", { children: "Offers & Coupons" })
                ] }),
                activeDiscount && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full", children: "Applied" })
              ] }),
              activeDiscount ? /* @__PURE__ */ jsxs("div", { className: "p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { children: "\u2705" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "font-bold tracking-wide text-xs", children: activeDiscount.code || activeDiscount.display_action_value || "Coupon Applied" }),
                    /* @__PURE__ */ jsx("p", { className: "text-[11px] text-emerald-600 font-medium", children: rawPromoTotal > 0 ? `You save ${formatCurrency(rawPromoTotal)}` : "Discount applied to order" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleRemoveCoupon(activeDiscount.id || activeDiscount.discount_id),
                    disabled: couponApplying,
                    className: "text-red-500 font-bold hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 cursor-pointer transition-colors",
                    children: couponApplying ? "..." : "Remove"
                  }
                )
              ] }) : (
                /* Coupon Input Form - Visible & Accessible by Default */
                /* @__PURE__ */ jsxs("form", { onSubmit: handleApplyCoupon, className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      placeholder: "ENTER COUPON CODE",
                      value: couponCode,
                      onChange: (e) => setCouponCode(e.target.value.toUpperCase()),
                      className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs uppercase font-semibold tracking-wider text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "submit",
                      disabled: couponApplying || !couponCode.trim(),
                      className: "px-4 py-2 text-white text-xs font-bold rounded-lg transition-opacity disabled:opacity-50 cursor-pointer shrink-0 tracking-wider shadow-xs",
                      style: { backgroundColor: primaryColor },
                      children: couponApplying ? "..." : "APPLY"
                    }
                  )
                ] })
              ),
              !activeDiscount && availableDiscounts.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2.5 pt-2 border-t border-gray-200/60 space-y-1.5", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-[var(--font-medium)] text-gray-500", children: "Available coupons:" }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: availableDiscounts.map((coupon) => {
                  const code = coupon.code;
                  const label = coupon.display_action_value || coupon.name || "Special Offer";
                  return /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        if (code) {
                          setCouponCode(code);
                          applyCouponByCode(code);
                        } else if (coupon.id) {
                          applyCouponById(coupon.id);
                        }
                      },
                      disabled: couponApplying,
                      className: "px-2.5 py-1 rounded-md text-[11px] font-bold border border-dashed transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center gap-1.5 bg-white shadow-2xs",
                      style: {
                        color: primaryColor,
                        borderColor: primaryColor
                      },
                      children: [
                        /* @__PURE__ */ jsxs("span", { children: [
                          "\u{1F3F7}\uFE0F ",
                          code ? `${code}` : label
                        ] }),
                        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-emerald-600 font-bold uppercase", children: "\u2022 Apply" })
                      ]
                    },
                    coupon.code || coupon.id
                  );
                }) })
              ] })
            ] }),
            items.length > 0 && token && availablePoints > 0 && /* @__PURE__ */ jsxs("div", { className: "my-2.5 p-3 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white border border-amber-200/80 rounded-xl shadow-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-amber-500 text-sm", children: "\u2B50" }),
                  /* @__PURE__ */ jsx("span", { className: "font-[var(--font-bold)] text-xs text-gray-900", children: "Redeem SBS Points" }),
                  /* @__PURE__ */ jsxs("span", { className: "rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200", children: [
                    availablePoints.toLocaleString(),
                    " pts"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setIsLoyaltyOpen((o) => !o),
                    className: "text-[11px] font-semibold text-[#E65100] hover:underline cursor-pointer flex items-center gap-1",
                    children: [
                      /* @__PURE__ */ jsx("span", { children: isLoyaltyOpen ? "Close" : "Redeem" }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs", children: isLoyaltyOpen ? "\u25B4" : "\u25BE" })
                    ]
                  }
                )
              ] }),
              isLoyaltyOpen ? /* @__PURE__ */ jsxs("div", { className: "mt-2.5 pt-2 border-t border-amber-200/60 space-y-2.5", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[11px] text-gray-600", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Worth: ",
                    /* @__PURE__ */ jsx("strong", { className: "text-gray-900", children: formatCurrency(monetaryValue) })
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-emerald-700 font-semibold", children: [
                    "Saves ",
                    formatCurrency(Math.min(availablePoints, Math.max(0, loyaltyPointsInput)) * pointsConversionRate)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      min: 100,
                      max: availablePoints,
                      step: 50,
                      value: loyaltyPointsInput,
                      onChange: (e) => setLoyaltyPointsInput(Math.min(availablePoints, Math.max(0, Number(e.target.value)))),
                      className: "flex-1 px-3 py-1.5 border border-amber-300 rounded-lg text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#E65100]",
                      placeholder: "Min 100 pts"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setLoyaltyPointsInput(availablePoints),
                      className: "px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-[11px] font-bold text-[#E65100] hover:bg-orange-50 cursor-pointer shrink-0",
                      children: "Max"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: async () => {
                        if (!cart?.id) {
                          toast?.error?.("Cart not found");
                          return;
                        }
                        await applyPoints({
                          cart_id: String(cart.id),
                          points_to_use: loyaltyPointsInput
                        });
                      },
                      disabled: isApplyingLoyalty || loyaltyPointsInput < 100 || loyaltyPointsInput > availablePoints,
                      className: "px-3.5 py-1.5 text-white text-xs font-bold rounded-lg transition-opacity disabled:opacity-50 cursor-pointer shrink-0 shadow-xs bg-[#E65100] hover:bg-[#cf4800]",
                      children: isApplyingLoyalty ? "Applying..." : "Apply"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 pt-0.5", children: [100, 250, 500, 1e3].filter((p) => p <= availablePoints).map((preset) => /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setLoyaltyPointsInput(preset),
                    className: `px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${loyaltyPointsInput === preset ? "bg-[#E65100] text-white border-[#E65100]" : "bg-white text-gray-700 border-amber-200 hover:border-amber-400"}`,
                    children: [
                      preset,
                      " Pts (-",
                      formatCurrency(preset * pointsConversionRate),
                      ")"
                    ]
                  },
                  preset
                )) })
              ] }) : /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[11px] text-gray-500", children: [
                "You have ",
                availablePoints.toLocaleString(),
                " points worth ",
                formatCurrency(monetaryValue),
                ". Click Redeem to apply points."
              ] })
            ] }),
            items.length > 0 && !token && /* @__PURE__ */ jsxs("div", { className: "my-2 p-2.5 bg-orange-50/50 border border-orange-200/50 rounded-xl flex items-center justify-between text-xs text-gray-600", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("span", { children: "\u2B50" }),
                /* @__PURE__ */ jsx("span", { children: "Have SBS reward points?" })
              ] }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "/account/rewards",
                  className: "text-[11px] font-bold text-[#E65100] hover:underline",
                  children: "Sign in to redeem"
                }
              )
            ] }),
            items.length > 0 && /* @__PURE__ */ jsxs("div", { className: "py-3 text-xs space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-gray-600", children: [
                /* @__PURE__ */ jsx("span", { children: "Item Subtotal" }),
                /* @__PURE__ */ jsx("span", { children: cart?.display_item_total ? formatCurrency(cart.display_item_total) : formatCurrency(rawItemTotal) })
              ] }),
              (rawPromoTotal > 0 || appliedDiscounts.length > 0) && /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-emerald-600 font-medium", children: [
                  /* @__PURE__ */ jsx("span", { children: appliedDiscounts.length === 1 ? `Discount (${appliedDiscounts[0].code || appliedDiscounts[0].display_action_value || "Coupon"})` : "Discount" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "\u2212 ",
                    formatCurrency(rawPromoTotal || (rawAdjustmentTotal > 0 ? rawAdjustmentTotal : 0))
                  ] })
                ] }),
                appliedDiscounts.length > 1 && /* @__PURE__ */ jsx("div", { className: "pl-2 space-y-0.5 border-l-2 border-emerald-200", children: appliedDiscounts.map((c) => {
                  const amt = c.display_discount_amount ?? (c.discount_amount != null ? c.discount_amount / 100 : null);
                  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[11px] text-emerald-600/80", children: [
                    /* @__PURE__ */ jsxs("span", { children: [
                      "\u2022 ",
                      c.code || c.display_action_value || "Coupon"
                    ] }),
                    amt != null && /* @__PURE__ */ jsxs("span", { children: [
                      "\u2212 ",
                      formatCurrency(amt)
                    ] })
                  ] }, c.code || c.id);
                }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-gray-600", children: [
                /* @__PURE__ */ jsx("span", { children: "Tax" }),
                /* @__PURE__ */ jsx("span", { children: cart?.display_tax_total ? formatCurrency(cart.display_tax_total) : rawTaxTotal > 0 ? formatCurrency(rawTaxTotal) : "\u2014" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-gray-600", children: [
                /* @__PURE__ */ jsx("span", { children: "Delivery Fee" }),
                /* @__PURE__ */ jsx("span", { children: cart?.display_ship_total != null || cart?.ship_total != null ? rawShipTotal === 0 ? /* @__PURE__ */ jsx("span", { className: "text-emerald-600 font-bold uppercase", children: "FREE" }) : formatCurrency(cart?.display_ship_total ?? rawShipTotal) : hasFreeShippingConfig && freeShippingUnlocked ? /* @__PURE__ */ jsx("span", { className: "text-emerald-600 font-bold uppercase", children: "FREE" }) : /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Calculated at checkout" }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-100 pt-2 flex justify-between font-[var(--font-bold)] text-sm text-gray-900", children: [
                /* @__PURE__ */ jsx("span", { children: "Grand Total" }),
                /* @__PURE__ */ jsx("span", { style: { color: primaryColor }, children: cart?.display_total ? formatCurrency(cart.display_total) : formatCurrency(rawTotal) })
              ] }),
              (() => {
                const totalSavings = rawAdjustmentTotal > 0 ? rawAdjustmentTotal : rawPromoTotal;
                if (totalSavings > 0) {
                  return /* @__PURE__ */ jsxs("p", { className: "text-[12px] font-[var(--font-bold)] text-emerald-600 text-right mt-1", children: [
                    "You save ",
                    formatCurrency(totalSavings),
                    " on this order \u{1F389}"
                  ] });
                }
                return null;
              })()
            ] })
          ] }),
          items.length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-gray-100 bg-white sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.04)] space-y-2", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setIsCheckoutOpen(true),
                className: "w-full py-3.5 px-5 text-white rounded-xl font-[var(--font-bold)] text-sm flex items-center justify-between shadow-lg shadow-gray-200 transition-all active:scale-[0.99] cursor-pointer",
                style: { backgroundColor: primaryColor },
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col text-left", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-normal uppercase tracking-wider opacity-85", children: "Total to Pay" }),
                    /* @__PURE__ */ jsx("span", { className: "text-base font-extrabold leading-none", children: cart?.display_total ? formatCurrency(cart.display_total) : formatCurrency(rawTotal) })
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 font-bold tracking-wide", children: [
                    /* @__PURE__ */ jsx("span", { children: "PROCEED TO CHECKOUT" }),
                    /* @__PURE__ */ jsx("span", { children: "\u2192" })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-3 text-[11px] text-gray-400 pt-1", children: [
              /* @__PURE__ */ jsx("span", { children: "\u{1F512} 100% Safe Payments" }),
              /* @__PURE__ */ jsx("span", { children: "\u2022" }),
              /* @__PURE__ */ jsx("span", { children: "\u26A1 Direct Gateway" }),
              /* @__PURE__ */ jsx("span", { children: "\u2022" }),
              /* @__PURE__ */ jsx("span", { children: "\u{1F4E6} Easy Returns" })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      FastCheckoutDrawer_default,
      {
        isOpen: isCheckoutOpen,
        onClose: () => setIsCheckoutOpen(false),
        onPaymentSuccess: () => {
          setIsCheckoutOpen(false);
          onClose();
        }
      }
    )
  ] });
  return createPortal(drawerContent, document.body);
};
var CoreContext = createContext(null);
var inbuiltActions = {
  // Regions
  getRegions: getRegionsAction,
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
  createCartPayment: createCartPaymentAction,
  updateCartPayment: updateCartPaymentAction,
  createPhonePeOrder: createPhonePeOrderAction,
  updatePhonePePayment: updatePhonePePaymentAction,
  createStripePaymentIntent: createStripePaymentIntentAction,
  // Addresses
  getUserAddress: getAddressesAction,
  createAddress: createAddressAction,
  updateAddress: updateAddressAction,
  deleteAddress: deleteAddressAction,
  // Auth
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
  trackDiscountEvent: trackDiscountEventAction,
  // Loyalty & Rewards
  getLoyaltyProfile: getLoyaltyProfileAction,
  getLoyaltyRewards: getLoyaltyRewardsAction,
  getLoyaltyTransactions: getLoyaltyTransactionsAction,
  applyLoyaltyPoints: applyLoyaltyPointsAction
};
var EMPTY_ACTIONS = {};
var EMPTY_CONFIG = {};
var CoreProvider = ({
  children,
  config = EMPTY_CONFIG,
  actions = EMPTY_ACTIONS,
  toast = null,
  auth: injectedAuth = null,
  orgData,
  adapter,
  linkComponent
}) => {
  const isRegionBased = Boolean(config?.isRegion);
  const resolvedRegion = isRegionBased ? config?.activeRegion ?? config?.region ?? null : null;
  const resolvedRegionId = isRegionBased ? config?.regionId ?? resolvedRegion?.id ?? null : null;
  const resolvedCurrency = isRegionBased ? resolvedRegion?.currency ?? config?.currency ?? orgData?.organization_setting?.currency ?? "INR" : config?.currency ?? orgData?.organization_setting?.currency ?? "INR";
  const resolvedLocale = isRegionBased ? resolvedRegion?.locale ?? config?.locale ?? orgData?.organization_setting?.locale ?? "en-IN" : config?.locale ?? orgData?.organization_setting?.locale ?? "en-IN";
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
  useEffect(() => {
    if (config?.apiBaseUrl || config?.storeId || adapter) {
      configureStorefront({
        apiBaseUrl: config?.apiBaseUrl,
        storeId: config?.storeId,
        countryCode: config?.countryCode,
        currency: resolvedCurrency,
        adapter
      });
    }
  }, [config?.apiBaseUrl, config?.storeId, config?.countryCode, resolvedCurrency, adapter]);
  const [cart, setCart] = useState();
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const openCartDrawer = useCallback(() => setIsCartDrawerOpen(true), []);
  const closeCartDrawer = useCallback(() => setIsCartDrawerOpen(false), []);
  const toggleCartDrawer = useCallback(() => setIsCartDrawerOpen((prev) => !prev), []);
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
  const resolvedActions = useMemo(() => {
    const merged = { ...actions };
    Object.entries(inbuiltActions).forEach(([key, fn]) => {
      if (!merged[key]) {
        merged[key] = fn;
      }
    });
    return merged;
  }, [actions]);
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
    const userId = auth?.user?.id || auth?.user?.userId || null;
    if (userId) {
      identifyDeveloperUser(String(userId), {
        phone: auth?.user?.phone || null,
        email: auth?.user?.email || null
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
      isCartDrawerOpen,
      setIsCartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
      toggleCartDrawer
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
      isCartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
      toggleCartDrawer
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
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          "--core-primary": primaryColor,
          "--core-secondary": secondaryColor
        },
        children: [
          children,
          !resolvedConfig?.disableCartDrawer && /* @__PURE__ */ jsx(CartDrawer, {})
        ]
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
function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
function useClerkStoreAuth(options = {}) {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token") || Cookies.get("access_token") || null;
    }
    return null;
  });
  const isSyncingRef = useRef(false);
  useEffect(() => {
    if (!isLoaded || typeof isSignedIn !== "boolean") return;
    const currentToken = typeof window !== "undefined" ? localStorage.getItem("access_token") || Cookies.get("access_token") : null;
    let isTokenValid = false;
    if (currentToken) {
      const decoded = decodeJwt(currentToken);
      isTokenValid = Boolean(decoded?.exp && Date.now() / 1e3 < decoded.exp);
    }
    if (!isSignedIn) {
      if (currentToken) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("cartid");
          localStorage.removeItem("user");
        }
        Cookies.remove("access_token", { path: "/" });
        setToken(null);
      }
      return;
    }
    if (isSignedIn && user && !isTokenValid && !isSyncingRef.current) {
      isSyncingRef.current = true;
      const payload = {
        clerk_id: user.id,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || ""
      };
      const loginFn = options.loginAction || loginUser;
      loginFn(payload).then((res) => {
        const newToken = res?.token || res?.access_token;
        if (newToken) {
          setToken(newToken);
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", newToken);
          }
          const decoded = decodeJwt(newToken);
          const expiresAt = decoded?.exp ? new Date(decoded.exp * 1e3) : void 0;
          const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
          Cookies.set("access_token", newToken, {
            expires: expiresAt,
            secure: isHttps,
            sameSite: isHttps ? "None" : "Lax",
            path: "/"
          });
          options.onLoginSuccess?.(res);
        }
      }).catch((err) => {
        console.error("[useClerkStoreAuth] Failed to sync Clerk session with Defx backend:", err);
      }).finally(() => {
        isSyncingRef.current = false;
      });
    }
  }, [isSignedIn, isLoaded, user?.id, options.loginAction, options.onLoginSuccess]);
  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cartid");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
    Cookies.remove("access_token", { path: "/" });
    setToken(null);
    try {
      await clerk.signOut?.();
    } catch (err) {
      console.error("[useClerkStoreAuth] Error signing out from Clerk:", err);
    }
    const redirectPath = options.redirectOnLogout ?? "/";
    if (options.navigate) {
      options.navigate(redirectPath);
    } else if (typeof window !== "undefined") {
      window.location.href = redirectPath;
    }
  }, [clerk, options.redirectOnLogout, options.navigate]);
  const openSignIn = useCallback(
    (opts) => {
      clerk.openSignIn?.(opts);
    },
    [clerk]
  );
  const openSignUp = useCallback(
    (opts) => {
      clerk.openSignUp?.(opts);
    },
    [clerk]
  );
  return useMemo(
    () => ({
      isSignedIn: Boolean(isSignedIn),
      isLoaded: Boolean(isLoaded),
      user,
      token,
      access_token: token,
      logout,
      openSignIn,
      openSignUp
    }),
    [isSignedIn, isLoaded, user, token, logout, openSignIn, openSignUp]
  );
}
var ClerkStoreProvider = ({
  children,
  authOptions,
  config,
  ...props
}) => {
  const auth = useClerkStoreAuth(authOptions);
  const resolvedConfig = {
    ...config,
    authType: "clerk"
  };
  return /* @__PURE__ */ jsx(CoreProvider, { config: resolvedConfig, auth, ...props, children });
};

// src/hooks/useCart.ts
var useCart = () => {
  const { cart, setCart, isCartLoading, config } = useCore();
  return { cart, setCart, isCartLoading, config };
};

// src/hooks/useAuth.ts
var useAuth = () => {
  const { auth } = useCore();
  return auth ?? {};
};
var useLogout = () => {
  const { auth, adapter } = useCore();
  const router = useStorefrontRouter(adapter?.router);
  const logout = async () => {
    if (auth?.logout) {
      await auth.logout();
    } else {
      if (auth?.clearAuth) {
        auth.clearAuth();
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("cartid");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
      try {
        Cookies.remove("access_token", { path: "/" });
      } catch (e) {
        console.error("Failed to remove cookies using js-cookie:", e);
      }
      if (typeof document !== "undefined") {
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      }
      try {
        await fetch("/api/logout", { method: "POST" });
      } catch (e) {
      }
      router.push("/");
      router.refresh();
      return;
    }
    router.refresh();
  };
  return logout;
};
function decodeJwt2(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
function isTokenExpired(token) {
  if (!token) return true;
  const decoded = decodeJwt2(token);
  if (!decoded?.exp) return false;
  return Date.now() / 1e3 >= decoded.exp;
}
function useOtpStoreAuth(options = {}) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("access_token") || Cookies.get("access_token") || null;
    if (!storedToken || isTokenExpired(storedToken)) {
      if (storedToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        Cookies.remove("access_token", { path: "/" });
      }
      setToken(null);
      setUser(null);
      setUserId(null);
      setIsLoaded(true);
      return;
    }
    setToken(storedToken);
    const decoded = decodeJwt2(storedToken);
    const resolvedUserId = decoded?.sub ?? decoded?.user_id ?? decoded?.id ?? null;
    setUserId(resolvedUserId);
    let storedUser = null;
    try {
      const u = localStorage.getItem("user");
      if (u) storedUser = JSON.parse(u);
    } catch {
    }
    if (storedUser) {
      setUser(storedUser);
      setIsLoaded(true);
    } else {
      getUserAction({ token: storedToken }).then((fetchedUser) => {
        if (fetchedUser && !fetchedUser.error && !fetchedUser.serverError) {
          setUser(fetchedUser);
          localStorage.setItem("user", JSON.stringify(fetchedUser));
        }
      }).catch((err) => {
        console.warn("[useOtpStoreAuth] Failed to fetch user profile:", err);
      }).finally(() => {
        setIsLoaded(true);
      });
    }
  }, []);
  const setAuth = useCallback((data) => {
    const nextToken = data?.token || data?.access_token || null;
    const nextUser = data?.user || null;
    setToken(nextToken);
    setUser(nextUser);
    if (nextToken) {
      const decoded = decodeJwt2(nextToken);
      const resolvedUserId = decoded?.sub ?? decoded?.user_id ?? decoded?.id ?? null;
      setUserId(resolvedUserId);
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", nextToken);
        if (nextUser) {
          localStorage.setItem("user", JSON.stringify(nextUser));
        }
      }
      const expiresAt = decoded?.exp ? new Date(decoded.exp * 1e3) : void 0;
      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
      Cookies.set("access_token", nextToken, {
        expires: expiresAt,
        secure: isHttps,
        sameSite: isHttps ? "None" : "Lax",
        path: "/"
      });
    } else {
      setUserId(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
      Cookies.remove("access_token", { path: "/" });
    }
  }, []);
  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    setUserId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("cartid");
    }
    Cookies.remove("access_token", { path: "/" });
  }, []);
  const logout = useCallback(async () => {
    clearAuth();
    const redirectPath = options.redirectOnLogout ?? "/";
    if (options.navigate) {
      options.navigate(redirectPath);
    } else if (typeof window !== "undefined") {
      window.location.href = redirectPath;
    }
  }, [clearAuth, options.redirectOnLogout, options.navigate]);
  const openSignIn = useCallback(() => {
    setAuthMode("signin");
    setIsAuthOpen(true);
  }, []);
  const openSignUp = useCallback(() => {
    setAuthMode("signup");
    setIsAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => {
    setIsAuthOpen(false);
  }, []);
  const sendLoginOtp = useCallback(
    async (phone, countryCode = options.countryCode ?? "+91") => {
      return loginUser({ phone, country_code: countryCode });
    },
    [options.countryCode]
  );
  const sendSignUpOtp = useCallback(
    async (payload) => {
      return signUpUser({
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        countryCode: payload.countryCode ?? options.countryCode ?? "+91"
      });
    },
    [options.countryCode]
  );
  const verifyPhoneOtp = useCallback(
    async (phone, code, countryCode = options.countryCode ?? "+91") => {
      const res = await verifyOtp({ phone, country_code: countryCode, code });
      const newToken = res?.token || res?.access_token;
      if (newToken) {
        setAuth({
          token: newToken,
          access_token: newToken,
          user: res?.user ?? null
        });
        options.onLoginSuccess?.(res);
      }
      return res;
    },
    [options.countryCode, options.onLoginSuccess, setAuth]
  );
  return useMemo(
    () => ({
      isSignedIn: Boolean(token && !isTokenExpired(token)),
      isLoaded,
      user,
      userId,
      token,
      access_token: token,
      logout,
      openSignIn,
      openSignUp,
      setAuth,
      clearAuth,
      isAuthOpen,
      authMode,
      closeAuth,
      sendLoginOtp,
      sendSignUpOtp,
      verifyPhoneOtp
    }),
    [
      token,
      isLoaded,
      user,
      userId,
      logout,
      openSignIn,
      openSignUp,
      setAuth,
      clearAuth,
      isAuthOpen,
      authMode,
      closeAuth,
      sendLoginOtp,
      sendSignUpOtp,
      verifyPhoneOtp
    ]
  );
}
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

// src/hooks/useAddresses.ts
function useAddresses() {
  const { addresses, isAddressLoading, refreshAddresses, actions, auth } = useCore();
  const token = auth?.token ?? auth?.access_token ?? null;
  const isSignedIn = !!((auth?.isSignedIn ?? false) && token);
  return {
    addresses: isSignedIn ? addresses : [],
    isAddressLoading,
    isSignedIn,
    refreshAddresses: actions?.refreshAddresses || refreshAddresses,
    createAddress: actions?.createAddress,
    updateAddress: actions?.updateAddress,
    deleteAddress: actions?.deleteAddress,
    getUserAddress: actions?.getUserAddress
  };
}

// src/hooks/userCartInfo.ts
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

// src/hooks/useCartDrawer.ts
var useCartDrawer = () => {
  const core = useCore();
  const isCartDrawerOpen = Boolean(core?.isCartDrawerOpen);
  const openCartDrawer = core?.openCartDrawer || (() => {
  });
  const closeCartDrawer = core?.closeCartDrawer || (() => {
  });
  const toggleCartDrawer = core?.toggleCartDrawer || (() => {
  });
  const setIsCartDrawerOpen = core?.setIsCartDrawerOpen || (() => {
  });
  return {
    isCartDrawerOpen,
    openCartDrawer,
    closeCartDrawer,
    toggleCartDrawer,
    setIsCartDrawerOpen
  };
};
var likedCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 5 * 60 * 1e3;
var isFresh = (entry) => !!entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS;
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
var CustomOTPAuth = ({
  mode = "sign-in",
  onLoginSuccess
}) => {
  const { actions, auth, config, toast } = useCore();
  const [authMode, setAuthMode] = useState(() => normalizeMode(mode));
  const [step, setStep] = useState("phone");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef([]);
  const countryCode = String(config?.countryCode ?? "+91");
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
var AuthManager = ({
  mode = "sign-in",
  onLoginSuccess
}) => {
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
  const {
    handleAddToCart,
    handleDecreaseQty,
    handleDeleteLineItem,
    isAddToCartLoading,
    deletingLineItemId
  } = useAddToCart();
  const { formatCurrency } = useCurrencyFormat();
  const [isDeleting, setIsDeleting] = useState(false);
  const product = item?.line_itemable;
  const name = product?.name ?? item?.name ?? "Product";
  const price = item?.price ?? product?.price ?? 0;
  const quantity = item?.quantity ?? 0;
  const imageUrl = product?.product_images?.[0]?.product_image_url ?? product?.image_url ?? null;
  const isItemDeleting = isDeleting || Boolean(item?.id) && deletingLineItemId === item?.id;
  const isActionDisabled = isAddToCartLoading || isItemDeleting;
  const sq = product?.selling_quantity ?? item?.selling_quantity ?? product?.product?.selling_quantity;
  const hasSellingQuantity = Boolean(product?.selling_quantity_id) || Boolean(item?.selling_quantity_id) || Boolean(product?.is_selling_quantity) || Boolean(item?.is_selling_quantity) || (sq && typeof sq === "object" ? Array.isArray(sq.values) ? sq.values.length > 0 : Object.keys(sq).length > 0 : Boolean(sq));
  const numQty = Number(quantity);
  const isDecimalQuantity = !isNaN(numQty) && (numQty % 1 !== 0 || !Number.isInteger(numQty));
  const isSellingQty = hasSellingQuantity || isDecimalQuantity;
  const handleDelete = async () => {
    if (isActionDisabled) return;
    try {
      setIsDeleting(true);
      await handleDeleteLineItem(item);
    } finally {
      setIsDeleting(false);
    }
  };
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
      renderActions ? renderActions(item) : !isSellingQty ? /* @__PURE__ */ jsxs("div", { style: s.controls, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            style: s.qtyBtn,
            onClick: () => handleDecreaseQty(product),
            disabled: isActionDisabled,
            "aria-label": "Decrease quantity",
            children: "\u2212"
          }
        ),
        /* @__PURE__ */ jsx("span", { style: s.qty, children: isItemDeleting || isAddToCartLoading ? /* @__PURE__ */ jsx(Spinner, { size: "sm" }) : quantity }),
        /* @__PURE__ */ jsx(
          "button",
          {
            style: s.qtyBtn,
            onClick: () => handleAddToCart(product),
            disabled: isActionDisabled,
            "aria-label": "Increase quantity",
            children: "+"
          }
        )
      ] }) : /* @__PURE__ */ jsx("div", { style: s.controls, children: /* @__PURE__ */ jsx("span", { style: s.qty, children: quantity }) })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        style: {
          ...s.deleteBtn,
          ...isActionDisabled ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" } : {}
        },
        onClick: handleDelete,
        disabled: isActionDisabled,
        "aria-label": "Remove item",
        title: "Remove",
        children: isItemDeleting ? /* @__PURE__ */ jsx(Spinner, { size: "sm" }) : "\u2715"
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
  const [isWide, setIsWide] = React6.useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  React6.useEffect(() => {
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
        (item) => renderItem ? /* @__PURE__ */ jsx(React6.Fragment, { children: renderItem(item) }, item.id) : /* @__PURE__ */ jsx(CartItem, { item }, item.id)
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
  customizationsList = [],
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
      `${customization.product_customization_id || index}-${index}`
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
var DeleteIcon = ({ onClick, disabled, loading, className, title }) => /* @__PURE__ */ jsx(
  "button",
  {
    type: "button",
    onClick,
    disabled: disabled || loading,
    className: `w-6 h-6 flex items-center justify-center shrink-0 ${className || ""} ${disabled || loading ? "cursor-not-allowed opacity-50 pointer-events-none" : ""}`,
    title,
    "aria-label": title || "Delete",
    children: loading ? /* @__PURE__ */ jsx(
      "div",
      {
        className: "w-4 h-4 border-2 border-[var(--core-primary)] border-t-transparent rounded-full animate-spin shrink-0",
        role: "status",
        "aria-label": "Deleting..."
      }
    ) : /* @__PURE__ */ jsxs(
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
        className: "shrink-0",
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
var ProductlistCard = ({
  product,
  component = null,
  orderType
}) => {
  const router = useStorefrontRouter();
  const { name, price, shipping_charge } = product?.line_itemable ?? {};
  const productImage = product?.image;
  const quantity = product?.quantity;
  const displayPrice = (price ?? 0) / 100;
  const sq = product?.line_itemable?.selling_quantity;
  sq && typeof sq === "object" ? Array.isArray(sq.values) ? sq.values.length > 0 : Object.keys(sq).length > 0 : Boolean(sq);
  const variantOptions = product?.line_itemable?.variant_options ?? [];
  const { formatCurrency } = useCurrencyFormat();
  const {
    handleDeleteLineItem,
    handleDecreaseQty,
    handleAddToCart,
    isAddToCartLoading,
    deletingLineItemId
  } = useAddToCart();
  const [isDeleting, setIsDeleting] = useState(false);
  const isItemDeleting = isDeleting || Boolean(product?.id) && deletingLineItemId === product?.id;
  const isActionDisabled = isAddToCartLoading || isItemDeleting;
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
    router.push(url);
  };
  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = noProductImage;
  };
  const handleDeleteItem = async (e) => {
    e?.stopPropagation?.();
    if (isActionDisabled) return;
    try {
      setIsDeleting(true);
      await handleDeleteLineItem(product);
    } finally {
      setIsDeleting(false);
    }
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
  return /* @__PURE__ */ jsxs("div", { className: "w-full flex justify-between gap-x-[16px] py-[12px]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-x-[12px] min-w-0", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-[80px] h-[80px] rounded-[8px] overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer",
          onClick: handleNavigateToProduct,
          children: /* @__PURE__ */ jsx(
            "img",
            {
              src: productImage || noProductImage,
              alt: name || "Product",
              onError: handleImageError,
              className: "w-full h-full object-cover"
            }
          )
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            "h3",
            {
              className: "text-[14px] font-[var(--font-medium)] text-[var(--main)] truncate cursor-pointer hover:underline",
              onClick: handleNavigateToProduct,
              children: name
            }
          ),
          variantOptions.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-x-2 text-[12px] text-[var(--secondary)] mt-0.5", children: variantOptions.map((opt, idx) => /* @__PURE__ */ jsxs("span", { children: [
            opt.option_type_name || opt.name,
            ": ",
            opt.presentation || opt.value
          ] }, idx)) }),
          product?.customizations && product.customizations.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-1 flex items-center gap-2", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setIsViewModalOpen(true),
              className: "text-[11px] text-[var(--core-primary)] font-[var(--font-medium)] underline",
              children: "View customizations"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-[14px] font-[var(--font-regular)] text-[var(--secondary)]", children: [
          quantity,
          " \xD7 ",
          formatCurrency(displayPrice)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end justify-between shrink-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[14px] font-[var(--font-medium)] text-[var(--main)]", children: formatCurrency(displayPrice * (quantity ?? 1)) }),
      component ? component : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[13px] font-[var(--font-medium)] text-[var(--core-primary)] border border-gray-200 rounded px-2 py-0.5 bg-gray-50", children: quantity }),
        /* @__PURE__ */ jsx(
          DeleteIcon,
          {
            onClick: handleDeleteItem,
            disabled: isActionDisabled,
            loading: isItemDeleting
          }
        )
      ] })
    ] }),
    isViewModalOpen && /* @__PURE__ */ jsx(
      ViewCustomizationModal_default,
      {
        isOpen: isViewModalOpen,
        onClose: () => setIsViewModalOpen(false),
        customizations: product?.customizations,
        productName: name
      }
    ),
    isEditModalOpen && /* @__PURE__ */ jsx(
      CustomizationModal_default,
      {
        isOpen: isEditModalOpen,
        onClose: () => setIsEditModalOpen(false),
        product: product?.line_itemable,
        customizationsList: product?.line_itemable?.customizations || [],
        onConfirm: handleEditConfirm,
        initialValues: product?.customizations?.reduce((acc, c) => {
          acc[c.product_customization_id] = { value: c.value };
          return acc;
        }, {}),
        initialQuantity: quantity,
        isEditMode: true,
        isAddToCartLoading
      }
    )
  ] });
};
var ProductlistCard_default = ProductlistCard;
var StorefrontLink = ({
  href,
  children,
  prefetch,
  replace,
  ...props
}) => {
  const core = useCore();
  const LinkComponent = core?.linkComponent;
  if (LinkComponent) {
    return /* @__PURE__ */ jsx(LinkComponent, { href, prefetch, replace, ...props, children });
  }
  return /* @__PURE__ */ jsx("a", { href, ...props, children });
};
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
              title && /* @__PURE__ */ jsx("h2", { className: "text-[20px] font-[var(--font-bold,sans-serif)] text-[var(--core-primary,#00214c)] uppercase tracking-wide", children: title }),
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      toast?.error?.(err?.message || "Failed to save address. Please try again.");
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
            disabled: isSubmitting || isDeleting,
            onClick: () => setShowDeleteConfirm(true),
            className: "flex-1 py-3 border border-red-100 text-red-500 rounded-md font-[var(--font-bold)] hover:bg-red-50 transition-colors uppercase tracking-widest text-[12px] disabled:opacity-50",
            children: "Delete Address"
          }
        )
      ] })
    ] }),
    showDeleteConfirm && typeof document !== "undefined" && createPortal(
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "fixed inset-0 z-[1000000] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-[2px] transition-all duration-300",
          onClick: (e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setShowDeleteConfirm(false);
            }
          },
          children: /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-[400px] overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-3 mb-2 border-b border-gray-100", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-[17px] font-[var(--font-bold)] text-[var(--core-primary)] uppercase tracking-wide", children: "Delete Address" }),
              !isDeleting && /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowDeleteConfirm(false),
                  className: "text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100",
                  "aria-label": "Close",
                  children: /* @__PURE__ */ jsx(
                    "svg",
                    {
                      className: "w-5 h-5",
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
            /* @__PURE__ */ jsxs("p", { className: "py-3 text-[14px] font-[var(--font-regular)] text-gray-600 leading-relaxed", children: [
              "Are you sure you want to delete",
              " ",
              /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-bold)] text-[var(--core-primary)]", children: [
                '"',
                initialData?.label || initialData?.address_type || "this address",
                '"'
              ] }),
              "? This action cannot be undone."
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mt-4 pt-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  disabled: isDeleting,
                  onClick: () => setShowDeleteConfirm(false),
                  className: "flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-[var(--font-bold)] hover:bg-gray-50 transition-colors uppercase tracking-widest text-[12px] disabled:opacity-50",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  disabled: isDeleting,
                  onClick: async () => {
                    setIsDeleting(true);
                    try {
                      await actions.deleteAddress(initialData.id);
                      toast?.success?.("Address deleted successfully.");
                      setShowDeleteConfirm(false);
                      onSuccess?.();
                    } catch (err) {
                      toast?.error?.("Failed to delete address.");
                    } finally {
                      setIsDeleting(false);
                    }
                  },
                  className: "flex-1 py-2.5 bg-red-600 text-white rounded-lg font-[var(--font-bold)] hover:bg-red-700 transition-colors uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50",
                  children: isDeleting ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }),
                    /* @__PURE__ */ jsx("span", { children: "Deleting..." })
                  ] }) : "Delete"
                }
              )
            ] })
          ] })
        }
      ),
      document.body
    )
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
var AddAddressForm = ({
  isOpen,
  onClose,
  refetch
}) => {
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
  address = [],
  sameAsShipping,
  setSameAsShipping,
  shippingAddressId,
  billingAddressId,
  setSelectedAddress,
  refetch
}) => {
  const { actions } = useCore();
  const [isOpenAddAddress, setIsOpenAddAddress] = useState(false);
  const updateCart = useCallback(
    async (apiData) => {
      try {
        if (actions?.updateCart) {
          const res = await actions.updateCart(apiData?.id, apiData);
          setCart(res);
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
  const isPayment = type === "stripe" || type === "payment" || type === "phonepe" || type === "razorpay";
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
        /* @__PURE__ */ jsx("div", { className: "ml-4 flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "px-2.5 h-[30px] min-w-[60px] bg-[var(--secondaryBg)] border border-[var(--borders)] rounded flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-[11px] font-[var(--font-bold)] text-[var(--main)] whitespace-nowrap", children: paymentLabel ?? (type === "stripe" ? "Stripe" : type === "phonepe" ? "PhonePe" : type === "razorpay" ? "Razorpay" : "Payment") }) }) })
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
var CartMismatchBanner = ({
  serverTotal,
  clientTotal,
  freshCart,
  onDismiss,
  currency = "INR",
  locale = "en-IN"
}) => {
  const { setCart } = useCart();
  const fmt = (amount) => {
    if (amount == null) return "\u2014";
    const num = Number(amount);
    if (isNaN(num)) return `${currency} ${amount}`;
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2
      }).format(num);
    } catch {
      return `${currency} ${num}`;
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
};
var CartMismatchBanner_default = CartMismatchBanner;
var normalizeAddresses = (payload) => payload?.data ?? payload?.addresses ?? (Array.isArray(payload) ? payload : []);
var Checkout = ({
  hasDeletedItems,
  onPaymentSuccess,
  router: overrideRouter
}) => {
  const { auth } = useCore();
  const { isSignedIn, isLoading } = auth || {};
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "w-full h-[400px] flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-[var(--core-primary)] border-t-transparent rounded-full animate-spin" }) });
  }
  return !isSignedIn ? /* @__PURE__ */ jsx(LoginPage, {}) : /* @__PURE__ */ jsx(
    OrderInfo,
    {
      user: auth?.user,
      hasDeletedItems,
      onPaymentSuccess,
      overrideRouter
    }
  );
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
var OrderInfo = ({
  user,
  hasDeletedItems,
  onPaymentSuccess,
  overrideRouter
}) => {
  const router = useStorefrontRouter(overrideRouter);
  const { Razorpay } = useRazorpay();
  const { cart, setCart, actions, config, auth, orgData, primaryColor, toast } = useCore();
  const {
    gateway: paymentGateway,
    label: paymentGatewayLabel,
    isPhonePe: isPhonePeGateway,
    isRazorpay: isRazorpayGateway,
    isStripe: isStripeGateway,
    stripePublishableKey,
    razorpayKeyId,
    paymentConfig
  } = usePaymentGateway();
  const [StripeCheckout, setStripeCheckout] = useState(
    () => getPaymentGateway("stripe")
  );
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isRedirectingOrder, setIsRedirectingOrder] = useState(false);
  const isRedirectingRef = useRef(false);
  useEffect(() => {
    return () => {
      if (isRedirectingRef.current) {
        setCart(null);
      }
    };
  }, [setCart]);
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
  const fetchAddresses = useCallback(
    async (options = {}) => {
      try {
        setIsAddressLoading(true);
        const token = auth?.token ?? auth?.access_token ?? null;
        if (actions?.getUserAddress && auth?.isSignedIn && token) {
          const data = await actions.getUserAddress(options);
          setAddresses(normalizeAddresses(data));
        } else {
          setAddresses([]);
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
        setAddresses([]);
      } finally {
        setIsAddressLoading(false);
      }
    },
    [actions, auth?.isSignedIn, auth?.token, auth?.access_token]
  );
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
    cart?.id,
    cart?.order_type,
    cart?.shipping_address?.id,
    cart?.billing_address?.id,
    addresses,
    actions,
    setCart
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
            onPaymentSuccess?.();
            setIsRedirectingOrder(true);
            setIsProcessingPayment(true);
            isRedirectingRef.current = true;
            const orderTargetUrl = `/account/orders/${order.order_id}`;
            router.prefetch?.(orderTargetUrl);
            router.replace(orderTargetUrl);
            setTimeout(() => {
              if (typeof window !== "undefined" && !window.location.pathname.includes(`/orders/${order.order_id}`)) {
                window.location.replace(orderTargetUrl);
              }
            }, 3e3);
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
      theme: { color: primaryColor },
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false);
          setIsPlacingOrder(false);
        }
      }
    };
    try {
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
        setIsProcessingPayment(false);
        setIsPlacingOrder(false);
      });
      setIsPlacingOrder(false);
      razorpay.open();
    } catch (err) {
      console.error("Failed to open Razorpay modal:", err);
      setIsProcessingPayment(false);
      setIsPlacingOrder(false);
    }
  };
  const onPhonePeHandler = (res) => {
    try {
      const redirectUrl = res?.redirect_url || res?.url || res?.redirectUrl || res?.data?.instrumentResponse?.redirectInfo?.url || res?.data?.redirectUrl;
      if (redirectUrl) {
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              "defx_phonepe_pending",
              JSON.stringify({
                cartId: cart?.id,
                paymentId: res?.id || res?.cart_payment_id || null,
                orderId: res?.order_id || null,
                timestamp: Date.now()
              })
            );
          } catch (e) {
            console.warn("[Checkout] Failed to store pending PhonePe session:", e);
          }
        }
        setIsProcessingPayment(true);
        window.location.href = redirectUrl;
        return;
      }
      if (res?.order_id) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("cartid");
        }
        const userId = auth?.userId ?? auth?.user?.id ?? user?.id ?? null;
        const currency = config?.currency ?? "INR";
        trackPurchase({
          userId,
          transactionId: String(res.order_id),
          cart,
          currency,
          metaOverrides: { source: "checkout" }
        });
        trackMetaPurchase(cart);
        onPaymentSuccess?.();
        setIsRedirectingOrder(true);
        setIsProcessingPayment(true);
        isRedirectingRef.current = true;
        const orderTargetUrl = `/account/orders/${res.order_id}`;
        router.prefetch?.(orderTargetUrl);
        router.replace(orderTargetUrl);
        setTimeout(() => {
          if (typeof window !== "undefined" && !window.location.pathname.includes(`/orders/${res.order_id}`)) {
            window.location.replace(orderTargetUrl);
          }
        }, 3e3);
        return;
      }
      console.error("[Checkout] No redirect URL found in PhonePe response:", res);
      const errorMsg = res?.error || res?.message || "Could not initialize PhonePe payment. Please try again.";
      toast?.error?.(errorMsg);
    } catch (err) {
      console.error("[Checkout] Error redirecting to PhonePe:", err);
      toast?.error?.("Failed to redirect to PhonePe. Please try again.");
    }
  };
  const onPlaceOrder = async () => {
    if (hasDeletedItems || !cart?.id) return;
    const clientTotal = Number(cart?.total ?? cart?.display_total ?? 0);
    const validation = await validateCartTotal(String(cart.id), clientTotal, {
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
    if (orderType === "delivery" && (!addresses || addresses.length === 0 || !shippingAddressId)) {
      toast?.error?.("Please add or select a delivery address to proceed.");
      return;
    }
    if (isStripeGateway) {
      setShowStripeForm(true);
      return;
    }
    if (isPhonePeGateway) {
      try {
        setIsPlacingOrder(true);
        const createOrderFn = actions?.createPhonePeOrder || actions?.createCartPayment || actions?.createRazorOrder;
        if (createOrderFn) {
          const orderResponse = await createOrderFn(cart.id);
          if (orderResponse?.serverError) {
            toast?.error?.(orderResponse.serverError);
            return;
          }
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
          onPhonePeHandler(orderResponse);
        } else {
          toast?.error?.("PhonePe payment action not configured");
        }
      } catch (err) {
        console.error("Failed to create PhonePe order:", err);
        const errorMsg = err?.data?.error || err?.message;
        if (errorMsg && typeof errorMsg === "string") {
          toast?.error?.(errorMsg);
        } else {
          toast?.error?.("Failed to process payment");
        }
      } finally {
        setIsPlacingOrder(false);
      }
      return;
    }
    try {
      setIsPlacingOrder(true);
      const createOrderFn = actions?.createRazorOrder || actions?.createCartPayment;
      if (createOrderFn) {
        const orderResponse = await createOrderFn(cart.id);
        if (orderResponse?.serverError) {
          toast?.error?.(orderResponse.serverError);
          return;
        }
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
      } else {
        toast?.error?.("Payment action not configured");
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
      CartMismatchBanner_default,
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
        refetch: () => fetchAddresses({ force: true }),
        sameAsShipping,
        setSameAsShipping,
        shippingAddressId,
        billingAddressId,
        setSelectedAddress,
        isCartHaveBillingAddress,
        isCarthaveShippingAddress
      }
    ) : /* @__PURE__ */ jsx(AddressFormInline, { refetch: () => fetchAddresses({ force: true }) }) }),
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
                String(cartId),
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
            onCancel: () => setShowStripeForm(false),
            onSuccess: async () => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("cartid");
              }
              onPaymentSuccess?.();
              setIsRedirectingOrder(true);
              setIsProcessingPayment(true);
              isRedirectingRef.current = true;
              try {
                const regionId = config?.regionId ?? null;
                const updatedCart = await actions?.getCart?.(regionId);
                const cartData = Array.isArray(updatedCart) ? updatedCart[0] : updatedCart;
                const orderId = cartData?.order_id;
                if (orderId) {
                  const orderTargetUrl = `/account/orders/${orderId}`;
                  router.prefetch?.(orderTargetUrl);
                  router.replace(orderTargetUrl);
                  setTimeout(() => {
                    if (typeof window !== "undefined" && !window.location.pathname.includes(`/orders/${orderId}`)) {
                      window.location.replace(orderTargetUrl);
                    }
                  }, 3e3);
                } else {
                  router.replace("/account/orders");
                }
              } catch {
                router.replace("/account/orders");
              }
            }
          }
        ) }),
        showStripeForm && !StripeCheckout && /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-red-500 p-3 bg-red-50 rounded-lg", children: "StripeCheckout component is not configured." })
      ] }) : isPhonePeGateway ? /* @__PURE__ */ jsx(
        AddressCard,
        {
          addressType: "Pay with PhonePe",
          address: "Once you click Checkout, you'll be redirected to PhonePe's secure payment portal to complete your payment via UPI, Credit/Debit Card, or Net Banking.",
          type: "phonepe",
          paymentLabel: "PhonePe"
        }
      ) : /* @__PURE__ */ jsx(
        AddressCard,
        {
          addressType: `Pay with ${paymentGatewayLabel}`,
          address: `Once you click Checkout, you'll be redirected to a secure ${paymentGatewayLabel} payment window to complete your payment.`,
          type: "razorpay",
          paymentLabel: paymentGatewayLabel
        }
      ) })
    ] }),
    !(isStripeGateway && showStripeForm) && /* @__PURE__ */ jsxs("div", { className: "mt-[32px]", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onPlaceOrder,
          disabled: hasDeletedItems || isPlacingOrder || isAddressLoading || orderType === "delivery" && addresses.length === 0,
          className: `px-5 py-3 w-full rounded-lg cursor-pointer font-[var(--font-medium)] text-[15px] transition-all duration-300 ${hasDeletedItems || isPlacingOrder || isAddressLoading || orderType === "delivery" && addresses.length === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" : "bg-[var(--core-primary)] text-white hover:opacity-90 hover:shadow-lg transform active:scale-[0.98]"}`,
          children: isPlacingOrder ? "Processing\u2026" : isAddressLoading ? "Loading addresses\u2026" : orderType === "delivery" && addresses.length === 0 ? "Please Add Delivery Address to Checkout" : hasDeletedItems ? "Remove Deleted Items to Checkout" : isStripeGateway ? "Proceed to Card Payment" : isPhonePeGateway ? "Proceed to PhonePe" : "Checkout"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 text-center", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-[#8c92a4] font-[var(--font-regular)] leading-relaxed", children: [
          "By placing your order, you agree to our",
          " ",
          /* @__PURE__ */ jsx(
            StorefrontLink,
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
            StorefrontLink,
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
          StorefrontLink,
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
          /* @__PURE__ */ jsx("h2", { className: "font-serif italic text-3xl text-[var(--core-primary)] tracking-tight", children: isRedirectingOrder ? "Payment Successful!" : isPhonePeGateway ? "Redirecting to PhonePe\u2026" : "Processing your payment" }),
          /* @__PURE__ */ jsx("div", { className: "w-12 h-[1px] bg-[var(--core-secondary)] mx-auto opacity-50" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-[#2d2d2d] text-base", children: isRedirectingOrder ? "Redirecting to your order details..." : isPhonePeGateway ? "Redirecting you to PhonePe to complete your payment securely." : `We're finalizing your order with ${paymentGatewayLabel}.` }),
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
  const {
    availablePoints,
    monetaryValue,
    isApplying: isApplyingLoyalty,
    applyPoints
  } = useLoyalty({ autoFetch: Boolean(token) });
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [loyaltyPointsInput, setLoyaltyPointsInput] = useState(100);
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
  }, [actions, cart?.id, token, config?.regionId, config?.apiBaseUrl, config?.storeId]);
  const availableDiscountsWithCode = availableDiscounts || [];
  const rawDiscounts = cart?.cart_discounts || [];
  const appliedDiscounts = rawDiscounts.filter(
    (coupon) => coupon.code || coupon.id
  );
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
  const handleRemove = async ({
    code,
    discount_id
  }) => {
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
                coupon.display_discount_amount || (coupon.discount_amount ? coupon.discount_amount / 100 : 0)
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
    ] }),
    availablePoints > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => setIsLoyaltyOpen((prev) => !prev),
          "aria-expanded": isLoyaltyOpen,
          className: "w-full flex items-center justify-between border-b border-[var(--borders)] px-1 py-3 cursor-pointer",
          children: [
            /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-medium)] text-[14px] text-[var(--main)] flex items-center gap-1.5 flex-wrap", children: [
              /* @__PURE__ */ jsx("span", { children: "\u2B50" }),
              /* @__PURE__ */ jsx("span", { children: "Redeem Points" }),
              /* @__PURE__ */ jsxs("span", { className: "rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-[#E65100]", children: [
                availablePoints.toLocaleString(),
                " pts available"
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[var(--main)] text-[16px]", children: isLoyaltyOpen ? "\u25B4" : "\u25BE" })
          ]
        }
      ),
      isLoyaltyOpen && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-col gap-3 rounded-xl bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white p-3.5 border border-amber-200/80 shadow-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs text-gray-700", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Available: ",
            /* @__PURE__ */ jsxs("strong", { children: [
              availablePoints.toLocaleString(),
              " pts"
            ] }),
            " (Worth ",
            /* @__PURE__ */ jsx("strong", { children: formatCurrency(monetaryValue) }),
            ")"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-emerald-700 font-semibold text-[11px]", children: [
            "Saves ",
            formatCurrency(Math.min(availablePoints, Math.max(0, loyaltyPointsInput)) * (availablePoints > 0 && monetaryValue > 0 ? monetaryValue / availablePoints : 0.877))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              "aria-label": "Points to redeem",
              value: loyaltyPointsInput,
              onChange: (e) => setLoyaltyPointsInput(Math.min(availablePoints, Math.max(0, Number(e.target.value)))),
              min: 100,
              max: availablePoints,
              step: 50,
              placeholder: "Min 100 pts",
              className: "border border-amber-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 font-semibold outline-none flex-1 bg-white focus:border-[#E65100]"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setLoyaltyPointsInput(availablePoints),
              className: "px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-[#E65100] hover:bg-orange-50 cursor-pointer shrink-0",
              children: "Max"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: async () => {
                if (!cart?.id) {
                  triggerToast.error("Cart not found");
                  return;
                }
                await applyPoints({
                  cart_id: String(cart.id),
                  points_to_use: loyaltyPointsInput
                });
              },
              disabled: isApplyingLoyalty || loyaltyPointsInput < 100 || loyaltyPointsInput > availablePoints,
              className: "text-white text-[12px] font-[var(--font-bold)] px-4 py-2 rounded-lg border-none cursor-pointer tracking-wide disabled:opacity-60 shrink-0 shadow-xs",
              style: { background: "var(--core-primary, #E65100)" },
              children: isApplyingLoyalty ? "APPLYING..." : "REDEEM"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 pt-0.5", children: [100, 250, 500, 1e3].filter((p) => p <= availablePoints).map((preset) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setLoyaltyPointsInput(preset),
            className: `px-2.5 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${loyaltyPointsInput === preset ? "bg-[#E65100] text-white border-[#E65100]" : "bg-white text-gray-700 border-amber-200 hover:border-amber-400"}`,
            children: [
              preset,
              " Pts (-",
              formatCurrency(preset * (availablePoints > 0 && monetaryValue > 0 ? monetaryValue / availablePoints : 0.877)),
              ")"
            ]
          },
          preset
        )) })
      ] })
    ] })
  ] });
};
var CouponSection_default = CouponSection;
var ViewCart = ({ enableFastCheckout = false }) => {
  const [discountOpen, setDiscountOpen] = useState(false);
  const [isPaymentRedirecting, setIsPaymentRedirecting] = useState(false);
  const [fastCheckoutOpen, setFastCheckoutOpen] = useState(false);
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
    display_adjustment_total,
    adjustment_total,
    display_promo_total,
    promo_total,
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
  return /* @__PURE__ */ jsxs("div", { className: "mx-4 md:mx-[24px] my-[100px] flex justify-center", children: [
    isLoading || isPaymentRedirecting ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center items-center w-full h-[400px] gap-4", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "animate-spin rounded-full h-10 w-10 border-t-2 border-b-2",
          style: { borderColor: "var(--core-primary)" }
        }
      ),
      isPaymentRedirecting && /* @__PURE__ */ jsx("p", { className: "font-[var(--font-medium)] text-gray-600 text-sm animate-pulse", children: "Redirecting to your order..." })
    ] }) : items.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center p-12 bg-gray-50/50 border border-gray-100 rounded-2xl min-h-[400px] gap-y-6 max-w-[600px] w-full mx-auto", children: [
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
      /* @__PURE__ */ jsx("div", { className: "flex-1 mt-8 md:mt-0", children: /* @__PURE__ */ jsx(
        Checkout_default,
        {
          hasDeletedItems,
          onPaymentSuccess: () => setIsPaymentRedirecting(true)
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "border border-[var(--borders)] sticky hidden md:block" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 md:sticky top-4 self-start mt-[18px] md:mt-0 order-first md:order-last", children: [
        hasDeletedItems && /* @__PURE__ */ jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-yellow-800 font-[var(--font-medium)]", children: "\u26A0\uFE0F Some items in your cart are no longer available. Please remove them before checkout." }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "font-[var(--font-medium)] text-[20px] text-[var(--main)]", children: [
            "ORDER ITEMS (",
            items.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "max-h-[540px] overflow-y-auto overflow-x-hidden mt-3 pr-1 [scrollbar-gutter:stable]", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-y-[16px]", children: items.map((item) => /* @__PURE__ */ jsx(
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
              (appliedDiscounts?.length > 0 || (cart?.promo_total ?? 0) > 0 || parseFloat(cart?.display_promo_total || "0") > 0) && (() => {
                const totalDiscount = appliedDiscounts?.length > 0 ? appliedDiscounts.reduce((sum, c) => {
                  const amt = c.display_discount_amount ?? (c.discount_amount != null ? c.discount_amount / 100 : 0);
                  return sum + parseFloat(amt || "0");
                }, 0) : parseFloat(cart?.display_promo_total || "0");
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
              (() => {
                const rawAdjustmentTotal = parseFloat(
                  String(display_adjustment_total || "").replace(/[^0-9.]/g, "") || String(adjustment_total != null ? Number(adjustment_total) / 100 : 0)
                ) || 0;
                const rawPromoTotal = parseFloat(
                  String(display_promo_total || "").replace(/[^0-9.]/g, "") || String((promo_total ?? 0) > 1e4 ? (promo_total ?? 0) / 100 : promo_total ?? 0)
                ) || 0;
                const adjustmentsList = Array.isArray(cart?.adjustments) ? cart.adjustments.filter((a) => {
                  const amt = parseFloat(
                    String(a?.display_amount ?? "").replace(/[^0-9.]/g, "") || String(a?.amount != null ? Number(a.amount) / 100 : 0)
                  );
                  return amt !== 0;
                }) : [];
                if (adjustmentsList.length > 0) {
                  return adjustmentsList.map((adj, idx) => {
                    const amt = parseFloat(
                      String(adj.display_amount || "").replace(/[^0-9.]/g, "") || String(adj.amount != null ? Number(adj.amount) / 100 : 0)
                    ) || 0;
                    return /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                      /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[14px] text-[#00b300]", children: adj.label || adj.name || "Adjustment" }),
                      /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-medium)] text-[14px] text-[#00b300]", children: [
                        "\u2212 ",
                        formatCurrency(amt)
                      ] })
                    ] }, adj.id || idx);
                  });
                }
                const nonPromoAdjustment = rawPromoTotal > 0 ? rawAdjustmentTotal > rawPromoTotal ? rawAdjustmentTotal - rawPromoTotal : 0 : appliedDiscounts?.length > 0 ? 0 : rawAdjustmentTotal;
                if (nonPromoAdjustment > 0) {
                  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[14px] text-[#00b300]", children: rawPromoTotal > 0 ? "Points / Adjustment" : "Adjustment" }),
                    /* @__PURE__ */ jsxs("p", { className: "font-[var(--font-medium)] text-[14px] text-[#00b300]", children: [
                      "\u2212 ",
                      formatCurrency(nonPromoAdjustment)
                    ] })
                  ] });
                }
                return null;
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
                (() => {
                  const rawAdjustmentTotal = parseFloat(
                    String(display_adjustment_total || "").replace(/[^0-9.]/g, "") || String(adjustment_total != null ? Number(adjustment_total) / 100 : 0)
                  ) || 0;
                  const rawPromoTotal = parseFloat(
                    String(display_promo_total || "").replace(/[^0-9.]/g, "") || String((cart?.promo_total ?? 0) > 1e4 ? (cart?.promo_total ?? 0) / 100 : cart?.promo_total ?? 0)
                  ) || 0;
                  const totalSavings = rawAdjustmentTotal > 0 ? rawAdjustmentTotal : rawPromoTotal;
                  if (totalSavings > 0) {
                    return /* @__PURE__ */ jsxs("p", { className: "text-[13px] font-[var(--font-bold)] text-[#00b300] mt-[6px] text-right", children: [
                      "You save ",
                      formatCurrency(totalSavings),
                      " on this order \u{1F389}"
                    ] });
                  }
                  return null;
                })(),
                enableFastCheckout && /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setFastCheckoutOpen(true),
                    className: "w-full mt-4 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-[var(--font-bold)] text-sm flex items-center justify-between shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]",
                    children: [
                      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsx("span", { children: "\u26A1 Quick Checkout" }),
                        /* @__PURE__ */ jsx("span", { className: "bg-emerald-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full", children: "UPI / 1-Tap" })
                      ] }),
                      /* @__PURE__ */ jsxs("span", { children: [
                        display_total ? formatCurrency(display_total) : "\u2014",
                        " \u2192"
                      ] })
                    ]
                  }
                )
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      FastCheckoutDrawer_default,
      {
        isOpen: fastCheckoutOpen,
        onClose: () => setFastCheckoutOpen(false),
        onPaymentSuccess: () => {
          setFastCheckoutOpen(false);
          setIsPaymentRedirecting(true);
        }
      }
    )
  ] });
};
var AddressCard2 = ({
  address,
  onEdit,
  onDelete
}) => {
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
            "Are you sure you want to delete",
            " ",
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
var ProfileForm = ({
  user,
  onSuccess,
  onCancel
}) => {
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
      toast?.error?.(err?.message || "Failed to update profile. Please try again.");
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
var normalizeAddresses2 = (payload) => payload?.data ?? payload?.addresses ?? (Array.isArray(payload) ? payload : []);
var UserInfo = ({ user, isLoading, refetch }) => {
  const { actions, config, auth } = useCore();
  const [addresses, setAddresses] = useState([]);
  const [isAddrLoading, setIsAddrLoading] = useState(false);
  const [modalState, setModalState] = useState({ type: null, data: null });
  const fetchAddresses = useCallback(
    async (options = {}) => {
      const token = auth?.token ?? auth?.access_token ?? null;
      const signedIn = !!((auth?.isSignedIn ?? false) && token);
      if (!actions?.getUserAddress || !signedIn) {
        setAddresses([]);
        setIsAddrLoading(false);
        return;
      }
      setIsAddrLoading(true);
      try {
        const addrs = await actions.getUserAddress(options);
        setAddresses(normalizeAddresses2(addrs));
      } catch (error) {
        console.error("Error fetching addresses:", error);
        setAddresses([]);
      } finally {
        setIsAddrLoading(false);
      }
    },
    [actions, auth?.isSignedIn, auth?.token, auth?.access_token]
  );
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
              fetchAddresses({ force: true });
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
var OrdersList = ({
  initialOrders,
  router: overrideRouter
}) => {
  const router = useStorefrontRouter(overrideRouter);
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
    orders.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-6", children: orders.map((order) => /* @__PURE__ */ jsx(
      OrderCard,
      {
        order,
        formatCurrency,
        router
      },
      order.id
    )) }) : /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: "\u{1F4E6}",
        title: "No Orders Found",
        description: "It looks like you haven't placed any orders yet. Once you do, they will appear here.",
        action: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => router.push("/"),
            className: "mt-4 px-8 py-3 bg-[var(--core-primary)] text-white font-[var(--font-bold)] text-[13px] uppercase tracking-widest hover:opacity-90 transition-colors rounded-none",
            children: "Start Shopping"
          }
        ),
        className: "border border-dashed border-gray-200 bg-gray-50/30"
      }
    )
  ] });
};
var OrderCard = ({ order, formatCurrency, router }) => {
  const o = order.order || order || {};
  const cart = o.cart || order.cart || {};
  const { id, order_number, order_status, payment_status } = o;
  const { number: cartNumber, display_total, line_items = [] } = cart;
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
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `uppercase font-[var(--font-bold)] tracking-tight ${payment_status === "received" || payment_status === "paid" ? "text-green-600" : "text-orange-500"}`,
                  children: payment_status || "Pending"
                }
              )
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
var AccountPage = ({
  initialTab = "profile"
}) => {
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
var IconBase = ({
  children,
  className = "h-5 w-5",
  strokeWidth = 1.75,
  fill = "none",
  ...props
}) => /* @__PURE__ */ jsx(
  "svg",
  {
    viewBox: "0 0 24 24",
    fill,
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": "true",
    ...props,
    children
  }
);
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
var AccountGiftIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("polyline", { points: "20 12 20 22 4 22 4 12" }),
  /* @__PURE__ */ jsx("rect", { x: "2", y: "7", width: "20", height: "5" }),
  /* @__PURE__ */ jsx("line", { x1: "12", y1: "22", x2: "12", y2: "7" }),
  /* @__PURE__ */ jsx("path", { d: "M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" }),
  /* @__PURE__ */ jsx("path", { d: "M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" })
] });
var AccountAwardIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "8", r: "6" }),
  /* @__PURE__ */ jsx("path", { d: "M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" })
] });
var AccountStarIcon = (props) => /* @__PURE__ */ jsx(IconBase, { ...props, children: /* @__PURE__ */ jsx("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }) });
var AccountClockIcon = (props) => /* @__PURE__ */ jsxs(IconBase, { ...props, children: [
  /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
  /* @__PURE__ */ jsx("polyline", { points: "12 6 12 12 16 14" })
] });
var AccountSparklesIcon = (props) => /* @__PURE__ */ jsx(IconBase, { ...props, children: /* @__PURE__ */ jsx("path", { d: "m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" }) });
var DEFAULT_NAV_ITEMS = [
  { label: "My Addresses", href: "/account/addresses", icon: AccountMapPinIcon },
  { label: "My Orders", href: "/account/orders", icon: AccountShoppingBagIcon },
  { label: "My Wishlist", href: "/account/wishlist", icon: AccountHeartIcon },
  { label: "Loyalty & Rewards", href: "/account/rewards", icon: AccountGiftIcon }
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
  logoutLabel = "Logout",
  pathname: overridePathname,
  router: overrideRouter
}) => {
  const router = useStorefrontRouter(overrideRouter);
  const pathname = overridePathname ?? router.pathname;
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
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      className: `w-[220px] flex-shrink-0 border-r border-gray-100 bg-white max-md:w-full max-md:border-b max-md:border-r-0 ${className}`,
      children: [
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
                  /* @__PURE__ */ jsx(
                    Icon,
                    {
                      className: `h-[18px] w-[18px] flex-shrink-0 ${isActive ? "text-[var(--core-primary)]" : "text-[#888888]"}`
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: `text-[14px] ${isActive ? "font-[var(--font-semibold)] text-[#1C1C1C]" : "font-[var(--font-medium)] text-[#555555]"}`,
                      children: label
                    }
                  )
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
      ]
    }
  );
};
var AccountLayout = ({
  children,
  sidebarProps,
  className = "",
  containerClassName = "",
  panelClassName = "",
  mainClassName = "",
  fullWidth
}) => {
  const router = useStorefrontRouter(sidebarProps?.router);
  const [clientPath, setClientPath] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientPath(window.location.pathname);
    }
  }, []);
  const activePath = sidebarProps?.pathname || router?.pathname || clientPath || (typeof window !== "undefined" ? window.location.pathname : "");
  const isRewardsPage = fullWidth || Boolean(
    activePath && (activePath.includes("/rewards") || activePath.includes("/loyalty"))
  );
  if (isRewardsPage) {
    return /* @__PURE__ */ jsx("div", { className: `min-h-screen bg-[#F8F9FA] ${className}`, children: /* @__PURE__ */ jsx(
      "div",
      {
        className: `mx-auto max-w-[1240px] px-4 py-8 max-md:px-3 max-md:py-4 ${containerClassName}`,
        children
      }
    ) });
  }
  return /* @__PURE__ */ jsx("div", { className: `min-h-screen bg-[#F0F0F0] ${className}`, children: /* @__PURE__ */ jsx("div", { className: `mx-auto max-w-[900px] px-4 py-8 ${containerClassName}`, children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex min-h-[520px] overflow-hidden rounded-lg bg-white shadow-sm max-md:flex-col ${panelClassName}`,
      children: [
        /* @__PURE__ */ jsx(AccountSidebar, { ...sidebarProps }),
        /* @__PURE__ */ jsx("main", { className: `flex-1 p-8 max-md:p-5 ${mainClassName}`, children })
      ]
    }
  ) }) });
};
var normalizeAddresses3 = (payload) => payload?.data ?? payload?.addresses ?? (Array.isArray(payload) ? payload : []);
var AccountAddressesPage = () => {
  const { actions, toast, auth } = useCore();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmAddress, setDeleteConfirmAddress] = useState(null);
  const fetchAddresses = useCallback(
    async (options = {}) => {
      const token = auth?.token ?? auth?.access_token ?? null;
      const signedIn = !!((auth?.isSignedIn ?? false) && token);
      if (!signedIn) {
        setAddresses([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await actions?.getUserAddress?.(options);
        setAddresses(normalizeAddresses3(res));
      } catch (error) {
        console.error("Failed to fetch addresses", error);
        toast?.error?.("Failed to fetch addresses");
      } finally {
        setIsLoading(false);
      }
    },
    [actions, toast, auth?.isSignedIn, auth?.token, auth?.access_token]
  );
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
      await fetchAddresses({ force: true });
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
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: openAddModal,
        className: "mb-5 flex items-center gap-1.5 text-[14px] font-[var(--font-semibold)] text-[var(--core-primary)] transition-opacity hover:opacity-80",
        children: [
          /* @__PURE__ */ jsx(AccountPlusIcon, { className: "h-4 w-4", strokeWidth: 2.5 }),
          "Add new address"
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "py-4 text-[14px] text-gray-500 animate-pulse", children: "Loading addresses..." }) : addresses.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-4 text-[14px] text-gray-500", children: "You have no saved addresses." }) : addresses.map((address) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-start justify-between border-b border-gray-100 py-4 last:border-0",
        children: [
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
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => openEditModal(address),
                className: "flex items-center justify-center rounded-full p-1.5 text-[#888888] transition-colors hover:bg-gray-100 hover:text-[var(--core-primary)]",
                children: /* @__PURE__ */ jsx(AccountPencilIcon, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                disabled: deletingId === address.id,
                onClick: () => setDeleteConfirmAddress(address),
                className: "flex items-center justify-center rounded-full p-1.5 text-[#888888] transition-colors hover:bg-gray-100 hover:text-red-500 disabled:opacity-50",
                children: deletingId === address.id ? /* @__PURE__ */ jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" }) : /* @__PURE__ */ jsx(AccountTrashIcon, { className: "h-4 w-4" })
              }
            )
          ] })
        ]
      },
      address.id
    )) }),
    /* @__PURE__ */ jsx(Popup, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), children: /* @__PURE__ */ jsx(
      AddressForm,
      {
        initialData: editingAddress,
        onCancel: () => setIsModalOpen(false),
        onSuccess: () => {
          setIsModalOpen(false);
          fetchAddresses({ force: true });
        },
        submitLabel: editingAddress?.id ? "Save Changes" : "Save Address"
      }
    ) }),
    deleteConfirmAddress && /* @__PURE__ */ jsx(
      Popup,
      {
        isOpen: !!deleteConfirmAddress,
        onClose: () => !deletingId && setDeleteConfirmAddress(null),
        title: "Delete Address",
        maxWidth: "max-w-[400px]",
        children: /* @__PURE__ */ jsxs("div", { className: "py-2", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-[14px] font-[var(--font-regular)] text-gray-600 mb-6 leading-relaxed", children: [
            "Are you sure you want to delete",
            " ",
            /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-bold)] text-[var(--core-primary)]", children: [
              '"',
              deleteConfirmAddress.label || deleteConfirmAddress.address_type || "this address",
              '"'
            ] }),
            "? This action cannot be undone."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                disabled: !!deletingId,
                onClick: () => setDeleteConfirmAddress(null),
                className: "flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-[var(--font-bold)] hover:bg-gray-50 transition-colors uppercase tracking-widest text-[12px] disabled:opacity-50",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                disabled: !!deletingId,
                onClick: async () => {
                  await deleteAddress(deleteConfirmAddress.id);
                  setDeleteConfirmAddress(null);
                },
                className: "flex-1 py-2.5 bg-red-600 text-white rounded-lg font-[var(--font-bold)] hover:bg-red-700 transition-colors uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50",
                children: deletingId ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }),
                  /* @__PURE__ */ jsx("span", { children: "Deleting..." })
                ] }) : "Delete"
              }
            )
          ] })
        ] })
      }
    )
  ] });
};
var AccountOrdersPage = ({
  initialOrders = [],
  pagination,
  router: overrideRouter,
  searchParams: overrideSearchParams,
  pathname: overridePathname
}) => {
  const sdkRouter = useStorefrontRouter(overrideRouter);
  const router = overrideRouter ?? sdkRouter;
  const searchParams = overrideSearchParams ?? sdkRouter.searchParams;
  const pathname = overridePathname ?? sdkRouter.pathname;
  const { formatCurrency } = useCurrencyFormat();
  const itemsPerPage = 10;
  const isServerPaginated = pagination && pagination.total_pages !== void 0;
  const getPageParam = () => {
    if (isServerPaginated) return pagination.current_page;
    if (searchParams?.get) {
      return parseInt(searchParams.get("page") || "1", 10);
    }
    if (typeof window !== "undefined") {
      return parseInt(new URLSearchParams(window.location.search).get("page") || "1", 10);
    }
    return 1;
  };
  const currentPage = getPageParam();
  const totalPages = isServerPaginated ? pagination.total_pages : Math.ceil(initialOrders.length / itemsPerPage) || 1;
  const currentOrders = isServerPaginated ? initialOrders : initialOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (page) => {
    const rawSearch = searchParams?.toString?.() ?? (typeof window !== "undefined" ? window.location.search : "");
    const params = new URLSearchParams(rawSearch);
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
var AccountOrderDetailContent = ({
  order,
  id
}) => {
  const { formatCurrency } = useCurrencyFormat();
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
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(String(orderNumber));
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    }
  };
  const getProductUrl = (item) => {
    const lineItemable = item?.line_itemable || item?.variant || {};
    const productId = lineItemable?.product_id || item?.product_id || item?.productId || lineItemable?.id || item?.id;
    if (!productId) return null;
    let variantId = null;
    if (lineItemable?.product_id && lineItemable?.id && String(lineItemable.id) !== String(lineItemable.product_id)) {
      variantId = lineItemable.id;
    } else if (item?.variant_id && String(item.variant_id) !== String(productId)) {
      variantId = item.variant_id;
    } else if (item?.variantId && String(item.variantId) !== String(productId)) {
      variantId = item.variantId;
    }
    const taxonId = lineItemable?.taxons?.[0]?.id || item?.taxon_id || item?.taxons?.[0]?.id;
    const params = new URLSearchParams();
    if (taxonId && taxonId !== "taxon") {
      params.set("taxonid", taxonId);
    }
    if (variantId) {
      params.set("variantId", variantId);
    }
    const qs = params.toString();
    return `/product/${productId}${qs ? `?${qs}` : ""}`;
  };
  return /* @__PURE__ */ jsxs("div", { className: "animate-in fade-in w-full pb-6 duration-300", children: [
    /* @__PURE__ */ jsxs("div", { className: "sticky top-0 z-10 mb-2 flex items-center gap-3 border-b border-gray-50/50 bg-white/95 py-2.5 backdrop-blur-md", children: [
      /* @__PURE__ */ jsx(
        StorefrontLink,
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
        const variantOptions = item.line_itemable?.variant_options || item.variant_options || [];
        const productUrl = getProductUrl(item);
        const ItemWrapper = productUrl ? StorefrontLink : "div";
        const wrapperProps = productUrl ? {
          href: productUrl,
          className: "flex gap-3 border-b border-gray-50 p-3 transition last:border-0 hover:bg-gray-50 group cursor-pointer"
        } : {
          className: "flex gap-3 border-b border-gray-50 p-3 transition last:border-0 hover:bg-gray-50"
        };
        return /* @__PURE__ */ jsxs(
          ItemWrapper,
          {
            ...wrapperProps,
            children: [
              /* @__PURE__ */ jsx("div", { className: "h-14 w-14 shrink-0 rounded-lg border border-gray-50 bg-[#F8F8F8] p-1 overflow-hidden", children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: item.image || "/NoProductImage.png",
                  alt: item.name || item.line_itemable?.name || "item",
                  className: "h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col justify-center gap-0.5 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                  /* @__PURE__ */ jsx("h3", { className: "line-clamp-1 text-[13px] font-[var(--font-semibold)] leading-snug text-[#1C1C1C] group-hover:text-[var(--core-primary)] transition-colors", children: item.name || item.line_itemable?.name }),
                  /* @__PURE__ */ jsx("span", { className: "text-[13px] font-[var(--font-bold)] text-[#1C1C1C] shrink-0", children: formatCurrency(amount) })
                ] }),
                variantOptions.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-1.5 text-[11px] text-[#777777] mt-0.5", children: variantOptions.map((vo, i) => /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: "inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 font-[var(--font-medium)] text-[#555555]",
                    children: [
                      vo?.option_type?.presentation || vo?.option_type?.name || "Option",
                      ":",
                      " ",
                      /* @__PURE__ */ jsx("span", { className: "ml-1 font-semibold text-[#1C1C1C]", children: vo?.option_value?.presentation || vo?.option_value?.name })
                    ]
                  },
                  i
                )) }),
                /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center justify-between mt-0.5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    unitValue && /* @__PURE__ */ jsx("span", { className: "text-[11px] font-[var(--font-medium)] text-[#888888]", children: unitValue }),
                    /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-[var(--font-medium)] text-[#888888]", children: [
                      "x ",
                      item.quantity || 1
                    ] })
                  ] }),
                  productUrl && /* @__PURE__ */ jsx("span", { className: "text-[11px] font-[var(--font-medium)] text-[var(--core-primary)] opacity-0 group-hover:opacity-100 transition-opacity", children: "View product \u2192" })
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
  renderProduct,
  router: overrideRouter,
  searchParams: overrideSearchParams,
  pathname: overridePathname
}) => {
  const sdkRouter = useStorefrontRouter(overrideRouter);
  const router = overrideRouter ?? sdkRouter;
  const searchParams = overrideSearchParams ?? sdkRouter.searchParams;
  const pathname = overridePathname ?? sdkRouter.pathname;
  const itemsPerPage = 12;
  const isServerPaginated = pagination && pagination.total_pages !== void 0;
  const getPageParam = () => {
    if (isServerPaginated) return pagination.current_page;
    if (searchParams?.get) {
      return parseInt(searchParams.get("page") || "1", 10);
    }
    if (typeof window !== "undefined") {
      return parseInt(
        new URLSearchParams(window.location.search).get("page") || "1",
        10
      );
    }
    return 1;
  };
  const currentPage = getPageParam();
  const totalPages = isServerPaginated ? pagination.total_pages : Math.ceil(products.length / itemsPerPage) || 1;
  const currentProducts = isServerPaginated ? products : products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (page) => {
    const rawSearch = searchParams?.toString?.() ?? (typeof window !== "undefined" ? window.location.search : "");
    const params = new URLSearchParams(rawSearch);
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
var AccountRewardsPage = ({
  router: overrideRouter,
  showBreadcrumb = true,
  className = ""
}) => {
  useStorefrontRouter(overrideRouter);
  const { cart, auth, toast } = useCore();
  const { formatCurrency } = useCurrencyFormat();
  const {
    customer,
    availablePoints,
    monetaryValue,
    pointsName,
    totalEarned,
    totalRedeemed,
    referralCode,
    referralLink,
    tier,
    transactions,
    transactionsTotalCount,
    transactionsPage,
    transactionsPerPage,
    isTransactionsLoading,
    refetchTransactions,
    isLoading,
    isApplying,
    applyPoints,
    copyReferralCode,
    copyReferralLink,
    shareWhatsApp
  } = useLoyalty();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [pointsToRedeemInput, setPointsToRedeemInput] = useState(100);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const conversionRate = useMemo(() => {
    if (availablePoints > 0 && monetaryValue > 0) {
      return monetaryValue / availablePoints;
    }
    return 0.1;
  }, [availablePoints, monetaryValue]);
  const displayPoints = availablePoints ?? 0;
  const displayMonetaryValue = monetaryValue ?? 0;
  const displayPointsName = pointsName || "Points";
  const displayTotalEarned = totalEarned ?? availablePoints ?? 0;
  const displayTotalRedeemed = totalRedeemed ?? 0;
  const displayReferralCode = referralCode || "";
  const displayReferralLink = referralLink || "";
  const handleCopyCode = async () => {
    const success = await copyReferralCode();
    if (success) {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2e3);
    }
  };
  const handleCopyLink = async () => {
    const success = await copyReferralLink();
    if (success) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2e3);
    }
  };
  const handleApplyCheckoutPoints = async () => {
    if (!cart?.id) {
      toast?.error?.("Please add items to your cart first.");
      return;
    }
    await applyPoints({ cart_id: cart.id, points_to_use: pointsToRedeemInput });
  };
  const formatTransactionDate = (dateStr) => {
    if (!dateStr) return "Today";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };
  const activityRows = useMemo(() => {
    if (transactions && transactions.length > 0) {
      return transactions.map((t) => {
        const isEarned = t.transaction_type === "earned";
        const isExpired = t.transaction_type === "expired";
        const isRedeemed = t.transaction_type === "redeemed";
        const delta = isEarned ? t.points : -t.points;
        const type = isExpired ? "expired" : isRedeemed ? "redeemed" : "earned";
        const title = t.metadata?.rule_name || (t.source_type === "purchase" ? "Purchase Reward" : "Loyalty Reward");
        const subtitle = t.source_id ? `Order #${t.source_id.slice(0, 8)} \u2022 ${t.metadata?.action_type || t.source_type}` : t.metadata?.action_type || "Standard Loyalty Transaction";
        const status = t.status === "completed" ? "Available" : t.status === "pending" ? "Pending" : "Available";
        return {
          id: t.id,
          title,
          subtitle,
          date: formatTransactionDate(t.created_at),
          delta,
          status,
          expiry: isEarned ? "Available" : void 0,
          type
        };
      });
    }
    return [];
  }, [transactions]);
  const filteredActivity = useMemo(() => {
    if (historyFilter === "all") return activityRows;
    return activityRows.filter((item) => item.type === historyFilter);
  }, [activityRows, historyFilter]);
  return /* @__PURE__ */ jsxs("div", { className: `w-full font-sans text-[#222222] ${className}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 border-b border-gray-200 pb-4 mb-6 md:flex-row md:items-center md:justify-between", children: [
      showBreadcrumb && /* @__PURE__ */ jsx("nav", { "aria-label": "Breadcrumb", className: "text-xs text-gray-500 font-medium", children: /* @__PURE__ */ jsxs("ol", { className: "flex items-center gap-1.5 flex-wrap", children: [
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(StorefrontLink, { href: "/", className: "hover:text-gray-900 transition-colors", children: "Home" }) }),
        /* @__PURE__ */ jsx("li", { children: "/" }),
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(StorefrontLink, { href: "/account", className: "hover:text-gray-900 transition-colors", children: "My Account" }) }),
        /* @__PURE__ */ jsx("li", { children: "/" }),
        /* @__PURE__ */ jsx("li", { className: "font-semibold text-gray-900", children: "Loyalty & Rewards" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]", children: [
        { key: "dashboard", label: "Dashboard" },
        { key: "history", label: "Points Activity & History" },
        { key: "redeem", label: "Redeem at Checkout" }
      ].map((tab) => {
        const isActive = activeTab === tab.key;
        return /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setActiveTab(tab.key),
            className: `whitespace-nowrap px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${isActive ? "bg-[#E65100] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900"}`,
            children: tab.label
          },
          tab.key
        );
      }) })
    ] }),
    activeTab === "dashboard" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "relative rounded-2xl border border-orange-200/80 bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 p-6 md:p-8 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-gray-500", children: "SBS Rewards Balance" }),
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-emerald-700 border border-emerald-200", children: [
              /* @__PURE__ */ jsx(AccountAwardIcon, { className: "h-3 w-3" }),
              "TIER: ",
              tier
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-2.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900", children: displayPoints.toLocaleString() }),
            /* @__PURE__ */ jsx("span", { className: "text-xl md:text-2xl font-bold uppercase tracking-wide text-[#E65100]", children: displayPointsName })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 flex items-center gap-1.5 text-xs text-gray-600 font-medium", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[#E65100]", children: "\u272A" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Worth",
              " ",
              /* @__PURE__ */ jsx("strong", { className: "text-gray-900", children: formatCurrency(displayMonetaryValue) }),
              " ",
              "off eligible orders (100 pts = ",
              formatCurrency(100 * conversionRate),
              ")"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setActiveTab("redeem"),
              className: "inline-flex items-center gap-2 rounded-lg bg-[#E65100] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#cf4800] transition-colors cursor-pointer",
              children: [
                /* @__PURE__ */ jsx(AccountShoppingBagIcon, { className: "h-4 w-4" }),
                "Shop & Redeem Points"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setActiveTab("history"),
              className: "inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer",
              children: "View Full History"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setIsReferralModalOpen(true),
              className: "inline-flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50/50 px-4 py-2.5 text-xs font-semibold text-[#E65100] hover:bg-orange-100/50 transition-colors cursor-pointer",
              children: [
                /* @__PURE__ */ jsx(AccountGiftIcon, { className: "h-4 w-4" }),
                "Refer a Friend"
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-4 shadow-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-gray-500", children: "Available to Redeem" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xl sm:text-2xl font-bold text-gray-900", children: [
            displayPoints.toLocaleString(),
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-gray-500", children: "pts" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs font-semibold text-emerald-600", children: [
            formatCurrency(displayMonetaryValue),
            " cash value"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-4 shadow-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-gray-500", children: "Total Earned to Date" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xl sm:text-2xl font-bold text-gray-900", children: [
            displayTotalEarned.toLocaleString(),
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-gray-500", children: "pts" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Lifetime earned" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-4 shadow-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-gray-500", children: "Total Redeemed" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xl sm:text-2xl font-bold text-gray-900", children: [
            displayTotalRedeemed.toLocaleString(),
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-gray-500", children: "pts" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs font-semibold text-emerald-600", children: [
            formatCurrency(displayTotalRedeemed * conversionRate),
            " saved"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-4 shadow-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-gray-500", children: "Pending Qualification" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xl sm:text-2xl font-bold text-gray-900", children: [
            customer?.pending_points ?? 0,
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-gray-500", children: "pts" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: customer?.pending_points ? "Pending qualification" : "No points in transit" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-5 shadow-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-gray-900", children: "Recent Loyalty Activity" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Last 5 ledger transactions and their validity" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-gray-500", children: "Ledger Currency: SBS Points" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[10px]", children: [
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Activity / Reference" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Date" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Points Delta" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Status / Expiry" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100", children: activityRows.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "py-8 text-center text-xs text-gray-500", children: "No loyalty transactions recorded yet." }) }) : activityRows.slice(0, 5).map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50/70 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${row.delta > 0 ? "bg-emerald-50 text-emerald-600" : row.type === "expired" ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-600"}`,
                  children: row.delta > 0 ? "+" : row.type === "expired" ? "\u27F3" : "\u2212"
                }
              ),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900", children: row.title }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-500", children: row.subtitle })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-3 text-gray-600 whitespace-nowrap", children: row.date }),
            /* @__PURE__ */ jsxs(
              "td",
              {
                className: `py-3 px-3 text-right font-bold whitespace-nowrap ${row.delta > 0 ? "text-emerald-600" : "text-red-600"}`,
                children: [
                  row.delta > 0 ? `+${row.delta}` : row.delta,
                  " Pts"
                ]
              }
            ),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-3 text-right whitespace-nowrap", children: /* @__PURE__ */ jsxs(
              "span",
              {
                className: `inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${row.status === "Available" ? "bg-emerald-50 text-emerald-700" : row.status === "Redeemed" ? "bg-gray-100 text-gray-600" : "bg-red-50 text-red-700"}`,
                children: [
                  row.status,
                  " ",
                  row.expiry ? `(${row.expiry})` : ""
                ]
              }
            ) })
          ] }, row.id)) })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 border-t border-gray-100 pt-3 text-center", children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setActiveTab("history"),
            className: "text-xs font-semibold text-[#E65100] hover:underline cursor-pointer",
            children: [
              "View All ",
              transactionsTotalCount > 0 ? `${transactionsTotalCount} ` : "",
              "Transactions \u2192"
            ]
          }
        ) })
      ] })
    ] }),
    activeTab === "history" && /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-6 shadow-xs", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-gray-900", children: "Points Activity Ledger" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Complete transaction history and validity status" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: ["all", "earned", "redeemed", "expired"].map((filter2) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setHistoryFilter(filter2),
            className: `rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${historyFilter === filter2 ? "bg-[#E65100] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
            children: filter2
          },
          filter2
        )) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[10px]", children: [
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Activity / Reference" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3", children: "Date" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Points Delta" }),
          /* @__PURE__ */ jsx("th", { className: "py-2.5 px-3 text-right", children: "Status / Expiry" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100", children: filteredActivity.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "py-8 text-center text-xs text-gray-500", children: "No transactions found for this filter." }) }) : filteredActivity.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50/70 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "py-3 px-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${row.delta > 0 ? "bg-emerald-50 text-emerald-600" : row.type === "expired" ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-600"}`,
                children: row.delta > 0 ? "+" : row.type === "expired" ? "\u27F3" : "\u2212"
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900", children: row.title }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-500", children: row.subtitle })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-3 text-gray-600 whitespace-nowrap", children: row.date }),
          /* @__PURE__ */ jsxs(
            "td",
            {
              className: `py-3 px-3 text-right font-bold whitespace-nowrap ${row.delta > 0 ? "text-emerald-600" : "text-red-600"}`,
              children: [
                row.delta > 0 ? `+${row.delta}` : row.delta,
                " Pts"
              ]
            }
          ),
          /* @__PURE__ */ jsx("td", { className: "py-3 px-3 text-right whitespace-nowrap", children: /* @__PURE__ */ jsxs(
            "span",
            {
              className: `inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${row.status === "Available" ? "bg-emerald-50 text-emerald-700" : row.status === "Redeemed" ? "bg-gray-100 text-gray-600" : "bg-red-50 text-red-700"}`,
              children: [
                row.status,
                " ",
                row.expiry ? `(${row.expiry})` : ""
              ]
            }
          ) })
        ] }, row.id)) })
      ] }) }),
      transactionsTotalCount > transactionsPerPage && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "Showing ",
          Math.min(filteredActivity.length, transactionsPerPage),
          " of",
          " ",
          transactionsTotalCount,
          " transactions"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => refetchTransactions({
                page: Math.max(1, transactionsPage - 1),
                per_page: transactionsPerPage
              }),
              disabled: transactionsPage <= 1 || isTransactionsLoading,
              className: "rounded border border-gray-300 px-2.5 py-1 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 cursor-pointer",
              children: "Previous"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-gray-700", children: [
            "Page ",
            transactionsPage,
            " of",
            " ",
            Math.ceil(transactionsTotalCount / transactionsPerPage) || 1
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => refetchTransactions({
                page: transactionsPage + 1,
                per_page: transactionsPerPage
              }),
              disabled: transactionsPage >= Math.ceil(transactionsTotalCount / transactionsPerPage) || isTransactionsLoading,
              className: "rounded border border-gray-300 px-2.5 py-1 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 cursor-pointer",
              children: "Next"
            }
          )
        ] })
      ] })
    ] }) }),
    activeTab === "redeem" && /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 bg-white p-6 shadow-xs max-w-2xl mx-auto w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-gray-100 pb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-orange-100 p-2 text-[#E65100]", children: /* @__PURE__ */ jsx(AccountShoppingBagIcon, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-gray-900", children: "Redeem Points on Active Cart" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
            "Available: ",
            /* @__PURE__ */ jsxs("strong", { children: [
              displayPoints.toLocaleString(),
              " Points"
            ] }),
            " (Worth",
            " ",
            /* @__PURE__ */ jsx("strong", { children: formatCurrency(displayMonetaryValue) }),
            ")"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-4", children: [
        cart?.id ? /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-50 p-4 border border-gray-200 text-xs", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-gray-700 mb-1", children: [
            /* @__PURE__ */ jsx("span", { children: "Active Cart:" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-gray-900", children: cart.id })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-gray-700", children: [
            /* @__PURE__ */ jsx("span", { children: "Items in Cart:" }),
            /* @__PURE__ */ jsxs("span", { className: "font-semibold text-gray-900", children: [
              cart.item_count ?? cart.line_items?.length ?? 1,
              " item(s)"
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-amber-50 p-4 border border-amber-200 text-xs text-amber-800", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "No active cart found" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1", children: "Add fabrics to your cart to apply points directly during checkout. You can also test the points application simulator below." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-gray-700", children: "Points to Use (Minimum: 100 pts)" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: pointsToRedeemInput,
                onChange: (e) => setPointsToRedeemInput(Number(e.target.value)),
                max: displayPoints,
                min: 100,
                step: 50,
                className: "flex-1 rounded-lg border border-gray-300 p-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-[#E65100]"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setPointsToRedeemInput(displayPoints),
                className: "rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer",
                children: "Use Max"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 pt-1", children: [100, 250, 500, 1e3].map((preset) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setPointsToRedeemInput(preset),
            className: "rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-[#E65100] transition-colors cursor-pointer",
            children: [
              preset,
              " Pts (",
              formatCurrency(preset * conversionRate),
              ")"
            ]
          },
          preset
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between font-bold text-sm", children: [
            /* @__PURE__ */ jsx("span", { children: "Estimated Savings:" }),
            /* @__PURE__ */ jsxs("span", { className: "text-emerald-700", children: [
              "-",
              formatCurrency(pointsToRedeemInput * conversionRate)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[11px] text-emerald-600", children: [
            "Remaining balance after redemption:",
            " ",
            /* @__PURE__ */ jsxs("strong", { children: [
              Math.max(0, displayPoints - pointsToRedeemInput).toLocaleString(),
              " Points"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleApplyCheckoutPoints,
            disabled: isApplying || pointsToRedeemInput <= 0,
            className: "w-full rounded-lg bg-[#E65100] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#cf4800] transition-colors disabled:opacity-60 cursor-pointer",
            children: isApplying ? "Applying Points..." : `Apply ${pointsToRedeemInput} Points to Cart`
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-12 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-6 pb-2 text-[11px] text-gray-500 sm:flex-row", children: [
      /* @__PURE__ */ jsx("p", { children: "SBS Textiles \u2022 Pure Linens, Cottons & Fine Suiting Since 1994" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(StorefrontLink, { href: "/terms", className: "hover:text-gray-900 transition-colors", children: "Terms of Loyalty Program" }),
        /* @__PURE__ */ jsx(StorefrontLink, { href: "/policy", className: "hover:text-gray-900 transition-colors", children: "Points Expiry Policy" }),
        /* @__PURE__ */ jsx(StorefrontLink, { href: "/contact", className: "hover:text-gray-900 transition-colors", children: "Customer Support" })
      ] })
    ] }),
    isReferralModalOpen && /* @__PURE__ */ jsx(
      Popup,
      {
        isOpen: isReferralModalOpen,
        onClose: () => setIsReferralModalOpen(false),
        title: "Refer Friends & Earn 500 SBS Points",
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-2", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-600 leading-relaxed", children: [
            "Give your friends ",
            /* @__PURE__ */ jsx("strong", { children: "\u20B9200 off" }),
            " on their first fabric purchase of \u20B91,000+. When they complete their order, you automatically get ",
            /* @__PURE__ */ jsx("strong", { children: "500 SBS Points" }),
            " added to your account!"
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-bold uppercase tracking-wider text-gray-500", children: "Your Referral Code" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-2.5", children: [
              /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-bold tracking-wider text-gray-900", children: displayReferralCode }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: handleCopyCode,
                  className: "inline-flex items-center gap-1.5 rounded bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer",
                  children: codeCopied ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(AccountCheckIcon, { className: "h-3.5 w-3.5 text-emerald-600" }),
                    /* @__PURE__ */ jsx("span", { className: "text-emerald-600", children: "Copied" })
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(AccountCopyIcon, { className: "h-3.5 w-3.5" }),
                    /* @__PURE__ */ jsx("span", { children: "Copy" })
                  ] })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-bold uppercase tracking-wider text-gray-500", children: "Your Referral Link" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-2.5", children: [
              /* @__PURE__ */ jsx("span", { className: "truncate pr-2 font-mono text-xs text-gray-700", children: displayReferralLink }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: handleCopyLink,
                  className: "inline-flex shrink-0 items-center gap-1.5 rounded bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer",
                  children: linkCopied ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(AccountCheckIcon, { className: "h-3.5 w-3.5 text-emerald-600" }),
                    /* @__PURE__ */ jsx("span", { className: "text-emerald-600", children: "Copied" })
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(AccountCopyIcon, { className: "h-3.5 w-3.5" }),
                    /* @__PURE__ */ jsx("span", { children: "Copy" })
                  ] })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => shareWhatsApp(),
              className: "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#20ba59] transition-colors cursor-pointer",
              children: "Share on WhatsApp"
            }
          )
        ] })
      }
    )
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
  const router = useStorefrontRouter(props?.router);
  const id = props?.orderId ?? props?.id ?? props?.params?.orderid ?? (typeof window !== "undefined" ? window.location.pathname.split("/").filter(Boolean).pop() : null);
  const show = props?.show !== void 0 ? Boolean(props.show) : typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("show") === "true" : false;
  const { formatCurrency } = useCurrencyFormat();
  const { actions, config, orgData, toast = fallbackToast } = useCore();
  const orgDetail = orgData;
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
      /* @__PURE__ */ jsxs("div", { className: "border border-[#e8e5df] rounded-lg p-6 bg-white flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest block mb-1", children: "Order Reference" }),
            /* @__PURE__ */ jsxs("h2", { className: "font-[var(--font-bold)] text-[22px] text-[var(--core-primary)]", children: [
              "#",
              order_number || id
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-1.5", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "inline-flex items-center px-3 py-1 rounded-full text-[12px] font-[var(--font-bold)] uppercase tracking-wider",
                style: {
                  background: "color-mix(in srgb, var(--core-primary) 10%, white)",
                  color: "var(--core-primary)"
                },
                children: order_status || state || "Placed"
              }
            ),
            /* @__PURE__ */ jsxs(
              "span",
              {
                className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-[var(--font-medium)] uppercase tracking-wider ${payment_state === "paid" || payment_status === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`,
                children: [
                  "Payment: ",
                  payment_state || payment_status || "Pending"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 border-t border-[#e8e5df] pt-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest block", children: "Placed On" }),
            /* @__PURE__ */ jsx("span", { className: "font-[var(--font-medium)] text-[14px] text-[var(--core-primary)]", children: orderDate })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest block", children: "Fulfillment" }),
            /* @__PURE__ */ jsx("span", { className: "font-[var(--font-medium)] text-[14px] text-[var(--core-primary)] capitalize", children: order_type || "Delivery" })
          ] })
        ] }),
        actions?.getOrderInvoice && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onDownloadReceipt,
            disabled: isFetchingInvoice,
            className: "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded border border-[#e8e5df] hover:border-[var(--core-primary)] text-[var(--core-primary)] font-[var(--font-bold)] text-[13px] uppercase tracking-wider transition-all disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsx(DownloadIcon, {}),
              isFetchingInvoice ? "Downloading..." : "Download Invoice"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border border-[#e8e5df] rounded-lg p-6 bg-white", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-[var(--font-bold)] text-[16px] text-[var(--core-primary)] uppercase tracking-wider mb-4", children: order_type === "pickup" ? "Pickup Location" : "Address Details" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: order_type === "pickup" ? /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest block mb-1", children: "Store Pickup Address" }),
          /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[14px] text-gray-700 leading-relaxed", children: storePickUpAddress || "Contact store for pickup details." })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest block mb-1", children: "Shipping Address" }),
            /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[14px] text-gray-700 leading-relaxed", children: fullShippingAddress || "No shipping address provided." })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest block mb-1", children: "Billing Address" }),
            /* @__PURE__ */ jsx("p", { className: "font-[var(--font-regular)] text-[14px] text-gray-700 leading-relaxed", children: fullBillingAddress || fullShippingAddress || "Same as shipping." })
          ] })
        ] }) })
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
        /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4", children: line_items?.map((item, idx) => /* @__PURE__ */ jsx(
          ProductlistCard_default,
          {
            product: item,
            orderType: order_type,
            component: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs("span", { className: "text-[13px] font-[var(--font-medium)] text-[var(--core-primary)] border border-gray-200 rounded px-2 py-0.5 bg-gray-50", children: [
              "Qty: ",
              item.quantity
            ] }) })
          },
          item.id || idx
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border border-[#e8e5df] rounded-lg p-6 bg-white", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-[var(--font-bold)] text-[16px] text-[var(--core-primary)] uppercase tracking-wider mb-4", children: "Bill Summary" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-[14px]", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 font-[var(--font-regular)]", children: "Item Total" }),
            /* @__PURE__ */ jsx("span", { className: "font-[var(--font-medium)] text-[var(--core-primary)]", children: formatCurrency(display_item_total) })
          ] }),
          totalSavings > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-[14px] text-[#16a34a]", children: [
            /* @__PURE__ */ jsx("span", { className: "font-[var(--font-regular)]", children: "Discount" }),
            /* @__PURE__ */ jsxs("span", { className: "font-[var(--font-medium)]", children: [
              "-",
              formatCurrency(totalSavings)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-[14px]", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 font-[var(--font-regular)]", children: "Delivery / Shipping" }),
            /* @__PURE__ */ jsx("span", { className: "font-[var(--font-medium)] text-[var(--core-primary)]", children: display_ship_total || "Free" })
          ] }),
          display_tax_total && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-[14px]", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 font-[var(--font-regular)]", children: "Taxes" }),
            /* @__PURE__ */ jsx("span", { className: "font-[var(--font-medium)] text-[var(--core-primary)]", children: formatCurrency(display_tax_total) })
          ] }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "border-t my-1",
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
      ] })
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

// src/types/errors.ts
var StorefrontError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "StorefrontError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var StorefrontApiError = class extends StorefrontError {
  constructor(message, status, endpoint, data) {
    super(message);
    __publicField(this, "status");
    __publicField(this, "endpoint");
    __publicField(this, "data");
    this.name = "StorefrontApiError";
    this.status = status;
    this.endpoint = endpoint;
    this.data = data;
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var StorefrontAuthError = class extends StorefrontError {
  constructor(message = "Unauthorized: A valid auth token is required for this operation.") {
    super(message);
    this.name = "StorefrontAuthError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};

export { AccountAddressesPage, AccountAwardIcon, AccountClockIcon, AccountGiftIcon, AccountLayout, AccountOrderDetailContent, AccountOrdersPage, AccountPage, AccountRewardsPage, AccountSidebar, AccountSparklesIcon, AccountStarIcon, AccountWishlistPage, AddressCard2 as AddressCard, AddressForm, AuthManager, CartDrawer, CartItem, CartMismatchBanner_default as CartMismatchBanner, CartPage, CartSummary, ClerkStoreProvider, CoreProvider, CouponSection_default as CouponSection, CustomOTPAuth, DEFAULT_NAV_ITEMS as DEFAULT_ACCOUNT_NAV_ITEMS, DeveloperErrorBoundary, EmptyState, FastCheckoutDrawer, Order, OrdersList, Popup, ProfileForm, Spinner, StorefrontApiError, StorefrontAuthError, StorefrontError, ThirdPartyScripts, UserInfo, ViewCart, injectContentSquare, injectHotjar, invalidateLikedProductsCache, isTokenExpired, nameToSlug, useAddToCart, useAddresses, useAuth, useCart, useCartDrawer, userCartInfo_default as useCartInfo, useClerkStoreAuth, useCore, useCurrencyFormat, useGetCurrentUserLikedProductsQuery, useLogout, useLoyalty, useOtpStoreAuth, usePaymentGateway, useVariantSelection };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map