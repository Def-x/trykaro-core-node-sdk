/**
 * Loyalty & Rewards API actions — @defx/storefront-core
 *
 * Plain async fetch helpers for loyalty operations.
 * No "use server" directive — this file is bundled by tsup (esbuild) and
 * "use server" is a Next.js-only directive that breaks package builds.
 *
 * Base URL and Org ID are resolved via request utilities from
 * SDK configuration or environment variables.
 */

import {
  buildHeaders as buildRequestHeaders,
  getApiBaseUrl,
  wrapJsonResponse,
} from "../utils/request";
import type { RequestOptions } from "../types/actions";
import type {
  LoyaltyProfileResponse,
  LoyaltyRewardsResponse,
  LoyaltyTransactionsResponse,
  ApplyLoyaltyPointsPayload,
  ApplyLoyaltyPointsResponse,
} from "../types/loyalty";

const buildHeaders = async (options: RequestOptions = {}) => {
  return buildRequestHeaders({
    token: options.token,
    orgId: options.orgId,
    config: options.config,
    adapter: options.adapter,
    json: true,
    requireAuth: false,
  });
};

/**
 * Fetch the customer's loyalty profile, available points, conversion value, and referral data.
 *
 * GET {API_BASE_URL}/api/loyalty/profile
 */
export const getLoyaltyProfileAction = async (
  options: RequestOptions = {},
): Promise<LoyaltyProfileResponse> => {
  const apiBaseUrl = getApiBaseUrl(options);
  if (!apiBaseUrl) {
    return { success: false, customer: null as any };
  }

  try {
    const headers = await buildHeaders(options);
    const res = await fetch(`${apiBaseUrl}/api/loyalty/profile`, {
      method: "GET",
      headers,
      cache: options.cache || "no-store",
    });

    const data = await wrapJsonResponse(res, "Failed to fetch loyalty profile");
    if (data?.customer || data?.success) {
      return data;
    }
    return { success: false, customer: null as any };
  } catch (err: any) {
    return { success: false, customer: null as any, serverError: err?.message };
  }
};

/**
 * Fetch available loyalty rewards for redemption.
 *
 * GET {API_BASE_URL}/api/loyalty/rewards
 */
export const getLoyaltyRewardsAction = async (
  options: RequestOptions = {},
): Promise<LoyaltyRewardsResponse> => {
  const apiBaseUrl = getApiBaseUrl(options);
  if (!apiBaseUrl) {
    return { success: false, available_points: 0, rewards: [] };
  }

  try {
    const headers = await buildHeaders(options);
    const res = await fetch(`${apiBaseUrl}/api/loyalty/rewards`, {
      method: "GET",
      headers,
      cache: options.cache || "no-store",
    });

    const data = await wrapJsonResponse(res, "Failed to fetch loyalty rewards");
    if (data && (Array.isArray(data?.rewards) || data?.available_points !== undefined)) {
      return data;
    }
    return { success: false, available_points: 0, rewards: [] };
  } catch (err: any) {
    return { success: false, available_points: 0, rewards: [], serverError: err?.message };
  }
};

/**
 * Fetch customer's loyalty ledger transactions with pagination.
 *
 * GET {API_BASE_URL}/api/loyalty/transactions?page={page}&per_page={per_page}
 */
export const getLoyaltyTransactionsAction = async (
  params: { page?: number; per_page?: number } = {},
  options: RequestOptions = {},
): Promise<LoyaltyTransactionsResponse> => {
  const page = params.page || 1;
  const perPage = params.per_page || 20;
  const apiBaseUrl = getApiBaseUrl(options);

  if (!apiBaseUrl) {
    return { success: false, total_count: 0, page, per_page: perPage, transactions: [] };
  }

  try {
    const headers = await buildHeaders(options);
    const query = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    }).toString();

    const res = await fetch(`${apiBaseUrl}/api/loyalty/transactions?${query}`, {
      method: "GET",
      headers,
      cache: options.cache || "no-store",
    });

    const data = await wrapJsonResponse(res, "Failed to fetch loyalty transactions");
    if (data && (Array.isArray(data?.transactions) || data?.success)) {
      return data;
    }
    return { success: false, total_count: 0, page, per_page: perPage, transactions: [] };
  } catch (err: any) {
    return {
      success: false,
      total_count: 0,
      page,
      per_page: perPage,
      transactions: [],
      serverError: err?.message,
    };
  }
};

/**
 * Apply loyalty points to checkout cart for order discount.
 *
 * POST {API_BASE_URL}/api/loyalty/checkout/apply
 * Body: { cart_id: string, points_to_use: number }
 */
export const applyLoyaltyPointsAction = async (
  payload: ApplyLoyaltyPointsPayload,
  options: RequestOptions = {},
): Promise<ApplyLoyaltyPointsResponse> => {
  const apiBaseUrl = getApiBaseUrl(options);
  if (!apiBaseUrl) {
    return { success: false, serverError: "API base URL is not configured" };
  }

  try {
    const headers = await buildHeaders(options);
    const res = await fetch(`${apiBaseUrl}/api/loyalty/checkout/apply`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        cart_id: payload.cart_id,
        points_to_use: Number(payload.points_to_use),
      }),
      cache: "no-store",
    });

    const data = await wrapJsonResponse(res, "Failed to apply loyalty points");
    return data || { success: false, serverError: "Failed to apply loyalty points" };
  } catch (err: any) {
    return { success: false, serverError: err?.message || "Failed to apply loyalty points" };
  }
};
