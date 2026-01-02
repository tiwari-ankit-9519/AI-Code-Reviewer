"use client";

import { useState } from "react";
import { updateLeadStatus } from "@/lib/actions/admin-leads";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Lead {
  id: string;
  status: string;
  assignedTo: string | null;
}

export default function UpdateLeadForm({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(lead.status);

  const handleUpdateStatus = async () => {
    if (status === lead.status) {
      toast.error("Status unchanged");
      return;
    }

    setLoading(true);
    try {
      await updateLeadStatus(lead.id, status);
      toast.success("Lead status updated");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-black text-gray-300 mb-2">
          Lead Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900 border-2 border-purple-500/30 rounded-xl text-white focus:border-purple-500 outline-none"
        >
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="CONVERTED">Converted</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          onClick={handleUpdateStatus}
          disabled={loading || status === lead.status}
          className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Status"}
        </button>
      </div>
    </div>
  );
}
