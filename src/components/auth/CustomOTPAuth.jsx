"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCore } from "../../context/CoreProvider";

const normalizeMode = (value) => {
  if (value === "sign-up" || value === "signup") return "signup";
  return "signin";
};

const buildOtpArray = (length) => Array.from({ length }, () => "");

/**
 * CustomOTPAuth
 *
 * A mobile OTP auth component that supports sign in and sign up flows through
 * actions injected by CoreProvider.
 */
export const CustomOTPAuth = ({ mode = "sign-in", onLoginSuccess }) => {
  const { actions, auth, config, toast } = useCore();
  const [authMode, setAuthMode] = useState(() => normalizeMode(mode));
  const [step, setStep] = useState("phone");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef([]);

  const countryCode = config?.countryCode ?? "+91";
  const otpLength = Number(config?.otpLength ?? 6);
  const [otp, setOtp] = useState(() => buildOtpArray(otpLength));

  useEffect(() => {
    setAuthMode(normalizeMode(mode));
    setStep("phone");
    setOtp(buildOtpArray(otpLength));
  }, [mode, otpLength]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const isSignup = authMode === "signup";
  const otpValue = useMemo(() => otp.join(""), [otp]);

  const resetOtpStep = () => {
    setStep("phone");
    setOtp(buildOtpArray(otpLength));
    setTimer(0);
  };

  const setOtpFromResponse = (value) => {
    if (!value) return;

    const digits = value
      .toString()
      .replace(/\D/g, "")
      .slice(0, otpLength)
      .split("");

    if (!digits.length) return;

    setOtp((prev) =>
      prev.map((_, index) => {
        return digits[index] ?? "";
      }),
    );
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();

    if (phone.length < 10) {
      toast?.error("Please enter a valid phone number");
      return;
    }

    if (isSignup && (!firstName.trim() || !lastName.trim())) {
      toast?.error("Please enter your first and last name");
      return;
    }

    setIsLoading(true);
    try {
      let response;

      if (isSignup) {
        if (!actions?.signup) {
          toast?.error("Signup action not configured");
          return;
        }

        response = await actions.signup({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone,
          countryCode,
        });
      } else {
        if (!actions?.login) {
          toast?.error("Login action not configured");
          return;
        }

        response = await actions.login(phone, countryCode);
      }

      setStep("otp");
      setTimer(60);
      setOtp(buildOtpArray(otpLength));
      setOtpFromResponse(response?.otp_secret_key || response?.otp);
      toast?.success(
        isSignup ? "Signup OTP sent successfully" : "OTP sent successfully",
      );
    } catch (err) {
      toast?.error(err?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();

    if (otpValue.length < otpLength) {
      toast?.error(`Please enter the full ${otpLength}-digit OTP`);
      return;
    }

    setIsLoading(true);
    try {
      if (!actions?.verifyOtp) {
        toast?.error("Verify OTP action not configured");
        return;
      }

      const response = await actions.verifyOtp(
        phone,
        otpValue,
        countryCode,
        authMode,
      );

      const token = response?.token ?? response?.access_token;
      if (!token) {
        toast?.error("Invalid response from server");
        return;
      }

      auth?.setAuth?.({
        token,
        access_token: response?.access_token ?? token,
        user: response?.user ?? auth?.user ?? null,
      });

      toast?.success(
        isSignup ? "Account created successfully" : "Logged in successfully",
      );
      onLoginSuccess?.(response);
    } catch (err) {
      toast?.error(err?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const nextValue = value.substring(value.length - 1);

    setOtp((prev) => {
      const nextOtp = [...prev];
      nextOtp[index] = nextValue;
      return nextOtp;
    });

    if (nextValue && index < otpLength - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const switchMode = (nextMode) => {
    setAuthMode(nextMode);
    setFirstName("");
    setLastName("");
    setPhone("");
    setOtp(buildOtpArray(otpLength));
    setTimer(0);
    setStep("phone");
  };

  return (
    <div className="w-full max-w-[400px] mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-[Nunito-bold] text-[var(--core-primary)]">
          {step === "phone"
            ? isSignup
              ? "Create Your Account"
              : "Welcome Back"
            : "Verify OTP"}
        </h2>
        <p className="text-sm text-gray-500 mt-2 font-[Nunito-regular]">
          {step === "phone"
            ? isSignup
              ? "Enter your details to create an account"
              : "Enter your mobile number to sign in"
            : `Enter the ${otpLength}-digit code sent to ${countryCode} ${phone}`}
        </p>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-6">
          {isSignup && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="First Name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--core-primary)]/20 focus:border-[var(--core-primary)] outline-none transition-all font-[Nunito-medium]"
                required
              />
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Last Name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--core-primary)]/20 focus:border-[var(--core-primary)] outline-none transition-all font-[Nunito-medium]"
                required
              />
            </div>
          )}

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-[Nunito-medium]">
              {countryCode}
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="Mobile Number"
              className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--core-primary)]/20 focus:border-[var(--core-primary)] outline-none transition-all font-[Nunito-medium]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || phone.length < 10}
            className={`w-full py-3 rounded-xl font-[Nunito-bold] text-white transition-all ${
              isLoading || phone.length < 10
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[var(--core-primary)] hover:bg-[var(--core-primary)] active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              "Get OTP"
            )}
          </button>

          <p className="text-sm text-center text-gray-500 font-[Nunito-medium]">
            {isSignup ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isSignup ? "signin" : "signup")}
              className="text-[var(--core-primary)] font-[Nunito-bold] hover:underline"
            >
              {isSignup ? "Sign In" : "Create Account"}
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  otpRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="w-12 h-14 text-center text-xl font-[Nunito-bold] bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--core-primary)]/20 focus:border-[var(--core-primary)] outline-none transition-all"
              />
            ))}
          </div>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-xs text-gray-500 font-[Nunito-regular]">
                Resend OTP in <span className="font-[Nunito-bold]">{timer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-xs text-[var(--core-primary)] font-[Nunito-bold] hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || otpValue.length < otpLength}
            className={`w-full py-3 rounded-xl font-[Nunito-bold] text-white transition-all ${
              isLoading || otpValue.length < otpLength
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[var(--core-primary)] hover:bg-[var(--core-primary)] active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </span>
            ) : isSignup ? (
              "Verify & Create Account"
            ) : (
              "Verify & Sign In"
            )}
          </button>

          <button
            type="button"
            onClick={resetOtpStep}
            className="w-full text-sm text-gray-500 font-[Nunito-medium] hover:text-[var(--core-primary)] transition-colors"
          >
            Change Details
          </button>
        </form>
      )}
    </div>
  );
};
