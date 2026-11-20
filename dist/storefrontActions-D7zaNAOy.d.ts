interface Region {
    id?: string | number;
    name?: string;
    currency?: string;
    currencySymbol?: string;
    locale?: string;
    currency_symbol?: string;
    invoice_setting?: {
        currency_symbol?: string;
    };
    payment_gateway?: string;
    payment_config?: Record<string, any>;
    [key: string]: any;
}
interface StorefrontConfig {
    storeId?: string;
    orgId?: string;
    apiBaseUrl?: string;
    regionId?: string | null;
    currency?: string;
    currencySymbol?: string;
    locale?: string;
    authType?: 'clerk' | 'own';
    countryCode?: string;
    otpLength?: number;
    termsUrl?: string;
    privacyUrl?: string;
    refundUrl?: string;
    returnUrl?: string;
    isRegion?: boolean;
    activeRegion?: Region | null;
    region?: Region | null;
    primaryColor?: string;
    secondaryColor?: string;
    posthogDeveloperToken?: string;
    posthogDeveloperHost?: string;
    enablePosthogInDev?: boolean;
    [key: string]: any;
}

/**
 * Common options accepted by all storefront action helpers.
 * All fields are optional to allow partial overrides at the call site.
 */
interface RequestOptions {
    /** Bearer token for the current user. Pass `null` or `false` to skip auth. */
    token?: string | null | false;
    /** Organisation / store identifier. Falls back to env vars if omitted. */
    orgId?: string;
    /** Full SDK config object. apiBaseUrl and storeId are read from here if present. */
    config?: StorefrontConfig;
    /** Explicit API base URL. Overrides `config.apiBaseUrl` and env vars. */
    apiBaseUrl?: string;
    /** Next.js fetch `cache` option (e.g. `"no-store"` or `"force-cache"`). */
    cache?: RequestCache | 'no-store' | 'force-cache' | string | any;
    /** Next.js ISR revalidation seconds. `0` bypasses the cache entirely. */
    revalidate?: number | false;
    /** Boolean shorthand for revalidation */
    revalidation?: boolean;
    /** Force revalidation flag */
    forceRevalidate?: boolean;
    /** Next.js cache tags to associate with the request. */
    tags?: string[];
    /** Throw an Unauthorized error if no auth token is available. */
    requireAuth?: boolean;
    /** Set the `Content-Type: application/json` header (default `true`). */
    json?: boolean;
    /** Optional framework adapter overrides for server token, router, etc. */
    adapter?: any;
    /**
     * Error tolerance mode — controls whether failures throw or return an
     * error-shaped object.
     */
    tolerance?: 'throw' | 'return' | number | any;
    /** Index signature for any extra options passed through */
    [key: string]: any;
}
/**
 * All action methods exposed by the storefront SDK.
 * Each method is optional so that partial implementations (e.g. mock
 * adapters used in tests) don't need to implement the full surface.
 *
 * Return types are `Promise<any>` for now and will be tightened in a
 * future minor release once the response shapes are fully documented.
 */
