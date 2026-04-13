import { useRegionContext } from "@/context/RegionContext";


export function useCurrencyFormat() {
  const region = useRegionContext();

  const activeRegion = region?.activeRegion;

  const currency = activeRegion?.currency || "INR";
  const locale = activeRegion?.locale || "en-IN";

  function formatCurrency(amount) {
    if (amount == null) return "";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  return { formatCurrency };
}
