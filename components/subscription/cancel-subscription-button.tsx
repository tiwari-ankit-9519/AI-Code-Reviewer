// components/subscription/cancel-subscription-button.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Loader2, XCircle, RotateCcw } from "lucide-react";

interface CancelSubscriptionButtonProps {
  subscriptionId: string;
  isCanceled: boolean;
}

export function CancelSubscriptionButton({
  subscriptionId,
  isCanceled,
}: CancelSubscriptionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      toast.success(
        "Subscription canceled. You'll have access until the end of your billing period.",
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to cancel subscription",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/subscription/reactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to reactivate subscription");
      }

      toast.success("Subscription reactivated successfully!");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to reactivate subscription",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isCanceled) {
    return (
      <Button onClick={handleReactivate} disabled={isLoading} variant="default">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Reactivating...
          </>
        ) : (
          <>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reactivate Subscription
          </>
        )}
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Subscription
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            Your subscription will be canceled at the end of the current billing
            period. You&apos;ll continue to have access to all features until
            then.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Cancel Subscription
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
