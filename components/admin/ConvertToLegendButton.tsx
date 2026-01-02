"use client";

import { useState } from "react";
import { convertLeadToLegend } from "@/lib/actions/admin-leads";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ConvertToLegendButtonProps {
  leadId: string;
  email: string;
}

export default function ConvertToLegendButton({
  leadId,
  email,
}: ConvertToLegendButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const result = await convertLeadToLegend(leadId, email);
      toast.success("Lead converted to Legend tier!");
      setShowModal(false);
      router.refresh();
      router.push(`/dashboard/admin/users/${result.userId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to convert lead"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black transition-all hover:shadow-lg hover:shadow-yellow-500/50"
      >
        🚀 Convert to Legend
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border-2 border-yellow-500/50 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-black text-white mb-4">
              Convert to Legend Tier
            </h3>
            <p className="text-gray-400 mb-4">
              This will create or upgrade the user account for:
            </p>
            <p className="text-white font-bold mb-6">{email}</p>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-400 text-sm font-bold mb-2">
                What happens:
              </p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• User gets Legend tier access</li>
                <li>• Unlimited submissions</li>
                <li>• Welcome email sent (if new user)</li>
                <li>• Lead marked as CONVERTED</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConvert}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold transition-all disabled:opacity-50"
              >
                {loading ? "Converting..." : "Confirm Conversion"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all disabled:opacity-50"
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
