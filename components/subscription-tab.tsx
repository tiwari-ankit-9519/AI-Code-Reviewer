"use client";

import { useState, useEffect } from "react";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";
import Link from "next/link";
import { CancelSubscriptionModal } from "./cancel-subscription-modal";

interface SubscriptionData {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  amount: number;
  currency: string;
  cancelAtPeriodEnd: boolean;
}

interface UsageData {
  currentCount: number;
  limit: number | string;
  resetDate: Date;
}

export function SubscriptionTab({ userId }: { userId: string }) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [subRes, usageRes] = await Promise.all([
          fetch("/api/subscription/details"),
          fetch("/api/subscription/usage"),
        ]);

        const subData = await subRes.json();
        const usageData = await usageRes.json();

        setSubscription(subData);
        setUsage(usageData);
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
      const response = await fetch("/api/subscription/portal", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
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
          <CurrentPlanSection subscription={subscription} />
          {usage && <UsageSection usage={usage} tier={subscription.tier} />}
          <PlanManagementSection
            subscription={subscription}
            onManage={handleManageSubscription}
            onCancel={() => setShowCancelModal(true)}
          />
          <BillingHistorySection />
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
}: {
  subscription: SubscriptionData;
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

        {subscription.tier !== "STARTER" && (
          <div>
            <p className="text-sm text-gray-400 font-mono mb-2">Amount</p>
            <p className="text-white font-black font-mono">
              ₹{(subscription.amount / 100).toLocaleString("en-IN")}/
              {subscription.currency === "usd" ? "month" : "month"}
            </p>
          </div>
        )}
      </div>

      {subscription.cancelAtPeriodEnd && (
        <div className="mt-4 bg-orange-500/20 border-2 border-orange-400 rounded-lg p-3">
          <p className="text-orange-300 text-sm font-mono font-bold">
            ⚠️ Your subscription will be cancelled on{" "}
            {new Date(subscription.currentPeriodEnd!).toLocaleDateString(
              "en-IN"
            )}
          </p>
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
  const isUnlimited = usage.limit === "unlimited";
  const percentage = isUnlimited
    ? 0
    : Math.min((usage.currentCount / (usage.limit as number)) * 100, 100);

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
        </>
      )}

      <p className="text-gray-400 text-sm font-mono">
        Resets on:{" "}
        {new Date(usage.resetDate).toLocaleDateString("en-IN", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
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

        {subscription.tier === "HERO" && !subscription.cancelAtPeriodEnd && (
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

interface BillingHistoryItem {
  date: string;
  description: string;
  amount: number;
  invoiceUrl?: string;
}

function BillingHistorySection() {
  const [history, setHistory] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch("/api/subscription/history");
        const data = await response.json();
        setHistory(data.history || []);
      } catch (error) {
        console.error("Failed to fetch billing history:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  return (
    <div className="bg-gray-800/50 rounded-xl border-2 border-purple-500/30 p-6">
      <h3 className="text-lg font-black text-white mb-4 font-mono uppercase">
        📜 Billing History
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <p className="text-gray-400 text-center py-8 font-mono">
          No billing history yet
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-2 border-purple-500/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black text-gray-300 uppercase font-mono">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-black text-gray-300 uppercase font-mono">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-black text-gray-300 uppercase font-mono">
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-xs font-black text-gray-300 uppercase font-mono">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/20">
              {history.map((item, idx) => (
                <tr key={idx} className="hover:bg-purple-500/5">
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                    {new Date(item.date).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-mono text-right font-bold">
                    ₹{(item.amount / 100).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.invoiceUrl && (
                      <a
                        href={item.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-mono text-sm font-bold"
                      >
                        PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
