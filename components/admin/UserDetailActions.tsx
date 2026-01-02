"use client";

import { useState } from "react";
import {
  changeTierAdmin,
  extendTrialAdmin,
  resetSubmissionCountAdmin,
} from "@/lib/actions/admin-users";
import { cancelSubscriptionAdmin } from "@/lib/actions/admin-subscriptions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  trialEndsAt: Date | null;
  stripeCustomerId: string | null;
}

export default function UserDetailActions({ user }: { user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleResetCount = async () => {
    if (!confirm("Reset submission count for this user?")) return;

    setLoading(true);
    try {
      await resetSubmissionCountAdmin(user.id);
      toast.success("Submission count reset successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset count"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTier = async (newTier: string) => {
    setLoading(true);
    try {
      await changeTierAdmin(
        user.id,
        newTier,
        "Admin changed tier from detail page"
      );
      toast.success(`Tier changed to ${newTier}`);
      setShowTierModal(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change tier"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExtendTrial = async (days: number) => {
    setLoading(true);
    try {
      await extendTrialAdmin(user.id, days);
      toast.success(`Trial extended by ${days} days`);
      setShowTrialModal(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to extend trial"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (immediate: boolean) => {
    setLoading(true);
    try {
      await cancelSubscriptionAdmin(user.id, immediate);
      toast.success(
        immediate
          ? "Subscription cancelled immediately"
          : "Subscription will cancel at period end"
      );
      setShowCancelModal(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <button
          onClick={handleResetCount}
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
        >
          🔄 Reset Submission Count
        </button>

        <button
          onClick={() => setShowTierModal(true)}
          disabled={loading}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
        >
          🎯 Change Tier
        </button>

        {user.subscriptionStatus === "TRIALING" && (
          <button
            onClick={() => setShowTrialModal(true)}
            disabled={loading}
            className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
          >
            ⏰ Extend Trial
          </button>
        )}

        {user.subscriptionStatus === "ACTIVE" && user.stripeCustomerId && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={loading}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
          >
            ❌ Cancel Subscription
          </button>
        )}
      </div>

      {showTierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border-2 border-purple-500/50 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-black text-white mb-4">Change Tier</h3>
            <p className="text-gray-400 mb-2">Change tier for {user.email}</p>
            <p className="text-sm text-gray-500 mb-6">
              Current: {user.subscriptionTier}
            </p>
            <div className="space-y-3">
              {user.subscriptionTier !== "STARTER" && (
                <button
                  onClick={() => handleChangeTier("STARTER")}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  Downgrade to STARTER
                </button>
              )}
              {user.subscriptionTier !== "HERO" && (
                <button
                  onClick={() => handleChangeTier("HERO")}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  Change to HERO
                </button>
              )}
              {user.subscriptionTier !== "LEGEND" && (
                <button
                  onClick={() => handleChangeTier("LEGEND")}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  Upgrade to LEGEND
                </button>
              )}
              <button
                onClick={() => setShowTierModal(false)}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showTrialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border-2 border-yellow-500/50 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-black text-white mb-4">Extend Trial</h3>
            <p className="text-gray-400 mb-6">Extend trial for {user.email}</p>
            <div className="space-y-3">
              <button
                onClick={() => handleExtendTrial(3)}
                disabled={loading}
                className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
              >
                Extend by 3 days
              </button>
              <button
                onClick={() => handleExtendTrial(7)}
                disabled={loading}
                className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
              >
                Extend by 7 days
              </button>
              <button
                onClick={() => handleExtendTrial(14)}
                disabled={loading}
                className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
              >
                Extend by 14 days
              </button>
              <button
                onClick={() => setShowTrialModal(false)}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border-2 border-red-500/50 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-black text-white mb-4">
              Cancel Subscription
            </h3>
            <p className="text-gray-400 mb-6">
              Cancel subscription for {user.email}?
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleCancel(false)}
                disabled={loading}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
              >
                Cancel at Period End
              </button>
              <button
                onClick={() => handleCancel(true)}
                disabled={loading}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
              >
                Cancel Immediately
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all disabled:opacity-50"
              >
                Nevermind
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
