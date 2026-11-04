"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Cookies from "js-cookie";
import { useUser, useClerk } from "@clerk/nextjs";
import { loginUser } from "../actions/storefrontActions";
import type { AuthState } from "../types/auth";

/**
 * Safe, zero-dependency JWT decoder for browser environments to verify expiration.
 */
function decodeJwt(token: string): { exp?: number; [key: string]: any } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export interface UseClerkStoreAuthOptions {
  /**
   * Custom server action to authenticate with backend.
   * Defaults to SDK's `loginUser`.
   */
  loginAction?: (payload: any) => Promise<any>;
  /**
   * Callback fired when token is successfully received and persisted.
   */
  onLoginSuccess?: (res: any) => void;
  /**
   * Post-logout redirect path. Defaults to "/".
   */
  redirectOnLogout?: string;
  /**
   * Custom navigation function (e.g. Next.js router.push).
   */
  navigate?: (path: string) => void;
}

/**
 * useClerkStoreAuth()
 *
 * Universal Clerk-to-Defx synchronization hook for storefronts.
 * 
 * - Listens to Clerk authentication state.
 * - Automatically exchanges Clerk session with Defx `/api/login` backend.
 * - Stores JWT token in cookie (`access_token`) and `localStorage` with expiry tracking.
 * - Cleans up session and cart data on logout.
 * - Compatible with <CoreProvider auth={auth}>.
 */
export function useClerkStoreAuth(options: UseClerkStoreAuthOptions = {}): AuthState {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token") || Cookies.get("access_token") || null;
    }
    return null;
  });

  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || typeof isSignedIn !== "boolean") return;

    const currentToken =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token") || Cookies.get("access_token")
        : null;

    let isTokenValid = false;
    if (currentToken) {
      const decoded = decodeJwt(currentToken);
      isTokenValid = Boolean(decoded?.exp && Date.now() / 1000 < decoded.exp);
    }

    // ❌ If user signed out of Clerk, clear Defx tokens
    if (!isSignedIn) {
      if (currentToken) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("cartid");
          localStorage.removeItem("user");
        }
        Cookies.remove("access_token", { path: "/" });
        setToken(null);
      }
      return;
    }

    // ✅ If signed into Clerk but no valid Defx token exists, exchange with backend
    if (isSignedIn && user && !isTokenValid && !isSyncingRef.current) {
      isSyncingRef.current = true;

      const payload = {
        clerk_id: user.id,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        email:
          user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress ||
          "",
      };

      const loginFn = options.loginAction || loginUser;

      loginFn(payload)
        .then((res: any) => {
          const newToken = res?.token || res?.access_token;
          if (newToken) {
            setToken(newToken);

            if (typeof window !== "undefined") {
              localStorage.setItem("access_token", newToken);
            }

            const decoded = decodeJwt(newToken);
            const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : undefined;
            const isHttps =
              typeof window !== "undefined" && window.location.protocol === "https:";

            Cookies.set("access_token", newToken, {
              expires: expiresAt,
              secure: isHttps,
              sameSite: isHttps ? "None" : "Lax",
              path: "/",
            });

            options.onLoginSuccess?.(res);
          }
        })
        .catch((err) => {
          console.error("[useClerkStoreAuth] Failed to sync Clerk session with Defx backend:", err);
        })
        .finally(() => {
          isSyncingRef.current = false;
        });
    }
  }, [isSignedIn, isLoaded, user?.id, options.loginAction, options.onLoginSuccess]);

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cartid");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
    Cookies.remove("access_token", { path: "/" });
    setToken(null);

    try {
      await clerk.signOut?.();
    } catch (err) {
      console.error("[useClerkStoreAuth] Error signing out from Clerk:", err);
    }

    const redirectPath = options.redirectOnLogout ?? "/";
    if (options.navigate) {
      options.navigate(redirectPath);
    } else if (typeof window !== "undefined") {
      window.location.href = redirectPath;
    }
  }, [clerk, options.redirectOnLogout, options.navigate]);

  const openSignIn = useCallback(
    (opts?: any) => {
      clerk.openSignIn?.(opts);
    },
    [clerk]
  );

  const openSignUp = useCallback(
    (opts?: any) => {
      clerk.openSignUp?.(opts);
    },
    [clerk]
  );

  return useMemo(
    () => ({
      isSignedIn: Boolean(isSignedIn),
      isLoaded: Boolean(isLoaded),
      user,
      token,
      access_token: token,
      logout,
      openSignIn,
      openSignUp,
    }),
    [isSignedIn, isLoaded, user, token, logout, openSignIn, openSignUp]
  );
}

export default useClerkStoreAuth;

