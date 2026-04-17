"use client";

import React, { useState } from "react";
import { useCore } from "../../context/CoreProvider";
import { Popup } from "../ui/Popup";
import { Spinner } from "../ui/Spinner";

/**
 * AddressCard Component
 * 
 * Displays an address with options to edit or delete.
 */
export const AddressCard = ({ address, onEdit, onDelete }) => {
  const { actions, toast } = useCore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (actions?.deleteAddress) {
        await actions.deleteAddress(address.id);
        toast?.success?.("Address deleted successfully.");
        onDelete?.();
      } else {
        throw new Error("actions.deleteAddress is not defined");
      }
    } catch (err) {
      console.error("Failed to delete address:", err);
      toast?.error?.("Could not delete address. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const {
    label,
    firstname,
    lastname,
    phone,
    address1,
    address2,
    city,
    country_name,
    state_name,
  } = address || {};

  const fullName = `${firstname ?? ""} ${lastname ?? ""}`.trim();
  const fullAddress = [address1, address2, city, state_name, country_name]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="border border-gray-100 p-6 flex flex-col gap-y-4 hover:border-[#00214c] transition-all duration-300 bg-white shadow-sm hover:shadow-md group">
        {/* Label + actions */}
        <div className="flex justify-between items-center">
          <h3 className="font-[Nunito-bold] text-[13px] text-[#00214c] uppercase tracking-widest bg-gray-50 px-2 py-1">
            {label || "Address"}
          </h3>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-1.5 font-[Nunito-medium] text-[12px] text-[#2563EB] hover:text-[#1d4ed8] transition-colors uppercase tracking-widest"
              onClick={onEdit}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <span className="text-gray-200 text-[10px]">|</span>
            <button
              className="flex items-center gap-1.5 font-[Nunito-medium] text-[12px] text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest"
              onClick={() => setShowConfirm(true)}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-50" />

        {/* Name | phone */}
        <div className="space-y-1">
            <p className="font-[Nunito-bold] text-[14px] text-[#2d2d2d] uppercase">
            {fullName}
            </p>
            <p className="font-[Nunito-medium] text-[13px] text-gray-500">
            {phone}
            </p>
        </div>

        {/* Full address */}
        <p className="font-[Nunito-regular] text-[13px] text-gray-400 leading-relaxed line-clamp-2">
          {fullAddress}
        </p>
      </div>

      <Popup 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)} 
        title="Delete Address" 
        maxWidth="max-w-[400px]"
        style={{ maxWidth: '400px' }}
      >
        <div className="text-center py-4">
          <p className="font-[Nunito-regular] text-[15px] text-gray-600 mb-8">
            Are you sure you want to delete <span className="font-[Nunito-bold] text-[#00214c]">&quot;{label || "this address"}&quot;</span>? This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1 h-[48px] text-[14px] font-[Nunito-bold] border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 h-[48px] text-[14px] font-[Nunito-bold] bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-red-100"
            >
              {isDeleting ? <Spinner size="sm" color="white" /> : "Delete"}
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
};
