import posthog from 'posthog-js';

// src/lib/posthog.ts
var POSTHOG_INSTANCES = {
  DEVELOPER: "developer",
  MERCHANT: "merchant"
};
var instanceRegistry = {
  developer: null,
  merchant: null
};
var globalListenersAttached = false;
function getPostHogModule() {
  if (posthog && typeof posthog.init === "function") return posthog;
  if (posthog?.default && typeof posthog.default.init === "function") {
    return posthog.default;
  }
  return posthog;
}
function sanitizePostHogToken(token) {
  if (!token || typeof token !== "string") return "";
  return token.trim();
}
function attachGlobalErrorListeners() {
  if (globalListenersAttached || typeof window === "undefined") return;
  window.addEventListener("error", (event) => {
    try {
      const error = event.error || new Error(event.message || "Unhandled Window Error");
      captureDeveloperException(error, {
        source: "window.onerror",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    } catch (_) {
    }
  });
  window.addEventListener("unhandledrejection", (event) => {
    try {
      const reason = event.reason;
      const error = reason instanceof Error ? reason : new Error(typeof reason === "string" ? reason : "Unhandled Promise Rejection");
      captureDeveloperException(error, {
        source: "window.onunhandledrejection",
        reason: typeof reason === "object" ? JSON.stringify(reason) : String(reason)
      });
    } catch (_) {
    }
  });
  globalListenersAttached = true;
}
function initPostHog(instanceName, config = {}) {
  if (typeof window === "undefined") return null;
  if (instanceRegistry[instanceName]) {
    return instanceRegistry[instanceName];
  }
  const isProd = typeof process !== "undefined" && process.env?.NODE_ENV === "production";
  const forceEnable = config.enabledInDev || config.forceEnable || typeof process !== "undefined" && process.env?.NEXT_PUBLIC_POSTHOG_DEVELOPER_ENABLE_IN_DEV === "true";
  if (!isProd && !forceEnable) {
    return null;
  }
  const rawToken = config.token;
  const token = sanitizePostHogToken(rawToken);
  const isDev = typeof process !== "undefined" && process.env?.NODE_ENV === "development";
  if (!token) {
    if (isDev) {
      console.warn(
        `[PostHog] No token provided for "${instanceName}" instance. Telemetry will be disabled.`
      );
    }
    return null;
  }
  const apiHost = config.apiHost || config.host || typeof process !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_HOST_DEVELOPER || "https://us.i.posthog.com";
  try {
    const isDeveloper = instanceName === POSTHOG_INSTANCES.DEVELOPER;
    const options = {
      api_host: apiHost,
      // Use isolated storage key so developer instance never clashes with merchant session
      persistence_name: isDeveloper ? "ph_developer" : "ph_merchant",
      autocapture: config.autocapture ?? false,
      capture_pageview: config.capturePageview ?? false,
      capture_exceptions: config.captureExceptions ?? (isDeveloper ? {
        capture_unhandled_errors: true,
        capture_unhandled_rejections: true,
        capture_console_errors: true
      } : true),
      disable_session_recording: config.disableSessionRecording ?? true,
      loaded: (phInstance) => {
        if (isDev) {
          phInstance.debug();
        }
        if (typeof config.onLoaded === "function") {
          config.onLoaded(phInstance);
        }
      },
      ...config.customOptions
    };
    const ph = getPostHogModule();
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
function initDeveloperPostHog(options = {}) {
  const token = options.token || (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN_DEVELOPER : null);
  const apiHost = options.apiHost || options.host || (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_POSTHOG_HOST_DEVELOPER : null) || "https://us.i.posthog.com";
  return initPostHog(POSTHOG_INSTANCES.DEVELOPER, {
    ...options,
    token,
    apiHost
  });
}
function initMerchantPostHog(options = {}) {
  return initPostHog(POSTHOG_INSTANCES.MERCHANT, options);
}
function getPostHogInstance(instanceName) {
  if (typeof window === "undefined") return null;
  const ph = getPostHogModule();
  return instanceRegistry[instanceName] || ph?.[instanceName] || null;
}
function getDeveloperPostHog() {
  return getPostHogInstance(POSTHOG_INSTANCES.DEVELOPER);
}
function getMerchantPostHog() {
  return getPostHogInstance(POSTHOG_INSTANCES.MERCHANT);
}
function setDeveloperSuperProperties(properties = {}) {
  const client = getDeveloperPostHog();
  if (client && typeof client.register === "function") {
    client.register(properties);
  }
}
function identifyDeveloperUser(userId, userProperties = {}) {
  const client = getDeveloperPostHog();
  if (client && userId && typeof client.identify === "function") {
    client.identify(String(userId), userProperties);
  }
}
function resetDeveloperPostHog() {
  const client = getDeveloperPostHog();
  if (client && typeof client.reset === "function") {
    client.reset();
  }
}
function captureDeveloperException(error, properties = {}) {
  const client = getDeveloperPostHog();
  const errObj = error instanceof Error ? error : new Error(typeof error === "string" ? error : "Unknown Developer Error");
  const payload = {
    $exception_message: errObj.message,
    $exception_type: errObj.name || "Error",
    $exception_stack_trace_raw: errObj.stack || null,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    url: typeof window !== "undefined" ? window.location.href : null,
    ...properties
  };
  if (client) {
    if (typeof client.captureException === "function") {
      client.captureException(errObj, payload);
    } else {
      client.capture("$exception", payload);
    }
  } else {
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
      console.error("[DeveloperError - Unreported]", errObj, properties);
    }
  }
}
function logDeveloper(message, level = "info", properties = {}) {
  const client = getDeveloperPostHog();
  const logPayload = {
    level,
    message: typeof message === "string" ? message : JSON.stringify(message),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    url: typeof window !== "undefined" ? window.location.href : null,
    ...properties
  };
  if (client) {
    if (typeof client.log === "function") {
      try {
        client.log(logPayload.message, level === "debug" ? "log" : level);
      } catch (_) {
      }
    }
    client.capture("developer_log", logPayload);
  }
  if (level === "error" && properties?.error) {
    captureDeveloperException(properties.error, {
      logMessage: message,
      ...properties
    });
  }
}
var devLogger = {
  debug: (message, meta = {}) => logDeveloper(message, "debug", meta),
  info: (message, meta = {}) => logDeveloper(message, "info", meta),
  warn: (message, meta = {}) => logDeveloper(message, "warn", meta),
  error: (message, errorOrMeta = null, extraMeta = {}) => {
    if (errorOrMeta instanceof Error) {
      logDeveloper(message, "error", { ...extraMeta, error: errorOrMeta });
    } else {
      logDeveloper(message, "error", { ...errorOrMeta ?? {}, ...extraMeta });
    }
  }
};

export { POSTHOG_INSTANCES, captureDeveloperException, devLogger, getDeveloperPostHog, getMerchantPostHog, getPostHogInstance, getPostHogModule, identifyDeveloperUser, initDeveloperPostHog, initMerchantPostHog, initPostHog, logDeveloper, resetDeveloperPostHog, sanitizePostHogToken, setDeveloperSuperProperties };
//# sourceMappingURL=chunk-PTJGNUY5.js.map
//# sourceMappingURL=chunk-PTJGNUY5.js.map