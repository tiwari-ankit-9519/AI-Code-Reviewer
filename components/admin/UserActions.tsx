"use client";

import { useState } from "react";
import {
  changeTierAdmin,
  extendTrialAdmin,
  resetSubmissionCountAdmin,
} from "@/lib/actions/admin-users";
import { toast } from "sonner";
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
  RotateCcw,
  Settings,
  Clock,
  Loader2,
  Award,
  Zap,
  Crown,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  trialEndsAt: Date | null;
}

export default function UserActions({ user }: { user: User }) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);

  const handleResetCount = async () => {
    setLoadingAction("reset");
    try {
      await resetSubmissionCountAdmin(user.id);
      toast.success("Submission count reset successfully");
      window.location.reload();
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
      await changeTierAdmin(user.id, newTier, "Admin changed tier");
      toast.success(`Tier changed to ${newTier}`);
      setShowTierModal(false);
      window.location.reload();
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
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to extend trial"
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const isLoading = loadingAction !== null;

  return (
    <>
      <div className="flex gap-2 justify-end">
        <Button
          onClick={handleResetCount}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          {loadingAction === "reset" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RotateCcw className="h-3 w-3" />
          )}
          Reset
        </Button>

        <Button
          onClick={() => setShowTierModal(true)}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <Settings className="h-3 w-3" />
          Change Tier
        </Button>

        {user.subscriptionStatus === "TRIALING" && (
          <Button
            onClick={() => setShowTrialModal(true)}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <Clock className="h-3 w-3" />
            Extend Trial
          </Button>
        )}
      </div>

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
    </>
  );
}
