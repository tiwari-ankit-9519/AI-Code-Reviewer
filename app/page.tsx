"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <nav className="fixed top-0 w-full bg-[#0a0e27]/95 backdrop-blur-md border-b border-purple-500/30 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/50">
                <svg
                  className="w-6 h-6 text-gray-900"
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
              <span
                className="text-xl font-bold text-white"
                style={{ fontFamily: "monospace" }}
              >
                CodeReview AI
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-300 hover:text-yellow-400 transition font-mono"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-300 hover:text-yellow-400 transition font-mono"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-gray-300 hover:text-yellow-400 transition font-mono"
              >
                Pricing
              </a>
              <Link
                href="/login"
                className="text-gray-300 hover:text-yellow-400 transition font-mono"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/60 font-mono uppercase text-sm"
              >
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-purple-500/20 text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-purple-500/30">
              <div className="flex flex-col gap-4">
                <a
                  href="#features"
                  className="text-gray-300 hover:text-yellow-400 transition font-mono"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-300 hover:text-yellow-400 transition font-mono"
                >
                  How It Works
                </a>
                <a
                  href="#pricing"
                  className="text-gray-300 hover:text-yellow-400 transition font-mono"
                >
                  Pricing
                </a>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-yellow-400 transition font-mono"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-bold text-center font-mono uppercase"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
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

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border-2 border-green-400 rounded-full px-4 py-2 mb-6 shadow-lg shadow-green-500/30">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-sm font-bold text-green-300 font-mono uppercase tracking-wide">
                10,000+ Developers Online
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight tracking-tight"
              style={{
                fontFamily: "monospace",
                textShadow:
                  "0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(147,51,234,0.3)",
              }}
            >
              Start Your
            </h1>
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight bg-linear-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent"
              style={{ fontFamily: "monospace" }}
            >
              Code Review Adventure
            </h1>

            <p className="text-xl text-gray-300 mb-10 leading-relaxed font-mono">
              AI-powered code analysis • Find bugs instantly • Level up your
              skills
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-yellow-400 text-gray-900 px-10 py-5 rounded-xl font-black text-xl hover:bg-yellow-300 transition-all shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 flex items-center justify-center gap-3 border-4 border-yellow-600 font-mono uppercase"
              >
                Get Started
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>

              <a
                href="#demo"
                className="w-full sm:w-auto bg-purple-600 text-white px-10 py-5 rounded-xl font-black text-xl border-4 border-purple-800 hover:bg-purple-500 transition-all shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:-translate-y-1 flex items-center justify-center gap-3 font-mono uppercase"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Watch Demo
              </a>
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center bg-linear-to-br from-cyan-500/20 to-blue-500/20 p-4 rounded-xl border-2 border-cyan-400/50">
                <div
                  className="text-4xl font-black text-cyan-300 font-mono"
                  style={{ textShadow: "0 0 10px rgba(34,211,238,0.5)" }}
                >
                  10K+
                </div>
                <div className="text-sm text-gray-300 mt-1 font-mono uppercase tracking-wide">
                  Active Users
                </div>
              </div>
              <div className="text-center bg-linear-to-br from-pink-500/20 to-red-500/20 p-4 rounded-xl border-2 border-pink-400/50">
                <div
                  className="text-4xl font-black text-pink-300 font-mono"
                  style={{ textShadow: "0 0 10px rgba(236,72,153,0.5)" }}
                >
                  1M+
                </div>
                <div className="text-sm text-gray-300 mt-1 font-mono uppercase tracking-wide">
                  Code Reviews
                </div>
              </div>
              <div className="text-center bg-linear-to-br from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border-2 border-yellow-400/50">
                <div
                  className="text-4xl font-black text-yellow-300 font-mono"
                  style={{ textShadow: "0 0 10px rgba(250,204,21,0.5)" }}
                >
                  50+
                </div>
                <div className="text-sm text-gray-300 mt-1 font-mono uppercase tracking-wide">
                  Languages
                </div>
              </div>
              <div className="text-center bg-linear-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl border-2 border-green-400/50">
                <div
                  className="text-4xl font-black text-green-300 font-mono"
                  style={{ textShadow: "0 0 10px rgba(34,197,94,0.5)" }}
                >
                  99.9%
                </div>
                <div className="text-sm text-gray-300 mt-1 font-mono uppercase tracking-wide">
                  Accuracy
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0e27]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-5xl font-black text-white mb-4 font-mono uppercase"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}
            >
              Power-Ups & Features
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-mono">
              Unlock legendary abilities for your code
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-linear-to-br from-blue-900/50 to-blue-950/50 p-6 rounded-2xl border-4 border-blue-500 hover:shadow-2xl hover:shadow-blue-500/50 transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/50">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-3 font-mono uppercase">
                Security Shield
              </h3>
              <p className="text-gray-300 leading-relaxed font-mono text-sm">
                Detect SQL injection, XSS, CSRF vulnerabilities. Get instant
                alerts with CWE/CVE references.
              </p>
            </div>

            <div className="bg-linear-to-br from-purple-900/50 to-purple-950/50 p-6 rounded-2xl border-4 border-purple-500 hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/50">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-3 font-mono uppercase">
                Speed Boost
              </h3>
              <p className="text-gray-300 leading-relaxed font-mono text-sm">
                Identify bottlenecks and memory leaks. Optimize execution speed
                and crush performance issues.
              </p>
            </div>

            <div className="bg-linear-to-br from-emerald-900/50 to-emerald-950/50 p-6 rounded-2xl border-4 border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/50">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-3 font-mono uppercase">
                Quality Master
              </h3>
              <p className="text-gray-300 leading-relaxed font-mono text-sm">
                Detect code smells and style violations. Maintain legendary code
                quality across your codebase.
              </p>
            </div>

            <div className="bg-linear-to-br from-orange-900/50 to-orange-950/50 p-6 rounded-2xl border-4 border-orange-500 hover:shadow-2xl hover:shadow-orange-500/50 transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/50">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-3 font-mono uppercase">
                Bug Hunter
              </h3>
              <p className="text-gray-300 leading-relaxed font-mono text-sm">
                Find runtime errors and logic bugs before they strike. Prevent
                production crashes.
              </p>
            </div>

            <div className="bg-linear-to-br from-pink-900/50 to-pink-950/50 p-6 rounded-2xl border-4 border-pink-500 hover:shadow-2xl hover:shadow-pink-500/50 transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-pink-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-pink-500/50">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-3 font-mono uppercase">
                Quest Reports
              </h3>
              <p className="text-gray-300 leading-relaxed font-mono text-sm">
                Comprehensive battle reports with severity levels. Share
                victories with your team.
              </p>
            </div>

            <div className="bg-linear-to-br from-indigo-900/50 to-indigo-950/50 p-6 rounded-2xl border-4 border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/50 transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/50">
                <svg
                  className="w-8 h-8 text-white"
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
              <h3 className="text-2xl font-black text-white mb-3 font-mono uppercase">
                Multi-Verse
              </h3>
              <p className="text-gray-300 leading-relaxed font-mono text-sm">
                50+ languages supported. JavaScript, Python, Java, Go, Rust and
                more. One tool rules them all.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-[#0a0e27] to-[#1a1f3a]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-5xl font-black text-white mb-4 font-mono uppercase"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}
            >
              Your Quest Path
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-mono">
              Three simple steps to coding mastery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-linear-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-gray-900 text-3xl font-black mb-6 shadow-2xl shadow-yellow-500/50 border-4 border-yellow-600 group-hover:scale-110 transition-transform font-mono">
                  1
                </div>
                <h3 className="text-3xl font-black text-white mb-4 font-mono uppercase">
                  Upload Code
                </h3>
                <p className="text-gray-300 leading-relaxed font-mono text-sm">
                  Paste code, upload files, or connect your Git repository.
                  Ready for battle.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-2xl shadow-purple-500/50 border-4 border-purple-700 group-hover:scale-110 transition-transform font-mono">
                  2
                </div>
                <h3 className="text-3xl font-black text-white mb-4 font-mono uppercase">
                  AI Analysis
                </h3>
                <p className="text-gray-300 leading-relaxed font-mono text-sm">
                  Advanced AI scans for security, performance, and quality
                  issues in seconds.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-linear-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center text-gray-900 text-3xl font-black mb-6 shadow-2xl shadow-green-500/50 border-4 border-green-600 group-hover:scale-110 transition-transform font-mono">
                  3
                </div>
                <h3 className="text-3xl font-black text-white mb-4 font-mono uppercase">
                  Victory Report
                </h3>
                <p className="text-gray-300 leading-relaxed font-mono text-sm">
                  Detailed findings with actionable fixes. Level up your code
                  instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0e27]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-5xl font-black text-white mb-4 font-mono uppercase"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}
            >
              Choose Your Level
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-mono">
              All plans include 14-day free trial • No credit card required
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-linear-to-br from-gray-800/50 to-gray-900/50 border-4 border-gray-600 rounded-2xl p-8 hover:shadow-2xl hover:shadow-gray-500/30 transition-all hover:-translate-y-2">
              <h3 className="text-3xl font-black text-white mb-2 font-mono uppercase">
                Starter
              </h3>
              <p className="text-gray-400 mb-6 font-mono">Try the basics</p>
              <div className="mb-6">
                <span className="text-5xl font-black text-white font-mono">
                  $0
                </span>
                <span className="text-gray-400 font-mono">/month</span>
              </div>
              <ul className="space-y-3 mb-8 min-h-[200px]">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-gray-300 text-sm font-mono">
                    5 reviews/month
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-gray-300 text-sm font-mono">
                    Basic security
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-gray-300 text-sm font-mono">
                    Community support
                  </span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full text-center bg-gray-700 text-white px-6 py-4 rounded-xl font-black hover:bg-gray-600 transition-all border-4 border-gray-900 font-mono uppercase"
              >
                Start Free
              </Link>
            </div>

            <div className="bg-linear-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white relative hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:-translate-y-2 border-4 border-purple-800">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-xl text-sm font-black shadow-lg font-mono uppercase border-2 border-yellow-600">
                ⭐ Popular
              </div>
              <h3 className="text-3xl font-black mb-2 font-mono uppercase">
                Hero
              </h3>
              <p className="text-purple-100 mb-6 font-mono">For champions</p>
              <div className="mb-6">
                <span className="text-5xl font-black font-mono">$29</span>
                <span className="text-purple-100 font-mono">/month</span>
              </div>
              <ul className="space-y-3 mb-8 min-h-[200px]">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-gray-900"
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
                  <span className="text-sm font-mono">Unlimited reviews</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-gray-900"
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
                  <span className="text-sm font-mono">
                    Advanced security & performance
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-gray-900"
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
                  <span className="text-sm font-mono">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-gray-900"
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
                  <span className="text-sm font-mono">API access</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-gray-900"
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
                  <span className="text-sm font-mono">
                    Up to 100KB file size
                  </span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full text-center bg-white text-purple-600 px-6 py-4 rounded-xl font-black hover:bg-gray-100 transition-all shadow-xl border-4 border-white font-mono uppercase"
              >
                Start Trial
              </Link>
            </div>

            <div className="bg-linear-to-br from-gray-800/50 to-gray-900/50 border-4 border-gray-600 rounded-2xl p-8 hover:shadow-2xl hover:shadow-gray-500/30 transition-all hover:-translate-y-2">
              <h3 className="text-3xl font-black text-white mb-2 font-mono uppercase">
                Legend
              </h3>
              <p className="text-gray-400 mb-6 font-mono">For elite teams</p>
              <div className="mb-6">
                <span className="text-5xl font-black text-white font-mono">
                  Custom
                </span>
              </div>
              <ul className="space-y-3 mb-8 min-h-[200px]">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-gray-300 text-sm font-mono">
                    Everything in Hero
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-gray-300 text-sm font-mono">
                    Dedicated support
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-gray-300 text-sm font-mono">
                    Custom integrations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-gray-300 text-sm font-mono">
                    SLA guarantee
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <span className="text-gray-300 text-sm font-mono">
                    Unlimited file size
                  </span>
                </li>
              </ul>
              <Link
                href="/contact"
                className="block w-full text-center bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-4 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all border-4 border-yellow-600 font-mono uppercase"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-purple-600 via-pink-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2
            className="text-4xl md:text-5xl font-black text-white mb-6 font-mono uppercase"
            style={{ textShadow: "0 0 30px rgba(0,0,0,0.5)" }}
          >
            Ready To Level Up?
          </h2>
          <p className="text-xl text-purple-100 mb-10 font-mono">
            Join the coding revolution. Start your epic journey today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-yellow-400 text-gray-900 px-10 py-5 rounded-xl font-black text-xl hover:bg-yellow-300 transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1 border-4 border-yellow-600 font-mono uppercase"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-transparent text-white border-4 border-white px-10 py-5 rounded-xl font-black text-xl hover:bg-white/20 transition-all font-mono uppercase"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#0a0e27] border-t-4 border-purple-500/30 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/50">
                  <svg
                    className="w-5 h-5 text-gray-900"
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
                <span className="text-lg font-black text-white font-mono">
                  CodeReview AI
                </span>
              </div>
              <p className="text-sm text-gray-400 font-mono">
                Level up your code with AI-powered reviews
              </p>
            </div>

            <div>
              <h4 className="text-white font-black mb-4 font-mono uppercase">
                Product
              </h4>
              <ul className="space-y-2 text-sm font-mono">
                <li>
                  <a
                    href="#features"
                    className="hover:text-yellow-400 transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-yellow-400 transition"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 transition">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 transition">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black mb-4 font-mono uppercase">
                Company
              </h4>
              <ul className="space-y-2 text-sm font-mono">
                <li>
                  <a href="#" className="hover:text-yellow-400 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black mb-4 font-mono uppercase">
                Legal
              </h4>
              <ul className="space-y-2 text-sm font-mono">
                <li>
                  <a href="#" className="hover:text-yellow-400 transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-500/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 font-mono">
              © 2024 CodeReview AI. Game on. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-400 transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-400 transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-yellow-400 transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
