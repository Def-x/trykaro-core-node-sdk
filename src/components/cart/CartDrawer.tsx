"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useCore } from "../../context/CoreProvider";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import FastCheckoutDrawer from "./FastCheckoutDrawer";

export interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  freeShippingThreshold?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  freeShippingThreshold: propThreshold,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);

  const {
    cart,
    setCart,
    actions,
    config,
    auth,
    primaryColor = "#00214c",
    toast,
    isCartDrawerOpen: contextIsOpen,
    closeCartDrawer: contextCloseDrawer,
  } = useCore();

  const {
    cartItems = [],
    handleAddToCart,
    handleDecreaseQty,
    handleDeleteLineItem,
    isAddToCartLoading,
    deletingLineItemId,
  } = useAddToCart();

  const { formatCurrency } = useCurrencyFormat();

  // Determine controlled vs context open state
  const isOpen = propIsOpen !== undefined ? propIsOpen : (contextIsOpen ?? false);
  const onClose = propOnClose !== undefined ? propOnClose : (contextCloseDrawer ?? (() => {}));

  const token = auth?.token ?? auth?.access_token ?? null;
  const freeShippingThreshold =
    propThreshold ?? config?.freeShippingThreshold ?? 499;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isCheckoutOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isCheckoutOpen, onClose]);

  const items = cartItems || [];
  const totalItemsCount = items.reduce(
    (sum: number, it: any) => sum + (it.quantity || 1),
    0,
  );

  // Totals calculation
  const rawItemTotal = parseFloat(
    cart?.display_item_total?.replace(/[^0-9.]/g, "") ||
      String((cart?.item_total ?? 0) > 10000 ? (cart?.item_total ?? 0) / 100 : (cart?.item_total ?? 0)),
  ) || 0;

  const rawTotal = parseFloat(
    cart?.display_total?.replace(/[^0-9.]/g, "") ||
      String((cart?.total ?? 0) > 10000 ? (cart?.total ?? 0) / 100 : (cart?.total ?? 0)),
  ) || 0;

  const rawPromoTotal = parseFloat(
    cart?.display_promo_total?.replace(/[^0-9.]/g, "") ||
      String((cart?.promo_total ?? 0) > 10000 ? (cart?.promo_total ?? 0) / 100 : (cart?.promo_total ?? 0)),
  ) || 0;

  // Free shipping tracker
  const freeShippingUnlocked = rawItemTotal >= freeShippingThreshold;
  const amountNeededForFreeShipping = Math.max(
    0,
    freeShippingThreshold - rawItemTotal,
  );
  const shippingProgressPct = Math.min(
    100,
    Math.round((rawItemTotal / freeShippingThreshold) * 100),
  );

  // Applied coupons from cart
  const appliedDiscounts = ((cart as any)?.cart_discounts || []).filter(
    (c: any) => c.code || c.id || c.name || c.display_action_value || c.discount_id,
  );
  const activeDiscount = appliedDiscounts[0] || null;

  // Fetch available discounts from API
  useEffect(() => {
    if (!actions?.getAvailableDiscounts || !cart?.id) return;
    let isMounted = true;
    setDiscountsLoading(true);
    actions
      .getAvailableDiscounts({
        token,
        cart_id: cart.id,
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId,
      })
      .then((res: any) => {
        if (isMounted) {
          const list = Array.isArray(res) ? res : res?.data || res?.discounts || [];
          setAvailableDiscounts(Array.isArray(list) ? list : []);
        }
      })
      .catch((err: any) => {
        console.warn("[CartDrawer] Failed to fetch available discounts:", err);
      })
      .finally(() => {
        if (isMounted) setDiscountsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [actions, cart?.id, token, config?.regionId, config?.apiBaseUrl, config?.storeId]);

  // Coupon apply by code
  const applyCouponByCode = async (codeToApply: string) => {
    if (!codeToApply.trim() || !cart?.id || !actions?.applyDiscount) {
      toast?.error?.("Unable to apply discount");
      return;
    }

    try {
      setCouponApplying(true);
      const res = await actions.applyDiscount({
        token,
        cart_id: cart.id,
        code: codeToApply.trim(),
        source: "web",
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId,
      });

      if (res?.serverError || res?.error) {
        toast?.error?.(res.serverError || res.error || "Invalid coupon code");
        return;
      }

      toast?.success?.(`Coupon "${codeToApply.trim()}" applied! 🎉`);
      setCouponCode("");
      const updatedCart = res?.cart ?? res;
      setCart(updatedCart);
    } catch (err: any) {
      toast?.error?.(err?.message || "Failed to apply coupon");
    } finally {
      setCouponApplying(false);
    }
  };

  // Coupon apply by id (one-click from available coupons)
  const applyCouponById = async (discountId: string | number) => {
    if (!discountId || !cart?.id || !actions?.applyDiscount) return;

    try {
      setCouponApplying(true);
      const res = await actions.applyDiscount({
        token,
        cart_id: cart.id,
        discount_id: discountId,
        source: "web",
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId,
      });

      if (res?.serverError || res?.error) {
        toast?.error?.(res.serverError || res.error || "Failed to apply coupon");
        return;
      }

      toast?.success?.("Coupon applied successfully! 🎉");
      const updatedCart = res?.cart ?? res;
      setCart(updatedCart);
    } catch (err: any) {
      toast?.error?.(err?.message || "Failed to apply coupon");
    } finally {
      setCouponApplying(false);
    }
  };

  // Coupon form submit handler
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    await applyCouponByCode(couponCode);
  };

  const handleRemoveCoupon = async (discountId?: string | number) => {
    if (!cart?.id) return;
    const removeFn = actions?.removeDiscountById || actions?.removeDiscount;
    if (!removeFn) return;

    try {
      setCouponApplying(true);
      const res = await removeFn({
        token,
        cart_id: cart.id,
        discount_id: discountId || activeDiscount?.id || activeDiscount?.discount_id,
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId,
      });
      toast?.info?.("Coupon removed");
      const updatedCart = res?.cart ?? res;
      setCart(updatedCart);
    } catch (err: any) {
      toast?.error?.(err?.message || "Failed to remove coupon");
    } finally {
      setCouponApplying(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const drawerContent = (
    <div className="fixed inset-0 z-[999998] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in"
        onClick={() => {
          if (!isCheckoutOpen) onClose();
        }}
      />

      {/* Drawer Container (Right Slide-over) */}
      <div
        className="relative w-full max-w-[460px] h-[100dvh] bg-white shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-out animate-in slide-in-from-right"
        style={{ willChange: "transform" }}
      >
        {/* ── Top Header ── */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-[var(--font-bold,sans-serif)] text-[18px] text-gray-900 tracking-tight">
              Your Bag
            </h2>
            <span
              className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              {totalItemsCount}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-base"
            aria-label="Close cart drawer"
          >
            ✕
          </button>
        </div>

        {/* ── Free Shipping Progress Bar (Bombay Shaving Co Style) ── */}
        {items.length > 0 && (
          <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 shrink-0">
            <div className="flex items-center justify-between text-xs mb-1.5 font-[var(--font-medium)]">
              {freeShippingUnlocked ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span>🎉</span> You unlocked <strong>FREE Delivery!</strong>
                </span>
              ) : (
                <span className="text-gray-700 flex items-center gap-1">
                  <span>🚚</span> Add{" "}
                  <strong className="text-gray-900 font-bold">
                    {formatCurrency(amountNeededForFreeShipping)}
                  </strong>{" "}
                  more for <strong>FREE Delivery</strong>
                </span>
              )}
              <span className="text-gray-500 font-semibold text-[11px]">
                {shippingProgressPct}%
              </span>
            </div>

            {/* Bar */}
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${shippingProgressPct}%`,
                  backgroundColor: freeShippingUnlocked ? "#10b981" : primaryColor,
                }}
              />
            </div>
          </div>
        )}

        {/* ── Main Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl shadow-inner border border-gray-100">
                🛍️
              </div>
              <div className="space-y-1">
                <h3 className="font-[var(--font-bold)] text-lg text-gray-800">
                  Your cart is empty
                </h3>
                <p className="text-xs text-gray-500 max-w-[260px] mx-auto">
                  Looks like you haven't added anything yet. Discover our latest collections and find something you love!
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-white text-xs font-[var(--font-bold)] rounded-full transition-opacity hover:opacity-90 cursor-pointer shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                Start Shopping →
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {items.map((item: any) => {
                const product = item?.line_itemable || item;
                const name = product?.name || item?.name || "Product";
                const price = item?.price ?? product?.price ?? 0;
                const quantity = item?.quantity ?? 1;
                const imageUrl =
                  product?.product_images?.[0]?.product_image_url ??
                  product?.image_url ??
                  item?.image ??
                  null;

                const isDeleting = deletingLineItemId === item?.id;
                const isItemBusy = isAddToCartLoading || isDeleting;

                const displayItemPrice = (price ?? 0) > 10000 ? price / 100 : price;

                return (
                  <div
                    key={item?.id || item?.line_itemable_id}
                    className="flex gap-3 py-3 items-start group"
                  >
                    {/* Image */}
                    <div className="w-18 h-18 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl opacity-40">🛍️</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4
                          className="font-[var(--font-bold)] text-xs text-gray-900 line-clamp-2 leading-snug"
                          title={name}
                        >
                          {name}
                        </h4>
                        <button
                          onClick={() => handleDeleteLineItem(item)}
                          disabled={isItemBusy}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                          aria-label="Remove"
                        >
                          {isDeleting ? (
                            <span className="inline-block w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Customization or Variant Pills */}
                      {item?.line_items_customizations?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.line_items_customizations.map((c: any, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                            >
                              {c.label || c.name || "Custom"}: {c.value}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price & Quantity Stepper */}
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleDecreaseQty(product)}
                            disabled={isItemBusy}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all text-xs font-bold disabled:opacity-40 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-xs font-[var(--font-bold)] text-gray-800">
                            {isItemBusy ? "..." : quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            disabled={isItemBusy}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all text-xs font-bold disabled:opacity-40 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-[var(--font-bold)] text-xs text-gray-900">
                            {formatCurrency(displayItemPrice * quantity)}
                          </span>
                          {quantity > 1 && (
                            <p className="text-[10px] text-gray-400">
                              {formatCurrency(displayItemPrice)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Coupons & Offers (Bombay Shaving Co Style) ── */}
          {items.length > 0 && (
            <div className="my-3 p-3 bg-gray-50/90 border border-gray-200/90 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 font-[var(--font-bold)] text-xs text-gray-800">
                  <span>🏷️</span>
                  <span>Offers & Coupons</span>
                </span>
                {activeDiscount && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Applied
                  </span>
                )}
              </div>

              {/* Active Applied Coupon Banner */}
              {activeDiscount ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <div>
                      <p className="font-bold tracking-wide text-xs">
                        {activeDiscount.code || activeDiscount.display_action_value || "Coupon Applied"}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-medium">
                        {rawPromoTotal > 0
                          ? `You save ${formatCurrency(rawPromoTotal)}`
                          : "Discount applied to order"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCoupon(activeDiscount.id || activeDiscount.discount_id)}
                    disabled={couponApplying}
                    className="text-red-500 font-bold hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    {couponApplying ? "..." : "Remove"}
                  </button>
                </div>
              ) : (
                /* Coupon Input Form - Visible & Accessible by Default */
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER COUPON CODE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs uppercase font-semibold tracking-wider text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={couponApplying || !couponCode.trim()}
                    className="px-4 py-2 text-white text-xs font-bold rounded-lg transition-opacity disabled:opacity-50 cursor-pointer shrink-0 tracking-wider shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {couponApplying ? "..." : "APPLY"}
                  </button>
                </form>
              )}

              {/* Available Coupons List (One-Tap Apply) */}
              {!activeDiscount && availableDiscounts.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-gray-200/60 space-y-1.5">
                  <p className="text-[11px] font-[var(--font-medium)] text-gray-500">
                    Available coupons:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableDiscounts.map((coupon: any) => {
                      const code = coupon.code;
                      const label = coupon.display_action_value || coupon.name || "Special Offer";
                      return (
                        <button
                          key={coupon.code || coupon.id}
                          type="button"
                          onClick={() => {
                            if (code) {
                              setCouponCode(code);
                              applyCouponByCode(code);
                            } else if (coupon.id) {
                              applyCouponById(coupon.id);
                            }
                          }}
                          disabled={couponApplying}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold border border-dashed transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center gap-1.5 bg-white shadow-2xs"
                          style={{
                            color: primaryColor,
                            borderColor: primaryColor,
                          }}
                        >
                          <span>🏷️ {code ? `${code}` : label}</span>
                          <span className="text-[10px] text-emerald-600 font-bold uppercase">
                            • Apply
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Bill Summary Details ── */}
          {items.length > 0 && (
            <div className="py-3 text-xs space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Item Subtotal</span>
                <span>{cart?.display_item_total ? formatCurrency(cart.display_item_total) : formatCurrency(rawItemTotal)}</span>
              </div>

              {rawPromoTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>− {formatCurrency(rawPromoTotal)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>
                  {freeShippingUnlocked ? (
                    <span className="text-emerald-600 font-bold uppercase">
                      FREE
                    </span>
                  ) : cart?.display_ship_total ? (
                    formatCurrency(cart.display_ship_total)
                  ) : (
                    "₹49"
                  )}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-2 flex justify-between font-[var(--font-bold)] text-sm text-gray-900">
                <span>Grand Total</span>
                <span style={{ color: primaryColor }}>
                  {cart?.display_total ? formatCurrency(cart.display_total) : formatCurrency(rawTotal)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Sticky Bottom Checkout CTA ── */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.04)] space-y-2">
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-3.5 px-5 text-white rounded-xl font-[var(--font-bold)] text-sm flex items-center justify-between shadow-lg shadow-gray-200 transition-all active:scale-[0.99] cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-normal uppercase tracking-wider opacity-85">
                  Total to Pay
                </span>
                <span className="text-base font-extrabold leading-none">
                  {cart?.display_total ? formatCurrency(cart.display_total) : formatCurrency(rawTotal)}
                </span>
              </div>

              <span className="flex items-center gap-1.5 font-bold tracking-wide">
                <span>PROCEED TO CHECKOUT</span>
                <span>→</span>
              </span>
            </button>

            {/* Trust Markers */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400 pt-1">
              <span>🔒 100% Safe Payments</span>
              <span>•</span>
              <span>⚡ Direct Gateway</span>
              <span>•</span>
              <span>📦 Easy Returns</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Seamless Fast Checkout Popup/Drawer ── */}
      <FastCheckoutDrawer
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onPaymentSuccess={() => {
          setIsCheckoutOpen(false);
          onClose();
        }}
      />
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default CartDrawer;
