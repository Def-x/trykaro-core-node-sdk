import { e as RequestOptions } from './storefrontActions-OXYgf5q4.js';

/**
 * Safely retrieve an environment variable in any environment (Node, Next.js, Vite, browser)
 * without throwing `ReferenceError: process is not defined`.
 */
declare const getEnv: (key: string) => string | undefined;
interface StorefrontGlobalConfig {
    apiBaseUrl?: string;
    storeId?: string;
    orgId?: string;
    countryCode?: string;
    currency?: string;
    adapter?: {
        getServerToken?: () => Promise<string | null> | string | null;
        [key: string]: any;
    };
    [key: string]: any;
}
/**
 * Configure the storefront SDK globally with API endpoints, organization/store IDs, etc.
 * When set, all actions will automatically use these settings as fallbacks when call-specific
 * options are omitted.
 */
declare const configureStorefront: (config: Partial<StorefrontGlobalConfig>) => void;
/**
 * Get the current global storefront configuration.
 */
declare const getStorefrontGlobalConfig: () => StorefrontGlobalConfig;
/**
 * Resolve the API base URL from (in priority order):
 *  1. `options.config.apiBaseUrl`
 *  2. `options.apiBaseUrl`
 *  3. `globalConfig.apiBaseUrl` (set via configureStorefront or <CoreProvider>)
 *  4. `process.env.NEXT_PUBLIC_API_BASE_URL` (safe check)
 *  5. `process.env.API_BASE_URL` (safe check)
 *  6. Empty string (caller must validate)
 */
declare const getApiBaseUrl: (options?: RequestOptions) => string;
/**
 * Resolve the organisation / store ID from (in priority order):
 *  1. `options.config.storeId`
 *  2. `options.orgId`
 *  3. `globalConfig.storeId` || `globalConfig.orgId`
 *  4. `process.env.NEXT_PUBLIC_ORGANIZATION_ID` (safe check)
 *  5. `process.env.ORG_ID` (safe check)
 *  6. `null`
 */
declare const getOrganizationId: (options?: RequestOptions) => string | null;
/**
 * Resolve the auth token for the current request:
 *
 * 1. Explicit token passed in `token` parameter.
 * 2. Host framework adapter token (`options.adapter?.getServerToken` or `globalConfig.adapter?.getServerToken`).
 * 3. Client-side: `localStorage.access_token` → `localStorage.token`.
 * 4. Server-side (Next.js): dynamic import of `next/headers` cookies.
 */
declare const getServerToken: (token?: string | null | false, options?: RequestOptions) => Promise<string | null>;
/**
 * Build the HTTP request headers for a Defx storefront API call.
 */
declare const buildHeaders: ({ token, orgId, config, adapter, json, requireAuth, }?: RequestOptions & {
    json?: boolean;
    requireAuth?: boolean;
}) => Promise<Record<string, string>>;
/**
 * Revalidate an on-demand cache tag.
 * Uses injected adapter if provided, otherwise falls back safely to Next.js `next/cache`.
 */
declare const revalidateCacheTag: (tag: string, options?: RequestOptions) => Promise<void>;

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
/**
 * Remove a discount from the cart.
 *
 * DELETE {API_BASE_URL}/api/discounts/remove?discount_id=[discount_id]
 *
 * @param {{ token: string, discount_id: string|number, region_id?: string }} params
 */
declare const removeDiscountById: ({ token, discount_id, region_id, apiBaseUrl, orgId, }?: {
    token?: string | null;
    discount_id?: string | number;
    region_id?: string;
    apiBaseUrl?: string;
    orgId?: string;
}) => Promise<any>;
/**
 * Apply a discount to the cart.
 *
 * POST {API_BASE_URL}/api/discounts/apply
 *
 * @param {{ token: string, code?: string, discount_id?: string|number, source?: string, region_id?: string }} params
 */
declare const applyDiscount: ({ token, code, discount_id, source, region_id, apiBaseUrl, orgId, }?: {
    token?: string | null;
    code?: string;
    discount_id?: string | number;
    source?: string;
    region_id?: string;
    apiBaseUrl?: string;
    orgId?: string;
}) => Promise<any>;

