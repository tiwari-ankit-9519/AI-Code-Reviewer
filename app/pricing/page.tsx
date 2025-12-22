"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const handleUpgrade = async (tier: string) => {
    if (!session) {
      window.location.href = "/register";
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <nav className="fixed top-0 w-full bg-[#0a0e27]/95 backdrop-blur-md border-b border-purple-500/30 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
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
              <span className="text-xl font-bold text-white font-mono">
                CODE<span className="text-yellow-400">QUEST</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-yellow-400 transition font-mono font-bold"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-yellow-400 transition font-mono"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-500/50 font-mono uppercase text-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
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
          <div className="text-center mb-12">
            <h1
              className="text-5xl md:text-6xl font-black text-white mb-4 font-mono uppercase"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
            >
              Choose Your Level
            </h1>
            <p className="text-xl text-gray-300 font-mono mb-8">
              All plans include 14-day free trial • No credit card required
            </p>

            <div className="inline-flex items-center bg-gray-800/50 rounded-xl p-2 border-2 border-purple-500/30">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-3 rounded-lg font-black font-mono uppercase text-sm transition-all ${
                  billingCycle === "monthly"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-3 rounded-lg font-black font-mono uppercase text-sm transition-all relative ${
                  billingCycle === "yearly"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <PricingCards
            billingCycle={billingCycle}
            loading={loading}
            onUpgrade={handleUpgrade}
            session={session}
          />

          <div className="mt-16 text-center">
            <p className="text-gray-400 font-mono text-sm">
              🔒 Secure payment powered by Stripe • Cancel anytime • No hidden
              fees
            </p>
          </div>
        </div>
      </section>

      <ComparisonTable />
      <FAQSection />
      <TrustIndicators />
      <CTASection />
    </div>
  );
}

interface PricingCardsProps {
  billingCycle: "monthly" | "yearly";
  loading: boolean;
  onUpgrade: (tier: string) => void;
  session: { user?: { name?: string | null; email?: string | null } } | null;
}

function PricingCards({
  billingCycle,
  loading,
  onUpgrade,
  session,
}: PricingCardsProps) {
  const yearlyDiscount = 0.7;

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="bg-linear-to-br from-gray-800/50 to-gray-900/50 border-4 border-gray-600 rounded-2xl p-8 hover:shadow-2xl hover:shadow-gray-500/30 transition-all hover:-translate-y-2">
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-black text-sm border-2 border-gray-800 shadow-lg font-mono uppercase">
            🌟 Starter
          </span>
        </div>

        <div className="text-center mb-6">
          <p className="text-5xl font-black text-white font-mono mb-2">₹0</p>
          <p className="text-gray-400 font-mono">per month</p>
          <p className="text-sm text-gray-500 font-mono mt-2">Try the basics</p>
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
              Basic security checks
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
          href={session ? "/dashboard" : "/register"}
          className="block w-full text-center bg-gray-700 text-white px-6 py-4 rounded-xl font-black hover:bg-gray-600 transition-all border-4 border-gray-800 font-mono uppercase"
        >
          {session ? "Current Plan" : "Start Free"}
        </Link>
      </div>

      <div className="bg-linear-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white relative hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:-translate-y-2 border-4 border-purple-800 animate-pulse-slow">
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-xl text-sm font-black shadow-lg font-mono uppercase border-2 border-yellow-600">
          ⭐ Popular
        </div>

        <div className="text-center mb-6 mt-4">
          <span className="inline-block px-4 py-2 bg-white/20 text-white rounded-lg font-black text-sm border-2 border-white/30 shadow-lg font-mono uppercase">
            ⚡ Hero
          </span>
        </div>

        <div className="text-center mb-6">
          <p className="text-5xl font-black font-mono mb-2">
            ₹
            {billingCycle === "yearly"
              ? Math.round(2999 * yearlyDiscount)
              : 2999}
          </p>
          <p className="text-purple-100 font-mono">
            per month{billingCycle === "yearly" && ", billed yearly"}
          </p>
          {billingCycle === "yearly" && (
            <p className="text-sm text-yellow-300 font-mono mt-2 font-bold">
              💰 Save ₹{Math.round(29 * 12 * (1 - yearlyDiscount))}/year
            </p>
          )}
          <p className="text-sm text-purple-200 font-mono mt-2">
            For champions
          </p>
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
            <span className="text-sm font-mono font-bold">
              Unlimited reviews
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
            <span className="text-sm font-mono">Up to 100KB file size</span>
          </li>
        </ul>

        <button
          onClick={() => onUpgrade("HERO")}
          disabled={loading}
          className="w-full bg-white text-purple-600 px-6 py-4 rounded-xl font-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl border-4 border-white font-mono uppercase"
        >
          {loading ? "Processing..." : "Start 14-Day Trial"}
        </button>
      </div>

      <div className="bg-linear-to-br from-yellow-900/30 to-orange-900/30 border-4 border-yellow-600 rounded-2xl p-8 hover:shadow-2xl hover:shadow-yellow-500/30 transition-all hover:-translate-y-2">
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-2 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-black text-sm border-2 border-yellow-600 shadow-lg font-mono uppercase">
            👑 Legend
          </span>
        </div>

        <div className="text-center mb-6">
          <p className="text-5xl font-black text-white font-mono mb-2">
            Custom
          </p>
          <p className="text-gray-400 font-mono">contact us</p>
          <p className="text-sm text-gray-500 font-mono mt-2">
            For elite teams
          </p>
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
  );
}

