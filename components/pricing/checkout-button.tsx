"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { createCheckoutSession } from "@/lib/actions/checkout";
import { toast } from "sonner";

interface CheckoutButtonProps {
  tier: "HERO" | "LEGEND";
}

export function CheckoutButton({ tier }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { url } = await createCheckoutSession(tier);
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start checkout. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full gap-2 group hover:gap-3 transition-all"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Start 7-Day Trial
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </Button>
  );
}
