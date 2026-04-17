"use client";

import React, { useEffect, useState } from "react";
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
      <h1 className="font-[Nunito-regular] text-[32px] text-[#00214c] mb-10 tracking-tight uppercase">
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
            <button className="mt-4 px-8 py-3 bg-[#00214c] text-white font-[Nunito-bold] text-[13px] uppercase tracking-widest hover:bg-black transition-colors rounded-none">
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
  const {
    id,
    number,
    display_total,
    state,
    completed_at,
    order_type = "Delivery",
    line_items = [],
  } = order;

  const dateStr = completed_at 
    ? new Date(completed_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : "Pending";

  return (
    <div className="border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <span className="font-[Nunito-bold] text-[15px] text-[#00214c]">
          ORD#{number || id}
        </span>
        <span className="font-[Nunito-bold] text-[15px] text-[#00214c]">
          {display_total ? formatCurrency(display_total) : "—"}
        </span>
      </div>

      {/* Body - Product Images */}
      <div className="p-4 flex gap-4 overflow-x-auto min-h-[120px] items-center">
        {line_items.map((item, idx) => (
          <div key={idx} className="relative group shrink-0">
             <div className="w-20 h-20 border border-gray-100 bg-white flex items-center justify-center p-1 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                {item.variant?.images?.[0]?.styles?.[0]?.url ? (
                    <img 
                      src={item.variant.images[0].styles[0].url} 
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[10px] text-gray-300">No Image</div>
                )}
             </div>
             <span className="absolute -top-2 -right-2 bg-[#00214c] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {item.quantity}
             </span>
          </div>
        ))}
        {line_items.length === 0 && <p className="text-gray-300 italic text-sm">No items info</p>}
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 border-t border-gray-50 divide-x divide-gray-50">
        <div className="p-3 text-center">
           <p className="text-[10px] font-[Nunito-bold] text-gray-400 uppercase tracking-widest mb-1">Order date</p>
           <p className="text-[12px] font-[Nunito-medium] text-[#2d2d2d]">{dateStr}</p>
        </div>
        <div className="p-3 text-center">
           <p className="text-[10px] font-[Nunito-bold] text-gray-400 uppercase tracking-widest mb-1">Order type</p>
           <p className="text-[12px] font-[Nunito-medium] text-[#2d2d2d]">{order_type}</p>
        </div>
      </div>
    </div>
  );
};