function FAQSection() {
  const faqs = [
    {
      question: "What happens when my trial ends?",
      answer:
        "Your 14-day trial gives you full access to Hero features. When it ends, you'll be automatically downgraded to the free Starter plan unless you upgrade. No credit card required to start!",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Absolutely! Cancel your subscription anytime from your dashboard settings. No questions asked, no cancellation fees. Your access continues until the end of your current billing period.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes! We offer a 30-day money-back guarantee. If you're not satisfied with Hero within the first 30 days, contact us for a full refund.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment partner Stripe. All transactions are encrypted and secure.",
    },
    {
      question: "Can I upgrade or downgrade mid-cycle?",
      answer:
        "Yes! You can upgrade anytime and get immediate access to new features. Downgrades take effect at the end of your current billing period. No penalties or fees for changing plans.",
    },
    {
      question: "Is my code data secure?",
      answer:
        "Absolutely. Your code is encrypted in transit and at rest. We never share your code with third parties. You maintain full ownership and control. Read our security policy for details.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-[#0a0e27] to-[#1a1f3a]">
      <div className="max-w-4xl mx-auto">
        <h2
          className="text-4xl font-black text-white text-center mb-12 font-mono uppercase"
          style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}
        >
          💎 Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 p-6 shadow-xl hover:shadow-purple-500/30 transition-all"
            >
              <h3 className="text-xl font-black text-white mb-3 font-mono flex items-start gap-3">
                <span className="text-yellow-400 shrink-0">❓</span>
                {faq.question}
              </h3>
              <p className="text-gray-300 font-mono text-sm leading-relaxed pl-8">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustIndicators() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0a0e27]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-linear-to-br from-green-900/30 to-green-950/30 border-4 border-green-500/50 rounded-2xl p-6 text-center hover:shadow-2xl hover:shadow-green-500/30 transition-all hover:-translate-y-1">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-green-500/50">
              🔒
            </div>
            <h3 className="text-lg font-black text-white mb-2 font-mono uppercase">
              Secure Payments
            </h3>
            <p className="text-green-300 text-sm font-mono">
              Protected by Stripe
            </p>
          </div>

          <div className="bg-linear-to-br from-blue-900/30 to-blue-950/30 border-4 border-blue-500/50 rounded-2xl p-6 text-center hover:shadow-2xl hover:shadow-blue-500/30 transition-all hover:-translate-y-1">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/50">
              💳
            </div>
            <h3 className="text-lg font-black text-white mb-2 font-mono uppercase">
              Cancel Anytime
            </h3>
            <p className="text-blue-300 text-sm font-mono">
              No long-term commitment
            </p>
          </div>

          <div className="bg-linear-to-br from-purple-900/30 to-purple-950/30 border-4 border-purple-500/50 rounded-2xl p-6 text-center hover:shadow-2xl hover:shadow-purple-500/30 transition-all hover:-translate-y-1">
            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-purple-500/50">
              🔄
            </div>
            <h3 className="text-lg font-black text-white mb-2 font-mono uppercase">
              Money-Back Guarantee
            </h3>
            <p className="text-purple-300 text-sm font-mono">
              30-day full refund
            </p>
          </div>

          <div className="bg-linear-to-br from-yellow-900/30 to-orange-900/30 border-4 border-yellow-500/50 rounded-2xl p-6 text-center hover:shadow-2xl hover:shadow-yellow-500/30 transition-all hover:-translate-y-1">
            <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-yellow-500/50">
              ✅
            </div>
            <h3 className="text-lg font-black text-white mb-2 font-mono uppercase">
              Trusted by 10,000+
            </h3>
            <p className="text-yellow-300 text-sm font-mono">
              Developers worldwide
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
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
          Join thousands of developers improving their code quality with AI
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-block bg-yellow-400 text-gray-900 px-12 py-5 rounded-xl font-black text-xl hover:bg-yellow-300 transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1 border-4 border-yellow-600 font-mono uppercase"
          >
            🚀 Start Free Trial
          </Link>
          <a
            href="#comparison"
            className="inline-block bg-white/20 backdrop-blur-sm text-white px-12 py-5 rounded-xl font-black text-xl hover:bg-white/30 transition-all border-4 border-white/50 font-mono uppercase"
          >
            Compare Plans
          </a>
        </div>
        <p className="text-purple-100 text-sm font-mono mt-6">
          No credit card required • 14-day trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}

