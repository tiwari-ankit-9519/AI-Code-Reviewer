// components/subscription-tab.tsx
"use client";

import { useState, useEffect } from "react";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";
import Link from "next/link";
import { CancelSubscriptionModal } from "./cancel-subscription-modal";
import { createPortalSession } from "@/lib/actions/billing";
import { getUsageData } from "@/lib/actions/usage";
import { getUserSubscriptionWithStripe } from "@/lib/actions/user-subscription";

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
  tier: SubscriptionTier;
  used: number;
  limit: number | string;
  remaining: number;
  percentage: number;
  maxFileSize: number;
  maxFileSizeLabel: string;
}

export function SubscriptionTabClient({ userId }: { userId: string }) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch usage data
        const usageData = await getUsageData();
        setUsage(usageData);

        // Fetch subscription details
        const subData = await getUserSubscriptionWithStripe();

        setSubscription({
          tier: subData.subscriptionTier,
          status: subData.subscriptionStatus,
          currentPeriodEnd: subData.currentPeriodEnd
            ? new Date(subData.currentPeriodEnd)
            : null,
          currentPeriodStart: subData.currentPeriodStart
            ? new Date(subData.currentPeriodStart)
            : null,
          amount: subData.amount || 0,
          currency: subData.currency || "inr",
          cancelAtPeriodEnd: subData.cancelAtPeriodEnd || false,
          trialEndsAt: subData.trialEndsAt
            ? new Date(subData.trialEndsAt)
            : null,
        });
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

  // Fix: Ensure isInTrial is always boolean, never null
  const isInTrial = Boolean(
    subscription.status === "TRIALING" &&
    subscription.trialEndsAt &&
    new Date(subscription.trialEndsAt) > new Date(),
  );

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
            isInTrial={isInTrial}
          />

          {usage && <UsageSection usage={usage} />}

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
        bg: "bg-linear-to-r from-yellow-500 to-orange-500",
        text: "text-white",
        icon: "👑",
      },
    };
    return badges[tier];
  };

  const badge = getTierBadge(subscription.tier);

  return (
    <div className="border-4 border-purple-500/30 rounded-xl p-6 bg-linear-to-br from-purple-900/20 to-pink-900/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black text-white font-mono uppercase">
          Current Plan
        </h3>
        <div
          className={`${badge.bg} ${badge.text} px-4 py-2 rounded-lg font-black text-sm flex items-center gap-2 border-2 border-white/20`}
        >
          <span>{badge.icon}</span>
          {subscription.tier}
        </div>
      </div>

      {isInTrial && subscription.trialEndsAt && (
        <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-4 mb-4">
          <p className="text-yellow-200 font-mono text-sm">
            🎯 Trial ends on{" "}
            {new Date(subscription.trialEndsAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {subscription.cancelAtPeriodEnd && (
        <div className="bg-red-500/20 border-2 border-red-400 rounded-lg p-4">
          <p className="text-red-200 font-mono text-sm">
            ⚠️ Subscription will cancel at period end
          </p>
        </div>
      )}
    </div>
  );
}

function UsageSection({ usage }: { usage: UsageData }) {
  const getTierColor = (tier: SubscriptionTier) => {
    const colors = {
      STARTER: "from-gray-600 to-gray-500",
      HERO: "from-purple-500 to-pink-500",
      LEGEND: "from-yellow-500 to-orange-500",
    };
    return colors[tier];
  };

  const getTierLabel = (tier: SubscriptionTier) => {
    const labels = {
      STARTER: "Starter Plan",
      HERO: "Hero Plan",
      LEGEND: "Legend Plan",
    };
    return labels[tier];
  };

  return (
    <div className="border-4 border-purple-500/30 rounded-xl p-6 bg-linear-to-br from-blue-900/20 to-purple-900/20">
      <h3 className="text-xl font-black text-white font-mono uppercase mb-4">
        Usage This Month
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400 font-mono">Plan Type</span>
          <span className="text-white font-bold font-mono">
            {getTierLabel(usage.tier)}
          </span>
        </div>

        <div>
          <div className="flex justify-between text-sm font-mono mb-2">
            <span className="text-gray-300">Submissions</span>
            <span className="text-white font-bold">
              {usage.used} /{" "}
              {typeof usage.limit === "number" ? usage.limit : usage.limit}
            </span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-linear-to-r ${getTierColor(usage.tier)} transition-all duration-500`}
              style={{ width: `${Math.min(usage.percentage, 100)}%` }}
            />
          </div>
        </div>

        {typeof usage.limit === "number" && usage.remaining > 0 && (
          <p className="text-sm text-gray-400 font-mono">
            {usage.remaining} submissions remaining this month
          </p>
        )}

        {usage.tier === "STARTER" && usage.percentage > 80 && (
          <div className="bg-orange-500/20 border-2 border-orange-400 rounded-lg p-3 mt-4">
            <p className="text-orange-200 font-mono text-sm">
              ⚠️ You&apos;re running low on submissions. Upgrade to Hero for
              unlimited!
            </p>
          </div>
        )}

        {usage.tier === "HERO" && (
          <div className="bg-green-500/20 border-2 border-green-400 rounded-lg p-3 mt-4">
            <p className="text-green-200 font-mono text-sm">
              ✨ Enjoying unlimited submissions with Hero!
            </p>
          </div>
        )}

        {usage.tier === "LEGEND" && (
          <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-3 mt-4">
            <p className="text-yellow-200 font-mono text-sm">
              👑 Legend status: All premium features unlocked!
            </p>
          </div>
        )}
      </div>
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
    <div className="border-4 border-purple-500/30 rounded-xl p-6 bg-linear-to-br from-gray-900/40 to-purple-900/20">
      <h3 className="text-xl font-black text-white font-mono uppercase mb-4">
        Manage Plan
      </h3>

      <div className="space-y-3">
        {subscription.tier !== "STARTER" && (
          <button
            onClick={onManage}
            className="w-full px-6 py-4 bg-purple-600 text-white rounded-xl font-black hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:-translate-y-1 font-mono uppercase border-4 border-purple-800"
          >
            💳 Manage Billing
          </button>
        )}

        {subscription.tier !== "STARTER" && !subscription.cancelAtPeriodEnd && (
          <button
            onClick={onCancel}
            className="w-full px-6 py-4 bg-red-600 text-white rounded-xl font-black hover:bg-red-500 transition-all shadow-lg font-mono uppercase border-4 border-red-800"
          >
            ❌ Cancel Subscription
          </button>
        )}

        {subscription.tier === "STARTER" && (
          <Link
            href="/dashboard/subscription"
            className="block w-full text-center px-6 py-4 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:-translate-y-1 font-mono uppercase border-4 border-purple-800"
          >
            ⚡ Upgrade to Hero
          </Link>
        )}

        {subscription.tier === "HERO" && !subscription.cancelAtPeriodEnd && (
          <Link
            href="/dashboard/subscription"
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
