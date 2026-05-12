"use server";

/**
 * Discount API actions — @defx/storefront-core
 *
 * Server actions used directly by CouponSection.
 * Next.js bundles these on the server and creates an RPC bridge
 * so "use client" components can call them seamlessly.
 *
 * process.env.API_BASE_URL and process.env.ORG_ID are resolved
 * from the host Next.js project's environment at server runtime.
 */

const buildHeaders = (token) => ({
  "Content-Type": "application/json",
  accept: "application/vnd.defx-store.v2",
  "Set-Organization": process.env.ORG_ID,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const wrapResponse = async (res, fallbackMessage) => {
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

/**
 * Remove a discount from the cart.
 *
 * DELETE {API_BASE_URL}/api/discounts/remove?discount_id=[discount_id]
 *
 * @param {{ token: string, discount_id: string|number, region_id?: string }} params
 */
export const removeDiscountById = async ({ token, discount_id, region_id } = {}) => {
  const url = new URL(`${process.env.API_BASE_URL}/api/discounts/remove`);
  if (discount_id) url.searchParams.set("discount_id", discount_id);
  if (region_id) url.searchParams.set("region_id", region_id);

  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: buildHeaders(token),
    cache: "no-store",
  });

  return wrapResponse(res, "Failed to remove discount");
};

/**
 * Apply a discount to the cart.
 *
 * POST {API_BASE_URL}/api/discounts/apply
 *
 * @param {{ token: string, code?: string, discount_id?: string|number, source?: string, region_id?: string }} params
 */
export const applyDiscount = async ({ token, code, discount_id, source, region_id } = {}) => {
  const url = new URL(`${process.env.API_BASE_URL}/api/discounts/apply`);

  const payload = {
    source: source || "web",
  };

  if (code) payload.code = code;
  if (discount_id) payload.discount_id = discount_id;
  if (region_id) payload.region_id = region_id;

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  console.log({ res })
  return wrapResponse(res, "Failed to apply discount");
};
