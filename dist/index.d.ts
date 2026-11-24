import * as React from 'react';
import React__default, { Component, ReactNode, ErrorInfo } from 'react';
import { devLogger, captureDeveloperException } from './analytics/posthog.js';
export { POSTHOG_INSTANCES, getDeveloperPostHog, getMerchantPostHog, getPostHogInstance, identifyDeveloperUser, initDeveloperPostHog, initMerchantPostHog, initPostHog, logDeveloper, resetDeveloperPostHog, sanitizePostHogToken, setDeveloperSuperProperties } from './analytics/posthog.js';
import { S as StorefrontConfig, d as StorefrontActions, R as Region } from './storefrontActions-OXYgf5q4.js';
export { e as RequestOptions, f as applyDiscountAction, g as createAddressAction, h as createCartAction, c as createCartPaymentAction, i as createLineItemAction, a as createPhonePeOrderAction, j as createRazorpayOrderAction, k as createStripePaymentIntentAction, l as deleteAddressAction, m as deleteLineItemAction, n as getAddressesAction, o as getAllTaxonsAction, p as getAvailableDiscountsAction, q as getCartAction, r as getCartByIdAction, s as getCurrentUserLikedProductsAction, t as getLikedProductsAction, v as getOrderByIdAction, w as getOrderInvoiceAction, x as getOrdersAction, y as getOrgVideosAction, z as getOrganizationAction, A as getProductByIdAction, B as getProductsAction, C as getProductsByIdsAction, D as getProductsFilterAction, E as getRecentlyViewedProductsAction, F as getRegionsAction, G as getRelatedProductsAction, H as getTaxonByIdAction, I as getTaxonomiesAction, J as getTaxonomyByIdAction, K as getUserAction, L as likeProductAction, M as loginUser, N as removeDiscountAction, O as signUpUser, P as trackDiscountEventAction, Q as unlikeProductAction, T as updateAddressAction, U as updateCartAction, V as updateCartIdLineItemsAction, u as updateCartPaymentAction, W as updateLineItemAction, b as updatePhonePePaymentAction, X as updateRazorpayPaymentAction, Y as updateUserAction, Z as validateCartTotal, _ as verifyOtp } from './storefrontActions-OXYgf5q4.js';
import { L as LoyaltyProfileResponse, a as LoyaltyCustomer, b as LoyaltyRewardItem, c as LoyaltyTransaction, A as ApplyLoyaltyPointsResponse } from './actions-CPUIzeCV.js';
export { d as ApplyLoyaltyPointsPayload, G as GetLoyaltyTransactionsParams, e as LoyaltyActivityItem, f as LoyaltyEarnMethod, g as LoyaltyExpiringBatch, h as LoyaltyRewardsResponse, i as LoyaltyTransactionMetadata, j as LoyaltyTransactionsResponse, k as applyDiscount, l as applyLoyaltyPointsAction, m as buildHeaders, n as configureStorefront, o as getApiBaseUrl, p as getEnv, q as getLoyaltyProfileAction, r as getLoyaltyRewardsAction, s as getLoyaltyTransactionsAction, t as getOrganizationId, u as getServerToken, v as getStorefrontGlobalConfig, w as removeDiscountById, x as revalidateCacheTag } from './actions-CPUIzeCV.js';
export { buildItem, buildMeta, clearEcommerce, initGtmConfig, pushToDataLayer, trackAddPaymentInfo, trackAddShippingInfo, trackAddToCart, trackApplyCoupon, trackBeginCheckout, trackCustomEvent, trackPageView, trackPaymentFailed, trackPurchase, trackSearch, trackViewItem } from './analytics/gtm.js';
export { initMetaPixelConfig, trackMetaAddPaymentInfo, trackMetaAddToCart, trackMetaCompleteRegistration, trackMetaInitiateCheckout, trackMetaLead, trackMetaPageView, trackMetaPurchase, trackMetaSearch, trackMetaViewContent } from './analytics/meta.js';

interface AuthUser {
    id?: string | number;
    userId?: string | number;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}
interface AuthState {
    isSignedIn?: boolean;
    isLoading?: boolean;
    user?: AuthUser | null;
    userId?: string | number | null;
    token?: string | null;
    access_token?: string | null;
    logout?: () => Promise<void> | void;
    openSignIn?: () => void;
    openSignUp?: () => void;
    setAuth?: (auth: AuthState | ((prev: AuthState) => AuthState)) => void;
    clearAuth?: () => void;
    [key: string]: any;
}

/**
 * Router interface for navigation decoupling.
 * Can be provided by Next.js (useRouter), React Router (useNavigate), Remix, etc.
 */
interface RouterAdapter {
    push?: (url: string) => void | Promise<boolean | void>;
    replace?: (url: string) => void | Promise<boolean | void>;
    prefetch?: (url: string) => void;
    refresh?: () => void;
    back?: () => void;
    pathname?: string;
    searchParams?: any;
    [key: string]: any;
}
/**
 * Framework adapter interface.
 * Allows host applications to inject framework-specific behaviour
 * (e.g. Next.js server cookies, cache revalidation, navigation) without coupling
 * the SDK to any particular framework.
 */
