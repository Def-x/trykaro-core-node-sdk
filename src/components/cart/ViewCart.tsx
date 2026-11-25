"use client";

import React, { useEffect, useRef, useState } from "react";
// @ts-ignore
import ProductlistCard from "./ProductlistCard";
import Checkout from "./Checkout";
// import { EmptyScreen, ScreenLoading } from "@/components/custom";
// import { useCart } from "@/context/CartContext";
// import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
// import { ShoppingBagIcon, Textile } from "@/svgIcons";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useCart } from "../../hooks/useCart";
import { useCore } from "../../context/CoreProvider";
import CouponSection from "./CouponSection";
import FastCheckoutDrawer from "./FastCheckoutDrawer";

export interface ViewCartProps {
  enableFastCheckout?: boolean;
}

export const ViewCart: React.FC<ViewCartProps> = ({ enableFastCheckout = false }) => {
  const [discountOpen, setDiscountOpen] = useState(false);
  const [isPaymentRedirecting, setIsPaymentRedirecting] = useState(false);
  const [fastCheckoutOpen, setFastCheckoutOpen] = useState(false);
  const { cart, cartItems } = useAddToCart();
  const { isCartLoading } = useCart();
  const { formatCurrency } = useCurrencyFormat();
  const { actions, auth, config, toast } = useCore();

  const token = auth?.token ?? auth?.access_token ?? null;

  const {
    line_items: cartItem = cartItems,
    display_total,
    display_item_total,
    display_ship_total,
    display_tax_total,
    display_adjustment_total,
    adjustment_total,
    display_promo_total,
    promo_total,
    order_type,
  } = (cart || {}) as any;

  // Treat cartItems from context as single source of truth
  const items: any[] = cartItems ?? [];
  const isLoading = isCartLoading;

  const deletedItems = items.filter(
    (item) => !item?.line_itemable || item?.line_itemable_deleted,
  );
  const hasDeletedItems = deletedItems.length > 0;

  const appliedDiscounts = ((cart as any)?.cart_discounts || []).filter(
    (coupon: any) =>
      coupon.code ||
      coupon.display_action_value ||
      coupon.id ||
      coupon.discount_id,
  );
  const activeDiscountId = appliedDiscounts?.[0]?.id || cart?.discount_id;

  // Abandonment tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeDiscountId && actions?.trackDiscountEvent) {
        actions.trackDiscountEvent({
          token,
          discount_id: activeDiscountId,
          event_type: "abandoned",
          source: "web",
          region_id: config?.regionId,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [activeDiscountId, actions, token, config?.regionId]);

  // Watch for discount being silently removed
  const prevDiscountIdRef = useRef<any>(undefined);
  useEffect(() => {
    const prev = prevDiscountIdRef.current;
    if (prev !== undefined && prev && !activeDiscountId && items?.length > 0) {
      if (toast?.info) {
        toast.info("Coupon removed — conditions no longer met");
      } else {
      }
    }
    prevDiscountIdRef.current = activeDiscountId;
  }, [activeDiscountId, items?.length, toast]);

  return (
    <div className="mx-4 md:mx-[24px] my-[100px] flex justify-center">
      {isLoading || isPaymentRedirecting ? (
        <div className="flex flex-col justify-center items-center w-full h-[400px] gap-4">
          <div
            className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
            style={{ borderColor: "var(--core-primary)" }}
          ></div>
          {isPaymentRedirecting && (
            <p className="font-[var(--font-medium)] text-gray-600 text-sm animate-pulse">
              Redirecting to your order...
            </p>
          )}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50/50 border border-gray-100 rounded-2xl min-h-[400px] gap-y-6 max-w-[600px] w-full mx-auto">
          <div className="p-4 bg-white rounded-full shadow-sm border border-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--core-primary)" }}
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="font-[var(--font-bold)] text-[22px] text-gray-800">
              Your cart is empty
            </p>
            <p className="font-[var(--font-regular)] text-[15px] text-gray-500 max-w-[400px]">
              Looks like you haven't added anything to your cart yet. Explore
              our collections and find something you love!
            </p>
          </div>
          <a
            href="/"
            className="mt-4 px-8 py-3 rounded-full text-white font-[var(--font-medium)] transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--core-primary)" }}
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="flex flex-row flex-wrap gap-[16px] max-w-[1248px] w-full">
          {/* ── Left: Checkout form ── */}
          <div className="flex-1 mt-8 md:mt-0">
            <Checkout
              hasDeletedItems={hasDeletedItems}
              onPaymentSuccess={() => setIsPaymentRedirecting(true)}
            />
          </div>

          {/* ── Divider ── */}
          <div className="border border-[var(--borders)] sticky hidden md:block" />

          {/* ── Right: Order items + Bill summary ── */}
          <div className="flex-1 md:sticky top-4 self-start mt-[18px] md:mt-0 order-first md:order-last">
            {hasDeletedItems && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-sm text-yellow-800 font-[var(--font-medium)]">
                  ⚠️ Some items in your cart are no longer available. Please
                  remove them before checkout.
                </p>
              </div>
            )}

            {/* Order items */}
            <div>
              <div className="font-[var(--font-medium)] text-[20px] text-[var(--main)]">
                ORDER ITEMS ({items.length})
              </div>

              <div className="max-h-[540px] overflow-y-auto overflow-x-hidden mt-3 pr-1 [scrollbar-gutter:stable]">
                <div className="flex flex-col gap-y-[16px]">
                  {items.map((item) => (
                    <ProductlistCard
                      product={item}
                      key={item?.id}
                      orderType={order_type}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <CouponSection />
              </div>

              {/* Bill Summary */}
              <div className="mt-8">
                <p className="font-[var(--font-medium)] text-[20px] text-[var(--main)]">
                  Bill summary
                </p>

                <div className="mt-[24px] space-y-[8px]">
                  <div className="flex justify-between">
                    <p className="font-[var(--font-regular)] text-[14px] text-[var(--main)]">
                      Item total
                    </p>
                    <p className="font-[var(--font-regular)] text-[14px] text-[var(--main)]">
                      {display_item_total
                        ? formatCurrency(display_item_total)
                        : "—"}
                    </p>
                  </div>

                  {/* ── Discount dropdown row ── */}
                  {(appliedDiscounts?.length > 0 ||
                    ((cart as any)?.promo_total ?? 0) > 0 ||
                    parseFloat((cart as any)?.display_promo_total || "0") > 0) &&
                    (() => {
                      // Compute total discount to show in the label
                      const totalDiscount =
                        appliedDiscounts?.length > 0
                          ? appliedDiscounts.reduce((sum: number, c: any) => {
                            const amt =
                              c.display_discount_amount ??
                              (c.discount_amount != null
                                ? c.discount_amount / 100
                                : 0);
                            return sum + parseFloat(amt || "0");
                          }, 0)
                          : parseFloat((cart as any)?.display_promo_total || "0");

                      return (
                        <div>
                          {/* Top-level clickable row */}
                          <button
                            type="button"
                            onClick={() => setDiscountOpen((o) => !o)}
                            style={{
                              display: "flex",
                              width: "100%",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor:
                                appliedDiscounts?.length > 1
                                  ? "pointer"
                                  : "default",
                            }}
                          >
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontFamily: "var(--font-regular)",
                                fontSize: "14px",
                                color: "#FF6500",
                              }}
                            >
                              {appliedDiscounts?.length === 1
                                ? `Discount (${appliedDiscounts[0].code ? appliedDiscounts[0].code : appliedDiscounts[0].display_action_value || "Coupon"})`
                                : "Discount"}
                              {appliedDiscounts?.length > 1 && (
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#FF6500"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{
                                    transition: "transform 0.25s",
                                    transform: discountOpen
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                  }}
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              )}
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--font-regular)",
                                fontSize: "14px",
                                color: "#FF6500",
                              }}
                            >
                              -{formatCurrency(totalDiscount)}
                            </span>
                          </button>

                          {/* Expandable breakdown (only when multiple discounts) */}
                          {appliedDiscounts?.length > 1 && discountOpen && (
                            <div
                              style={{
                                marginTop: "6px",
                                paddingLeft: "8px",
                                borderLeft: "2px solid #FF650033",
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              {appliedDiscounts.map((coupon: any) => {
                                const amt =
                                  coupon.display_discount_amount ??
                                  (coupon.discount_amount != null
                                    ? coupon.discount_amount / 100
                                    : 0);
                                return (
                                  <div
                                    key={coupon.code || coupon.id}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontFamily: "var(--font-regular)",
                                        fontSize: "13px",
                                        color: "#FF6500",
                                        opacity: 0.85,
                                      }}
                                    >
                                      {coupon.code
                                        ? `${coupon.code}`
                                        : coupon.display_action_value ||
                                        "Coupon"}
                                    </span>
                                    <span
                                      style={{
                                        fontFamily: "var(--font-regular)",
                                        fontSize: "13px",
                                        color: "#FF6500",
                                        opacity: 0.85,
                                      }}
                                    >
                                      -{formatCurrency(amt)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                  {/* Adjustment row */}
                  {(() => {
                    const rawAdjustmentTotal = parseFloat(
                      String(display_adjustment_total || "").replace(/[^0-9.]/g, "") ||
                      String(adjustment_total != null ? Number(adjustment_total) / 100 : 0),
                    ) || 0;
                    const rawPromoTotal = parseFloat(
                      String(display_promo_total || "").replace(/[^0-9.]/g, "") ||
                      String((promo_total ?? 0) > 10000 ? (promo_total ?? 0) / 100 : (promo_total ?? 0)),
                    ) || 0;

                    const adjustmentsList = Array.isArray((cart as any)?.adjustments)
                      ? (cart as any).adjustments.filter((a: any) => {
                        const amt = parseFloat(
                          String(a?.display_amount ?? "").replace(/[^0-9.]/g, "") ||
                          String(a?.amount != null ? Number(a.amount) / 100 : 0),
                        );
                        return amt !== 0;
                      })
                      : [];

                    if (adjustmentsList.length > 0) {
                      return adjustmentsList.map((adj: any, idx: number) => {
                        const amt = parseFloat(
                          String(adj.display_amount || "").replace(/[^0-9.]/g, "") ||
                          String(adj.amount != null ? Number(adj.amount) / 100 : 0),
                        ) || 0;
                        return (
                          <div key={adj.id || idx} className="flex justify-between">
                            <p className="font-[var(--font-regular)] text-[14px] text-[#00b300]">
                              {adj.label || adj.name || "Adjustment"}
                            </p>
                            <p className="font-[var(--font-medium)] text-[14px] text-[#00b300]">
                              − {formatCurrency(amt)}
                            </p>
                          </div>
                        );
                      });
                    }

                    const nonPromoAdjustment = rawPromoTotal > 0
                      ? (rawAdjustmentTotal > rawPromoTotal ? rawAdjustmentTotal - rawPromoTotal : 0)
                      : (appliedDiscounts?.length > 0 ? 0 : rawAdjustmentTotal);

                    if (nonPromoAdjustment > 0) {
                      return (
                        <div className="flex justify-between">
                          <p className="font-[var(--font-regular)] text-[14px] text-[#00b300]">
                            {rawPromoTotal > 0 ? "Points / Adjustment" : "Adjustment"}
                          </p>
                          <p className="font-[var(--font-medium)] text-[14px] text-[#00b300]">
                            − {formatCurrency(nonPromoAdjustment)}
                          </p>
                        </div>
                      );
                    }

                    return null;
                  })()}

                  <div className="flex justify-between">
                    <p className="font-[var(--font-regular)] text-[14px] text-[var(--main)]">
                      Tax
                    </p>
                    <p className="font-[var(--font-regular)] text-[14px] text-[var(--main)]">
                      {display_tax_total
                        ? formatCurrency(display_tax_total)
                        : "—"}
                    </p>
                  </div>

                  {order_type !== "pickup" && (
                    <div className="flex justify-between">
                      <p className="font-[var(--font-regular)] text-[14px] text-[var(--main)]">
                        Shipping
                      </p>
                      <p className="font-[var(--font-regular)] text-[14px] text-[var(--main)]">
                        {display_ship_total === "0.00" ||
                          display_ship_total === 0
                          ? "Free"
                          : display_ship_total
                            ? formatCurrency(display_ship_total)
                            : "—"}
                      </p>
                    </div>
                  )}

                  <div className="pt-[16px] border-t border-[var(--borders)]">
                    <div className="flex justify-between">
                      <p className="font-[var(--font-medium)] text-[16px] text-[var(--main)]">
                        Total payment
                      </p>
                      <p className="font-[var(--font-bold)] text-[16px] text-[var(--main)]">
                        {display_total ? formatCurrency(display_total) : "—"}
                      </p>
                    </div>
                    {/* Savings callout banner - Adjustment value is total save */}
                    {(() => {
                      const rawAdjustmentTotal = parseFloat(
                        String(display_adjustment_total || "").replace(/[^0-9.]/g, "") ||
                        String(adjustment_total != null ? Number(adjustment_total) / 100 : 0),
                      ) || 0;
                      const rawPromoTotal = parseFloat(
                        String(display_promo_total || "").replace(/[^0-9.]/g, "") ||
                        String(((cart as any)?.promo_total ?? 0) > 10000 ? ((cart as any)?.promo_total ?? 0) / 100 : ((cart as any)?.promo_total ?? 0)),
                      ) || 0;
                      const totalSavings = rawAdjustmentTotal > 0
                        ? rawAdjustmentTotal
                        : rawPromoTotal;

                      if (totalSavings > 0) {
                        return (
                          <p className="text-[13px] font-[var(--font-bold)] text-[#00b300] mt-[6px] text-right">
                            You save {formatCurrency(totalSavings)} on this order 🎉
                          </p>
                        );
                      }
                      return null;
                    })()}

                    {enableFastCheckout && (
                      <button
                        onClick={() => setFastCheckoutOpen(true)}
                        className="w-full mt-4 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-[var(--font-bold)] text-sm flex items-center justify-between shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                      >
                        <span className="flex items-center gap-1.5">
                          <span>⚡ Quick Checkout</span>
                          <span className="bg-emerald-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                            UPI / 1-Tap
                          </span>
                        </span>
                        <span>{display_total ? formatCurrency(display_total) : "—"} →</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GoKwik-like Fast Checkout Drawer ── */}
      <FastCheckoutDrawer
        isOpen={fastCheckoutOpen}
        onClose={() => setFastCheckoutOpen(false)}
        onPaymentSuccess={() => {
          setFastCheckoutOpen(false);
          setIsPaymentRedirecting(true);
        }}
      />
    </div>
  );
};
