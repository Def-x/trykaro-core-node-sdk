import { getApiBaseUrl, wrapJsonResponse, buildHeaders } from './chunk-EV4KF7EK.js';

// src/actions/discountActions.ts
var buildHeaders2 = async (token, orgId) => buildHeaders({ token, orgId, json: true, requireAuth: false });
var wrapResponse = async (res, fallbackMessage) => {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(
      data?.error || data?.message || fallbackMessage || "Discount action failed"
    );
    err.data = data;
    err.status = res.status;
    throw err;
  }
  return data;
};
var removeDiscountById = async ({
  token,
  discount_id,
  region_id,
  apiBaseUrl,
  orgId
} = {}) => {
  const baseUrl = getApiBaseUrl({ apiBaseUrl, orgId });
  if (!baseUrl) throw new Error("API base URL is not configured");
  const url = new URL(`${baseUrl}/api/discounts/remove`);
  if (discount_id) url.searchParams.set("discount_id", String(discount_id));
  if (region_id) url.searchParams.set("region_id", region_id);
  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: await buildHeaders2(token, orgId),
    cache: "no-store"
  });
  return wrapResponse(res, "Failed to remove discount");
};
var applyDiscount = async ({
  token,
  code,
  discount_id,
  source,
  region_id,
  apiBaseUrl,
  orgId
} = {}) => {
  const baseUrl = getApiBaseUrl({ apiBaseUrl, orgId });
  if (!baseUrl) throw new Error("API base URL is not configured");
  const url = new URL(`${baseUrl}/api/discounts/apply`);
  const payload = {
    source: source || "web"
  };
  if (code) payload.code = code;
  if (discount_id) payload.discount_id = discount_id;
  if (region_id) payload.region_id = region_id;
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: await buildHeaders2(token, orgId),
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  return wrapResponse(res, "Failed to apply discount");
};

// src/actions/loyaltyActions.ts
var buildHeaders3 = async (options = {}) => {
  return buildHeaders({
    token: options.token,
    orgId: options.orgId,
    config: options.config,
    adapter: options.adapter,
    json: true,
    requireAuth: false
  });
};
var getLoyaltyProfileAction = async (options = {}) => {
  const apiBaseUrl = getApiBaseUrl(options);
  if (!apiBaseUrl) {
    return { success: false, customer: null };
  }
  try {
    const headers = await buildHeaders3(options);
    const res = await fetch(`${apiBaseUrl}/api/loyalty/profile`, {
      method: "GET",
      headers,
      cache: options.cache || "no-store"
    });
    const data = await wrapJsonResponse(res, "Failed to fetch loyalty profile");
    if (data?.customer || data?.success) {
      return data;
    }
    return { success: false, customer: null };
  } catch (err) {
    return { success: false, customer: null, serverError: err?.message };
  }
};
var getLoyaltyRewardsAction = async (options = {}) => {
  const apiBaseUrl = getApiBaseUrl(options);
  if (!apiBaseUrl) {
    return { success: false, available_points: 0, rewards: [] };
  }
  try {
    const headers = await buildHeaders3(options);
    const res = await fetch(`${apiBaseUrl}/api/loyalty/rewards`, {
      method: "GET",
      headers,
      cache: options.cache || "no-store"
    });
    const data = await wrapJsonResponse(res, "Failed to fetch loyalty rewards");
    if (data && (Array.isArray(data?.rewards) || data?.available_points !== void 0)) {
      return data;
    }
    return { success: false, available_points: 0, rewards: [] };
  } catch (err) {
    return { success: false, available_points: 0, rewards: [], serverError: err?.message };
  }
};
var getLoyaltyTransactionsAction = async (params = {}, options = {}) => {
  const page = params.page || 1;
  const perPage = params.per_page || 20;
  const apiBaseUrl = getApiBaseUrl(options);
  if (!apiBaseUrl) {
    return { success: false, total_count: 0, page, per_page: perPage, transactions: [] };
  }
  try {
    const headers = await buildHeaders3(options);
    const query = new URLSearchParams({
      page: String(page),
      per_page: String(perPage)
    }).toString();
    const res = await fetch(`${apiBaseUrl}/api/loyalty/transactions?${query}`, {
      method: "GET",
      headers,
      cache: options.cache || "no-store"
    });
    const data = await wrapJsonResponse(res, "Failed to fetch loyalty transactions");
    if (data && (Array.isArray(data?.transactions) || data?.success)) {
      return data;
    }
    return { success: false, total_count: 0, page, per_page: perPage, transactions: [] };
  } catch (err) {
    return {
      success: false,
      total_count: 0,
      page,
      per_page: perPage,
      transactions: [],
      serverError: err?.message
    };
  }
};
var applyLoyaltyPointsAction = async (payload, options = {}) => {
  const apiBaseUrl = getApiBaseUrl(options);
  if (!apiBaseUrl) {
    return { success: false, serverError: "API base URL is not configured" };
  }
  try {
    const headers = await buildHeaders3(options);
    const res = await fetch(`${apiBaseUrl}/api/loyalty/checkout/apply`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        cart_id: payload.cart_id,
        points_to_use: Number(payload.points_to_use)
      }),
      cache: "no-store"
    });
    const data = await wrapJsonResponse(res, "Failed to apply loyalty points");
    return data || { success: false, serverError: "Failed to apply loyalty points" };
  } catch (err) {
    return { success: false, serverError: err?.message || "Failed to apply loyalty points" };
  }
};

export { applyDiscount, applyLoyaltyPointsAction, getLoyaltyProfileAction, getLoyaltyRewardsAction, getLoyaltyTransactionsAction, removeDiscountById };
//# sourceMappingURL=chunk-FU6T37BZ.js.map
//# sourceMappingURL=chunk-FU6T37BZ.js.map