"use client";

import { useActionState, useEffect } from "react";
import { loginAction } from "@/lib/actions/login";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LoginState {
  success: boolean;
  message: string;
  redirect?: string;
}

const initialState: LoginState = {
  success: false,
  message: "",
};

export default function LoginPage() {
  const router = useRouter();

  const [state, formAction] = useActionState<LoginState, FormData>(
    loginAction,
    initialState
  );

  useEffect(() => {
    if (state.success && state.redirect) {
      router.push("/dashboard");
    }
  }, [state.success, state.redirect, router, state.message]);

  const alertMessage = state.message;
  const alertType = state.success ? "success" : state.message ? "error" : "";

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0a0e27]">
      <div className="flex items-center justify-center p-8 bg-[#0a0e27]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-400 hover:text-yellow-400 mb-8 font-mono transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>

            <h2
              className="text-4xl font-black text-white mt-4 font-mono uppercase"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}
            >
              Welcome Back
            </h2>
            <p className="text-gray-400 mt-2 font-mono">
              Continue your epic journey
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            {alertMessage && alertType === "success" && (
              <div className="bg-green-500/20 border-2 border-green-400 text-green-300 px-4 py-3 rounded-xl text-sm font-mono shadow-lg shadow-green-500/20">
                ✓ {alertMessage}
              </div>
            )}

            {alertMessage && alertType === "error" && (
              <div className="bg-red-500/20 border-2 border-red-400 text-red-300 px-4 py-3 rounded-xl text-sm font-mono shadow-lg shadow-red-500/20">
                ✗ {alertMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-black text-gray-300 mb-2 font-mono uppercase"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-[#1a1f3a] border-2 border-purple-500/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition text-white font-mono placeholder-gray-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-black text-gray-300 font-mono uppercase"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-yellow-400 hover:text-yellow-300 font-mono font-bold transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-[#1a1f3a] border-2 border-purple-500/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition text-white font-mono placeholder-gray-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 py-4 px-4 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 focus:outline-none focus:ring-4 focus:ring-yellow-500/50 transition-all shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase text-lg border-4 border-yellow-600"
            >
              Enter Game
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-purple-500/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#0a0e27] text-gray-400 font-mono font-bold uppercase">
                  Need Help?
                </span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <Link
                href="/resend-verification"
                className="block text-sm text-gray-400 hover:text-yellow-400 font-mono transition-colors"
              >
                → Resend verification email
              </Link>
              <p className="text-sm text-gray-400 font-mono">
                New player?{" "}
                <Link
                  href="/register"
                  className="text-yellow-400 hover:text-yellow-300 font-black transition-colors"
                >
                  Create Account →
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex bg-linear-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] items-center justify-center p-12 relative overflow-hidden border-r-4 border-purple-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(147,51,234,0.2),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15),transparent_50%)]"></div>

        <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-2 h-2 bg-pink-400 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-60 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>

        <div className="relative z-10 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl mb-8 shadow-2xl shadow-purple-500/50 border-4 border-purple-700">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
          <h1
            className="text-5xl font-black text-white mb-6 font-mono uppercase"
            style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
          >
            AI Code Review
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed font-mono">
            Analyze your code for bugs, vulnerabilities, and performance. Level
            up with advanced AI technology.
          </p>
          <div className="mt-12 flex items-center justify-center gap-3 text-sm">
            <div className="inline-flex items-center gap-2 bg-green-500/20 border-2 border-green-400 rounded-full px-4 py-2 shadow-lg shadow-green-500/20">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-green-300 font-mono font-bold">
                10,000+ Warriors Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
