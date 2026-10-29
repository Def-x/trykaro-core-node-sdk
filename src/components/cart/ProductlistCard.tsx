"use client";

import React, { useState } from "react";
import { useCurrencyFormat } from "../../hooks/useCurrencyFormat";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useStorefrontRouter } from "../../utils/navigation";
import CustomizationModal from "../common/CustomizationModal";
import ViewCustomizationModal from "../common/ViewCustomizationModal";

// ─── Inline Icons ─────────────────────────────────────────────────────────────
const DeleteIcon: React.FC<{
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  title?: string;
}> = ({ onClick, disabled, loading, className, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || loading}
    className={`w-6 h-6 flex items-center justify-center shrink-0 ${className || ""} ${
      disabled || loading ? "cursor-not-allowed opacity-50 pointer-events-none" : ""
    }`}
    title={title}
    aria-label={title || "Delete"}
  >
    {loading ? (
      <div
        className="w-4 h-4 border-2 border-[var(--core-primary)] border-t-transparent rounded-full animate-spin shrink-0"
        role="status"
        aria-label="Deleting..."
      />
    ) : (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
      </svg>
    )}
  </button>
);

const noProductImage = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#E0E0E0"/>
    <path d="M152.5 313.5L190.369 275.63C192.526 273.475 195.451 272.263 198.5 272.263C201.549 272.263 204.474 273.475 206.631 275.63L213.37 282.37C215.526 284.525 218.451 285.737 221.5 285.737C224.549 285.737 227.474 284.525 229.63 282.37L262.739 249.261C267.052 244.949 272.901 242.527 279 242.527C285.099 242.527 290.948 244.949 295.261 249.261L359.5 313.5M152.5 175.5V336.5C152.5 339.55 153.712 342.475 155.868 344.632C158.025 346.788 160.95 348 164 348H348C351.05 348 353.975 346.788 356.132 344.632C358.288 342.475 359.5 339.55 359.5 336.5V175.5C359.5 172.45 358.288 169.525 356.132 167.368C353.975 165.212 351.05 164 348 164H164C160.95 164 158.025 165.212 155.868 167.368C153.712 169.525 152.5 172.45 152.5 175.5ZM210 210C210 213.05 211.212 215.975 213.368 218.132C215.525 220.288 218.45 221.5 221.5 221.5C224.55 221.5 227.475 220.288 229.632 218.132C231.788 215.975 233 213.05 233 210C233 206.95 231.788 204.025 229.632 201.868C227.475 199.712 224.55 198.5 221.5 198.5C218.45 198.5 215.525 199.712 213.368 201.868C211.212 204.025 210 206.95 210 210Z" stroke="#7B7B7B" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
)}`;

export interface ProductlistCardProps {
  product: any;
  component?: React.ReactNode;
  orderType?: string;
}

export const ProductlistCard: React.FC<ProductlistCardProps> = ({
  product,
  component = null,
  orderType,
}) => {
  const router = useStorefrontRouter();
  const { name, price, shipping_charge } = product?.line_itemable ?? {};
  const productImage = product?.image;
  const quantity = product?.quantity;
  const displayPrice = (price ?? 0) / 100;

  const sq = product?.line_itemable?.selling_quantity;
  const hasSellingQuantity =
    sq && typeof sq === "object"
      ? Array.isArray(sq.values)
        ? sq.values.length > 0
        : Object.keys(sq).length > 0
      : Boolean(sq);

  const isSellingQty = hasSellingQuantity;

  // Variant options (e.g. Size: M, Color: Red)
  const variantOptions = product?.line_itemable?.variant_options ?? [];

  const { formatCurrency } = useCurrencyFormat();
  const {
    handleDeleteLineItem,
    handleDecreaseQty,
    handleAddToCart,
    isAddToCartLoading,
    deletingLineItemId,
  } = useAddToCart();

  const [isDeleting, setIsDeleting] = useState(false);
  const isItemDeleting =
    isDeleting || (Boolean(product?.id) && deletingLineItemId === product?.id);
  const isActionDisabled = isAddToCartLoading || isItemDeleting;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Navigate to product page with variant pre-selected
  const handleNavigateToProduct = () => {
    const lineItemable = product?.line_itemable;
    if (!lineItemable) return;

    const productId = lineItemable?.product_id ?? lineItemable?.id;
    const variantId = lineItemable?.product_id ? lineItemable?.id : null;
    const taxonId = lineItemable?.taxons?.[0]?.id ?? "taxon";

    let url = `/product/${productId}?taxonid=${taxonId}`;
    if (variantId) url += `&variantId=${variantId}`;
    if (quantity && quantity > 1) url += `&qty=${quantity}`;

    router.push(url);
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = noProductImage;
  };

  const handleDeleteItem = async (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    if (isActionDisabled) return;
    try {
      setIsDeleting(true);
      await handleDeleteLineItem(product);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditConfirm = async (newCustomizations: any, newQty: number) => {
    try {
      await handleDeleteLineItem(product);
      await handleAddToCart(product?.line_itemable, newCustomizations, newQty);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full flex justify-between gap-x-[16px] py-[12px]">
      <div className="flex gap-x-[12px] min-w-0">
        <div
          className="w-[80px] h-[80px] rounded-[8px] overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
          onClick={handleNavigateToProduct}
        >
          <img
            src={productImage || noProductImage}
            alt={name || "Product"}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-between min-w-0">
          <div>
            <h3
              className="text-[14px] font-[var(--font-medium)] text-[var(--main)] truncate cursor-pointer hover:underline"
              onClick={handleNavigateToProduct}
            >
              {name}
            </h3>

            {/* Variant options */}
            {variantOptions.length > 0 && (
              <div className="flex flex-wrap gap-x-2 text-[12px] text-[var(--secondary)] mt-0.5">
                {variantOptions.map((opt: any, idx: number) => (
                  <span key={idx}>
                    {opt.option_type_name || opt.name}: {opt.presentation || opt.value}
                  </span>
                ))}
              </div>
            )}

            {/* Customizations button */}
            {product?.customizations && product.customizations.length > 0 && (
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(true)}
                  className="text-[11px] text-[var(--core-primary)] font-[var(--font-medium)] underline"
                >
                  View customizations
                </button>
              </div>
            )}
          </div>

          <p className="text-[14px] font-[var(--font-regular)] text-[var(--secondary)]">
            {quantity} × {formatCurrency(displayPrice)}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between shrink-0">
        <p className="text-[14px] font-[var(--font-medium)] text-[var(--main)]">
          {formatCurrency(displayPrice * (quantity ?? 1))}
        </p>

        {component ? (
          component
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-[var(--font-medium)] text-[var(--core-primary)] border border-gray-200 rounded px-2 py-0.5 bg-gray-50">
              {quantity}
            </span>
            <DeleteIcon
              onClick={handleDeleteItem}
              disabled={isActionDisabled}
              loading={isItemDeleting}
            />
          </div>
        )}
      </div>

      {/* Customization Modals */}
      {isViewModalOpen && (
        <ViewCustomizationModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          customizations={product?.customizations}
          productName={name}
        />
      )}

      {isEditModalOpen && (
        <CustomizationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={product?.line_itemable}
          customizationsList={product?.line_itemable?.customizations || []}
          onConfirm={handleEditConfirm}
          initialValues={product?.customizations?.reduce((acc: any, c: any) => {
            acc[c.product_customization_id] = { value: c.value };
            return acc;
          }, {})}
          initialQuantity={quantity}
          isEditMode={true}
          isAddToCartLoading={isAddToCartLoading}
        />
      )}
    </div>
  );
};

export default ProductlistCard;

