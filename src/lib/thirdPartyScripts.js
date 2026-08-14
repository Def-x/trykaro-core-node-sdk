/**
 * Third-Party Script Injection Utilities — @defx/storefront-core
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides safe, idempotent helpers to dynamically inject tracking scripts
 * (ContentSquare, Hotjar, etc.) into the browser <head> at runtime.
 *
 * Usage: Called by <ThirdPartyScripts /> after fetching org marketplace config.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Slug resolver (mirrors admin-panel nameToSlug) ────────────────────────

/**
 * Derives a canonical slug from a marketplace app name.
 * Must stay in sync with the admin panel's nameToSlug function.
 */
export function nameToSlug(name = "") {
  const n = name.toLowerCase().trim();
  if (n.includes("google analytics")) return "google-analytics";
  if (n.includes("meta pixel"))       return "meta-pixel";
  if (n.includes("instagram shopping")) return "instagram-shopping";
  if (n.includes("whatsapp business")) return "whatsapp-business";
  if (n.includes("whatsapp"))          return "whatsapp";
  if (n.includes("shiprocket"))        return "shiprocket";
  if (n.includes("razorpay"))          return "razorpay";
  if (n.includes("stripe"))            return "stripe";
  if (n.includes("contentsquare") || n.includes("content square")) return "content-square";
  if (n.includes("hotjar"))            return "hotjar";
  return n.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── Generic script injection ────────────────────────────────────────────────

/**
 * Idempotent: skips injection if a script with this id already exists in DOM.
 * @param {string} id   - Unique DOM id for the injected <script> element
 * @param {Function} fn - Callback that creates and appends the script element
 */
function injectOnce(id, fn) {
  if (typeof document === "undefined") return; // SSR guard
  if (document.getElementById(id)) return;      // already injected
  fn();
}

// ─── ContentSquare ────────────────────────────────────────────────────────────

/**
 * Safely parses a raw ContentSquare tracking code string (which is a full
 * `<script>` tag) and injects it into <head> as a live script element.
 *
 * @param {string} rawScriptHtml  - The full <script>...</script> string
 */
export function injectContentSquare(rawScriptHtml) {
  if (!rawScriptHtml || typeof rawScriptHtml !== "string") return;

  const trimmed = rawScriptHtml.trim();

  injectOnce("cs-tracking-script", () => {
    try {
      const script = document.createElement("script");
      script.id = "cs-tracking-script";
      script.async = true;

      // 1. Direct URL case (e.g. "https://t.contentsquare.net/uxa/c266c22a9c683.js")
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("//")) {
        script.src = trimmed;
      }
      // 2. Full HTML <script> tag case (e.g. '<script async src="https://t.contentsquare.net/uxa/c266c22a9c683.js"></script>')
      else if (trimmed.includes("<script")) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, "text/html");
        const sourceScript = doc.querySelector("script");

        if (sourceScript) {
          Array.from(sourceScript.attributes).forEach((attr) => {
            script.setAttribute(attr.name, attr.value);
          });

          if (sourceScript.src) {
            script.src = sourceScript.src;
          } else {
            script.textContent = sourceScript.textContent || sourceScript.innerHTML;
          }
        } else {
          script.textContent = trimmed;
        }
      }
      // 3. Raw inline JS string case
      else {
        script.textContent = trimmed;
      }

      document.head.appendChild(script);
    } catch (err) {
      console.error("[ThirdPartyScripts] ContentSquare injection failed:", err);
    }
  });
}

// ─── Hotjar ───────────────────────────────────────────────────────────────────

/**
 * Injects the standard Hotjar tracking snippet into <head>.
 *
 * @param {string|number} siteId  - Hotjar Site ID (e.g. 1234567)
 * @param {string|number} version - Hotjar snippet version (default: 6)
 */
export function injectHotjar(siteId, version = 6) {
  if (!siteId) return;

  injectOnce("hotjar-tracking-script", () => {
    const script = document.createElement("script");
    script.id = "hotjar-tracking-script";
    script.textContent = [
      `(function(h,o,t,j,a,r){`,
      `  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};`,
      `  h._hjSettings={hjid:${siteId},hjsv:${version}};`,
      `  a=o.getElementsByTagName('head')[0];`,
      `  r=o.createElement('script');r.async=1;`,
      `  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;`,
      `  a.appendChild(r);`,
      `})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
    ].join("\n");
    document.head.appendChild(script);
  });
}
