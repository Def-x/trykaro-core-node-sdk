"use client";

import React, { useEffect, useRef } from "react";
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

  // Abandonment tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (cart?.discount_id && actions?.trackDiscountEvent) {
        actions.trackDiscountEvent({
          token,
          discount_id: cart.discount_id,
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
  }, [cart?.discount_id, actions, token, config?.regionId]);

  // Watch for discount being silently removed
  const prevDiscountIdRef = useRef(undefined);
  useEffect(() => {
    const prev = prevDiscountIdRef.current;
    if (prev !== undefined && prev && !cart?.discount_id && items?.length > 0) {
      if (toast?.info) {
        toast.info("Coupon removed — conditions no longer met");
      } else {
        console.log("Coupon removed — conditions no longer met");
      }
    }
    prevDiscountIdRef.current = cart?.discount_id;
  }, [cart?.discount_id, items?.length, toast]);

  return (
    <div className="mx-4 md:mx-[24px] my-[100px] flex justify-center">
      {isLoading ? (
        // <ScreenLoading />
        <>Loading</>
      ) : items.length === 0 ? (
        // <EmptyScreen
        //     icon={<ShoppingBagIcon />}
        //     title={"Your Cart Feels a Little Empty"}
        //     description="Add a touch of charm to your space and style. Browse our handcrafted collections and find something you love."
        // />
        <>Your Cart Feels a Little Empty</>
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

                  {cart?.discount_id && (
                    <div className="flex justify-between">
                      <p className="font-[Nunito-regular] text-[14px] text-[#FF6500]">
                        Discount
                        {cart?.cart_detail_json?.discount?.code
                          ? ` (${cart.cart_detail_json.discount.code})`
                          : ""}
                      </p>
                      <p className="font-[Nunito-regular] text-[14px] text-[#FF6500]">
                        -{formatCurrency(cart?.display_promo_total)}
                      </p>
                    </div>
                  )}

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
                    {cart?.discount_id && (
                      <p className="text-[13px] font-[Nunito-bold] text-[#00b300] mt-[6px] text-right">
                        You save {cart?.display_promo_total} on this order 🎉
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
