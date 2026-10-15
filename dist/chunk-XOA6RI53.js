// src/actions/discountActions.js
var buildHeaders = (token, orgId) => {
  const headers = {
    "Content-Type": "application/json",
    accept: "application/vnd.defx-store.v2"
  };
  if (orgId) {
    headers["Set-Organization"] = orgId;
  } else if (process.env.NEXT_PUBLIC_ORGANIZATION_ID) {
    headers["Set-Organization"] = process.env.NEXT_PUBLIC_ORGANIZATION_ID;
  } else if (process.env.ORG_ID) {
    headers["Set-Organization"] = process.env.ORG_ID;
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
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
  const baseUrl = apiBaseUrl || process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new Error("API base URL is not configured");
  const url = new URL(`${baseUrl}/api/discounts/remove`);
  if (discount_id) url.searchParams.set("discount_id", discount_id);
  if (region_id) url.searchParams.set("region_id", region_id);
  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: buildHeaders(token, orgId),
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
  const baseUrl = apiBaseUrl || process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
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
    headers: buildHeaders(token, orgId),
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  return wrapResponse(res, "Failed to apply discount");
};

export { applyDiscount, removeDiscountById };
//# sourceMappingURL=chunk-XOA6RI53.js.map
//# sourceMappingURL=chunk-XOA6RI53.js.map