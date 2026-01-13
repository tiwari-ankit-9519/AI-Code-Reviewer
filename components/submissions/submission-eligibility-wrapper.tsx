// components/submissions/submission-eligibility-wrapper.tsx
"use client";

import { useEffect, useState } from "react";
import { checkSubmissionEligibility } from "@/lib/actions/session-check-actions";
import { getSessionWarning } from "@/lib/actions/session-warning-actions";
import CoolingPeriodBanner from "@/components/cooling-period-banner";
import SessionProgress from "@/components/session-progress";
import SessionWarningBanner from "@/components/session-warning-banner";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CoolingStatus {
  isInCoolingPeriod: boolean;
  endsAt: Date | null;
  hoursRemaining: number;
}

interface SessionProgressData {
  reviewsInSession: number;
  maxReviewsPerSession: number;
}

interface EligibilityResult {
  canSubmit: boolean;
  reason: string | null;
  coolingStatus: CoolingStatus | null;
  sessionProgress: SessionProgressData | null;
  tier: string | null;
}

interface SessionWarning {
  shouldWarn: boolean;
  reviewsRemaining: number;
  maxReviews: number;
  warningLevel: "none" | "low" | "critical";
  message: string;
  coolingPeriodHours: number;
}

interface SubmissionEligibilityWrapperProps {
  children: React.ReactNode;
}

export default function SubmissionEligibilityWrapper({
  children,
}: SubmissionEligibilityWrapperProps) {
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(
    null
  );
  const [warning, setWarning] = useState<SessionWarning | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkEligibility() {
      const [eligibilityResult, warningResult] = await Promise.all([
        checkSubmissionEligibility(),
        getSessionWarning(),
      ]);
      setEligibility(eligibilityResult);
      setWarning(warningResult);
      setLoading(false);
    }
    checkEligibility();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!eligibility) {
    return null;
  }

  return (
    <div className="space-y-6">
      {eligibility.reason === "cooling_period" && eligibility.coolingStatus && (
        <CoolingPeriodBanner
          endsAt={eligibility.coolingStatus.endsAt!}
          hoursRemaining={eligibility.coolingStatus.hoursRemaining}
          tier={eligibility.tier || "HERO"}
        />
      )}

      {eligibility.reason === "monthly_limit" && (
        <Card className="border-2 border-destructive bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2">
                  Monthly Limit Reached
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You&apos;ve used all 5 submissions this month. Upgrade to Hero
                  for unlimited reviews.
                </p>
                <Link href="/pricing">
                  <Button>Upgrade to Hero</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {warning?.shouldWarn && !eligibility.coolingStatus?.isInCoolingPeriod && (
        <SessionWarningBanner
          reviewsRemaining={warning.reviewsRemaining}
          maxReviews={warning.maxReviews}
          warningLevel={warning.warningLevel}
          message={warning.message}
          coolingPeriodHours={warning.coolingPeriodHours}
        />
      )}

      {eligibility.tier === "HERO" &&
        eligibility.sessionProgress &&
        !eligibility.coolingStatus?.isInCoolingPeriod &&
        !warning?.shouldWarn && (
          <SessionProgress
            currentCount={eligibility.sessionProgress.reviewsInSession}
            maxCount={eligibility.sessionProgress.maxReviewsPerSession}
            tier="HERO"
          />
        )}

      {eligibility.canSubmit &&
      !eligibility.coolingStatus?.isInCoolingPeriod ? (
        children
      ) : (
        <Card className="border-2">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">
              Submissions Currently Unavailable
            </h3>
            <p className="text-muted-foreground">
              {eligibility.reason === "cooling_period"
                ? "You're in a cooling period. Please wait for it to expire."
                : "You've reached your submission limit for this period."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
