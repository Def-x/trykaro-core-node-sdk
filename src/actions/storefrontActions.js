/**
 * storefrontActions.js — @defx/storefront-core
 *
 * Plain async fetch helpers for the Defx storefront API.
 * NOTE: No "use server" directive — this file is bundled by tsup (esbuild)
 * and "use server" is a Next.js-only directive that breaks package builds.
 * These functions work correctly when called from Next.js server actions
 * or server components in the host app.
 */

const API_VERSION_ACCEPT = "application/vnd.defx-store.v2";

const getApiBaseUrl = (options = {}) =>
  options?.config?.apiBaseUrl ||
  options?.apiBaseUrl ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "";

const getOrganizationId = (options = {}) =>
  options?.config?.storeId ||
  options?.orgId ||
  process.env.NEXT_PUBLIC_ORGANIZATION_ID ||
  process.env.ORG_ID ||
  null;

const getServerToken = async (token) => {
  if (token) return token;

  if (typeof window !== "undefined") {
    return (
      window.localStorage?.getItem("access_token") ||
      window.localStorage?.getItem("token") ||
      null
    );
  }

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return (
      cookieStore.get("access_token")?.value ||
      cookieStore.get("token")?.value ||
      null
    );
  } catch {
    return null;
  }
};

const buildHeaders = async ({
  token,
  orgId,
  config,
  json = true,
  requireAuth = false,
} = {}) => {
  const authToken = await getServerToken(token);
  const organizationId = getOrganizationId({ orgId, config });

  if (requireAuth && !authToken) {
    throw new Error("Unauthorized");
  }

  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    accept: API_VERSION_ACCEPT,
    ...(organizationId ? { "Set-Organization": organizationId } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
};

const readError = async (res, fallback) => {
  const text = await res.text().catch(() => "");
  if (!text) return fallback;

  try {
    const data = JSON.parse(text);
    return data?.message || data?.error || fallback;
  } catch {
    return text;
  }
};

const wrapJsonResponse = async (res, fallback) => {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      serverError: data?.error || data?.message || fallback,
      data,
      status: res.status,
    };
  }

  return data;
};

const requestJson = async (url, options, fallback) => {
  const res = await fetch(url, options);

  if (!res.ok) {
    return { serverError: await readError(res, fallback) };
  }

  if (res.status === 204) return true;
  return res.json();
};

const requestJsonFromResponse = async (res, fallback) => {
  if (!res.ok) return { serverError: await readError(res, fallback) };
  if (res.status === 204) return true;
  return res.json();
};

// ─── Cart ────────────────────────────────────────────────────────────────────

export const createCartAction = async (body = {}, options = {}) => {
  const res = await fetch(`${getApiBaseUrl(options)}/api/carts`, {
    method: "POST",
    headers: await buildHeaders(options),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return requestJsonFromResponse(res, "Failed to create cart");
};

export const getCartAction = async (regionId, options = {}) => {
  const url = new URL(`${getApiBaseUrl(options)}/api/carts`);
  if (regionId) url.searchParams.set("region_id", regionId);

  return requestJson(
    url.toString(),
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to get cart",
  );
};

export const getCartByIdAction = async (cartId, regionId, options = {}) => {
  const url = new URL(`${getApiBaseUrl(options)}/api/carts/${cartId}`);
  if (regionId) url.searchParams.set("region_id", regionId);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: await buildHeaders(options),
    cache: "no-store",
  });

  if (res.status === 404) return null;
  return requestJsonFromResponse(res, "Failed to get cart");
};

export const updateCartAction = async (cartId, payload, options = {}) =>
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

export const updateCartIdLineItemsAction = async (payload, options = {}) =>
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

export const createLineItemAction = async (body = {}, options = {}) =>
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

export const updateLineItemAction = async (lineItemId, body, options = {}) =>
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

export const deleteLineItemAction = async (lineItemId, options = {}) =>
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

export const createRazorpayOrderAction = async (cartId, options = {}) =>
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
  paymentId,
  razorpayPaymentId,
  options = {},
) =>
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

// ─── Addresses ────────────────────────────────────────────────────────────────

export const getAddressesAction = async (options = {}) => {
  const token = await getServerToken(options.token);
  if (!token) return { data: [] };

  return requestJson(
    `${getApiBaseUrl(options)}/api/addresses`,
    {
      method: "GET",
      headers: await buildHeaders({ ...options, token }),
      cache: "no-store",
    },
    "Failed to fetch addresses",
  );
};

export const createAddressAction = async (addressData, options = {}) =>
  requestJson(
    `${getApiBaseUrl(options)}/api/addresses`,
    {
      method: "POST",
      headers: await buildHeaders({ ...options, requireAuth: true }),
      body: JSON.stringify({ address: addressData }),
      cache: "no-store",
    },
    "Failed to create address",
  );

export const updateAddressAction = async (addressId, addressData, options = {}) =>
  requestJson(
    `${getApiBaseUrl(options)}/api/addresses/${addressId}`,
    {
      method: "PUT",
      headers: await buildHeaders({ ...options, requireAuth: true }),
      body: JSON.stringify({ address: addressData }),
      cache: "no-store",
    },
    "Failed to update address",
  );

export const deleteAddressAction = async (addressId, options = {}) =>
  requestJson(
    `${getApiBaseUrl(options)}/api/addresses/${addressId}`,
    {
      method: "DELETE",
      headers: await buildHeaders({ ...options, requireAuth: true }),
      cache: "no-store",
    },
    "Failed to delete address",
  );

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginUser = async (data = {}, options = {}) => {
  const payload = {
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
    "Failed to send OTP",
  );
};

