"use client";

import { useEffect } from "react";
import {
  nameToSlug,
  injectContentSquare,
  injectHotjar,
  injectClarity,
} from "../../lib/thirdPartyScripts";

/**
 * ThirdPartyScripts — @defx/storefront-core
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches or extracts installed marketplace integrations (Hotjar, ContentSquare, Microsoft Clarity, etc.)
 * from organization settings / backend API and injects their tracking scripts
 * dynamically into the browser <head> at runtime.
 *
 * Automatically included in <CoreProvider /> and can also be rendered directly:
 *   <ThirdPartyScripts apiBaseUrl={...} orgId={...} orgData={...} />
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function ThirdPartyScripts({
  apiBaseUrl,
  orgId,
  marketplaces: prefetched,
  orgData,
}) {
  console.log({ orgData });
  useEffect(() => {
    async function run() {
      let records = prefetched;

      // 1. Extract from orgData / organization settings if available
      if (!records && orgData) {
        const candidateArray = orgData.organization_marketplaces;

        if (Array.isArray(candidateArray)) {
          records = candidateArray;
        }
      }

      // 2. Fallback: fetch from backend API if not in orgData/prefetched
      const targetApiUrl =
        apiBaseUrl ||
        (typeof process !== "undefined"
          ? process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
          : "");
      const targetOrgId =
        orgId ||
        (typeof process !== "undefined"
          ? process.env.ORG_ID || process.env.NEXT_PUBLIC_ORG_ID
          : "");

      if (!records && targetApiUrl && targetOrgId) {
        try {
          const res = await fetch(
            `${targetApiUrl.replace(/\/$/, "")}/api/organization_marketplaces`,
            {
              headers: {
                "Content-Type": "application/json",
                accept: "application/vnd.defx-store.v2",
                "Set-Organization": targetOrgId,
              },
              cache: "no-store",
            },
          );
          if (res.ok) {
            records = await res.json();
          }
        } catch (err) {
          console.warn(
            "[ThirdPartyScripts] Failed to fetch marketplaces:",
            err,
          );
        }
      }

      if (!Array.isArray(records)) return;

      records.forEach((record) => {
        const json =
          record.market_place_json || record.market_place || record || {};

        // Skip disabled or uninstalled integrations
        if (record.is_installed === false || json.enabled === false) return;

        // Primary: use name from market_place object instead of legacy appName
        const name =
          record.market_place?.name ||
          record.name ||
          record.appName ||
          json.name ||
          json.appName ||
          "";
        const slug = nameToSlug(name);

        switch (slug) {
          case "content-square":
            const csCode =
              json.trackingCode || record.market_place?.metadata?.trackingCode;
            if (csCode) {
              injectContentSquare(csCode);
            }
            break;

          case "hotjar":
            const siteId = json.siteId || record.market_place?.metadata?.siteId;
            if (siteId) {
              injectHotjar(siteId, json.hotjarVersion || 6);
            }
            break;

          case "microsoft-clarity":
          case "clarity":
            const clarityId =
              json.projectId ||
              json.projectIdFromInput ||
              json.clarityId ||
              json.project_id ||
              json.id ||
              record.market_place?.metadata?.projectId ||
              record.market_place?.metadata?.clarityId;
            if (clarityId) {
              injectClarity(clarityId);
            }
            break;

          default:
            break;
        }
      });
    }

    run();
  }, [apiBaseUrl, orgId, prefetched, orgData]);

  return null;
}