function ComparisonTable() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0e27]">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-4xl font-black text-white text-center mb-12 font-mono uppercase"
          style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}
        >
          📊 Feature Comparison
        </h2>

        <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-purple-900/20 to-pink-900/20 border-b-4 border-purple-500/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-300 uppercase font-mono">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-black text-gray-300 uppercase font-mono">
                    Starter
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-black text-purple-300 uppercase font-mono">
                    Hero
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-black text-yellow-300 uppercase font-mono">
                    Legend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-purple-500/20">
                {[
                  {
                    feature: "Monthly Reviews",
                    starter: "5",
                    hero: "Unlimited",
                    legend: "Unlimited",
                  },
                  {
                    feature: "Security Checks",
                    starter: "Basic",
                    hero: "Advanced",
                    legend: "Advanced",
                  },
                  {
                    feature: "Performance Analysis",
                    starter: true,
                    hero: true,
                    legend: true,
                  },
                  {
                    feature: "Quality Checks",
                    starter: true,
                    hero: true,
                    legend: true,
                  },
                  {
                    feature: "Bug Detection",
                    starter: true,
                    hero: true,
                    legend: true,
                  },
                  {
                    feature: "Priority Support",
                    starter: false,
                    hero: true,
                    legend: true,
                  },
                  {
                    feature: "API Access",
                    starter: false,
                    hero: true,
                    legend: true,
                  },
                  {
                    feature: "Max File Size",
                    starter: "100KB",
                    hero: "100KB",
                    legend: "Unlimited",
                  },
                  {
                    feature: "Team Features",
                    starter: false,
                    hero: false,
                    legend: true,
                  },
                  {
                    feature: "Custom Integrations",
                    starter: false,
                    hero: false,
                    legend: true,
                  },
                  {
                    feature: "SLA Guarantee",
                    starter: false,
                    hero: false,
                    legend: true,
                  },
                  {
                    feature: "Dedicated Support",
                    starter: false,
                    hero: false,
                    legend: true,
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-500/5">
                    <td className="px-6 py-4 text-white font-mono font-bold text-sm">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.starter === "boolean" ? (
                        row.starter ? (
                          <span className="text-green-400 text-xl">✓</span>
                        ) : (
                          <span className="text-red-400 text-xl">✗</span>
                        )
                      ) : (
                        <span className="text-gray-300 font-mono text-sm">
                          {row.starter}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.hero === "boolean" ? (
                        row.hero ? (
                          <span className="text-green-400 text-xl">✓</span>
                        ) : (
                          <span className="text-red-400 text-xl">✗</span>
                        )
                      ) : (
                        <span className="text-purple-300 font-mono text-sm font-bold">
                          {row.hero}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.legend === "boolean" ? (
                        row.legend ? (
                          <span className="text-green-400 text-xl">✓</span>
                        ) : (
                          <span className="text-red-400 text-xl">✗</span>
                        )
                      ) : (
                        <span className="text-yellow-300 font-mono text-sm font-bold">
                          {row.legend}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
