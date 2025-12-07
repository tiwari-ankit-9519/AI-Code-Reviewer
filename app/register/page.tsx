"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  function calculateStrength(pwd: string): number {
    let strength = 0;
    if (pwd.length >= 12) strength++;
    if (pwd.length >= 16) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    if (/(.)\1{2,}/.test(pwd)) strength--;
    if (/123|abc|qwerty/i.test(pwd)) strength--;
    return Math.max(0, Math.min(4, strength));
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(calculateStrength(pwd));
  }

  function getStrengthColor(strength: number): string {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];
    return colors[strength] || "bg-gray-300";
  }

  function getStrengthText(strength: number): string {
    const texts = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
    return texts[strength] || "Very Weak";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Registration failed");
        return;
      }

      setInfo("Account created. Check your email to verify your address.");
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1500);
    } catch (error) {
      console.error(error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0a0e27]">
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
          <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-yellow-400 to-orange-500 rounded-2xl mb-8 shadow-2xl shadow-yellow-500/50 border-4 border-yellow-600">
            <svg
              className="w-12 h-12 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1
            className="text-5xl font-black text-white mb-6 font-mono uppercase"
            style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
          >
            Begin Your Quest
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed font-mono">
            Join 10,000+ developers using AI to level up their code. Get instant
            feedback and legendary insights.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div className="bg-linear-to-br from-cyan-500/20 to-blue-500/20 p-4 rounded-xl border-2 border-cyan-400/50">
              <div
                className="text-4xl font-black text-cyan-300 mb-1 font-mono"
                style={{ textShadow: "0 0 10px rgba(34,211,238,0.5)" }}
              >
                10k+
              </div>
              <div className="text-xs text-gray-300 font-mono uppercase">
                Players
              </div>
            </div>
            <div className="bg-linear-to-br from-pink-500/20 to-red-500/20 p-4 rounded-xl border-2 border-pink-400/50">
              <div
                className="text-4xl font-black text-pink-300 mb-1 font-mono"
                style={{ textShadow: "0 0 10px rgba(236,72,153,0.5)" }}
              >
                50k+
              </div>
              <div className="text-xs text-gray-300 font-mono uppercase">
                Quests
              </div>
            </div>
            <div className="bg-linear-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl border-2 border-green-400/50">
              <div
                className="text-4xl font-black text-green-300 mb-1 font-mono"
                style={{ textShadow: "0 0 10px rgba(34,197,94,0.5)" }}
              >
                99%
              </div>
              <div className="text-xs text-gray-300 font-mono uppercase">
                Success
              </div>
            </div>
          </div>
        </div>
      </div>

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
              Create Account
            </h2>
            <p className="text-gray-400 mt-2 font-mono">
              Start your free journey today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {info && !error && (
              <div className="bg-green-500/20 border-2 border-green-400 text-green-300 px-4 py-3 rounded-xl text-sm font-mono shadow-lg shadow-green-500/20">
                ✓ {info}
              </div>
            )}
            {error && (
              <div className="bg-red-500/20 border-2 border-red-400 text-red-300 px-4 py-3 rounded-xl text-sm font-mono shadow-lg shadow-red-500/20">
                ✗ {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-black text-gray-300 mb-2 font-mono uppercase"
              >
                Player Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full px-4 py-3 bg-[#1a1f3a] border-2 border-purple-500/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition text-white font-mono placeholder-gray-500"
                placeholder="Enter your name"
              />
            </div>

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
              <label
                htmlFor="password"
                className="block text-sm font-black text-gray-300 mb-2 font-mono uppercase"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={12}
                value={password}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-[#1a1f3a] border-2 border-purple-500/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition text-white font-mono placeholder-gray-500"
                placeholder="Create a strong password"
              />
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full transition-all ${
                          level <= passwordStrength
                            ? getStrengthColor(passwordStrength)
                            : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 font-mono">
                    Power Level:{" "}
                    <span className="font-black text-white">
                      {getStrengthText(passwordStrength)}
                    </span>
                  </p>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500 font-mono">
                Min 12 characters • Uppercase • Lowercase • Number • Special
                char
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || passwordStrength < 2}
              className="w-full bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 py-4 px-4 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 focus:outline-none focus:ring-4 focus:ring-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase text-lg border-4 border-yellow-600"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-6 w-6 text-gray-900"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Spawning...
                </span>
              ) : (
                "Start Adventure"
              )}
            </button>

            <div className="bg-blue-500/20 border-2 border-blue-400 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-blue-400 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs text-blue-300 font-mono">
                  You&apos;ll receive a verification email. Verify your address
                  before your first login to unlock full powers.
                </p>
              </div>
            </div>

            <p className="text-sm text-center text-gray-400 font-mono">
              Already registered?{" "}
              <Link
                href="/login"
                className="text-yellow-400 hover:text-yellow-300 font-black transition-colors"
              >
                Sign In →
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
