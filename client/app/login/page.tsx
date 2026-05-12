'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function LoginPage() {
  const { dayMode } = useTheme();
  const { googleAuth } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await googleAuth();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const socialButtonClass = "flex items-center justify-center gap-4 rounded-xl text-white px-8 py-4 bg-grey border border-night hover:bg-gray-800 transition-all duration-300 w-full group relative overflow-hidden";

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col gap-8 w-full max-w-[450px] relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/assets/logo-dark.svg"
            alt="logo"
            className="h-10 hover:scale-110 transition-transform duration-300 cursor-pointer"
          />
        </div>

        {/* Sign In UI */}
        <div className="bg-grey/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/10 flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className={socialButtonClass}
          >
            <div className="flex items-center justify-center bg-white rounded-lg p-2 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
              <img src="/assets/google-icon.svg" alt="google" className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold">
              {isLoggingIn ? "Connecting..." : "Continue with Google"}
            </span>
            {isLoggingIn && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <p className="text-sm text-gray-500">
            Don't have an account? <Link href="/register" className="text-white hover:underline font-bold">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
