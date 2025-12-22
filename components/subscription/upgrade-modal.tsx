"use client";

import { useState } from "react";
import { SubscriptionTier } from "@prisma/client";

type UpgradeModalState =
  | "limit-reached"
  | "soft-prompt"
  | "trial-expired"
  | "feature-locked";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: UpgradeModalState;
  currentTier: SubscriptionTier;
  currentUsage?: number;
  limit?: number;
}

export function UpgradeModal({
  isOpen,
  onClose,
  state,
  currentTier,
  currentUsage = 0,
  limit = 5,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "HERO" }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  };

  const getModalContent = () => {
    switch (state) {
      case "limit-reached":
        return {
          icon: "🚫",
          title: "Monthly Limit Reached",
          description: `You've used all ${limit} submissions this month. Upgrade to Hero for unlimited code reviews!`,
          color: "red",
          canDismiss: false,
        };
      case "trial-expired":
        return {
          icon: "⏰",
          title: "Trial Has Ended",
          description:
            "Your 7-day Hero trial has expired. Upgrade now to keep unlimited submissions and advanced features!",
          color: "orange",
          canDismiss: false,
        };
      case "feature-locked":
        return {
          icon: "🔒",
          title: "Hero Feature",
          description:
            "This feature is available for Hero members. Upgrade to unlock advanced code analysis and unlimited submissions!",
          color: "purple",
          canDismiss: true,
        };
      default:
        return {
          icon: "⚡",
          title: "Upgrade to Hero",
          description:
            "Get unlimited code reviews and advanced analysis features. Take your coding to the next level!",
          color: "yellow",
          canDismiss: true,
        };
    }
  };

  const content = getModalContent();

  const getColorClasses = () => {
    switch (content.color) {
      case "red":
        return {
          border: "border-red-500",
          bg: "from-red-900/30 to-red-950/30",
          icon: "bg-red-500",
          iconShadow: "shadow-red-500/50",
        };
      case "orange":
        return {
          border: "border-orange-500",
          bg: "from-orange-900/30 to-orange-950/30",
          icon: "bg-orange-500",
          iconShadow: "shadow-orange-500/50",
        };
      case "purple":
        return {
          border: "border-purple-500",
          bg: "from-purple-900/30 to-purple-950/30",
          icon: "bg-purple-500",
          iconShadow: "shadow-purple-500/50",
        };
      default:
        return {
          border: "border-yellow-500",
          bg: "from-yellow-900/30 to-orange-900/30",
          icon: "bg-yellow-500",
          iconShadow: "shadow-yellow-500/50",
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 ${colors.border} shadow-2xl max-w-2xl w-full animate-slideUp relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(147,51,234,0.2),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15),transparent_50%)]"></div>

        <div className="relative z-10 p-8">
          <div className="flex items-start justify-between mb-6">
            <div
              className={`w-16 h-16 ${colors.icon} rounded-2xl flex items-center justify-center text-3xl shadow-2xl ${colors.iconShadow} border-4 border-white/20`}
            >
              {content.icon}
            </div>
            {content.canDismiss && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <h2
            className="text-3xl font-black text-white mb-3 font-mono uppercase"
            style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
          >
            {content.title}
          </h2>

          <p className="text-gray-300 text-lg mb-6 font-mono leading-relaxed">
            {content.description}
          </p>

          {state === "limit-reached" && (
            <div className="bg-red-500/20 border-2 border-red-400 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300 font-black font-mono text-sm uppercase mb-1">
                    Current Usage
                  </p>
                  <p className="text-red-200 font-mono text-sm">
                    {currentUsage} / {limit} submissions used
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-red-300 font-mono">
                    100%
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-linear-to-br from-purple-900/30 to-pink-900/30 rounded-xl border-2 border-purple-500/50 p-6 mb-6">
            <h3 className="text-xl font-black text-white mb-4 font-mono uppercase flex items-center gap-2">
              <span>⚡</span>
              Hero Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
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
                <div>
                  <p className="text-white font-bold font-mono text-sm">
                    Unlimited Reviews
                  </p>
                  <p className="text-gray-400 text-xs font-mono">
                    No monthly limits
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
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
                <div>
                  <p className="text-white font-bold font-mono text-sm">
                    Advanced Security
                  </p>
                  <p className="text-gray-400 text-xs font-mono">
                    Deep vulnerability scanning
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
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
                <div>
                  <p className="text-white font-bold font-mono text-sm">
                    Priority Support
                  </p>
                  <p className="text-gray-400 text-xs font-mono">
                    Get help faster
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
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
                <div>
                  <p className="text-white font-bold font-mono text-sm">
                    API Access
                  </p>
                  <p className="text-gray-400 text-xs font-mono">
                    Integrate anywhere
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border-2 border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-mono mb-1">
                  {currentTier === "STARTER"
                    ? "Upgrade from Starter"
                    : "Current Plan"}
                </p>
                <p className="text-white text-3xl font-black font-mono">
                  $29
                  <span className="text-gray-400 text-lg font-normal">
                    /month
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-400 text-sm font-black font-mono">
                  ✓ Cancel Anytime
                </p>
                <p className="text-gray-400 text-xs font-mono">
                  No long-term commitment
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="flex-1 px-8 py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase text-lg border-4 border-yellow-600"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-6 w-6"
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
                  Processing...
                </span>
              ) : (
                "🚀 Upgrade to Hero"
              )}
            </button>

            {content.canDismiss && (
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-4 bg-gray-700 text-white rounded-xl font-black hover:bg-gray-600 disabled:opacity-50 transition-all border-4 border-gray-800 font-mono uppercase"
              >
                Maybe Later
              </button>
            )}
          </div>

          {!content.canDismiss && (
            <p className="text-center text-gray-400 text-xs font-mono mt-4">
              You must upgrade to continue using the service
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