interface FrameworkAdapter {
    /**
     * Read the auth token from the server environment.
     * e.g. Next.js: reads from cookies() via next/headers
     */
    getServerToken?: () => Promise<string | null>;
    /**
     * Revalidate a tagged cache entry.
     * e.g. Next.js: calls revalidateTag(tag)
     */
    revalidateTag?: (tag: string) => Promise<void>;
    /**
     * Router adapter for page transitions.
     */
    router?: RouterAdapter;
}

/** A single customization applied to a line item. */
interface Customization {
    id: string | number;
    value: string;
    product_customization_id?: string | number;
}
/** The shape of the line_itemable object (product/variant reference). */
interface LineItemable {
    id?: string | number;
    name?: string;
    sku?: string;
    price?: number;
    display_price?: string;
    [key: string]: unknown;
}
/** A line item inside a Cart. */
interface LineItem {
    id: string | number;
    quantity: number;
    line_itemable: LineItemable;
    line_items_customizations?: Customization[];
    variant_id?: string | number;
    [key: string]: unknown;
}
/**
 * Payload used when creating or updating a line item.
 * Sent to POST /api/line_items or PUT /api/line_items/:id
 */
interface LineItemPayload {
    line_itemable_id: string | number;
    quantity: number;
    line_items_customizations?: Customization[];
    cart_id?: string | number;
    region_id?: string | number;
}
/** A sales channel associated with a cart. */
interface CartSalesChannel {
    id?: string | number;
    name?: string;
    [key: string]: unknown;
}
/** The full Cart object returned by the Defx storefront API. */
interface Cart {
    id: string | number;
    number: string;
    total: number;
    display_total: string;
    item_total: number;
    ship_total: number;
    tax_total: number;
    promo_total: number;
    adjustment_total: number;
    item_count: number;
    currency: string;
    email?: string;
    line_items: LineItem[];
    state: string;
    payment_state?: string | null;
    shipment_state?: string | null;
    cart_sales_channels?: CartSalesChannel[];
    order_type?: string;
    region_id?: string | number;
    display_item_total?: string;
    display_ship_total?: string;
    display_tax_total?: string;
    [key: string]: any;
}

interface CoreContextValue {
    cart: Cart | null | undefined;
    setCart: React__default.Dispatch<React__default.SetStateAction<Cart | null | undefined>>;
    isCartLoading: boolean;
    region: Region | null;
    setRegion: React__default.Dispatch<React__default.SetStateAction<Region | null>>;
    activeRegion: Region | null;
    actions: Record<string, any>;
    toast: any;
    auth: AuthState | null;
    config: StorefrontConfig;
    orgData: any;
    primaryColor: string;
    secondaryColor: string;
    devLogger: typeof devLogger;
    captureDeveloperException: typeof captureDeveloperException;
    posthogDeveloper: any;
    adapter?: FrameworkAdapter;
    linkComponent?: React__default.ComponentType<any>;
    addresses?: any[];
    isAddressLoading?: boolean;
    refreshAddresses?: () => Promise<any> | void;
    isCartDrawerOpen?: boolean;
    setIsCartDrawerOpen?: React__default.Dispatch<React__default.SetStateAction<boolean>>;
    openCartDrawer?: () => void;
    closeCartDrawer?: () => void;
    toggleCartDrawer?: () => void;
    [key: string]: any;
}
interface CoreProviderProps {
    children: React__default.ReactNode;
    config?: StorefrontConfig;
    actions?: StorefrontActions | Record<string, any>;
    toast?: any;
    auth?: AuthState | null;
    orgData?: any;
    adapter?: FrameworkAdapter;
    linkComponent?: React__default.ComponentType<any>;
}
/**
 * CoreProvider
 *
 * Root context provider for @defx/storefront-core.
 */
declare const CoreProvider: React__default.FC<CoreProviderProps>;
declare const useCore: () => CoreContextValue;

interface UseClerkStoreAuthOptions {
    /**
     * Custom server action to authenticate with backend.
     * Defaults to SDK's `loginUser`.
     */
    loginAction?: (payload: any) => Promise<any>;
    /**
     * Callback fired when token is successfully received and persisted.
     */
    onLoginSuccess?: (res: any) => void;
    /**
     * Post-logout redirect path. Defaults to "/".
     */
    redirectOnLogout?: string;
    /**
     * Custom navigation function (e.g. Next.js router.push).
     */
    navigate?: (path: string) => void;
}
/**
 * useClerkStoreAuth()
 *
 * Universal Clerk-to-Defx synchronization hook for storefronts.
 *
 * - Listens to Clerk authentication state.
 * - Automatically exchanges Clerk session with Defx `/api/login` backend.
 * - Stores JWT token in cookie (`access_token`) and `localStorage` with expiry tracking.
 * - Cleans up session and cart data on logout.
 * - Compatible with <CoreProvider auth={auth}>.
 */
declare function useClerkStoreAuth(options?: UseClerkStoreAuthOptions): AuthState;

interface ClerkStoreProviderProps extends Omit<CoreProviderProps, "auth"> {
    authOptions?: UseClerkStoreAuthOptions;
}
/**
 * ClerkStoreProvider
 *
 * Pre-wired CoreProvider that automatically hooks into Clerk authentication,
 * synchronizes session tokens with the Defx backend, and supplies auth context
 * to all downstream storefront hooks and components.
 */
