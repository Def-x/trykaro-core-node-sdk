"use client";

import React from "react";
import { useCore } from "../../context/CoreProvider";
import { CustomOTPAuth } from "./CustomOTPAuth";

/**
 * AuthManager
 * 
 * Switches between Clerk and Custom Auth UI based on config.authType.
 */
export const AuthManager = ({ mode = "sign-in", onLoginSuccess }) => {
  const { config, auth } = useCore();
  const authType = config?.authType ?? "clerk";

  console.log({ config, auth, authType })
  if (authType === "clerk") {
    // If using Clerk, we rely on the injected auth methods (openSignIn, etc.)
    // because we cannot easily render Clerk components if the dependency is missing.
    // However, if the consuming app passed them, we use them.
    return (
      <div className="w-full text-center py-8">
        <h2 className="text-2xl font-[Nunito-bold] text-[#00214c] mb-6">
          Sign in to continue
        </h2>
        <div className="space-y-4">
          <button
            onClick={() => auth?.openSignIn?.()}
            className="w-full py-3 bg-[#00214c] text-white rounded-xl font-[Nunito-bold] hover:bg-[#001a3d] transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => auth?.openSignUp?.()}
            className="w-full py-3 border border-[#00214c] text-[#00214c] rounded-xl font-[Nunito-bold] hover:bg-gray-50 transition-all"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return <CustomOTPAuth onLoginSuccess={onLoginSuccess} />;
};
