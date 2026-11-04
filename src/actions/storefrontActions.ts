/**
 * storefrontActions.ts — @defx/storefront-core
 *
 * Plain async fetch helpers for the Defx storefront API.
 * NOTE: No "use server" directive — this file is bundled by tsup (esbuild)
 * and "use server" is a Next.js-only directive that breaks package builds.
 * These functions work correctly when called from Next.js server actions
 * or server components in the host app.
 */

import type { RequestOptions } from "../types/actions";
import {
  API_VERSION_ACCEPT,
  getApiBaseUrl,
  getOrganizationId,
  getServerToken,
  buildHeaders,
  readError,
  wrapJsonResponse,
  requestJson,
  requestJsonFromResponse,
  buildQueryString,
  configureStorefront,
  getStorefrontGlobalConfig,
  getEnv,
  revalidateCacheTag,
} from "../utils/request";

export {
  configureStorefront,
  getStorefrontGlobalConfig,
  getApiBaseUrl,
  getOrganizationId,
  getServerToken,
  buildHeaders,
  getEnv,
  revalidateCacheTag,
};
export type { RequestOptions };

const buildCachedFetchConfig = async (
  defaultTags: string[] = [],
  defaultTtl: number = 86400,
  options: RequestOptions = {},
): Promise<any> => {
  const headers = await buildHeaders(options);
  const shouldBypassCache =
    options.cache === "no-store" ||
    options.revalidation === true ||
    options.forceRevalidate === true ||
    options.revalidate === 0;

  if (typeof window === "undefined" && !shouldBypassCache) {
    const tags = Array.isArray(options.tags)
      ? [...defaultTags, ...options.tags]
      : defaultTags;
    const revalidate =
      typeof options.revalidate === "number" ? options.revalidate : defaultTtl;
    return {
      method: "GET",
      headers,
      next: { tags, revalidate },
    };
  }

  return {
    method: "GET",
    headers,
    cache: options.cache || "no-store",
  };
};

// ─── Cart ────────────────────────────────────────────────────────────────────

export const createCartAction = async (body: Record<string, unknown> = {}, options: RequestOptions = {}): Promise<any> => {
  const res = await fetch(`${getApiBaseUrl(options)}/api/carts`, {
    method: "POST",
    headers: await buildHeaders(options),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return requestJsonFromResponse(res, "Failed to create cart");
};

export const getCartAction = async (regionId: string | null = null, options: RequestOptions = {}): Promise<any> => {
  const token = await getServerToken(options?.token);
  if (!token) return [];

  const url = new URL(`${getApiBaseUrl(options)}/api/carts`);
  if (regionId) url.searchParams.set("region_id", regionId);

  return requestJson(
    url.toString(),
    {
      method: "GET",
      headers: await buildHeaders({ ...options, token }),
      cache: "no-store",
    },
    "Failed to get cart",
  );
};

export const getCartByIdAction = async (cartId: string, regionId: string | null, options: RequestOptions = {}): Promise<any> => {
  if (!cartId) return null;

  const url = new URL(`${getApiBaseUrl(options)}/api/carts/${cartId}`);
  if (regionId) url.searchParams.set("region_id", regionId);

  const resolvedOptions = {
    ...options,
    token: options.token ?? null,
  };

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: await buildHeaders(resolvedOptions),
    cache: "no-store",
  });

  if (res.status === 404) return null;
  return requestJsonFromResponse(res, "Failed to get cart");
};

export const updateCartAction = async (cartId: string, payload: Record<string, unknown>, options: RequestOptions = {}): Promise<any> =>
  requestJson(
    `${getApiBaseUrl(options)}/api/carts/${cartId}`,
    {
      method: "PUT",
      headers: await buildHeaders(options),
      body: JSON.stringify(payload),
      cache: "no-store",
    },
    "Failed to update cart",
  );