declare const ClerkStoreProvider: React__default.FC<ClerkStoreProviderProps>;

/**
 * useCart()
 *
 * Convenience hook — returns cart state without exposing the full CoreContext.
 * Use this in components that only need to read/update the cart.
 *
 * Returns:
 *  - cart            current cart object (null if no cart yet)
 *  - setCart         update cart state
 *  - isCartLoading   true while the cart is being fetched or mutated
 *  - config          store config (storeId, regionId, currency, locale, …)
 */
declare const useCart: () => {
    cart: any;
    setCart: (cart: any) => void;
    isCartLoading: boolean;
    config: any;
};

/**
 * useAddToCart()
 *
 * Production-ready cart mutation hook.
 * ⚡ Zero Next.js / Clerk / store-specific imports.
 *
 * All API calls are resolved through injected `actions` in CoreProvider:
 *  actions.getCart(regionId)                       → cart[]
 *  actions.getCartById(cartId, regionId)           → cart
 *  actions.createCart(payload)                     → cart
 *  actions.createLineItem(payload)                 → lineItem
 *  actions.updateLineItem(lineItemId, payload)     → lineItem
 *  actions.deleteLineItem(lineItemId)              → void
 *
 * Auth awareness is handled via injected `auth`:
 *  auth.isSignedIn  → boolean
 *
 * Toast notifications are handled via injected `toast`:
 *  toast.success(msg)
 *  toast.error(msg)
 */
declare function useAddToCart(): {
    handleAddToCart: (product: any, customizations?: any[], overrideQty?: number | null, options?: {
        openDrawer?: boolean;
    }) => Promise<void>;
    handleDecreaseQty: (product: any, customizations?: any[]) => Promise<void>;
    handleDeleteLineItem: (productOrId: any) => Promise<void>;
    getCartItem: (product: any, customizations?: any[]) => LineItem;
    quantity: number;
    setQuantity: React.Dispatch<React.SetStateAction<number>>;
    isAddToCartLoading: boolean;
    deletingLineItemId: any;
    cartItems: LineItem[];
    cart: Cart;
};

/**
 * useCurrencyFormat()
 *
 * Reads currency/locale from CoreProvider config.
 * No store-specific or framework imports.
 *
 * Config keys used:
 *  config.currency  (e.g. "INR", "USD") — defaults to "USD"
 *  config.locale    (e.g. "en-IN", "en-US") — defaults to "en-US"
 *
 * Usage:
 *  const { formatCurrency } = useCurrencyFormat();
 *  formatCurrency(1999.5) // "₹1,999.50"
 */
declare function useCurrencyFormat(): {
    formatCurrency: (amount: number | string | null | undefined) => string;
};

/**
 * useAuth()
 *
 * Returns the injected auth object from CoreProvider.
 * The store is responsible for passing its own auth implementation
 * (e.g. Clerk, NextAuth, custom JWT) via the `auth` prop on <CoreProvider>.
 *
 * Expected shape of the `auth` object (all fields optional):
 * {
 *   isSignedIn: boolean,
 *   user: { id, firstName, lastName, email, ... },
 *   logout: () => Promise<void>,
 *   token: string | null,
 * }
 *
 * Usage:
 *  const { isSignedIn, user } = useAuth();
 */
declare const useAuth: () => any | Record<string, never>;

/**
 * useLogout()
 *
 * Returns the logout function from the injected `auth` object.
 * The store wires up its own logout logic (Clerk signOut, NextAuth, etc.)
 * and passes it in via <CoreProvider auth={{ logout: ... }}>.
 *
 * The returned `logout` function should handle:
 *  - Clearing tokens / cookies
 *  - Signing out from the auth provider
 *  - Redirecting the user
 *
 * Usage:
 *  const logout = useLogout();
 *  <button onClick={logout}>Sign out</button>
 */
declare const useLogout: () => (() => Promise<void>);

declare function isTokenExpired(token?: string | null): boolean;
interface UseOtpStoreAuthOptions {
    onLoginSuccess?: (res: any) => void;
    redirectOnLogout?: string;
    navigate?: (path: string) => void;
    countryCode?: string;
}
/**
 * useOtpStoreAuth()
 *
 * Built-in Defx Phone OTP authentication hook for storefronts.
 *
 * - Manages session tokens (persisted in cookies and localStorage).
 * - Automatic token expiration validation.
 * - Auto-hydrates user profile via `/api/users`.
 * - Exposes phone login, signup, and verifyOtp actions.
 * - Controls AuthModal visibility and mode ("signin" | "signup").
 * - Formatted for <CoreProvider auth={auth}>.
 */
declare function useOtpStoreAuth(options?: UseOtpStoreAuthOptions): AuthState & {
    isAuthOpen: boolean;
    authMode: "signin" | "signup";
    closeAuth: () => void;
    sendLoginOtp: (phone: string, countryCode?: string) => Promise<any>;
    sendSignUpOtp: (payload: {
        firstName: string;
        lastName: string;
        phone: string;
        countryCode?: string;
    }) => Promise<any>;
    verifyPhoneOtp: (phone: string, code: string, countryCode?: string) => Promise<any>;
};

