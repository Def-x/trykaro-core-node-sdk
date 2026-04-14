/**
 * examples/layout.js
 *
 * ─── Next.js Root Layout (App Router) ─────────────────────────────────────
 *
 * This file lives in YOUR STOREFRONT APP — NOT in the package.
 * Copy this into your app: app/layout.js
 *
 * Pattern:
 *  - layout.js  →  Server Component  (no "use client")
 *  - Providers  →  Client Component  (handles CoreProvider + Clerk)
 *
 * This keeps the root layout as a server component (required for
 * Next.js metadata, font optimisation, etc.) while allowing the
 * provider tree to be a client component.
 */

import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Providers } from "./providers"; // 👈 your wired-up client wrapper

export const metadata = {
  title: "My Store",
  description: "Powered by Defx Storefront Core",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/*
          ClerkProvider must wrap the whole app for useUser() to work inside Providers.
          It handles its own "use client" boundary internally.
        */}
        <ClerkProvider>
          {/* CoreProvider + all injected deps */}
          <Providers>
            {children}
          </Providers>
        </ClerkProvider>

        {/* Toast notifications — rendered at root level */}
        <ToastContainer />
      </body>
    </html>
  );
}
