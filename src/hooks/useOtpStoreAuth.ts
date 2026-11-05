"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Cookies from "js-cookie";
import { loginUser, signUpUser, verifyOtp, getUserAction } from "../actions/storefrontActions";
import type { AuthState } from "../types/auth";

/**
 * Safe, zero-dependency JWT decoder for browser environments to verify expiration.
 */
function decodeJwt(token: string): { exp?: number; sub?: string; user_id?: string; id?: string; [key: string]: any } | null {
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

export function isTokenExpired(token?: string | null): boolean {
  if (!token) return true;
  const decoded = decodeJwt(token);
  if (!decoded?.exp) return false;
  return Date.now() / 1000 >= decoded.exp;
}

export interface UseOtpStoreAuthOptions {
  onLoginSuccess?: (res: any) => void;
  redirectOnLogout?: string;
  navigate?: (path: string) => void;
  countryCode?: string;
}

/**
 * useOtpStoreAuth()
 *
 * Built-in Defx Phone OTP authentication hook for storefronts.
 * 
 * - Manages session tokens (persisted in cookies and localStorage).
 * - Automatic token expiration validation.
 * - Auto-hydrates user profile via `/api/users`.
 * - Exposes phone login, signup, and verifyOtp actions.
 * - Controls AuthModal visibility and mode ("signin" | "signup").
 * - Formatted for <CoreProvider auth={auth}>.
 */
export function useOtpStoreAuth(options: UseOtpStoreAuthOptions = {}) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Hydrate from localStorage / Cookies on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken =
      localStorage.getItem("access_token") || Cookies.get("access_token") || null;

    if (!storedToken || isTokenExpired(storedToken)) {
      if (storedToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        Cookies.remove("access_token", { path: "/" });
      }
      setToken(null);
      setUser(null);
      setUserId(null);
      setIsLoaded(true);
      return;
    }

    setToken(storedToken);

    const decoded = decodeJwt(storedToken);
    const resolvedUserId = decoded?.sub ?? decoded?.user_id ?? decoded?.id ?? null;
    setUserId(resolvedUserId);

    let storedUser: any = null;
    try {
      const u = localStorage.getItem("user");
      if (u) storedUser = JSON.parse(u);
    } catch {}

    if (storedUser) {
      setUser(storedUser);
      setIsLoaded(true);
    } else {
      getUserAction({ token: storedToken })
        .then((fetchedUser) => {
          if (fetchedUser && !fetchedUser.error && !fetchedUser.serverError) {
            setUser(fetchedUser);
            localStorage.setItem("user", JSON.stringify(fetchedUser));
          }
        })
        .catch((err) => {
          console.warn("[useOtpStoreAuth] Failed to fetch user profile:", err);
        })
        .finally(() => {
          setIsLoaded(true);
        });
    }
  }, []);

  const setAuth = useCallback((data: any) => {
    const nextToken = data?.token || data?.access_token || null;
    const nextUser = data?.user || null;

    setToken(nextToken);
    setUser(nextUser);

    if (nextToken) {
      const decoded = decodeJwt(nextToken);
      const resolvedUserId = decoded?.sub ?? decoded?.user_id ?? decoded?.id ?? null;
      setUserId(resolvedUserId);

      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", nextToken);
        if (nextUser) {
          localStorage.setItem("user", JSON.stringify(nextUser));
        }
      }

      const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : undefined;
      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";

      Cookies.set("access_token", nextToken, {
        expires: expiresAt,
        secure: isHttps,
        sameSite: isHttps ? "None" : "Lax",
        path: "/",
      });
    } else {
      setUserId(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
      Cookies.remove("access_token", { path: "/" });
    }
  }, []);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    setUserId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("cartid");
    }
    Cookies.remove("access_token", { path: "/" });
  }, []);

  const logout = useCallback(async () => {
    clearAuth();
    const redirectPath = options.redirectOnLogout ?? "/";
    if (options.navigate) {
      options.navigate(redirectPath);
    } else if (typeof window !== "undefined") {
      window.location.href = redirectPath;
    }
  }, [clearAuth, options.redirectOnLogout, options.navigate]);

  const openSignIn = useCallback(() => {
    setAuthMode("signin");
    setIsAuthOpen(true);
  }, []);

  const openSignUp = useCallback(() => {
    setAuthMode("signup");
    setIsAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setIsAuthOpen(false);
  }, []);

  const sendLoginOtp = useCallback(
    async (phone: string, countryCode = options.countryCode ?? "+91") => {
      return loginUser({ phone, country_code: countryCode });
    },
    [options.countryCode]
  );

  const sendSignUpOtp = useCallback(
    async (payload: { firstName: string; lastName: string; phone: string; countryCode?: string }) => {
      return signUpUser({
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        countryCode: payload.countryCode ?? options.countryCode ?? "+91",
      });
    },
    [options.countryCode]
  );

  const verifyPhoneOtp = useCallback(
    async (phone: string, code: string, countryCode = options.countryCode ?? "+91") => {
      const res = await verifyOtp({ phone, country_code: countryCode, code });
      const newToken = res?.token || res?.access_token;
      if (newToken) {
        setAuth({
          token: newToken,
          access_token: newToken,
          user: res?.user ?? null,
        });
        options.onLoginSuccess?.(res);
      }
      return res;
    },
    [options.countryCode, options.onLoginSuccess, setAuth]
  );

  return useMemo<AuthState & {
    isAuthOpen: boolean;
    authMode: "signin" | "signup";
    closeAuth: () => void;
    sendLoginOtp: (phone: string, countryCode?: string) => Promise<any>;
    sendSignUpOtp: (payload: { firstName: string; lastName: string; phone: string; countryCode?: string }) => Promise<any>;
    verifyPhoneOtp: (phone: string, code: string, countryCode?: string) => Promise<any>;
  }>(
    () => ({
      isSignedIn: Boolean(token && !isTokenExpired(token)),
      isLoaded,
      user,
      userId,
      token,
      access_token: token,
      logout,
      openSignIn,
      openSignUp,
      setAuth,
      clearAuth,
      isAuthOpen,
      authMode,
      closeAuth,
      sendLoginOtp,
      sendSignUpOtp,
      verifyPhoneOtp,
    }),
    [
      token,
      isLoaded,
      user,
      userId,
      logout,
      openSignIn,
      openSignUp,
      setAuth,
      clearAuth,
      isAuthOpen,
      authMode,
      closeAuth,
      sendLoginOtp,
      sendSignUpOtp,
      verifyPhoneOtp,
    ]
  );
}

export default useOtpStoreAuth;

