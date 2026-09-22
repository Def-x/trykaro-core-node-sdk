"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useCore } from "../../context/CoreProvider";
import { Popup } from "../ui/Popup";
import { AddressForm } from "../common/AddressForm";
import { AccountMapPinIcon, AccountPencilIcon, AccountPlusIcon, AccountTrashIcon } from "./AccountIcons";

const normalizeAddresses = (payload) => payload?.data ?? payload?.addresses ?? (Array.isArray(payload) ? payload : []);

export const AccountAddressesPage = () => {
  const { actions, toast, auth } = useCore();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAddresses = useCallback(
    async (options = {}) => {
      const token = auth?.token ?? auth?.access_token ?? null;
      const signedIn = !!((auth?.isSignedIn ?? false) && token);
      if (!signedIn) {
        setAddresses([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await actions?.getUserAddress?.(options);
        setAddresses(normalizeAddresses(res));
      } catch (error) {
        console.error("Failed to fetch addresses", error);
        toast?.error?.("Failed to fetch addresses");
      } finally {
        setIsLoading(false);
      }
    },
    [actions, toast, auth?.isSignedIn, auth?.token, auth?.access_token],
  );

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAddModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const deleteAddress = async (addressId) => {
    if (!addressId) return;
    setDeletingId(addressId);
    try {
      await actions?.deleteAddress?.(addressId);
      await fetchAddresses({ force: true });
      toast?.success?.("Address deleted successfully");
    } catch (error) {
      console.error("Failed to delete address", error);
      toast?.error?.("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-[20px] font-[var(--font-bold)] text-[#1C1C1C]">My addresses</h1>

      <button onClick={openAddModal} className="mb-5 flex items-center gap-1.5 text-[14px] font-[var(--font-semibold)] text-[var(--core-primary)] transition-opacity hover:opacity-80">
        <AccountPlusIcon className="h-4 w-4" strokeWidth={2.5} />
        Add new address
      </button>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="py-4 text-[14px] text-gray-500 animate-pulse">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="py-4 text-[14px] text-gray-500">You have no saved addresses.</div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="flex items-start justify-between border-b border-gray-100 py-4 last:border-0">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-[var(--core-primary)]">
                  <AccountMapPinIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[15px] font-[var(--font-bold)] leading-snug text-[#1C1C1C]">{address.label || address.address_type || "Home"}</p>
                  <p className="mt-0.5 max-w-[480px] text-[13px] font-[var(--font-regular)] leading-relaxed text-[#888888]">
                    {address.firstname} {address.lastname}<br />
                    {address.address1}{address.address2 ? `, ${address.address2}` : ""}<br />
                    {[address.city, address.state_name].filter(Boolean).join(", ")}{address.zipcode ? ` - ${address.zipcode}` : ""}
                  </p>
                </div>
              </div>
              <div className="mt-1 flex flex-shrink-0 items-center gap-2">
                <button type="button" onClick={() => openEditModal(address)} className="flex items-center justify-center rounded-full p-1.5 text-[#888888] transition-colors hover:bg-gray-100 hover:text-[var(--core-primary)]">
                  <AccountPencilIcon className="h-4 w-4" />
                </button>
                <button type="button" disabled={deletingId === address.id} onClick={() => deleteAddress(address.id)} className="flex items-center justify-center rounded-full p-1.5 text-[#888888] transition-colors hover:bg-gray-100 hover:text-red-500 disabled:opacity-50">
                  {deletingId === address.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" /> : <AccountTrashIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Popup isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AddressForm
          initialData={editingAddress}
          onCancel={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchAddresses({ force: true });
          }}
          submitLabel={editingAddress?.id ? "Save Changes" : "Save Address"}
        />
      </Popup>
    </div>
  );
};
