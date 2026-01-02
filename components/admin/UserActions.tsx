"use client";

import { useState } from "react";
import {
  changeTierAdmin,
  extendTrialAdmin,
  resetSubmissionCountAdmin,
} from "@/lib/actions/admin-users";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  trialEndsAt: Date | null;
}

export default function UserActions({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);

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

  const handleChangeTier = async (newTier: string) => {
    setLoading(true);
    try {
      await changeTierAdmin(user.id, newTier, "Admin changed tier");
      toast.success(`Tier changed to ${newTier}`);
      setShowTierModal(false);
      window.location.reload();
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
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to extend trial"
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
          Reset
        </button>

        <button
          onClick={() => setShowTierModal(true)}
          disabled={loading}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm font-bold transition-all disabled:opacity-50"
        >
          Change Tier
        </button>

        {user.subscriptionStatus === "TRIALING" && (
          <button
            onClick={() => setShowTrialModal(true)}
            disabled={loading}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-sm font-bold transition-all disabled:opacity-50"
          >
            Extend Trial
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
    </>
  );
}