export const updateCartIdLineItemsAction = async (payload: Record<string, unknown>, options: RequestOptions = {}): Promise<any> =>
  requestJson(
    `${getApiBaseUrl(options)}/api/update_cart_id_line_items`,
    {
      method: "PUT",
      headers: await buildHeaders(options),
      body: JSON.stringify(payload),
      cache: "no-store",
    },
    "Failed to update cart line items",
  );

// ─── Line Items ───────────────────────────────────────────────────────────────

export const createLineItemAction = async (body: Record<string, unknown> = {}, options: RequestOptions = {}): Promise<any> =>
  requestJson(
    `${getApiBaseUrl(options)}/api/line_items`,
    {
      method: "POST",
      headers: await buildHeaders(options),
      body: JSON.stringify(body),
      cache: "no-store",
    },
    "Failed to create line item",
  );

export const updateLineItemAction = async (lineItemId: string | number, body: Record<string, unknown>, options: RequestOptions = {}): Promise<any> =>
  requestJson(
    `${getApiBaseUrl(options)}/api/line_items/${lineItemId}`,
    {
      method: "PUT",
      headers: await buildHeaders(options),
      body: JSON.stringify(body),
      cache: "no-store",
    },
    "Failed to update line item",
  );

export const deleteLineItemAction = async (lineItemId: string | number, options: RequestOptions = {}): Promise<any> =>
  requestJson(
    `${getApiBaseUrl(options)}/api/line_items/${lineItemId}`,
    {
      method: "DELETE",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to delete line item",
  );

// ─── Payments ─────────────────────────────────────────────────────────────────

export const createRazorpayOrderAction = async (cartId: string, options: RequestOptions = {}): Promise<any> =>
  requestJson(
    `${getApiBaseUrl(options)}/api/cart_payments`,
    {
      method: "POST",
      headers: await buildHeaders({ ...options, requireAuth: true }),
      body: JSON.stringify({ cart_id: cartId }),
      cache: "no-store",
    },
    "Failed to create Razorpay order",
  );

export const updateRazorpayPaymentAction = async (
  paymentId: string | number,
  razorpayPaymentId: string,
  options: RequestOptions = {},
): Promise<any> =>
  requestJson(
    `${getApiBaseUrl(options)}/api/cart_payments/${paymentId}`,
    {
      method: "PUT",
      headers: await buildHeaders({ ...options, requireAuth: true }),
      body: JSON.stringify({ razor_payment_id: razorpayPaymentId }),
      cache: "no-store",
    },
    "Failed to update Razorpay payment id",
  );

// Generic cart payment creation action (POST /api/cart_payments)
export const createCartPaymentAction = async (cartId: string, options: RequestOptions = {}): Promise<any> =>
  requestJson(
    `${getApiBaseUrl(options)}/api/cart_payments`,
    {
      method: "POST",
      headers: await buildHeaders({ ...options, requireAuth: true }),
      body: JSON.stringify({ cart_id: cartId }),
      cache: "no-store",
    },
    "Failed to create cart payment",
  );

// PhonePe alias for initiating payment via /api/cart_payments
export const createPhonePeOrderAction = async (cartId: string, options: RequestOptions = {}): Promise<any> =>
  createCartPaymentAction(cartId, options);

// Generic cart payment update action (PUT /api/cart_payments/:payment_id)
export const updateCartPaymentAction = async (
  paymentId: string | number,
  data: Record<string, unknown> = {},
  options: RequestOptions = {},
): Promise<any> =>
  requestJson(
    `${getApiBaseUrl(options)}/api/cart_payments/${paymentId}`,
    {
      method: "PUT",
      headers: await buildHeaders({ ...options, requireAuth: true }),
      body: JSON.stringify(data),
      cache: "no-store",
    },
    "Failed to update cart payment",
  );

// PhonePe payment update action (PUT /api/cart_payments/:payment_id)
export const updatePhonePePaymentAction = async (
  paymentId: string | number,
  phonepeData: Record<string, unknown> | string = {},
  options: RequestOptions = {},
): Promise<any> => {
  const body =
    typeof phonepeData === "string"
      ? { transaction_id: phonepeData, phonepe_payment_id: phonepeData }
      : phonepeData;
  return updateCartPaymentAction(paymentId, body, options);
};

// Stripe payment intent action (POST /api/stripe_create_payment_intent)
export const createStripePaymentIntentAction = async (
  cartId: string | number,
  options: RequestOptions = {},
): Promise<any> =>
  requestJson(
    `${getApiBaseUrl(options)}/api/stripe_create_payment_intent`,
    {
      method: "POST",
      headers: await buildHeaders({ ...options, requireAuth: false }),
      body: JSON.stringify({ cart_id: cartId }),
      cache: "no-store",
    },
    "Failed to create Stripe payment intent",
  );

// ─── Addresses ────────────────────────────────────────────────────────────────

export const getAddressesAction = async (options: RequestOptions = {}): Promise<any> => {
  const token = await getServerToken(options?.token);
  if (!token) return { data: [] };

  const url = `${getApiBaseUrl(options)}/api/addresses`;
  const fetchConfig = await buildCachedFetchConfig(
    ["addresses"],
    86400,
    { ...options, token },
  );

  return requestJson(url, fetchConfig, "Failed to fetch addresses");
};

export const createAddressAction = async (addressData: Record<string, unknown>, options: RequestOptions = {}): Promise<any> => {
  const token = await getServerToken(options?.token);
  if (!token) throw new Error("Unauthorized");

  const body = (addressData?.address as Record<string, unknown>) ? addressData : { address: addressData };

  const res = await requestJson(
    `${getApiBaseUrl(options)}/api/addresses`,
    {
      method: "POST",
      headers: await buildHeaders({ ...options, token, requireAuth: true }),
      body: JSON.stringify(body),
      cache: "no-store",
    },
    "Failed to create address",
  );

  await revalidateCacheTag("addresses", options);

  return res;
};

export const updateAddressAction = async (
  addressId: string | number,
  addressData: Record<string, unknown>,
  options: RequestOptions = {},
): Promise<any> => {
  const token = await getServerToken(options?.token);
  if (!token) throw new Error("Unauthorized");

  const body = (addressData?.address as Record<string, unknown>) ? addressData : { address: addressData };

  const res = await requestJson(
    `${getApiBaseUrl(options)}/api/addresses/${addressId}`,
    {
      method: "PUT",
      headers: await buildHeaders({ ...options, token, requireAuth: true }),
      body: JSON.stringify(body),
      cache: "no-store",
    },
    "Failed to update address",
  );

  await revalidateCacheTag("addresses", options);

  return res;
};

export const deleteAddressAction = async (addressId: string | number, options: RequestOptions = {}): Promise<any> => {
  const token = await getServerToken(options?.token);
  if (!token) throw new Error("Unauthorized");

  const res = await requestJson(
    `${getApiBaseUrl(options)}/api/addresses/${addressId}`,
    {
      method: "DELETE",
      headers: await buildHeaders({ ...options, token, requireAuth: true }),
      cache: "no-store",
    },
    "Failed to delete address",
  );

  await revalidateCacheTag("addresses", options);

  return res;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginUser = async (data: Record<string, unknown> = {}, options: RequestOptions = {}): Promise<any> => {
  const isClerk = Boolean(data?.clerk_id);
  const payload = isClerk
    ? {
        clerk_id: data.clerk_id,
        first_name: data.first_name ?? data.firstName,
        last_name: data.last_name ?? data.lastName,
        email: data.email,
        organization_id: getOrganizationId(options),
      }
    : {
        phone: data?.phone ?? data,
        country_code: data?.country_code ?? data?.countryCode ?? "+91",
        organization_id: getOrganizationId(options),
      };

  return requestJson(
    `${getApiBaseUrl(options)}/api/login`,
    {
      method: "POST",
      headers: await buildHeaders(options),
      body: JSON.stringify(payload),
      cache: "no-store",
    },
    isClerk ? "Failed to authenticate with Clerk" : "Failed to send OTP",
  );
};

export const signUpUser = async (data: Record<string, unknown> | FormData = {}, options: RequestOptions = {}): Promise<any> => {
  const formData = data instanceof FormData ? data : new FormData();

  if (!(data instanceof FormData)) {
    formData.append("user[first_name]", (data?.firstName as string) ?? "");
    formData.append("user[last_name]", (data?.lastName as string) ?? "");
    formData.append("user[phone]", (data?.phone as string) ?? "");
    formData.append("user[country_code]", (data?.countryCode as string) ?? "+91");
  }

  return requestJson(
    `${getApiBaseUrl(options)}/api/users`,
    {
      method: "POST",
      headers: await buildHeaders({ ...options, json: false }),
      body: formData,
      cache: "no-store",
    },
    "Failed to sign up",
  );
};

export const verifyOtp = async (data: Record<string, unknown> = {}, options: RequestOptions = {}): Promise<any> => {
  const result = await requestJson(
    `${getApiBaseUrl(options)}/api/verify`,
    {
      method: "POST",
      headers: await buildHeaders(options),
      body: JSON.stringify(data),
      cache: "no-store",
    },
    "Invalid OTP",
  );

  const token = result?.token ?? result?.access_token;
  if (!token || result?.serverError) return result;

  const user = await getUserAction({ ...options, token });
  return { ...result, user };
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUserAction = async (options: RequestOptions = {}): Promise<any> => {
  const token = await getServerToken(options.token);
  if (!token) return null;

  return requestJson(
    `${getApiBaseUrl(options)}/api/users`,
    {
      method: "GET",
      headers: await buildHeaders({ ...options, token }),
      cache: "no-store",
    },
    "Failed to get user",
  );
};

export const updateUserAction = async (userId: string | number, userData: Record<string, unknown>, options: RequestOptions = {}): Promise<any> =>
  requestJson(
    `${getApiBaseUrl(options)}/api/users/${userId}`,
    {
      method: "PUT",
      headers: await buildHeaders({ ...options, requireAuth: true }),
      body: JSON.stringify(userData),
      cache: "no-store",
    },
    "Failed to update user",
  );

// ─── Orders ───────────────────────────────────────────────────────────────────

export const getOrdersAction = async (regionId: string | null, page: number = 1, options: RequestOptions = {}): Promise<any> => {
  const url = new URL(`${getApiBaseUrl(options)}/api/get_current_user_orders`);
  if (regionId) url.searchParams.set("region_id", regionId);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("per_page", "10");

  return requestJson(
    url.toString(),
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to get orders",
  );
};

export const getOrderByIdAction = async (orderId: string | number, options: RequestOptions = {}): Promise<any> =>
  requestJson(
    `${getApiBaseUrl(options)}/api/orders/${orderId}`,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to get order",
  );

export const getOrderInvoiceAction = async (orderId: string | number, options: RequestOptions = {}): Promise<any> => {
  const res = await fetch(
    `${getApiBaseUrl(options)}/api/generate_invoice_pdf/${orderId}`,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
  );

  if (!res.ok)
    return { serverError: await readError(res, "Failed to get order invoice") };
  return res.text();
};

// ─── Discounts ────────────────────────────────────────────────────────────────

export const getAvailableDiscountsAction = async (params: RequestOptions & { cart_id?: string; region_id?: string } = {}): Promise<any> => {
  const url = new URL(`${getApiBaseUrl(params)}/api/discounts/available`);
  if (params.cart_id) url.searchParams.set("cart_id", params.cart_id);
  if (params.region_id) url.searchParams.set("region_id", params.region_id);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: await buildHeaders(params),
    cache: "no-store",
  });

  return wrapJsonResponse(res, "Failed to fetch available discounts");
};

export const applyDiscountAction = async (params: RequestOptions & { source?: string; region_id?: string; code?: string; discount_id?: string | number } = {}): Promise<any> => {
  const payload = {
    source: params.source || "web",
    ...(params.region_id ? { region_id: params.region_id } : {}),
    ...(params.code ? { code: params.code } : {}),
    ...(params.discount_id ? { discount_id: params.discount_id } : {}),
  };

  const res = await fetch(`${getApiBaseUrl(params)}/api/discounts/apply`, {
    method: "POST",
    headers: await buildHeaders(params),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return wrapJsonResponse(res, "Failed to apply discount");
};

export const removeDiscountAction = async (params: RequestOptions & { discount_id?: string | number; region_id?: string } = {}): Promise<any> => {
  const url = new URL(`${getApiBaseUrl(params)}/api/discounts/remove`);
  if (params.discount_id)
    url.searchParams.set("discount_id", String(params.discount_id));
  if (params.region_id) url.searchParams.set("region_id", params.region_id);

  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: await buildHeaders(params),
    cache: "no-store",
  });

  return wrapJsonResponse(res, "Failed to remove discount");
};

export const trackDiscountEventAction = async (params: RequestOptions & { discount_id?: string | number; event_type?: string; source?: string; region_id?: string } = {}): Promise<any> => {
  const res = await fetch(
    `${getApiBaseUrl(params)}/api/discounts/track_event`,
    {
      method: "POST",
      headers: await buildHeaders(params),
      body: JSON.stringify({
        discount_id: params.discount_id,
        event_type: params.event_type,
        source: params.source,
        region_id: params.region_id,
      }),
      cache: "no-store",
    },
  );

  return wrapJsonResponse(res, "Failed to track discount event");
};

/**
 * validateCartTotal
 *
 * Fetches the latest cart from the server (cache: "no-store") and compares
 * its total against the `clientTotal` the user currently sees in the UI.
 *
 * Called right before any payment gateway is opened so that a coupon that
 * expired at the last second is caught before money moves.
 *
 * @param {string} cartId
 * @param {number} clientTotal   – Total currently displayed in the UI
 * @param {object} [options]     – { token, orgId, config, tolerance }
 * @returns {{ valid: boolean, serverTotal?: number, clientTotal?: number, reason?: string, cart?: object }}
 */
export const validateCartTotal = async (cartId: string, clientTotal: number, options: RequestOptions = {}): Promise<any> => {
  if (!cartId) return { valid: false, reason: "no_cart_id" };

  try {
    const headers = await buildHeaders({ ...options, requireAuth: false });
    const base = getApiBaseUrl(options);

    const res = await fetch(`${base}/api/carts/${cartId}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const resData = await res.json();
    const cart = Array.isArray(resData) ? resData[0] : resData;

    // Normalise: backend stores total in paise/cents
    const serverTotal =
      cart?.total ??
      cart?.grand_total ??
      cart?.total_amount ??
      cart?.display_total ??
      null;

    if (serverTotal === null) {
      // Cannot determine the total — allow through; backend is the final guard
      return { valid: true, serverTotal: null };
    }

    const tolerance = Number(options?.tolerance ?? 0);
    const diff = Math.abs(Number(serverTotal) - Number(clientTotal));

    if (diff > tolerance) {
      return {
        valid: false,
        reason: "price_mismatch",
        serverTotal: Number(serverTotal),
        clientTotal: Number(clientTotal),
        cart, // return the fresh cart so UI can update without an extra fetch
      };
    }

    return { valid: true, serverTotal: Number(serverTotal) };
  } catch (err) {
    console.error("[validateCartTotal] Error:", err);
    // On network error let the payment proceed; backend validates server-side
    return { valid: true, reason: "validation_skipped" };
  }
};

// ─── Products & Taxons ────────────────────────────────────────────────────────

export const getProductsAction = async (query: Record<string, unknown> = {}, options: RequestOptions = {}): Promise<any> => {
  let queryParams: any = query;
  let opt: RequestOptions = { ...options };

  if (query && typeof query === "object") {
    const {
      cache,
      revalidate,
      revalidation,
      forceRevalidate,
      tags,
      token,
      config,
      orgId,
      apiBaseUrl,
      ...restQuery
    } = query;

    if (cache !== undefined) opt.cache = cache as string;
    if (revalidate !== undefined) opt.revalidate = revalidate as number;
    if (revalidation !== undefined) opt.revalidation = revalidation as boolean;
    if (forceRevalidate !== undefined) opt.forceRevalidate = forceRevalidate as boolean;
    if (tags !== undefined) opt.tags = tags as string[];
    if (token !== undefined) opt.token = token as string | null;
    if (config !== undefined) opt.config = config as { apiBaseUrl?: string; storeId?: string };
    if (orgId !== undefined) opt.orgId = orgId as string;
    if (apiBaseUrl !== undefined) opt.apiBaseUrl = apiBaseUrl as string;

    queryParams = restQuery;
  }

  const queryStr = buildQueryString(queryParams);
  const url = `${getApiBaseUrl(opt)}/api/products${queryStr}`;
  const fetchConfig = await buildCachedFetchConfig(["products"], 604800, opt);
  return requestJson(url, fetchConfig, "Failed to fetch products");
};

export const getProductByIdAction = async (productId: string | number, options: RequestOptions = {}): Promise<any> => {
  if (!productId) return null;
  const url = `${getApiBaseUrl(options)}/api/products/${productId}`;
  const fetchConfig = await buildCachedFetchConfig(
    ["products", `product-${productId}`],
    604800,
    options,
  );
  return requestJson(url, fetchConfig, "Failed to fetch product");
};

export const getRelatedProductsAction = async (taxonId: string | Record<string, unknown>, options: RequestOptions = {}): Promise<any> => {
  let queryStr = "";
  if (typeof taxonId === "string") {
    let clean = taxonId.startsWith("?") ? taxonId.slice(1) : taxonId;
    if (clean.includes("&")) {
      const parts = clean.split("&");
      if (!parts[0].includes("=")) {
        parts[0] = `taxon_id=${parts[0]}`;
        clean = parts.join("&");
      }
      queryStr = `?${clean}`;
    } else if (clean.includes("=")) {
      queryStr = `?${clean}`;
    } else if (clean) {
      queryStr = `?taxon_id=${clean}`;
    }
  } else if (taxonId && typeof taxonId === "object") {
    queryStr = buildQueryString(taxonId);
  }

  const url = `${getApiBaseUrl(options)}/api/products${queryStr}`;
  const fetchConfig = await buildCachedFetchConfig(
    ["products"],
    604800,
    options,
  );
  return requestJson(url, fetchConfig, "Failed to fetch related products");
};

export const getTaxonByIdAction = async (taxonId: string | number, options: RequestOptions = {}): Promise<any> => {
  if (!taxonId) return null;
  const url = `${getApiBaseUrl(options)}/api/taxons/${taxonId}`;
  const fetchConfig = await buildCachedFetchConfig(
    ["taxons", `taxon-${taxonId}`],
    86400,
    options,
  );
  return requestJson(url, fetchConfig, "Failed to fetch taxon");
};

export const getAllTaxonsAction = async (params: string | Record<string, unknown> = "", options: RequestOptions = {}): Promise<any> => {
  let query: any = params;
  let opt: RequestOptions = { ...options };

  if (params && typeof params === "object") {
    const {
      cache,
      revalidate,
      revalidation,
      forceRevalidate,
      tags,
      token,
      config,
      orgId,
      apiBaseUrl,
      ...queryParams
    } = params;

    if (cache !== undefined) opt.cache = cache as string;
    if (revalidate !== undefined) opt.revalidate = revalidate as number;
    if (revalidation !== undefined) opt.revalidation = revalidation as boolean;
    if (forceRevalidate !== undefined) opt.forceRevalidate = forceRevalidate as boolean;
    if (tags !== undefined) opt.tags = tags as string[];
    if (token !== undefined) opt.token = token as string | null;
    if (config !== undefined) opt.config = config as { apiBaseUrl?: string; storeId?: string };
    if (orgId !== undefined) opt.orgId = orgId as string;
    if (apiBaseUrl !== undefined) opt.apiBaseUrl = apiBaseUrl as string;

    query = queryParams;
  }

  const queryStr = buildQueryString(query);
  const url = `${getApiBaseUrl(opt)}/api/taxons${queryStr}`;
  const fetchConfig = await buildCachedFetchConfig(["taxons"], 86400, opt);
  return requestJson(url, fetchConfig, "Failed to fetch taxons");
};

export const getTaxonomiesAction = async (params: string | Record<string, unknown> = "", options: RequestOptions = {}): Promise<any> => {
  let query: any = params;
  let opt: RequestOptions = { ...options };

  if (params && typeof params === "object") {
    const {
      cache,
      revalidate,
      revalidation,
      forceRevalidate,
      tags,
      token,
      config,
      orgId,
      apiBaseUrl,
      ...queryParams
    } = params;

    if (cache !== undefined) opt.cache = cache as string;
    if (revalidate !== undefined) opt.revalidate = revalidate as number;
    if (revalidation !== undefined) opt.revalidation = revalidation as boolean;
    if (forceRevalidate !== undefined) opt.forceRevalidate = forceRevalidate as boolean;
    if (tags !== undefined) opt.tags = tags as string[];
    if (token !== undefined) opt.token = token as string | null;
    if (config !== undefined) opt.config = config as { apiBaseUrl?: string; storeId?: string };
    if (orgId !== undefined) opt.orgId = orgId as string;
    if (apiBaseUrl !== undefined) opt.apiBaseUrl = apiBaseUrl as string;

    query = queryParams;
  }

  const queryStr = buildQueryString(query);
  const url = `${getApiBaseUrl(opt)}/api/taxonomies${queryStr}`;
  const fetchConfig = await buildCachedFetchConfig(["taxonomies"], 86400, opt);
  return requestJson(url, fetchConfig, "Failed to fetch taxonomies");
};

export const getTaxonomyByIdAction = async (taxonomyId: string | number, options: RequestOptions = {}): Promise<any> => {
  if (!taxonomyId) return null;
  const url = `${getApiBaseUrl(options)}/api/taxonomies/${taxonomyId}`;
  const fetchConfig = await buildCachedFetchConfig(
    ["taxonomies", `taxonomy-${taxonomyId}`],
    86400,
    options,
  );
  return requestJson(url, fetchConfig, "Failed to fetch taxonomy");
};

export const getProductsFilterAction = async (options: RequestOptions = {}): Promise<any> => {
  const url = `${getApiBaseUrl(options)}/api/filterable`;
  const fetchConfig = await buildCachedFetchConfig(
    ["filterable"],
    604800,
    options,
  );
  return requestJson(url, fetchConfig, "Failed to fetch products filter");
};

export const getRecentlyViewedProductsAction = async (
  page: number | RequestOptions = 1,
  perPage: number = 15,
  options: RequestOptions = {},
): Promise<any> => {
  let opt: RequestOptions = options;
  let p: number = page as number;
  let pp: number = perPage;
  if (typeof page === "object" && page !== null) {
    opt = page as RequestOptions;
    p = (opt as any).page || 1;
    pp = (opt as any).perPage || (opt as any).per_page || 15;
  }

  // Guard: skip the API call entirely if no token is available (matching getCurrentUserLikedProductsAction)
  const token = await getServerToken(opt.token);
  if (!token) return { recently_viewed_products: [] };

  const queryParts: string[] = [];
  if (p) queryParts.push(`page=${p}`);
  if (pp) queryParts.push(`per_page=${pp}`);
  const queryStr = queryParts.length ? `?${queryParts.join("&")}` : "";

  const url = `${getApiBaseUrl(opt)}/api/recently_viewed_products${queryStr}`;
  const fetchConfig: any = {
    method: "GET",
    headers: await buildHeaders({ ...opt, token }),
  };

  if (typeof window === "undefined") {
    fetchConfig.next = { tags: ["recently-viewed-products"], revalidate: 300 };
  } else {
    fetchConfig.cache = opt.cache || "no-store";
  }

  return requestJson(
    url,
    fetchConfig,
    "Failed to fetch recently viewed products",
  );
};

export const getLikedProductsAction = async (options: RequestOptions = {}): Promise<any> => {
  const url = `${getApiBaseUrl(options)}/api/product_likes`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to fetch liked products",
  );
};

export const likeProductAction = async (body: Record<string, unknown>, options: RequestOptions = {}): Promise<any> => {
  const url = `${getApiBaseUrl(options)}/api/product_likes`;
  return requestJson(
    url,
    {
      method: "POST",
      headers: await buildHeaders(options),
      body: JSON.stringify(body),
      cache: "no-store",
    },
    "Failed to like product",
  );
};

export const unlikeProductAction = async (id: string | number, options: RequestOptions = {}): Promise<any> => {
  const url = `${getApiBaseUrl(options)}/api/product_likes/${id}`;
  return requestJson(
    url,
    {
      method: "DELETE",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to unlike product",
  );
};

export const getCurrentUserLikedProductsAction = async (
  page: number | RequestOptions = 1,
  perPage: number = 100,
  options: RequestOptions = {},
): Promise<any> => {
  let opt: RequestOptions = options;
  let p: number = page as number;
  let pp: number = perPage;
  if (typeof page === "object" && page !== null) {
    opt = page as RequestOptions;
    p = (opt as any).page || 1;
    pp = (opt as any).perPage || (opt as any).per_page || 100;
  }

  // Guard: skip the API call entirely if no token is available
  const token = await getServerToken(opt.token);
  if (!token) return [];

  const queryParts: string[] = [];
  if (p) queryParts.push(`page=${p}`);
  if (pp) queryParts.push(`per_page=${pp}`);
  const queryStr = queryParts.length ? `?${queryParts.join("&")}` : "";
  const url = `${getApiBaseUrl(opt)}/api/current_user_liked_products${queryStr}`;

  const fetchConfig: any = {
    method: "GET",
    headers: await buildHeaders({ ...opt, token }),
  };

  if (typeof window === "undefined") {
    fetchConfig.next = { tags: ["LikedProducts"], revalidate: 300 };
  } else {
    fetchConfig.cache = opt.cache || "no-store";
  }

  return requestJson(
    url,
    fetchConfig,
    "Failed to fetch current user liked products",
  );
};

export const getProductsByIdsAction = async (productIds: (string | number)[] = [], options: RequestOptions = {}): Promise<any> => {
  if (!productIds.length) return [];
  const params = productIds.map((pid) => `ids[]=${pid}`).join("&");
  const url = `${getApiBaseUrl(options)}/api/products?${params}&per_page=${productIds.length}`;
  const fetchConfig = await buildCachedFetchConfig(
    ["products"],
    604800,
    options,
  );
  const data = await requestJson(
    url,
    fetchConfig,
    "Failed to fetch products by ids",
  );
  return data?.products ?? data?.data ?? (Array.isArray(data) ? data : []);
};

// ─── Organization ─────────────────────────────────────────────────────────────

export const getOrganizationAction = async (options: RequestOptions & { organizationId?: string; id?: string } = {}): Promise<any> => {
  const orgId =
    options?.organizationId || options?.id || getOrganizationId(options);
  const url = orgId
    ? `${getApiBaseUrl(options)}/api/organizations/${orgId}`
    : `${getApiBaseUrl(options)}/api/organizations`;
  const fetchConfig = await buildCachedFetchConfig(
    ["organizations"],
    86400,
    options,
  );
  return requestJson(url, fetchConfig, "Failed to fetch organization");
};

export const getOrgVideosAction = async (options: RequestOptions = {}): Promise<any> => {
  const url = `${getApiBaseUrl(options)}/api/organization_videos`;
  const fetchConfig = await buildCachedFetchConfig(
    ["organization-videos"],
    86400,
    options,
  );
  return requestJson(url, fetchConfig, "Failed to fetch organization videos");
};
