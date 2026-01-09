"use client";

import { useState } from "react";
import { convertLeadToLegend } from "@/lib/actions/admin-leads";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Rocket, CheckCircle, Loader2 } from "lucide-react";

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
  const [open, setOpen] = useState(false);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const result = await convertLeadToLegend(leadId, email);
      toast.success("Lead converted to Legend tier!");
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Rocket className="h-4 w-4" />
          Convert to Legend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Convert to Legend Tier
          </DialogTitle>
          <DialogDescription>
            This will create or upgrade the user account for:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <p className="font-semibold text-sm mb-1">Email Address</p>
            <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-2 rounded-md">
              {email}
            </p>
          </div>

          <Alert className="border-primary/50 bg-primary/5">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertDescription>
              <p className="font-semibold text-sm mb-2">What happens:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>User gets Legend tier access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Unlimited submissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Welcome email sent (if new user)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Lead marked as CONVERTED</span>
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleConvert} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Converting..." : "Confirm Conversion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
