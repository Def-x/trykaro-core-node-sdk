"use client";

import { useCore } from "../context/CoreProvider";

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
export function useCurrencyFormat() {
    const { config, orgData } = useCore();

    const activeRegion = config?.isRegion ? config?.activeRegion ?? config?.region ?? null : null;
    const currency = activeRegion?.currency ?? config?.currency ?? orgData?.organization_setting?.currency ?? "INR";
    const locale = activeRegion?.locale ?? config?.locale ?? orgData?.organization_setting?.locale ?? "en-IN";
    const currencySymbol = activeRegion?.invoice_setting?.currency_symbol ?? activeRegion?.currency_symbol ?? null;

    const formatCurrency = (amount) => {
        if (amount == null) return "";

        const numericAmount = Number(amount);
        const formattedAmount = new Intl.NumberFormat(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericAmount);

        if (currencySymbol) {
            return `${currencySymbol}${formattedAmount}`;
        }

        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
        }).format(numericAmount);
    };

    return { formatCurrency };
}
