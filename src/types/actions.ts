// @defx/storefront-core

import type { StorefrontConfig } from './config';

/**
 * Common options accepted by all storefront action helpers.
 * All fields are optional to allow partial overrides at the call site.
 */
export interface RequestOptions {
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
export interface StorefrontActions {
  // ─── Cart ────────────────────────────────────────────────────────────────
  /** Fetch the current user's active cart. */
  getCart?: (regionId?: string | null, options?: RequestOptions) => Promise<any>;
  /** Fetch a specific cart by its ID. */
  getCartById?: (cartId: string | number, regionId?: string | null, options?: RequestOptions) => Promise<any>;
  /** Create a new cart. */
  createCart?: (body?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
  /** Update an existing cart. */
  updateCart?: (cartId: string | number, payload: Record<string, unknown>, options?: RequestOptions) => Promise<any>;

  // ─── Line Items ──────────────────────────────────────────────────────────
  /** Add a new line item to the cart. */
  createLineItem?: (body?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
  /** Update a line item (e.g. change quantity). */
  updateLineItem?: (lineItemId: string | number, body: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
  /** Remove a line item from the cart. */
  deleteLineItem?: (lineItemId: string | number, options?: RequestOptions) => Promise<any>;

  // ─── Payments ────────────────────────────────────────────────────────────
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

  // ─── Addresses ───────────────────────────────────────────────────────────
  /** Fetch all saved addresses for the current user. */
  getUserAddress?: (options?: RequestOptions) => Promise<any>;
  /** Save a new address for the current user. */
  createAddress?: (addressData: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
  /** Update an existing address. */
  updateAddress?: (addressId: string | number, addressData: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
  /** Delete a saved address. */
  deleteAddress?: (addressId: string | number, options?: RequestOptions) => Promise<any>;

  // ─── Auth ─────────────────────────────────────────────────────────────────
  /** Sign in with email + password (or phone + password). */
  login?: (credentials: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
  /** Register a new account. */
  signup?: (userData: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
  /** Verify a one-time password. */
  verifyOtp?: (payload: Record<string, unknown>, options?: RequestOptions) => Promise<any>;

  // ─── Users ────────────────────────────────────────────────────────────────
  /** Fetch the current user's profile. */
  getUser?: (options?: RequestOptions) => Promise<any>;
  /** Update the current user's profile. */
  updateUser?: (userData: Record<string, unknown>, options?: RequestOptions) => Promise<any>;

  // ─── Orders ───────────────────────────────────────────────────────────────
  /** List orders for the current user. */
  getOrders?: (params?: Record<string, unknown>, options?: RequestOptions) => Promise<any>;
  /** Fetch a single order by ID. */
  getOrderById?: (orderId: string | number, options?: RequestOptions) => Promise<any>;
  /** Download / fetch the invoice for an order. */
  getOrderInvoice?: (orderId: string | number, options?: RequestOptions) => Promise<any>;

  // ─── Discounts ────────────────────────────────────────────────────────────
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
