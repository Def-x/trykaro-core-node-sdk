import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@/hooks": path.resolve(__dirname, "src/hooks"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/context": path.resolve(__dirname, "src/context"),
      "@/styles": path.resolve(__dirname, "src/styles"),
      "@/config": path.resolve(__dirname, "src/config"),
    },
  },
});

