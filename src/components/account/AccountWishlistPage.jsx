"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AccountHeartIcon } from "./AccountIcons";

export const AccountWishlistPage = ({ products = [], isLoading = false, renderProduct }) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600" />
        <p className="mt-4 font-[var(--font-medium)] text-gray-500">Loading your wishlist...</p>
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
            <AccountHeartIcon className="h-8 w-8 text-red-300" strokeWidth={2} />
          </div>
          <h2 className="mb-2 text-[18px] font-[var(--font-bold)] text-gray-800">Your wishlist is empty</h2>
          <p className="mb-6 text-[14px] font-[var(--font-medium)] text-gray-500">Save items you love and buy them later.</p>
          <button onClick={() => router.push("/")} className="rounded-lg bg-[var(--core-primary)] px-6 py-2.5 font-[var(--font-bold)] text-white shadow-sm transition hover:opacity-90">Start Shopping</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
          {products.map((product, index) => renderProduct ? renderProduct(product, index) : (
            <button key={product.id ?? index} onClick={() => router.push(`/product/${product.id}`)} className="overflow-hidden rounded-lg border border-gray-100 bg-white text-left shadow-sm transition hover:shadow-md">
              <img src={product.image || product.product_image_url || "/NoProductImage.png"} alt={product.name || "Product"} className="h-40 w-full object-cover" />
              <div className="p-3">
                <p className="line-clamp-2 text-[13px] font-[var(--font-semibold)] text-[#1C1C1C]">{product.name || "Product"}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