declare function useVariantSelection(rawProduct: any): {
    /** Array of { types, values } for whatever the user has selected */
    selectedOptionsType: any[];
    /** The matched product variant (null if no full match yet) */
    selectedVariant: any;
    /** Unique option types array, e.g. [Size, Color] */
    variantOptionTypes: any[];
    /** True when the product has at least one selectable option type */
    hasVariants: boolean;
    /** fn(optionType, optionValue) → boolean – drives the disabled state of chips */
    isOptionAvailable: (optionType: any, optionValue: any) => any;
    /** fn(optionType) → option value array – used to render chips per type */
    getValuesForType: (optionType: any) => any[];
    /** Call when user taps an option chip */
    selectOption: (optionValue: any, optionType: any) => void;
    /**
     * fn(fallbackImages) → image array
     * Pass your product's default images; the hook swaps them for variant
     * images when a variant with images is selected.
     */
    getDisplayImages: (productImages?: any[]) => any;
};

/**
 * useAddresses() — @defx/storefront-core
 *
 * Hook to access user addresses, loading state, and mutations.
 * Shared across Cart and Profile with automatic cache management.
 */
declare function useAddresses(): {
    addresses: any[];
    isAddressLoading: boolean;
    isSignedIn: boolean;
    refreshAddresses: any;
    createAddress: any;
    updateAddress: any;
    deleteAddress: any;
    getUserAddress: any;
};

/**
 * useCartInfo()
 *
 * Returns the baseline payload shape for creating a new cart.
 * Pure utility — zero framework or store-specific dependencies.
 *
 * Usage:
 *  const { initialCartInfo } = useCartInfo();
 *  const newCart = await actions.createCart({ ...initialCartInfo, region_id });
 */
interface CartInfo {
    number: string;
    item_total: number;
    total: number;
    ship_total: number;
    adjustment_total: number;
    completed_at: string;
    included_tax_total: number;
    additional_tax_total: number;
    tax_total: number;
    currency: string;
    email: string;
    promo_total: number;
    item_count: number;
    special_instructions: string;
    pre_tax_item_amount: number;
    pre_tax_total: number;
    shipment_state: string;
    payment_state: string;
    cart_sales_channels: string;
    order_type: string;
}
declare const useCartInfo: () => {
    initialCartInfo: CartInfo;
};

interface PaymentGatewayInfo {
    gateway: string;
    label: string;
    isPhonePe: boolean;
    isRazorpay: boolean;
    isStripe: boolean;
    stripePublishableKey: string;
    razorpayKeyId: string;
    paymentConfig: Record<string, any>;
    rawGateway: string;
}
/**
 * Hook to automatically detect the merchant's configured payment gateway
 * from organization settings or active region config.
 */
declare function usePaymentGateway(): PaymentGatewayInfo;

interface UseCartDrawerReturn {
    isCartDrawerOpen: boolean;
    openCartDrawer: () => void;
    closeCartDrawer: () => void;
    toggleCartDrawer: () => void;
    setIsCartDrawerOpen: (open: boolean) => void;
}
declare const useCartDrawer: () => UseCartDrawerReturn;

/**
 * useGetCurrentUserLikedProductsQuery
 *
 * Auth-gated hook for `/api/current_user_liked_products`.
 *
 * KEY behaviours that stop the 3000+ API calls per day:
 *  1. Skips entirely when no access token is present (guest users).
 *  2. Returns cached result immediately — no re-fetch until TTL expires (5 min).
 *  3. One in-flight request per token; concurrent mounts de-dupe automatically.
 *  4. `refetch()` always bypasses the cache and forces a fresh fetch.
 *  5. Automatically re-fetches whenever `invalidateLikedProductsCache` is called.
 *
 * @param {string|null} token    - The user's access token (from useCore auth)
 * @param {{ page?: number, perPage?: number, skip?: boolean }} options
 * @returns {{ data, isLoading, isFetching, isError, error, refetch }}
 */
declare function useGetCurrentUserLikedProductsQuery(token?: string | null, { page, perPage, skip }?: {
    page?: number;
    perPage?: number;
    skip?: boolean;
}): {
    data: any;
    isLoading: boolean;
    isFetching: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: any;
    refetch: () => Promise<any>;
};
/**
 * Manually invalidate the liked-products in-memory cache for a given token.
 * Call this after like/unlike mutations so all active hooks re-fetch fresh data.
 */
declare function invalidateLikedProductsCache(token: string | null): void;

interface UseLoyaltyOptions {
    autoFetch?: boolean;
}
/**
 * Checks whether the Loyalty & Rewards marketplace application is installed
 * and enabled for the merchant organization.
 *
 * Inspects:
 * 1. Explicit config/env override:
 *    - config?.enableLoyalty (true/false)
 *    - process.env.NEXT_PUBLIC_ENABLE_LOYALTY ("true"/"false")
 * 2. Organization feature exposure:
 *    - orgData?.expose_json?.loyalty?.enabled
 * 3. Organization marketplace installations:
 *    - orgData?.organization_marketplaces (array or stringified JSON)
 *      Matches records with slug/name/appName matching loyalty / reward / loyalty-rewards
 *      where is_installed is true and market_place_json.enabled is not false.
 */
