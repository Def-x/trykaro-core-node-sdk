"use client";

import { useCallback, useEffect, useState } from "react";
import { useCore } from "../context/CoreProvider";
import {
  getLoyaltyProfileAction,
  getLoyaltyRewardsAction,
  getLoyaltyTransactionsAction,
  applyLoyaltyPointsAction,
} from "../actions/loyaltyActions";
import type {
  LoyaltyCustomer,
  LoyaltyProfileResponse,
  LoyaltyRewardItem,
  LoyaltyRewardsResponse,
  LoyaltyTransaction,
  ApplyLoyaltyPointsPayload,
  ApplyLoyaltyPointsResponse,
} from "../types/loyalty";

export interface UseLoyaltyOptions {
  autoFetch?: boolean;
}

/**
 * Checks whether the Loyalty & Rewards marketplace application is installed
 * and enabled for the merchant organization.
 *
 * Inspects:
 * 1. Explicit config/env override:
 *    - config?.enableLoyalty (true/false)
 *    - process.env.NEXT_PUBLIC_ENABLE_LOYALTY ("true"/"false")
 * 2. Organization feature exposure:
 *    - orgData?.expose_json?.loyalty?.enabled
 * 3. Organization marketplace installations:
 *    - orgData?.organization_marketplaces (array or stringified JSON)
 *      Matches records with slug/name/appName matching loyalty / reward / loyalty-rewards
 *      where is_installed is true and market_place_json.enabled is not false.
 */
export function isLoyaltyMarketplaceActive(orgData?: any, config?: any): boolean {
  // 1. Explicit config overrides (for testing, overrides, or custom store configs)
  if (config?.enableLoyalty === false) return false;
  if (config?.enableLoyalty === true) return true;

  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ENABLE_LOYALTY !== undefined) {
    if (process.env.NEXT_PUBLIC_ENABLE_LOYALTY === "true") return true;
    if (process.env.NEXT_PUBLIC_ENABLE_LOYALTY === "false") return false;
  }

  // 2. Check expose_json
  if (orgData?.expose_json?.loyalty?.enabled !== undefined) {
    return Boolean(orgData.expose_json.loyalty.enabled);
  }

  // 3. Check organization_marketplaces
  const rawMarketplaces =
    orgData?.organization_marketplaces ??
    orgData?.organization?.organization_marketplaces ??
    orgData?.data?.organization_marketplaces;

  let marketplaces: any[] = [];
  if (Array.isArray(rawMarketplaces)) {
    marketplaces = rawMarketplaces;
  } else if (typeof rawMarketplaces === "string") {
    try {
      marketplaces = JSON.parse(rawMarketplaces);
    } catch {
      marketplaces = [];
    }
  }

  if (Array.isArray(marketplaces) && marketplaces.length > 0) {
    const loyaltyRecord = marketplaces.find((item: any) => {
      if (!item) return false;
      const rawName = String(
        item.marketplace?.name ||
        item.market_place?.name ||
        item.marketplace?.slug ||
        item.market_place?.slug ||
        item.market_place_json?.appName ||
        item.market_place_json?.name ||
        item.market_place_json?.slug ||
        item.name ||
        item.slug ||
        ""
      ).toLowerCase().trim();

      return (
        rawName.includes("loyalty") ||
        rawName.includes("reward") ||
        rawName === "loyalty-rewards"
      );
    });

    if (loyaltyRecord) {
      const isInstalled =
        loyaltyRecord.is_installed === true ||
        loyaltyRecord.is_installed === 1 ||
        loyaltyRecord.installed === true ||
        loyaltyRecord.installed === 1;

      const isEnabled =
        loyaltyRecord.market_place_json?.enabled !== false &&
        loyaltyRecord.enabled !== false &&
        loyaltyRecord.market_place_json?.is_active !== false &&
        loyaltyRecord.is_active !== false;

      return Boolean(isInstalled && isEnabled);
    }
  }

  return false;
}

export interface UseLoyaltyReturn {
  isLoyaltyEnabled: boolean;
  profile: LoyaltyProfileResponse | null;
  customer: LoyaltyCustomer | null;
  rewards: LoyaltyRewardItem[];
  availablePoints: number;
  monetaryValue: number;
  pointsName: string;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  referralCode: string;
  referralLink: string;
  tier: string;
  transactions: LoyaltyTransaction[];
  transactionsTotalCount: number;
  transactionsPage: number;
  transactionsPerPage: number;
  isLoading: boolean;
  isRewardsLoading: boolean;
  isTransactionsLoading: boolean;
  isApplying: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refetchRewards: () => Promise<void>;
  refetchTransactions: (params?: { page?: number; per_page?: number }) => Promise<void>;
  applyPoints: (
    payload: { cart_id?: string | number; points_to_use: number },
  ) => Promise<ApplyLoyaltyPointsResponse>;
  copyReferralCode: () => Promise<boolean>;
  copyReferralLink: () => Promise<boolean>;
  shareWhatsApp: (customText?: string) => void;
}