interface StorefrontActions {
    /** Fetch the current user's active cart. */
    getCart?: (regionId?: string | null, options?: RequestOptions) => Promise<any>;
    /** Fetch a specific cart by its ID. */
    getCartById?: (cartId: string | number, regionId?: string | null, options?: RequestOptions) => Promise<any>;
    /** Create a new cart. */
    createCart?: (body?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Update an existing cart. */
    updateCart?: (cartId: string | number, payload: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Add a new line item to the cart. */
    createLineItem?: (body?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Update a line item (e.g. change quantity). */
    updateLineItem?: (lineItemId: string | number, body: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Remove a line item from the cart. */
    deleteLineItem?: (lineItemId: string | number, options?: RequestOptions) => Promise<any>;
    /** Create a Razorpay order for the given cart. */
    createRazorOrder?: (cartId: string | number, options?: RequestOptions) => Promise<any>;
    /** Confirm / update a Razorpay payment after the gateway callback. */
    updateRazorPayment?: (paymentId: string | number, razorpayPaymentId: string, options?: RequestOptions) => Promise<any>;
    /** Create a generic cart payment record. */
    createCartPayment?: (cartId: string | number, options?: RequestOptions) => Promise<any>;
    /** Update a generic cart payment record. */
    updateCartPayment?: (paymentId: string | number, data?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Create a PhonePe payment order (alias for createCartPayment). */
    createPhonePeOrder?: (cartId: string | number, options?: RequestOptions) => Promise<any>;
    /** Update a PhonePe payment after the gateway callback. */
    updatePhonePePayment?: (paymentId: string | number, phonepeData?: Record<string, unknown> | string, options?: RequestOptions) => Promise<any>;
    /** Fetch all saved addresses for the current user. */
    getUserAddress?: (options?: RequestOptions) => Promise<any>;
    /** Save a new address for the current user. */
    createAddress?: (addressData: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Update an existing address. */
    updateAddress?: (addressId: string | number, addressData: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Delete a saved address. */
    deleteAddress?: (addressId: string | number, options?: RequestOptions) => Promise<any>;
    /** Sign in with email + password (or phone + password). */
    login?: (credentials: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Register a new account. */
    signup?: (userData: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Verify a one-time password. */
    verifyOtp?: (payload: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Fetch the current user's profile. */
    getUser?: (options?: RequestOptions) => Promise<any>;
    /** Update the current user's profile. */
    updateUser?: (userData: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** List orders for the current user. */
    getOrders?: (params?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Fetch a single order by ID. */
    getOrderById?: (orderId: string | number, options?: RequestOptions) => Promise<any>;
    /** Download / fetch the invoice for an order. */
    getOrderInvoice?: (orderId: string | number, options?: RequestOptions) => Promise<any>;
    /** Fetch available discounts / promotions. */
    getAvailableDiscounts?: (params?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Apply a discount code or ID to the current cart. */
    applyDiscount?: (payload: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Remove a discount from the current cart. */
    removeDiscount?: (payload: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Remove a discount by its ID. */
    removeDiscountById?: (params: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
    /** Track a discount-related analytics event. */
    trackDiscountEvent?: (payload: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
}

/**
 * storefrontActions.ts — @defx/storefront-core
 *
 * Plain async fetch helpers for the Defx storefront API.
 * NOTE: No "use server" directive — this file is bundled by tsup (esbuild)
 * and "use server" is a Next.js-only directive that breaks package builds.
 * These functions work correctly when called from Next.js server actions
 * or server components in the host app.
 */

declare const createCartAction: (body?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const getCartAction: (regionId?: string | null, options?: RequestOptions) => Promise<any>;
declare const getCartByIdAction: (cartId: string, regionId: string | null, options?: RequestOptions) => Promise<any>;
declare const updateCartAction: (cartId: string, payload: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const updateCartIdLineItemsAction: (payload: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const createLineItemAction: (body?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const updateLineItemAction: (lineItemId: string | number, body: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const deleteLineItemAction: (lineItemId: string | number, options?: RequestOptions) => Promise<any>;
declare const createRazorpayOrderAction: (cartId: string, options?: RequestOptions) => Promise<any>;
declare const updateRazorpayPaymentAction: (paymentId: string | number, razorpayPaymentId: string, options?: RequestOptions) => Promise<any>;
declare const createCartPaymentAction: (cartId: string, options?: RequestOptions) => Promise<any>;
declare const createPhonePeOrderAction: (cartId: string, options?: RequestOptions) => Promise<any>;
declare const updateCartPaymentAction: (paymentId: string | number, data?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const updatePhonePePaymentAction: (paymentId: string | number, phonepeData?: Record<string, unknown> | string, options?: RequestOptions) => Promise<any>;
declare const createStripePaymentIntentAction: (cartId: string | number, options?: RequestOptions) => Promise<any>;
declare const getAddressesAction: (options?: RequestOptions) => Promise<any>;
declare const createAddressAction: (addressData: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const updateAddressAction: (addressId: string | number, addressData: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const deleteAddressAction: (addressId: string | number, options?: RequestOptions) => Promise<any>;
declare const loginUser: (data?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const signUpUser: (data?: Record<string, unknown> | FormData, options?: RequestOptions) => Promise<any>;
declare const verifyOtp: (data?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const getUserAction: (options?: RequestOptions) => Promise<any>;
declare const updateUserAction: (userId: string | number, userData: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const getOrdersAction: (regionId?: string | null, page?: number, options?: RequestOptions) => Promise<any>;
declare const getOrderByIdAction: (orderId: string | number, options?: RequestOptions) => Promise<any>;
declare const getOrderInvoiceAction: (orderId: string | number, options?: RequestOptions) => Promise<any>;
declare const getAvailableDiscountsAction: (params?: RequestOptions & {
    cart_id?: string;
    region_id?: string;
}) => Promise<any>;
declare const applyDiscountAction: (params?: RequestOptions & {
    source?: string;
    region_id?: string;
    code?: string;
    discount_id?: string | number;
}) => Promise<any>;
declare const removeDiscountAction: (params?: RequestOptions & {
    discount_id?: string | number;
    region_id?: string;
}) => Promise<any>;
declare const trackDiscountEventAction: (params?: RequestOptions & {
    discount_id?: string | number;
    event_type?: string;
    source?: string;
    region_id?: string;
}) => Promise<any>;
/**
 * validateCartTotal
 *
 * Fetches the latest cart from the server (cache: "no-store") and compares
 * its total against the `clientTotal` the user currently sees in the UI.
 *
 * Called right before any payment gateway is opened so that a coupon that
 * expired at the last second is caught before money moves.
 *
 * @param {string} cartId
 * @param {number} clientTotal   – Total currently displayed in the UI
 * @param {object} [options]     – { token, orgId, config, tolerance }
 * @returns {{ valid: boolean, serverTotal?: number, clientTotal?: number, reason?: string, cart?: object }}
 */
declare const validateCartTotal: (cartId: string, clientTotal: number, options?: RequestOptions) => Promise<any>;
declare const getProductsAction: (query?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const getProductByIdAction: (productId: string | number, options?: RequestOptions) => Promise<any>;
declare const getRelatedProductsAction: (taxonId: string | Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const getTaxonByIdAction: (taxonId: string | number, options?: RequestOptions) => Promise<any>;
declare const getAllTaxonsAction: (params?: string | Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const getTaxonomiesAction: (params?: string | Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const getTaxonomyByIdAction: (taxonomyId: string | number, options?: RequestOptions) => Promise<any>;
declare const getProductsFilterAction: (options?: RequestOptions) => Promise<any>;
declare const getRecentlyViewedProductsAction: (page?: number | RequestOptions, perPage?: number, options?: RequestOptions) => Promise<any>;
declare const getLikedProductsAction: (options?: RequestOptions) => Promise<any>;
declare const likeProductAction: (body: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
declare const unlikeProductAction: (id: string | number, options?: RequestOptions) => Promise<any>;
declare const getCurrentUserLikedProductsAction: (page?: number | RequestOptions, perPage?: number, options?: RequestOptions) => Promise<any>;
declare const getProductsByIdsAction: (productIds?: (string | number)[], options?: RequestOptions) => Promise<any>;
declare const getOrganizationAction: (options?: RequestOptions & {
    organizationId?: string;
    id?: string;
}) => Promise<any>;
declare const getOrgVideosAction: (options?: RequestOptions) => Promise<any>;
declare const getRegionsAction: (options?: RequestOptions) => Promise<any>;

export { getProductByIdAction as A, getProductsAction as B, getProductsByIdsAction as C, getProductsFilterAction as D, getRecentlyViewedProductsAction as E, getRegionsAction as F, getRelatedProductsAction as G, getTaxonByIdAction as H, getTaxonomiesAction as I, getTaxonomyByIdAction as J, getUserAction as K, likeProductAction as L, loginUser as M, removeDiscountAction as N, signUpUser as O, trackDiscountEventAction as P, unlikeProductAction as Q, type Region as R, type StorefrontConfig as S, updateAddressAction as T, updateCartAction as U, updateCartIdLineItemsAction as V, updateLineItemAction as W, updateRazorpayPaymentAction as X, updateUserAction as Y, validateCartTotal as Z, verifyOtp as _, createPhonePeOrderAction as a, updatePhonePePaymentAction as b, createCartPaymentAction as c, type StorefrontActions as d, type RequestOptions as e, applyDiscountAction as f, createAddressAction as g, createCartAction as h, createLineItemAction as i, createRazorpayOrderAction as j, createStripePaymentIntentAction as k, deleteAddressAction as l, deleteLineItemAction as m, getAddressesAction as n, getAllTaxonsAction as o, getAvailableDiscountsAction as p, getCartAction as q, getCartByIdAction as r, getCurrentUserLikedProductsAction as s, getLikedProductsAction as t, updateCartPaymentAction as u, getOrderByIdAction as v, getOrderInvoiceAction as w, getOrdersAction as x, getOrgVideosAction as y, getOrganizationAction as z };
