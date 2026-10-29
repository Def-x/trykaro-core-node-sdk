import { defineConfig } from "tsup";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: [
    "src/index.ts",           // main bundle — components, hooks, context, analytics
    "src/stripe.ts",          // optional Stripe sub-package — only imported by Stripe projects
    "src/phonepe.ts",         // PhonePe sub-package & helpers
    "src/actions.ts",         // actions bundle — pure async helpers, safe in server components
    "src/analytics/gtm.ts",   // tree-shakeable GTM / GA4 helpers
    "src/analytics/meta.ts",  // tree-shakeable Meta Pixel helpers
    "src/analytics/posthog.ts", // tree-shakeable PostHog helpers
  ],
  // NOTE: "use client" is added per-file only in React component / client hook files.
  // The actions bundle must NOT have "use client" — it is server-compatible.
  format: ["esm"],
  clean: true,
  sourcemap: true,
  dts: true,          // emit TypeScript declarations (.d.ts) for SDK consumers
  treeshake: true,
  // posthog-js is now a peer dependency — do NOT bundle it
  external: [
    "react",
    "react-dom",
    "lodash",
    "@clerk/nextjs",
    "next/link",
    "next/navigation",
    "next/headers",
    "next/cache",
    "react-razorpay",
    // Stripe (only required when org payment mode is "stripe")
    "@stripe/stripe-js",
    "@stripe/react-stripe-js",
    // Icon library used by StripeCheckout
    "lucide-react",
    // Analytics & Telemetry — now a peer dep, not bundled
    "posthog-js",
    // js-cookie is used in useLogout
    "js-cookie",
  ],
  // Handle .ts and .tsx files as JSX
  loader: {
    ".js": "jsx",
    ".jsx": "jsx",
    ".ts": "ts",
    ".tsx": "tsx",
  },

  esbuildOptions(options) {
    // Use the automatic JSX runtime (react/jsx-runtime).
    // This means no need for `import React from "react"` in every file.
    options.jsx = "automatic";

    // Add path alias support
    options.alias = {
      "@": path.resolve(__dirname, "src"),
      "@/hooks": path.resolve(__dirname, "src/hooks"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/context": path.resolve(__dirname, "src/context"),
      "@/styles": path.resolve(__dirname, "src/styles"),
      "@/config": path.resolve(__dirname, "src/config"),
      "@/public": path.resolve(__dirname, "public"),
    };
  },
});

