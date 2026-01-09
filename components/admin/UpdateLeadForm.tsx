"use client";

import { useState } from "react";
import { updateLeadStatus } from "@/lib/actions/admin-leads";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

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
      <div className="space-y-2">
        <Label htmlFor="lead-status">Lead Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="lead-status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="QUALIFIED">Qualified</SelectItem>
            <SelectItem value="CONVERTED">Converted</SelectItem>
            <SelectItem value="LOST">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button
          onClick={handleUpdateStatus}
          disabled={loading || status === lead.status}
          className="w-full gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Update Status
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
