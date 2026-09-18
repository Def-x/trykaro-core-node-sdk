import posthog from "posthog-js";

/**
 * PostHog Multi-Instance & Developer Telemetry Utility
 * @defx/storefront-core
 * ─────────────────────────────────────────────────────────────────────────────
 * Supports isolated dual-instance architecture:
 *   - "developer": Internal telemetry, logs, exceptions, and diagnostics
 *   - "merchant":  Storefront business analytics (prepared for future expansion)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const POSTHOG_INSTANCES = {
  DEVELOPER: "developer",
  MERCHANT: "merchant",
};

// Internal registry of initialized instances
const instanceRegistry = {
  developer: null,
  merchant: null,
};

let globalListenersAttached = false;

/**
 * Safely resolves the posthog module object across ESM, CJS, and Next.js bundlers.
 */
export function getPostHogModule() {
  if (posthog && typeof posthog.init === "function") return posthog;
  if (posthog?.default && typeof posthog.default.init === "function") {
    return posthog.default;
  }
  return posthog;
}

/**
 * Safely sanitizes token string (handles trailing whitespace/newlines)
 */
export function sanitizePostHogToken(token) {
  if (!token || typeof token !== "string") return "";
  return token.trim();
}

/**
 * Attaches global browser error listeners for unhandled errors & promise rejections.
 * Routed specifically to the developer PostHog instance.
 */
