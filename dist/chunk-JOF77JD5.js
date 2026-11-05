// src/utils/request.ts
var API_VERSION_ACCEPT = "application/vnd.defx-store.v2";
var getEnv = (key) => {
  if (typeof process !== "undefined" && process?.env) {
    return process.env[key];
  }
  return void 0;
};
var globalConfig = {};
var configureStorefront = (config) => {
  globalConfig = { ...globalConfig, ...config };
};
var getStorefrontGlobalConfig = () => globalConfig;
var getApiBaseUrl = (options = {}) => options?.config?.apiBaseUrl || options?.apiBaseUrl || globalConfig?.apiBaseUrl || getEnv("NEXT_PUBLIC_API_BASE_URL") || getEnv("API_BASE_URL") || "";
var getOrganizationId = (options = {}) => options?.config?.storeId || options?.orgId || globalConfig?.storeId || globalConfig?.orgId || getEnv("NEXT_PUBLIC_ORGANIZATION_ID") || getEnv("ORG_ID") || null;
var getServerToken = async (token, options) => {
  if (token === null || token === false) return null;
  if (token) return token;
  const adapterTokenFn = options?.adapter?.getServerToken || globalConfig?.adapter?.getServerToken;
  if (typeof adapterTokenFn === "function") {
    try {
      const adapted = await adapterTokenFn();
      if (adapted) return adapted;
    } catch {
    }
  }
  if (typeof window !== "undefined") {
    return window.localStorage?.getItem("access_token") || window.localStorage?.getItem("token") || null;
  }
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value || cookieStore.get("token")?.value || null;
  } catch {
    return null;
  }
};
var buildHeaders = async ({
  token,
  orgId,
  config,
  adapter,
  json = true,
  requireAuth = false
} = {}) => {
  const authToken = await getServerToken(token, { adapter });
  const organizationId = getOrganizationId({ orgId, config });
  if (requireAuth && !authToken) {
    throw new Error("Unauthorized");
  }
  return {
    ...json ? { "Content-Type": "application/json" } : {},
    accept: API_VERSION_ACCEPT,
    ...organizationId ? { "Set-Organization": organizationId } : {},
    ...authToken ? { Authorization: `Bearer ${authToken}` } : {}
  };
};
var buildQueryString = (params) => {
  if (!params) return "";
  if (typeof params === "string") {
    return params.startsWith("?") ? params : `?${params}`;
  }
  if (typeof params === "object") {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== void 0 && v !== null) {
        if (Array.isArray(v)) {
          v.forEach((val) => sp.append(`${k}[]`, String(val)));
        } else {
          sp.append(k, String(v));
        }
      }
    });
    const s = sp.toString();
    return s ? `?${s}` : "";
  }
  return "";
};
var readError = async (res, fallback) => {
  const text = await res.text().catch(() => "");
  if (!text) return fallback;
  try {
    const data = JSON.parse(text);
    return data?.message || data?.error || fallback;
  } catch {
    return text;
  }
};
var wrapJsonResponse = async (res, fallback) => {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      serverError: data?.error || data?.message || fallback,
      data,
      status: res.status
    };
  }
  return data;
};
var requestJson = async (url, options, fallback) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    return { serverError: await readError(res, fallback) };
  }
  if (res.status === 204) return true;
  return res.json();
};
var requestJsonFromResponse = async (res, fallback) => {
  if (!res.ok) return { serverError: await readError(res, fallback) };
  if (res.status === 204) return true;
  return res.json();
};
var revalidateCacheTag = async (tag, options) => {
  const adapterRevalidate = options?.adapter?.revalidateTag || globalConfig?.adapter?.revalidateTag;
  if (typeof adapterRevalidate === "function") {
    try {
      await adapterRevalidate(tag);
      return;
    } catch {
    }
  }
  if (typeof window === "undefined") {
    try {
      const nextCache = await import('next/cache');
      nextCache.revalidateTag?.(tag);
    } catch {
    }
  }
};

