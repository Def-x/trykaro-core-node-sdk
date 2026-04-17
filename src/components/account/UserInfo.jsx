"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useCore } from "../../context/CoreProvider";
import { Popup } from "../ui/Popup";
import { AddressForm } from "../common/AddressForm";
import { AddressCard } from "./AddressCard";
import { ProfileForm } from "./ProfileForm";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";

/**
 * UserInfo Component
 * 
 * Displays the "MY PROFILE" section, including user details and a grid of addresses.
 */
export const UserInfo = ({ user, isLoading, refetch }) => {
  const { actions } = useCore();
  const [addresses, setAddresses] = useState([]);
  const [isAddrLoading, setIsAddrLoading] = useState(false);
  const [modalState, setModalState] = useState({ type: null, data: null });

  const fetchAddresses = useCallback(async () => {
    if (!actions?.getUserAddress) return;
    setIsAddrLoading(true);
    try {
      const addrs = await actions.getUserAddress();
      console.log("addrs", { addrs });
      setAddresses(addrs || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsAddrLoading(false);
    }
  }, [actions]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const closeModal = () => setModalState({ type: null, data: null });

  console.log({ addresses })
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const userData = user || {};

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="font-[Nunito-regular] text-[32px] text-[#00214c] mb-10 tracking-tight">
        MY PROFILE
      </h1>

      {/* ── Profile Section ── */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-[Nunito-medium] text-[20px] text-[#2d2d2d] uppercase tracking-wider">
            Profile
          </h2>
          <button
            onClick={() => setModalState({ type: "profile", data: user })}
            className="text-[14px] font-[Nunito-medium] text-[#2563EB] hover:underline uppercase tracking-widest transition-all"
          >
            Edit
          </button>
        </div>

        <div className="border border-gray-100 p-8 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-[Nunito-bold] text-gray-400 uppercase tracking-widest">
                First name
              </label>
              <p className="border-b border-gray-100 pb-2 text-[15px] font-[Nunito-medium] text-[#00214c]">
                {userData.first_name || "—"}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-[Nunito-bold] text-gray-400 uppercase tracking-widest">
                Last name
              </label>
              <p className="border-b border-gray-100 pb-2 text-[15px] font-[Nunito-medium] text-[#00214c]">
                {userData.last_name || "—"}
              </p>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[12px] font-[Nunito-bold] text-gray-400 uppercase tracking-widest">
                Email address
              </label>
              <p className="border-b border-gray-100 pb-2 text-[15px] font-[Nunito-medium] text-[#00214c]">
                {userData.email || "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Addresses Section ── */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-[Nunito-medium] text-[20px] text-[#2d2d2d] uppercase tracking-wider">
            Addresses
          </h2>
          <button
            onClick={() => setModalState({ type: "new_address", data: null })}
            className="text-[14px] font-[Nunito-medium] text-[#2563EB] hover:underline uppercase tracking-widest transition-all"
          >
            Add new address
          </button>
        </div>

        {isAddrLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={() => setModalState({ type: "edit_address", data: addr })}
                onDelete={fetchAddresses}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📍"
            title="No Addresses Saved"
            description="You haven't added any shipping or billing addresses yet. Add one to make your checkout faster."
            action={
              <button
                onClick={() => setModalState({ type: "new_address", data: null })}
                className="mt-4 px-8 py-3 bg-[#00214c] text-white font-[Nunito-bold] text-[13px] uppercase tracking-widest hover:bg-black transition-colors"
              >
                Add Your First Address
              </button>
            }
            className="border border-dashed border-gray-200 bg-gray-50/10"
          />
        )}
      </section>

      {/* ── Modals ── */}
      <Popup
        isOpen={!!modalState.type}
        onClose={closeModal}
        title={
          modalState.type === "profile" ? "Edit Profile" :
            modalState.type === "new_address" ? "Add New Address" : "Edit Address"
        }
      >
        {modalState.type === "profile" ? (
          <ProfileForm
            user={user}
            onSuccess={() => { refetch(); closeModal(); }}
            onCancel={closeModal}
          />
        ) : (
          <AddressForm
            initialData={modalState.data}
            onSuccess={() => { fetchAddresses(); closeModal(); }}
            onCancel={closeModal}
            submitLabel={modalState.type === "new_address" ? "Add Address" : "Update Address"}
          />
        )}
      </Popup>
    </div>
  );
};
