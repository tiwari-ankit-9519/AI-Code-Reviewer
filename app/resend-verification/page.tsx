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
        setMessage(
          data.message ||
            "Verification email sent! Check your inbox to activate your warrior account."
        );
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] p-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
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
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl shadow-2xl shadow-purple-500/20 border-4 border-purple-500/50 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full mb-6 shadow-lg shadow-blue-500/50 border-4 border-blue-600">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2
              className="text-3xl font-black text-white mb-3 font-mono uppercase"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
            >
              📧 Resend Verification
            </h2>
            <p className="text-gray-400 font-mono">
              Reactivate your warrior account link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className="bg-green-500/20 border-2 border-green-400 text-green-300 p-4 rounded-xl font-mono text-sm shadow-lg shadow-green-500/20">
                ✓ {message}
              </div>
            )}
            {error && (
              <div className="bg-red-500/20 border-2 border-red-400 text-red-300 p-4 rounded-xl font-mono text-sm shadow-lg shadow-red-500/20">
                ✗ {error}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0e27] border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition font-mono"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-black hover:from-blue-400 hover:to-cyan-400 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:-translate-y-1 font-mono uppercase border-4 border-blue-600"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                "📨 Resend Verification"
              )}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-yellow-400 hover:text-yellow-300 transition font-mono font-bold"
              >
                ← Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
