"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { getUserSubscription } from "@/lib/actions/user-subscription";

interface UserSubscription {
  tier: string;
  status: string;
  isTrialing: boolean;
}

interface Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export default function PricingPage() {
  const { data: session } = useSession() as { data: Session | null };
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [userSubscription, setUserSubscription] =
    useState<UserSubscription | null>(null);
  const [fetchingSubscription, setFetchingSubscription] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchUserSubscription();
    } else {
      setFetchingSubscription(false);
    }
  }, [session]);

  const fetchUserSubscription = async () => {
    try {
      const data = await getUserSubscription();
      setUserSubscription(data);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setFetchingSubscription(false);
    }
  };

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

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscription/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              <span className="text-lg font-bold text-gray-900">
                CodeReview AI
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Features
              </Link>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                How It Works
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Pricing
              </Link>
              {session ? (
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Get Started →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-6">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Pricing</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Level
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            All plans include 14-day free trial • No credit card required
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 border-2 border-gray-200">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                billingCycle === "yearly"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      {fetchingSubscription ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      ) : (
        <PricingCards
          billingCycle={billingCycle}
          loading={loading}
          onUpgrade={handleUpgrade}
          onManageSubscription={handleManageSubscription}
          session={session}
          userSubscription={userSubscription}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8">
        <p className="text-sm text-gray-600">
          🔒 Secure payment powered by Stripe • Cancel anytime • No hidden fees
        </p>
      </div>

      <ComparisonTable />
      <FAQSection />
      <TrustIndicators />
      <CTASection session={session} userSubscription={userSubscription} />
    </div>
  );
}

interface PricingCardsProps {
  billingCycle: "monthly" | "yearly";
  loading: boolean;
  onUpgrade: (tier: string) => void;
  onManageSubscription: () => void;
  session: Session | null;
  userSubscription: UserSubscription | null;
}

