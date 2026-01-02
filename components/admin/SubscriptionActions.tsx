"use client";

import { useState } from "react";
import {
  cancelSubscriptionAdmin,
  resetSubmissionCountAdmin,
} from "@/lib/actions/admin-subscriptions";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  subscriptionStatus: string;
  stripeCustomerId: string | null;
}

export default function SubscriptionActions({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleResetCount = async () => {
    setLoading(true);
    try {
      await resetSubmissionCountAdmin(user.id);
      toast.success("Submission count reset successfully");
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset count"
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
      window.location.reload();
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
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleResetCount}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-bold transition-all disabled:opacity-50"
        >
          Reset Count
        </button>

        {user.subscriptionStatus === "ACTIVE" && user.stripeCustomerId && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={loading}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-bold transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

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
