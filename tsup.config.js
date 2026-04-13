import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.js"],
    format: ["esm"],
    clean: true,
    loader: {
        ".js": "jsx",
    },
    esbuildOptions(options) {
        options.jsx = "automatic"; // 🔥 THIS IS THE REAL FIX
    },
});