declare function isLoyaltyMarketplaceActive(orgData?: any, config?: any): boolean;
interface UseLoyaltyReturn {
    isLoyaltyEnabled: boolean;
    profile: LoyaltyProfileResponse | null;
    customer: LoyaltyCustomer | null;
    rewards: LoyaltyRewardItem[];
    availablePoints: number;
    monetaryValue: number;
    pointsName: string;
    totalEarned: number;
    totalRedeemed: number;
    totalExpired: number;
    referralCode: string;
    referralLink: string;
    tier: string;
    transactions: LoyaltyTransaction[];
    transactionsTotalCount: number;
    transactionsPage: number;
    transactionsPerPage: number;
    isLoading: boolean;
    isRewardsLoading: boolean;
    isTransactionsLoading: boolean;
    isApplying: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    refetchRewards: () => Promise<void>;
    refetchTransactions: (params?: {
        page?: number;
        per_page?: number;
    }) => Promise<void>;
    applyPoints: (payload: {
        cart_id?: string | number;
        points_to_use: number;
    }) => Promise<ApplyLoyaltyPointsResponse>;
    copyReferralCode: () => Promise<boolean>;
    copyReferralLink: () => Promise<boolean>;
    shareWhatsApp: (customText?: string) => void;
}
declare const useLoyalty: (options?: UseLoyaltyOptions) => UseLoyaltyReturn;

interface AuthManagerProps {
    mode?: "sign-in" | "sign-up" | "signin" | "signup";
    onLoginSuccess?: () => void;
}
/**
 * AuthManager
 *
 * Switches between Clerk and Custom Auth UI based on config.authType.
 */
declare const AuthManager: React__default.FC<AuthManagerProps>;

interface CustomOTPAuthProps {
    mode?: "sign-in" | "sign-up" | "signin" | "signup";
    onLoginSuccess?: (res?: any) => void;
}
/**
 * CustomOTPAuth
 *
 * Mobile OTP auth component supporting sign-in and sign-up flows.
 */
declare const CustomOTPAuth: React__default.FC<CustomOTPAuthProps>;

/**
 * CartPage
 *
 * Full cart page component.
 * Reads cart state from CoreProvider — no props required for data fetching.
 *
 * Props:
 *  - className          string — wrapper class
 *  - header             ReactNode — custom header (replaces default "Your Cart" h1)
 *  - emptyState         ReactNode — replaces default empty cart message
 *  - renderItem         (item) => ReactNode  — custom line item renderer
 *  - renderSummary      () => ReactNode      — replaces CartSummary
 *  - renderCheckoutBtn  () => ReactNode      — checkout CTA inside summary
 *  - summaryLabels      object — forwarded to <CartSummary labels={...} />
 */
interface CartPageProps {
    className?: string;
    header?: React__default.ReactNode;
    emptyState?: React__default.ReactNode;
    renderItem?: ((item: any) => React__default.ReactNode) | null;
    renderSummary?: (() => React__default.ReactNode) | null;
    renderCheckoutBtn?: (() => React__default.ReactNode) | null;
    summaryLabels?: Record<string, string>;
}
declare const CartPage: React__default.FC<CartPageProps>;

/**
 * CartItem
 *
 * Renders a single cart line item with quantity controls and delete button.
 * Calls useAddToCart() internally — no extra props needed for mutations.
 *
 * Props:
 *  - item          line item object from cart.line_items
 *  - renderImage   (item) => ReactNode  — optional custom image renderer
 *  - renderActions (item) => ReactNode  — replaces default +/- controls
 *  - className     string
 */
interface CartItemProps {
    item: any;
    renderImage?: ((item: any) => React__default.ReactNode) | null;
    renderActions?: ((item: any) => React__default.ReactNode) | null;
    className?: string;
}
declare const CartItem: React__default.FC<CartItemProps>;

/**
 * CartSummary
 *
 * Order summary panel — subtotal, item count, totals.
 *
 * Props:
 *  - className      string
 *  - renderFooter   () => ReactNode — renders below the totals (e.g. checkout btn)
 *  - labels         object — override default label strings
 *    { subtotal, shipping, tax, total, itemCount, estimatedShipping }
 */
interface CartSummaryLabels {
    subtotal?: string;
    shipping?: string;
    tax?: string;
    total?: string;
    itemCount?: string;
    estimatedShipping?: string;
}
interface CartSummaryProps {
    className?: string;
    renderFooter?: (() => React__default.ReactNode) | null;
    labels?: CartSummaryLabels;
}
declare const CartSummary: React__default.FC<CartSummaryProps>;

interface ViewCartProps {
    enableFastCheckout?: boolean;
}
declare const ViewCart: React__default.FC<ViewCartProps>;

interface CartDrawerProps {
    isOpen?: boolean;
    onClose?: () => void;
    freeShippingThreshold?: number;
}
declare const CartDrawer: React__default.FC<CartDrawerProps>;

interface FastCheckoutDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess?: () => void;
    router?: any;
}
declare const FastCheckoutDrawer: React__default.FC<FastCheckoutDrawerProps>;

declare const CouponSection: React__default.FC;

