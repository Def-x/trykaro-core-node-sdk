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

// ─── Top-level Checkout ────────────────────────────────────────────────────────
const Checkout = ({ hasDeletedItems }) => {
  const { auth, config } = useCore();
  const { isSignedIn, isLoading } = auth || {};

  if (isLoading) return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#00214c] border-t-transparent rounded-full animate-spin" />
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
        <div className="w-16 h-16 bg-[#00214c]/5 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-[#00214c]"
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
  const { cart, setCart, actions, config, auth, orgData } = useCore();

  // Read StripeCheckout from the gateway registry.
  const StripeCheckout = getPaymentGateway("stripe");

  // ── Payment gateway config derived from orgData ──────────────────────
  const paymentConfig = orgData?.organization_setting?.payment ?? {};
  const paymentMode = paymentConfig?.mode ?? "razorpay";
  const razorpayKeyId = paymentConfig?.razor_pay_key_id ?? "";
  const stripePublishableKey = paymentConfig?.stripe_publishable_key ?? "";

  const [showStripeForm, setShowStripeForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
    const shippingId = cart?.shipping_address?.id ?? addresses?.[0]?.id;
    const billingId = cart?.billing_address?.id ?? addresses?.[0]?.id;
    setSelectedAddress({
      shippingAddressId: shippingId,
      billingAddressId: billingId,
    });
    setSameAsShipping(billingId === shippingId);
  }, [cart, addresses]);

  const onUpdateOrderType = async (type) => {
    try {
      setOrderType(type);
      if (actions?.updateCart && cart?.id) {
        await actions.updateCart({
          id: cart.id,
          order_type: type,
        });
        setCart((prev) => ({ ...prev, order_type: type }));
      }
    } catch (err) {
      console.error("Failed to update order type:", err);
    }
  };

  const onRazorPayHandler = (res) => {
    // Normalize user info for Razorpay prefill
    const isClerk = config?.authType === "clerk";
    const name = isClerk 
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
      : (user?.name || user?.first_name || "");
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
          let order;
          if (actions?.updateRazorPayment) {
            order = await actions.updateRazorPayment(
              res?.id,
              response.razorpay_payment_id,
            );
          }
          if (order?.order_id) {
            router.push(`/order/${order?.order_id}?show=true`);
          }
        } catch (err) {
          console.error("Payment update failed:", err);
          setIsProcessingPayment(false);
        }
      },
      prefill: {
        name,
        email,
        contact,
      },
      theme: { color: "#1e1e1e" },
    };

    const razorpay = new Razorpay(options);
    razorpay.on("payment.failed", (response) => {
      console.error("Razorpay payment failed:", response);
    });
    razorpay.open();
  };

  const onPlaceOrder = async () => {
    if (hasDeletedItems || !cart?.id) return;

    if (paymentMode === "stripe") {
      setShowStripeForm(true);
      return;
    }

    try {
      setIsPlacingOrder(true);
      if (actions?.createRazorOrder) {
        const orderResponse = await actions.createRazorOrder(cart.id);
        onRazorPayHandler(orderResponse);
      }
    } catch (err) {
      console.error("Failed to create order:", err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div>
      {/* ── ORDER TYPE ── */}
      <h1 className="font-[Nunito-medium] text-[20px] text-[var(--main)] leading-[24px]">
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
            <div className="flex items-center gap-2 text-[var(--secondary)] text-sm font-[Nunito-regular]">
              <div className="w-4 h-4 border-2 border-[var(--main)] border-t-transparent rounded-full animate-spin" />
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
        <h1 className="font-[Nunito-medium] text-[20px] text-[var(--main)]">
          PAYMENT
        </h1>
        <p className="font-[Nunito-regular] text-[14px] text-[var(--secondary)]">
          All transactions are secure and encrypted.
        </p>
        <div className="mt-[16px]">
          {paymentMode === "stripe" ? (
            <>
              <AddressCard
                addressType="Pay with Stripe"
                address="Enter your card details securely via Stripe to complete your payment."
                type="stripe"
              />
              {showStripeForm && stripePublishableKey && StripeCheckout && (
                <div className="mt-4">
                  <StripeCheckout
                    cartId={cart?.id}
                    publishableKey={stripePublishableKey}
                    createStripePaymentIntent={actions?.createStripePaymentIntent}
                    onSuccess={() => {
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("cartid");
                      }
                      setCart(null);
                      router.push("/account/orders");
                    }}
                  />
                </div>
              )}
              {showStripeForm && !StripeCheckout && (
                <p className="mt-4 text-sm text-red-500 p-3 bg-red-50 rounded-lg">
                  StripeCheckout component is not configured. Pass it via{" "}
                  <code className="font-mono">CoreProvider components={{ StripeCheckout }}</code>.
                </p>
              )}
            </>
          ) : (
            <AddressCard
              addressType="Pay with Razorpay"
              address="Once you click Checkout, you'll be redirected to a secure Razorpay payment window to complete your payment."
              type="stripe"
            />
          )}
        </div>
      </div>

      {/* ── CHECKOUT BUTTON ── */}
      {!(paymentMode === "stripe" && showStripeForm) && (
      <div className="mt-[32px]">
        <button
          onClick={onPlaceOrder}
          disabled={hasDeletedItems || isPlacingOrder || isAddressLoading}
          className={`px-5 py-3 w-full rounded-lg cursor-pointer font-[Nunito-medium] text-[15px] transition-all duration-300 ${hasDeletedItems || isPlacingOrder || isAddressLoading
            ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            : "bg-[#00214c] text-white hover:bg-[#000] hover:shadow-lg transform active:scale-[0.98]"
            }`}
        >
          {isPlacingOrder
            ? "Processing…"
            : hasDeletedItems
              ? "Remove Deleted Items to Checkout"
              : paymentMode === "stripe"
                ? "Proceed to Card Payment"
                : "Checkout"}
        </button>

        {/* Policy Links */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-[#8c92a4] font-[Nunito-regular] leading-relaxed">
            By placing your order, you agree to our{" "}
            <Link
              href="/terms-and-conditions"
              className="text-[#00214c] underline hover:text-[#c8a95a] transition-colors"
            >
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="text-[#00214c] underline hover:text-[#c8a95a] transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-2 flex justify-center gap-3">
            <Link
              href="/refund-policy"
              className="text-[10px] text-[#8c92a4] hover:text-[#00214c] transition-colors underline uppercase tracking-wider"
            >
              Refund Policy
            </Link>
          </div>
        </div>

        {hasDeletedItems && (
          <p className="text-xs text-red-600 mt-2 font-[Nunito-regular]">
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
              <div className="w-24 h-24 border-[3px] border-[#00214c]/5 rounded-full"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-[3px] border-[#c8a95a] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-[#00214c] rounded-full animate-pulse shadow-[0_0_15px_rgba(0,33,76,0.3)]"></div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="space-y-1">
                <h2 className="font-serif italic text-3xl text-[#00214c] tracking-tight">
                  Processing your payment
                </h2>
                <div className="w-12 h-[1px] bg-[#c8a95a] mx-auto opacity-50"></div>
              </div>

              <div className="space-y-2">
                <p className="font-[Nunito-medium] text-[#2d2d2d] text-base">
                  We're finalizing your order with {paymentMode === "stripe" ? "Stripe" : "Razorpay"}.
                </p>
                <p className="font-[Nunito-regular] text-[#8c92a4] text-sm leading-relaxed">
                  Please do not refresh the page or close this window. <br />
                  This will only take a moment.
                </p>
              </div>
            </div>

            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-[#c8a95a] rounded-full opacity-20 animate-pulse"
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
