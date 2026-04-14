import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.js"],
    format: ["esm"],
    clean: true,
    sourcemap: true,
    dts: false,         // JS-only package — no TypeScript declarations needed
    treeshake: true,

    // External deps — consumers provide these. Prevents duplicate React/lodash instances.
    external: ["react", "react-dom", "lodash"],

    // Handle .js files as JSX
    loader: {
        ".js": "jsx",
    },

    esbuildOptions(options) {
        // Use the automatic JSX runtime (react/jsx-runtime).
        // This means no need for `import React from "react"` in every file.
        options.jsx = "automatic";
    },
});