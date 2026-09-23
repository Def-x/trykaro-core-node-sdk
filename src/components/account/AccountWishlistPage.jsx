"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AccountHeartIcon } from "./AccountIcons";

export const AccountWishlistPage = ({
  products = [],
  pagination,
  isLoading = false,
  renderProduct,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const itemsPerPage = 12;
  const isServerPaginated = pagination && pagination.total_pages !== undefined;

  const currentPage = isServerPaginated
    ? pagination.current_page
    : parseInt(searchParams?.get("page") || "1", 10);
  const totalPages = isServerPaginated
    ? pagination.total_pages
    : Math.ceil(products.length / itemsPerPage) || 1;
  const currentProducts = isServerPaginated
    ? products
    : products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const getVisiblePages = (current, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 2)
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  const visiblePages = getVisiblePages(currentPage, totalPages);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600" />
        <p className="mt-4 font-[var(--font-medium)] text-gray-500">
          Loading your wishlist...
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col animate-in fade-in duration-300">
      <h1 className="mb-6 flex items-center gap-2 text-[20px] font-[var(--font-bold)] text-[#1C1C1C]">
        <AccountHeartIcon filled className="h-5 w-5 text-red-500" />
        My Wishlist
      </h1>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AccountHeartIcon
              className="h-8 w-8 text-red-300"
              strokeWidth={2}
            />
          </div>
          <h2 className="mb-2 text-[18px] font-[var(--font-bold)] text-gray-800">
            Your wishlist is empty
          </h2>
          <p className="mb-6 text-[14px] font-[var(--font-medium)] text-gray-500">
            Save items you love and buy them later.
          </p>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-[var(--core-primary)] px-6 py-2.5 font-[var(--font-bold)] text-white shadow-sm transition hover:opacity-90"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
            {currentProducts.map((product, index) =>
              renderProduct ? (
                renderProduct(product, index)
              ) : (
                <button
                  key={product.id ?? index}
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="overflow-hidden rounded-lg border border-gray-100 bg-white text-left shadow-sm transition hover:shadow-md"
                >
                  <img
                    src={
                      product.image ||
                      product.product_image_url ||
                      "/NoProductImage.png"
                    }
                    alt={product.name || "Product"}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-3">
                    <p className="line-clamp-2 text-[13px] font-[var(--font-semibold)] text-[#1C1C1C]">
                      {product.name || "Product"}
                    </p>
                  </div>
                </button>
              ),
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:gap-4">
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
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-9 w-6 items-center justify-center text-gray-400"
                    >
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
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
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