interface CartMismatchBannerProps {
    serverTotal?: number;
    clientTotal?: number;
    freshCart?: Cart | any;
    onDismiss?: () => void;
    currency?: string;
    locale?: string;
}
/**
 * CartMismatchBanner
 *
 * Renders a fixed amber top-banner when the cart total changed between
 * the user viewing the cart and clicking Pay (e.g. a coupon expired).
 */
declare const CartMismatchBanner: React__default.FC<CartMismatchBannerProps>;

interface AccountPageProps {
    initialTab?: "profile" | "orders";
}
/**
 * AccountPage Component
 *
 * The main container for the user account section.
 * Features a sticky sidebar for navigation between Profile, Orders, and Logout.
 */
declare const AccountPage: React__default.FC<AccountPageProps>;

interface AccountNavItem {
    label: string;
    href: string;
    icon?: React__default.ComponentType<any>;
}
declare const DEFAULT_NAV_ITEMS: AccountNavItem[];
interface AccountSidebarProps {
    navItems?: AccountNavItem[];
    user?: any;
    contactInfo?: string;
    onNavigate?: (href: string) => void;
    onLogout?: () => void;
    className?: string;
    showLogout?: boolean;
    logoutLabel?: string;
    pathname?: string;
    router?: any;
}
declare const AccountSidebar: React__default.FC<AccountSidebarProps>;

interface AccountLayoutProps {
    children?: React__default.ReactNode;
    sidebarProps?: AccountSidebarProps;
    className?: string;
    containerClassName?: string;
    panelClassName?: string;
    mainClassName?: string;
    fullWidth?: boolean;
}
declare const AccountLayout: React__default.FC<AccountLayoutProps>;

declare const AccountAddressesPage: React__default.FC;

interface AccountOrdersPageProps {
    initialOrders?: any[];
    pagination?: {
        current_page: number;
        total_pages: number;
        [key: string]: any;
    };
    router?: any;
    searchParams?: any;
    pathname?: string;
}
declare const AccountOrdersPage: React__default.FC<AccountOrdersPageProps>;

interface AccountOrderDetailContentProps {
    order?: any;
    id?: string | number;
}
declare const AccountOrderDetailContent: React__default.FC<AccountOrderDetailContentProps>;

interface AccountWishlistPageProps {
    products?: any[];
    pagination?: {
        current_page: number;
        total_pages: number;
        [key: string]: any;
    };
    isLoading?: boolean;
    renderProduct?: (product: any, index: number) => React__default.ReactNode;
    router?: any;
    searchParams?: any;
    pathname?: string;
}
declare const AccountWishlistPage: React__default.FC<AccountWishlistPageProps>;

interface AccountRewardsPageProps {
    router?: any;
    showBreadcrumb?: boolean;
    className?: string;
}
declare const AccountRewardsPage: React__default.FC<AccountRewardsPageProps>;

interface IconProps extends React__default.SVGProps<SVGSVGElement> {
    className?: string;
    strokeWidth?: number;
    fill?: string;
    filled?: boolean;
}
declare const AccountGiftIcon: React__default.FC<IconProps>;
declare const AccountAwardIcon: React__default.FC<IconProps>;
declare const AccountStarIcon: React__default.FC<IconProps>;
declare const AccountClockIcon: React__default.FC<IconProps>;
declare const AccountSparklesIcon: React__default.FC<IconProps>;

interface UserInfoProps {
    user?: any;
    isLoading?: boolean;
    refetch: () => void;
}
/**
 * UserInfo Component
 *
 * Displays the "MY PROFILE" section, including user details and a grid of addresses.
 */
declare const UserInfo: React__default.FC<UserInfoProps>;

/** A physical user address (shipping or billing). */
interface Address {
    id: string | number;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state_name?: string;
    state_code?: string;
    country_name?: string;
    country_iso?: string;
    zipcode?: string;
    phone?: string;
    is_default?: boolean;
    [key: string]: unknown;
}
/** Payment record associated with an order or checkout. */
interface OrderPayment {
    id: string | number;
    amount?: number;
    state?: string;
    payment_method?: string;
    created_at?: string;
    [key: string]: unknown;
}
/** Complete Order entity returned by the Defx storefront API. */
interface Order$1 {
    id: string | number;
    number: string;
    state: string;
    total: number;
    display_total: string;
    item_total: number;
    ship_total: number;
    tax_total: number;
    promo_total: number;
    currency: string;
    email?: string;
    line_items: LineItem[];
    shipping_address?: Address;
    billing_address?: Address;
    payments?: OrderPayment[];
    completed_at?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

interface AddressCardProps {
    address: Partial<Address> & Record<string, any>;
    onEdit?: () => void;
    onDelete?: () => void;
}
/**
 * AddressCard Component
 *
 * Displays an address card with options to edit or delete.
 */
declare const AddressCard: React__default.FC<AddressCardProps>;

interface OrdersListProps {
    initialOrders?: any[];
    router?: any;
}
declare const OrdersList: React__default.FC<OrdersListProps>;

interface ProfileFormProps {
    user?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}
/**
 * ProfileForm Component
 *
 * Form to update user details (First Name, Last Name, Phone/Email).
 */
declare const ProfileForm: React__default.FC<ProfileFormProps>;

interface OrderProps {
    orderId?: string | number;
    id?: string | number;
    show?: boolean;
    router?: any;
    params?: any;
    searchParams?: any;
    [key: string]: any;
}
declare const Order: React__default.FC<OrderProps>;

/**
 * Spinner
 *
 * Pure CSS loading spinner — zero dependencies.
 *
 * Props:
 *  - size     "sm" | "md" | "lg"   (default: "md")
 *  - color    CSS color string      (default: "currentColor")
 *  - className  additional classes
 */
interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    className?: string;
}
declare const Spinner: React__default.FC<SpinnerProps>;

