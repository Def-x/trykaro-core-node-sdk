"use client";

import React from "react";
import { useUser, useClerk } from "@clerk/nextjs";

// ─── Top-level Checkout ────────────────────────────────────────────────────────
const Checkout = ({ hasDeletedItems }) => {
  const { user, isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  return !isSignedIn ? (
    <LoginPage />
  ) : (
    <OrderInfo clerkUser={user} hasDeletedItems={hasDeletedItems} />
  );
};

const LoginPage = () => {
  const { openSignIn, openSignUp } = useClerk();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-[#00214c]/5 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-[#00214c]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-[Nunito-medium] text-[20px] text-[var(--main)]">
            Sign in to continue
          </p>
          <p className="font-[Nunito-regular] text-[14px] text-[var(--secondary)] mt-1">
            Please sign in or create an account to checkout.
          </p>
        </div>
      </div>

      <div className="w-full space-y-3">
        <button
          className="w-full font-[Nunito-medium] bg-[var(--main)] text-[var(--secondaryBg)] py-[10px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => openSignIn()}
        >
          Sign in
        </button>
        <button
          className="w-full font-[Nunito-regular] border border-[var(--main)] py-[10px] text-[var(--main)] rounded-lg cursor-pointer hover:bg-[var(--secondaryBg)] transition-colors"
          onClick={() => openSignUp()}
        >
          New here?{" "}
          <span className="font-[Nunito-medium]">Register your account</span>
        </button>
      </div>
    </div>
  );
};

const OrderInfo = ({ clerkUser, hasDeletedItems }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <p className="font-[Nunito-medium] text-[16px] text-[var(--main)]">
        Order Information will be added soon
      </p>
    </div>
  );
};

export default Checkout;
