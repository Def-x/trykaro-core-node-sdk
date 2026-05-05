"use client";

import { useRouter } from "next/navigation";
import { useCore } from "../context/CoreProvider";

/**
 * useLogout()
 *
 * Returns the logout function from the injected `auth` object.
 * The store wires up its own logout logic (Clerk signOut, NextAuth, etc.)
 * and passes it in via <CoreProvider auth={{ logout: ... }}>.
 *
 * The returned `logout` function should handle:
 *  - Clearing tokens / cookies
 *  - Signing out from the auth provider
 *  - Redirecting the user
 *
 * Usage:
 *  const logout = useLogout();
 *  <button onClick={logout}>Sign out</button>
 */
export const useLogout = () => {
    const { auth } = useCore();
    const router = useRouter();

    const logout = async () => {
        if (auth?.logout) {
            await auth.logout();
        } else {
            localStorage.removeItem("cartid");
            localStorage.removeItem("access_token");
            router.push("/");
        }
        router.refresh();
    };

    return logout;
};
