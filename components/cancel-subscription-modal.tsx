"use client";

import { useState } from "react";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    currentPeriodEnd: Date | null;
  };
}

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  subscription,
}: CancelSubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"confirm" | "alternatives" | "success">(
    "confirm"
  );

  if (!isOpen) return null;

  const handleCancel = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });

      if (response.ok) {
        setStep("success");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error("Cancellation failed");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-red-500 shadow-2xl max-w-2xl w-full animate-slideUp relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(239,68,68,0.2),transparent_50%)]"></div>

        <div className="relative z-10 p-8">
          {step === "confirm" && (
            <>
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-2xl shadow-red-500/50 border-4 border-white/20">
                  ⚠️
                </div>
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
              </div>

              <h2
                className="text-3xl font-black text-white mb-3 font-mono uppercase"
                style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
              >
                Cancel Subscription?
              </h2>

              <p className="text-gray-300 text-lg mb-6 font-mono leading-relaxed">
                Are you sure you want to cancel your {subscription.tier}{" "}
                subscription?
              </p>

              <div className="bg-red-500/20 border-2 border-red-400 rounded-xl p-4 mb-6">
                <h3 className="text-red-300 font-black font-mono text-sm uppercase mb-3">
                  📋 What Happens Next:
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-red-200 text-sm font-mono">
                    <span className="shrink-0">•</span>
                    <span>
                      Your plan will remain active until{" "}
                      {subscription.currentPeriodEnd &&
                        new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString("en-IN", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-red-200 text-sm font-mono">
                    <span className="shrink-0">•</span>
                    <span>
                      You&apos;ll be downgraded to Starter plan after that
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-red-200 text-sm font-mono">
                    <span className="shrink-0">•</span>
                    <span>
                      You&apos;ll lose access to unlimited submissions
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-red-200 text-sm font-mono">
                    <span className="shrink-0">•</span>
                    <span>Advanced security features will be disabled</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("alternatives")}
                  className="flex-1 px-6 py-4 bg-gray-700 text-white rounded-xl font-black hover:bg-gray-600 transition-all border-4 border-gray-800 font-mono uppercase"
                >
                  See Alternatives
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-red-600 text-white rounded-xl font-black hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/50 font-mono uppercase border-4 border-red-700"
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
                      Cancelling...
                    </span>
                  ) : (
                    "Yes, Cancel"
                  )}
                </button>
              </div>
            </>
          )}

          {step === "alternatives" && (
            <>
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-3xl shadow-2xl shadow-blue-500/50 border-4 border-white/20">
                  💡
                </div>
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
              </div>

              <h2
                className="text-3xl font-black text-white mb-3 font-mono uppercase"
                style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
              >
                Before You Go...
              </h2>

              <p className="text-gray-300 text-lg mb-6 font-mono leading-relaxed">
                Here are some alternatives to cancelling:
              </p>

              <div className="space-y-4 mb-6">
                <button
                  onClick={onClose}
                  className="w-full bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 p-6 rounded-xl text-left hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg border-4 border-yellow-600"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      ⚡
                    </div>
                    <div>
                      <h3 className="font-black text-lg font-mono uppercase mb-1">
                        Keep Hero Plan
                      </h3>
                      <p className="text-sm font-mono">
                        Continue with unlimited reviews and advanced features
                      </p>
                    </div>
                  </div>
                </button>

                <button className="w-full bg-gray-800/50 border-2 border-purple-500/30 text-white p-6 rounded-xl text-left hover:bg-gray-800 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      ⏸️
                    </div>
                    <div>
                      <h3 className="font-black text-lg font-mono uppercase mb-1">
                        Pause for 1 Month
                      </h3>
                      <p className="text-sm font-mono text-gray-400">
                        Take a break and resume later (Coming Soon)
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setStep("confirm")}
                  className="w-full bg-red-500/20 border-2 border-red-400 text-red-300 p-6 rounded-xl text-left hover:bg-red-500/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      🌟
                    </div>
                    <div>
                      <h3 className="font-black text-lg font-mono uppercase mb-1">
                        Downgrade to Starter
                      </h3>
                      <p className="text-sm font-mono">
                        Cancel and switch to free plan with 5 reviews/month
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-green-500/50 animate-bounce">
                ✓
              </div>
              <h2
                className="text-3xl font-black text-white mb-3 font-mono uppercase"
                style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
              >
                Subscription Cancelled
              </h2>
              <p className="text-gray-300 text-lg font-mono mb-6">
                Your cancellation has been processed successfully.
              </p>
              <div className="bg-green-500/20 border-2 border-green-400 rounded-xl p-4">
                <p className="text-green-300 text-sm font-mono">
                  A confirmation email has been sent to your inbox.
                </p>
              </div>
            </div>
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
