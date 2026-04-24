"use client";

import React, { useState } from "react";
import { useCore } from "../../context/CoreProvider";

/**
 * AddressForm Component
 * 
 * A reusable form for creating or updating user addresses.
 * 
 * Props:
 * - initialData: object (optional) - Existing address data for editing
 * - onSuccess: function (optional) - Called after successful submission
 * - onCancel: function (optional) - Called when cancel button is clicked
 * - submitLabel: string (optional) - Label for the submit button (default: 'Save Address')
 */
export const AddressForm = ({
  initialData,
  onSuccess,
  onCancel,
  submitLabel = "Save Address"
}) => {
  const { actions, toast } = useCore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    address_type: initialData?.address_type || "shipping",
    address1: initialData?.address1 || "",
    address2: initialData?.address2 || "",
    city: initialData?.city || "",
    zipcode: initialData?.zipcode || "",
    phone: initialData?.phone || "",
    firstname: initialData?.firstname || "",
    lastname: initialData?.lastname || "",
    state_name: initialData?.state_name || "",
    country_name: initialData?.country_name || "India",
    country_iso3: initialData?.country_iso3 || "IND",
    country_iso: initialData?.country_iso || "IN",
    state_code: initialData?.state_code || "",
    label: initialData?.label || "Home",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        // Update existing address
        if (actions?.updateAddress) {
          await actions.updateAddress(initialData.id, formData);
          toast?.success?.("Address updated successfully!");
        } else {
          throw new Error("actions.updateAddress is not defined");
        }
      } else {
        // Create new address
        if (actions?.createAddress) {
          await actions.createAddress(formData);
          toast?.success?.("Address added successfully!");
        } else {
          throw new Error("actions.createAddress is not defined");
        }
      }
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save address:", err);
      toast?.error?.(err.message || "Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]";
  const labelCls = "text-sm font-[Nunito-bold] text-[#00214c]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelCls}>First Name *</label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            placeholder="First name"
            required
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Last Name *</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            placeholder="Last name"
            required
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Phone *</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone number"
          required
          className={inputCls}
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Address Line 1 *</label>
        <input
          type="text"
          name="address1"
          value={formData.address1}
          onChange={handleChange}
          placeholder="Street address"
          required
          className={inputCls}
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Address Line 2</label>
        <input
          type="text"
          name="address2"
          value={formData.address2}
          onChange={handleChange}
          placeholder="Apartment, suite, etc."
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelCls}>City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            required
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>State/Province *</label>
          <input
            type="text"
            name="state_name"
            value={formData.state_name}
            onChange={handleChange}
            placeholder="State"
            required
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelCls}>Country *</label>
          <input
            type="text"
            name="country_name"
            value={formData.country_name}
            onChange={handleChange}
            placeholder="Country"
            required
            className={`${inputCls} bg-gray-50`}
          />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Postal Code *</label>
          <input
            type="text"
            name="zipcode"
            value={formData.zipcode}
            onChange={handleChange}
            placeholder="Postal code"
            required
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Label (e.g., Home, Office)</label>
        <input
          type="text"
          name="label"
          value={formData.label}
          onChange={handleChange}
          placeholder="Label"
          className={inputCls}
        />
      </div>

      {/* Footer Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 bg-[#00214c] text-white rounded-md font-[Nunito-bold] transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-[12px] shadow-lg shadow-blue-100 ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-black"
            }`}
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isSubmitting ? "Saving..." : submitLabel}
        </button>

        <div className="flex gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-gray-100 rounded-md text-[#00214c] font-[Nunito-bold] hover:bg-gray-50 transition-colors uppercase tracking-widest text-[12px]"
            >
              Cancel
            </button>
          )}

          {initialData?.id && actions?.deleteAddress && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this address?")) {
                  setIsSubmitting(true);
                  try {
                    await actions.deleteAddress(initialData.id);
                    toast?.success?.("Address deleted successfully.");
                    onSuccess?.();
                  } catch (err) {
                    toast?.error?.("Failed to delete address.");
                  } finally {
                    setIsSubmitting(false);
                  }
                }
              }}
              className="flex-1 py-3 border border-red-100 text-red-500 rounded-md font-[Nunito-bold] hover:bg-red-50 transition-colors uppercase tracking-widest text-[12px]"
            >
              Delete Address
            </button>
          )}
        </div>
      </div>
    </form>
  );
};
