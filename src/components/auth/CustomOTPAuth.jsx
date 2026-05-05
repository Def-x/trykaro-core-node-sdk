"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCore } from "../../context/CoreProvider";

/**
 * CustomOTPAuth
 *
 * A premium Mobile + OTP login component.
 * Uses actions.login and actions.verifyOtp from the core context.
 */
export const CustomOTPAuth = ({ onLoginSuccess }) => {
  const { actions, auth, toast } = useCore();
  const [step, setStep] = useState("phone"); // 'phone' or 'otp'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef([]);

  // Handle timer for resend OTP
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (phone.length < 10) {
      toast?.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      if (actions?.login) {
        await actions.login(phone);
        setStep("otp");
        setTimer(60);
        toast?.success("OTP sent successfully");
      } else {
        toast?.error("Login action not configured");
      }
    } catch (err) {
      toast?.error(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      toast?.error("Please enter the full 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      if (actions?.verifyOtp) {
        const response = await actions.verifyOtp(phone, otpValue);
        if (response?.token) {
          auth?.setAuth({
            token: response.token,
            user: response.user
          });
          toast?.success("Logged in successfully");
          if (onLoginSuccess) onLoginSuccess();
        } else {
          toast?.error("Invalid response from server");
        }
      } else {
        toast?.error("Verify OTP action not configured");
      }
    } catch (err) {
      toast?.error(err.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-[Nunito-bold] text-[#00214c]">
          {step === "phone" ? "Welcome Back" : "Verify OTP"}
        </h2>
        <p className="text-sm text-gray-500 mt-2 font-[Nunito-regular]">
          {step === "phone"
            ? "Enter your mobile number to sign in"
            : `Enter the 6-digit code sent to +91 ${phone}`}
        </p>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-[Nunito-medium]">
              +91
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Mobile Number"
              className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00214c]/20 focus:border-[#00214c] outline-none transition-all font-[Nunito-medium]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || phone.length < 10}
            className={`w-full py-3 rounded-xl font-[Nunito-bold] text-white transition-all ${
              isLoading || phone.length < 10
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#00214c] hover:bg-[#001a3d] active:scale-[0.98]"
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
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-[Nunito-bold] bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00214c]/20 focus:border-[#00214c] outline-none transition-all"
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
                className="text-xs text-[#00214c] font-[Nunito-bold] hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join("").length < 6}
            className={`w-full py-3 rounded-xl font-[Nunito-bold] text-white transition-all ${
              isLoading || otp.join("").length < 6
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#00214c] hover:bg-[#001a3d] active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify & Sign In"
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep("phone")}
            className="w-full text-sm text-gray-500 font-[Nunito-medium] hover:text-[#00214c] transition-colors"
          >
            Change Phone Number
          </button>
        </form>
      )}
    </div>
  );
};
