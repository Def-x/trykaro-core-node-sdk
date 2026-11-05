/**
 * Discount API actions — @defx/storefront-core
 *
 * Plain async fetch helpers for discount operations.
 * No "use server" directive — this file is bundled by tsup (esbuild) and
 * "use server" is a Next.js-only directive that breaks package builds.
 *
 * process.env.API_BASE_URL and process.env.ORG_ID are resolved
 * from the host Next.js project's environment at server runtime.
 */

import {
  buildHeaders as buildRequestHeaders,
  getApiBaseUrl,
} from "../utils/request";

const buildHeaders = async (
  token?: string | null,
  orgId?: string,
): Promise<Record<string, string>> =>
  buildRequestHeaders({ token, orgId, json: true, requireAuth: false });

const wrapResponse = async (res: Response, fallbackMessage: string): Promise<any> => {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err: any = new Error(
      data?.error ||
        data?.message ||
        fallbackMessage ||
        "Discount action failed",
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
export const removeDiscountById = async ({
  token,
  discount_id,
  region_id,
  apiBaseUrl,
  orgId,
}: {
  token?: string | null;
  discount_id?: string | number;
  region_id?: string;
  apiBaseUrl?: string;
  orgId?: string;
} = {}): Promise<any> => {
  const baseUrl = getApiBaseUrl({ apiBaseUrl, orgId });
  if (!baseUrl) throw new Error("API base URL is not configured");

  const url = new URL(`${baseUrl}/api/discounts/remove`);
  if (discount_id) url.searchParams.set("discount_id", String(discount_id));
  if (region_id) url.searchParams.set("region_id", region_id);

  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: await buildHeaders(token, orgId),
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
export const applyDiscount = async ({
  token,
  code,
  discount_id,
  source,
  region_id,
  apiBaseUrl,
  orgId,
}: {
  token?: string | null;
  code?: string;
  discount_id?: string | number;
  source?: string;
  region_id?: string;
  apiBaseUrl?: string;
  orgId?: string;
} = {}): Promise<any> => {
  const baseUrl = getApiBaseUrl({ apiBaseUrl, orgId });
  if (!baseUrl) throw new Error("API base URL is not configured");

  const url = new URL(`${baseUrl}/api/discounts/apply`);

  const payload: Record<string, unknown> = {
    source: source || "web",
  };

  if (code) payload.code = code;
  if (discount_id) payload.discount_id = discount_id;
  if (region_id) payload.region_id = region_id;

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: await buildHeaders(token, orgId),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return wrapResponse(res, "Failed to apply discount");
};
