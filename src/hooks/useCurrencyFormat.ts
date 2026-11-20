"use client";

import { useCore } from "../context/CoreProvider";

const SYMBOL_TO_ISO: Record<string, string> = {
  "₹": "INR",
  Rs: "INR",
  "Rs.": "INR",
  "$": "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "A$": "AUD",
  "C$": "CAD",
  AED: "AED",
};

/**
 * useCurrencyFormat()
 *
 * Reads currency/locale from CoreProvider config.
 * No store-specific or framework imports.
 *
 * Config keys used:
 *  config.currency  (e.g. "INR", "USD") — defaults to "USD"
 *  config.locale    (e.g. "en-IN", "en-US") — defaults to "en-US"
 *
 * Usage:
 *  const { formatCurrency } = useCurrencyFormat();
 *  formatCurrency(1999.5) // "₹1,999.50"
 */
export function useCurrencyFormat(): {
    formatCurrency: (amount: number | string | null | undefined) => string;
} {
    const { config, orgData } = useCore();

    const isRegionBased = Boolean(config?.isRegion);
    const activeRegion = isRegionBased
        ? (config?.activeRegion ?? config?.region ?? null)
        : null;

    const rawCurrency = isRegionBased
        ? (activeRegion?.currency ?? config?.currency ?? orgData?.organization_setting?.currency ?? "INR")
        : (config?.currency ?? orgData?.organization_setting?.currency ?? "INR");
    const locale = isRegionBased
        ? (activeRegion?.locale ?? config?.locale ?? orgData?.organization_setting?.locale ?? "en-IN")
        : (config?.locale ?? orgData?.organization_setting?.locale ?? "en-IN");

    // Validate if currency is a valid 3-letter ISO 4217 code (e.g. "INR", "USD")
    const isIsoCode = typeof rawCurrency === "string" && /^[A-Z]{3}$/i.test(rawCurrency.trim());
    const mappedIso = !isIsoCode && typeof rawCurrency === "string" ? SYMBOL_TO_ISO[rawCurrency.trim()] : null;
    const currency = isIsoCode
        ? rawCurrency.trim().toUpperCase()
        : mappedIso ?? config?.currency ?? orgData?.organization_setting?.currency ?? "INR";

    const symbolFromCurrency = !isIsoCode && typeof rawCurrency === "string" ? rawCurrency.trim() : null;

    const orgSymbol =
        orgData?.invoice_setting?.currency_symbol ||
        orgData?.organization_setting?.invoice_setting?.currency_symbol ||
        orgData?.organization_setting?.currency_symbol;

    const currencySymbol = isRegionBased
        ? (activeRegion?.invoice_setting?.currency_symbol ||
           activeRegion?.currency_symbol ||
           config?.currencySymbol ||
           orgSymbol ||
           symbolFromCurrency ||
           null)
        : (config?.currencySymbol ||
           orgSymbol ||
           symbolFromCurrency ||
           (currency === "INR" ? "₹" : null));

    const formatCurrency = (amount: number | string | null | undefined): string => {
        if (amount == null) return "";

        const numericAmount = Number(amount);
        if (isNaN(numericAmount)) return String(amount);

        const formattedAmount = new Intl.NumberFormat(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericAmount);

        if (currencySymbol) {
            return `${currencySymbol}${formattedAmount}`;
        }

        try {
            return new Intl.NumberFormat(locale, {
                style: "currency",
                currency: isIsoCode ? currency : "INR",
            }).format(numericAmount);
        } catch {
            return `${currencySymbol || currency} ${formattedAmount}`;
        }
    };

    return { formatCurrency };
}
