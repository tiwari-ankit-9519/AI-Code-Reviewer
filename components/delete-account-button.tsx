"use client";

import { useState } from "react";
import { deleteAccount } from "@/lib/actions/user";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export function DeleteAccountButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setLoading(true);

    try {
      await deleteAccount();
      toast.success("Account deleted successfully");
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div>
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-500 transition-all shadow-lg shadow-red-500/50 hover:shadow-red-500/70 hover:-translate-y-1 font-mono uppercase border-4 border-red-700"
        >
          💀 Delete Account
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-red-500/10 border-2 border-red-400/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-400 shrink-0 mt-0.5 animate-pulse"
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
                <p className="text-sm text-red-300 font-black mb-2 font-mono uppercase">
                  ⚠️ Point of No Return!
                </p>
                <p className="text-sm text-red-400 font-mono">
                  All your quests, achievements, battle history, and warrior
                  data will be permanently destroyed. This cannot be undone!
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-300 mb-2 font-mono uppercase">
              Type <span className="text-red-400">DELETE</span> to confirm
              destruction
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0e27] border-2 border-red-500/50 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition text-white font-mono placeholder-gray-500"
              placeholder="Type DELETE here..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={loading || confirmText !== "DELETE"}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-black hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/50 hover:shadow-red-500/70 font-mono uppercase border-4 border-red-700"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                "💀 Confirm Delete"
              )}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
              }}
              disabled={loading}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl font-black hover:bg-gray-600 disabled:opacity-50 transition-all border-4 border-gray-800 font-mono uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
