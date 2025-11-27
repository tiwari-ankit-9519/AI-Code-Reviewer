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
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
        >
          Delete Account
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium mb-2">
              This action cannot be undone!
            </p>
            <p className="text-sm text-red-700">
              All your code reviews, analysis results, and account data will be
              permanently deleted.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#21242c] mb-2">
              Type <span className="font-bold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="DELETE"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={loading || confirmText !== "DELETE"}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
              }}
              disabled={loading}
              className="px-4 py-2 border border-[#ececec] rounded-lg font-medium text-[#15192c] hover:bg-[#f9f9fa] transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
