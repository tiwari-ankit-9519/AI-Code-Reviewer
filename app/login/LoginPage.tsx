"use client";

import { useActionState, useEffect } from "react";
import { loginAction } from "@/lib/actions/login";
import Link from "next/link";
import { useRouter } from "next/router";

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
      // window.location.href = state.redirect;
      router.push("/dashboard");
    }
  }, [state.success, state.redirect, router]);

  const alertMessage = state.message;
  const alertType = state.success ? "success" : state.message ? "error" : "";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-linear-to-br from-[#1a1d29] via-[#2d1b3d] to-[#1a1d29] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(76,29,149,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.15),transparent_50%)]"></div>
        <div className="relative z-10 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl mb-8 shadow-2xl">
            <svg
              className="w-10 h-10 text-white"
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
          <h1 className="text-4xl font-bold text-white mb-4">
            AI-Powered Code Review
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Analyze your code for security vulnerabilities, performance issues,
            and best practices using advanced AI technology.
          </p>
          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span>Trusted by 10,000+ developers</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
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

            <h2 className="text-3xl font-bold text-gray-900 mt-4">
              Welcome back
            </h2>
            <p className="text-gray-600 mt-2">
              Sign in to your account to continue
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            {alertMessage && alertType === "success" && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm">
                {alertMessage}
              </div>
            )}

            {alertMessage && alertType === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {alertMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl"
            >
              Sign in
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <Link
                href="/resend-verification"
                className="block text-sm text-gray-600 hover:text-gray-900"
              >
                Resend verification email
              </Link>
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
