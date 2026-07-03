"use client";

import React, { useState } from "react";
import { useCore } from "../../context/CoreProvider";
import { Spinner } from "../ui/Spinner";

/**
 * ProfileForm Component
 * 
 * A form to update user details (First Name, Last Name, Email).
 */
export const ProfileForm = ({ user, onSuccess, onCancel }) => {
  const { actions, toast, config } = useCore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userData = user?.attributes || user?.data?.attributes || user || {};

  const [formData, setFormData] = useState({
    firstName: userData.first_name || "",
    lastName: userData.last_name || "",
    contactInfo: config?.authType === "own" 
      ? (userData.phone || userData.mobile || userData.phone_number || "") 
      : (userData.email || ""),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (actions?.updateUser) {
        // Adjust payload based on what the action expects (usually attributes)
        await actions.updateUser(userData?.id, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          ...(config?.authType === "own" ? { phone: formData.contactInfo } : { email: formData.contactInfo }),
        });
        toast?.success?.("Profile updated successfully!");
        onSuccess?.();
      } else {
        throw new Error("actions.updateUser is not defined");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast?.error?.(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--core-primary)] font-[var(--font-regular)]";
  const labelCls = "text-sm font-[var(--font-bold)] text-[var(--core-primary)] uppercase tracking-widest text-[11px]";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className={labelCls}>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            required
            className={inputCls}
          />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            required
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelCls}>
          {config?.authType === "own" ? "Phone Number" : "Email Address"}
        </label>
        <input
          type={config?.authType === "own" ? "tel" : "email"}
          name="contactInfo"
          value={formData.contactInfo}
          onChange={handleChange}
          placeholder={`Enter ${config?.authType === "own" ? "phone number" : "email address"}`}
          required
          className={inputCls}
        />
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-4 border-t border-gray-100 bg-white px-4 pt-4 pb-1 sm:-mx-6 sm:flex-row sm:px-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 rounded-md text-[var(--core-primary)] font-[var(--font-bold)] hover:bg-gray-50 transition-colors uppercase tracking-widest text-[12px]"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 py-3 bg-[var(--core-primary)] text-white rounded-md font-[var(--font-bold)] transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-[12px] shadow-lg shadow-blue-100 ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
            }`}
        >
          {isSubmitting ? <Spinner size="sm" color="white" /> : "Save Changes"}
        </button>
      </div>
    </form>
  );
};