/**
 * EmptyState
 *
 * Generic empty state component.
 *
 * Props:
 *  - icon       ReactNode  (optional — renders above title)
 *  - title      string     (default: "Nothing here yet")
 *  - description string    (optional subtitle)
 *  - action     ReactNode  (optional CTA button / link)
 *  - className  string     additional wrapper class
 */
interface EmptyStateProps {
    icon?: React__default.ReactNode;
    title?: string;
    description?: string;
    action?: React__default.ReactNode;
    className?: string;
}
declare const EmptyState: React__default.FC<EmptyStateProps>;

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React__default.ReactNode;
    maxWidth?: string;
    style?: React__default.CSSProperties;
}
/**
 * Popup Component
 *
 * Centralized modal component that uses React Portals to render on top of all other content.
 */
declare const Popup: React__default.FC<PopupProps>;

interface AddressFormProps {
    initialData?: Partial<Address> & Record<string, any>;
    onSuccess?: () => void;
    onCancel?: () => void;
    submitLabel?: string;
}
/**
 * AddressForm Component
 *
 * Reusable form for creating or updating user addresses.
 */
declare const AddressForm: React__default.FC<AddressFormProps>;

/**
 * ThirdPartyScripts — @defx/storefront-core
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches or extracts installed marketplace integrations (Hotjar, ContentSquare, Microsoft Clarity, etc.)
 * from organization settings / backend API and injects their tracking scripts
 * dynamically into the browser <head> at runtime.
 *
 * Automatically included in <CoreProvider /> and can also be rendered directly:
 *   <ThirdPartyScripts apiBaseUrl={...} orgId={...} orgData={...} />
 * ─────────────────────────────────────────────────────────────────────────────
 */
interface ThirdPartyScriptsProps {
    apiBaseUrl?: string;
    orgId?: string;
    marketplaces?: any[] | null;
    orgData?: any;
}
declare function ThirdPartyScripts({ apiBaseUrl, orgId, marketplaces: prefetched, orgData, }: ThirdPartyScriptsProps): null;

/**
 * Third-Party Script Injection Utilities — @defx/storefront-core
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides safe, idempotent helpers to dynamically inject tracking scripts
 * (ContentSquare, Hotjar, etc.) into the browser <head> at runtime.
 *
 * Usage: Called by <ThirdPartyScripts /> after fetching org marketplace config.
 * ─────────────────────────────────────────────────────────────────────────────
 */
/**
 * Derives a canonical slug from a marketplace name (market_place.name or appName).
 * Must stay in sync with the admin panel's nameToSlug function.
 */
declare function nameToSlug(name?: string): string;
/**
 * Safely parses a raw ContentSquare tracking code string (which is a full
 * `<script>` tag) and injects it into <head> as a live script element.
 *
 * @param {string} rawScriptHtml  - The full <script>...</script> string
 */
declare function injectContentSquare(rawScriptHtml: string): void;
/**
 * Injects the standard Hotjar tracking snippet into <head>.
 *
 * @param {string|number} siteId  - Hotjar Site ID (e.g. 1234567)
 * @param {string|number} version - Hotjar snippet version (default: 6)
 */
declare function injectHotjar(siteId: string | number, version?: number): void;

/**
 * DeveloperErrorBoundary
 *
 * Catches uncaught React rendering errors in child components and
 * reports them directly to the Developer PostHog instance.
 */
interface DeveloperErrorBoundaryProps {
    children?: ReactNode;
    name?: string;
    fallback?: ReactNode | ((error: Error | null) => ReactNode);
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
interface DeveloperErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}
declare class DeveloperErrorBoundary extends Component<DeveloperErrorBoundaryProps, DeveloperErrorBoundaryState> {
    constructor(props: DeveloperErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): DeveloperErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    render(): string | number | bigint | boolean | Iterable<React__default.ReactNode> | Promise<string | number | bigint | boolean | React__default.ReactPortal | React__default.ReactElement<unknown, string | React__default.JSXElementConstructor<any>> | Iterable<React__default.ReactNode>> | React__default.JSX.Element;
}

interface GtmConfig {
    enabled: boolean;
    gtmContainerId?: string | null;
    ga4MeasurementId?: string | null;
}
interface MetaPixelConfig {
    enabled: boolean;
    pixelId?: string | null;
    enabledEvents?: string[];
}
interface GtmItem {
    item_id: string;
    item_name: string;
    item_category?: string;
    price: number;
    quantity: number;
}
interface GtmMeta {
    country?: string;
    device?: string;
    platform?: string;
    source?: string;
    [key: string]: unknown;
}

