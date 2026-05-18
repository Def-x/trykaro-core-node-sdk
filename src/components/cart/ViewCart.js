"use client";

import React, { useEffect, useRef, useState } from "react";
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

export const ViewCart = () => {
  const [discountOpen, setDiscountOpen] = useState(false);
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
    order_type,
  } = cart || {};

  // Treat cartItems from context as single source of truth
  const items = cartItems ?? [];
  const isLoading = isCartLoading;

  const deletedItems = items.filter(
    (item) => !item?.line_itemable || item?.line_itemable_deleted,
  );
  const hasDeletedItems = deletedItems.length > 0;

  const appliedDiscounts = (cart?.cart_discounts || []).filter(
    (coupon) => coupon.code || coupon.display_action_value || coupon.id || coupon.discount_id
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
  const prevDiscountIdRef = useRef(undefined);
  useEffect(() => {
    const prev = prevDiscountIdRef.current;
    if (prev !== undefined && prev && !activeDiscountId && items?.length > 0) {
      if (toast?.info) {
        toast.info("Coupon removed — conditions no longer met");
      } else {
        console.log("Coupon removed — conditions no longer met");
      }
    }
    prevDiscountIdRef.current = activeDiscountId;
  }, [activeDiscountId, items?.length, toast]);

  console.log({ cart, appliedDiscounts });
  return (
    <div className="mx-4 md:mx-[24px] my-[100px] flex justify-center">
      {isLoading ? (
        <div className="flex justify-center items-center w-full h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: "var(--core-primary)" }}></div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50/50 border border-gray-100 rounded-2xl min-h-[400px] gap-y-6 max-w-[600px] w-full mx-auto">
          <div className="p-4 bg-white rounded-full shadow-sm border border-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--core-primary)" }}>
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="font-[Nunito-bold] text-[22px] text-gray-800">
              Your cart is empty
            </p>
            <p className="font-[Nunito-regular] text-[15px] text-gray-500 max-w-[400px]">
              Looks like you haven't added anything to your cart yet. Explore our collections and find something you love!
            </p>
          </div>
          <a href="/" className="mt-4 px-8 py-3 rounded-full text-white font-[Nunito-medium] transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--core-primary)" }}>
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="flex flex-row flex-wrap gap-[16px] max-w-[1248px] w-full">
          {/* ── Left: Checkout form ── */}
          <div className="flex-1 mt-8 md:mt-0">
            <Checkout hasDeletedItems={hasDeletedItems} />
          </div>

          {/* ── Divider ── */}
          <div className="border border-[var(--borders)] sticky hidden md:block" />

          {/* ── Right: Order items + Bill summary ── */}
          <div className="flex-1 md:sticky top-4 self-start mt-[18px] md:mt-0 order-first md:order-last">
            {hasDeletedItems && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-sm text-yellow-800 font-[Nunito-medium]">
                  ⚠️ Some items in your cart are no longer available. Please
                  remove them before checkout.
                </p>
              </div>
            )}

            {/* Order items */}
            <div>
              <div className="font-[Nunito-medium] text-[20px] text-[var(--main)]">
                ORDER ITEMS ({items.length})
              </div>

              <div className="max-h-[500px] overflow-auto mt-3">
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
                <p className="font-[Nunito-medium] text-[20px] text-[var(--main)]">
                  Bill summary
                </p>

                <div className="mt-[24px] space-y-[8px]">
                  <div className="flex justify-between">
                    <p className="font-[Nunito-regular] text-[14px] text-[var(--main)]">
                      Item total
                    </p>
                    <p className="font-[Nunito-regular] text-[14px] text-[var(--main)]">
                      {display_item_total
                        ? formatCurrency(display_item_total)
                        : "—"}
                    </p>
                  </div>

                  {/* ── Discount dropdown row ── */}
                  {(appliedDiscounts?.length > 0 ||
                    cart?.promo_total > 0 ||
                    parseFloat(cart?.display_promo_total) > 0) && (() => {
                      // Compute total discount to show in the label
                      const totalDiscount =
                        appliedDiscounts?.length > 0
                          ? appliedDiscounts.reduce((sum, c) => {
                            const amt =
                              c.display_discount_amount ??
                              (c.discount_amount != null
                                ? c.discount_amount / 100
                                : 0);
                            return sum + parseFloat(amt || 0);
                          }, 0)
                          : parseFloat(cart?.display_promo_total || 0);

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
                              cursor: appliedDiscounts?.length > 1 ? "pointer" : "default",
                            }}
                          >
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontFamily: "Nunito-regular",
                                fontSize: "14px",
                                color: "#FF6500",
                              }}
                            >
                              {appliedDiscounts?.length === 1
                                ? `Discount (${appliedDiscounts[0].code ? appliedDiscounts[0].code : (appliedDiscounts[0].display_action_value || "Coupon")})`
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
                                fontFamily: "Nunito-regular",
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
                              {appliedDiscounts.map((coupon) => {
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
                                        fontFamily: "Nunito-regular",
                                        fontSize: "13px",
                                        color: "#FF6500",
                                        opacity: 0.85,
                                      }}
                                    >
                                      {coupon.code ? `${coupon.code}` : (coupon.display_action_value || "Coupon")}
                                    </span>
                                    <span
                                      style={{
                                        fontFamily: "Nunito-regular",
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

                  <div className="flex justify-between">
                    <p className="font-[Nunito-regular] text-[14px] text-[var(--main)]">
                      Tax
                    </p>
                    <p className="font-[Nunito-regular] text-[14px] text-[var(--main)]">
                      {display_tax_total
                        ? formatCurrency(display_tax_total)
                        : "—"}
                    </p>
                  </div>

                  {order_type !== "pickup" && (
                    <div className="flex justify-between">
                      <p className="font-[Nunito-regular] text-[14px] text-[var(--main)]">
                        Shipping
                      </p>
                      <p className="font-[Nunito-regular] text-[14px] text-[var(--main)]">
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
                      <p className="font-[Nunito-medium] text-[16px] text-[var(--main)]">
                        Total payment
                      </p>
                      <p className="font-[Nunito-bold] text-[16px] text-[var(--main)]">
                        {display_total ? formatCurrency(display_total) : "—"}
                      </p>
                    </div>
                    {(cart?.promo_total > 0 ||
                      parseFloat(cart?.display_promo_total) > 0) && (
                        <p className="text-[13px] font-[Nunito-bold] text-[#00b300] mt-[6px] text-right">
                          You save {formatCurrency(cart?.display_promo_total)} on
                          this order 🎉
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
