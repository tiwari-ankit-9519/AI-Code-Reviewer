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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  RotateCcw,
  Settings,
  Clock,
  XCircle,
  Loader2,
  Award,
  Zap,
  Crown,
  AlertTriangle,
} from "lucide-react";

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
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleResetCount = async () => {
    setLoadingAction("reset");
    try {
      await resetSubmissionCountAdmin(user.id);
      toast.success("Submission count reset successfully");
      setShowResetDialog(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset count"
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleChangeTier = async (newTier: string) => {
    setLoadingAction(newTier);
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
      setLoadingAction(null);
    }
  };

  const handleExtendTrial = async (days: number) => {
    setLoadingAction(`extend-${days}`);
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
      setLoadingAction(null);
    }
  };

  const handleCancel = async (immediate: boolean) => {
    setLoadingAction(immediate ? "cancel-immediate" : "cancel-period");
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
      setLoadingAction(null);
    }
  };

  const isLoading = loadingAction !== null;

  return (
    <>
      <div className="space-y-3">
        <Button
          onClick={() => setShowResetDialog(true)}
          disabled={isLoading}
          variant="outline"
          className="w-full gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Submission Count
        </Button>

        <Button
          onClick={() => setShowTierModal(true)}
          disabled={isLoading}
          variant="outline"
          className="w-full gap-2"
        >
          <Settings className="h-4 w-4" />
          Change Tier
        </Button>

        {user.subscriptionStatus === "TRIALING" && (
          <Button
            onClick={() => setShowTrialModal(true)}
            disabled={isLoading}
            variant="outline"
            className="w-full gap-2"
          >
            <Clock className="h-4 w-4" />
            Extend Trial
          </Button>
        )}

        {user.subscriptionStatus === "ACTIVE" && user.stripeCustomerId && (
          <Button
            onClick={() => setShowCancelModal(true)}
            disabled={isLoading}
            variant="destructive"
            className="w-full gap-2"
          >
            <XCircle className="h-4 w-4" />
            Cancel Subscription
          </Button>
        )}
      </div>

      {/* Reset Count Confirmation */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Submission Count?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the submission count to 0 for{" "}
              <span className="font-semibold">{user.email}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetCount} disabled={isLoading}>
              {loadingAction === "reset" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reset Count
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Tier Dialog */}
      <Dialog open={showTierModal} onOpenChange={setShowTierModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Change Tier
            </DialogTitle>
            <DialogDescription>
              Change tier for{" "}
              <span className="font-semibold">{user.email}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg border bg-muted/50 p-3 mb-4">
              <p className="text-sm text-muted-foreground">
                Current Tier:{" "}
                <span className="font-semibold">{user.subscriptionTier}</span>
              </p>
            </div>

            <div className="space-y-2">
              {user.subscriptionTier !== "STARTER" && (
                <Button
                  onClick={() => handleChangeTier("STARTER")}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full gap-2"
                >
                  {loadingAction === "STARTER" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <Award className="h-4 w-4" />
                  Downgrade to STARTER
                </Button>
              )}
              {user.subscriptionTier !== "HERO" && (
                <Button
                  onClick={() => handleChangeTier("HERO")}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full gap-2"
                >
                  {loadingAction === "HERO" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <Zap className="h-4 w-4" />
                  Change to HERO
                </Button>
              )}
              {user.subscriptionTier !== "LEGEND" && (
                <Button
                  onClick={() => handleChangeTier("LEGEND")}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full gap-2"
                >
                  {loadingAction === "LEGEND" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <Crown className="h-4 w-4" />
                  Upgrade to LEGEND
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowTierModal(false)}
              disabled={isLoading}
              variant="ghost"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Trial Dialog */}
      <Dialog open={showTrialModal} onOpenChange={setShowTrialModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Extend Trial
            </DialogTitle>
            <DialogDescription>
              Extend trial for{" "}
              <span className="font-semibold">{user.email}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <Button
              onClick={() => handleExtendTrial(3)}
              disabled={isLoading}
              variant="outline"
              className="w-full gap-2"
            >
              {loadingAction === "extend-3" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Extend by 3 days
            </Button>
            <Button
              onClick={() => handleExtendTrial(7)}
              disabled={isLoading}
              variant="outline"
              className="w-full gap-2"
            >
              {loadingAction === "extend-7" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Extend by 7 days
            </Button>
            <Button
              onClick={() => handleExtendTrial(14)}
              disabled={isLoading}
              variant="outline"
              className="w-full gap-2"
            >
              {loadingAction === "extend-14" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Extend by 14 days
            </Button>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowTrialModal(false)}
              disabled={isLoading}
              variant="ghost"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
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
            <div className="rounded-lg border bg-muted/50 p-4 mb-4">
              <p className="text-sm text-muted-foreground">
                Choose when to cancel the subscription. Canceling at period end
                allows the user to keep access until their billing cycle
                completes.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => handleCancel(false)}
                disabled={isLoading}
                variant="outline"
                className="w-full gap-2"
              >
                {loadingAction === "cancel-period" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Cancel at Period End
              </Button>
              <Button
                onClick={() => handleCancel(true)}
                disabled={isLoading}
                variant="destructive"
                className="w-full gap-2"
              >
                {loadingAction === "cancel-immediate" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Cancel Immediately
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowCancelModal(false)}
              disabled={isLoading}
              variant="ghost"
            >
              Nevermind
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
