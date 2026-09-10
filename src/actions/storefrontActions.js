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
    return window.localStorage?.getItem("access_token") || null;
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

    // Use display_total — the exact same key used to display cart totals across the storefront
    const serverTotal =
      cart?.display_total ??
      cart?.total ??
      cart?.grand_total ??
      cart?.total_amount ??
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
        display_total: cart?.display_total ?? serverTotal,
        serverTotal: cart?.display_total ?? serverTotal,
        clientTotal: clientTotal,
        cart, // return the fresh cart so UI can update without an extra fetch
      };
    }

    return { valid: true, serverTotal: cart?.display_total ?? serverTotal };
  } catch (err) {
    console.error("[validateCartTotal] Error:", err);
    // On network error let the payment proceed; backend validates server-side
    return { valid: true, reason: "validation_skipped" };
  }
};
