// components/session-warning-banner.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface SessionWarningBannerProps {
  reviewsRemaining: number;
  maxReviews: number;
  warningLevel: "none" | "low" | "critical";
  message: string;
  coolingPeriodHours: number;
}

export default function SessionWarningBanner({
  reviewsRemaining,
  maxReviews,
  warningLevel,
  message,
  coolingPeriodHours,
}: SessionWarningBannerProps) {
  if (warningLevel === "none") {
    return null;
  }

  const getWarningStyles = () => {
    if (warningLevel === "critical") {
      return {
        bgClass: "bg-gradient-to-r from-red-500 to-orange-600",
        icon: AlertTriangle,
        iconColor: "text-white",
        textColor: "text-white",
      };
    }
    return {
      bgClass: "bg-gradient-to-r from-yellow-400 to-orange-500",
      icon: AlertCircle,
      iconColor: "text-gray-900",
      textColor: "text-gray-900",
    };
  };

  const config = getWarningStyles();
  const Icon = config.icon;

  return (
    <Card
      className={`border-2 ${
        warningLevel === "critical"
          ? "border-red-500/50"
          : "border-yellow-500/50"
      } ${config.bgClass} animate-in slide-in-from-top duration-500`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
              warningLevel === "critical" ? "bg-white/20" : "bg-gray-900/20"
            }`}
          >
            <Icon className={`h-6 w-6 ${config.iconColor} animate-pulse`} />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3
                className={`font-black text-xl mb-1 font-mono uppercase ${config.textColor}`}
              >
                {warningLevel === "critical"
                  ? "⚠️ SESSION LIMIT WARNING"
                  : "⏰ APPROACHING SESSION LIMIT"}
              </h3>
              <p className={`text-sm font-bold ${config.textColor}`}>
                {message}
              </p>
            </div>

            <div
              className={`${
                warningLevel === "critical" ? "bg-white/20" : "bg-gray-900/20"
              } rounded-lg p-4 border-2 ${
                warningLevel === "critical"
                  ? "border-white/30"
                  : "border-gray-900/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold ${config.textColor}`}>
                  Reviews Used
                </span>
                <span
                  className={`text-2xl font-black font-mono ${config.textColor}`}
                >
                  {maxReviews - reviewsRemaining} / {maxReviews}
                </span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    warningLevel === "critical" ? "bg-white" : "bg-gray-900"
                  }`}
                  style={{
                    width: `${
                      ((maxReviews - reviewsRemaining) / maxReviews) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {warningLevel === "critical" && (
              <div className="bg-white/20 rounded-lg p-3 border-2 border-white/30">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-white shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-white font-mono uppercase">
                      What happens next?
                    </p>
                    <p className="text-xs text-white/90 font-mono mt-1">
                      After your next submission, you&apos;ll enter a{" "}
                      {coolingPeriodHours}-hour cooling period. During this
                      time, you won&apos;t be able to submit new code reviews.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
