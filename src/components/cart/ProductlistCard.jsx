"use client";
import React from "react";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { useAddToCart } from "@/hooks/useAddToCart";
import { DeleteIcon, EditIcon } from "@/public/SvgImage";
import CustomizationModal from "@/components/common/CustomizationModal";
import { useState } from "react";
import ViewCustomizationModal from "@/components/common/ViewCustomizationModal";

const noProductImage = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#E0E0E0"/>
    <path d="M152.5 313.5L190.369 275.63C192.526 273.475 195.451 272.263 198.5 272.263C201.549 272.263 204.474 273.475 206.631 275.63L213.37 282.37C215.526 284.525 218.451 285.737 221.5 285.737C224.549 285.737 227.474 284.525 229.63 282.37L262.739 249.261C267.052 244.949 272.901 242.527 279 242.527C285.099 242.527 290.948 244.949 295.261 249.261L359.5 313.5M152.5 175.5V336.5C152.5 339.55 153.712 342.475 155.868 344.632C158.025 346.788 160.95 348 164 348H348C351.05 348 353.975 346.788 356.132 344.632C358.288 342.475 359.5 339.55 359.5 336.5V175.5C359.5 172.45 358.288 169.525 356.132 167.368C353.975 165.212 351.05 164 348 164H164C160.95 164 158.025 165.212 155.868 167.368C153.712 169.525 152.5 172.45 152.5 175.5ZM210 210C210 213.05 211.212 215.975 213.368 218.132C215.525 220.288 218.45 221.5 221.5 221.5C224.55 221.5 227.475 220.288 229.632 218.132C231.788 215.975 233 213.05 233 210C233 206.95 231.788 204.025 229.632 201.868C227.475 199.712 224.55 198.5 221.5 198.5C218.45 198.5 215.525 199.712 213.368 201.868C211.212 204.025 210 206.95 210 210Z" stroke="#7B7B7B" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
)}`;

const ProductlistCard = ({ product, component, orderType }) => {
  const { name, price, shipping_charge } = product?.line_itemable ?? {};
  const productImage = product?.image;
  const quantity = product?.quantity;
  const displayPrice = (price ?? 0) / 100;
  const isSellingQty = !!product?.line_itemable?.selling_quantity_id;

  const { formatCurrency } = useCurrencyFormat();
  const {
    handleDeleteLineItem,
    handleDecreaseQty,
    handleAddToCart,
    isAddToCartLoading,
  } = useAddToCart();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = noProductImage;
  };

  const handleDeleteItem = async () => {
    await handleDeleteLineItem(product);
  };

  const handleEditConfirm = async (newCustomizations, newQty) => {
    try {
      // 1. Delete the old configured line item
      await handleDeleteLineItem(product);
      // 2. Add the new line item
      await handleAddToCart(product?.line_itemable, newCustomizations, newQty);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Convert array to object map for the CustomizationModal initial state
  const initialCustomizationObj = (
    product?.line_items_customizations || []
  ).reduce((acc, c) => {
    acc[c.product_customization_id] = c;
    return acc;
  }, {});

  const customizationsList =
    product?.line_itemable?.product_customizations || [];
  const hasCustomizations =
    product?.line_items_customizations?.length > 0 ||
    customizationsList.length > 0;

  // Check if line item is deleted
  const isDeleted = !product?.line_itemable || product?.line_itemable_deleted;

  if (isDeleted) {
    return (
      <div className="flex justify-between gap-4">
        {/* Left section */}
        <div className="flex gap-[10px] flex-1 min-w-0 opacity-50">
          {/* Product Image */}
          <div className="w-[112px] h-[124px] flex-shrink-0 overflow-hidden relative">
            <img
              src={productImage || noProductImage}
              alt={name || "Product"}
              className="w-[112px] h-[124px] object-cover rounded-lg"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <span className="text-white text-xs font-[Nunito-bold] text-center">
                UNAVAILABLE
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between h-[124px] flex-1 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-[Nunito-medium] text-base text-[var(--main)] line-clamp-1">
                  {name}
                </p>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-[Nunito-medium] flex-shrink-0">
                  Deleted
                </span>
              </div>
            </div>
            <div>
              <p className="font-[Nunito-medium] text-base text-[var(--main)]">
                {quantity} x {formatCurrency(displayPrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex flex-col justify-between items-end h-[124px] flex-shrink-0">
          <div className="flex flex-col items-end text-right opacity-50">
            <p className="font-[Nunito-medium] text-base text-[var(--main)] line-clamp-2">
              {formatCurrency(displayPrice * quantity)}
            </p>
          </div>
          {component !== "order" && (
            <DeleteIcon
              onClick={handleDeleteItem}
              className="cursor-pointer opacity-100 hover:opacity-80 transition-opacity"
              title="Delete item"
            />
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-between gap-4">
      {/* Left section */}
      <div className="flex gap-[10px] flex-1 min-w-0">
        {/* Product Image */}
        <div className="w-[112px] h-[124px] flex-shrink-0 overflow-hidden">
          <img
            src={productImage || noProductImage}
            alt={name || "Product"}
            className="w-[112px] h-[124px] object-cover rounded-lg"
            onError={handleImageError}
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between h-[124px] flex-1 min-w-0">
          <div className="min-w-0">
            <p className="font-[Nunito-medium] text-base text-[var(--main)] line-clamp-1">
              {name}
            </p>
            {product?.line_items_customizations?.length > 0 && (
              <div className="mt-1 flex flex-col gap-0.5">
                {product.line_items_customizations.length > 3 ? (
                  <button
                    onClick={() => setIsViewModalOpen(true)}
                    className="text-xs text-[var(--core-primary)] underline hover:text-[var(--core-primary)] transition-colors text-left font-medium"
                  >
                    customizations: view
                  </button>
                ) : (
                  product.line_items_customizations.map((c) => (
                    <p
                      key={c.product_customization_id}
                      className="text-xs text-gray-500 line-clamp-1"
                    >
                      <span className="font-medium">{c.name || "Custom"}:</span>{" "}
                      {c.value}
                    </p>
                  ))
                )}
              </div>
            )}
          </div>
          <div>
            <p className="font-[Nunito-medium] text-base text-[var(--main)]">
              {quantity} x {formatCurrency(displayPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex flex-col justify-between items-end h-[124px] flex-shrink-0">
        <div className="flex flex-col items-end text-right">
          {component !== "order" ? (
            <p className="font-[Nunito-medium] text-base text-[var(--main)] line-clamp-1">
              {formatCurrency(displayPrice * quantity)}
            </p>
          ) : (
            <p className="font-[Nunito-medium] text-base text-[var(--main)] line-clamp-2">
              {formatCurrency(displayPrice * quantity)}
            </p>
          )}
        </div>

        {component !== "order" && (
          <div className="flex items-center gap-3">
            {!isSellingQty ? (
              <div className="flex items-center border border-[#e8e5df] rounded-md h-[28px] bg-[#f9f9f9]">
                <button
                  onClick={() =>
                    handleDecreaseQty(
                      product?.line_itemable,
                      product?.line_items_customizations,
                    )
                  }
                  disabled={isAddToCartLoading}
                  className="w-7 h-full flex items-center justify-center text-lg text-gray-500 hover:text-[var(--core-primary)] transition-colors disabled:opacity-50 pb-0.5"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-semibold text-[var(--core-primary)] bg-white h-full flex items-center justify-center border-x border-[#e8e5df]">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    handleAddToCart(
                      product?.line_itemable,
                      product?.line_items_customizations,
                      1,
                    )
                  }
                  disabled={isAddToCartLoading}
                  className="w-7 h-full flex items-center justify-center text-base text-gray-500 hover:text-[var(--core-primary)] transition-colors disabled:opacity-50 pb-0.5"
                >
                  +
                </button>
              </div>
            ) : (
              <div className="flex items-center border border-[#e8e5df] rounded-md h-[28px] bg-[#f9f9f9] px-3">
                <span className="text-sm font-semibold text-[var(--core-primary)]">
                  {quantity}
                </span>
              </div>
            )}
            {/* {hasCustomizations && (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                disabled={isAddToCartLoading}
                className="text-xs text-[var(--core-primary)] font-medium border border-[#e8e5df] hover:bg-gray-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                Edit
              </button>
            )} */}
            <DeleteIcon
              onClick={handleDeleteItem}
              disabled={isAddToCartLoading}
              className="cursor-pointer opacity-100 hover:opacity-80 transition-opacity disabled:opacity-50"
              title="Delete item"
            />
          </div>
        )}
      </div>

      {hasCustomizations && (
        <CustomizationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={product?.line_itemable}
          customizationsList={customizationsList}
          onConfirm={handleEditConfirm}
          initialValues={initialCustomizationObj}
          initialQuantity={quantity}
          isEditMode={true}
          isAddToCartLoading={isAddToCartLoading}
        />
      )}

      <ViewCustomizationModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        customizations={product?.line_items_customizations || []}
        productName={name}
      />
    </div>
  );
};

export default ProductlistCard;