interface LoyaltyCustomer {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    email: string | null;
    date_of_birth: string | null;
    available_points: number;
    monetary_value_inr: number;
    points_name: string;
    total_earned: number;
    total_redeemed: number;
    total_expired: number;
    total_reversed: number;
    referral_code: string;
    referral_link: string;
    tier?: string;
    pending_points?: number;
    [key: string]: any;
}
interface LoyaltyProfileResponse {
    success: boolean;
    customer?: LoyaltyCustomer;
    serverError?: string;
    message?: string;
    [key: string]: any;
}
interface LoyaltyRewardItem {
    id: string | number;
    title: string;
    description?: string;
    points_required: number;
    discount_amount?: number;
    discount_type?: "percentage" | "fixed" | string;
    is_claimed?: boolean;
    code?: string;
    expires_at?: string;
    [key: string]: any;
}
interface LoyaltyRewardsResponse {
    success: boolean;
    available_points: number;
    rewards: LoyaltyRewardItem[];
    serverError?: string;
    message?: string;
    [key: string]: any;
}
interface ApplyLoyaltyPointsPayload {
    cart_id: string | number;
    points_to_use: number;
    region_id?: string | null;
}
interface ApplyLoyaltyPointsResponse {
    success?: boolean;
    cart_id?: string | number;
    points_to_use?: number;
    discount_amount?: number;
    cart?: any;
    serverError?: string;
    message?: string;
    [key: string]: any;
}
interface LoyaltyActivityItem {
    id: string | number;
    activity_name: string;
    reference_title?: string;
    date: string;
    points_delta: number;
    status: "Available" | "Redeemed" | "Expired" | "Pending" | string;
    expiry_date?: string;
    order_id?: string | number;
    type?: "earned" | "redeemed" | "expired" | "bonus" | "signup";
}
interface LoyaltyExpiringBatch {
    id: string | number;
    batch_number: string;
    points: number;
    expiry_date: string;
    days_left: number;
    status: "expiring_soon" | "active" | "expired";
}
interface LoyaltyTransactionMetadata {
    details?: any;
    rule_name?: string;
    event_type?: string;
    action_type?: string;
    [key: string]: any;
}
interface LoyaltyTransaction {
    id: string;
    transaction_type: "earned" | "redeemed" | "expired" | string;
    points: number;
    status: "completed" | "pending" | "failed" | string;
    source_type: string;
    source_id?: string;
    created_at: string;
    metadata?: LoyaltyTransactionMetadata | null;
    [key: string]: any;
}
interface LoyaltyTransactionsResponse {
    success: boolean;
    total_count: number;
    page: number;
    per_page: number;
    transactions: LoyaltyTransaction[];
    serverError?: string;
    message?: string;
    [key: string]: any;
}
interface GetLoyaltyTransactionsParams {
    page?: number;
    per_page?: number;
    token?: string | null;
    config?: any;
    apiBaseUrl?: string;
    orgId?: string;
    headers?: Record<string, string>;
    [key: string]: any;
}
interface LoyaltyEarnMethod {
    id: string;
    title: string;
    badge: string;
    badgeColor?: string;
    description: string;
    footerLeft: string;
    footerRight: string;
    actionType?: "shop" | "first_order" | "referral" | "birthday" | "review" | "tier";
    actionLabel?: string;
    claimed?: boolean;
    active?: boolean;
    progress?: {
        current: number;
        target: number;
        percentage: number;
    };
}

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

/**
 * Fetch the customer's loyalty profile, available points, conversion value, and referral data.
 *
 * GET {API_BASE_URL}/api/loyalty/profile
 */
declare const getLoyaltyProfileAction: (options?: RequestOptions) => Promise<LoyaltyProfileResponse>;
/**
 * Fetch available loyalty rewards for redemption.
 *
 * GET {API_BASE_URL}/api/loyalty/rewards
 */
declare const getLoyaltyRewardsAction: (options?: RequestOptions) => Promise<LoyaltyRewardsResponse>;
/**
 * Fetch customer's loyalty ledger transactions with pagination.
 *
 * GET {API_BASE_URL}/api/loyalty/transactions?page={page}&per_page={per_page}
 */
declare const getLoyaltyTransactionsAction: (params?: {
    page?: number;
    per_page?: number;
}, options?: RequestOptions) => Promise<LoyaltyTransactionsResponse>;
/**
 * Apply loyalty points to checkout cart for order discount.
 *
 * POST {API_BASE_URL}/api/loyalty/checkout/apply
 * Body: { cart_id: string, points_to_use: number }
 */
declare const applyLoyaltyPointsAction: (payload: ApplyLoyaltyPointsPayload, options?: RequestOptions) => Promise<ApplyLoyaltyPointsResponse>;

export { type ApplyLoyaltyPointsResponse as A, type GetLoyaltyTransactionsParams as G, type LoyaltyProfileResponse as L, type LoyaltyCustomer as a, type LoyaltyRewardItem as b, type LoyaltyTransaction as c, type ApplyLoyaltyPointsPayload as d, type LoyaltyActivityItem as e, type LoyaltyEarnMethod as f, type LoyaltyExpiringBatch as g, type LoyaltyRewardsResponse as h, type LoyaltyTransactionMetadata as i, type LoyaltyTransactionsResponse as j, applyDiscount as k, applyLoyaltyPointsAction as l, buildHeaders as m, configureStorefront as n, getApiBaseUrl as o, getEnv as p, getLoyaltyProfileAction as q, getLoyaltyRewardsAction as r, getLoyaltyTransactionsAction as s, getOrganizationId as t, getServerToken as u, getStorefrontGlobalConfig as v, removeDiscountById as w, revalidateCacheTag as x };