function PricingCards({
  billingCycle,
  loading,
  onUpgrade,
  onManageSubscription,
  session,
  userSubscription,
}: PricingCardsProps) {
  const yearlyDiscount = 0.7;
  const currentTier = userSubscription?.tier || "STARTER";
  const isTrialing = userSubscription?.isTrialing || false;

  const getButtonConfig = (tier: string) => {
    if (!session) {
      return {
        text: "Start Free →",
        action: () => (window.location.href = "/register"),
        variant: "outline" as const,
      };
    }

    if (currentTier === tier) {
      if (isTrialing) {
        return {
          text: "Current Plan (Trial)",
          action: () => onManageSubscription(),
          variant: "default" as const,
        };
      }
      return {
        text: "Current Plan",
        action: () => onManageSubscription(),
        variant: "default" as const,
      };
    }

    const tierOrder = ["STARTER", "HERO", "LEGEND"];
    const currentIndex = tierOrder.indexOf(currentTier);
    const targetIndex = tierOrder.indexOf(tier);

    if (targetIndex > currentIndex) {
      return {
        text: "Upgrade →",
        action: () => onUpgrade(tier),
        variant: "default" as const,
      };
    }

    if (targetIndex < currentIndex) {
      return {
        text: "Downgrade",
        action: () => onManageSubscription(),
        variant: "outline" as const,
      };
    }

    return {
      text: "Select Plan →",
      action: () => onUpgrade(tier),
      variant: "outline" as const,
    };
  };

  return (
    <section className="pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Starter */}
          <div
            className={`bg-white rounded-2xl border-2 p-8 transition-all hover:shadow-lg ${
              currentTier === "STARTER"
                ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {currentTier === "STARTER" && (
              <div className="mb-4">
                <span className="inline-block bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Current Plan
                </span>
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
            <p className="text-sm text-gray-600 mb-6">Try the basics</p>

            <div className="mb-6">
              <span className="text-5xl font-bold text-gray-900">₹0</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>

            <ul className="space-y-4 mb-8 min-h-[280px]">
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">5 reviews/month</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Basic security checks
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">Community support</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Up to 50KB file size
                </span>
              </li>
            </ul>

            <button
              onClick={getButtonConfig("STARTER").action}
              disabled={loading}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                getButtonConfig("STARTER").variant === "default"
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50"
              }`}
            >
              {loading ? "Processing..." : getButtonConfig("STARTER").text}
            </button>
          </div>

          {/* Hero - Popular */}
          <div
            className={`bg-white rounded-2xl border-2 p-8 relative shadow-xl hover:shadow-2xl transition-all ${
              currentTier === "HERO"
                ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
                : "border-gray-900"
            }`}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="inline-flex items-center gap-1 bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                {currentTier === "HERO" ? "✓ Your Plan" : "⭐ Popular"}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">Hero</h3>
            <p className="text-sm text-gray-600 mb-6">For champions</p>

            <div className="mb-6">
              <span className="text-5xl font-bold text-gray-900">
                ₹
                {billingCycle === "yearly"
                  ? Math.round(2999 * yearlyDiscount)
                  : 2999}
              </span>
              <span className="text-gray-600 ml-2">
                /month{billingCycle === "yearly" && ", billed yearly"}
              </span>
              {billingCycle === "yearly" && (
                <p className="text-sm text-green-600 font-medium mt-2">
                  💰 Save ₹{Math.round(2999 * 12 * (1 - yearlyDiscount))}/year
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8 min-h-[280px]">
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-900 font-medium">
                  Unlimited reviews
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Advanced security & performance
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">Priority support</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">API access</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Up to 100KB file size
                </span>
              </li>
            </ul>

            <button
              onClick={getButtonConfig("HERO").action}
              disabled={loading}
              className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : getButtonConfig("HERO").text}
            </button>
          </div>

          {/* Legend */}
          <div
            className={`bg-white rounded-2xl border-2 p-8 transition-all hover:shadow-lg ${
              currentTier === "LEGEND"
                ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {currentTier === "LEGEND" && (
              <div className="mb-4">
                <span className="inline-block bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Current Plan
                </span>
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Legend</h3>
            <p className="text-sm text-gray-600 mb-6">For elite teams</p>

            <div className="mb-6">
              <span className="text-5xl font-bold text-gray-900">Custom</span>
            </div>

            <ul className="space-y-4 mb-8 min-h-[280px]">
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Everything in Hero
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">Dedicated support</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Custom integrations
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">SLA guarantee</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Up to 500KB file size
                </span>
              </li>
            </ul>

            <Link
              href="/contact"
              className="block w-full text-center bg-white border-2 border-gray-900 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Contact Sales →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonTable() {
  return (
    <section id="comparison" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
          📊 Feature Comparison
        </h2>
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                    Starter
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                    Hero
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                    Legend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
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
                    starter: "50KB",
                    hero: "100KB",
                    legend: "500KB",
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
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium text-sm">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.starter === "boolean" ? (
                        row.starter ? (
                          <span className="text-green-600 text-xl">✓</span>
                        ) : (
                          <span className="text-gray-300 text-xl">✗</span>
                        )
                      ) : (
                        <span className="text-gray-700 text-sm">
                          {row.starter}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.hero === "boolean" ? (
                        row.hero ? (
                          <span className="text-green-600 text-xl">✓</span>
                        ) : (
                          <span className="text-gray-300 text-xl">✗</span>
                        )
                      ) : (
                        <span className="text-gray-900 text-sm font-medium">
                          {row.hero}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.legend === "boolean" ? (
                        row.legend ? (
                          <span className="text-green-600 text-xl">✓</span>
                        ) : (
                          <span className="text-gray-300 text-xl">✗</span>
                        )
                      ) : (
                        <span className="text-gray-900 text-sm font-medium">
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
          💎 Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-gray-300 transition-all"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-3">
                <span className="text-gray-400 shrink-0">❓</span>
                {faq.question}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed pl-8">
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
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center hover:border-green-300 transition-all">
            <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
              🔒
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Secure Payments
            </h3>
            <p className="text-green-700 text-sm">Protected by Stripe</p>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center hover:border-blue-300 transition-all">
            <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
              💳
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Cancel Anytime
            </h3>
            <p className="text-blue-700 text-sm">No long-term commitment</p>
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 text-center hover:border-purple-300 transition-all">
            <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
              🔄
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Money-Back Guarantee
            </h3>
            <p className="text-purple-700 text-sm">30-day full refund</p>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center hover:border-yellow-300 transition-all">
            <div className="w-16 h-16 bg-yellow-500 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
              ✅
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Trusted by 10,000+
            </h3>
            <p className="text-yellow-700 text-sm">Developers worldwide</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection({
  session,
  userSubscription,
}: {
  session: Session | null;
  userSubscription: UserSubscription | null;
}) {
  const currentTier = userSubscription?.tier || "STARTER";

  if (currentTier === "LEGEND") {
    return null;
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {session ? "Ready To Upgrade?" : "Ready To Level Up?"}
        </h2>
        <p className="text-xl text-gray-300 mb-10">
          {session
            ? "Unlock more features and take your code quality to the next level"
            : "Join thousands of developers improving their code quality with AI"}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!session ? (
            <>
              <Link
                href="/register"
                className="inline-block bg-white text-gray-900 px-12 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
              >
                🚀 Start Free Trial
              </Link>
              <a
                href="#comparison"
                className="inline-block bg-gray-800 border-2 border-white text-white px-12 py-4 rounded-lg font-bold text-lg hover:bg-gray-700 transition-all"
              >
                Compare Plans
              </a>
            </>
          ) : (
            <Link
              href="/pricing"
              className="inline-block bg-white text-gray-900 px-12 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              View All Plans
            </Link>
          )}
        </div>
        <p className="text-gray-400 text-sm mt-6">
          {!session && "No credit card required • "}14-day trial • Cancel
          anytime
        </p>
      </div>
    </section>
  );
}
