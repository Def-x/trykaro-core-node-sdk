"use client";

import React, { useState, useEffect } from "react";
import ProductlistCard from "../cart/ProductlistCard";
import { EmptyState } from "../ui/EmptyState";
import { Spinner } from "../ui/Spinner";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import { useCore } from "../../context/CoreProvider";
import { useStorefrontRouter } from "../../utils/navigation";

const DownloadIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const OrderConfirmationIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const fallbackToast = {
  error: (msg: string) => console.error(msg),
  success: (msg: string) => console.log(msg),
};

export interface OrderProps {
  orderId?: string | number;
  id?: string | number;
  show?: boolean;
  router?: any;
  params?: any;
  searchParams?: any;
  [key: string]: any;
}

export const Order: React.FC<OrderProps> = (props) => {
  const router = useStorefrontRouter(props?.router);
  const id =
    props?.orderId ??
    props?.id ??
    props?.params?.orderid ??
    (typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean).pop()
      : null);

  const show =
    props?.show !== undefined
      ? Boolean(props.show)
      : typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("show") === "true"
        : false;

  const { formatCurrency } = useCurrencyFormat();
  const { actions, config, orgData, toast = fallbackToast } = useCore();
  const orgDetail = orgData;
  const orgRaffles: any[] = [];

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFetchingInvoice, setIsFetchingInvoice] = useState(false);

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

  const {
    order_number,
    created_at,
    cart,
    order_type,
    state,
    order_status,
    payment_state,
    payment_status,
  } = data || {};
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

  const appliedDiscounts: any[] =
    cart?.cart_discounts || cart?.cart_detail_json?.discounts || [];

  const getDiscountAmount = (coupon: any) => {
    if (
      coupon?.display_discount_amount != null &&
      coupon?.display_discount_amount !== ""
    ) {
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

  const totalSavings =
    totalCalculatedDiscount > 0 ? totalCalculatedDiscount : promoTotalAmount;

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

  const orderDate = created_at
    ? new Date(created_at).toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

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
                style={{
                  borderColor: "var(--core-secondary)",
                  background:
                    "color-mix(in srgb, var(--core-secondary) 8%, white)",
                }}
              >
                <div
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--core-secondary)" }}
                >
                  <OrderConfirmationIcon />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-[var(--font-bold)] text-[16px] text-[var(--core-primary)] uppercase tracking-wide">
                    Thank you. Your order has been received
                  </p>
                  <p className="font-[var(--font-regular)] text-[13px] text-gray-500">
                    Order&nbsp;
                    <span className="font-[var(--font-bold)] text-[var(--core-primary)]">
                      #{order_number}
                    </span>{" "}
                    is confirmed and being processed.
                  </p>
                </div>
              </div>
            )}

            {/* Order Status Card */}
            <div className="border border-[#e8e5df] rounded-lg p-6 bg-white flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest block mb-1">
                    Order Reference
                  </span>
                  <h2 className="font-[var(--font-bold)] text-[22px] text-[var(--core-primary)]">
                    #{order_number || id}
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-[var(--font-bold)] uppercase tracking-wider"
                    style={{
                      background:
                        "color-mix(in srgb, var(--core-primary) 10%, white)",
                      color: "var(--core-primary)",
                    }}
                  >
                    {order_status || state || "Placed"}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-[var(--font-medium)] uppercase tracking-wider ${
                      payment_state === "paid" || payment_status === "paid"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    Payment: {payment_state || payment_status || "Pending"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#e8e5df] pt-4">
                <div>
                  <span className="text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest block">
                    Placed On
                  </span>
                  <span className="font-[var(--font-medium)] text-[14px] text-[var(--core-primary)]">
                    {orderDate}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest block">
                    Fulfillment
                  </span>
                  <span className="font-[var(--font-medium)] text-[14px] text-[var(--core-primary)] capitalize">
                    {order_type || "Delivery"}
                  </span>
                </div>
              </div>

              {/* Invoice Download Button */}
              {actions?.getOrderInvoice && (
                <button
                  onClick={onDownloadReceipt}
                  disabled={isFetchingInvoice}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded border border-[#e8e5df] hover:border-[var(--core-primary)] text-[var(--core-primary)] font-[var(--font-bold)] text-[13px] uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  <DownloadIcon />
                  {isFetchingInvoice ? "Downloading..." : "Download Invoice"}
                </button>
              )}
            </div>

            {/* Addresses */}
            <div className="border border-[#e8e5df] rounded-lg p-6 bg-white">
              <h3 className="font-[var(--font-bold)] text-[16px] text-[var(--core-primary)] uppercase tracking-wider mb-4">
                {order_type === "pickup" ? "Pickup Location" : "Address Details"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {order_type === "pickup" ? (
                  <div>
                    <span className="text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest block mb-1">
                      Store Pickup Address
                    </span>
                    <p className="font-[var(--font-regular)] text-[14px] text-gray-700 leading-relaxed">
                      {storePickUpAddress || "Contact store for pickup details."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest block mb-1">
                        Shipping Address
                      </span>
                      <p className="font-[var(--font-regular)] text-[14px] text-gray-700 leading-relaxed">
                        {fullShippingAddress || "No shipping address provided."}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-[var(--font-bold)] text-gray-400 uppercase tracking-widest block mb-1">
                        Billing Address
                      </span>
                      <p className="font-[var(--font-regular)] text-[14px] text-gray-700 leading-relaxed">
                        {fullBillingAddress || fullShippingAddress || "Same as shipping."}
                      </p>
                    </div>
                  </>
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
            <div>
              <h3 className="font-[var(--font-bold)] text-[18px] text-[var(--core-primary)] uppercase tracking-wider mb-6">
                Ordered Items ({line_items?.length || 0})
              </h3>
              <div className="flex flex-col gap-4">
                {line_items?.map((item: any, idx: number) => (
                  <ProductlistCard
                    key={item.id || idx}
                    product={item}
                    orderType={order_type}
                    component={
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-[var(--font-medium)] text-[var(--core-primary)] border border-gray-200 rounded px-2 py-0.5 bg-gray-50">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    }
                  />
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="border border-[#e8e5df] rounded-lg p-6 bg-white">
              <h3 className="font-[var(--font-bold)] text-[16px] text-[var(--core-primary)] uppercase tracking-wider mb-4">
                Bill Summary
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-gray-500 font-[var(--font-regular)]">
                    Item Total
                  </span>
                  <span className="font-[var(--font-medium)] text-[var(--core-primary)]">
                    {formatCurrency(display_item_total)}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between items-center text-[14px] text-[#16a34a]">
                    <span className="font-[var(--font-regular)]">Discount</span>
                    <span className="font-[var(--font-medium)]">
                      -{formatCurrency(totalSavings)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-gray-500 font-[var(--font-regular)]">
                    Delivery / Shipping
                  </span>
                  <span className="font-[var(--font-medium)] text-[var(--core-primary)]">
                    {display_ship_total || "Free"}
                  </span>
                </div>

                {display_tax_total && (
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-gray-500 font-[var(--font-regular)]">
                      Taxes
                    </span>
                    <span className="font-[var(--font-medium)] text-[var(--core-primary)]">
                      {formatCurrency(display_tax_total)}
                    </span>
                  </div>
                )}

                <div
                  className="border-t my-1"
                  style={{
                    background:
                      "color-mix(in srgb, var(--core-secondary) 35%, #e8e5df)",
                  }}
                />
                <div className="flex justify-between items-center">
                  <span className="font-[var(--font-bold)] text-[15px] text-[var(--core-primary)]">
                    Total
                  </span>
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

