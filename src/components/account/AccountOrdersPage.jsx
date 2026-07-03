"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import {
  AccountCalendarIcon,
  AccountPackageIcon,
  AccountShoppingBagIcon,
  AccountTagIcon,
} from "./AccountIcons";

export const AccountOrdersPage = ({ initialOrders = [], pagination }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { formatCurrency } = useCurrencyFormat();

  const itemsPerPage = 10;
  const isServerPaginated = pagination && pagination.total_pages !== undefined;
  
  const currentPage = isServerPaginated ? pagination.current_page : parseInt(searchParams.get("page") || "1", 10);
  const totalPages = isServerPaginated ? pagination.total_pages : Math.ceil(initialOrders.length / itemsPerPage) || 1;
  const currentOrders = isServerPaginated ? initialOrders : initialOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const getVisiblePages = (current, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 2) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  const visiblePages = getVisiblePages(currentPage, totalPages);

  console.log({ initialOrders, currentOrders, currentPage, totalPages });
  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="mb-6 flex items-center gap-2 text-[20px] font-[var(--font-bold)] text-[#1C1C1C]">
        <AccountShoppingBagIcon className="h-5 w-5 text-[var(--core-primary)]" />
        My Orders
      </h1>

      {initialOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-100 bg-white py-16 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F5]">
            <AccountShoppingBagIcon
              className="h-8 w-8 text-[#BBBBBB]"
              strokeWidth={1.5}
            />
          </div>
          <p className="text-[15px] font-[var(--font-semibold)] text-[#1C1C1C]">
            No orders yet!
          </p>
          <p className="max-w-[260px] text-center text-[13px] text-[#888888]">
            Looks like you haven&apos;t placed any orders yet.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-2 rounded-lg bg-[var(--core-primary)] px-8 py-2.5 text-[13px] font-[var(--font-bold)] text-white transition-colors hover:opacity-90"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {currentOrders.map((order) => {
            const o = order.attributes || order;
            const date = o.created_at
              ? new Date(o.created_at).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Pending";
            const total = formatCurrency(
              o?.cart?.display_total ?? o?.display_total ?? 0,
            );
            const status = o.order_status || o.status || "placed";
            const paymentStatus = o.payment_status || o.cart?.payment_state || "Pending";
            const lineItems = o.cart?.line_items || o.line_items || [];

            return (
              <div
                key={o.id || o.number}
                onClick={() =>
                  router.push(`/account/orders/${o.number || o.id}`)
                }
                className="group flex cursor-pointer flex-col justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[var(--core-primary)] hover:shadow-md md:flex-row md:items-center"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-[var(--font-bold)] text-gray-900">
                      Order #{o.number || o.order_number || o.id}
                    </span>
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-[var(--font-bold)] uppercase text-[var(--core-primary)]">
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[13px] font-[var(--font-medium)] text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <AccountCalendarIcon className="h-3.5 w-3.5" /> {date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <AccountTagIcon className="h-3.5 w-3.5" /> {total}
                    </span>
                    <span className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
                      Payment: <span className={`uppercase text-[11px] font-[var(--font-bold)] tracking-tight ${paymentStatus.toLowerCase() === 'received' || paymentStatus.toLowerCase() === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>{paymentStatus}</span>
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex w-full items-center justify-between gap-6 md:mt-0 md:w-auto md:justify-end">
                  <div className="flex -space-x-3">
                    {lineItems.slice(0, 3).map((item, index) => (
                      <div
                        key={item.id || index}
                        className="relative z-[1] flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white p-1"
                      >
                        <img
                          src={item.image || "/NoProductImage.png"}
                          alt={item.name || "item"}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ))}
                    {lineItems.length > 3 && (
                      <div className="relative z-0 flex h-10 w-10 items-center justify-center rounded-full border border-white bg-gray-100 text-[10px] font-bold text-gray-600">
                        +{lineItems.length - 3}
                      </div>
                    )}
                    {lineItems.length === 0 && (
                      <div className="relative z-[1] flex h-10 w-10 items-center justify-center rounded-full border border-white bg-[#F0F4FF]">
                        <AccountPackageIcon className="h-5 w-5 text-[var(--core-primary)]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[13px] font-[var(--font-bold)] text-[var(--core-primary)] group-hover:underline">
                    View Details &gt;
                  </span>
                </div>
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-4">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex h-9 items-center justify-center rounded-lg border border-gray-200 px-3 text-[13px] font-[var(--font-medium)] text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Previous
              </button>

              <div className="flex flex-wrap items-center justify-center gap-1">
                {visiblePages.map((page, index) =>
                  page === "..." ? (
                    <span key={`ellipsis-${index}`} className="flex h-9 w-6 items-center justify-center text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-[var(--font-bold)] transition-colors ${
                        currentPage === page
                          ? "bg-[var(--core-primary)] text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex h-9 items-center justify-center rounded-lg border border-gray-200 px-3 text-[13px] font-[var(--font-medium)] text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
