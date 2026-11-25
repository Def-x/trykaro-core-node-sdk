"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRazorpay } from "react-razorpay";
import { useCore } from "../../context/CoreProvider";
import { usePaymentGateway } from "../../hooks/usePaymentGateway";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import { useStorefrontRouter } from "../../utils/navigation";
import { validateCartTotal } from "../../actions/storefrontActions";
import {
  trackBeginCheckout,
  trackPurchase,
  trackPaymentFailed,
  trackAddShippingInfo,
  trackAddPaymentInfo,
} from "../../lib/gtm";
import {
  trackMetaInitiateCheckout,
  trackMetaPurchase,
  trackMetaAddPaymentInfo,
} from "../../lib/metaPixel";

export interface FastCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
  router?: any;
}

export const FastCheckoutDrawer: React.FC<FastCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  router: overrideRouter,
}) => {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  const router = useStorefrontRouter(overrideRouter);
  const { Razorpay } = useRazorpay();

  const {
    cart,
    setCart,
    actions,
    config,
    auth,
    orgData,
    primaryColor = "#00214c",
    toast,
  } = useCore();

  const { formatCurrency } = useCurrencyFormat();
  const {
    gateway: paymentGateway,
    label: paymentGatewayLabel,
    isPhonePe: isPhonePeGateway,
    isRazorpay: isRazorpayGateway,
    isStripe: isStripeGateway,
    stripePublishableKey,
    razorpayKeyId,
  } = usePaymentGateway();

  // Authentication state
  const token = auth?.token ?? auth?.access_token ?? null;
  const isSignedIn = Boolean((auth?.isSignedIn ?? false) && token);

  // Auth Step state (for unauthenticated users)
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Address Step state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [shippingAddressId, setShippingAddressId] = useState<string | number | null>(
    cart?.shipping_address?.id ?? cart?.shipping_address_id ?? null,
  );
  const [billingAddressId, setBillingAddressId] = useState<string | number | null>(
    cart?.billing_address?.id ?? cart?.billing_address_id ?? null,
  );
  const [sameAsShipping, setSameAsShipping] = useState<boolean>(() => {
    if (cart?.billing_address?.id && cart?.shipping_address?.id) {
      return String(cart.billing_address.id) === String(cart.shipping_address.id);
    }
    return true;
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState<"shipping" | "billing" | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);

  // New address form fields
  const [newAddrName, setNewAddrName] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState("");
  const [newAddrLine1, setNewAddrLine1] = useState("");
  const [newAddrLine2, setNewAddrLine2] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("");
  const [newAddrState, setNewAddrState] = useState("");
  const [newAddrZipcode, setNewAddrZipcode] = useState("");

  // Payment & processing states
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [cartMismatch, setCartMismatch] = useState<any>(null);

  // Coupon & discount states
  const [couponCode, setCouponCode] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);

  // Safety timeout: if isPlacingOrder is stuck for more than 12 seconds, automatically release it
  useEffect(() => {
    if (!isPlacingOrder) return;
    const timer = setTimeout(() => {
      setIsPlacingOrder(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, [isPlacingOrder]);

  // Sync mount and body scroll lock
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setIsPlacingOrder(false);
    }
    return () => {
      document.body.style.overflow = "";
      setIsPlacingOrder(false);
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPlacingOrder) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPlacingOrder, onClose]);

  // Resend OTP countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Fetch addresses when user becomes signed in
  const fetchAddresses = useCallback(async () => {
    if (!actions?.getUserAddress || !token) return;
    try {
      setIsAddressLoading(true);
      const res = await actions.getUserAddress();
      const addrList = res?.data ?? res?.addresses ?? (Array.isArray(res) ? res : []);
      setAddresses(addrList);

      const cartShipId = cart?.shipping_address?.id ?? cart?.shipping_address_id;
      const cartBillId = cart?.billing_address?.id ?? cart?.billing_address_id;

      const activeShipId = cartShipId || (addrList.length > 0 ? addrList[0].id : null);
      const isSame = (cartBillId && cartShipId)
        ? String(cartBillId) === String(cartShipId)
        : true;
      const activeBillId = isSame ? activeShipId : (cartBillId || activeShipId);

      setShippingAddressId(activeShipId);
      setBillingAddressId(activeBillId);
      setSameAsShipping(isSame);

      if (addrList.length === 0) {
        setShowNewAddressForm("shipping");
      } else if (
        activeShipId &&
        (!cart?.shipping_address?.id || !cart?.billing_address?.id) &&
        cart?.id &&
        actions?.updateCart
      ) {
        actions.updateCart(cart.id, {
          id: cart.id,
          shipping_address_id: activeShipId,
          billing_address_id: activeBillId || activeShipId,
        }).then((updated: any) => {
          if (updated && !updated.serverError) setCart(updated);
        }).catch((err: any) => console.warn("Failed to set default address on cart:", err));
      }
    } catch (err) {
      console.error("[FastCheckoutDrawer] fetchAddresses error:", err);
    } finally {
      setIsAddressLoading(false);
    }
  }, [actions, token, cart?.id, cart?.shipping_address?.id, cart?.shipping_address_id, cart?.billing_address?.id, cart?.billing_address_id, setCart]);

  useEffect(() => {
    if (isOpen && isSignedIn) {
      fetchAddresses();
    }
  }, [isOpen, isSignedIn, fetchAddresses]);

  // Pre-fill user phone in address form
  useEffect(() => {
    const userPhone = auth?.user?.phone;
    const userName = (auth?.user as any)?.name || auth?.user?.firstName;
    if (userPhone && !newAddrPhone) {
      setNewAddrPhone(userPhone);
    }
    if (userName && !newAddrName) {
      setNewAddrName(userName);
    }
  }, [auth?.user, newAddrPhone, newAddrName]);

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
        console.warn("[FastCheckoutDrawer] Failed to fetch available discounts:", err);
      })
      .finally(() => {
        if (isMounted) setDiscountsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [actions, cart?.id, token, config?.regionId, config?.apiBaseUrl, config?.storeId]);

  // Applied coupons from cart
  const appliedDiscounts = ((cart as any)?.cart_discounts || []).filter(
    (c: any) => c.code || c.id || c.name || c.display_action_value || c.discount_id,
  );
  const activeDiscount = appliedDiscounts[0] || null;

  const rawPromoTotal = parseFloat(
    cart?.display_promo_total?.replace(/[^0-9.]/g, "") ||
      String((cart?.promo_total ?? 0) > 10000 ? (cart?.promo_total ?? 0) / 100 : (cart?.promo_total ?? 0)),
  ) || 0;

  const rawAdjustmentTotal = parseFloat(
    String(cart?.display_adjustment_total ?? "").replace(/[^0-9.]/g, "") ||
      String(cart?.adjustment_total != null ? Number(cart.adjustment_total) / 100 : 0),
  ) || 0;

  const totalSavings = rawAdjustmentTotal > 0 ? rawAdjustmentTotal : rawPromoTotal;

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

  // ── Auth Handlers ──────────────────────────────────────────────────────────
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast?.error?.("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setAuthLoading(true);
      const countryCode = String(config?.countryCode ?? "+91");
      const res = await actions?.login?.(cleanPhone, countryCode);
      if (res?.serverError || res?.error) {
        toast?.error?.(res?.serverError || res?.error || "Failed to send OTP");
        return;
      }
      setIsOtpSent(true);
      setResendTimer(30);
      toast?.success?.("OTP sent successfully to your mobile number");
    } catch (err: any) {
      console.error("[FastCheckoutDrawer] send OTP error:", err);
      toast?.error?.(err?.message || "Failed to send OTP");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredOtp = otp.join("").trim();
    if (enteredOtp.length < 4) {
      toast?.error?.("Please enter the complete OTP");
      return;
    }

    try {
      setAuthLoading(true);
      const cleanPhone = phone.trim().replace(/\D/g, "");
      const countryCode = String(config?.countryCode ?? "+91");
      const res = await actions?.verifyOtp?.(cleanPhone, enteredOtp, countryCode);

      if (res?.serverError || res?.error) {
        toast?.error?.(res?.serverError || res?.error || "Invalid OTP code");
        return;
      }

      if (res?.token || res?.access_token) {
        const nextToken = res.token || res.access_token;
        const nextUser = res.user ?? { phone: cleanPhone };
        auth?.setAuth?.({
          token: nextToken,
          access_token: nextToken,
          user: nextUser,
          userId: nextUser?.id || null,
        });
        toast?.success?.("Logged in successfully!");
        setIsOtpSent(false);
      }
    } catch (err: any) {
      console.error("[FastCheckoutDrawer] verify OTP error:", err);
      toast?.error?.(err?.message || "OTP verification failed");
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Address Handlers ───────────────────────────────────────────────────────
  const handleSelectShippingAddress = async (addrId: string | number) => {
    setShippingAddressId(addrId);
    if (!cart?.id || !actions?.updateCart) return;

    try {
      const payload: any = {
        id: cart.id,
        shipping_address_id: addrId,
      };
      if (sameAsShipping) {
        setBillingAddressId(addrId);
        payload.billing_address_id = addrId;
      }
      const updated = await actions.updateCart(cart.id, payload);
      if (updated && !updated.serverError) {
        setCart(updated);
      }
    } catch (err) {
      console.error("[FastCheckoutDrawer] Failed to set shipping address on cart:", err);
    }
  };

  const handleSelectBillingAddress = async (addrId: string | number) => {
    setBillingAddressId(addrId);
    if (!cart?.id || !actions?.updateCart) return;

    try {
      const updated = await actions.updateCart(cart.id, {
        id: cart.id,
        shipping_address_id: shippingAddressId || addrId,
        billing_address_id: addrId,
      });
      if (updated && !updated.serverError) {
        setCart(updated);
      }
    } catch (err) {
      console.error("[FastCheckoutDrawer] Failed to set billing address on cart:", err);
    }
  };

  const handleToggleSameAsShipping = async () => {
    const nextVal = !sameAsShipping;
    setSameAsShipping(nextVal);
    if (!cart?.id || !actions?.updateCart) return;

    try {
      if (nextVal) {
        // Now same as shipping
        setBillingAddressId(shippingAddressId);
        const updated = await actions.updateCart(cart.id, {
          id: cart.id,
          shipping_address_id: shippingAddressId,
          billing_address_id: shippingAddressId,
        });
        if (updated && !updated.serverError) setCart(updated);
      } else {
        // Separate billing address: default to an alternate address if available
        const alternate = addresses.find((a) => String(a.id) !== String(shippingAddressId))?.id || null;
        if (alternate) {
          setBillingAddressId(alternate);
          const updated = await actions.updateCart(cart.id, {
            id: cart.id,
            shipping_address_id: shippingAddressId,
            billing_address_id: alternate,
          });
          if (updated && !updated.serverError) setCart(updated);
        }
      }
    } catch (err) {
      console.error("[FastCheckoutDrawer] toggle sameAsShipping error:", err);
    }
  };

  const handleSaveNewAddress = async (e: React.FormEvent, target: "shipping" | "billing") => {
    e.preventDefault();
    if (!newAddrName.trim() || !newAddrPhone.trim() || !newAddrLine1.trim() || !newAddrZipcode.trim()) {
      toast?.error?.("Please fill in all required address fields");
      return;
    }

    try {
      setAddressSaving(true);
      const payload = {
        name: newAddrName.trim(),
        phone: newAddrPhone.trim(),
        address_line_1: newAddrLine1.trim(),
        address_line_2: newAddrLine2.trim() || undefined,
        city: newAddrCity.trim(),
        state: newAddrState.trim(),
        zipcode: newAddrZipcode.trim(),
        country_code: "IN",
        address_type: target,
      };

      if (!actions?.createAddress) {
        toast?.error?.("Address action not configured");
        return;
      }

      const created = await actions.createAddress(payload);
      if (created?.serverError || created?.error) {
        toast?.error?.(created.serverError || created.error || "Failed to save address");
        return;
      }

      const newId = created?.id || created?.data?.id;
      toast?.success?.("Address added successfully");
      setShowNewAddressForm(null);
      setNewAddrLine1("");
      setNewAddrLine2("");
      setNewAddrCity("");
      setNewAddrState("");
      setNewAddrZipcode("");
      await fetchAddresses();

      if (newId) {
        if (target === "shipping") {
          await handleSelectShippingAddress(newId);
        } else {
          await handleSelectBillingAddress(newId);
        }
      }
    } catch (err: any) {
      console.error("[FastCheckoutDrawer] handleSaveNewAddress error:", err);
      toast?.error?.(err?.message || "Failed to save address");
    } finally {
      setAddressSaving(false);
    }
  };

  // ── Payment Execution ──────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!cart?.id) {
      toast?.error?.("Cart not found. Please refresh and try again.");
      return;
    }

    if (!shippingAddressId) {
      toast?.error?.("Please select or add a delivery address.");
      return;
    }

    const effectiveBillingId = sameAsShipping ? shippingAddressId : billingAddressId;
    if (!effectiveBillingId) {
      toast?.error?.("Please select or add a billing address.");
      return;
    }

    // Ensure cart has both addresses saved
    if (
      String(cart?.shipping_address?.id) !== String(shippingAddressId) ||
      String(cart?.billing_address?.id) !== String(effectiveBillingId)
    ) {
      try {
        const updated = await actions?.updateCart?.(cart.id, {
          id: cart.id,
          shipping_address_id: shippingAddressId,
          billing_address_id: effectiveBillingId,
        });
        if (updated && !updated.serverError) {
          setCart(updated);
        }
      } catch (err) {
        console.warn("[FastCheckoutDrawer] Cart address sync error:", err);
      }
    }

    // Validate cart total
    const clientTotal = Number(cart?.total ?? cart?.display_total ?? 0);
    const validation = await validateCartTotal(String(cart.id), clientTotal, {
      apiBaseUrl: config?.apiBaseUrl,
      orgId: config?.storeId,
    });

    if (!validation.valid && validation.reason === "price_mismatch") {
      setCartMismatch({
        serverTotal: validation.serverTotal,
        clientTotal: validation.clientTotal,
        cart: validation.cart,
      });
      toast?.error?.("Cart prices or coupons have changed. Please review your total.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const rawUserId = auth?.userId ?? auth?.user?.id ?? null;
      const userId: string | null = rawUserId != null ? String(rawUserId) : null;
      const currency = config?.currency ?? "INR";

      // ── 1. PhonePe Gateway ────────────────────────────────────────────────
      if (isPhonePeGateway) {
        const createOrderFn =
          actions?.createPhonePeOrder ||
          actions?.createCartPayment ||
          actions?.createRazorOrder;

        if (!createOrderFn) {
          toast?.error?.("PhonePe action not configured");
          setIsPlacingOrder(false);
          return;
        }

        const orderRes = await createOrderFn(cart.id);

        if (orderRes?.serverError || orderRes?.error) {
          toast?.error?.(orderRes.serverError || orderRes.error || "Failed to create order");
          setIsPlacingOrder(false);
          return;
        }

        trackBeginCheckout({
          userId,
          cart,
          currency,
          transactionId: String(orderRes?.id ?? ""),
          metaOverrides: { source: "fast_checkout" },
        });
        trackMetaInitiateCheckout(cart);
        trackAddShippingInfo({
          userId,
          cart,
          shippingTier: "Standard",
          currency,
          metaOverrides: { source: "fast_checkout" },
        });
        trackAddPaymentInfo({
          userId,
          cart,
          paymentType: "PhonePe",
          currency,
          metaOverrides: { source: "fast_checkout" },
        });
        trackMetaAddPaymentInfo(cart);

        const redirectUrl =
          orderRes?.redirect_url ||
          orderRes?.url ||
          orderRes?.redirectUrl ||
          orderRes?.data?.instrumentResponse?.redirectInfo?.url ||
          orderRes?.data?.redirectUrl;

        if (redirectUrl) {
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(
                "defx_phonepe_pending",
                JSON.stringify({
                  cartId: cart.id,
                  paymentId: orderRes?.id || orderRes?.cart_payment_id || null,
                  orderId: orderRes?.order_id || null,
                  timestamp: Date.now(),
                }),
              );
            } catch (e) {
              console.warn("Failed to store phonepe session:", e);
            }
          }
          window.location.href = redirectUrl;
          return;
        }

        if (orderRes?.order_id) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("cartid");
          }
          onPaymentSuccess?.();
          setCart(null);
          onClose();
          router.replace(`/account/orders/${orderRes.order_id}`);
          return;
        }

        toast?.error?.("Could not initialize PhonePe payment redirect");
        setIsPlacingOrder(false);
        return;
      }

      // ── 2. Razorpay Gateway ───────────────────────────────────────────────
      if (isRazorpayGateway) {
        const createOrderFn =
          actions?.createRazorOrder || actions?.createCartPayment;

        if (!createOrderFn) {
          toast?.error?.("Razorpay action not configured");
          setIsPlacingOrder(false);
          return;
        }

        const orderRes = await createOrderFn(cart.id);

        if (orderRes?.serverError || orderRes?.error) {
          toast?.error?.(orderRes.serverError || orderRes.error || "Payment order creation failed");
          setIsPlacingOrder(false);
          return;
        }

        trackBeginCheckout({
          userId,
          cart,
          currency,
          transactionId: String(orderRes?.id ?? ""),
          metaOverrides: { source: "fast_checkout" },
        });
        trackMetaInitiateCheckout(cart);
        trackAddPaymentInfo({
          userId,
          cart,
          paymentType: "Razorpay",
          currency,
          metaOverrides: { source: "fast_checkout" },
        });
        trackMetaAddPaymentInfo(cart);

        const options: any = {
          key: razorpayKeyId,
          amount: (orderRes?.cart?.total ?? cart?.total) / 100,
          currency: "INR",
          name: orgData?.name || "Store",
          description: "Order Payment",
          order_id: orderRes?.razor_order_id,
          handler: async (response: any) => {
            try {
              setIsPlacingOrder(true);
              if (actions?.updateRazorPayment) {
                const result = await actions.updateRazorPayment(
                  orderRes?.id,
                  response.razorpay_payment_id,
                );

                if (result?.order_id) {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("cartid");
                  }
                  trackPurchase({
                    userId,
                    transactionId: String(result.order_id),
                    cart,
                    currency,
                    metaOverrides: { source: "fast_checkout" },
                  });
                  trackMetaPurchase(cart);

                  onPaymentSuccess?.();
                  setCart(null);
                  onClose();
                  router.replace(`/account/orders/${result.order_id}`);
                } else {
                  toast?.error?.(result?.serverError || "Failed to confirm payment");
                }
              }
            } catch (err: any) {
              console.error("Razorpay update error:", err);
              toast?.error?.(err?.message || "Failed to update payment");
            } finally {
              setIsPlacingOrder(false);
            }
          },
          prefill: {
            name: (auth?.user as any)?.name || auth?.user?.firstName || "",
            email: auth?.user?.email || "",
            contact: auth?.user?.phone || phone || "",
          },
          theme: { color: primaryColor },
          modal: {
            ondismiss: () => {
              setIsPlacingOrder(false);
            },
          },
        };

        try {
          const razorpay = new Razorpay(options);
          razorpay.on("payment.failed", (response: any) => {
            console.error("Razorpay payment failed:", response);
            toast?.error?.(response?.error?.description || "Payment failed");
            trackPaymentFailed({
              userId,
              cart,
              currency,
              errorCode: response?.error?.code ?? "",
              errorReason: response?.error?.description ?? "",
            });
            setIsPlacingOrder(false);
          });
          setIsPlacingOrder(false);
          razorpay.open();
        } catch (err: any) {
          console.error("Failed to open Razorpay modal:", err);
          toast?.error?.("Failed to open payment gateway");
          setIsPlacingOrder(false);
        }
        return;
      }

      // ── 3. Stripe Gateway ────────────────────────────────────────────────
      if (isStripeGateway) {
        toast?.info?.("Redirecting to Stripe checkout...");
        // Fallback or stripe modal
        onClose();
        router.push("/cart");
        return;
      }

      // Fallback
      toast?.error?.("No supported payment gateway configured");
      setIsPlacingOrder(false);
    } catch (err: any) {
      console.error("[FastCheckoutDrawer] handlePlaceOrder error:", err);
      toast?.error?.(err?.message || "Failed to process payment");
      setIsPlacingOrder(false);
    }
  };

  if (!shouldRender || !mounted) return null;

  const totalAmount = cart?.display_total
    ? formatCurrency(cart.display_total)
    : cart?.total
      ? formatCurrency(cart.total)
      : "—";

  const totalItems = cart?.line_items?.reduce(
    (sum: number, it: any) => sum + (it.quantity || 1),
    0,
  ) || 0;

  const modalContent = (
    <div
      className="fixed inset-0 z-[1000000] flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-[3px] overflow-hidden sm:overflow-y-auto"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 300ms ease-in-out",
        pointerEvents: isVisible ? "auto" : "none",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPlacingOrder) onClose();
      }}
    >
      <div
        className="relative w-full sm:max-w-[500px] h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[92dvh] bg-white rounded-none sm:rounded-2xl shadow-2xl overflow-hidden border-0 sm:border border-gray-100 flex flex-col"
        style={{
          transform: isVisible ? "translateY(0)" : "translateY(24px)",
          opacity: isVisible ? 1 : 0,
          transition: "transform 350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease-out",
          willChange: "transform, opacity",
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              ⚡
            </div>
            <div>
              <h3 className="font-[var(--font-bold,sans-serif)] text-[16px] text-gray-900 leading-tight">
                Quick Checkout
              </h3>
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                <span>🔒 100% Safe & Secure</span>
                <span>•</span>
                <span>Direct Gateway Pay</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsPlacingOrder(false);
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-gray-800">
          {/* Order Snapshot Pill */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200/60 text-xs">
            <span className="font-[var(--font-medium)] text-gray-600">
              Order Total ({totalItems} {totalItems === 1 ? "item" : "items"}):
            </span>
            <div className="text-right">
              <span
                className="font-[var(--font-bold)] text-sm block"
                style={{ color: primaryColor }}
              >
                {totalAmount}
              </span>
              {totalSavings > 0 && (
                <span className="text-[10px] text-emerald-600 font-bold block">
                  Savings of {formatCurrency(totalSavings)} applied
                </span>
              )}
            </div>
          </div>

          {/* ── Offers & Coupons Section (Bombay Shaving Co Style) ── */}
          <div className="p-3 bg-gray-50/90 border border-gray-200/90 rounded-xl shadow-xs">
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
                      {totalSavings > 0
                        ? `You save ${formatCurrency(totalSavings)}`
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
              /* Coupon Input Form */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  applyCouponByCode(couponCode);
                }}
                className="flex gap-2"
              >
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
                  Available offers:
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

          {/* ── STEP 1: CONTACT / AUTH ── */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-[var(--font-bold)] uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  1
                </span>
                Contact & Account
              </span>
              {isSignedIn && (
                <span className="text-emerald-600 text-[11px] font-[var(--font-bold)] flex items-center gap-1">
                  ✓ Verified
                </span>
              )}
            </div>

            {isSignedIn ? (
              <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-100 rounded-lg p-2.5 text-xs">
                <div>
                  <p className="font-[var(--font-bold)] text-emerald-950">
                    {(auth?.user as any)?.name || auth?.user?.firstName || "Customer"}
                  </p>
                  <p className="text-emerald-700">
                    {auth?.user?.phone || auth?.user?.email || "Phone verified"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    auth?.clearAuth?.();
                    setIsOtpSent(false);
                  }}
                  className="text-xs text-gray-500 underline hover:text-gray-800 cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : !isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <p className="text-xs text-gray-600">
                  Enter your mobile number to sign in and proceed with checkout.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={authLoading || phone.length < 10}
                    className="px-4 py-2 text-white text-xs font-bold rounded-lg transition-opacity disabled:opacity-50 cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {authLoading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    Enter code sent to +91 {phone}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="text-xs text-gray-500 underline hover:text-gray-800"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex justify-between gap-1.5">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`fast-otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const next = [...otp];
                        next[idx] = val;
                        setOtp(next);
                        if (val && idx < 5) {
                          const nextInput = document.getElementById(`fast-otp-${idx + 1}`);
                          nextInput?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                          const prevInput = document.getElementById(`fast-otp-${idx - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      className="w-10 h-11 text-center font-bold text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    disabled={resendTimer > 0 || authLoading}
                    onClick={() => handleSendOtp()}
                    className="text-xs text-gray-500 underline hover:text-gray-800 disabled:opacity-50 cursor-pointer"
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>
                  <button
                    type="submit"
                    disabled={authLoading || otp.join("").length < 4}
                    className="px-5 py-2 text-white text-xs font-bold rounded-lg transition-opacity disabled:opacity-50 cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {authLoading ? "Verifying..." : "Verify & Continue"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── STEP 2: DELIVERY & BILLING ADDRESS ── */}
          {isSignedIn && (
            <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-[var(--font-bold)] uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    2
                  </span>
                  Delivery & Billing Address
                </span>
              </div>

              {/* ── 2A: DELIVERY ADDRESS ── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-[var(--font-bold)] text-gray-800 flex items-center gap-1.5">
                    <span>📦 Delivery Address</span>
                  </span>
                  {showNewAddressForm !== "shipping" && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm("shipping")}
                      className="text-xs font-[var(--font-bold)] underline cursor-pointer hover:opacity-80"
                      style={{ color: primaryColor }}
                    >
                      + Add New Delivery
                    </button>
                  )}
                </div>

                {isAddressLoading ? (
                  <div className="py-4 flex justify-center">
                    <div
                      className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: primaryColor }}
                    />
                  </div>
                ) : showNewAddressForm === "shipping" ? (
                  <form onSubmit={(e) => handleSaveNewAddress(e, "shipping")} className="space-y-3 pt-1 bg-gray-50/70 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                      <span className="text-xs font-[var(--font-bold)] text-gray-800">New Delivery Address</span>
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowNewAddressForm(null)}
                          className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={newAddrName}
                        onChange={(e) => setNewAddrName(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                        required
                      />
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit Phone *"
                        value={newAddrPhone}
                        onChange={(e) => setNewAddrPhone(e.target.value.replace(/\D/g, ""))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="House / Flat / Street / Area *"
                      value={newAddrLine1}
                      onChange={(e) => setNewAddrLine1(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                      required
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Pincode *"
                        maxLength={6}
                        value={newAddrZipcode}
                        onChange={(e) => setNewAddrZipcode(e.target.value.replace(/\D/g, ""))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="City *"
                        value={newAddrCity}
                        onChange={(e) => setNewAddrCity(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        value={newAddrState}
                        onChange={(e) => setNewAddrState(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                        required
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowNewAddressForm(null)}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={addressSaving}
                        className="px-4 py-1.5 text-white text-xs font-bold rounded-lg transition-opacity disabled:opacity-50 cursor-pointer"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {addressSaving ? "Saving..." : "Save Delivery Address"}
                      </button>
                    </div>
                  </form>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-2.5">
                    <p className="text-xs text-gray-500 mb-2">No saved addresses found.</p>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm("shipping")}
                      className="px-3.5 py-1.5 text-white text-xs font-bold rounded-lg cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      + Add Delivery Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {addresses.map((addr) => {
                      const isSelected = String(shippingAddressId) === String(addr.id);
                      return (
                        <div
                          key={`shipping-${addr.id}`}
                          onClick={() => handleSelectShippingAddress(addr.id)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2 ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="delivery_address_selection"
                            checked={isSelected}
                            onChange={() => handleSelectShippingAddress(addr.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-[var(--font-bold)] text-gray-900 truncate">
                              {addr.name || addr.first_name || "Recipient"}
                              <span className="font-normal text-gray-500 ml-2">
                                {addr.phone || addr.mobile}
                              </span>
                            </p>
                            <p className="text-gray-600 line-clamp-1 mt-0.5 text-[11px]">
                              {addr.address_line_1 || addr.address1},{" "}
                              {addr.city}, {addr.state} - {addr.zipcode || addr.zip}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── 2B: SAME AS SHIPPING TOGGLE ── */}
              <div
                onClick={handleToggleSameAsShipping}
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-gray-50/80 hover:bg-gray-100/70 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={handleToggleSameAsShipping}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-[var(--font-medium)] text-gray-800">
                    Billing address is same as delivery address
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-500">
                  {sameAsShipping ? "✓ Same" : "Different"}
                </span>
              </div>

              {/* ── 2C: BILLING ADDRESS (WHEN DIFFERENT) ── */}
              {!sameAsShipping && (
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-[var(--font-bold)] text-gray-800 flex items-center gap-1.5">
                      <span>🧾 Billing Address</span>
                    </span>
                    {showNewAddressForm !== "billing" && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm("billing")}
                        className="text-xs font-[var(--font-bold)] underline cursor-pointer hover:opacity-80"
                        style={{ color: primaryColor }}
                      >
                        + Add New Billing
                      </button>
                    )}
                  </div>

                  {showNewAddressForm === "billing" ? (
                    <form onSubmit={(e) => handleSaveNewAddress(e, "billing")} className="space-y-3 pt-1 bg-gray-50/70 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                        <span className="text-xs font-[var(--font-bold)] text-gray-800">New Billing Address</span>
                        {addresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowNewAddressForm(null)}
                            className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={newAddrName}
                          onChange={(e) => setNewAddrName(e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                          required
                        />
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="10-digit Phone *"
                          value={newAddrPhone}
                          onChange={(e) => setNewAddrPhone(e.target.value.replace(/\D/g, ""))}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                          required
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="House / Flat / Street / Area *"
                        value={newAddrLine1}
                        onChange={(e) => setNewAddrLine1(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                        required
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Pincode *"
                          maxLength={6}
                          value={newAddrZipcode}
                          onChange={(e) => setNewAddrZipcode(e.target.value.replace(/\D/g, ""))}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                          required
                        />
                        <input
                          type="text"
                          placeholder="City *"
                          value={newAddrCity}
                          onChange={(e) => setNewAddrCity(e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                          required
                        />
                        <input
                          type="text"
                          placeholder="State *"
                          value={newAddrState}
                          onChange={(e) => setNewAddrState(e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                          required
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        {addresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowNewAddressForm(null)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={addressSaving}
                          className="px-4 py-1.5 text-white text-xs font-bold rounded-lg transition-opacity disabled:opacity-50 cursor-pointer"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {addressSaving ? "Saving..." : "Save Billing Address"}
                        </button>
                      </div>
                    </form>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-2.5">
                      <p className="text-xs text-gray-500 mb-2">No saved billing addresses.</p>
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm("billing")}
                        className="px-3.5 py-1.5 text-white text-xs font-bold rounded-lg cursor-pointer"
                        style={{ backgroundColor: primaryColor }}
                      >
                        + Add Billing Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {addresses.map((addr) => {
                        const isSelected = String(billingAddressId) === String(addr.id);
                        return (
                          <div
                            key={`billing-${addr.id}`}
                            onClick={() => handleSelectBillingAddress(addr.id)}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2 ${
                              isSelected
                                ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="billing_address_selection"
                              checked={isSelected}
                              onChange={() => handleSelectBillingAddress(addr.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-[var(--font-bold)] text-gray-900 truncate">
                                {addr.name || addr.first_name || "Recipient"}
                                <span className="font-normal text-gray-500 ml-2">
                                  {addr.phone || addr.mobile}
                                </span>
                              </p>
                              <p className="text-gray-600 line-clamp-1 mt-0.5 text-[11px]">
                                {addr.address_line_1 || addr.address1},{" "}
                                {addr.city}, {addr.state} - {addr.zipcode || addr.zip}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: PAYMENT GATEWAY ── */}
          {isSignedIn && shippingAddressId && (sameAsShipping || billingAddressId) && (
            <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
              <span className="text-xs font-[var(--font-bold)] uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-3">
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  3
                </span>
                Payment Method
              </span>

              <div className="p-3 bg-gray-50 border border-gray-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💳</span>
                    <div>
                      <p className="text-xs font-[var(--font-bold)] text-gray-900">
                        {paymentGatewayLabel} Secure Payment
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {isPhonePeGateway
                          ? "UPI (GPay, PhonePe, Paytm), Cards, NetBanking"
                          : isRazorpayGateway
                            ? "UPI, Cards, Wallets, NetBanking"
                            : "Direct Gateway Checkout"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Instant
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout CTA */}
        <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 z-20 space-y-2">
          <button
            onClick={handlePlaceOrder}
            disabled={
              !isSignedIn ||
              !shippingAddressId ||
              (!sameAsShipping && !billingAddressId) ||
              isPlacingOrder
            }
            className="w-full py-3.5 px-5 text-white rounded-xl font-[var(--font-bold)] text-sm flex items-center justify-between shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <span>
              {isPlacingOrder
                ? "Connecting to Payment..."
                : !isSignedIn
                  ? "Sign In to Complete Order"
                  : !shippingAddressId
                    ? "Select Delivery Address"
                    : !sameAsShipping && !billingAddressId
                      ? "Select Billing Address"
                      : `Pay ${totalAmount} via ${paymentGatewayLabel}`}
            </span>
            <span>
              {isPlacingOrder ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "→"
              )}
            </span>
          </button>

          {isPlacingOrder && (
            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={() => setIsPlacingOrder(false)}
                className="text-xs text-red-500 hover:text-red-700 underline font-medium cursor-pointer"
              >
                Cancel / Reopen Payment Window
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 pt-1">
            <span>🛡️ 256-bit Encryption</span>
            <span>•</span>
            <span>⚡ Instant Confirmation</span>
            <span>•</span>
            <span>🔒 Safe Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default FastCheckoutDrawer;
