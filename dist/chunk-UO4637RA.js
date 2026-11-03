import { getApiBaseUrl, buildHeaders } from './chunk-LDADU2LN.js';

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

export { applyDiscount, removeDiscountById };
//# sourceMappingURL=chunk-UO4637RA.js.map
//# sourceMappingURL=chunk-UO4637RA.js.map