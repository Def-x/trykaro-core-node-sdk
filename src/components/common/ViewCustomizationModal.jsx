"use client";
import React from "react";

const ViewCustomizationModal = ({
  isOpen,
  onClose,
  customizations = [],
  productName = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-[Nunito-bold] text-[var(--main)] mb-4">
          Customizations for {productName}
        </h2>

        {/* Customizations List */}
        <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
          {customizations.length > 0 ? (
            customizations.map((customization, index) => (
              <div
                key={`${customization.product_customization_id}-${index}`}
                className="border border-[#e8e5df] rounded-md p-3"
              >
                <p className="text-sm font-[Nunito-medium] text-[var(--main)]">
                  {customization.name || `Custom ${index + 1}`}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {customization.value}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No customizations added
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-[var(--core-primary)] text-white rounded-md text-sm font-[Nunito-medium] hover:bg-[var(--core-primary)]"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewCustomizationModal;
