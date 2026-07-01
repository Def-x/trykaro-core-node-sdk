"use client";
import React, { useState, useEffect } from "react";

const CustomizationModal = ({
  isOpen,
  onClose,
  product,
  customizationsList,
  onConfirm,
  initialValues = {},
  initialQuantity = 1,
  isEditMode = false,
  isAddToCartLoading = false,
}) => {
  const [customizations, setCustomizations] = useState({});
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    if (isOpen) {
      setCustomizations(initialValues);
      setQuantity(initialQuantity);
    }
  }, [isOpen, initialValues, initialQuantity]);

  const handleCustomizationChange = (customizationId, value) => {
    setCustomizations((prev) => ({
      ...prev,
      [customizationId]: value,
    }));
  };

  const handleConfirm = () => {
    onConfirm(customizations, quantity);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-[var(--font-bold)] text-[var(--main)] mb-4">
          {isEditMode ? "Edit" : "Customize"} {product?.name}
        </h2>

        {/* Customizations */}
        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
          {customizationsList.map((customization) => (
            <div key={customization.id}>
              <label className="block text-sm font-[var(--font-medium)] text-[var(--main)] mb-2">
                {customization.name}
              </label>
              {customization.customization_type === "select" ? (
                <select
                  value={customizations[customization.id]?.value || ""}
                  onChange={(e) =>
                    handleCustomizationChange(customization.id, e.target.value)
                  }
                  className="w-full border border-[#e8e5df] rounded-md p-2 text-sm"
                >
                  <option value="">Select an option</option>
                  {customization.customization_values?.map((opt) => (
                    <option key={opt.id} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={customizations[customization.id]?.value || ""}
                  onChange={(e) =>
                    handleCustomizationChange(customization.id, e.target.value)
                  }
                  placeholder={`Enter ${customization.name}`}
                  className="w-full border border-[#e8e5df] rounded-md p-2 text-sm"
                />
              )}
            </div>
          ))}
        </div>

        {/* Quantity */}
        <div className="mb-6">
          <label className="block text-sm font-[var(--font-medium)] text-[var(--main)] mb-2">
            Quantity
          </label>
          <div className="flex items-center border border-[#e8e5df] rounded-md w-fit">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={isAddToCartLoading}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[var(--core-primary)] disabled:opacity-50"
            >
              -
            </button>
            <span className="w-10 text-center font-semibold text-[var(--core-primary)]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              disabled={isAddToCartLoading}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[var(--core-primary)] disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isAddToCartLoading}
            className="flex-1 px-4 py-2 border border-[#e8e5df] rounded-md text-sm font-[var(--font-medium)] hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isAddToCartLoading}
            className="flex-1 px-4 py-2 bg-[var(--core-primary)] text-white rounded-md text-sm font-[var(--font-medium)] hover:bg-[var(--core-primary)] disabled:opacity-50"
          >
            {isAddToCartLoading
              ? "Loading..."
              : isEditMode
                ? "Update"
                : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationModal;
