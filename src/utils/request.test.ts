import { describe, it, expect } from "vitest";
import {
  buildQueryString,
  getApiBaseUrl,
  getOrganizationId,
  configureStorefront,
  getStorefrontGlobalConfig,
} from "./request";

describe("src/utils/request", () => {
  describe("buildQueryString", () => {
    it("returns empty string when given null or empty object", () => {
      expect(buildQueryString(undefined)).toBe("");
      expect(buildQueryString({})).toBe("");
    });

    it("formats flat key-value pairs correctly", () => {
      expect(buildQueryString({ page: 1, per_page: 10 })).toBe("?page=1&per_page=10");
    });

    it("formats array values as repeated key[] parameters", () => {
      expect(buildQueryString({ "ids": [10, 20] })).toBe("?ids%5B%5D=10&ids%5B%5D=20");
    });

    it("preserves leading question marks when passed raw string", () => {
      expect(buildQueryString("?page=2")).toBe("?page=2");
      expect(buildQueryString("page=2")).toBe("?page=2");
    });

    it("ignores null or undefined values in parameter objects", () => {
      expect(buildQueryString({ valid: "yes", empty: null, missing: undefined })).toBe("?valid=yes");
    });
  });

  describe("getApiBaseUrl", () => {
    it("prioritizes options.config.apiBaseUrl over other fallbacks", () => {
      const url = getApiBaseUrl({
        config: { apiBaseUrl: "https://config.defx.test" },
        apiBaseUrl: "https://options.defx.test",
      });
      expect(url).toBe("https://config.defx.test");
    });

    it("uses options.apiBaseUrl if config.apiBaseUrl is absent", () => {
      const url = getApiBaseUrl({
        apiBaseUrl: "https://options.defx.test",
      });
      expect(url).toBe("https://options.defx.test");
    });
  });

  describe("getOrganizationId", () => {
    it("resolves storeId from config object", () => {
      expect(getOrganizationId({ config: { storeId: "store_123" } })).toBe("store_123");
    });

    it("resolves orgId from options", () => {
      expect(getOrganizationId({ orgId: "org_456" })).toBe("org_456");
    });
  });

  describe("configureStorefront & adapters", () => {
    it("allows setting global configuration", () => {
      configureStorefront({
        apiBaseUrl: "https://global.defx.test",
        storeId: "global_store_999",
      });
      expect(getStorefrontGlobalConfig().apiBaseUrl).toBe("https://global.defx.test");
      expect(getStorefrontGlobalConfig().storeId).toBe("global_store_999");
      expect(getApiBaseUrl({})).toBe("https://global.defx.test");
      expect(getOrganizationId({})).toBe("global_store_999");
    });
  });
});