function attachGlobalErrorListeners() {
  if (globalListenersAttached || typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    try {
      const error = event.error || new Error(event.message || "Unhandled Window Error");
      captureDeveloperException(error, {
        source: "window.onerror",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    } catch (_) {
      // Prevent recursive failures
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    try {
      const reason = event.reason;
      const error =
        reason instanceof Error
          ? reason
          : new Error(typeof reason === "string" ? reason : "Unhandled Promise Rejection");
      captureDeveloperException(error, {
        source: "window.onunhandledrejection",
        reason: typeof reason === "object" ? JSON.stringify(reason) : String(reason),
      });
    } catch (_) {
      // Prevent recursive failures
    }
  });

  globalListenersAttached = true;
}

/**
 * Initialize a specific named PostHog instance.
 *
 * @param {'developer'|'merchant'} instanceName
 * @param {Object} config
 */
export function initPostHog(instanceName, config = {}) {
  if (typeof window === "undefined") return null;

  // Return existing instance if already initialized
  if (instanceRegistry[instanceName]) {
    return instanceRegistry[instanceName];
  }

  // Restrict to production only (disabled in local & development)
  const isProd =
    typeof process !== "undefined" && process.env?.NODE_ENV === "production";
  const forceEnable =
    config.enabledInDev ||
    config.forceEnable ||
    (typeof process !== "undefined" &&
      process.env?.NEXT_PUBLIC_POSTHOG_DEVELOPER_ENABLE_IN_DEV === "true");

  if (!isProd && !forceEnable) {
    return null;
  }

  const rawToken = config.token;
  const token = sanitizePostHogToken(rawToken);

  if (!token) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[PostHog] No token provided for "${instanceName}" instance. Telemetry will be disabled.`
      );
    }
    return null;
  }

  const apiHost =
    config.apiHost ||
    config.host ||
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_HOST_DEVELOPER) ||
    "https://us.i.posthog.com";

  try {
    const isDeveloper = instanceName === POSTHOG_INSTANCES.DEVELOPER;

    const options = {
      api_host: apiHost,
      // Use isolated storage key so developer instance never clashes with merchant session
      persistence_name: isDeveloper ? "ph_developer" : "ph_merchant",
      autocapture: config.autocapture ?? false,
      capture_pageview: config.capturePageview ?? false,
      capture_exceptions:
        config.captureExceptions ??
        (isDeveloper
          ? {
              capture_unhandled_errors: true,
              capture_unhandled_rejections: true,
              capture_console_errors: true,
            }
          : true),
      disable_session_recording: config.disableSessionRecording ?? true,
      loaded: (phInstance) => {
        if (process.env.NODE_ENV === "development") {
          phInstance.debug();
        }
        if (typeof config.onLoaded === "function") {
          config.onLoaded(phInstance);
        }
      },
      ...config.customOptions,
    };

    const ph = getPostHogModule();
    // posthog.init(token, options, name) creates an isolated named instance
    const client = ph.init(token, options, instanceName);
    instanceRegistry[instanceName] = client || ph?.[instanceName] || null;

    if (isDeveloper && instanceRegistry[instanceName]) {
      attachGlobalErrorListeners();
      if (typeof window !== "undefined") {
        window.__posthog_developer = instanceRegistry[instanceName];
        window.devLogger = devLogger;
      }
    }

    return instanceRegistry[instanceName];
  } catch (err) {
    console.error(`[PostHog] Failed to initialize "${instanceName}" instance:`, err);
    return null;
  }
}

/**
 * Initialize the Developer PostHog instance.
 * Automatically falls back to NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN_DEVELOPER
 * and NEXT_PUBLIC_POSTHOG_HOST_DEVELOPER environment variables if not passed in options.
 */
export function initDeveloperPostHog(options = {}) {
  const token =
    options.token ||
    (typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN_DEVELOPER
      : null);

  const apiHost =
    options.apiHost ||
    options.host ||
    (typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_POSTHOG_HOST_DEVELOPER
      : null) ||
    "https://us.i.posthog.com";

  return initPostHog(POSTHOG_INSTANCES.DEVELOPER, {
    ...options,
    token,
    apiHost,
  });
}

/**
 * Initialize the Merchant PostHog instance.
 * Prepared for future expansion when merchant analytics are activated.
 */
export function initMerchantPostHog(options = {}) {
  return initPostHog(POSTHOG_INSTANCES.MERCHANT, options);
}

/**
 * Get an initialized PostHog client by instance name.
 */
export function getPostHogInstance(instanceName) {
  if (typeof window === "undefined") return null;
  const ph = getPostHogModule();
  return instanceRegistry[instanceName] || ph?.[instanceName] || null;
}

/**
 * Convenience accessor for the developer instance.
 */
export function getDeveloperPostHog() {
  return getPostHogInstance(POSTHOG_INSTANCES.DEVELOPER);
}

/**
 * Convenience accessor for the merchant instance.
 */
export function getMerchantPostHog() {
  return getPostHogInstance(POSTHOG_INSTANCES.MERCHANT);
}

/**
 * Register super properties attached to all subsequent developer events (e.g. storeId, regionId, env).
 */
export function setDeveloperSuperProperties(properties = {}) {
  const client = getDeveloperPostHog();
  if (client && typeof client.register === "function") {
    client.register(properties);
  }
}

/**
 * Identify user on the developer PostHog instance.
 */
export function identifyDeveloperUser(userId, userProperties = {}) {
  const client = getDeveloperPostHog();
  if (client && userId && typeof client.identify === "function") {
    client.identify(String(userId), userProperties);
  }
}

/**
 * Reset user identity on logout for developer instance.
 */
export function resetDeveloperPostHog() {
  const client = getDeveloperPostHog();
  if (client && typeof client.reset === "function") {
    client.reset();
  }
}

// ─── Developer Error Tracking ──────────────────────────────────────────────────

/**
 * Capture an error/exception to the Developer PostHog instance.
 *
 * @param {Error|string|unknown} error
 * @param {Object} [properties]
 */
export function captureDeveloperException(error, properties = {}) {
  const client = getDeveloperPostHog();
  const errObj =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : "Unknown Developer Error");

  const payload = {
    $exception_message: errObj.message,
    $exception_type: errObj.name || "Error",
    $exception_stack_trace_raw: errObj.stack || null,
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : null,
    ...properties,
  };

  if (client) {
    // Native PostHog error tracking
    if (typeof client.captureException === "function") {
      client.captureException(errObj, payload);
    } else {
      client.capture("$exception", payload);
    }
  } else {
    // Fallback if PostHog developer instance is not loaded
    if (process.env.NODE_ENV === "development") {
      console.error("[DeveloperError - Unreported]", errObj, properties);
    }
  }
}

// ─── Developer Structured Logging ──────────────────────────────────────────────

/**
 * Send a structured developer log event to the Developer PostHog instance.
 *
 * @param {string} message
 * @param {'debug'|'info'|'warn'|'error'} [level='info']
 * @param {Object} [properties={}]
 */
export function logDeveloper(message, level = "info", properties = {}) {
  const client = getDeveloperPostHog();
  const logPayload = {
    level,
    message: typeof message === "string" ? message : JSON.stringify(message),
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : null,
    ...properties,
  };

  if (client) {
    // If PostHog has native log capability, invoke it
    if (typeof client.log === "function") {
      try {
        client.log(logPayload.message, level === "debug" ? "log" : level);
      } catch (_) {}
    }

    // Capture structured custom event
    client.capture("developer_log", logPayload);
  }

  // If level is error and an error object is passed in properties, also capture as exception
  if (level === "error" && properties?.error) {
    captureDeveloperException(properties.error, {
      logMessage: message,
      ...properties,
    });
  }
}

/**
 * Standardized developer logger API.
 * Usage:
 *   devLogger.info("Cart updated successfully", { cartId: "123" });
 *   devLogger.error("Failed to checkout", err, { step: "payment" });
 */
export const devLogger = {
  debug: (message, meta = {}) => logDeveloper(message, "debug", meta),
  info: (message, meta = {}) => logDeveloper(message, "info", meta),
  warn: (message, meta = {}) => logDeveloper(message, "warn", meta),
  error: (message, errorOrMeta = null, extraMeta = {}) => {
    if (errorOrMeta instanceof Error) {
      logDeveloper(message, "error", { ...extraMeta, error: errorOrMeta });
    } else {
      logDeveloper(message, "error", { ...errorOrMeta, ...extraMeta });
    }
  },
};