/** Basic taxonomy / category representation. */
interface Taxon {
    id: string | number;
    name: string;
    permalink?: string;
    pretty_name?: string;
    taxonomy_id?: string | number;
    description?: string | null;
    position?: number;
    icon?: string | null;
    [key: string]: unknown;
}
/** Product variant option value (e.g. Size: "M", Color: "Red"). */
interface OptionValue {
    id: string | number;
    name?: string;
    presentation?: string;
    [key: string]: unknown;
}
/** Product variant option type (e.g. "Size", "Color"). */
interface OptionType {
    id: string | number;
    name: string;
    presentation?: string;
    position?: number;
    [key: string]: unknown;
}
/** Variant option dimension binding. */
interface VariantOption {
    option_type: OptionType;
    option_value: OptionValue;
    variant?: {
        id: string | number;
    };
    [key: string]: unknown;
}
/** An image attached to a product or variant. */
interface ProductImage {
    id: string | number;
    product_image_url?: string;
    product_video_url?: string;
    position?: number;
    alt?: string | null;
    [key: string]: unknown;
}
/** Selling quantity rules (e.g. increments of 0.5m for fabric). */
interface SellingQuantity {
    id?: string | number;
    name?: string;
    values?: Array<{
        label?: string;
        value?: string | number;
    }>;
    [key: string]: unknown;
}
/** A single variant of a product. */
interface ProductVariant {
    id: string | number;
    sku?: string;
    price?: number;
    display_price?: string;
    in_stock?: boolean;
    purchasable?: boolean;
    is_master?: boolean;
    product_images?: ProductImage[];
    variant_options?: VariantOption[];
    selling_quantity?: SellingQuantity;
    [key: string]: unknown;
}
/** Complete Product entity returned by the Defx storefront API. */
interface Product {
    id: string | number;
    name: string;
    description?: string;
    slug?: string;
    price?: number;
    display_price?: string;
    sku?: string;
    taxons?: Taxon[];
    variants?: ProductVariant[];
    master_variant?: ProductVariant;
    product_images?: ProductImage[];
    selling_quantity?: SellingQuantity;
    in_stock?: boolean;
    purchasable?: boolean;
    meta_title?: string;
    meta_description?: string;
    [key: string]: unknown;
}

/**
 * Base error class for all Storefront SDK operations.
 */
declare class StorefrontError extends Error {
    constructor(message: string);
}
/**
 * Error thrown when an API request fails with an HTTP error status code.
 */
declare class StorefrontApiError extends StorefrontError {
    status: number;
    endpoint?: string;
    data?: unknown;
    constructor(message: string, status: number, endpoint?: string, data?: unknown);
}
/**
 * Error thrown when an operation requires user authentication but no valid token is provided.
 */
declare class StorefrontAuthError extends StorefrontError {
    constructor(message?: string);
}

export { AccountAddressesPage, AccountAwardIcon, AccountClockIcon, AccountGiftIcon, AccountLayout, AccountOrderDetailContent, AccountOrdersPage, AccountPage, AccountRewardsPage, type AccountRewardsPageProps, AccountSidebar, AccountSparklesIcon, AccountStarIcon, AccountWishlistPage, type Address, AddressCard, AddressForm, ApplyLoyaltyPointsResponse, AuthManager, type AuthState, type AuthUser, type Cart, CartDrawer, type CartDrawerProps, CartItem, CartMismatchBanner, CartPage, CartSummary, ClerkStoreProvider, type ClerkStoreProviderProps, CoreProvider, CouponSection, CustomOTPAuth, type Customization, DEFAULT_NAV_ITEMS as DEFAULT_ACCOUNT_NAV_ITEMS, DeveloperErrorBoundary, EmptyState, FastCheckoutDrawer, type FastCheckoutDrawerProps, type FrameworkAdapter, type GtmConfig, type GtmItem, type GtmMeta, type LineItem, type LineItemPayload, LoyaltyCustomer, LoyaltyProfileResponse, LoyaltyRewardItem, LoyaltyTransaction, type MetaPixelConfig, type OptionType, type OptionValue, Order, type OrderPayment, type Order$1 as OrderType, OrdersList, type PaymentGatewayInfo, Popup, type Product, type ProductImage, type ProductVariant, ProfileForm, Region, type RouterAdapter, type SellingQuantity, Spinner, StorefrontActions, StorefrontApiError, StorefrontAuthError, StorefrontConfig, StorefrontError, type Taxon, ThirdPartyScripts, type UseCartDrawerReturn, type UseClerkStoreAuthOptions, type UseLoyaltyOptions, type UseLoyaltyReturn, type UseOtpStoreAuthOptions, UserInfo, type VariantOption, ViewCart, captureDeveloperException, devLogger, injectContentSquare, injectHotjar, invalidateLikedProductsCache, isLoyaltyMarketplaceActive, isTokenExpired, nameToSlug, useAddToCart, useAddresses, useAuth, useCart, useCartDrawer, useCartInfo, useClerkStoreAuth, useCore, useCurrencyFormat, useGetCurrentUserLikedProductsQuery, useLogout, useLoyalty, useOtpStoreAuth, usePaymentGateway, useVariantSelection };
