"use client";

import Cookies from "js-cookie";
import { useCore } from "../context/CoreProvider";
import { useStorefrontRouter } from "../utils/navigation";

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
export const useLogout = (): (() => Promise<void>) => {
  const { auth, adapter } = useCore();
  const router = useStorefrontRouter(adapter?.router);

  const logout = async (): Promise<void> => {
    if (auth?.logout) {
      await auth.logout();
    } else {
      // Clear auth state in CoreProvider
      if (auth?.clearAuth) {
        auth.clearAuth();
      }

      // Remove localStorage items
      if (typeof window !== "undefined") {
        localStorage.removeItem("cartid");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }

      // Remove non-HttpOnly cookies via js-cookie (fallback for client-set cookies)
      try {
        Cookies.remove("access_token", { path: "/" });
      } catch (e) {
        console.error("Failed to remove cookies using js-cookie:", e);
      }

      // Expire via document.cookie (works only for non-HttpOnly cookies)
      if (typeof document !== "undefined") {
        document.cookie =
          "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      }

      // Clear HttpOnly cookies on the host server if /api/logout exists
      try {
        await fetch("/api/logout", { method: "POST" });
      } catch (e) {
        // Optional route on host — non-blocking
      }

      router.push("/");
      router.refresh();
      return;
    }

    router.refresh();
  };

  return logout;
};
