import { defineConfig } from "tsup";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: [
    "src/index.js", // main bundle — zero Stripe code
    "src/stripe.js", // optional Stripe sub-package — only imported by Stripe projects
  ],
  format: ["esm"],
  clean: true,
  sourcemap: true,
  dts: false, // JS-only package — no TypeScript declarations needed
  treeshake: true,
  // External deps — consumers provide these. Prevents duplicate React/lodash instances.
  external: [
    "react",
    "react-dom",
    "lodash",
    "@clerk/nextjs",
    "next/link",
    "next/navigation",
    "react-razorpay",
    // Stripe (only required when org payment mode is "stripe")
    "@stripe/stripe-js",
    "@stripe/react-stripe-js",
    // Icon library used by StripeCheckout
    "lucide-react",
  ],
  // Handle .js files as JSX
  loader: {
    ".js": "jsx",
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
