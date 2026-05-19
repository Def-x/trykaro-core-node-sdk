"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
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
      // Clear auth state in CoreProvider
      if (auth?.clearAuth) {
        auth.clearAuth();
      }

      // Remove localStorage items
      localStorage.removeItem("cartid");
      localStorage.removeItem("access_token");

      // Remove non-HttpOnly cookies via js-cookie (fallback for client-set cookies)
      try {
        Cookies.remove("access_token", { path: "/" });
      } catch (e) {
        console.error("Failed to remove cookies using js-cookie:", e);
      }

      // Expire via document.cookie (works only for non-HttpOnly cookies)
      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";

      // ✅ Server-side cookie removal: clears HttpOnly cookies by responding
      // with Set-Cookie: access_token=; Max-Age=0. js-cookie / document.cookie
      // CANNOT remove HttpOnly cookies — only the server can.
      try {
        await fetch("/api/logout", { method: "POST" });
      } catch (e) {
        console.error("Failed to call /api/logout:", e);
      }

      router.push("/");
    }

    router.refresh();
  };

  return logout;
};
