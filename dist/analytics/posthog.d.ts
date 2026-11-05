/**
 * PostHog Multi-Instance & Developer Telemetry Utility
 * @defx/storefront-core
 * ─────────────────────────────────────────────────────────────────────────────
 * Supports isolated dual-instance architecture:
 *   - "developer": Internal telemetry, logs, exceptions, and diagnostics
 *   - "merchant":  Storefront business analytics (prepared for future expansion)
 * ─────────────────────────────────────────────────────────────────────────────
 */
declare const POSTHOG_INSTANCES: {
    readonly DEVELOPER: "developer";
    readonly MERCHANT: "merchant";
};
type PostHogInstanceName = "developer" | "merchant";
interface PostHogConfig {
    token?: string;
    apiHost?: string;
    host?: string;
    enabledInDev?: boolean;
    forceEnable?: boolean;
    autocapture?: boolean;
    capturePageview?: boolean;
    captureExceptions?: boolean | Record<string, unknown>;
    disableSessionRecording?: boolean;
    onLoaded?: (phInstance: any) => void;
    customOptions?: Record<string, unknown>;
    [key: string]: unknown;
}
/**
 * Safely resolves the posthog module object across ESM, CJS, and Next.js bundlers.
 */
declare function getPostHogModule(): any;
/**
 * Safely sanitizes token string (handles trailing whitespace/newlines)
 */
declare function sanitizePostHogToken(token: unknown): string;
/**
 * Initialize a specific named PostHog instance.
 *
 * @param {'developer'|'merchant'} instanceName
 * @param {Object} config
 */
declare function initPostHog(instanceName: PostHogInstanceName, config?: PostHogConfig): any;
/**
 * Initialize the Developer PostHog instance.
 * Automatically falls back to NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN_DEVELOPER
 * and NEXT_PUBLIC_POSTHOG_HOST_DEVELOPER environment variables if not passed in options.
 */
declare function initDeveloperPostHog(options?: PostHogConfig): any;
/**
 * Initialize the Merchant PostHog instance.
 * Prepared for future expansion when merchant analytics are activated.
 */
declare function initMerchantPostHog(options?: PostHogConfig): any;
/**
 * Get an initialized PostHog client by instance name.
 */
declare function getPostHogInstance(instanceName: PostHogInstanceName): any;
/**
 * Convenience accessor for the developer instance.
 */
declare function getDeveloperPostHog(): any;
/**
 * Convenience accessor for the merchant instance.
 */
declare function getMerchantPostHog(): any;
/**
 * Register super properties attached to all subsequent developer events (e.g. storeId, regionId, env).
 */
declare function setDeveloperSuperProperties(properties?: Record<string, unknown>): void;
/**
 * Identify user on the developer PostHog instance.
 */
declare function identifyDeveloperUser(userId: string | number, userProperties?: Record<string, unknown>): void;
/**
 * Reset user identity on logout for developer instance.
 */
declare function resetDeveloperPostHog(): void;
/**
 * Capture an error/exception to the Developer PostHog instance.
 *
 * @param {Error|string|unknown} error
 * @param {Object} [properties]
 */
declare function captureDeveloperException(error: Error | string | unknown, properties?: Record<string, unknown>): void;
/**
 * Send a structured developer log event to the Developer PostHog instance.
 *
 * @param {string} message
 * @param {'debug'|'info'|'warn'|'error'} [level='info']
 * @param {Object} [properties={}]
 */
declare function logDeveloper(message: string, level?: "debug" | "info" | "warn" | "error", properties?: Record<string, unknown>): void;
/**
 * Standardized developer logger API.
 * Usage:
 *   devLogger.info("Cart updated successfully", { cartId: "123" });
 *   devLogger.error("Failed to checkout", err, { step: "payment" });
 */
declare const devLogger: {
    debug: (message: string, meta?: Record<string, unknown>) => void;
    info: (message: string, meta?: Record<string, unknown>) => void;
    warn: (message: string, meta?: Record<string, unknown>) => void;
    error: (message: string, errorOrMeta?: Error | Record<string, unknown> | null, extraMeta?: Record<string, unknown>) => void;
};

export { POSTHOG_INSTANCES, type PostHogConfig, type PostHogInstanceName, captureDeveloperException, devLogger, getDeveloperPostHog, getMerchantPostHog, getPostHogInstance, getPostHogModule, identifyDeveloperUser, initDeveloperPostHog, initMerchantPostHog, initPostHog, logDeveloper, resetDeveloperPostHog, sanitizePostHogToken, setDeveloperSuperProperties };
