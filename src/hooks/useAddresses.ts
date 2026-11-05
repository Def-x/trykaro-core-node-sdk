"use client";

import { useCore } from "../context/CoreProvider";

/**
 * useAddresses() — @defx/storefront-core
 *
 * Hook to access user addresses, loading state, and mutations.
 * Shared across Cart and Profile with automatic cache management.
 */
export function useAddresses() {
  const { addresses, isAddressLoading, refreshAddresses, actions, auth } = useCore();

  const token = auth?.token ?? auth?.access_token ?? null;
  const isSignedIn = !!((auth?.isSignedIn ?? false) && token);

  return {
    addresses: isSignedIn ? addresses : [],
    isAddressLoading,
    isSignedIn,
    refreshAddresses: actions?.refreshAddresses || refreshAddresses,
    createAddress: actions?.createAddress,
    updateAddress: actions?.updateAddress,
    deleteAddress: actions?.deleteAddress,
    getUserAddress: actions?.getUserAddress,
  };
}
