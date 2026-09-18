"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRazorpay } from "react-razorpay";
import { useCore } from "../../context/CoreProvider";
import { getPaymentGateway } from "../../gateways/registry";
import { AuthManager } from "../auth/AuthManager";
import {
  AddressFormInline,
  AddressSelection,
  AddressSelectionCard,
  AddressCard,
} from "./AddressComponents";
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
import { validateCartTotal } from "../../actions/storefrontActions";
import CartMismatchBanner from "./CartMismatchBanner";

// ─── Top-level Checkout ────────────────────────────────────────────────────────
const Checkout = ({ hasDeletedItems }) => {
  const { auth, config } = useCore();
  const { isSignedIn, isLoading } = auth || {};

  if (isLoading)
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--core-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return !isSignedIn ? (
    <LoginPage />
  ) : (
    <OrderInfo user={auth.user} hasDeletedItems={hasDeletedItems} />
  );
};

const LoginPage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-[var(--core-primary)]/5 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-[var(--core-primary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      <div className="w-full">
        <AuthManager />
      </div>
    </div>
  );
};

const OrderInfo = ({ user, hasDeletedItems }) => {
  const router = useRouter();
  const { Razorpay } = useRazorpay();
  const { cart, setCart, actions, config, auth, orgData, primaryColor, toast } =
    useCore();

  // ── Payment gateway detection ───────────────────────────────────────────
  // Region-based: activeRegion.payment_gateway + activeRegion.payment_config
  // Fallback: orgData.organization_setting.payment
  const activeRegion = config?.activeRegion ?? config?.region ?? null;

  const orgPaymentConfig = orgData?.organization_setting?.payment ?? {};
  // Region payment_config holds: stripe_publishable_key, razor_pay_key_id, etc.
  const regionPaymentConfig = activeRegion?.payment_config ?? null;
  const paymentConfig = regionPaymentConfig ?? orgPaymentConfig;

  // payment_gateway is a top-level field on the region object (not inside payment_config)
  const rawPaymentGateway =
    activeRegion?.payment_gateway || // ← primary: region.payment_gateway
    orgPaymentConfig?.mode ||
    orgPaymentConfig?.gateway ||
    "";

  const paymentGateway = String(rawPaymentGateway || "razorpay").toLowerCase();
  const isStripeGateway = paymentGateway === "stripe";

  // Credentials from region's payment_config, fallback to org
  const stripePublishableKey =
    paymentConfig?.stripe_publishable_key ??
    orgPaymentConfig?.stripe_publishable_key ??
    "";
  const razorpayKeyId =
    paymentConfig?.razor_pay_key_id ?? orgPaymentConfig?.razor_pay_key_id ?? "";
  const paymentGatewayLabel = paymentGateway
    ? paymentGateway.charAt(0).toUpperCase() +
      paymentGateway.slice(1).replace(/_/g, " ")
    : "Razorpay";

  // Load Stripe eagerly at mount so it's ready when the user clicks Checkout.
  // Must wrap in () => to prevent React treating the component fn as a state updater.
  const [StripeCheckout, setStripeCheckout] = useState(() =>
    getPaymentGateway("stripe"),
  );

  const [showStripeForm, setShowStripeForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Cart price-mismatch guard state — set when a coupon expires at pay-time
  const [cartMismatch, setCartMismatch] = useState(null);

  // Load Stripe module if not already in registry.
  // Runs eagerly at mount so the form is ready the instant the user clicks Checkout.
  useEffect(() => {
    let isMounted = true;

    const loadStripeGateway = async () => {
      try {
        await import("../../stripe");
        if (isMounted) {
          setStripeCheckout(() => getPaymentGateway("stripe"));
        }
      } catch (error) {
        console.error("[Checkout] Failed to load Stripe gateway:", error);
      }
    };

    // If already cached in registry, grab it immediately
    const cached = getPaymentGateway("stripe");
    if (cached) {
      setStripeCheckout(() => cached);
    } else {
      loadStripeGateway();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCartHaveBillingAddress = !!cart?.billing_address;
  const isCarthaveShippingAddress = !!cart?.shipping_address;

  const [orderType, setOrderType] = useState(cart?.order_type ?? "delivery");
  const [sameAsShipping, setSameAsShipping] = useState(
    cart?.billing_address?.id === cart?.shipping_address?.id,
  );
  const [selectedAddress, setSelectedAddress] = useState({
    shippingAddressId: cart?.shipping_address?.id ?? null,
    billingAddressId: cart?.billing_address?.id ?? null,
  });
  const { shippingAddressId, billingAddressId } = selectedAddress;

  // Fetch addresses using getUserAddress action
  const fetchAddresses = useCallback(async () => {
    try {
      setIsAddressLoading(true);
      if (actions?.getUserAddress && auth?.isSignedIn) {
        const data = await actions.getUserAddress();
        setAddresses(Array.isArray(data) ? data : [data]);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
      setAddresses([]);
    } finally {
      setIsAddressLoading(false);
    }
  }, [actions, auth?.isSignedIn]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    setOrderType(cart?.order_type ?? "delivery");

    const hasShipping = !!cart?.shipping_address?.id;
    const hasBilling = !!cart?.billing_address?.id;
    const defaultAddressId = addresses?.[0]?.id;

    const shippingId = cart?.shipping_address?.id ?? defaultAddressId;
    const billingId = cart?.billing_address?.id ?? defaultAddressId;

    setSelectedAddress({
      shippingAddressId: shippingId,
      billingAddressId: billingId,
    });
    setSameAsShipping(billingId === shippingId);

    // Auto-update cart if it's missing addresses and we have a default address
    if (
      (!hasShipping || !hasBilling) &&
      defaultAddressId &&
      cart?.id &&
      actions?.updateCart
    ) {
      const apiData = { id: cart.id };
      if (!hasShipping) apiData.shipping_address_id = defaultAddressId;
      if (!hasBilling) apiData.billing_address_id = defaultAddressId;

      actions
        .updateCart(cart.id, apiData)
        .then((updatedCart) => {
          if (updatedCart) setCart(updatedCart);
        })
        .catch((err) =>
          console.error("Failed to auto-set cart addresses:", err),
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cart?.shipping_address?.id,
    cart?.billing_address?.id,
    addresses?.length,
  ]);

  const onUpdateOrderType = async (type) => {
    try {
      setOrderType(type);
      if (actions?.updateCart && cart?.id) {
        await actions.updateCart(cart.id, {
          id: cart.id,
          order_type: type,
        });
        setCart((prev) => ({ ...prev, order_type: type }));
      }
    } catch (err) {
      console.error("Failed to update order type:", err);
      const errorMsg = err?.data?.error || err?.message;
      if (errorMsg && typeof errorMsg === "string") {
        toast?.error?.(errorMsg);
      } else {
        toast?.error?.("Failed to update order type");
      }
    }
  };

  const onRazorPayHandler = (res) => {
    // Normalize user info for Razorpay prefill
    const isClerk = config?.authType === "clerk";
    const name = isClerk
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
      : user?.name || user?.first_name || "";
    const email = isClerk
      ? user?.primaryEmailAddress?.emailAddress
      : user?.email;
    const contact = isClerk
      ? user?.primaryPhoneNumber?.phoneNumber
      : user?.phone || user?.mobile;

    const options = {
      key: razorpayKeyId,
      amount: res?.cart?.total / 100,
      currency: "INR",
      name: "Store",
      description: "Order Payment",
      order_id: res?.razor_order_id,
      handler: async (response) => {
        try {
          setIsProcessingPayment(true);

          const MAX_ATTEMPTS = 5;
          const RETRY_DELAY_MS = 1000;
          let order = null;
          let lastError = null;

          for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
              if (actions?.updateRazorPayment) {
                const result = await actions.updateRazorPayment(
                  res?.id,
                  response.razorpay_payment_id,
                );

                // updateRazorPayment may return {serverError} instead of throwing
                if (result?.serverError) {
                  lastError = result.serverError;
                  console.warn(
                    `[Checkout] updateRazorPayment attempt ${attempt} failed:`,
                    result.serverError,
                  );
                } else if (result?.order_id) {
                  order = result;
                  break; // success — stop retrying
                } else {
                  lastError = "Payment update returned no order ID";
                  console.warn(
                    `[Checkout] updateRazorPayment attempt ${attempt}: no order_id`,
                    result,
                  );
                }
              }
            } catch (err) {
              lastError =
                err?.data?.error || err?.message || "Payment update failed";
              console.error(
                `[Checkout] updateRazorPayment attempt ${attempt} threw:`,
                err,
              );
            }

            if (attempt < MAX_ATTEMPTS) {
              await new Promise((resolve) =>
                setTimeout(resolve, RETRY_DELAY_MS),
              );
            }
          }

          if (order?.order_id) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("cartid");
            }

            // ── GA4 purchase (fires only after payment is fully captured) ─
            // auth.userId is always the decoded JWT sub set by Coreproviders.js
            const userId = auth?.userId ?? auth?.user?.id ?? user?.id ?? null;
            const currency = config?.currency ?? "INR";
            trackPurchase({
              userId,
              transactionId: String(order.order_id),
              cart,
              currency,
              metaOverrides: { source: "checkout" },
            });
            // ── Meta Pixel ──
            trackMetaPurchase(cart);
            // ─────────────────────────────────────────────────────────────

            setCart(null);
            router.push(`/account/orders/${order?.order_id}`);
          } else {
            // All 5 attempts failed — stop showing the processing screen
            setIsProcessingPayment(false);
            const msg =
              typeof lastError === "string"
                ? lastError
                : "Payment could not be updated. Please contact support.";
            toast?.error?.(msg);
          }
        } catch (err) {
          console.error("Payment handler error:", err);
          setIsProcessingPayment(false);
          const errorMsg = err?.data?.error || err?.message;
          if (errorMsg && typeof errorMsg === "string") {
            toast?.error?.(errorMsg);
          } else {
            toast?.error?.(
              "Payment could not be updated. Please contact support.",
            );
          }
        }
      },
      prefill: {
        name,
        email,
        contact,
      },
      theme: { color: primaryColor },
    };

    const razorpay = new Razorpay(options);
    razorpay.on("payment.failed", (response) => {
      console.error("Razorpay payment failed:", response);
      toast?.error?.(response?.error?.description || "Payment failed");

      // ── GA4 via GTM ────────────────────────────────────────────────
      const userId = auth?.userId ?? auth?.user?.id ?? user?.id ?? null;
      const currency = config?.currency ?? "INR";
      trackPaymentFailed({
        userId,
        cart,
        currency,
        errorCode: response?.error?.code ?? "",
        errorReason:
          response?.error?.reason ?? response?.error?.description ?? "",
      });
      // ───────────────────────────────────────────────────────────────
    });
    razorpay.open();
  };

  const onPlaceOrder = async () => {
    if (hasDeletedItems || !cart?.id) return;

    // ── Pre-payment cart validation ──────────────────────────────────────────
    // Fetch the latest cart from the server and compare totals.
    // This catches the race condition where a coupon expires between the user
    // viewing the cart and clicking Pay (e.g. expires at 6:00 PM, click at 5:59:59).
    const clientTotal = Number(cart?.total ?? cart?.display_total ?? 0);
    const validation = await validateCartTotal(cart.id, clientTotal, {
      apiBaseUrl: config?.apiBaseUrl,
      orgId: config?.storeId,
    });

    if (!validation.valid && validation.reason === "price_mismatch") {
      setCartMismatch({
        serverTotal: validation.serverTotal,
        clientTotal: validation.clientTotal,
        cart: validation.cart,
      });
      toast?.error?.(
        "Your cart total has changed — a coupon or offer has expired. Please refresh and try again.",
      );
      return; // abort — do NOT open any payment gateway
    }
    // ─────────────────────────────────────────────────────────────────────────

    if (isStripeGateway) {
      setShowStripeForm(true);
      return;
    }

    try {
      setIsPlacingOrder(true);
      if (actions?.createRazorOrder) {
        const orderResponse = await actions.createRazorOrder(cart.id);

        // ── GA4 checkout funnel steps ────────────────────────────────────
        // auth.userId is always the decoded JWT sub set by Coreproviders.js
        const userId = auth?.userId ?? auth?.user?.id ?? user?.id ?? null;
        const currency = config?.currency ?? "INR";

        // Step 1: begin_checkout
        trackBeginCheckout({
          userId,
          cart,
          currency,
          transactionId: String(orderResponse?.id ?? ""),
          metaOverrides: { source: "checkout" },
        });
        trackMetaInitiateCheckout(cart);

        // Step 2: add_shipping_info (address already set on cart at this point)
        trackAddShippingInfo({
          userId,
          cart,
          shippingTier: orderType === "pickup" ? "Pickup" : "Standard",
          currency,
          metaOverrides: { source: "checkout" },
        });

        // Step 3: add_payment_info (Razorpay selected)
        trackAddPaymentInfo({
          userId,
          cart,
          paymentType: paymentGatewayLabel,
          currency,
          metaOverrides: { source: "checkout" },
        });
        trackMetaAddPaymentInfo(cart);
        // ─────────────────────────────────────────────────────────────────

        onRazorPayHandler(orderResponse);
      }
    } catch (err) {
      console.error("Failed to create order:", err);
      const errorMsg = err?.data?.error || err?.message;
      if (errorMsg && typeof errorMsg === "string") {
        toast?.error?.(errorMsg);
      } else {
        toast?.error?.("Failed to process payment");
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div>
      {/* ── CART MISMATCH BANNER (coupon expired at pay-time) ── */}
      {cartMismatch && (
        <CartMismatchBanner
          serverTotal={cartMismatch.serverTotal}
          clientTotal={cartMismatch.clientTotal}
          freshCart={cartMismatch.cart}
          currency={config?.currency ?? "INR"}
          onDismiss={() => setCartMismatch(null)}
        />
      )}

      {/* ── ORDER TYPE ── */}
      <h1 className="font-[var(--font-medium)] text-[20px] text-[var(--main)] leading-[24px]">
        ORDER TYPE
      </h1>
      <div className="mt-[16px] flex flex-col gap-y-[16px]">
        <AddressCard
          onClick={() => onUpdateOrderType("delivery")}
          isSelected={orderType === "delivery"}
          addressType="Delivery"
          address="Get your order delivered to your address at ease"
          type="delivery"
        />
      </div>

      {/* ── ADDRESS SELECTION ── */}
      {orderType !== "pickup" && (
        <div className="mt-[32px]">
          {isAddressLoading ? (
            <div className="flex items-center gap-2 text-[var(--secondary)] text-sm font-[var(--font-regular)]">
              <div className="w-4 h-4 border-2 border-[var(--core-primary)] border-t-transparent rounded-full animate-spin" />
              Loading addresses…
            </div>
          ) : addresses.length > 0 ? (
            <AddressSelection
              address={addresses}
              cart={cart}
              setCart={setCart}
              user={user}
              refetch={fetchAddresses}
              sameAsShipping={sameAsShipping}
              setSameAsShipping={setSameAsShipping}
              shippingAddressId={shippingAddressId}
              billingAddressId={billingAddressId}
              setSelectedAddress={setSelectedAddress}
              isCartHaveBillingAddress={isCartHaveBillingAddress}
              isCarthaveShippingAddress={isCarthaveShippingAddress}
            />
          ) : (
            <AddressFormInline refetch={fetchAddresses} />
          )}
        </div>
      )}

      {/* ── PAYMENT ── */}
      <div className="mt-[32px]">
        <h1 className="font-[var(--font-medium)] text-[20px] text-[var(--main)]">
          PAYMENT
        </h1>
        <p className="font-[var(--font-regular)] text-[14px] text-[var(--secondary)]">
          All transactions are secure and encrypted.
        </p>
        <div className="mt-[16px]">
          {isStripeGateway ? (
            <>
              <AddressCard
                addressType={`Pay with ${paymentGatewayLabel}`}
                address="Enter your card details securely via Stripe to complete your payment."
                type="stripe"
                paymentLabel={paymentGatewayLabel}
              />
              {showStripeForm && stripePublishableKey && StripeCheckout && (
                <div className="mt-4">
                  <StripeCheckout
                    cartId={cart?.id}
                    publishableKey={stripePublishableKey}
                    createStripePaymentIntent={
                      actions?.createStripePaymentIntent
                        ? async (cartId) => {
                            // Guard: validate cart total before creating payment intent.
                            // Critical for Stripe — the intent is created with a fixed amount.
                            // If a coupon expired, the intent would charge the wrong amount.
                            const clientTotal = Number(
                              cart?.total ?? cart?.display_total ?? 0,
                            );
                            const validation = await validateCartTotal(
                              cartId,
                              clientTotal,
                              {
                                apiBaseUrl: config?.apiBaseUrl,
                                orgId: config?.storeId,
                              },
                            );
                            if (
                              !validation.valid &&
                              validation.reason === "price_mismatch"
                            ) {
                              setCartMismatch({
                                serverTotal: validation.serverTotal,
                                clientTotal: validation.clientTotal,
                                cart: validation.cart,
                              });
                              setShowStripeForm(false); // hide the Stripe form
                              throw new Error(
                                "Your cart total has changed — a coupon or offer has expired. Please refresh and try again.",
                              );
                            }
                            return actions.createStripePaymentIntent(cartId);
                          }
                        : undefined
                    }
                    amount={cart?.display_total ?? ""}
                    currency={config?.currency ?? "INR"}
                    onSuccess={async () => {
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("cartid");
                      }
                      // After Stripe payment, fetch the updated cart —
                      // the backend sets order_id on the cart once payment is processed.
                      try {
                        const regionId = config?.regionId ?? null;
                        const updatedCart = await actions?.getCart?.(regionId);
                        const cartData = Array.isArray(updatedCart)
                          ? updatedCart[0]
                          : updatedCart;

                        console.log({ regionId, updatedCart, cartData });
                        const orderId = cartData?.order_id;
                        setCart(null);
                        if (orderId) {
                          router.push(`/account/orders/${orderId}`);
                        } else {
                          router.push("/account/orders");
                        }
                      } catch {
                        setCart(null);
                        router.push("/account/orders");
                      }
                    }}
                  />
                </div>
              )}
              {showStripeForm && !StripeCheckout && (
                <p className="mt-4 text-sm text-red-500 p-3 bg-red-50 rounded-lg">
                  StripeCheckout component is not configured. Pass it via{" "}
                  <code className="font-mono">
                    CoreProvider components={{ StripeCheckout }}
                  </code>
                  .
                </p>
              )}
            </>
          ) : (
            <AddressCard
              addressType={`Pay with ${paymentGatewayLabel}`}
              address={`Once you click Checkout, you'll be redirected to a secure ${paymentGatewayLabel} payment window to complete your payment.`}
              type="stripe"
              paymentLabel={paymentGatewayLabel}
            />
          )}
        </div>
      </div>

      {/* ── CHECKOUT BUTTON ── */}
      {!(isStripeGateway && showStripeForm) && (
        <div className="mt-[32px]">
          <button
            onClick={onPlaceOrder}
            disabled={hasDeletedItems || isPlacingOrder || isAddressLoading}
            className={`px-5 py-3 w-full rounded-lg cursor-pointer font-[var(--font-medium)] text-[15px] transition-all duration-300 ${
              hasDeletedItems || isPlacingOrder || isAddressLoading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-[var(--core-primary)] text-white hover:opacity-90 hover:shadow-lg transform active:scale-[0.98]"
            }`}
          >
            {isPlacingOrder
              ? "Processing…"
              : hasDeletedItems
                ? "Remove Deleted Items to Checkout"
                : isStripeGateway
                  ? "Proceed to Card Payment"
                  : "Checkout"}
          </button>

          {/* Policy Links */}
          <div className="mt-4 text-center">
            <p className="text-[11px] text-[#8c92a4] font-[var(--font-regular)] leading-relaxed">
              By placing your order, you agree to our{" "}
              <Link
                href={config?.termsUrl || "/term-conditions"}
                prefetch={false}
                className="text-[var(--core-primary)] underline hover:text-[var(--core-secondary)] transition-colors"
              >
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link
                href={config?.privacyUrl || "/privacy-policy"}
                prefetch={false}
                className="text-[var(--core-primary)] underline hover:text-[var(--core-secondary)] transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <div className="mt-2 flex justify-center gap-3">
              <Link
                href={
                  config?.refundUrl || config?.returnUrl || "/return-policy"
                }
                prefetch={false}
                className="text-[10px] text-[#8c92a4] hover:text-[var(--core-primary)] transition-colors underline uppercase tracking-wider"
              >
                Refund Policy
              </Link>
            </div>
          </div>

          {hasDeletedItems && (
            <p className="text-xs text-red-600 mt-2 font-[var(--font-regular)]">
              Please remove unavailable items before proceeding to checkout.
            </p>
          )}
        </div>
      )}

      {/* ── PAYMENT PROCESSING OVERLAY ── */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-fadeIn">
          <div className="flex flex-col items-center gap-8 max-w-md w-full px-6">
            <div className="relative">
              <div className="w-24 h-24 border-[3px] border-[var(--core-primary)]/5 rounded-full"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-[3px] border-[var(--core-secondary)] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-[var(--core-primary)] rounded-full animate-pulse shadow-[0_0_15px_rgba(0,33,76,0.3)]"></div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="space-y-1">
                <h2 className="font-serif italic text-3xl text-[var(--core-primary)] tracking-tight">
                  Processing your payment
                </h2>
                <div className="w-12 h-[1px] bg-[var(--core-secondary)] mx-auto opacity-50"></div>
              </div>

              <div className="space-y-2">
                <p className="font-[var(--font-medium)] text-[#2d2d2d] text-base">
                  We're finalizing your order with {paymentGatewayLabel}.
                </p>
                <p className="font-[var(--font-regular)] text-[#8c92a4] text-sm leading-relaxed">
                  Please do not refresh the page or close this window. <br />
                  This will only take a moment.
                </p>
              </div>
            </div>

            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-[var(--core-secondary)] rounded-full opacity-20 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
