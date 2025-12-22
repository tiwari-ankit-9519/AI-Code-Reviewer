"use client";

import Link from "next/link";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";

interface SubscriptionStatusProps {
  user: {
    subscriptionTier: SubscriptionTier;
    subscriptionStatus: SubscriptionStatus;
    monthlySubmissionCount: number;
    trialEndsAt: Date | null;
  };
}

export function CheckSubscriptionStatus({ user }: SubscriptionStatusProps) {
  const isInTrial = user.subscriptionStatus === "TRIALING";
  const isStarter = user.subscriptionTier === "STARTER";
  const isHero = user.subscriptionTier === "HERO";
  const isLegend = user.subscriptionTier === "LEGEND";

  const starterLimit = 5;
  const usagePercentage = isStarter
    ? Math.min((user.monthlySubmissionCount / starterLimit) * 100, 100)
    : 0;

  const getProgressColor = () => {
    if (usagePercentage >= 100) return "bg-red-500";
    if (usagePercentage >= 80) return "bg-yellow-400";
    if (usagePercentage >= 51) return "bg-blue-500";
    return "bg-green-500";
  };

  const getTierBadge = () => {
    if (isInTrial) {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-black text-sm border-2 border-yellow-600 shadow-lg font-mono uppercase">
          🎉 Trial Hero
        </span>
      );
    }

    if (isLegend) {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-black text-sm border-2 border-yellow-600 shadow-lg font-mono uppercase">
          👑 Legend
        </span>
      );
    }

    if (isHero) {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg font-black text-sm border-2 border-purple-800 shadow-lg font-mono uppercase">
          ⚡ Hero
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-black text-sm border-2 border-gray-800 shadow-lg font-mono uppercase">
        🌟 Starter
      </span>
    );
  };

  const getTrialCountdown = () => {
    if (!isInTrial || !user.trialEndsAt) return null;

    const now = new Date();
    const trialEnd = new Date(user.trialEndsAt);
    const millisecondsRemaining = trialEnd.getTime() - now.getTime();
    const daysRemaining = Math.ceil(
      millisecondsRemaining / (1000 * 60 * 60 * 24)
    );

    return (
      <div className="mt-4 bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-yellow-300 font-mono uppercase">
              ⏰ Trial Ends In
            </p>
            <p className="text-xs text-yellow-400 font-mono mt-1">
              {trialEnd.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-yellow-300 font-mono">
              {Math.max(0, daysRemaining)}
            </p>
            <p className="text-xs text-yellow-400 font-mono uppercase">
              {daysRemaining === 1 ? "Day" : "Days"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-white font-mono uppercase">
          📊 Subscription
        </h3>
        {getTierBadge()}
      </div>

      {isStarter && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-300 font-mono font-bold">
                Monthly Usage
              </p>
              <p className="text-sm font-black text-white font-mono">
                {user.monthlySubmissionCount} / {starterLimit}
              </p>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border-2 border-purple-500/50">
              <div
                className={`h-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          {usagePercentage >= 80 && usagePercentage < 100 && (
            <div className="mb-4 bg-yellow-500/20 border-2 border-yellow-400 text-yellow-300 px-4 py-3 rounded-lg font-mono text-sm">
              ⚠️ You&apos;ve used {user.monthlySubmissionCount}/{starterLimit}{" "}
              submissions
            </div>
          )}

          {usagePercentage >= 100 && (
            <div className="mb-4 bg-red-500/20 border-2 border-red-400 text-red-300 px-4 py-3 rounded-lg font-mono text-sm">
              🚫 Monthly limit reached
            </div>
          )}

          <Link
            href="/pricing"
            className="block w-full text-center px-6 py-3 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase text-sm border-4 border-yellow-600"
          >
            ⚡ Upgrade to Hero - Unlimited
          </Link>
        </>
      )}

      {(isHero || isLegend) && !isInTrial && (
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 text-2xl font-black text-white font-mono">
            <span>∞</span>
            <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Unlimited
            </span>
          </div>
          <p className="text-sm text-gray-400 font-mono mt-2">
            {isLegend ? "Premium" : "Submissions"} Every Month
          </p>
        </div>
      )}

      {getTrialCountdown()}

      {isInTrial && (
        <Link
          href="/pricing"
          className="block w-full text-center px-6 py-3 mt-4 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase text-sm border-4 border-yellow-600"
        >
          🔥 Keep Hero Forever - ₹2999/mo
        </Link>
      )}
    </div>
  );
}
