"use client";

import React from "react";
import { CoreProvider, type CoreProviderProps } from "./CoreProvider";
import { useClerkStoreAuth, type UseClerkStoreAuthOptions } from "../hooks/useClerkStoreAuth";

export interface ClerkStoreProviderProps extends Omit<CoreProviderProps, "auth"> {
  authOptions?: UseClerkStoreAuthOptions;
}

/**
 * ClerkStoreProvider
 *
 * Pre-wired CoreProvider that automatically hooks into Clerk authentication,
 * synchronizes session tokens with the Defx backend, and supplies auth context
 * to all downstream storefront hooks and components.
 */
export const ClerkStoreProvider: React.FC<ClerkStoreProviderProps> = ({
  children,
  authOptions,
  config,
  ...props
}) => {
  const auth = useClerkStoreAuth(authOptions);

  const resolvedConfig = {
    ...config,
    authType: "clerk" as const,
  };

  return (
    <CoreProvider config={resolvedConfig} auth={auth} {...props}>
      {children}
    </CoreProvider>
  );
};

export default ClerkStoreProvider;

