"use client";

import React, { useState, useEffect } from "react";
import { useCore } from "../../context/CoreProvider";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";

const CouponSection = () => {
  const { cart, setCart, actions, auth, config, toast } = useCore();
  const token = auth?.token ?? auth?.access_token ?? null;
  const { formatCurrency } = useCurrencyFormat();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [removingCode, setRemovingCode] = useState(null);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);

  const triggerToast = {
    success: (msg) => {
      if (toast?.success) toast.success(msg);
      else console.log("Success:", msg);
    },
    error: (msg) => {
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
  }, [actions, cart?.id, token, config?.regionId]);

  const availableDiscountsWithCode = availableDiscounts?.filter((coupon) => coupon.code) || [];

  const appliedDiscounts = (cart?.cart_detail_json?.discounts || cart?.cart_discounts || []).filter(
    (coupon) => coupon.code
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
      });
      const updatedCart = result?.cart ?? result;
      setCart(updatedCart);
      setIsOpen(false);
      setInputValue("");
      setErrorMessage(null);
    } catch (error) {
      const msg = error?.data?.error || error?.message || "Failed to apply coupon";
      setErrorMessage(msg);

      if (
        msg.toLowerCase().includes("already applied") ||
        msg.toLowerCase().includes("discount is already")
      ) {
        // Force refresh cart to sync UI
        if (actions?.getCart && auth?.isSignedIn) {
          const res = await actions.getCart(config?.regionId);
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

  const handleRemove = async (code) => {
    setRemovingCode(code);
    console.log({ code })
    try {
      if (!actions?.removeDiscount) {
        throw new Error("removeDiscount action is not configured");
      }
      const result = await actions.removeDiscount({
        token,
        code,
        region_id: config?.regionId,
      });
      const updatedCart = result?.cart ?? result;
      setCart(updatedCart);
      setIsOpen(true);
    } catch (error) {
      triggerToast.error(`Failed to remove coupon ${code}`);
    } finally {
      setRemovingCode(null);
    }
  };

  const getEligibility = (coupon) => {
    if (coupon.min_order_value > 0 && (cart?.item_total ?? 0) < coupon.min_order_value) {
      return { eligible: false, reason: `Add ${coupon.display_min_order_value} more to apply` };
    }
    return { eligible: true, reason: null };
  };

  const formatEndDate = (end_at) => {
    if (!end_at) return null;
    return new Date(end_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  // State 0 — Not signed in
  if (!token) {
    return (
      <div className="my-4">
        <div className="w-full flex items-center justify-between border-t border-b border-[var(--borders)] px-1 py-3">
          <span className="font-[Nunito-medium] text-[14px] text-[var(--secondary)]">
            🏷 Have a coupon code?{" "}
            <span className="text-[#FF6500] text-[12px] font-[Nunito-regular]">
              Sign in to apply
            </span>
          </span>
          <span className="text-[var(--secondary)] text-[16px]">▾</span>
        </div>
      </div>
    );
  }

  // State 1 — Token exists (render applied discounts and accordion input)
  return (
    <div className="my-4">
      {/* Applied Coupons List */}
      {appliedDiscounts?.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {appliedDiscounts?.map((coupon) => (
            <div
              key={coupon.code || coupon.id}
              className="flex items-center justify-between bg-[#f0faf0] border border-[#00b300] rounded-lg px-4 py-3 gap-2"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                <span className="text-base">✅</span>
                <span className="font-[Nunito-bold] text-[#0f0f0f] text-[13px] tracking-wide">
                  {coupon.code}
                </span>
                <span className="font-[Nunito-regular] text-[#0f0f0f] text-[12px]">
                  applied
                </span>
                <span className="text-[#0f0f0f] text-[12px] hidden sm:inline">·</span>
                <span className="text-[#00b300] text-[12px] font-[Nunito-bold]">
                  You save {formatCurrency(coupon.display_discount_amount || (coupon.discount_amount / 100))}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(coupon.code)}
                disabled={removingCode === coupon.code}
                className="text-[#8e9194] text-lg bg-transparent border-0 cursor-pointer disabled:opacity-50"
                aria-label={`Remove coupon ${coupon.code}`}
              >
                {removingCode === coupon.code ? "…" : "✕"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showInput && (
        <>
          {/* Accordion header */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="w-full flex items-center justify-between border-t border-b border-[var(--borders)] px-1 py-3 cursor-pointer"
          >
            <span className="font-[Nunito-medium] text-[14px] text-[var(--main)]">
              🏷 Have a coupon code?
            </span>
            <span className="text-[var(--main)] text-[16px]">
              {isOpen ? "▴" : "▾"}
            </span>
          </button>

          {isOpen && (
            <div className="mt-3 flex flex-col gap-3">
              {/* Input + Apply button */}
              <div className="flex gap-2">
                <input
                  type="text"
                  aria-label="Coupon code"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApply()}
                  placeholder="ENTER CODE"
                  className="border border-[var(--borders)] rounded-lg px-3 py-2 text-[13px] text-[var(--main)] font-[Nunito-regular] uppercase tracking-widest outline-none flex-1"
                />
                <button
                  onClick={handleApply}
                  disabled={isApplying || !inputValue.trim()}
                  className="bg-[#FF6500] text-white text-[12px] font-[Nunito-bold] px-4 py-2 rounded-lg border-none cursor-pointer tracking-wide disabled:opacity-60 shrink-0"
                >
                  {isApplying ? "APPLYING..." : "APPLY"}
                </button>
              </div>

              {/* Error message */}
              {errorMessage && (
                <p className="text-red-600 text-[12px] font-[Nunito-regular]">
                  {errorMessage}
                </p>
              )}

              {/* Available coupons */}
              {!discountsLoading &&
                availableDiscountsWithCode.length > 0 && (
                  <div className="flex flex-col gap-2 mt-1">
                    <p className="font-[Nunito-medium] text-[12px] text-[var(--secondary)]">
                      Available coupons
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableDiscountsWithCode.map((coupon) => {
                        const endDate = formatEndDate(coupon.end_at);
                        const { eligible, reason } = getEligibility(coupon);
                        const conditionParts = [];
                        if (endDate) conditionParts.push(`Ends ${endDate}`);
                        const conditionText = conditionParts.join(" · ");

                        return (
                          <div key={coupon.code} className="flex flex-col gap-[2px]">
                            <button
                              type="button"
                              onClick={() => eligible && setInputValue(coupon.code)}
                              disabled={!eligible}
                              className={`bg-[#fff5ee] border border-dashed border-[#FF6500] text-[#FF6500] text-[11px] font-[Nunito-bold] px-3 py-1 rounded ${!eligible ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                              {coupon.code} — {coupon.display_action_value}
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
    </div>
  );
};

export default CouponSection;
