"use client";

import React, { useState, useEffect } from "react";
import { useCore } from "../../context/CoreProvider";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import { useLoyalty } from "../../hooks/useLoyalty";

export const CouponSection: React.FC = () => {
  const { cart, setCart, actions, auth, config, toast } = useCore();
  const token = auth?.token ?? auth?.access_token ?? null;
  const { formatCurrency } = useCurrencyFormat();

  const {
    isLoyaltyEnabled,
    availablePoints,
    monetaryValue,
    isApplying: isApplyingLoyalty,
    applyPoints,
  } = useLoyalty({ autoFetch: Boolean(token) });
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [loyaltyPointsInput, setLoyaltyPointsInput] = useState<number>(100);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [removingId, setRemovingId] = useState<string | number | null>(null);
  const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);

  const triggerToast = {
    success: (msg: string) => {
      if (toast?.success) toast.success(msg);
      else console.log("Success:", msg);
    },
    error: (msg: string) => {
      if (toast?.error) toast.error(msg);
      else console.error("Error:", msg);
    },
  };

  useEffect(() => {
    if (!actions?.getAvailableDiscounts || !cart?.id || !token) return;

    let isMounted = true;
    const fetchDiscounts = async () => {
      try {
        setDiscountsLoading(true);
        const data = await actions.getAvailableDiscounts({
          token,
          cart_id: cart?.id,
          region_id: config?.regionId,
          apiBaseUrl: config?.apiBaseUrl,
          orgId: config?.storeId,
        });
        if (isMounted) {
          setAvailableDiscounts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch available discounts:", err);
      } finally {
        if (isMounted) {
          setDiscountsLoading(false);
        }
      }
    };

    fetchDiscounts();
    return () => {
      isMounted = false;
    };
  }, [actions, cart?.id, token, config?.regionId, config?.apiBaseUrl, config?.storeId]);

  const availableDiscountsWithCode = availableDiscounts || [];
  const rawDiscounts: any[] = (cart as any)?.cart_discounts || [];
  const appliedDiscounts = rawDiscounts.filter(
    (coupon) => coupon.code || coupon.id,
  );

  const firstAppliedDiscount = appliedDiscounts?.[0];
  const showInput = !firstAppliedDiscount || firstAppliedDiscount.stackable;

  const handleApply = async () => {
    if (!inputValue.trim()) return;
    if (!token) {
      setErrorMessage("Please sign in to apply a coupon");
      return;
    }
    setIsApplying(true);
    setErrorMessage(null);
    try {
      if (!actions?.applyDiscount) {
        throw new Error("applyDiscount action is not configured");
      }
      const result = await actions.applyDiscount({
        token,
        code: inputValue.trim(),
        source: "web",
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId,
      });

      if (result?.serverError) {
        setErrorMessage(result.serverError);
        return;
      }
      const updatedCart = result?.cart ?? result;
      setCart(updatedCart);

      setIsOpen(false);
      setInputValue("");
      setErrorMessage(null);
    } catch (error: any) {
      const msg =
        error?.data?.error || error?.message || "Failed to apply coupon";
      setErrorMessage(msg);

      if (
        msg.toLowerCase().includes("already applied") ||
        msg.toLowerCase().includes("discount is already")
      ) {
        if (actions?.getCart && auth?.isSignedIn) {
          const res = await actions.getCart(config?.regionId, {
            token: auth?.token ?? auth?.access_token,
          });
          setCart(Array.isArray(res) ? res[0] : res);
        } else if (actions?.getCartById && cart?.id) {
          const res = await actions.getCartById(cart.id, config?.regionId);
          setCart(res);
        }
      }
    } finally {
      setIsApplying(false);
    }
  };

  const applyById = async (coupon: any) => {
    if (!coupon?.id) return;
    if (!token) {
      setErrorMessage("Please sign in to apply a coupon");
      return;
    }
    setIsApplying(true);
    setErrorMessage(null);
    try {
      if (!actions?.applyDiscount) {
        throw new Error("applyDiscount action is not configured");
      }
      const result = await actions.applyDiscount({
        token,
        discount_id: coupon.id,
        source: "web",
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId,
      });

      if (result?.serverError) {
        setErrorMessage(result.serverError);
        return;
      }
      const updatedCart = result?.cart ?? result;
      setCart(updatedCart);

      setIsOpen(false);
      setInputValue("");
      setErrorMessage(null);
    } catch (error: any) {
      const msg =
        error?.data?.error || error?.message || "Failed to apply coupon";
      setErrorMessage(msg);

      if (
        msg.toLowerCase().includes("already applied") ||
        msg.toLowerCase().includes("discount is already")
      ) {
        if (actions?.getCart && auth?.isSignedIn) {
          const res = await actions.getCart(config?.regionId, {
            token: auth?.token ?? auth?.access_token,
          });
          setCart(Array.isArray(res) ? res[0] : res);
        } else if (actions?.getCartById && cart?.id) {
          const res = await actions.getCartById(cart.id, config?.regionId);
          setCart(res);
        }
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemove = async ({
    code,
    discount_id,
  }: {
    code?: string;
    discount_id: string | number;
  }) => {
    setRemovingId(discount_id);
    try {
      if (!actions?.removeDiscountById && !actions?.removeDiscount) {
        throw new Error("removeDiscount action is not configured");
      }
      const removeFn = actions?.removeDiscountById || actions?.removeDiscount;
      const result = await removeFn({
        token,
        discount_id,
        region_id: config?.regionId,
        apiBaseUrl: config?.apiBaseUrl,
        orgId: config?.storeId,
      });
      const updatedCart = result?.cart ?? result;
      setCart(updatedCart);
      setIsOpen(true);
    } catch (error) {
      console.log({ error });
      triggerToast.error(`Failed to remove coupon ${code || "discount"}`);
    } finally {
      setRemovingId(null);
    }
  };

  const getEligibility = (coupon: any) => {
    if (
      coupon.min_order_value > 0 &&
      (cart?.item_total ?? 0) < coupon.min_order_value
    ) {
      return {
        eligible: false,
        reason: `Add ${coupon.display_min_order_value} more to apply`,
      };
    }
    return { eligible: true, reason: null };
  };

  const formatEndDate = (end_at?: string) => {
    if (!end_at) return null;
    return new Date(end_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  if (!token) {
    return (
      <div className="my-4">
        <div className="w-full flex items-center justify-between border-t border-b border-[var(--borders)] px-1 py-3">
          <span className="font-[var(--font-medium)] text-[14px] text-[var(--secondary)]">
            🏷 Have a coupon code?{" "}
            <span className="text-[var(--core-primary)] text-[12px] font-[var(--font-regular)]">
              Sign in to apply
            </span>
          </span>
          <span className="text-[var(--secondary)] text-[16px]">▾</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      {appliedDiscounts?.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {appliedDiscounts?.map((coupon: any) => (
            <div
              key={coupon.code || coupon.id}
              className="flex items-center justify-between bg-[#f0faf0] border border-[#00b300] rounded-lg px-4 py-3 gap-2"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                <span className="text-base">✅</span>
                <span className="font-[var(--font-bold)] text-[#0f0f0f] text-[13px] tracking-wide">
                  {coupon.code
                    ? coupon.code
                    : coupon.display_action_value || "Discount"}
                </span>
                <span className="font-[var(--font-regular)] text-[#0f0f0f] text-[12px]">
                  applied
                </span>
                <span className="text-[#0f0f0f] text-[12px] hidden sm:inline">
                  ·
                </span>
                <span className="text-[#00b300] text-[12px] font-[var(--font-bold)]">
                  You save{" "}
                  {formatCurrency(
                    coupon.display_discount_amount ||
                      (coupon.discount_amount ? coupon.discount_amount / 100 : 0),
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleRemove({
                    code: coupon.code,
                    discount_id: coupon.discount_id ?? coupon.id,
                  })
                }
                disabled={removingId === (coupon.discount_id ?? coupon.id)}
                className="text-[#8e9194] text-lg bg-transparent border-0 cursor-pointer disabled:opacity-50"
                aria-label={`Remove coupon ${coupon.code || "discount"}`}
              >
                {removingId === (coupon.discount_id ?? coupon.id) ? "…" : "✕"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showInput && (
        <>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="w-full flex items-center justify-between border-t border-b border-[var(--borders)] px-1 py-3 cursor-pointer"
          >
            <span className="font-[var(--font-medium)] text-[14px] text-[var(--main)]">
              🏷 Have a coupon code?
            </span>
            <span className="text-[var(--main)] text-[16px]">
              {isOpen ? "▴" : "▾"}
            </span>
          </button>

          {isOpen && (
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  aria-label="Coupon code"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApply()}
                  placeholder="ENTER CODE"
                  className="border border-[var(--borders)] rounded-lg px-3 py-2 text-[13px] text-[var(--main)] font-[var(--font-regular)] uppercase tracking-widest outline-none flex-1"
                />
                <button
                  onClick={handleApply}
                  disabled={isApplying || !inputValue.trim()}
                  className="text-white text-[12px] font-[var(--font-bold)] px-4 py-2 rounded-lg border-none cursor-pointer tracking-wide disabled:opacity-60 shrink-0"
                  style={{ background: "var(--core-primary)" }}
                >
                  {isApplying ? "APPLYING..." : "APPLY"}
                </button>
              </div>

              {errorMessage && (
                <p className="text-red-600 text-[12px] font-[var(--font-regular)]">
                  {errorMessage}
                </p>
              )}

              {!discountsLoading && availableDiscountsWithCode.length > 0 && (
                <div className="flex flex-col gap-2 mt-1">
                  <p className="font-[var(--font-medium)] text-[12px] text-[var(--secondary)]">
                    Available coupons
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableDiscountsWithCode.map((coupon) => {
                      const endDate = formatEndDate(coupon.end_at);
                      const { eligible, reason } = getEligibility(coupon);
                      const conditionParts: string[] = [];
                      if (endDate) conditionParts.push(`Ends ${endDate}`);
                      const conditionText = conditionParts.join(" · ");

                      return (
                        <div
                          key={coupon?.code || coupon?.id}
                          className="flex flex-col gap-[2px]"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (!eligible) return;
                              if (!coupon.code) {
                                applyById(coupon);
                              } else {
                                setInputValue(coupon.code);
                              }
                            }}
                            disabled={!eligible || isApplying}
                            className={`border border-dashed text-[11px] font-[var(--font-bold)] px-3 py-1 rounded ${
                              !eligible || isApplying
                                ? "opacity-40 cursor-not-allowed"
                                : ""
                            }`}
                            style={{
                              color: "var(--core-primary)",
                              borderColor: "var(--core-primary)",
                              backgroundColor:
                                "color-mix(in srgb, var(--core-primary) 10%, transparent)",
                            }}
                          >
                            {coupon.code ? `${coupon.code} — ` : ""}
                            {coupon.display_action_value || "Discount"}
                          </button>
                          {reason && (
                            <span className="text-[11px] text-[#8e9194]">
                              {reason}
                            </span>
                          )}
                          {!reason && conditionText && (
                            <span className="text-[11px] text-[#8e9194]">
                              {conditionText}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Loyalty Points Redemption ── */}
      {isLoyaltyEnabled && availablePoints > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setIsLoyaltyOpen((prev) => !prev)}
            aria-expanded={isLoyaltyOpen}
            className="w-full flex items-center justify-between border-b border-[var(--borders)] px-1 py-3 cursor-pointer"
          >
            <span className="font-[var(--font-medium)] text-[14px] text-[var(--main)] flex items-center gap-1.5 flex-wrap">
              <span>⭐</span>
              <span>Redeem Points</span>
              <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-[#E65100]">
                {availablePoints.toLocaleString()} pts available
              </span>
            </span>
            <span className="text-[var(--main)] text-[16px]">
              {isLoyaltyOpen ? "▴" : "▾"}
            </span>
          </button>

          {isLoyaltyOpen && (
            <div className="mt-3 flex flex-col gap-3 rounded-xl bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white p-3.5 border border-amber-200/80 shadow-xs">
              <div className="flex items-center justify-between text-xs text-gray-700">
                <span>
                  Available: <strong>{availablePoints.toLocaleString()} pts</strong> (Worth <strong>{formatCurrency(monetaryValue)}</strong>)
                </span>
                <span className="text-emerald-700 font-semibold text-[11px]">
                  Saves {formatCurrency(Math.min(availablePoints, Math.max(0, loyaltyPointsInput)) * (availablePoints > 0 && monetaryValue > 0 ? monetaryValue / availablePoints : 0.877))}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  aria-label="Points to redeem"
                  value={loyaltyPointsInput}
                  onChange={(e) => setLoyaltyPointsInput(Math.min(availablePoints, Math.max(0, Number(e.target.value))))}
                  min={100}
                  max={availablePoints}
                  step={50}
                  placeholder="Min 100 pts"
                  className="border border-amber-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 font-semibold outline-none flex-1 bg-white focus:border-[#E65100]"
                />
                <button
                  type="button"
                  onClick={() => setLoyaltyPointsInput(availablePoints)}
                  className="px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-[#E65100] hover:bg-orange-50 cursor-pointer shrink-0"
                >
                  Max
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!cart?.id) {
                      triggerToast.error("Cart not found");
                      return;
                    }
                    await applyPoints({
                      cart_id: String(cart.id),
                      points_to_use: loyaltyPointsInput,
                    });
                  }}
                  disabled={isApplyingLoyalty || loyaltyPointsInput < 100 || loyaltyPointsInput > availablePoints}
                  className="text-white text-[12px] font-[var(--font-bold)] px-4 py-2 rounded-lg border-none cursor-pointer tracking-wide disabled:opacity-60 shrink-0 shadow-xs"
                  style={{ background: "var(--core-primary, #E65100)" }}
                >
                  {isApplyingLoyalty ? "APPLYING..." : "REDEEM"}
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[100, 250, 500, 1000]
                  .filter((p) => p <= availablePoints)
                  .map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLoyaltyPointsInput(preset)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                        loyaltyPointsInput === preset
                          ? "bg-[#E65100] text-white border-[#E65100]"
                          : "bg-white text-gray-700 border-amber-200 hover:border-amber-400"
                      }`}
                    >
                      {preset} Pts (-{formatCurrency(preset * (availablePoints > 0 && monetaryValue > 0 ? monetaryValue / availablePoints : 0.877))})
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CouponSection;

