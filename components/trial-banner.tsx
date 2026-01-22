"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { checkTrialStatus } from "@/lib/actions/subscription-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Sparkles, Zap, AlertCircle, ArrowRight } from "lucide-react";

interface TrialStatus {
  isInTrial: boolean;
  daysRemaining: number;
  trialEndsAt: Date | null;
}

interface TrialBannerProps {
  userId: string;
}

export default function TrialBanner({ userId }: TrialBannerProps) {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);

  useEffect(() => {
    async function fetchTrialStatus() {
      const status = await checkTrialStatus(userId);
      setTrialStatus(status);
    }
    fetchTrialStatus();
  }, [userId]);

  if (!trialStatus || !trialStatus.isInTrial) {
    return null;
  }

  const isUrgent = trialStatus.daysRemaining <= 2;
  const isWarning = trialStatus.daysRemaining <= 4;

  return (
    <div className="border-b bg-linear-to-r from-primary/10 via-primary/5 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Alert className="border-primary/50 bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left Content */}
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">
                    You&apos;re on a 7-Day Hero Trial!
                  </p>
                  <Badge
                    variant={
                      isUrgent
                        ? "destructive"
                        : isWarning
                          ? "default"
                          : "secondary"
                    }
                    className="gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    {trialStatus.daysRemaining}{" "}
                    {trialStatus.daysRemaining === 1 ? "day" : "days"} left
                  </Badge>
                </div>

                <AlertDescription className="text-sm text-muted-foreground">
                  Unlimited reviews, advanced features, and priority support
                </AlertDescription>

                {/* Trial End Date */}
                {trialStatus.trialEndsAt && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Trial ends{" "}
                    {new Date(trialStatus.trialEndsAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/pricing" className="flex-1 sm:flex-initial">
                <Button
                  className="w-full gap-2 group hover:gap-3 transition-all"
                  size="sm"
                >
                  <Zap className="h-4 w-4" />
                  Upgrade Now
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {isUrgent && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    Trial Ending Soon!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    After your trial ends, you&apos;ll be moved to the Starter
                    plan (5 reviews/month). Upgrade to Hero for unlimited
                    access!
                  </p>
                </div>
              </div>
            </div>
          )}
        </Alert>
      </div>
    </div>
  );
}
