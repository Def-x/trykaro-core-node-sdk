"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCore } from "../../context/CoreProvider";
import { Spinner } from "../ui/Spinner";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import { EmptyState } from "../ui/EmptyState";

/**
 * OrdersList Component
 * 
 * Displays the "MY ORDERS" section.
 * Fetches order history from actions.getOrders or accepts them via props.
 */
export const OrdersList = ({ initialOrders }) => {
  const { actions, config } = useCore();
  const { formatCurrency } = useCurrencyFormat();
  const [orders, setOrders] = useState(initialOrders || []);
  const [isLoading, setIsLoading] = useState(!initialOrders);

  useEffect(() => {
    if (initialOrders) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        if (actions?.getOrders) {
          const data = await actions.getOrders(config?.storeId);
          setOrders(data || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [actions, config?.storeId, initialOrders]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="font-[Nunito-regular] text-[32px] text-[var(--core-primary)] mb-10 tracking-tight uppercase">
        MY ORDERS
      </h1>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} formatCurrency={formatCurrency} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📦"
          title="No Orders Found"
          description="It looks like you haven't placed any orders yet. Once you do, they will appear here."
          action={
            <button className="mt-4 px-8 py-3 bg-[var(--core-primary)] text-white font-[Nunito-bold] text-[13px] uppercase tracking-widest hover:opacity-90 transition-colors rounded-none">
              Start Shopping
            </button>
          }
          className="border border-dashed border-gray-200 bg-gray-50/30"
        />
      )}
    </div>
  );
};

/**
 * OrderCard internal component
 */
const OrderCard = ({ order, formatCurrency }) => {
  const router = useRouter();
  // The provided JSON shows data can be root-level or nested under 'order' and 'cart'
  const o = order.order || order || {};
  const cart = o.cart || order.cart || {};

  const {
    id,
    order_number,
    order_status,
    payment_status,
  } = o;

  const {
    number: cartNumber,
    display_total,
    line_items = [],
  } = cart;

  const dateStr = order?.created_at
    ? new Date(order?.created_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    : "Pending";

  return (
    <div
      className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer rounded-lg overflow-hidden flex flex-col group/card"
      onClick={() => router.push(`/order/${id}`)}
    >
      {/* Header Info Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50/80 p-5 border-b border-gray-100 gap-4">
        {/* Left side */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <span className="font-[Nunito-bold] text-[16px] text-[var(--core-primary)]">
              {order_number || cartNumber || id}
            </span>
            <span
              className="text-[10px] font-[Nunito-bold] uppercase tracking-wider"
              style={{
                padding: '3px 10px',
                borderRadius: '999px',
                backgroundColor: order_status?.toLowerCase() === 'placed' ? '#dcfce7' : '#f3f4f6',
                color: order_status?.toLowerCase() === 'placed' ? '#15803d' : '#374151',
                border: `1px solid ${order_status?.toLowerCase() === 'placed' ? '#bbf7d0' : '#e5e7eb'}`
              }}
            >
              {order_status || "Processing"}
            </span>
          </div>
          <p className="text-[13px] font-[Nunito-medium] text-gray-500">
            Placed on <span className="text-gray-700">{dateStr}</span>
          </p>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-start md:items-end gap-1.5 w-full md:w-auto">
          <span className="font-[Nunito-bold] text-[18px] text-[var(--core-primary)]">
            {display_total ? formatCurrency(display_total) : "—"}
          </span>
          <p className="text-[12px] font-[Nunito-medium] flex items-center gap-1.5">
            <span className="text-gray-400 uppercase tracking-wider text-[10px] font-[Nunito-bold]">Payment:</span>
            <span className={`uppercase font-[Nunito-bold] tracking-tight ${payment_status === 'received' || payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'
              }`}>
              {payment_status || "Pending"}
            </span>
          </p>
        </div>
      </div>

      {/* Body - Product Images */}
      <div className="p-5 pt-6 flex flex-wrap gap-8 items-center relative">
        {line_items.map((item, idx) => {
          const lineItemable = item.line_itemable || {};
          const product = lineItemable.product || {};
          // Check for images in line_itemable (variant/product images structure)
          const imgUrl = item?.image

          return (
            <div key={idx} className="relative group shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-md border border-gray-200 bg-gray-50/50 flex items-center justify-center p-2 overflow-hidden transition-colors duration-300 group-hover:border-gray-300">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={item.name || product.name || "Product"}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <span className="text-[20px] mb-1">📦</span>
                    <span className="text-[9px] uppercase tracking-wider font-[Nunito-medium]">No Image</span>
                  </div>
                )}
              </div>
              <span className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 bg-[var(--core-primary)] text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10">
                {item.quantity}
              </span>
            </div>
          );
        })}
        {line_items.length === 0 && <p className="text-gray-400 italic text-sm py-4">No items info</p>}

        {/* Subtle view details indicator */}
        <div className="absolute right-5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 hidden md:flex items-center text-[var(--core-primary)] text-[13px] font-[Nunito-bold] bg-white/90 backdrop-blur-sm py-2 px-4 rounded-full shadow-sm border border-gray-200 pointer-events-none">
          View Details &rarr;
        </div>
      </div>
    </div>
  );
};
