// @defx/storefront-core
//
// src/utils/request.ts — Shared, consolidated request utility.
//
// Unifies the `buildHeaders` logic that previously existed in both
// `storefrontActions.js` and `discountActions.js`.  All functions are
// plain async helpers with no framework dependency; they work correctly
// when called from Next.js server actions, server components, or plain
// Node.js scripts in the host application.

import type { RequestOptions } from '../types/actions';

// ─── Constants ────────────────────────────────────────────────────────────────

export const API_VERSION_ACCEPT = 'application/vnd.defx-store.v2';

// ─── Environment & Global Config Helpers ─────────────────────────────────────

/**
 * Safely retrieve an environment variable in any environment (Node, Next.js, Vite, browser)
 * without throwing `ReferenceError: process is not defined`.
 */
export const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process?.env) {
    return process.env[key];
  }
  return undefined;
};

export interface StorefrontGlobalConfig {
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

let globalConfig: StorefrontGlobalConfig = {};

/**
 * Configure the storefront SDK globally with API endpoints, organization/store IDs, etc.
 * When set, all actions will automatically use these settings as fallbacks when call-specific
 * options are omitted.
 */
export const configureStorefront = (config: Partial<StorefrontGlobalConfig>): void => {
  globalConfig = { ...globalConfig, ...config };
};

/**
 * Get the current global storefront configuration.
 */
export const getStorefrontGlobalConfig = (): StorefrontGlobalConfig => globalConfig;

// ─── Config helpers ───────────────────────────────────────────────────────────

/**
 * Resolve the API base URL from (in priority order):
 *  1. `options.config.apiBaseUrl`
 *  2. `options.apiBaseUrl`
 *  3. `globalConfig.apiBaseUrl` (set via configureStorefront or <CoreProvider>)
 *  4. `process.env.NEXT_PUBLIC_API_BASE_URL` (safe check)
 *  5. `process.env.API_BASE_URL` (safe check)
 *  6. Empty string (caller must validate)
 */
export const getApiBaseUrl = (options: RequestOptions = {}): string =>
  options?.config?.apiBaseUrl ||
  options?.apiBaseUrl ||
  globalConfig?.apiBaseUrl ||
  getEnv('NEXT_PUBLIC_API_BASE_URL') ||
  getEnv('API_BASE_URL') ||
  '';

/**
 * Resolve the organisation / store ID from (in priority order):
 *  1. `options.config.storeId`
 *  2. `options.orgId`
 *  3. `globalConfig.storeId` || `globalConfig.orgId`
 *  4. `process.env.NEXT_PUBLIC_ORGANIZATION_ID` (safe check)
 *  5. `process.env.ORG_ID` (safe check)
 *  6. `null`
 */
export const getOrganizationId = (options: RequestOptions = {}): string | null =>
  options?.config?.storeId ||
  options?.orgId ||
  globalConfig?.storeId ||
  globalConfig?.orgId ||
  getEnv('NEXT_PUBLIC_ORGANIZATION_ID') ||
  getEnv('ORG_ID') ||
  null;

/**
 * Validate that the storefront is configured with an API base URL and Org ID.
 * Returns the resolved configuration or logs a diagnostic warning.
 */
export const assertStorefrontConfigured = (
  options: RequestOptions = {},
): { apiBaseUrl: string; orgId: string | null } => {
  const apiBaseUrl = getApiBaseUrl(options);
  const orgId = getOrganizationId(options);

  if (!apiBaseUrl && typeof window === 'undefined') {
    console.warn(
      '[StoreFront-core] Warning: API Base URL is not configured. ' +
        'Please call configureStorefront({ apiBaseUrl, storeId }) or wrap your application in <CoreProvider config={{ apiBaseUrl, storeId }}>.',
    );
  }

  return { apiBaseUrl, orgId };
};

// ─── Token resolution ─────────────────────────────────────────────────────────

/**
 * Resolve the auth token for the current request:
 *
 * 1. Explicit token passed in `token` parameter.
 * 2. Host framework adapter token (`options.adapter?.getServerToken` or `globalConfig.adapter?.getServerToken`).
 * 3. Client-side: `localStorage.access_token` → `localStorage.token`.
 * 4. Server-side (Next.js): dynamic import of `next/headers` cookies.
 */
export const getServerToken = async (
  token?: string | null | false,
  options?: RequestOptions,
): Promise<string | null> => {
  if (token === null || token === false) return null;
  if (token) return token;

  // 1. Pluggable framework adapter token function
  const adapterTokenFn =
    options?.adapter?.getServerToken ||
    globalConfig?.adapter?.getServerToken;
  if (typeof adapterTokenFn === 'function') {
    try {
      const adapted = await adapterTokenFn();
      if (adapted) return adapted;
    } catch {
      // ignore and continue to storage/cookies fallback
    }
  }

  // 2. Client-side: read from localStorage
  if (typeof window !== 'undefined') {
    return (
      window.localStorage?.getItem('access_token') ||
      window.localStorage?.getItem('token') ||
      null
    );
  }

  // 3. Server-side: fallback to Next.js cookies() if in Next.js environment
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return (
      cookieStore.get('access_token')?.value ||
      cookieStore.get('token')?.value ||
      null
    );
  } catch {
    return null;
  }
};

// ─── Headers ──────────────────────────────────────────────────────────────────

/**
 * Build the HTTP request headers for a Defx storefront API call.
 */
export const buildHeaders = async ({
  token,
  orgId,
  config,
  adapter,
  json = true,
  requireAuth = false,
}: RequestOptions & { json?: boolean; requireAuth?: boolean } = {}): Promise<
  Record<string, string>
