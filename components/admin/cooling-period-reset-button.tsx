// components/admin/cooling-period-reset-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { resetUserCoolingPeriod } from "@/lib/actions/admin-session-management";

interface CoolingPeriodResetButtonProps {
  userId: string;
  userName: string;
}

export default function CoolingPeriodResetButton({
  userId,
  userName,
}: CoolingPeriodResetButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const result = await resetUserCoolingPeriod(userId);
      toast.success(result.message);
      setOpen(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to reset cooling period"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Cooling
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Cooling Period?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reset the cooling period for{" "}
            <span className="font-semibold">{userName}</span>?
            <br />
            <br />
            This will immediately allow them to submit new code reviews. This
            action will be logged in the subscription history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            disabled={loading}
            className="bg-primary"
          >
            {loading ? "Resetting..." : "Reset Cooling Period"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