// src/actions/storefrontActions.ts
var buildCachedFetchConfig = async (defaultTags = [], defaultTtl = 86400, options = {}) => {
  const headers = await buildHeaders(options);
  const shouldBypassCache = options.cache === "no-store" || options.revalidation === true || options.forceRevalidate === true || options.revalidate === 0;
  if (typeof window === "undefined" && !shouldBypassCache) {
    const tags = Array.isArray(options.tags) ? [...defaultTags, ...options.tags] : defaultTags;
    const revalidate = typeof options.revalidate === "number" ? options.revalidate : defaultTtl;
    return {
      method: "GET",
      headers,
      next: { tags, revalidate }
    };
  }
  return {
    method: "GET",
    headers,
    cache: options.cache || "no-store"
  };
};
var createCartAction = async (body = {}, options = {}) => {
  const res = await fetch(`${getApiBaseUrl(options)}/api/carts`, {
    method: "POST",
    headers: await buildHeaders(options),
    body: JSON.stringify(body),
    cache: "no-store"
  });
  return requestJsonFromResponse(res, "Failed to create cart");
};
var getCartAction = async (regionId = null, options = {}) => {
  const token = await getServerToken(options?.token);
  if (!token) return [];
  const url = new URL(`${getApiBaseUrl(options)}/api/carts`);
  if (regionId) url.searchParams.set("region_id", regionId);
  return requestJson(
    url.toString(),
    {
      method: "GET",
      headers: await buildHeaders({ ...options, token }),
      cache: "no-store"
    },
    "Failed to get cart"
  );
};
var getCartByIdAction = async (cartId, regionId, options = {}) => {
  if (!cartId) return null;
  const url = new URL(`${getApiBaseUrl(options)}/api/carts/${cartId}`);
  if (regionId) url.searchParams.set("region_id", regionId);
  const resolvedOptions = {
    ...options,
    token: options.token ?? null
  };
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: await buildHeaders(resolvedOptions),
    cache: "no-store"
  });
  if (res.status === 404) return null;
  return requestJsonFromResponse(res, "Failed to get cart");
};
var updateCartAction = async (cartId, payload, options = {}) => requestJson(
  `${getApiBaseUrl(options)}/api/carts/${cartId}`,
  {
    method: "PUT",
    headers: await buildHeaders(options),
    body: JSON.stringify(payload),
    cache: "no-store"
  },
  "Failed to update cart"
);
var updateCartIdLineItemsAction = async (payload, options = {}) => requestJson(
  `${getApiBaseUrl(options)}/api/update_cart_id_line_items`,
  {
    method: "PUT",
    headers: await buildHeaders(options),
    body: JSON.stringify(payload),
    cache: "no-store"
  },
  "Failed to update cart line items"
);
var createLineItemAction = async (body = {}, options = {}) => requestJson(
  `${getApiBaseUrl(options)}/api/line_items`,
  {
    method: "POST",
    headers: await buildHeaders(options),
    body: JSON.stringify(body),
    cache: "no-store"
  },
  "Failed to create line item"
);
var updateLineItemAction = async (lineItemId, body, options = {}) => requestJson(
  `${getApiBaseUrl(options)}/api/line_items/${lineItemId}`,
  {
    method: "PUT",
    headers: await buildHeaders(options),
    body: JSON.stringify(body),
    cache: "no-store"
  },
  "Failed to update line item"
);
var deleteLineItemAction = async (lineItemId, options = {}) => {
  if (!lineItemId || lineItemId === "undefined" || lineItemId === "null") {
    console.warn("[deleteLineItemAction] Invalid lineItemId provided:", lineItemId);
    return null;
  }
  return requestJson(
    `${getApiBaseUrl(options)}/api/line_items/${lineItemId}`,
    {
      method: "DELETE",
      headers: await buildHeaders(options),
      cache: "no-store"
    },
    "Failed to delete line item"
  );
};
var createRazorpayOrderAction = async (cartId, options = {}) => requestJson(
  `${getApiBaseUrl(options)}/api/cart_payments`,
  {
    method: "POST",
    headers: await buildHeaders({ ...options, requireAuth: true }),
    body: JSON.stringify({ cart_id: cartId }),
    cache: "no-store"
  },
  "Failed to create Razorpay order"
);
var updateRazorpayPaymentAction = async (paymentId, razorpayPaymentId, options = {}) => requestJson(
  `${getApiBaseUrl(options)}/api/cart_payments/${paymentId}`,
  {
    method: "PUT",
    headers: await buildHeaders({ ...options, requireAuth: true }),
    body: JSON.stringify({ razor_payment_id: razorpayPaymentId }),
    cache: "no-store"
  },
  "Failed to update Razorpay payment id"
);
var createCartPaymentAction = async (cartId, options = {}) => requestJson(
  `${getApiBaseUrl(options)}/api/cart_payments`,
  {
    method: "POST",
    headers: await buildHeaders({ ...options, requireAuth: true }),
    body: JSON.stringify({ cart_id: cartId }),
    cache: "no-store"
  },
  "Failed to create cart payment"
);
var createPhonePeOrderAction = async (cartId, options = {}) => createCartPaymentAction(cartId, options);
var updateCartPaymentAction = async (paymentId, data = {}, options = {}) => requestJson(
  `${getApiBaseUrl(options)}/api/cart_payments/${paymentId}`,
  {
    method: "PUT",
    headers: await buildHeaders({ ...options, requireAuth: true }),
    body: JSON.stringify(data),
    cache: "no-store"
  },
  "Failed to update cart payment"
);
var updatePhonePePaymentAction = async (paymentId, phonepeData = {}, options = {}) => {
  const body = typeof phonepeData === "string" ? { transaction_id: phonepeData, phonepe_payment_id: phonepeData } : phonepeData;
  return updateCartPaymentAction(paymentId, body, options);
};
var createStripePaymentIntentAction = async (cartId, options = {}) => requestJson(
  `${getApiBaseUrl(options)}/api/stripe_create_payment_intent`,
  {
    method: "POST",
    headers: await buildHeaders({ ...options, requireAuth: false }),
    body: JSON.stringify({ cart_id: cartId }),
    cache: "no-store"
  },
  "Failed to create Stripe payment intent"
);
var getAddressesAction = async (options = {}) => {
  const token = await getServerToken(options?.token);
  if (!token) return { data: [] };
  const url = `${getApiBaseUrl(options)}/api/addresses`;
  const fetchConfig = await buildCachedFetchConfig(
    ["addresses"],
    86400,
    { ...options, token }
  );
  return requestJson(url, fetchConfig, "Failed to fetch addresses");
};
var createAddressAction = async (addressData, options = {}) => {
  const token = await getServerToken(options?.token);
  if (!token) throw new Error("Unauthorized");
  const body = addressData?.address ? addressData : { address: addressData };
  const res = await requestJson(
    `${getApiBaseUrl(options)}/api/addresses`,
    {
      method: "POST",
      headers: await buildHeaders({ ...options, token, requireAuth: true }),
      body: JSON.stringify(body),
      cache: "no-store"
    },
    "Failed to create address"
  );
  await revalidateCacheTag("addresses", options);
  return res;
};
var updateAddressAction = async (addressId, addressData, options = {}) => {
  const token = await getServerToken(options?.token);
  if (!token) throw new Error("Unauthorized");
  const body = addressData?.address ? addressData : { address: addressData };
  const res = await requestJson(
    `${getApiBaseUrl(options)}/api/addresses/${addressId}`,
    {
      method: "PUT",
      headers: await buildHeaders({ ...options, token, requireAuth: true }),
      body: JSON.stringify(body),
      cache: "no-store"
    },
    "Failed to update address"
  );
  await revalidateCacheTag("addresses", options);
  return res;
};
var deleteAddressAction = async (addressId, options = {}) => {
  const token = await getServerToken(options?.token);
  if (!token) throw new Error("Unauthorized");
  const res = await requestJson(
    `${getApiBaseUrl(options)}/api/addresses/${addressId}`,
    {
      method: "DELETE",
      headers: await buildHeaders({ ...options, token, requireAuth: true }),
      cache: "no-store"
    },
    "Failed to delete address"
  );
  await revalidateCacheTag("addresses", options);
  return res;
};
var loginUser = async (data = {}, options = {}) => {
  const isClerk = Boolean(data?.clerk_id);
  const payload = isClerk ? {
    clerk_id: data.clerk_id,
    first_name: data.first_name ?? data.firstName,
    last_name: data.last_name ?? data.lastName,
    email: data.email,
    organization_id: getOrganizationId(options)
  } : {
    phone: data?.phone ?? data,
    country_code: data?.country_code ?? data?.countryCode ?? "+91",
    organization_id: getOrganizationId(options)
  };
  return requestJson(
    `${getApiBaseUrl(options)}/api/login`,
    {
      method: "POST",
      headers: await buildHeaders(options),
      body: JSON.stringify(payload),
      cache: "no-store"
    },
    isClerk ? "Failed to authenticate with Clerk" : "Failed to send OTP"
  );
};
var signUpUser = async (data = {}, options = {}) => {
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
      cache: "no-store"
    },
    "Failed to sign up"
  );
};
var verifyOtp = async (data = {}, options = {}) => {
  const result = await requestJson(
    `${getApiBaseUrl(options)}/api/verify`,
    {
      method: "POST",
      headers: await buildHeaders(options),
      body: JSON.stringify(data),
      cache: "no-store"
    },
    "Invalid OTP"
  );
  const token = result?.token ?? result?.access_token;
  if (!token || result?.serverError) return result;
  const user = await getUserAction({ ...options, token });
  return { ...result, user };
};
var getUserAction = async (options = {}) => {
  const token = await getServerToken(options.token);
  if (!token) return null;
  return requestJson(
    `${getApiBaseUrl(options)}/api/users`,
    {
      method: "GET",
      headers: await buildHeaders({ ...options, token }),
      cache: "no-store"
    },
    "Failed to get user"
  );
};
var updateUserAction = async (userId, userData, options = {}) => requestJson(
  `${getApiBaseUrl(options)}/api/users/${userId}`,
  {
    method: "PUT",
    headers: await buildHeaders({ ...options, requireAuth: true }),
    body: JSON.stringify(userData),
    cache: "no-store"
  },
  "Failed to update user"
);
var getOrdersAction = async (regionId, page = 1, options = {}) => {
  const url = new URL(`${getApiBaseUrl(options)}/api/get_current_user_orders`);
  if (regionId) url.searchParams.set("region_id", regionId);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("per_page", "10");
  return requestJson(
    url.toString(),
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store"
    },
    "Failed to get orders"
  );
};
var getOrderByIdAction = async (orderId, options = {}) => requestJson(
  `${getApiBaseUrl(options)}/api/orders/${orderId}`,
  {
    method: "GET",
    headers: await buildHeaders(options),
    cache: "no-store"
  },
  "Failed to get order"
);
var getOrderInvoiceAction = async (orderId, options = {}) => {
  const res = await fetch(
    `${getApiBaseUrl(options)}/api/generate_invoice_pdf/${orderId}`,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store"
    }
  );
  if (!res.ok)
    return { serverError: await readError(res, "Failed to get order invoice") };
  return res.text();
};
var getAvailableDiscountsAction = async (params = {}) => {
  const url = new URL(`${getApiBaseUrl(params)}/api/discounts/available`);
  if (params.cart_id) url.searchParams.set("cart_id", params.cart_id);
  if (params.region_id) url.searchParams.set("region_id", params.region_id);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: await buildHeaders(params),
    cache: "no-store"
  });
  return wrapJsonResponse(res, "Failed to fetch available discounts");
};
var applyDiscountAction = async (params = {}) => {
  const payload = {
    source: params.source || "web",
    ...params.region_id ? { region_id: params.region_id } : {},
    ...params.code ? { code: params.code } : {},
    ...params.discount_id ? { discount_id: params.discount_id } : {}
  };
  const res = await fetch(`${getApiBaseUrl(params)}/api/discounts/apply`, {
    method: "POST",
    headers: await buildHeaders(params),
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  return wrapJsonResponse(res, "Failed to apply discount");
};
var removeDiscountAction = async (params = {}) => {
  const url = new URL(`${getApiBaseUrl(params)}/api/discounts/remove`);
  if (params.discount_id)
    url.searchParams.set("discount_id", String(params.discount_id));
  if (params.region_id) url.searchParams.set("region_id", params.region_id);
  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: await buildHeaders(params),
    cache: "no-store"
  });
  return wrapJsonResponse(res, "Failed to remove discount");
};
var trackDiscountEventAction = async (params = {}) => {
  const res = await fetch(
    `${getApiBaseUrl(params)}/api/discounts/track_event`,
    {
      method: "POST",
      headers: await buildHeaders(params),
      body: JSON.stringify({
        discount_id: params.discount_id,
        event_type: params.event_type,
        source: params.source,
        region_id: params.region_id
      }),
      cache: "no-store"
    }
  );
  return wrapJsonResponse(res, "Failed to track discount event");
};
var validateCartTotal = async (cartId, clientTotal, options = {}) => {
  if (!cartId) return { valid: false, reason: "no_cart_id" };
  try {
    const headers = await buildHeaders({ ...options, requireAuth: false });
    const base = getApiBaseUrl(options);
    const res = await fetch(`${base}/api/carts/${cartId}`, {
      method: "GET",
      headers,
      cache: "no-store"
    });
    const resData = await res.json();
    const cart = Array.isArray(resData) ? resData[0] : resData;
    const serverTotal = cart?.total ?? cart?.grand_total ?? cart?.total_amount ?? cart?.display_total ?? null;
    if (serverTotal === null) {
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
        cart
        // return the fresh cart so UI can update without an extra fetch
      };
    }
    return { valid: true, serverTotal: Number(serverTotal) };
  } catch (err) {
    console.error("[validateCartTotal] Error:", err);
    return { valid: true, reason: "validation_skipped" };
  }
};
var getProductsAction = async (query = {}, options = {}) => {
  let queryParams = query;
  let opt = { ...options };
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
    if (cache !== void 0) opt.cache = cache;
    if (revalidate !== void 0) opt.revalidate = revalidate;
    if (revalidation !== void 0) opt.revalidation = revalidation;
    if (forceRevalidate !== void 0) opt.forceRevalidate = forceRevalidate;
    if (tags !== void 0) opt.tags = tags;
    if (token !== void 0) opt.token = token;
    if (config !== void 0) opt.config = config;
    if (orgId !== void 0) opt.orgId = orgId;
    if (apiBaseUrl !== void 0) opt.apiBaseUrl = apiBaseUrl;
    queryParams = restQuery;
  }
  const queryStr = buildQueryString(queryParams);
  const url = `${getApiBaseUrl(opt)}/api/products${queryStr}`;
  const fetchConfig = await buildCachedFetchConfig(["products"], 604800, opt);
  return requestJson(url, fetchConfig, "Failed to fetch products");
};
var getProductByIdAction = async (productId, options = {}) => {
  if (!productId) return null;
  const url = `${getApiBaseUrl(options)}/api/products/${productId}`;
  const fetchConfig = await buildCachedFetchConfig(
    ["products", `product-${productId}`],
    604800,
    options
  );
  return requestJson(url, fetchConfig, "Failed to fetch product");
};
var getRelatedProductsAction = async (taxonId, options = {}) => {
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
    options
  );
  return requestJson(url, fetchConfig, "Failed to fetch related products");
};
var getTaxonByIdAction = async (taxonId, options = {}) => {
  if (!taxonId) return null;
  const url = `${getApiBaseUrl(options)}/api/taxons/${taxonId}`;
  const fetchConfig = await buildCachedFetchConfig(
    ["taxons", `taxon-${taxonId}`],
    86400,
    options
  );
  return requestJson(url, fetchConfig, "Failed to fetch taxon");
};
var getAllTaxonsAction = async (params = "", options = {}) => {
  let query = params;
  let opt = { ...options };
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
    if (cache !== void 0) opt.cache = cache;
    if (revalidate !== void 0) opt.revalidate = revalidate;
    if (revalidation !== void 0) opt.revalidation = revalidation;
    if (forceRevalidate !== void 0) opt.forceRevalidate = forceRevalidate;
    if (tags !== void 0) opt.tags = tags;
    if (token !== void 0) opt.token = token;
    if (config !== void 0) opt.config = config;
    if (orgId !== void 0) opt.orgId = orgId;
    if (apiBaseUrl !== void 0) opt.apiBaseUrl = apiBaseUrl;
    query = queryParams;
  }
  const queryStr = buildQueryString(query);
  const url = `${getApiBaseUrl(opt)}/api/taxons${queryStr}`;
  const fetchConfig = await buildCachedFetchConfig(["taxons"], 86400, opt);
  return requestJson(url, fetchConfig, "Failed to fetch taxons");
};
var getTaxonomiesAction = async (params = "", options = {}) => {
  let query = params;
  let opt = { ...options };
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
    if (cache !== void 0) opt.cache = cache;
    if (revalidate !== void 0) opt.revalidate = revalidate;
    if (revalidation !== void 0) opt.revalidation = revalidation;
    if (forceRevalidate !== void 0) opt.forceRevalidate = forceRevalidate;
    if (tags !== void 0) opt.tags = tags;
    if (token !== void 0) opt.token = token;
    if (config !== void 0) opt.config = config;
    if (orgId !== void 0) opt.orgId = orgId;
    if (apiBaseUrl !== void 0) opt.apiBaseUrl = apiBaseUrl;
    query = queryParams;
  }
  const queryStr = buildQueryString(query);
  const url = `${getApiBaseUrl(opt)}/api/taxonomies${queryStr}`;
  const fetchConfig = await buildCachedFetchConfig(["taxonomies"], 86400, opt);
  return requestJson(url, fetchConfig, "Failed to fetch taxonomies");
};
var getTaxonomyByIdAction = async (taxonomyId, options = {}) => {
  if (!taxonomyId) return null;
  const url = `${getApiBaseUrl(options)}/api/taxonomies/${taxonomyId}`;
  const fetchConfig = await buildCachedFetchConfig(
    ["taxonomies", `taxonomy-${taxonomyId}`],
    86400,
    options
  );
  return requestJson(url, fetchConfig, "Failed to fetch taxonomy");
};
var getProductsFilterAction = async (options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/filterable`;
  const fetchConfig = await buildCachedFetchConfig(
    ["filterable"],
    604800,
    options
  );
  return requestJson(url, fetchConfig, "Failed to fetch products filter");
};
var getRecentlyViewedProductsAction = async (page = 1, perPage = 15, options = {}) => {
  let opt = options;
  let p = page;
  let pp = perPage;
  if (typeof page === "object" && page !== null) {
    opt = page;
    p = opt.page || 1;
    pp = opt.perPage || opt.per_page || 15;
  }
  const token = await getServerToken(opt.token);
  if (!token) return { recently_viewed_products: [] };
  const queryParts = [];
  if (p) queryParts.push(`page=${p}`);
  if (pp) queryParts.push(`per_page=${pp}`);
  const queryStr = queryParts.length ? `?${queryParts.join("&")}` : "";
  const url = `${getApiBaseUrl(opt)}/api/recently_viewed_products${queryStr}`;
  const fetchConfig = {
    method: "GET",
    headers: await buildHeaders({ ...opt, token })
  };
  if (typeof window === "undefined") {
    fetchConfig.next = { tags: ["recently-viewed-products"], revalidate: 300 };
  } else {
    fetchConfig.cache = opt.cache || "no-store";
  }
  return requestJson(
    url,
    fetchConfig,
    "Failed to fetch recently viewed products"
  );
};
var getLikedProductsAction = async (options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/product_likes`;
  return requestJson(
    url,
    {
      method: "GET",
      headers: await buildHeaders(options),
      cache: "no-store"
    },
    "Failed to fetch liked products"
  );
};
var likeProductAction = async (body, options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/product_likes`;
  return requestJson(
    url,
    {
      method: "POST",
      headers: await buildHeaders(options),
      body: JSON.stringify(body),
      cache: "no-store"
    },
    "Failed to like product"
  );
};
var unlikeProductAction = async (id, options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/product_likes/${id}`;
  return requestJson(
    url,
    {
      method: "DELETE",
      headers: await buildHeaders(options),
      cache: "no-store"
    },
    "Failed to unlike product"
  );
};
var getCurrentUserLikedProductsAction = async (page = 1, perPage = 100, options = {}) => {
  let opt = options;
  let p = page;
  let pp = perPage;
  if (typeof page === "object" && page !== null) {
    opt = page;
    p = opt.page || 1;
    pp = opt.perPage || opt.per_page || 100;
  }
  const token = await getServerToken(opt.token);
  if (!token) return [];
  const queryParts = [];
  if (p) queryParts.push(`page=${p}`);
  if (pp) queryParts.push(`per_page=${pp}`);
  const queryStr = queryParts.length ? `?${queryParts.join("&")}` : "";
  const url = `${getApiBaseUrl(opt)}/api/current_user_liked_products${queryStr}`;
  const fetchConfig = {
    method: "GET",
    headers: await buildHeaders({ ...opt, token })
  };
  if (typeof window === "undefined") {
    fetchConfig.next = { tags: ["LikedProducts"], revalidate: 300 };
  } else {
    fetchConfig.cache = opt.cache || "no-store";
  }
  return requestJson(
    url,
    fetchConfig,
    "Failed to fetch current user liked products"
  );
};
var getProductsByIdsAction = async (productIds = [], options = {}) => {
  if (!productIds.length) return [];
  const params = productIds.map((pid) => `ids[]=${pid}`).join("&");
  const url = `${getApiBaseUrl(options)}/api/products?${params}&per_page=${productIds.length}`;
  const fetchConfig = await buildCachedFetchConfig(
    ["products"],
    604800,
    options
  );
  const data = await requestJson(
    url,
    fetchConfig,
    "Failed to fetch products by ids"
  );
  return data?.products ?? data?.data ?? (Array.isArray(data) ? data : []);
};
var getOrganizationAction = async (options = {}) => {
  const orgId = options?.organizationId || options?.id || getOrganizationId(options);
  const url = orgId ? `${getApiBaseUrl(options)}/api/organizations/${orgId}` : `${getApiBaseUrl(options)}/api/organizations`;
  const fetchConfig = await buildCachedFetchConfig(
    ["organizations"],
    86400,
    options
  );
  return requestJson(url, fetchConfig, "Failed to fetch organization");
};
var getOrgVideosAction = async (options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/organization_videos`;
  const fetchConfig = await buildCachedFetchConfig(
    ["organization-videos"],
    86400,
    options
  );
  return requestJson(url, fetchConfig, "Failed to fetch organization videos");
};
var getRegionsAction = async (options = {}) => {
  const url = `${getApiBaseUrl(options)}/api/regions`;
  const fetchConfig = await buildCachedFetchConfig(
    ["regions"],
    3600,
    options
  );
  try {
    const res = await requestJson(url, fetchConfig, "Failed to fetch regions");
    return Array.isArray(res) ? res : res?.data || [];
  } catch (err) {
    console.warn("[storefrontActions] getRegionsAction error:", err);
    return [];
  }
};

export { applyDiscountAction, buildHeaders, configureStorefront, createAddressAction, createCartAction, createCartPaymentAction, createLineItemAction, createPhonePeOrderAction, createRazorpayOrderAction, createStripePaymentIntentAction, deleteAddressAction, deleteLineItemAction, getAddressesAction, getAllTaxonsAction, getApiBaseUrl, getAvailableDiscountsAction, getCartAction, getCartByIdAction, getCurrentUserLikedProductsAction, getEnv, getLikedProductsAction, getOrderByIdAction, getOrderInvoiceAction, getOrdersAction, getOrgVideosAction, getOrganizationAction, getOrganizationId, getProductByIdAction, getProductsAction, getProductsByIdsAction, getProductsFilterAction, getRecentlyViewedProductsAction, getRegionsAction, getRelatedProductsAction, getServerToken, getStorefrontGlobalConfig, getTaxonByIdAction, getTaxonomiesAction, getTaxonomyByIdAction, getUserAction, likeProductAction, loginUser, removeDiscountAction, revalidateCacheTag, signUpUser, trackDiscountEventAction, unlikeProductAction, updateAddressAction, updateCartAction, updateCartIdLineItemsAction, updateCartPaymentAction, updateLineItemAction, updatePhonePePaymentAction, updateRazorpayPaymentAction, updateUserAction, validateCartTotal, verifyOtp };
//# sourceMappingURL=chunk-JOF77JD5.js.map
//# sourceMappingURL=chunk-JOF77JD5.js.map