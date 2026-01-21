// components/subscription/subscription-success-handler.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SubscriptionSuccessHandlerProps {
  success: boolean;
  canceled: boolean;
}

export function SubscriptionSuccessHandler({
  success,
  canceled,
}: SubscriptionSuccessHandlerProps) {
  const router = useRouter();

  useEffect(() => {
    if (success) {
      toast.success("Payment successful! Your subscription has been upgraded.");

      setTimeout(() => {
        router.refresh();
        const url = new URL(window.location.href);
        url.searchParams.delete("success");
        window.history.replaceState({}, "", url.toString());
      }, 1000);
    }

    if (canceled) {
      toast.info("Payment canceled. Your subscription remains unchanged.");

      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("canceled");
        window.history.replaceState({}, "", url.toString());
      }, 1000);
    }
  }, [success, canceled, router]);

  return null;
}
