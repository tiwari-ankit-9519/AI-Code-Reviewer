"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) return;

    async function verifyEmail() {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(
            data.message || "Your warrior account has been activated!"
          );

          setTimeout(() => {
            router.push("/login?verified=true");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(
            data.error || "Verification failed. The link may have expired."
          );
        }
      } catch {
        setStatus("error");
        setMessage("An error occurred. Please try again later.");
      }
    }

    verifyEmail();
  }, [token, email, router]);

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

      <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl shadow-2xl shadow-purple-500/20 p-8 max-w-md w-full text-center border-4 border-purple-500/50 relative z-10">
        {status === "loading" && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg shadow-blue-500/50 border-4 border-blue-700 relative">
              <svg
                className="animate-spin h-10 w-10 text-white"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-75"></div>
            </div>
            <h1
              className="text-3xl font-black text-white mb-3 font-mono uppercase"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
            >
              ⚡ Verifying Email
            </h1>
            <p className="text-gray-400 font-mono">
              Activating your warrior account...
            </p>
            <div className="mt-4 flex justify-center gap-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-lg shadow-green-500/50 border-4 border-green-700 animate-bounce">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1
              className="text-3xl font-black text-white mb-3 font-mono uppercase"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
            >
              ✅ Email Verified!
            </h1>
            <p className="text-green-400 font-mono font-bold mb-4">{message}</p>
            <div className="bg-green-500/20 border-2 border-green-400/50 rounded-lg p-3">
              <p className="text-sm text-green-300 font-mono">
                🎮 Redirecting to login portal...
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-red-500 to-red-600 rounded-full mb-6 shadow-lg shadow-red-500/50 border-4 border-red-700 animate-pulse">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1
              className="text-3xl font-black text-white mb-3 font-mono uppercase"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
            >
              ❌ Quest Failed
            </h1>
            <p className="text-red-400 font-mono font-bold mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/resend-verification"
                className="block w-full bg-linear-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-black hover:from-blue-400 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:-translate-y-1 font-mono uppercase border-4 border-blue-600"
              >
                📧 Resend Verification
              </Link>
              <Link
                href="/login"
                className="block w-full bg-gray-700 text-white py-4 px-6 rounded-xl font-black hover:bg-gray-600 transition-all border-4 border-gray-800 font-mono uppercase"
              >
                ← Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
