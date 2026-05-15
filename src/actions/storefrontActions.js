"use server";

const API_VERSION_ACCEPT = "application/vnd.defx-store.v2";

const getApiBaseUrl = (apiBaseUrl) => {
  const baseUrl =
    apiBaseUrl ||
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  console.log({ baseUrl });
  if (!baseUrl) {
    throw new Error("API base URL is not configured");
  }

  return baseUrl;
};

const getOrganizationId = (orgId) =>
  orgId ||
  process.env.ORG_ID ||
  process.env.NEXT_PUBLIC_ORG_ID ||
  process.env.NEXT_PUBLIC_ORGANIZATION_ID;

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
  json = true,
  requireAuth = false,
} = {}) => {
  const authToken = await getServerToken(token);

  if (requireAuth && !authToken) {
    throw new Error("Unauthorized");
  }

  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    accept: API_VERSION_ACCEPT,
    ...(getOrganizationId(orgId)
      ? { "Set-Organization": getOrganizationId(orgId) }
      : {}),
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

export const createCartAction = async (body = {}, options = {}) => {
  const res = await fetch(`${getApiBaseUrl(options.apiBaseUrl)}/api/carts`, {
    method: "POST",
    headers: await buildHeaders(options),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return requestJsonFromResponse(res, "Failed to create cart");
};

const requestJsonFromResponse = async (res, fallback) => {
  if (!res.ok) return { serverError: await readError(res, fallback) };
  if (res.status === 204) return true;
  return res.json();
};

export const getCartAction = async (regionId, options = {}) => {
  const url = new URL(`${getApiBaseUrl(options.apiBaseUrl)}/api/carts`);
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
  const url = new URL(
    `${getApiBaseUrl(options.apiBaseUrl)}/api/carts/${cartId}`,
  );
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
    `${getApiBaseUrl(options.apiBaseUrl)}/api/carts/${cartId}`,
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
    `${getApiBaseUrl(options.apiBaseUrl)}/api/update_cart_id_line_items`,
    {
      method: "PUT",
      headers: await buildHeaders(options),
      body: JSON.stringify(payload),
      cache: "no-store",
    },
    "Failed to update cart line items",
  );

export const createLineItemAction = async (body = {}, options = {}) =>
  requestJson(
    `${getApiBaseUrl(options.apiBaseUrl)}/api/line_items`,
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
    `${getApiBaseUrl(options.apiBaseUrl)}/api/line_items/${lineItemId}`,
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
    `${getApiBaseUrl(options.apiBaseUrl)}/api/line_items/${lineItemId}`,
    {
      method: "DELETE",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to delete line item",
  );

export const createRazorpayOrderAction = async (cartId, options = {}) =>
  requestJson(
    `${getApiBaseUrl(options.apiBaseUrl)}/api/cart_payments`,
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
    `${getApiBaseUrl(options.apiBaseUrl)}/api/cart_payments/${paymentId}`,
    {
      method: "PUT",
      headers: await buildHeaders({ ...options, requireAuth: true }),
      body: JSON.stringify({ razor_payment_id: razorpayPaymentId }),
      cache: "no-store",
    },
    "Failed to update Razorpay payment id",
  );

export const getAddressesAction = async (options = {}) => {
  const token = await getServerToken(options.token);
  if (!token) return { data: [] };

  return requestJson(
    `${getApiBaseUrl(options.apiBaseUrl)}/api/addresses`,
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
    `${getApiBaseUrl(options.apiBaseUrl)}/api/addresses`,
    {
      method: "POST",
      headers: await buildHeaders({ ...options, requireAuth: true }),
      body: JSON.stringify({ address: addressData }),
      cache: "no-store",
    },
    "Failed to create address",
  );

export const updateAddressAction = async (
  addressId,
  addressData,
  options = {},
) =>
  requestJson(
    `${getApiBaseUrl(options.apiBaseUrl)}/api/addresses/${addressId}`,
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
    `${getApiBaseUrl(options.apiBaseUrl)}/api/addresses/${addressId}`,
    {
      method: "DELETE",
      headers: await buildHeaders({ ...options, requireAuth: true }),
      cache: "no-store",
    },
    "Failed to delete address",
  );

export const loginUser = async (data = {}, options = {}) => {
  const payload = {
    phone: data?.phone ?? data,
    country_code: data?.country_code ?? data?.countryCode ?? "+91",
    organization_id: getOrganizationId(options.orgId),
  };

  return requestJson(
    `${getApiBaseUrl(options.apiBaseUrl)}/api/login`,
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
    `${getApiBaseUrl(options.apiBaseUrl)}/api/users`,
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
    `${getApiBaseUrl(options.apiBaseUrl)}/api/verify`,
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

export const getUserAction = async (options = {}) => {
  const token = await getServerToken(options.token);
  if (!token) return null;

  return requestJson(
    `${getApiBaseUrl(options.apiBaseUrl)}/api/users`,
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
    `${getApiBaseUrl(options.apiBaseUrl)}/api/users/${userId}`,
    {
      method: "PUT",
      headers: await buildHeaders({ ...options, requireAuth: true }),
      body: JSON.stringify(userData),
      cache: "no-store",
    },
    "Failed to update user",
  );

export const getOrdersAction = async (regionId, page = 1, options = {}) => {
  const url = new URL(`${getApiBaseUrl(options.apiBaseUrl)}/api/orders`);
  if (regionId) url.searchParams.set("region_id", regionId);
  url.searchParams.set("page", page.toString());

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
    `${getApiBaseUrl(options.apiBaseUrl)}/api/orders/${orderId}`,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store",
    },
    "Failed to get order",
  );

export const getOrderInvoiceAction = async (orderId, options = {}) => {
  const res = await fetch(
    `${getApiBaseUrl(options.apiBaseUrl)}/api/generate_invoice_pdf/${orderId}`,
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

export const getAvailableDiscountsAction = async (params = {}) => {
  const url = new URL(
    `${getApiBaseUrl(params.apiBaseUrl)}/api/discounts/available`,
  );
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

  const res = await fetch(
    `${getApiBaseUrl(params.apiBaseUrl)}/api/discounts/apply`,
    {
      method: "POST",
      headers: await buildHeaders(params),
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  return wrapJsonResponse(res, "Failed to apply discount");
};

export const removeDiscountAction = async (params = {}) => {
  const url = new URL(
    `${getApiBaseUrl(params.apiBaseUrl)}/api/discounts/remove`,
  );
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
    `${getApiBaseUrl(params.apiBaseUrl)}/api/discounts/track_event`,
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
