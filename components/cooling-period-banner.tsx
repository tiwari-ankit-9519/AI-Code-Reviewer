"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Ban } from "lucide-react";
import Link from "next/link";

interface CoolingPeriodBannerProps {
  endsAt: Date;
  hoursRemaining: number;
  tier: string;
}

export default function CoolingPeriodBanner({
  endsAt,
  hoursRemaining,
  tier,
}: CoolingPeriodBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });

        const totalDuration = hoursRemaining * 60 * 60 * 1000;
        const elapsed = totalDuration - difference;
        const progressPercent = (elapsed / totalDuration) * 100;
        setProgress(Math.min(progressPercent, 100));
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setProgress(100);
        window.location.reload();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endsAt, hoursRemaining]);

  const getUrgencyLevel = () => {
    if (timeLeft.hours <= 2) return "critical";
    if (timeLeft.hours <= 6) return "warning";
    return "normal";
  };

  const urgencyLevel = getUrgencyLevel();

  return (
    <Card className="border-2 border-destructive/50 bg-destructive/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-destructive/10 border-2 border-destructive/50">
            <Ban className="h-6 w-6 text-destructive" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-xl text-foreground">
                  Cooling Period Active
                </h3>
                {urgencyLevel === "critical" && (
                  <span className="text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded border border-green-500/50">
                    Almost Done!
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                You&apos;ve reached your session limit. Your next review session
                will be available in{" "}
                <span className="font-semibold text-foreground">
                  {timeLeft.hours > 0 &&
                    `${timeLeft.hours} hour${timeLeft.hours !== 1 ? "s" : ""}`}
                  {timeLeft.hours > 0 && timeLeft.minutes > 0 && " and "}
                  {timeLeft.minutes > 0 &&
                    `${timeLeft.minutes} minute${
                      timeLeft.minutes !== 1 ? "s" : ""
                    }`}
                </span>
                .
              </p>
            </div>

            <div className="space-y-3 bg-muted/30 rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">
                  Time Remaining
                </span>
                <span className="font-mono text-2xl font-bold text-foreground tabular-nums">
                  {String(timeLeft.hours).padStart(2, "0")}:
                  {String(timeLeft.minutes).padStart(2, "0")}:
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>

              <Progress value={progress} className="h-2" />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Started {hoursRemaining}h ago</span>
                <span>
                  Available{" "}
                  {new Date(endsAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {tier === "HERO" && (
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-2">
                      Want unlimited reviews without cooling periods?
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Upgrade to Legend tier for configurable limits with no
                      mandatory waits.
                    </p>
                    <Link href="/pricing">
                      <Button size="sm" variant="default" className="gap-2">
                        <Zap className="h-4 w-4" />
                        Upgrade to Legend
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {urgencyLevel === "critical" && (
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎉</span>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                    Almost there! You&apos;ll be able to submit new reviews very
                    soon.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
