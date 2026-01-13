"use client";

import { useState } from "react";
import {
  changeTierAdmin,
  extendTrialAdmin,
  resetSubmissionCountAdmin,
} from "@/lib/actions/admin-users";
import {
  resetUserSessionCount,
  resetUserCompletely,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type ResetType = "monthly" | "session" | "complete" | null;

export default function UserActions({ user }: { user: User }) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetType, setResetType] = useState<ResetType>(null);

  const handleResetMonthly = async () => {
    setLoadingAction("reset-monthly");
    try {
      await resetSubmissionCountAdmin(user.id);
      toast.success("Monthly submission count reset successfully");
      setShowResetConfirm(false);
      setResetType(null);
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset monthly count"
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetSession = async () => {
    setLoadingAction("reset-session");
    try {
      await resetUserSessionCount(user.id);
      toast.success("Session count reset successfully");
      setShowResetConfirm(false);
      setResetType(null);
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset session"
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCompleteReset = async () => {
    setLoadingAction("reset-complete");
    try {
      await resetUserCompletely(user.id);
      toast.success("Complete reset successful");
      setShowResetConfirm(false);
      setResetType(null);
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete reset"
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetClick = (type: ResetType) => {
    setResetType(type);
    setShowResetConfirm(true);
  };

  const executeReset = () => {
    switch (resetType) {
      case "monthly":
        return handleResetMonthly();
      case "session":
        return handleResetSession();
      case "complete":
        return handleCompleteReset();
    }
  };

  const getResetDescription = () => {
    switch (resetType) {
      case "monthly":
        return "This will reset the monthly submission count to 0. The user will be able to submit up to their tier limit again.";
      case "session":
        return "This will reset the current session review count to 0. The user can continue their session without hitting the cooling period.";
      case "complete":
        return "This will reset ALL counts (monthly + session), clear any cooling periods, and end all active sessions. This is a full reset.";
      default:
        return "";
    }
  };

  const getResetTitle = () => {
    switch (resetType) {
      case "monthly":
        return "Reset Monthly Count?";
      case "session":
        return "Reset Session Count?";
      case "complete":
        return "Complete Reset?";
      default:
        return "Reset User?";
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
  const showSessionReset =
    user.subscriptionTier === "HERO" || user.subscriptionTier === "LEGEND";

  return (
    <>
      <div className="flex gap-2 justify-end">
        {/* Reset Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              {loadingAction?.startsWith("reset") ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RotateCcw className="h-3 w-3" />
              )}
              Reset
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Reset Options</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => handleResetClick("monthly")}>
              Reset Monthly Count
            </DropdownMenuItem>

            {showSessionReset && (
              <DropdownMenuItem onClick={() => handleResetClick("session")}>
                Reset Session Count
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => handleResetClick("complete")}
              className="text-destructive focus:text-destructive"
            >
              Complete Reset (All)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{getResetTitle()}</DialogTitle>
            <DialogDescription>
              <span className="font-semibold">{user.email}</span>
              <br />
              <br />
              {getResetDescription()}
              <br />
              <br />
              This action will be logged in the subscription history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowResetConfirm(false);
                setResetType(null);
              }}
              disabled={isLoading}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={executeReset}
              disabled={isLoading}
              variant={resetType === "complete" ? "destructive" : "default"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                "Confirm Reset"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