> => {
  const authToken = await getServerToken(token, { config, orgId, adapter });
  const organizationId = getOrganizationId({ orgId, config });

  if (requireAuth && !authToken) {
    throw new Error('Unauthorized');
  }

  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    accept: API_VERSION_ACCEPT,
    ...(organizationId ? { 'Set-Organization': organizationId } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
};

// ─── Query string ─────────────────────────────────────────────────────────────

/**
 * Convert a params object (or pre-serialised string) into a URL query string.
 *
 * - `undefined` / `null` → `""`
 * - A string that already starts with `"?"` → returned as-is.
 * - A plain string → prefixed with `"?"`.
 * - An object → serialised with `URLSearchParams`; arrays become
 *   repeated `key[]` entries.
 */
export const buildQueryString = (
  params: Record<string, unknown> | string | undefined,
): string => {
  if (!params) return '';
  if (typeof params === 'string') {
    return params.startsWith('?') ? params : `?${params}`;
  }
  if (typeof params === 'object') {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        if (Array.isArray(v)) {
          v.forEach((val) => sp.append(`${k}[]`, String(val)));
        } else {
          sp.append(k, String(v));
        }
      }
    });
    const s = sp.toString();
    return s ? `?${s}` : '';
  }
  return '';
};

// ─── Response helpers ─────────────────────────────────────────────────────────

/**
 * Read a human-readable error message from a non-ok `Response`.
 * Tries to parse JSON first; falls back to the raw text body; falls back
 * to `fallback` when the body is empty.
 */
  export const readError = async (res: Response, fallback: string): Promise<string> => {
    const text = await res.text().catch(() => '');
    if (!text) return fallback;
    try {
      const data = JSON.parse(text) as Record<string, unknown>;
      return (data?.message as string) || (data?.error as string) || fallback;
    } catch {
      return text;
    }
  };

  /**
   * Wrap a `Response` as JSON, returning an error-shaped object when the
   * response is not ok:
   * ```
   * { serverError: string; data: unknown; status: number }
   * ```
   * Returns the parsed JSON directly on success.
   */
  export const wrapJsonResponse = async (
    res: Response,
    fallback: string,
  ): Promise<any> => {
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        serverError:
          (data as any)?.error || (data as any)?.message || fallback,
        data,
        status: res.status,
      };
    }

    return data;
  };

  /**
   * Fetch `url` with `options` and parse the JSON response.
   *
   * - On network/HTTP error → returns `{ serverError: string }`.
   * - On 204 No Content → returns `true`.
   * - Otherwise → returns the parsed JSON body.
   */
  export const requestJson = async (
    url: string,
    options: RequestInit,
    fallback: string,
  ): Promise<any> => {
    const res = await fetch(url, options);

    if (!res.ok) {
      return { serverError: await readError(res, fallback) };
    }

    if (res.status === 204) return true;
    return res.json();
  };

  /**
   * Parse a JSON response from an already-resolved `Response` object.
   *
   * Identical semantics to `requestJson` but skips the `fetch()` call —
   * useful when you need to inspect the response before delegating
   * (e.g. to handle a 404 specially).
   */
  export const requestJsonFromResponse = async (
    res: Response,
    fallback: string,
  ): Promise<any> => {
    if (!res.ok) return { serverError: await readError(res, fallback) };
    if (res.status === 204) return true;
    return res.json();
  };

  // ─── Cached fetch config ──────────────────────────────────────────────────────

  /**
   * Build a `RequestInit` object suitable for a cacheable GET request.
   *
   * On the **server** (no `window`), unless the cache is explicitly bypassed,
   * the config includes Next.js `next.tags` and `next.revalidate` so that the
   * host app can use ISR / on-demand revalidation.
   *
   * Cache bypass conditions:
   * - `options.cache === "no-store"`
   * - `options.revalidate === 0`
   * - Any internal `revalidation` / `forceRevalidate` flags (legacy)
   *
   * @param defaultTags  Cache tags to associate by default (e.g. `["cart"]`).
   * @param defaultTtl   Fallback revalidation TTL in seconds (default `86400`).
   * @param options      Request options from the call site.
   */
  export const buildCachedFetchConfig = async (
    defaultTags: string[] = [],
    defaultTtl: number = 86400,
    options: RequestOptions = {},
  ): Promise<RequestInit> => {
    const headers = await buildHeaders(options);

    const shouldBypassCache =
      options.cache === 'no-store' ||
      (options as any).revalidation === true ||
      (options as any).forceRevalidate === true ||
      options.revalidate === 0;

    if (typeof window === 'undefined' && !shouldBypassCache) {
      const tags = Array.isArray(options.tags)
        ? [...defaultTags, ...options.tags]
        : defaultTags;
      const revalidate =
        typeof options.revalidate === 'number' ? options.revalidate : defaultTtl;
      return {
        method: 'GET',
        headers,
        // @ts-expect-error — `next` is a Next.js extension to RequestInit
        next: { tags, revalidate },
      };
    }

    return {
      method: 'GET',
      headers,
      cache: (options.cache as RequestCache) || 'no-store',
    };
  };

  /**
   * Revalidate an on-demand cache tag.
   * Uses injected adapter if provided, otherwise falls back safely to Next.js `next/cache`.
   */
  export const revalidateCacheTag = async (
    tag: string,
    options?: RequestOptions,
  ): Promise<void> => {
    const adapterRevalidate =
      options?.adapter?.revalidateTag || globalConfig?.adapter?.revalidateTag;
    if (typeof adapterRevalidate === 'function') {
      try {
        await adapterRevalidate(tag);
        return;
      } catch {
        // continue to next/cache fallback
      }
    }

    if (typeof window === 'undefined') {
      try {
        const nextCache: any = await import('next/cache');
        nextCache.revalidateTag?.(tag);
      } catch {
        // non-Next.js or unsupported environment
      }
    }
  };
