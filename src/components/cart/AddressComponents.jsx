"use client";

import React, { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCore } from "../../context/CoreProvider";

// ─── AddressFormInline (when no addresses exist) ───────────────────────────────
export const AddressFormInline = ({ refetch }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <p className="font-[Nunito-regular] text-[14px] text-[var(--secondary)] mb-3">
        No addresses saved yet.
      </p>
      <button
        onClick={() => setIsOpen(true)}
        className="font-[Nunito-medium] text-[var(--main)] underline text-sm"
      >
        + Add your first address
      </button>
      {/* Popup integration */}
      <AddAddressForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        refetch={refetch}
      />
    </div>
  );
};

// ─── AddAddressForm (Modal) ──────────────────────────────────────────────────
export const AddAddressForm = ({ isOpen, onClose, refetch }) => {
  const { actions, toast } = useCore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    address_type: "shipping",
    address1: "",
    address2: "",
    city: "",
    zipcode: "",
    phone: "",
    firstname: "",
    lastname: "",
    state_name: "",
    country_name: "India",
    country_iso3: "IND",
    country_iso: "IN",
    state_code: "",
    label: "Home",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (actions?.createAddress) {
        await actions.createAddress(formData);
        toast?.success?.("Address added successfully!");
        refetch?.();
        onClose();
      } else {
        console.error("actions.createAddress is not defined");
        toast?.error?.("Failed to add address: Action not found");
      }
    } catch (err) {
      console.error("Failed to add address:", err);
      toast?.error?.("Failed to add address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999999] p-4 backdrop-blur-[2px]">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-[600px] overflow-hidden max-h-[90vh] overflow-y-auto relative border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h2 className="text-[20px] font-[Nunito-bold] text-[#00214c]">
            Add New Address
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-[Nunito-bold] text-[#00214c]">
                First Name *
              </label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                placeholder="First name"
                required
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-[Nunito-bold] text-[#00214c]">
                Last Name *
              </label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Last name"
                required
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-[Nunito-bold] text-[#00214c]">
              Phone *
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              required
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-[Nunito-bold] text-[#00214c]">
              Address Line 1 *
            </label>
            <input
              type="text"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              placeholder="Street address"
              required
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-[Nunito-bold] text-[#00214c]">
              Address Line 2
            </label>
            <input
              type="text"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
              placeholder="Apartment, suite, etc."
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-[Nunito-bold] text-[#00214c]">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-[Nunito-bold] text-[#00214c]">
                State/Province *
              </label>
              <input
                type="text"
                name="state_name"
                value={formData.state_name}
                onChange={handleChange}
                placeholder="State"
                required
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-[Nunito-bold] text-[#00214c]">
                Country *
              </label>
              <input
                type="text"
                name="country_name"
                value={formData.country_name}
                onChange={handleChange}
                placeholder="Country"
                required
                className="w-full border border-gray-300 rounded-md p-3 text-sm bg-gray-50 focus:outline-none font-[Nunito-regular]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-[Nunito-bold] text-[#00214c]">
                Postal Code *
              </label>
              <input
                type="text"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                placeholder="Postal code"
                required
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-[Nunito-bold] text-[#00214c]">
              Label (e.g., Home, Office)
            </label>
            <input
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              placeholder="Label"
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00214c] font-[Nunito-regular]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-md text-[#00214c] font-[Nunito-bold] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 bg-black text-white rounded-md font-[Nunito-bold] transition-colors flex items-center justify-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-black/90"
                }`}
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isSubmitting ? "Adding..." : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// ─── AddressSelection ──────────────────────────────────────────────────────────
export const AddressSelection = ({
  cart,
  setCart,
  address,
  sameAsShipping,
  clerkUser,
  setSameAsShipping,
  shippingAddressId,
  billingAddressId,
  setSelectedAddress,
  isCartHaveBillingAddress,
  isCarthaveShippingAddress,
  refetch,
}) => {
  const { actions } = useCore();
  const [isOpenAddAddress, setIsOpenAddAddress] = useState(false);


  const updateCart = useCallback(
    async (apiData) => {
      try {
        // Call updateCart action from context
        if (actions?.updateCart) {
          const res = await actions.updateCart(apiData?.id, apiData);
          setCart((prev) => (res));
        }
      } catch (err) {
        console.error("Failed to update cart address:", err);
      }
    },
    [actions, setCart],
  );

  const onSwitchChange = () => {
    const next = !sameAsShipping;
    setSameAsShipping(next);

    if (next) {
      updateCart({
        id: cart?.id,
        billing_address_id: shippingAddressId,
        shipping_address_id: shippingAddressId,
      });
    } else {
      const billingAddr = address.find((a) => a?.id !== shippingAddressId);
      updateCart({
        id: cart?.id,
        billing_address_id: billingAddr?.id,
        shipping_address_id: shippingAddressId,
      });
    }
  };

  const onSelectedAddress = (addressId, type) => {
    const apiData = { id: cart?.id };
    if (type === "billing") {
      setSelectedAddress((prev) => ({ ...prev, billingAddressId: addressId }));
      apiData.billing_address_id = addressId;
    } else {
      setSelectedAddress((prev) => ({ ...prev, shippingAddressId: addressId }));
      apiData.shipping_address_id = addressId;
    }
    updateCart(apiData);
  };

  useEffect(() => {
    if (!clerkUser) return;
    const apiData = { id: cart?.id };
    if (!isCartHaveBillingAddress && billingAddressId)
      apiData.billing_address_id = billingAddressId;
    if (!isCarthaveShippingAddress && shippingAddressId)
      apiData.shipping_address_id = sameAsShipping
        ? billingAddressId
        : shippingAddressId;
    if (apiData.billing_address_id || apiData.shipping_address_id) {
      updateCart(apiData);
    }
  }, [address, shippingAddressId, billingAddressId]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full space-y-8">
        {/* Shipping Address */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-[Nunito-medium] text-[20px] text-[var(--main)] tracking-wide">
              SHIPPING ADDRESS
            </h2>
            <button
              className="text-base font-[Nunito-medium] text-[var(--main)] hover:underline"
              onClick={() => setIsOpenAddAddress(true)}
            >
              Add new address
            </button>
          </div>
          <div className="w-full flex flex-col gap-y-[8px]">
            {address.map((data) => (
              <AddressSelectionCard
                key={data?.id}
                data={data}
                isSelected={data?.id === shippingAddressId}
                onClick={() => onSelectedAddress(data?.id, "shipping")}
              />
            ))}
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-[Nunito-medium] text-[20px] text-[var(--main)] tracking-wide">
              BILLING ADDRESS
            </h2>
            <button
              className="text-base font-[Nunito-medium] text-[var(--main)] hover:underline"
              onClick={() => setIsOpenAddAddress(true)}
            >
              Add new address
            </button>
          </div>

          {/* Same as shipping toggle */}
          <div
            className={`flex items-center justify-between mb-6 p-4 rounded-lg border cursor-pointer ${sameAsShipping
              ? "border-[var(--main)]"
              : "border-[var(--borders)]"
              }`}
            onClick={onSwitchChange}
          >
            <p className="font-[Nunito-medium] text-base text-[var(--main)]">
              Same as Shipping address
            </p>
            <div className="relative w-12 h-6 flex items-center">
              <div
                className={`w-full h-full rounded-full transition-colors duration-300 ${sameAsShipping ? "bg-[#00214c]" : "bg-gray-300"
                  }`}
              />
              <div
                className={`absolute left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${sameAsShipping ? "translate-x-6" : "translate-x-0"
                  }`}
              />
            </div>
          </div>

          {!sameAsShipping && (
            <div className="w-full flex flex-col gap-y-[8px]">
              {address.map((data) => {
                const isShipping = data?.id === shippingAddressId;
                if (isShipping) return null;
                return (
                  <AddressSelectionCard
                    key={data?.id}
                    data={data}
                    isSelected={data?.id === billingAddressId}
                    onClick={() => onSelectedAddress(data?.id, "billing")}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add address popup implemented Component */}
      <AddAddressForm
        isOpen={isOpenAddAddress}
        onClose={() => setIsOpenAddAddress(false)}
        refetch={refetch}
      />
    </div>
  );
};

// ─── AddressSelectionCard ──────────────────────────────────────────────────────
export const AddressSelectionCard = ({
  data,
  isSelected,
  onClick,
  isShippingAddress,
}) => {
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
  } = data || {};

  const fullName = `${firstname ?? ""} ${lastname ?? ""}`.trim();
  const fullAddress = [address1, address2, city, state_name, country_name]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      onClick={onClick}
      className={`w-full flex flex-col border-2 cursor-pointer transition-all duration-200 rounded-lg p-[16px] gap-y-[8px] ${isSelected
        ? "border-[#1e1e1e] bg-gray-50 shadow-sm"
        : "border-gray-200 hover:border-gray-300"
        }`}
    >
      <p className="font-[Nunito-medium] text-[var(--main)] text-base truncate">
        {label}
        {isShippingAddress && (
          <span className="font-[Nunito-regular] text-[14px] text-[var(--secondary)] ml-1">
            (Current shipping address)
          </span>
        )}
      </p>
      <div className="border-t border-[var(--borders)]" />
      <p className="font-[Nunito-regular] text-[14px] text-[var(--main)] break-words">
        {fullName} | {phone}
      </p>
      <div className="border-t border-[var(--borders)]" />
      <p
        className="font-[Nunito-regular] text-[14px] text-[var(--main)] w-full break-words overflow-hidden text-ellipsis"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {fullAddress}
      </p>
    </div>
  );
};

// ─── AddressCard ───────────────────────────────────────────────────────────────
export const AddressCard = ({
  addressType,
  address,
  type,
  isSelected,
  onClick,
}) => {
  const isPayment = type === "stripe";
  return (
    <div
      className={`w-full border p-[16px] transition-all duration-150 rounded-lg ${isPayment || isSelected
        ? "border-[var(--main)]"
        : "border-[var(--borders)]"
        } ${!isPayment ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {isPayment ? (
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col justify-between">
            <p className="font-[Nunito-medium] text-base text-[var(--main)]">
              {addressType}
            </p>
            <p
              className="font-[Nunito-regular] text-[var(--main)] text-[14px] mt-[8px] break-words"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {address}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            {/* Razorpay logo placeholder */}
            <div className="w-[60px] h-[30px] bg-[var(--secondaryBg)] border border-[var(--borders)] rounded flex items-center justify-center">
              <span className="text-[10px] font-[Nunito-bold] text-[var(--main)]">
                Razorpay
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-row justify-between items-center">
            <p className="font-[Nunito-medium] text-base text-[var(--main)]">
              {addressType}
            </p>
          </div>
          <p
            className="font-[Nunito-regular] text-[var(--main)] text-[14px] mt-[8px] break-words"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {address}
          </p>
        </div>
      )}
    </div>
  );
};
