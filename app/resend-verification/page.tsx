"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || "Failed to resend verification email");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7f9]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-[#ececec] p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#e5f0ff] rounded-full mb-4">
              <svg
                className="w-7 h-7 text-[#007fff]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[#15192c] mb-1">
              Resend Verification
            </h2>
            <p className="text-[#6c7681] text-sm">
              Enter your email to receive a new verification link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className="bg-[#e5fae7] border border-[#bae2bf] text-[#1d6f3a] p-3 rounded text-sm">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-[#ffe6e7] border border-[#f9c1c8] text-[#b7263d] p-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#21242c] mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#f9f9fa] border border-[#ececec] rounded-lg text-[#21242c] placeholder-[#b2b5be] focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#007fff] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#2b89ff] focus:outline-none focus:ring-2 focus:ring-[#2b89ff] focus:ring-offset-2 focus:ring-offset-[#f6f7f9] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Sending..." : "Resend Verification Email"}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-[#007fff] hover:text-[#005ecb] transition"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
