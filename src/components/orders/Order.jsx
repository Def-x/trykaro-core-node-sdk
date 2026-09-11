"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ProductlistCard from "../cart/ProductlistCard";
import { EmptyState } from "../ui/EmptyState";
import { Spinner } from "../ui/Spinner";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import { useCore } from "../../context/CoreProvider";

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const OrderConfirmationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const fallbackToast = {
  error: (msg) => console.error(msg),
  success: (msg) => console.log(msg),
};

export const Order = (props) => {
  const params = useParams();
  const id = params?.orderid
  console.log({ id })
  const searchParams = useSearchParams();
  const router = useRouter();
  const { formatCurrency } = useCurrencyFormat();

  const show = searchParams.get("show") === "true";

  const { actions, config, orgData, toast = fallbackToast } = useCore();
  const orgDetail = orgData;
  const orgRaffles = []; // Raffles array placeholder

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFetchingInvoice, setIsFetchingInvoice] = useState(false);

  console.log({ data })
  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        if (!actions?.getOrderById) {
          throw new Error("getOrderById action is not available");
        }
        const orderData = await actions.getOrderById(id);
        console.log({ orderData })
        setData(orderData);
      } catch (err) {
        console.error("Failed to fetch order", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, actions, config?.storeId]);

  const { order_number, created_at, cart, order_type, state, order_status, payment_state, payment_status } = data || {};
  const {
    shipping_address,
    billing_address,
    line_items,
    display_total,
    display_item_total,
    display_ship_total,
    display_tax_total,
    discount_id,
    display_promo_total,
    promo_total,
    cart_detail_json,
  } = cart || {};

  const appliedDiscounts =
    cart?.cart_discounts || cart?.cart_detail_json?.discounts || [];

  const getDiscountAmount = (coupon) => {
    if (coupon?.display_discount_amount != null && coupon?.display_discount_amount !== "") {
      const num = Number(coupon.display_discount_amount);
      if (!isNaN(num)) return num;
    }
    if (coupon?.discount_amount != null) {
      return Number(coupon.discount_amount) / 100;
    }
    return null;
  };

  const hasPromoTotal =
    (display_promo_total !== undefined &&
      display_promo_total !== null &&
      Number(display_promo_total) > 0 &&
      display_promo_total !== "0.00" &&
      display_promo_total !== "0") ||
    (promo_total !== undefined &&
      promo_total !== null &&
      Number(promo_total) > 0);

  const promoTotalAmount =
    Number(display_promo_total) ||
    (promo_total ? Number(promo_total) / 100 : 0);

  const totalCalculatedDiscount = appliedDiscounts.reduce((sum, coupon) => {
    const amt = getDiscountAmount(coupon);
    return sum + (amt || 0);
  }, 0);

  const totalSavings = totalCalculatedDiscount > 0 ? totalCalculatedDiscount : promoTotalAmount;


  const fullShippingAddress = [
    shipping_address?.address1,
    shipping_address?.address2,
    shipping_address?.city,
    shipping_address?.state_name,
    shipping_address?.zipcode,
    shipping_address?.country_name,
  ]
    .filter(Boolean)
    .join(", ");

  const fullBillingAddress = [
    billing_address?.address1,
    billing_address?.address2,
    billing_address?.city,
    billing_address?.state_name,
    billing_address?.zipcode,
    billing_address?.country_name,
  ]
    .filter(Boolean)
    .join(", ");

  const storePickUpAddress =
    orgDetail?.organization_setting?.store_pickup_info?.store_pickup_address;

  const orderDate = created_at ? new Date(created_at).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) : "";

  const onDownloadReceipt = async () => {
    try {
      setIsFetchingInvoice(true);
      if (!actions?.getOrderInvoice) {
        throw new Error("getOrderInvoice action is not available");
      }
      const res = await actions.getOrderInvoice(id);

      if (res) {
        window.open(res, "_blank");
      }
    } catch (err) {
      console.error("Invoice download failed", err);
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setIsFetchingInvoice(false);
    }
  };

  return isLoading ? (
    <div className="flex justify-center py-20">
      <Spinner />
    </div>
  ) : isError ? (
    <div className="flex justify-center">
      <EmptyState title={"Order not found"} />
    </div>
  ) : (
    <div className="flex justify-center items-start mx-[16px] md:mx-[32px] mt-[100px] mb-[100px]">
      <div className="w-full overflow-hidden flex justify-center">
        <div className="flex flex-col md:flex-row flex-wrap gap-[15px] max-w-[1248px] w-full">
          {/* Left Section */}
          <div className="flex-1 flex flex-col gap-8">

            {/* Order Confirmation Banner */}
            {show && (
              <div
                className="flex items-start gap-3 p-4 rounded-lg border-l-4"
                style={{ borderColor: "var(--core-secondary)", background: "color-mix(in srgb, var(--core-secondary) 8%, white)" }}
              >
                <div className="mt-0.5 shrink-0" style={{ color: "var(--core-secondary)" }}>
                  <OrderConfirmationIcon />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-[var(--font-bold)] text-[16px] text-[var(--core-primary)] uppercase tracking-wide">
                    Thank you. Your order has been received
                  </p>
                  <p className="font-[var(--font-regular)] text-[13px] text-gray-500">
                    Order&nbsp;<span className="font-[var(--font-bold)] text-[var(--core-primary)]">#{order_number}</span> is confirmed and being processed.
                  </p>
                </div>
              </div>
            )}

            {/* Order Details Card */}
            <div>
              {/* Card Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-[var(--font-bold)] text-[18px] text-[var(--core-primary)] uppercase tracking-wider">
                  Order Details
                </h3>
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded font-[var(--font-bold)] text-[13px] text-white transition-opacity hover:opacity-85 disabled:opacity-60 cursor-pointer"
                  style={{ background: "var(--core-primary)" }}
                  onClick={onDownloadReceipt}
                  disabled={isFetchingInvoice}
                >
                  {isFetchingInvoice ? (
                    <Spinner />
                  ) : (
                    <>
                      Receipt <DownloadIcon />
                    </>
                  )}
                </button>
              </div>

              {/* Detail Grid */}
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: "color-mix(in srgb, var(--core-primary) 20%, #e8e5df)" }}>
                {/* Row 1 */}
                <div className="grid grid-cols-2 divide-x" style={{ divideColor: "color-mix(in srgb, var(--core-primary) 15%, #e8e5df)" }}>
                  <div className="p-4 flex flex-col gap-1">
                    <p className="text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest">Order Number</p>
                    <p className="font-[var(--font-bold)] text-[14px] text-[var(--core-primary)]">{order_number || "—"}</p>
                  </div>
                  <div className="p-4 flex flex-col gap-1">
                    <p className="text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest">Order Status</p>
                    <span
                      className="inline-flex self-start font-[var(--font-bold)] text-[12px] px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                      style={{
                        background: "color-mix(in srgb, var(--core-secondary) 15%, white)",
                        color: "var(--core-primary)",
                        border: "1px solid color-mix(in srgb, var(--core-secondary) 40%, white)"
                      }}
                    >
                      {order_status || "Processing"}
                    </span>
                  </div>
                </div>

                <div className="border-t" style={{ borderColor: "color-mix(in srgb, var(--core-primary) 12%, #e8e5df)" }} />

                {/* Row 2 */}
                <div className="grid grid-cols-2 divide-x" style={{ divideColor: "color-mix(in srgb, var(--core-primary) 15%, #e8e5df)" }}>
                  <div className="p-4 flex flex-col gap-1">
                    <p className="text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest">Order Date</p>
                    <p className="font-[var(--font-medium)] text-[14px] text-[var(--core-primary)]">{orderDate || "—"}</p>
                  </div>
                  <div className="p-4 flex flex-col gap-1">
                    <p className="text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest">Payment Status</p>
                    <p
                      className="font-[var(--font-bold)] text-[13px] uppercase"
                      style={{ color: payment_status === "paid" || payment_status === "received" ? "#16a34a" : "var(--core-secondary)" }}
                    >
                      {payment_status || "Pending"}
                    </p>
                  </div>
                </div>

                <div className="border-t" style={{ borderColor: "color-mix(in srgb, var(--core-primary) 12%, #e8e5df)" }} />

                {/* Address Row */}
                {order_type === "pickup" ? (
                  <div className="p-4 flex flex-col gap-1">
                    <p className="text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest">Pickup Address</p>
                    <p className="font-[var(--font-medium)] text-[14px] text-[var(--core-primary)]">{storePickUpAddress || "—"}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: "color-mix(in srgb, var(--core-primary) 12%, #e8e5df)" }}>
                    {/* Delivery Address */}
                    <div className="p-4 flex flex-col gap-2">
                      <p className="text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest">Delivery Address</p>
                      {shipping_address?.label && (
                        <span
                          className="self-start text-[10px] font-[var(--font-bold)] px-2 py-0.5 rounded-full uppercase tracking-widest"
                          style={{
                            background: "color-mix(in srgb, var(--core-primary) 10%, white)",
                            color: "var(--core-primary)",
                          }}
                        >
                          {shipping_address.label}
                        </span>
                      )}
                      <div className="flex flex-col gap-0.5">
                        <p className="font-[var(--font-bold)] text-[13px] text-[var(--core-primary)]">
                          {`${shipping_address?.firstname ?? ""} ${shipping_address?.lastname ?? ""}`.trim()}
                          {shipping_address?.phone && (
                            <span className="font-[var(--font-regular)] text-gray-500"> · {shipping_address.phone}</span>
                          )}
                        </p>
                        <p className="font-[var(--font-regular)] text-[13px] text-gray-500 leading-relaxed">{fullShippingAddress}</p>
                      </div>
                    </div>
                    {/* Billing Address */}
                    <div className="p-4 flex flex-col gap-2">
                      <p className="text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest">Billing Address</p>
                      {billing_address?.label && (
                        <span
                          className="self-start text-[10px] font-[var(--font-bold)] px-2 py-0.5 rounded-full uppercase tracking-widest"
                          style={{
                            background: "color-mix(in srgb, var(--core-primary) 10%, white)",
                            color: "var(--core-primary)",
                          }}
                        >
                          {billing_address.label}
                        </span>
                      )}
                      <div className="flex flex-col gap-0.5">
                        <p className="font-[var(--font-bold)] text-[13px] text-[var(--core-primary)]">
                          {`${billing_address?.firstname ?? ""} ${billing_address?.lastname ?? ""}`.trim()}
                          {billing_address?.phone && (
                            <span className="font-[var(--font-regular)] text-gray-500"> · {billing_address.phone}</span>
                          )}
                        </p>
                        <p className="font-[var(--font-regular)] text-[13px] text-gray-500 leading-relaxed">{fullBillingAddress}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              className="text-white py-3 hidden md:block transition cursor-pointer font-[var(--font-bold)] text-[14px] uppercase tracking-widest hover:opacity-85"
              style={{ background: "var(--core-primary)" }}
              onClick={() => router.push("/")}
            >
              Continue Shopping
            </button>
          </div>

          <div className="border border-[#e8e5df] hidden md:block" />

          {/* Right Section */}
          <div className="flex-1 flex flex-col gap-8 mt-[32px] md:mt-0">
            {/* Ordered Items */}
            <div>
              <h3 className="font-[var(--font-bold)] text-[18px] text-[var(--core-primary)] uppercase tracking-wider mb-6">
                Ordered Items ({line_items?.length || 0})
              </h3>
              <div className="flex flex-col gap-4">
                {line_items?.map((item, idx) => {
                  const orgRaffleId =
                    item?.line_itemable?.organization_raffle_id;

                  const associateRaffle = orgRaffles?.find(
                    (data) => data?.id === orgRaffleId,
                  );
                  return (
                    <ProductlistCard
                      product={item}
                      key={idx}
                      component="order"
                      raffleName={associateRaffle?.raffle_name}
                      orderType={order_type}
                    />
                  );
                })}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: "color-mix(in srgb, var(--core-primary) 20%, #e8e5df)" }}>
              <div className="px-4 py-3" style={{ background: "color-mix(in srgb, var(--core-primary) 6%, white)" }}>
                <h3 className="font-[var(--font-bold)] text-[15px] text-[var(--core-primary)] uppercase tracking-wider">
                  Bill Summary
                </h3>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-[var(--font-regular)] text-[14px] text-gray-500">Item Total</span>
                  <span className="font-[var(--font-medium)] text-[14px] text-[var(--core-primary)]">
                    {formatCurrency(display_item_total)}
                  </span>
                </div>
                {appliedDiscounts?.length > 0 ? (
                  appliedDiscounts.map((coupon, idx) => {
                    const amt =
                      getDiscountAmount(coupon) ??
                      (appliedDiscounts.length === 1 ? totalSavings : 0);
                    return (
                      <div
                        key={coupon?.id || coupon?.discount_id || coupon?.code || idx}
                        className="flex justify-between items-center text-[14px]"
                      >
                        <span className="font-[var(--font-medium)] text-[#FF6500] flex items-center gap-1.5 flex-wrap">
                          <span>Discount</span>
                          {coupon?.code && (
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-[#FF6500] border border-orange-200">
                              {coupon.code}
                            </span>
                          )}
                          {coupon?.display_action_value && (
                            <span className="text-xs text-[#FF6500]/90">
                              ({coupon.display_action_value})
                            </span>
                          )}
                        </span>
                        <span className="font-[var(--font-medium)] text-[#FF6500]">
                          -{formatCurrency(amt)}
                        </span>
                      </div>
                    );
                  })
                ) : hasPromoTotal ? (
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="font-[var(--font-medium)] text-[#FF6500]">
                      Discount
                    </span>
                    <span className="font-[var(--font-medium)] text-[#FF6500]">
                      -{formatCurrency(promoTotalAmount)}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between items-center">
                  <span className="font-[var(--font-regular)] text-[14px] text-gray-500">Tax</span>
                  <span className="font-[var(--font-medium)] text-[14px] text-[var(--core-primary)]">
                    {formatCurrency(display_tax_total)}
                  </span>
                </div>
                {order_type !== "pickup" && (
                  <div className="flex justify-between items-center">
                    <span className="font-[var(--font-regular)] text-[14px] text-gray-500">Shipping</span>
                    <span className="font-[var(--font-medium)] text-[14px] text-[var(--core-primary)]">
                      {display_ship_total === "0.00" || display_ship_total === 0 || display_ship_total === "0"
                        ? <span style={{ color: "#16a34a" }} className="font-[var(--font-bold)]">Free</span>
                        : formatCurrency(display_ship_total)}
                    </span>
                  </div>
                )}
                {/* Divider */}
                <div className="h-px my-1" style={{ background: "color-mix(in srgb, var(--core-secondary) 35%, #e8e5df)" }} />
                <div className="flex justify-between items-center">
                  <span className="font-[var(--font-bold)] text-[15px] text-[var(--core-primary)]">Total</span>
                  <span className="font-[var(--font-bold)] text-[17px] text-[var(--core-primary)]">
                    {formatCurrency(display_total)}
                  </span>
                </div>
                {totalSavings > 0 && (
                  <p className="text-[13px] font-[var(--font-bold)] text-[#16a34a] mt-[6px] text-right">
                    You save {formatCurrency(totalSavings)} on this order 🎉
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            className="text-white py-3 mt-8 block md:hidden transition cursor-pointer font-[var(--font-bold)] text-[14px] uppercase tracking-widest hover:opacity-85"
            style={{ background: "var(--core-primary)" }}
            onClick={() => router.push("/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Order;
