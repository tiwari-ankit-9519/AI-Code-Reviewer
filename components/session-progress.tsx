"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, AlertTriangle, CheckCircle } from "lucide-react";

interface SessionProgressProps {
  currentCount: number;
  maxCount: number;
  tier: string;
}

export default function SessionProgress({
  currentCount,
  maxCount,
  tier,
}: SessionProgressProps) {
  const percentage = (currentCount / maxCount) * 100;
  const remaining = maxCount - currentCount;

  const getProgressColor = () => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-orange-500";
    return "bg-green-500";
  };

  const getIcon = () => {
    if (percentage >= 90)
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (percentage >= 70) return <Zap className="h-5 w-5 text-orange-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  return (
    <Card className="border-2 hover:border-primary/50 transition-all duration-300">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getIcon()}
              <h3 className="font-bold text-lg">Current Session Progress</h3>
            </div>
            <Badge variant={percentage >= 90 ? "destructive" : "default"}>
              {tier}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Reviews Used</span>
              <span className="font-mono text-lg font-bold">
                {currentCount} / {maxCount}
              </span>
            </div>
            <Progress
              value={percentage}
              className={`h-3 ${getProgressColor()}`}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{remaining} reviews remaining</span>
              <span>{Math.round(percentage)}%</span>
            </div>
          </div>

          {percentage >= 80 && (
            <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-3">
              <p className="text-sm text-orange-600 dark:text-orange-400 font-semibold">
                ⚠️ You&apos;re approaching your session limit. After {remaining}{" "}
                more review{remaining !== 1 ? "s" : ""}, you&apos;ll enter a
                24-hour cooling period.
              </p>
            </div>
          )}

          {percentage >= 100 && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                🚫 Session limit reached. A cooling period will begin after your
                next submission.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
