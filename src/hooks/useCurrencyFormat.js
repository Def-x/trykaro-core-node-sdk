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
    const { orgData } = useCore();

    const currency = orgData?.organization_setting?.currency ?? "INR";
    const locale = orgData?.organization_setting?.locale ?? "en-IN";
    console.log({ orgData })
    const formatCurrency = (amount) => {
        if (amount == null) return "";
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
        }).format(amount);
    };

    return { formatCurrency };
}
