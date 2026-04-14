"use client";

import { useCore } from "../context/CoreProvider";

/**
 * useAuth()
 *
 * Returns the injected auth object from CoreProvider.
 * The store is responsible for passing its own auth implementation
 * (e.g. Clerk, NextAuth, custom JWT) via the `auth` prop on <CoreProvider>.
 *
 * Expected shape of the `auth` object (all fields optional):
 * {
 *   isSignedIn: boolean,
 *   user: { id, firstName, lastName, email, ... },
 *   logout: () => Promise<void>,
 *   token: string | null,
 * }
 *
 * Usage:
 *  const { isSignedIn, user } = useAuth();
 */
export const useAuth = () => {
    const { auth } = useCore();
    return auth ?? {};
};