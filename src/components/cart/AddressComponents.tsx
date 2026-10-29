"use client";

import React, { useState, useCallback } from "react";
import { useCore } from "../../context/CoreProvider";
import { Popup } from "../ui/Popup";
import { AddressForm } from "../common/AddressForm";
import type { Address } from "../../types/order";
import type { Cart } from "../../types/cart";

// ─── AddressFormInline (when no addresses exist) ───────────────────────────────
export interface AddressFormInlineProps {
  refetch?: () => void;
}

export const AddressFormInline: React.FC<AddressFormInlineProps> = ({ refetch }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <p className="font-[var(--font-regular)] text-[14px] text-[var(--secondary)] mb-3">
        No addresses saved yet.
      </p>
      <button
        onClick={() => setIsOpen(true)}
        className="font-[var(--font-medium)] text-[var(--main)] underline text-sm"
      >
        + Add your first address
      </button>
      <AddAddressForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        refetch={refetch}
      />
    </div>
  );
};

// ─── AddAddressForm (Modal) ──────────────────────────────────────────────────
export interface AddAddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const AddAddressForm: React.FC<AddAddressFormProps> = ({
  isOpen,
  onClose,
  refetch,
}) => {
  return (
    <Popup isOpen={isOpen} onClose={onClose} title="Add New Address">
      <AddressForm
        onSuccess={() => {
          refetch?.();
          onClose();
        }}
        onCancel={onClose}
        submitLabel="Add Address"
      />
    </Popup>
  );
};

// ─── AddressSelection ──────────────────────────────────────────────────────────
export interface AddressSelectionProps {
  cart: Cart | any;
  setCart: React.Dispatch<React.SetStateAction<any>>;
  address: any[];
  sameAsShipping: boolean;
  user?: any;
  setSameAsShipping: (val: boolean) => void;
  shippingAddressId?: string | number | null;
  billingAddressId?: string | number | null;
  setSelectedAddress: React.Dispatch<React.SetStateAction<any>>;
  isCartHaveBillingAddress?: boolean;
  isCarthaveShippingAddress?: boolean;
  refetch?: () => void;
}

