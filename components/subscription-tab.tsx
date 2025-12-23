"use client";

import { useState, useEffect } from "react";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";
import Link from "next/link";
import { CancelSubscriptionModal } from "./cancel-subscription-modal";
import { createPortalSession } from "@/lib/actions/billing";
import { getUserUsage } from "@/lib/actions/usage";

interface SubscriptionData {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  currentPeriodStart: Date | null;
  amount: number;
  currency: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: Date | null;
}

interface UsageData {
  currentCount: number;
  limit: number | string;
  percentage: number;
  tier: SubscriptionTier;
  isInTrial: boolean;
  remaining: number;
}

export function SubscriptionTabClient({ userId }: { userId: string }) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const usageData = await getUserUsage();
        setUsage(usageData);

        const userSubResponse = await fetch("/api/user/subscription", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (userSubResponse.ok) {
          const userSubData = await userSubResponse.json();

          setSubscription({
            tier: userSubData.subscriptionTier,
            status: userSubData.subscriptionStatus,
            currentPeriodEnd: userSubData.currentPeriodEnd || null,
            currentPeriodStart: userSubData.currentPeriodStart || null,
            amount: userSubData.amount || 0,
            currency: userSubData.currency || "inr",
            cancelAtPeriodEnd: userSubData.cancelAtPeriodEnd || false,
            trialEndsAt: userSubData.trialEndsAt || null,
          });
        } else {
          setSubscription({
            tier: usageData.tier,
            status: usageData.isInTrial ? "TRIALING" : "ACTIVE",
            currentPeriodEnd: null,
            currentPeriodStart: null,
            amount: 0,
            currency: "inr",
            cancelAtPeriodEnd: false,
            trialEndsAt: null,
          });
        }
      } catch (error) {
        console.error("Failed to fetch subscription data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  const handleManageSubscription = async () => {
    try {
      const result = await createPortalSession();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Failed to open portal:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 shadow-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  return (
    <>
      <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b-4 border-purple-500/30 bg-linear-to-r from-purple-900/20 to-pink-900/20">
          <h2 className="text-2xl font-black text-white font-mono uppercase flex items-center gap-2">
            <span>💳</span>
            Subscription & Billing
          </h2>
          <p className="text-sm text-gray-400 mt-1 font-mono">
            Manage your plan and billing
          </p>
        </div>

        <div className="p-6 space-y-6">
          <CurrentPlanSection
            subscription={subscription}
            isInTrial={usage?.isInTrial || false}
          />
          {usage && <UsageSection usage={usage} tier={subscription.tier} />}
          <PlanManagementSection
            subscription={subscription}
            onManage={handleManageSubscription}
            onCancel={() => setShowCancelModal(true)}
          />
        </div>
      </div>

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        subscription={subscription}
      />
    </>
  );
}

function CurrentPlanSection({
  subscription,
  isInTrial,
}: {
  subscription: SubscriptionData;
  isInTrial: boolean;
}) {
  const getTierBadge = (tier: SubscriptionTier) => {
    const badges = {
      STARTER: { bg: "bg-gray-700", text: "text-gray-300", icon: "🌟" },
      HERO: {
        bg: "bg-linear-to-r from-purple-600 to-pink-600",
        text: "text-white",
        icon: "⚡",
      },
      LEGEND: {
        bg: "bg-linear-to-r from-yellow-400 to-orange-500",
        text: "text-gray-900",
        icon: "👑",
      },
    };
    return badges[tier];
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    const badges = {
      ACTIVE: {
        bg: "bg-green-500/20",
        text: "text-green-300",
        border: "border-green-400",
      },
      TRIALING: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-300",
        border: "border-yellow-400",
      },
      CANCELLED: {
        bg: "bg-red-500/20",
        text: "text-red-300",
        border: "border-red-400",
      },
      EXPIRED: {
        bg: "bg-gray-500/20",
        text: "text-gray-300",
        border: "border-gray-400",
      },
      PAST_DUE: {
        bg: "bg-orange-500/20",
        text: "text-orange-300",
        border: "border-orange-400",
      },
    };
    return badges[status];
  };

  const tierBadge = getTierBadge(subscription.tier);
  const statusBadge = getStatusBadge(subscription.status);

  const calculateDaysRemaining = (trialEnd: Date | null) => {
    if (!trialEnd) return 0;
    const now = new Date();
    const end = new Date(trialEnd);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = subscription.trialEndsAt
    ? calculateDaysRemaining(subscription.trialEndsAt)
    : 0;

  return (
    <div className="bg-gray-800/50 rounded-xl border-2 border-purple-500/30 p-6">
      <h3 className="text-lg font-black text-white mb-4 font-mono uppercase">
        📊 Current Plan Overview
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400 font-mono mb-2">Plan</p>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 ${tierBadge.bg} ${tierBadge.text} rounded-lg font-black text-sm border-2 border-white/20 shadow-lg font-mono uppercase`}
          >
            <span>{tierBadge.icon}</span>
            {subscription.tier}
            {isInTrial && subscription.tier === "HERO" && (
              <span className="ml-1 text-xs">(Trial)</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-400 font-mono mb-2">Status</p>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 ${statusBadge.bg} ${statusBadge.text} rounded-lg font-black text-sm border-2 ${statusBadge.border} font-mono uppercase`}
          >
            {subscription.status}
          </div>
        </div>

        {subscription.currentPeriodEnd && (
          <div>
            <p className="text-sm text-gray-400 font-mono mb-2">
              {subscription.cancelAtPeriodEnd ? "Cancels On" : "Next Billing"}
            </p>
            <p className="text-white font-black font-mono">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                "en-IN",
                {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </p>
          </div>
        )}

        {subscription.tier !== "STARTER" && subscription.amount > 0 && (
          <div>
            <p className="text-sm text-gray-400 font-mono mb-2">Amount</p>
            <p className="text-white font-black font-mono">
              ₹{(subscription.amount / 100).toLocaleString("en-IN")}/month
            </p>
          </div>
        )}
      </div>

      {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
        <div className="mt-4 bg-orange-500/20 border-2 border-orange-400 rounded-lg p-3">
          <p className="text-orange-300 text-sm font-mono font-bold">
            ⚠️ Your subscription will be cancelled on{" "}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString(
              "en-IN"
            )}
          </p>
        </div>
      )}

      {isInTrial &&
        subscription.tier === "HERO" &&
        subscription.trialEndsAt && (
          <div className="mt-4 bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎉</span>
              <div className="flex-1">
                <p className="text-yellow-300 text-sm font-mono font-bold mb-2">
                  You&apos;re on a 7-Day Hero Trial!
                </p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-300 text-xs font-mono">
                    Trial ends in:
                  </span>
                  <span className="px-2 py-1 bg-yellow-400 text-gray-900 rounded font-black text-xs font-mono">
                    {daysRemaining} {daysRemaining === 1 ? "DAY" : "DAYS"}
                  </span>
                </div>
                <p className="text-yellow-400 text-xs font-mono">
                  {new Date(subscription.trialEndsAt).toLocaleDateString(
                    "en-IN",
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

function UsageSection({
  usage,
  tier,
}: {
  usage: UsageData;
  tier: SubscriptionTier;
}) {
  const isUnlimited =
    usage.limit === "unlimited" || tier === "HERO" || tier === "LEGEND";
  const percentage = usage.percentage;

  const getProgressColor = () => {
    if (percentage >= 100) return "from-red-500 to-red-600";
    if (percentage >= 80) return "from-yellow-400 to-orange-500";
    if (percentage >= 51) return "from-blue-500 to-cyan-500";
    return "from-green-500 to-emerald-500";
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border-2 border-purple-500/30 p-6">
      <h3 className="text-lg font-black text-white mb-4 font-mono uppercase">
        📈 Usage This Month
      </h3>

      {isUnlimited ? (
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 text-3xl font-black text-white font-mono mb-2">
            <span>∞</span>
            <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Unlimited
            </span>
          </div>
          <p className="text-gray-400 font-mono text-sm">
            {usage.currentCount} submissions used this month
          </p>
          {usage.isInTrial && (
            <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500/20 border-2 border-yellow-400 rounded-lg px-4 py-2">
              <span className="text-yellow-400 text-lg">🎉</span>
              <span className="text-yellow-300 text-sm font-mono font-bold">
                Trial Period
              </span>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-300 font-mono font-bold">
              Submissions Used
            </p>
            <p className="text-white font-black font-mono text-lg">
              {usage.currentCount} / {usage.limit}
            </p>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border-2 border-purple-500/50 mb-4">
            <div
              className={`h-full bg-linear-to-r ${getProgressColor()} transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          {usage.remaining >= 0 && (
            <p className="text-gray-400 text-sm font-mono">
              {usage.remaining}{" "}
              {usage.remaining === 1 ? "submission" : "submissions"} remaining
            </p>
          )}

          {percentage >= 80 && percentage < 100 && (
            <div className="mt-4 bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-3">
              <p className="text-yellow-300 text-sm font-mono font-bold">
                ⚠️ You&apos;ve used {percentage}% of your monthly limit.
                Consider upgrading to Hero for unlimited reviews!
              </p>
            </div>
          )}

          {percentage >= 100 && (
            <div className="mt-4 bg-red-500/20 border-2 border-red-400 rounded-lg p-3">
              <p className="text-red-300 text-sm font-mono font-bold">
                🚫 Monthly limit reached. Upgrade to Hero to continue submitting
                code.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PlanManagementSection({
  subscription,
  onManage,
  onCancel,
}: {
  subscription: SubscriptionData;
  onManage: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl border-2 border-purple-500/30 p-6">
      <h3 className="text-lg font-black text-white mb-4 font-mono uppercase">
        ⚙️ Plan Management
      </h3>

      <div className="space-y-3">
        {subscription.tier === "STARTER" && (
          <Link
            href="/pricing"
            className="block w-full text-center px-6 py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase border-4 border-yellow-600"
          >
            🚀 Upgrade to Hero
          </Link>
        )}

        {subscription.tier === "HERO" &&
          subscription.status !== "TRIALING" &&
          !subscription.cancelAtPeriodEnd && (
            <>
              <button
                onClick={onManage}
                className="w-full px-6 py-4 bg-purple-600 text-white rounded-xl font-black hover:bg-purple-500 transition-all shadow-lg font-mono uppercase border-4 border-purple-800"
              >
                💳 Manage Subscription
              </button>

              <button
                onClick={onCancel}
                className="w-full px-6 py-4 bg-red-600/20 text-red-300 rounded-xl font-black hover:bg-red-600/30 transition-all border-2 border-red-400 font-mono uppercase"
              >
                ⚠️ Cancel Subscription
              </button>
            </>
          )}

        {subscription.tier === "HERO" && subscription.status === "TRIALING" && (
          <Link
            href="/pricing"
            className="block w-full text-center px-6 py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase border-4 border-yellow-600"
          >
            🔥 Keep Hero Forever - ₹2999/month
          </Link>
        )}

        {subscription.tier === "HERO" && subscription.cancelAtPeriodEnd && (
          <button
            onClick={onManage}
            className="w-full px-6 py-4 bg-green-600 text-white rounded-xl font-black hover:bg-green-500 transition-all shadow-lg font-mono uppercase border-4 border-green-800"
          >
            ♻️ Reactivate Subscription
          </button>
        )}

        {subscription.tier === "LEGEND" && (
          <Link
            href="/contact"
            className="block w-full text-center px-6 py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg font-mono uppercase border-4 border-yellow-600"
          >
            📞 Contact Support
          </Link>
        )}
      </div>
    </div>
  );
}
