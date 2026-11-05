// @defx/storefront-core

/**
 * Router interface for navigation decoupling.
 * Can be provided by Next.js (useRouter), React Router (useNavigate), Remix, etc.
 */
export interface RouterAdapter {
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
export interface FrameworkAdapter {
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
