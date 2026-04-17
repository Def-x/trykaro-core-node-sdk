"use client";

import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import Cookies from "js-cookie";

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
    const { signOut } = useClerk();
    const router = useRouter();

    const logout = async () => {
        localStorage.removeItem("cartid");
        localStorage.removeItem("access_token");
        Cookies.remove("access_token", { path: "/" });
        await signOut();
        router.push("/");
        router.refresh();
    };

    return logout;
};
