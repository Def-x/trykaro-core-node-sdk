"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import { useCore } from "../../context/CoreProvider";
import {
  AccountArrowLeftIcon,
  AccountCalendarIcon,
  AccountCheckIcon,
  AccountCopyIcon,
  AccountMapPinIcon,
  AccountPackageIcon,
} from "./AccountIcons";

export const AccountOrderDetailContent = ({ order, id }) => {
  const { formatCurrency } = useCurrencyFormat();
  const { config } = useCore();
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const o = order.cart || order;
  const date = new Date(
    order.created_at || o.created_at || Date.now(),
  ).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const status =
    order.order_status || order.payment_state || order.state || "placed";
  const shippingAddress = order.shipping_address || o.shipping_address || {};
  const lineItems = o.line_items || [];
  const orderNumber = order.order_number || o.number || o.order_id || id;

  const appliedDiscounts =
    o?.cart_discounts || o?.cart_detail_json?.discounts || [];

  const getDiscountAmount = (coupon) => {
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

  const promoTotal =
    Number(o.display_promo_total) ||
    (o.promo_total ? Number(o.promo_total) / 100 : 0);

  const hasPromo =
    promoTotal > 0 ||
    (o.display_promo_total &&
      o.display_promo_total !== "0.00" &&
      o.display_promo_total !== "0" &&
      o.display_promo_total !== 0);

  const totalCalculatedDiscount = appliedDiscounts.reduce((sum, coupon) => {
    const amt = getDiscountAmount(coupon);
    return sum + (amt || 0);
  }, 0);

  const totalSavings =
    totalCalculatedDiscount > 0 ? totalCalculatedDiscount : promoTotal;

  const handleCopy = () => {
    navigator.clipboard?.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in fade-in w-full pb-6 duration-300">
      <div className="sticky top-0 z-10 mb-2 flex items-center gap-3 border-b border-gray-50/50 bg-white/95 py-2.5 backdrop-blur-md">
        <Link
          href="/account/orders"
          className="ml-[-4px] rounded-full p-1.5 transition hover:bg-gray-100"
        >
          <AccountArrowLeftIcon className="h-5 w-5 text-[#1C1C1C]" />
        </Link>
        <h1 className="text-[17px] font-[var(--font-bold)] text-[#1C1C1C]">
          Order Details
        </h1>
      </div>

      <div className="mb-2 flex flex-col gap-0.5 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] font-[var(--font-bold)] text-black">
              {status === "placed"
                ? "Order Placed"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-[var(--font-medium)] text-[#666666]">
                Order ID: {orderNumber}
              </span>
              <button
                onClick={handleCopy}
                className="group relative rounded p-1 transition-colors hover:bg-gray-50"
                title="Copy Order ID"
              >
                {copied ? (
                  <AccountCheckIcon className="h-3 w-3 text-green-600" />
                ) : (
                  <AccountCopyIcon className="h-3 w-3 text-[#BBBBBB] group-hover:text-[var(--core-primary)]" />
                )}
                {copied && (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-[10px] text-white shadow-lg">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>
          <span className="rounded-full bg-[#E8F5E9] px-2 py-0.5 text-[10px] font-[var(--font-bold)] uppercase tracking-tight text-[#2E7D32]">
            {status}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-[var(--font-medium)] text-[#888888]">
          <AccountCalendarIcon className="h-3 w-3" /> Placed on {date}
        </div>
      </div>

      <div className="mb-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 bg-gray-50/50 px-3 py-2">
          <h2 className="flex items-center gap-2 text-[12px] font-[var(--font-bold)] text-[#1C1C1C]">
            <AccountPackageIcon className="h-3.5 w-3.5 text-[var(--core-primary)]" />
            {lineItems.length} {lineItems.length === 1 ? "Item" : "Items"}
          </h2>
        </div>
        <div className="flex flex-col">
          {lineItems.map((item, index) => {
            const unitValue =
              item.line_itemable?.selling_quantity?.values?.[0]?.label;
            const amount =
              item.display_price ??
              item.line_itemable?.display_price ??
              (item.line_itemable?.price || 0) / 100;
            return (
              <div
                key={item.id || index}
                className="flex gap-3 border-b border-gray-50 p-3 transition last:border-0 hover:bg-gray-50"
              >
                <div className="h-14 w-14 shrink-0 rounded-lg border border-gray-50 bg-[#F8F8F8] p-1">
                  <img
                    src={item.image || "/NoProductImage.png"}
                    alt={item.name || item.line_itemable?.name || "item"}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center gap-0.5">
                  <h3 className="line-clamp-1 text-[13px] font-[var(--font-semibold)] leading-snug text-[#1C1C1C]">
                    {item.name || item.line_itemable?.name}
                  </h3>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      {unitValue && (
                        <span className="text-[11px] font-[var(--font-medium)] text-[#888888]">
                          {unitValue}
                        </span>
                      )}
                      <span className="text-[11px] font-[var(--font-medium)] text-[#888888]">
                        x {item.quantity || 1}
                      </span>
                    </div>
                    <span className="text-[13px] font-[var(--font-bold)] text-[#1C1C1C]">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <h2 className="mb-2.5 text-[13px] font-[var(--font-bold)] text-[#1C1C1C]">
          Bill Details
        </h2>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[12.5px] font-[var(--font-medium)] text-[#555555]">
            <span>Item Total</span>
            <span>
              {formatCurrency(
                o.display_item_total ?? (o.item_total || 0) / 100,
              )}
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
                  className="flex justify-between text-[12.5px] font-[var(--font-medium)] text-[#FF6500]"
                >
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span>Discount</span>
                    {coupon?.code && (
                      <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-orange-50 text-[#FF6500] border border-orange-200">
                        {coupon.code}
                      </span>
                    )}
                    {coupon?.display_action_value && (
                      <span className="text-[11px] text-[#FF6500]/90">
                        ({coupon.display_action_value})
                      </span>
                    )}
                  </span>
                  <span>-{formatCurrency(amt)}</span>
                </div>
              );
            })
          ) : hasPromo ? (
            <div className="flex justify-between text-[12.5px] font-[var(--font-medium)] text-[#FF6500]">
              <span>Discount</span>
              <span>-{formatCurrency(promoTotal)}</span>
            </div>
          ) : null}

          <div className="flex justify-between text-[12.5px] font-[var(--font-medium)] text-[#555555]">
            <span>Delivery Charge</span>
            <span>
              {formatCurrency(
                o.display_ship_total ?? (o.ship_total || 0) / 100,
              )}
            </span>
          </div>
          <div className="flex justify-between text-[12.5px] font-[var(--font-medium)] text-[#555555]">
            <span>Taxes</span>
            <span>
              {formatCurrency(o.display_tax_total ?? (o.tax_total || 0) / 100)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center justify-between border-t border-dashed border-gray-100 pt-2">
            <span className="text-[14px] font-[var(--font-bold)] text-black">
              Grand Total
            </span>
            <span className="text-[14px] font-[var(--font-bold)] text-black">
              {formatCurrency(o.display_total ?? (o.total || 0) / 100)}
            </span>
          </div>
          {totalSavings > 0 && (
            <p className="text-[12px] font-[var(--font-bold)] text-[#16a34a] pt-1 text-right">
              You save {formatCurrency(totalSavings)} on this order 🎉
            </p>
          )}
        </div>
      </div>

      <div className="mb-10 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <h2 className="mb-3 text-[13px] font-[var(--font-bold)] text-[#1C1C1C]">
          Order Details
        </h2>
        <div className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F7FA]">
            <AccountMapPinIcon className="h-3.5 w-3.5 text-[#888888]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-[var(--font-bold)] uppercase tracking-wide text-[#888888]">
              Delivery Address
            </span>
            <div className="text-[12.5px] font-[var(--font-medium)] leading-relaxed text-[#444444]">
              {(shippingAddress.firstname || order.user?.first_name) && (
                <p className="font-[var(--font-bold)] text-[#1C1C1C]">
                  {shippingAddress.firstname || order.user?.first_name}{" "}
                  {shippingAddress.lastname || order.user?.last_name}
                </p>
              )}
              <p>
                {shippingAddress.address1}
                {shippingAddress.address2
                  ? `, ${shippingAddress.address2}`
                  : ""}
              </p>
              <p>
                {shippingAddress.city}
                {shippingAddress.zipcode ? ` - ${shippingAddress.zipcode}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50 flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F7FA]">
            <AccountPackageIcon className="h-3.5 w-3.5 text-[#888888]" />
          </div>
          <div className="flex flex-col gap-0.5 w-full">
            <span className="text-[11px] font-[var(--font-bold)] uppercase tracking-wide text-[#888888]">
              Order Information
            </span>
            <div className="text-[12.5px] font-[var(--font-medium)] leading-relaxed text-[#444444] mt-1">
              <div className="flex items-center gap-2">
                <span>Order ID: {orderNumber}</span>
                <button
                  onClick={handleCopy}
                  className="group relative rounded p-1 transition-colors hover:bg-gray-50"
                  title="Copy Order ID"
                >
                  {copied ? (
                    <AccountCheckIcon className="h-3 w-3 text-green-600" />
                  ) : (
                    <AccountCopyIcon className="h-3 w-3 text-[#BBBBBB] group-hover:text-[var(--core-primary)]" />
                  )}
                </button>
              </div>
              <p>
                Payment:{" "}
                {order.payment_status || order.cart?.payment_state || "Pending"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
