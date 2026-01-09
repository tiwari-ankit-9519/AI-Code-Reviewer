"use client";

import { useState } from "react";
import {
  cancelSubscriptionAdmin,
  resetSubmissionCountAdmin,
} from "@/lib/actions/admin-subscriptions";
import { toast } from "sonner";
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
import { RotateCcw, XCircle, Loader2, AlertTriangle } from "lucide-react";

interface User {
  id: string;
  email: string;
  subscriptionStatus: string;
  stripeCustomerId: string | null;
}

export default function SubscriptionActions({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

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
      setOpen(false);
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
    <div className="flex gap-2 justify-end">
      <Button
        onClick={handleResetCount}
        disabled={loading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCcw className="h-4 w-4" />
        )}
        Reset Count
      </Button>

      {user.subscriptionStatus === "ACTIVE" && user.stripeCustomerId && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={loading}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Cancel Subscription
              </DialogTitle>
              <DialogDescription>
                Cancel subscription for{" "}
                <span className="font-semibold">{user.email}</span>?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Choose when to cancel the subscription. Canceling at period
                  end allows the user to keep access until their billing cycle
                  completes.
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-col">
              <Button
                onClick={() => handleCancel(false)}
                disabled={loading}
                variant="outline"
                className="w-full gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Cancel at Period End
              </Button>
              <Button
                onClick={() => handleCancel(true)}
                disabled={loading}
                variant="destructive"
                className="w-full gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Cancel Immediately
              </Button>
              <Button
                onClick={() => setOpen(false)}
                disabled={loading}
                variant="ghost"
                className="w-full"
              >
                Nevermind
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
