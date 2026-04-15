"use client";
import React from "react";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { useAddToCart } from "@/hooks/useAddToCart";
import { DeleteIcon, EditIcon } from "@/public/SvgImage";
import CustomizationModal from "@/components/common/CustomizationModal";
import { useState } from "react";
import ViewCustomizationModal from "@/components/common/ViewCustomizationModal";

const ProductlistCard = ({ product, component, orderType }) => {
  const { name, price, shipping_charge } = product?.line_itemable ?? {};
  const productImage = product?.image;
  const quantity = product?.quantity;
  const displayPrice = (price ?? 0) / 100;

  const { formatCurrency } = useCurrencyFormat();
  const {
    handleDeleteLineItem,
    deleteLineItemById,
    handleDecreaseQty,
    handleAddToCart,
    isAddToCartLoading,
  } = useAddToCart();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleDeleteItem = async () => {
    await deleteLineItemById(product?.id);
  };

  const handleEditConfirm = async (newCustomizations, newQty) => {
    try {
      // 1. Delete the old configured line item
      await deleteLineItemById(product?.id);
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
              src={productImage || "/noProduct.svg"}
              alt={name || "Product"}
              className="w-[112px] h-[124px] object-cover rounded-lg"
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
            src={productImage || "/noImage.webp"}
            alt={name || "Product"}
            className="w-[112px] h-[124px] object-cover rounded-lg"
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
                    className="text-xs text-[#00214c] underline hover:text-[#0d346b] transition-colors text-left font-medium"
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
            <div className="flex items-center border border-[#e8e5df] rounded-md h-[28px] bg-[#f9f9f9]">
              <button
                onClick={() =>
                  handleDecreaseQty(
                    product?.line_itemable,
                    product?.line_items_customizations,
                  )
                }
                disabled={isAddToCartLoading}
                className="w-7 h-full flex items-center justify-center text-lg text-gray-500 hover:text-[#00214c] transition-colors disabled:opacity-50 pb-0.5"
              >
                -
              </button>
              <span className="w-6 text-center text-sm font-semibold text-[#00214c] bg-white h-full flex items-center justify-center border-x border-[#e8e5df]">
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
                className="w-7 h-full flex items-center justify-center text-base text-gray-500 hover:text-[#00214c] transition-colors disabled:opacity-50 pb-0.5"
              >
                +
              </button>
            </div>
            {/* {hasCustomizations && (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                disabled={isAddToCartLoading}
                className="text-xs text-[#00214c] font-medium border border-[#e8e5df] hover:bg-gray-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
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
