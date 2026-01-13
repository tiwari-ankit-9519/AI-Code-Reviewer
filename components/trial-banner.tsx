"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { checkTrialStatus } from "@/lib/actions/subscription-actions";

interface TrialStatus {
  isInTrial: boolean;
  daysRemaining: number;
  trialEndsAt: Date | null;
}

interface TrialBannerProps {
  userId: string;
}

export default function TrialBanner({ userId }: TrialBannerProps) {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);

  useEffect(() => {
    async function fetchTrialStatus() {
      const status = await checkTrialStatus(userId);
      setTrialStatus(status);
    }
    fetchTrialStatus();
  }, [userId]);

  if (!trialStatus || !trialStatus.isInTrial) {
    return null;
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 2) return "from-red-500 to-orange-600";
    if (days <= 4) return "from-orange-500 to-yellow-500";
    return "from-yellow-400 to-orange-500";
  };

  const getUrgencyIcon = (days: number) => {
    if (days <= 2) return "⚠️";
    if (days <= 4) return "⏰";
    return "🎉";
  };

  return (
    <div
      className={`bg-linear-to-r ${getUrgencyColor(
        trialStatus.daysRemaining
      )} border-b-4 border-yellow-600 shadow-2xl shadow-yellow-500/50 relative overflow-hidden rounded-xl`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-size-[250%_250%] animate-shimmer"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-2xl shadow-lg animate-bounce">
              {getUrgencyIcon(trialStatus.daysRemaining)}
            </div>
            <div className="text-center sm:text-left">
              <p className="text-gray-900 font-black text-lg font-mono uppercase flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <span>You&apos;re on a 7-Day Hero Trial!</span>
                <span className="px-3 py-1 bg-gray-900 text-yellow-400 rounded-lg text-sm font-black border-2 border-gray-800 shadow-lg">
                  {trialStatus.daysRemaining}{" "}
                  {trialStatus.daysRemaining === 1 ? "DAY" : "DAYS"} LEFT
                </span>
              </p>
              <p className="text-gray-800 text-sm font-mono mt-1 font-bold">
                Unlimited reviews, advanced features, and priority support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              href="/pricing"
              className="px-6 py-3 bg-gray-900 text-yellow-400 rounded-xl font-black hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 font-mono uppercase text-sm border-4 border-gray-800 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Upgrade Now
            </Link>

            {trialStatus.trialEndsAt && (
              <div className="text-xs text-gray-800 font-mono font-bold bg-gray-900/20 px-3 py-2 rounded-lg border-2 border-gray-900/30">
                Expires:{" "}
                {new Date(trialStatus.trialEndsAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>
        </div>

        {trialStatus.daysRemaining <= 2 && (
          <div className="mt-3 bg-gray-900/80 rounded-lg px-4 py-3 border-2 border-gray-800">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5"
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
              <div>
                <p className="text-sm font-black text-yellow-400 font-mono uppercase">
                  Trial Ending Soon!
                </p>
                <p className="text-xs text-gray-300 font-mono mt-1">
                  After your trial ends, you&apos;ll be moved to the Starter
                  plan (5 reviews/month). Upgrade to Hero for unlimited access!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