export const signUpUser = async (data = {}, options = {}) => {
  const formData = data instanceof FormData ? data : new FormData();

  if (!(data instanceof FormData)) {
    formData.append("user[first_name]", data?.firstName ?? "");
    formData.append("user[last_name]", data?.lastName ?? "");
    formData.append("user[phone]", data?.phone ?? "");
    formData.append("user[country_code]", data?.countryCode ?? "+91");
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

export const verifyOtp = async (data = {}, options = {}) => {
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

export const getUserAction = async (options = {}) => {
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

export const updateUserAction = async (userId, userData, options = {}) =>
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

export const getOrdersAction = async (regionId, page = 1, options = {}) => {
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

export const getOrderByIdAction = async (orderId, options = {}) =>
  requestJson(
    `${getApiBaseUrl(options)}/api/orders/${orderId}`,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to get order",
  );

export const getOrderInvoiceAction = async (orderId, options = {}) => {
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

export const getAvailableDiscountsAction = async (params = {}) => {
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

export const applyDiscountAction = async (params = {}) => {
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

export const removeDiscountAction = async (params = {}) => {
  const url = new URL(`${getApiBaseUrl(params)}/api/discounts/remove`);
  if (params.discount_id)
    url.searchParams.set("discount_id", params.discount_id);
  if (params.region_id) url.searchParams.set("region_id", params.region_id);

  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: await buildHeaders(params),
    cache: "no-store",
  });

  return wrapJsonResponse(res, "Failed to remove discount");
};

export const trackDiscountEventAction = async (params = {}) => {
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
export const validateCartTotal = async (cartId, clientTotal, options = {}) => {
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

    const tolerance = options?.tolerance ?? 0;
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

export const getProductsAction = async (query = {}, options = {}) => {
  let queryString = "";
  if (typeof query === "string") {
    queryString = query.startsWith("?") ? query.slice(1) : query;
  } else if (query && typeof query === "object") {
    const sp = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.append(k, v);
    });
    queryString = sp.toString();
  }

  const url = `${getApiBaseUrl(options)}/api/products${queryString ? `?${queryString}` : ""}`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to fetch products"
  );
};

export const getProductByIdAction = async (productId, options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/products/${productId}`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to fetch product"
  );
};

export const getRelatedProductsAction = async (taxonId, options = {}) => {
  const queryStr =
    typeof taxonId === "string" && (taxonId.includes("=") || taxonId.startsWith("?"))
      ? taxonId.startsWith("?")
        ? taxonId
        : `?${taxonId}`
      : `?taxon_id=${taxonId}`;

  const url = `${getApiBaseUrl(options)}/api/products${queryStr}`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to fetch related products"
  );
};

export const getTaxonByIdAction = async (taxonId, options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/taxons/${taxonId}`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to fetch taxon"
  );
};

export const getAllTaxonsAction = async (params = "", options = {}) => {
  const queryStr = typeof params === "string" ? (params.startsWith("?") ? params : `?${params}`) : "";
  const url = `${getApiBaseUrl(options)}/api/taxons${queryStr}`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to fetch taxons"
  );
};

export const getTaxonomiesAction = async (params = "", options = {}) => {
  const queryStr = typeof params === "string" ? (params.startsWith("?") ? params : `?${params}`) : "";
  const url = `${getApiBaseUrl(options)}/api/taxonomies${queryStr}`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to fetch taxonomies"
  );
};

export const getProductsFilterAction = async (options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/filterable`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to fetch products filter"
  );
};

export const getRecentlyViewedProductsAction = async (options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/recently_viewed_products`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to fetch recently viewed products"
  );
};

export const getLikedProductsAction = async (options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/product_likes`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to fetch liked products"
  );
};

export const likeProductAction = async (body, options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/product_likes`;
  return requestJson(
    url,
    {
      method: "POST",
      headers: await buildHeaders(options),
      body: JSON.stringify(body),
      cache: "no-store",
    },
    "Failed to like product"
  );
};

export const unlikeProductAction = async (id, options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/product_likes/${id}`;
  return requestJson(
    url,
    {
      method: "DELETE",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to unlike product"
  );
};

export const getCurrentUserLikedProductsAction = async (page = 1, perPage = 100, options = {}) => {
  let opt = options;
  let p = page;
  let pp = perPage;
  if (typeof page === "object" && page !== null) {
    opt = page;
    p = opt.page || 1;
    pp = opt.perPage || opt.per_page || 100;
  }

  // Guard: skip the API call entirely if no token is available
  const token = await getServerToken(opt.token);
  if (!token) return [];

  const queryParts = [];
  if (p) queryParts.push(`page=${p}`);
  if (pp) queryParts.push(`per_page=${pp}`);
  const queryStr = queryParts.length ? `?${queryParts.join("&")}` : "";

  const url = `${getApiBaseUrl(opt)}/api/current_user_liked_products${queryStr}`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders({ ...opt, token }),
      cache: opt.cache || "no-store",
      ...(typeof window === "undefined"
        ? { next: { revalidate: 300, tags: ["LikedProducts"] } }
        : {}),
    },
    "Failed to fetch current user liked products"
  );
};


export const getProductsByIdsAction = async (productIds = [], options = {}) => {
  if (!productIds.length) return [];
  const params = productIds.map((pid) => `ids[]=${pid}`).join("&");
  const url = `${getApiBaseUrl(options)}/api/products?${params}&per_page=${productIds.length}`;
  const data = await requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to fetch products by ids"
  );
  return data?.products ?? data?.data ?? (Array.isArray(data) ? data : []);
};

// ─── Organization ─────────────────────────────────────────────────────────────

export const getOrganizationAction = async (options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/organizations`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to fetch organization"
  );
};

export const getOrgVideosAction = async (options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/organization_videos`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to fetch organization videos"
  );
};