export const useLoyalty = (options: UseLoyaltyOptions = {}): UseLoyaltyReturn => {
  const { autoFetch = true } = options;
  const { actions, auth, config, cart, setCart, toast, orgData } = useCore();

  const isLoyaltyEnabled = isLoyaltyMarketplaceActive(orgData, config);
  const token = auth?.token ?? auth?.access_token ?? null;
  const signedIn = !!((auth?.isSignedIn ?? false) || token);

  const [profile, setProfile] = useState<LoyaltyProfileResponse | null>(null);
  const [customer, setCustomer] = useState<LoyaltyCustomer | null>(null);
  const [rewards, setRewards] = useState<LoyaltyRewardItem[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [transactionsTotalCount, setTransactionsTotalCount] = useState<number>(0);
  const [transactionsPage, setTransactionsPage] = useState<number>(1);
  const [transactionsPerPage, setTransactionsPerPage] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRewardsLoading, setIsRewardsLoading] = useState<boolean>(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isLoyaltyEnabled) {
      setProfile(null);
      setCustomer(null);
      setIsLoading(false);
      return;
    }

    if (!token && !signedIn) {
      setProfile(null);
      setCustomer(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const getProfileFn =
        actions?.getLoyaltyProfile || getLoyaltyProfileAction;
      const res = await getProfileFn({
        token,
        config,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId,
      });

      if (res?.customer) {
        setProfile(res);
        setCustomer(res.customer);
      } else {
        setProfile(res || null);
        setCustomer(null);
      }
    } catch (err: any) {
      console.warn("Failed to fetch loyalty profile:", err);
      setProfile(null);
      setCustomer(null);
      setError(err?.message || "Failed to fetch loyalty profile");
    } finally {
      setIsLoading(false);
    }
  }, [actions?.getLoyaltyProfile, token, signedIn, config, isLoyaltyEnabled]);

  const fetchRewards = useCallback(async () => {
    if (!isLoyaltyEnabled || (!token && !signedIn)) {
      setRewards([]);
      return;
    }

    setIsRewardsLoading(true);
    try {
      const getRewardsFn =
        actions?.getLoyaltyRewards || getLoyaltyRewardsAction;
      const res = await getRewardsFn({
        token,
        config,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId,
      });

      if (res && Array.isArray(res.rewards)) {
        setRewards(res.rewards);
      } else {
        setRewards([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch loyalty rewards:", err);
    } finally {
      setIsRewardsLoading(false);
    }
  }, [actions?.getLoyaltyRewards, token, signedIn, config, isLoyaltyEnabled]);

  const fetchTransactions = useCallback(
    async (params: { page?: number; per_page?: number } = {}) => {
      const page = params.page ?? transactionsPage;
      const perPage = params.per_page ?? transactionsPerPage;

      if (!isLoyaltyEnabled || (!token && !signedIn)) {
        setTransactions([]);
        setTransactionsTotalCount(0);
        return;
      }

      setIsTransactionsLoading(true);
      try {
        const getTransactionsFn =
          actions?.getLoyaltyTransactions || getLoyaltyTransactionsAction;
        const res = await getTransactionsFn(
          { page, per_page: perPage },
          {
            token,
            config,
            apiBaseUrl: config?.apiBaseUrl,
            orgId: config?.storeId,
          },
        );

        if (res?.transactions && Array.isArray(res.transactions)) {
          setTransactions(res.transactions);
          setTransactionsTotalCount(res.total_count ?? res.transactions.length);
          if (res.page) setTransactionsPage(res.page);
          if (res.per_page) setTransactionsPerPage(res.per_page);
        } else {
          setTransactions([]);
          setTransactionsTotalCount(0);
        }
      } catch (err: any) {
        console.warn("Failed to fetch loyalty transactions:", err);
        setTransactions([]);
        setTransactionsTotalCount(0);
      } finally {
        setIsTransactionsLoading(false);
      }
    },
    [actions?.getLoyaltyTransactions, token, signedIn, config, transactionsPage, transactionsPerPage, isLoyaltyEnabled],
  );

  useEffect(() => {
    if (isLoyaltyEnabled && autoFetch && (token || signedIn)) {
      fetchProfile();
      fetchRewards();
      fetchTransactions({ page: 1, per_page: 20 });
    }
  }, [isLoyaltyEnabled, autoFetch, token, signedIn, fetchProfile, fetchRewards, fetchTransactions]);

  const applyPoints = useCallback(
    async ({
      cart_id,
      points_to_use,
    }: {
      cart_id?: string | number;
      points_to_use: number;
    }): Promise<ApplyLoyaltyPointsResponse> => {
      if (!isLoyaltyEnabled) {
        const errMsg = "Loyalty rewards program is not active for this store";
        toast?.error?.(errMsg);
        return { success: false, serverError: errMsg };
      }

      const targetCartId = cart_id || cart?.id;

      if (!targetCartId) {
        const errMsg = "Cart ID is required to apply loyalty points";
        toast?.error?.(errMsg);
        return { success: false, serverError: errMsg };
      }

      if (!points_to_use || points_to_use <= 0) {
        const errMsg = "Please enter a valid amount of points to redeem";
        toast?.error?.(errMsg);
        return { success: false, serverError: errMsg };
      }

      setIsApplying(true);
      try {
        const applyFn =
          actions?.applyLoyaltyPoints || applyLoyaltyPointsAction;
        const res = await applyFn(
          {
            cart_id: String(targetCartId),
            points_to_use: Number(points_to_use),
          },
          {
            token,
            config,
            apiBaseUrl: config?.apiBaseUrl,
            orgId: config?.storeId,
          },
        );

        if (res?.serverError) {
          toast?.error?.(res.serverError);
          return res;
        }

        // If updated cart returned, sync with CoreProvider
        if (res?.cart && setCart) {
          setCart(res.cart);
        } else if (actions?.getCart && token) {
          try {
            const updated = await actions.getCart(config?.regionId, { token });
            if (setCart && updated) {
              setCart(Array.isArray(updated) ? updated[0] : updated);
            }
          } catch {}
        }

        toast?.success?.(
          `Successfully applied ${points_to_use} points to your cart!`,
        );

        // Optimistically update loyalty balance
        const convRate =
          customer && customer.available_points > 0 && customer.monetary_value_inr > 0
            ? customer.monetary_value_inr / customer.available_points
            : 0.877;

        setCustomer((prev) =>
          prev
            ? {
                ...prev,
                available_points: Math.max(
                  0,
                  prev.available_points - Number(points_to_use),
                ),
                total_redeemed:
                  (prev.total_redeemed || 0) + Number(points_to_use),
                monetary_value_inr: Math.max(
                  0,
                  Math.round(
                    (prev.available_points - Number(points_to_use)) * convRate * 100,
                  ) / 100,
                ),
              }
            : null,
        );

        return {
          success: true,
          cart_id: String(targetCartId),
          points_to_use,
          ...res,
        };
      } catch (err: any) {
        const errMsg = err?.message || "Failed to apply points to cart";
        toast?.error?.(errMsg);
        return {
          success: false,
          serverError: errMsg,
        };
      } finally {
        setIsApplying(false);
      }
    },
    [cart?.id, actions, token, config, setCart, toast, isLoyaltyEnabled],
  );

  const copyReferralCode = useCallback(async (): Promise<boolean> => {
    const code = customer?.referral_code;
    if (!code) return false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        toast?.success?.(`Referral code ${code} copied to clipboard!`);
        return true;
      }
      return false;
    } catch {
      toast?.error?.("Failed to copy referral code");
      return false;
    }
  }, [customer?.referral_code, toast]);

  const copyReferralLink = useCallback(async (): Promise<boolean> => {
    const link = customer?.referral_link;
    if (!link) return false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(link);
        toast?.success?.("Referral link copied to clipboard!");
        return true;
      }
      return false;
    } catch {
      toast?.error?.("Failed to copy referral link");
      return false;
    }
  }, [customer?.referral_link, toast]);

  const shareWhatsApp = useCallback(
    (customText?: string) => {
      const link = customer?.referral_link;
      const code = customer?.referral_code;
      const text =
        customText ||
        `Hey! Sign up using my referral link to get exciting discounts on fine fabrics at SBS Textiles: ${link || ""} (Code: ${code || ""})`;
      if (typeof window !== "undefined") {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text)}`,
          "_blank",
          "noopener,noreferrer",
        );
      }
    },
    [customer?.referral_link, customer?.referral_code],
  );

  // Compute tier based on points or customer property
  const availablePoints = customer?.available_points ?? 0;
  const monetaryValue = customer?.monetary_value_inr ?? 0;
  const pointsName = customer?.points_name ?? "Points";
  const totalEarned = customer?.total_earned ?? availablePoints;
  const totalRedeemed = customer?.total_redeemed ?? 0;
  const totalExpired = customer?.total_expired ?? 0;
  const referralCode = customer?.referral_code ?? "";
  const referralLink = customer?.referral_link ?? "";

  const tier =
    customer?.tier ||
    (totalEarned >= 5000
      ? "PLATINUM MEMBER"
      : totalEarned >= 2000
        ? "GOLD MEMBER"
        : "SILVER MEMBER");

  return {
    isLoyaltyEnabled,
    profile,
    customer,
    rewards,
    availablePoints,
    monetaryValue,
    pointsName,
    totalEarned,
    totalRedeemed,
    totalExpired,
    referralCode,
    referralLink,
    tier,
    transactions,
    transactionsTotalCount,
    transactionsPage,
    transactionsPerPage,
    isLoading,
    isRewardsLoading,
    isTransactionsLoading,
    isApplying,
    error,
    refetch: fetchProfile,
    refetchRewards: fetchRewards,
    refetchTransactions: fetchTransactions,
    applyPoints,
    copyReferralCode,
    copyReferralLink,
    shareWhatsApp,
  };
};

export default useLoyalty;
