"use client";

import React, { useState, useMemo } from "react";
import { useCore } from "../../context/CoreProvider";
import { useLoyalty } from "../../hooks/useLoyalty";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import { useStorefrontRouter } from "../../utils/navigation";
import { StorefrontLink as Link } from "../common/StorefrontLink";
import { Popup } from "../ui/Popup";
import {
  AccountAwardIcon,
  AccountGiftIcon,
  AccountCopyIcon,
  AccountCheckIcon,
  AccountShoppingBagIcon,
} from "./AccountIcons";

export interface AccountRewardsPageProps {
  router?: any;
  showBreadcrumb?: boolean;
  className?: string;
}

type TabKey = "dashboard" | "history" | "redeem";

interface ActivityRow {
  id: string | number;
  title: string;
  subtitle: string;
  date: string;
  delta: number;
  status: "Available" | "Redeemed" | "Expired" | "Pending";
  expiry?: string;
  type: "earned" | "redeemed" | "expired";
}

export const AccountRewardsPage: React.FC<AccountRewardsPageProps> = ({
  router: overrideRouter,
  showBreadcrumb = true,
  className = "",
}) => {
  const router = useStorefrontRouter(overrideRouter);
  const { cart, auth, toast } = useCore();
  const { formatCurrency } = useCurrencyFormat();

  const {
    isLoyaltyEnabled,
    customer,
    availablePoints,
    monetaryValue,
    pointsName,
    totalEarned,
    totalRedeemed,
    referralCode,
    referralLink,
    tier,
    transactions,
    transactionsTotalCount,
    transactionsPage,
    transactionsPerPage,
    isTransactionsLoading,
    refetchTransactions,
    isLoading,
    isApplying,
    applyPoints,
    copyReferralCode,
    copyReferralLink,
    shareWhatsApp,
  } = useLoyalty();

  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [pointsToRedeemInput, setPointsToRedeemInput] = useState<number>(100);
  const [historyFilter, setHistoryFilter] = useState<"all" | "earned" | "redeemed" | "expired">("all");
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Conversion rate (e.g. 100 pts = ₹10.00 or based on monetaryValue / availablePoints)
  const conversionRate = useMemo(() => {
    if (availablePoints > 0 && monetaryValue > 0) {
      return monetaryValue / availablePoints;
    }
    return 0.1; // fallback: 100 pts = ₹10
  }, [availablePoints, monetaryValue]);

  const displayPoints = availablePoints ?? 0;
  const displayMonetaryValue = monetaryValue ?? 0;
  const displayPointsName = pointsName || "Points";
  const displayTotalEarned = totalEarned ?? availablePoints ?? 0;
  const displayTotalRedeemed = totalRedeemed ?? 0;
  const displayReferralCode = referralCode || "";
  const displayReferralLink = referralLink || "";

  const handleCopyCode = async () => {
    const success = await copyReferralCode();
    if (success) {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyReferralLink();
    if (success) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleApplyCheckoutPoints = async () => {
    if (!cart?.id) {
      toast?.error?.("Please add items to your cart first.");
      return;
    }
    await applyPoints({ cart_id: cart.id, points_to_use: pointsToRedeemInput });
  };

  const formatTransactionDate = (dateStr?: string) => {
    if (!dateStr) return "Today";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const activityRows: ActivityRow[] = useMemo(() => {
    if (transactions && transactions.length > 0) {
      return transactions.map((t) => {
        const isEarned = t.transaction_type === "earned";
        const isExpired = t.transaction_type === "expired";
        const isRedeemed = t.transaction_type === "redeemed";
        const delta = isEarned ? t.points : -t.points;
        const type: "earned" | "redeemed" | "expired" = isExpired
          ? "expired"
          : isRedeemed
            ? "redeemed"
            : "earned";

        const title =
          t.metadata?.rule_name ||
          (t.source_type === "purchase" ? "Purchase Reward" : "Loyalty Reward");

        const subtitle = t.source_id
          ? `Order #${t.source_id.slice(0, 8)} • ${t.metadata?.action_type || t.source_type}`
          : (t.metadata?.action_type || "Standard Loyalty Transaction");

        const status: "Available" | "Redeemed" | "Expired" | "Pending" =
          t.status === "completed"
            ? "Available"
            : t.status === "pending"
              ? "Pending"
              : "Available";

        return {
          id: t.id,
          title,
          subtitle,
          date: formatTransactionDate(t.created_at),
          delta,
          status,
          expiry: isEarned ? "Available" : undefined,
          type,
        };
      });
    }
    return [];
  }, [transactions]);

  const filteredActivity = useMemo(() => {
    if (historyFilter === "all") return activityRows;
    return activityRows.filter((item) => item.type === historyFilter);
  }, [activityRows, historyFilter]);

  if (!isLoyaltyEnabled) {
    return (
      <div className={`w-full font-sans text-[#222222] ${className}`}>
        {showBreadcrumb && (
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-gray-500 font-medium">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li>
                <Link href="/" className="hover:text-gray-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/account" className="hover:text-gray-900 transition-colors">
                  My Account
                </Link>
              </li>
              <li>/</li>
              <li className="font-semibold text-gray-900">Loyalty &amp; Rewards</li>
            </ol>
          </nav>
        )}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <AccountAwardIcon className="h-8 w-8" />
          </div>
          <h2 className="text-[20px] font-bold text-[#1C1C1C]">
            Loyalty &amp; Rewards Program
          </h2>
          <p className="mt-2 max-w-md text-[14px] text-gray-500">
            The loyalty and rewards program is not currently active for this store. Please check back later or continue shopping.
          </p>
          <button
            onClick={() => router.push("/account")}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#1C1C1C] px-6 py-2.5 text-[14px] font-semibold text-white transition hover:bg-black cursor-pointer"
          >
            Back to My Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full font-sans text-[#222222] ${className}`}>
      {/* ── Top Header / Breadcrumb & Nav Tabs ── */}
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 mb-6 md:flex-row md:items-center md:justify-between">
        {showBreadcrumb && (
          <nav aria-label="Breadcrumb" className="text-xs text-gray-500 font-medium">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li>
                <Link href="/" className="hover:text-gray-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/account" className="hover:text-gray-900 transition-colors">
                  My Account
                </Link>
              </li>
              <li>/</li>
              <li className="font-semibold text-gray-900">Loyalty &amp; Rewards</li>
            </ol>
          </nav>
        )}

        {/* Tab pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {(
            [
              { key: "dashboard", label: "Dashboard" },
              { key: "history", label: "Points Activity & History" },
              { key: "redeem", label: "Redeem at Checkout" },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#E65100] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Tab Content ── */}
      {activeTab === "dashboard" && (
        <div className="flex flex-col gap-6">
          {/* ── Hero Balance Card ── */}
          <div className="relative rounded-2xl border border-orange-200/80 bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    SBS Rewards Balance
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-emerald-700 border border-emerald-200">
                    <AccountAwardIcon className="h-3 w-3" />
                    TIER: {tier}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2.5">
                  <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                    {displayPoints.toLocaleString()}
                  </span>
                  <span className="text-xl md:text-2xl font-bold uppercase tracking-wide text-[#E65100]">
                    {displayPointsName}
                  </span>
                </div>

                <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                  <span className="text-[#E65100]">✪</span>
                  <span>
                    Worth{" "}
                    <strong className="text-gray-900">
                      {formatCurrency(displayMonetaryValue)}
                    </strong>{" "}
                    off eligible orders (100 pts = {formatCurrency(100 * conversionRate)})
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("redeem")}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E65100] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#cf4800] transition-colors cursor-pointer"
                >
                  <AccountShoppingBagIcon className="h-4 w-4" />
                  Shop &amp; Redeem Points
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  View Full History
                </button>

                <button
                  type="button"
                  onClick={() => setIsReferralModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50/50 px-4 py-2.5 text-xs font-semibold text-[#E65100] hover:bg-orange-100/50 transition-colors cursor-pointer"
                >
                  <AccountGiftIcon className="h-4 w-4" />
                  Refer a Friend
                </button>
              </div>
            </div>
          </div>

          {/* ── Key Metrics 4-Card Grid ── */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-medium text-gray-500">Available to Redeem</span>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">
                {displayPoints.toLocaleString()}{" "}
                <span className="text-xs font-normal text-gray-500">pts</span>
              </p>
              <p className="mt-1 text-xs font-semibold text-emerald-600">
                {formatCurrency(displayMonetaryValue)} cash value
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-medium text-gray-500">Total Earned to Date</span>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">
                {displayTotalEarned.toLocaleString()}{" "}
                <span className="text-xs font-normal text-gray-500">pts</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">Lifetime earned</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-medium text-gray-500">Total Redeemed</span>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">
                {displayTotalRedeemed.toLocaleString()}{" "}
                <span className="text-xs font-normal text-gray-500">pts</span>
              </p>
              <p className="mt-1 text-xs font-semibold text-emerald-600">
                {formatCurrency(displayTotalRedeemed * conversionRate)} saved
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-medium text-gray-500">Pending Qualification</span>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">
                {customer?.pending_points ?? 0}{" "}
                <span className="text-xs font-normal text-gray-500">pts</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {customer?.pending_points ? "Pending qualification" : "No points in transit"}
              </p>
            </div>
          </div>

          {/* ── Recent Loyalty Activity Table ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Recent Loyalty Activity</h3>
                <p className="text-xs text-gray-500">Last 5 ledger transactions and their validity</p>
              </div>
              <span className="text-[11px] font-medium text-gray-500">
                Ledger Currency: SBS Points
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Activity / Reference</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Points Delta</th>
                    <th className="py-2.5 px-3 text-right">Status / Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activityRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-gray-500">
                        No loyalty transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    activityRows.slice(0, 5).map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                row.delta > 0
                                  ? "bg-emerald-50 text-emerald-600"
                                  : row.type === "expired"
                                    ? "bg-gray-100 text-gray-500"
                                    : "bg-red-50 text-red-600"
                              }`}
                            >
                              {row.delta > 0 ? "+" : row.type === "expired" ? "⟳" : "−"}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">{row.title}</p>
                              <p className="text-[11px] text-gray-500">{row.subtitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{row.date}</td>
                        <td
                          className={`py-3 px-3 text-right font-bold whitespace-nowrap ${
                            row.delta > 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {row.delta > 0 ? `+${row.delta}` : row.delta} Pts
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
                              row.status === "Available"
                                ? "bg-emerald-50 text-emerald-700"
                                : row.status === "Redeemed"
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-red-50 text-red-700"
                            }`}
                          >
                            {row.status} {row.expiry ? `(${row.expiry})` : ""}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3 text-center">
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className="text-xs font-semibold text-[#E65100] hover:underline cursor-pointer"
              >
                View All {transactionsTotalCount > 0 ? `${transactionsTotalCount} ` : ""}Transactions &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Points Activity & History ── */}

      {/* ── Tab 3: Points Activity & History ── */}
      {activeTab === "history" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Points Activity Ledger</h3>
                <p className="text-xs text-gray-500">Complete transaction history and validity status</p>
              </div>

              <div className="flex items-center gap-2">
                {(["all", "earned", "redeemed", "expired"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setHistoryFilter(filter)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                      historyFilter === filter
                        ? "bg-[#E65100] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Activity / Reference</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Points Delta</th>
                    <th className="py-2.5 px-3 text-right">Status / Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredActivity.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-gray-500">
                        No transactions found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredActivity.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                row.delta > 0
                                  ? "bg-emerald-50 text-emerald-600"
                                  : row.type === "expired"
                                    ? "bg-gray-100 text-gray-500"
                                    : "bg-red-50 text-red-600"
                              }`}
                            >
                              {row.delta > 0 ? "+" : row.type === "expired" ? "⟳" : "−"}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">{row.title}</p>
                              <p className="text-[11px] text-gray-500">{row.subtitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{row.date}</td>
                        <td
                          className={`py-3 px-3 text-right font-bold whitespace-nowrap ${
                            row.delta > 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {row.delta > 0 ? `+${row.delta}` : row.delta} Pts
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
                              row.status === "Available"
                                ? "bg-emerald-50 text-emerald-700"
                                : row.status === "Redeemed"
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-red-50 text-red-700"
                            }`}
                          >
                            {row.status} {row.expiry ? `(${row.expiry})` : ""}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {transactionsTotalCount > transactionsPerPage && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                <span>
                  Showing {Math.min(filteredActivity.length, transactionsPerPage)} of{" "}
                  {transactionsTotalCount} transactions
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      refetchTransactions({
                        page: Math.max(1, transactionsPage - 1),
                        per_page: transactionsPerPage,
                      })
                    }
                    disabled={transactionsPage <= 1 || isTransactionsLoading}
                    className="rounded border border-gray-300 px-2.5 py-1 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="font-semibold text-gray-700">
                    Page {transactionsPage} of{" "}
                    {Math.ceil(transactionsTotalCount / transactionsPerPage) || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      refetchTransactions({
                        page: transactionsPage + 1,
                        per_page: transactionsPerPage,
                      })
                    }
                    disabled={
                      transactionsPage >=
                        Math.ceil(transactionsTotalCount / transactionsPerPage) ||
                      isTransactionsLoading
                    }
                    className="rounded border border-gray-300 px-2.5 py-1 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 3: Redeem at Checkout ── */}
      {activeTab === "redeem" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="rounded-lg bg-orange-100 p-2 text-[#E65100]">
                <AccountShoppingBagIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Redeem Points on Active Cart</h3>
                <p className="text-xs text-gray-500">
                  Available: <strong>{displayPoints.toLocaleString()} Points</strong> (Worth{" "}
                  <strong>{formatCurrency(displayMonetaryValue)}</strong>)
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {cart?.id ? (
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-200 text-xs">
                  <div className="flex justify-between text-gray-700 mb-1">
                    <span>Active Cart:</span>
                    <span className="font-mono text-gray-900">{cart.id}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Items in Cart:</span>
                    <span className="font-semibold text-gray-900">
                      {cart.item_count ?? cart.line_items?.length ?? 1} item(s)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-amber-50 p-4 border border-amber-200 text-xs text-amber-800">
                  <p className="font-semibold">No active cart found</p>
                  <p className="mt-1">
                    Add fabrics to your cart to apply points directly during checkout. You can also test the points application simulator below.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700">
                  Points to Use (Minimum: 100 pts)
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    value={pointsToRedeemInput}
                    onChange={(e) => setPointsToRedeemInput(Number(e.target.value))}
                    max={displayPoints}
                    min={100}
                    step={50}
                    className="flex-1 rounded-lg border border-gray-300 p-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-[#E65100]"
                  />
                  <button
                    type="button"
                    onClick={() => setPointsToRedeemInput(displayPoints)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Use Max
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[100, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPointsToRedeemInput(preset)}
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-[#E65100] transition-colors cursor-pointer"
                  >
                    {preset} Pts ({formatCurrency(preset * conversionRate)})
                  </button>
                ))}
              </div>

              {/* Discount Preview */}
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800">
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>Estimated Savings:</span>
                  <span className="text-emerald-700">
                    -{formatCurrency(pointsToRedeemInput * conversionRate)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-600">
                  Remaining balance after redemption:{" "}
                  <strong>
                    {Math.max(0, displayPoints - pointsToRedeemInput).toLocaleString()} Points
                  </strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleApplyCheckoutPoints}
                disabled={isApplying || pointsToRedeemInput <= 0}
                className="w-full rounded-lg bg-[#E65100] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#cf4800] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isApplying ? "Applying Points..." : `Apply ${pointsToRedeemInput} Points to Cart`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Loyalty Program Footer ── */}
      <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-6 pb-2 text-[11px] text-gray-500 sm:flex-row">
        <p>SBS Textiles &bull; Pure Linens, Cottons &amp; Fine Suiting Since 1994</p>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            Terms of Loyalty Program
          </Link>
          <Link href="/policy" className="hover:text-gray-900 transition-colors">
            Points Expiry Policy
          </Link>
          <Link href="/contact" className="hover:text-gray-900 transition-colors">
            Customer Support
          </Link>
        </div>
      </div>

      {/* ── Referral Modal ── */}
      {isReferralModalOpen && (
        <Popup
          isOpen={isReferralModalOpen}
          onClose={() => setIsReferralModalOpen(false)}
          title="Refer Friends & Earn 500 SBS Points"
        >
          <div className="space-y-4 py-2">
            <p className="text-xs text-gray-600 leading-relaxed">
              Give your friends <strong>₹200 off</strong> on their first fabric purchase of ₹1,000+. When they complete their order, you automatically get <strong>500 SBS Points</strong> added to your account!
            </p>

            {/* Referral Code Box */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Your Referral Code
              </label>
              <div className="mt-1 flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-2.5">
                <span className="font-mono text-sm font-bold tracking-wider text-gray-900">
                  {displayReferralCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 rounded bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {codeCopied ? (
                    <>
                      <AccountCheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <AccountCopyIcon className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Referral Link Box */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Your Referral Link
              </label>
              <div className="mt-1 flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-2.5">
                <span className="truncate pr-2 font-mono text-xs text-gray-700">
                  {displayReferralLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {linkCopied ? (
                    <>
                      <AccountCheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <AccountCopyIcon className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={() => shareWhatsApp()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#20ba59] transition-colors cursor-pointer"
            >
              Share on WhatsApp
            </button>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default AccountRewardsPage;