export const AddressSelection: React.FC<AddressSelectionProps> = ({
  cart,
  setCart,
  address = [],
  sameAsShipping,
  setSameAsShipping,
  shippingAddressId,
  billingAddressId,
  setSelectedAddress,
  refetch,
}) => {
  const { actions } = useCore();
  const [isOpenAddAddress, setIsOpenAddAddress] = useState(false);

  const updateCart = useCallback(
    async (apiData: any) => {
      try {
        if (actions?.updateCart) {
          const res = await actions.updateCart(apiData?.id, apiData);
          setCart(res);
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

  const onSelectedAddress = (addressId: string | number, type: "shipping" | "billing") => {
    const apiData: any = { id: cart?.id };
    if (type === "billing") {
      setSelectedAddress((prev: any) => ({ ...prev, billingAddressId: addressId }));
      apiData.billing_address_id = addressId;
    } else {
      setSelectedAddress((prev: any) => ({ ...prev, shippingAddressId: addressId }));
      apiData.shipping_address_id = addressId;
    }
    updateCart(apiData);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full space-y-8">
        {/* Shipping Address */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-[var(--font-medium)] text-[20px] text-[var(--main)] tracking-wide">
              SHIPPING ADDRESS
            </h2>
            <button
              className="text-base font-[var(--font-medium)] text-[var(--main)] hover:underline"
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
            <h2 className="font-[var(--font-medium)] text-[20px] text-[var(--main)] tracking-wide">
              BILLING ADDRESS
            </h2>
            <button
              className="text-base font-[var(--font-medium)] text-[var(--main)] hover:underline"
              onClick={() => setIsOpenAddAddress(true)}
            >
              Add new address
            </button>
          </div>

          {/* Same as shipping toggle */}
          <div
            className={`flex items-center justify-between mb-6 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              sameAsShipping
                ? "border-[var(--core-primary)] bg-gray-50 shadow-sm"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={onSwitchChange}
          >
            <p className="font-[var(--font-medium)] text-base text-[var(--main)]">
              Same as Shipping address
            </p>
            <div className="relative w-12 h-6 flex items-center">
              <div
                className={`w-full h-full rounded-full transition-colors duration-300 ${
                  sameAsShipping ? "bg-[var(--core-primary)]" : "bg-gray-300"
                }`}
              />
              <div
                className={`absolute left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  sameAsShipping ? "translate-x-6" : "translate-x-0"
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

      <AddAddressForm
        isOpen={isOpenAddAddress}
        onClose={() => setIsOpenAddAddress(false)}
        refetch={refetch}
      />
    </div>
  );
};

// ─── AddressSelectionCard ──────────────────────────────────────────────────────
export interface AddressSelectionCardProps {
  data: Partial<Address> & Record<string, any>;
  isSelected?: boolean;
  onClick?: () => void;
  isShippingAddress?: boolean;
}

export const AddressSelectionCard: React.FC<AddressSelectionCardProps> = ({
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
      className={`w-full flex flex-col border-2 cursor-pointer transition-all duration-200 rounded-lg p-[16px] gap-y-[8px] ${
        isSelected
          ? "border-[var(--core-primary)] bg-gray-50 shadow-sm"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <p className="font-[var(--font-medium)] text-[var(--main)] text-base truncate">
        {label}
        {isShippingAddress && (
          <span className="font-[var(--font-regular)] text-[14px] text-[var(--secondary)] ml-1">
            (Current shipping address)
          </span>
        )}
      </p>
      <div className="border-t border-[var(--borders)]" />
      <p className="font-[var(--font-regular)] text-[14px] text-[var(--main)] break-words">
        {fullName} | {phone}
      </p>
      <div className="border-t border-[var(--borders)]" />
      <p
        className="font-[var(--font-regular)] text-[14px] text-[var(--main)] w-full break-words overflow-hidden text-ellipsis"
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
export interface AddressCardProps {
  addressType?: string;
  address?: React.ReactNode;
  type?: string;
  isSelected?: boolean;
  onClick?: () => void;
  paymentLabel?: string;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  addressType,
  address,
  type,
  isSelected,
  onClick,
  paymentLabel,
}) => {
  const isPayment =
    type === "stripe" ||
    type === "payment" ||
    type === "phonepe" ||
    type === "razorpay";

  return (
    <div
      className={`w-full border-2 p-[16px] transition-all duration-200 rounded-lg ${
        isSelected || isPayment
          ? "border-[var(--core-primary)] bg-gray-50 shadow-sm"
          : "border-gray-200 hover:border-gray-300"
      } ${!isPayment ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {isPayment ? (
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col justify-between">
            <p className="font-[var(--font-medium)] text-base text-[var(--main)]">
              {addressType}
            </p>
            <p
              className="font-[var(--font-regular)] text-[var(--main)] text-[14px] mt-[8px] break-words"
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
            <div className="px-2.5 h-[30px] min-w-[60px] bg-[var(--secondaryBg)] border border-[var(--borders)] rounded flex items-center justify-center">
              <span className="text-[11px] font-[var(--font-bold)] text-[var(--main)] whitespace-nowrap">
                {paymentLabel ??
                  (type === "stripe"
                    ? "Stripe"
                    : type === "phonepe"
                      ? "PhonePe"
                      : type === "razorpay"
                        ? "Razorpay"
                        : "Payment")}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-row justify-between items-center">
            <p className="font-[var(--font-medium)] text-base text-[var(--main)]">
              {addressType}
            </p>
          </div>
          <p
            className="font-[var(--font-regular)] text-[var(--main)] text-[14px] mt-[8px] break-words"
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

