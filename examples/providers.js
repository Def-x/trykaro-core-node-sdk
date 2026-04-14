/**
 * examples/providers.js
 *
 * ─── Next.js Client Wrapper ────────────────────────────────────────────────
 *
 * This file lives in YOUR STOREFRONT APP — NOT in the package.
 * Copy this into your app: src/providers.js (or app/providers.js)
 *
 * It wires up CoreProvider with:
 *  - real server actions  (imported from your Next.js app)
 *  - Clerk auth           (or swap for NextAuth / custom)
 *  - react-toastify       (or swap for any toast library)
 *
 * Usage in layout.js:
 *   import { Providers } from "./providers";
 *   <Providers>{children}</Providers>
 */

"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { CoreProvider } from "@defx/storefront-core";

// ─── Import YOUR server actions ─────────────────────────────────────────────
import { getCartAction, getCartByIdAction, createCartAction } from "@/app/actions/createCartAction";
import { createLineItemAction, updateLineItemAction, deleteLineItemAction } from "@/app/actions/createLineItem";
import { loginUser } from "@/app/actions/auth";

// ─── Store config ────────────────────────────────────────────────────────────
const STORE_CONFIG = {
  storeId: process.env.NEXT_PUBLIC_STORE_ID ?? "store-1",
  regionId: process.env.NEXT_PUBLIC_DEFAULT_REGION_ID ?? null,
  currency: process.env.NEXT_PUBLIC_CURRENCY ?? "INR",
  locale: process.env.NEXT_PUBLIC_LOCALE ?? "en-IN",
};

// ─── Injected actions ────────────────────────────────────────────────────────
const actions = {
  getCart: (regionId) => getCartAction(regionId),
  getCartById: (cartId, regionId) => getCartByIdAction(cartId, regionId),
  createCart: (payload) => createCartAction(payload),
  createLineItem: (payload) => createLineItemAction(payload),
  updateLineItem: (lineItemId, payload) => updateLineItemAction(lineItemId, payload),
  deleteLineItem: (lineItemId) => deleteLineItemAction(lineItemId),
};

// ─── Injected toast ──────────────────────────────────────────────────────────
const toastAdapter = {
  success: (msg) => toast.success(msg, { position: "top-right", className: "mt-0 md:mt-[60px]" }),
  error: (msg) => toast.error(msg, { position: "top-right", className: "mt-0 md:mt-[60px]" }),
  info: (msg) => toast.info(msg, { position: "top-right" }),
};

// ─── Auth hook (runs inside the client component) ───────────────────────────
function useClerkAuth() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // Auto-login to your backend when Clerk session is active
  // but no valid backend token exists yet
  // (You can move this to a separate useEffect hook if preferred)

  const logout = async () => {
    localStorage.removeItem("cartid");
    localStorage.removeItem("access_token");
    Cookies.remove("access_token", { path: "/" });
    await signOut();
    router.push("/");
    router.refresh();
  };

  return {
    isSignedIn: isSignedIn ?? false,
    user,
    logout,
  };
}

// ─── Providers component ─────────────────────────────────────────────────────
export function Providers({ children }) {
  const auth = useClerkAuth();

  return (
    <CoreProvider
      config={STORE_CONFIG}
      actions={actions}
      toast={toastAdapter}
      auth={auth}
    >
      {children}
    </CoreProvider>
  );
}
