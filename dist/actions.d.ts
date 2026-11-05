import { e as RequestOptions } from './storefrontActions-DUB35HyN.js';
export { f as applyDiscountAction, g as createAddressAction, h as createCartAction, c as createCartPaymentAction, i as createLineItemAction, a as createPhonePeOrderAction, j as createRazorpayOrderAction, k as createStripePaymentIntentAction, l as deleteAddressAction, m as deleteLineItemAction, n as getAddressesAction, o as getAllTaxonsAction, p as getAvailableDiscountsAction, q as getCartAction, r as getCartByIdAction, s as getCurrentUserLikedProductsAction, t as getLikedProductsAction, v as getOrderByIdAction, w as getOrderInvoiceAction, x as getOrdersAction, y as getOrgVideosAction, z as getOrganizationAction, A as getProductByIdAction, B as getProductsAction, C as getProductsByIdsAction, D as getProductsFilterAction, E as getRecentlyViewedProductsAction, F as getRelatedProductsAction, G as getTaxonByIdAction, H as getTaxonomiesAction, I as getTaxonomyByIdAction, J as getUserAction, K as likeProductAction, L as loginUser, M as removeDiscountAction, N as signUpUser, O as trackDiscountEventAction, P as unlikeProductAction, Q as updateAddressAction, T as updateCartAction, U as updateCartIdLineItemsAction, u as updateCartPaymentAction, V as updateLineItemAction, b as updatePhonePePaymentAction, W as updateRazorpayPaymentAction, X as updateUserAction, Y as validateCartTotal, Z as verifyOtp } from './storefrontActions-DUB35HyN.js';

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

export { RequestOptions, applyDiscount, buildHeaders, configureStorefront, getApiBaseUrl, getEnv, getOrganizationId, getServerToken, getStorefrontGlobalConfig, removeDiscountById, revalidateCacheTag };
