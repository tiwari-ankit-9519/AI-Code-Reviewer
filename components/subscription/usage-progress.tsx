"use client";

import { SubscriptionTier } from "@prisma/client";

interface UsageProgressProps {
  current: number;
  limit: number;
  tier: SubscriptionTier;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function UsageProgress({
  current,
  limit,
  tier,
  showLabel = true,
  size = "md",
}: UsageProgressProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const remaining = isUnlimited ? -1 : Math.max(limit - current, 0);

  const getTierColor = () => {
    switch (tier) {
      case "LEGEND":
        return "from-yellow-400 to-orange-500";
      case "HERO":
        return "from-purple-500 to-pink-500";
      default:
        return "from-blue-500 to-cyan-500";
    }
  };

  const getProgressColor = () => {
    if (isUnlimited) return getTierColor();
    if (percentage >= 100) return "from-red-500 to-red-600";
    if (percentage >= 80) return "from-yellow-400 to-orange-500";
    if (percentage >= 51) return "from-blue-500 to-cyan-500";
    return "from-green-500 to-emerald-500";
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "h-2",
          text: "text-xs",
          badge: "text-xs px-2 py-1",
        };
      case "lg":
        return {
          container: "h-4",
          text: "text-base",
          badge: "text-sm px-3 py-1.5",
        };
      default:
        return {
          container: "h-3",
          text: "text-sm",
          badge: "text-xs px-2.5 py-1",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const getWarningMessage = () => {
    if (isUnlimited) return null;
    if (percentage >= 100) {
      return (
        <div className="mt-2 bg-red-500/20 border-2 border-red-400 text-red-300 px-3 py-2 rounded-lg font-mono text-xs flex items-center gap-2">
          <span>🚫</span>
          <span className="font-bold">Limit reached - Upgrade to continue</span>
        </div>
      );
    }
    if (percentage >= 80) {
      return (
        <div className="mt-2 bg-yellow-500/20 border-2 border-yellow-400 text-yellow-300 px-3 py-2 rounded-lg font-mono text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span className="font-bold">
            {remaining} {remaining === 1 ? "submission" : "submissions"}{" "}
            remaining
          </span>
        </div>
      );
    }
    return null;
  };

  if (isUnlimited) {
    return (
      <div className="space-y-2">
        {showLabel && (
          <div className="flex items-center justify-between">
            <span
              className={`text-gray-300 font-mono font-bold ${sizeClasses.text}`}
            >
              Monthly Usage
            </span>
            <span
              className={`bg-purple-500/20 text-purple-300 rounded-lg font-black border-2 border-purple-400/50 font-mono ${sizeClasses.badge}`}
            >
              ∞ Unlimited
            </span>
          </div>
        )}
        <div
          className={`w-full bg-gray-800 rounded-full overflow-hidden border-2 border-purple-500/50 ${sizeClasses.container}`}
        >
          <div className="h-full bg-linear-to-r from-purple-500 to-pink-500 w-full animate-pulse" />
        </div>
        {showLabel && (
          <p className="text-xs text-gray-400 font-mono text-center">
            {current} quests completed this month
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span
            className={`text-gray-300 font-mono font-bold ${sizeClasses.text}`}
          >
            Monthly Usage
          </span>
          <span
            className={`text-white font-black font-mono ${sizeClasses.text}`}
          >
            {current} / {limit} ({Math.round(percentage)}%)
          </span>
        </div>
      )}

      <div
        className={`w-full bg-gray-800 rounded-full overflow-hidden border-2 border-purple-500/50 relative ${sizeClasses.container}`}
      >
        <div
          className={`h-full bg-linear-to-r ${getProgressColor()} transition-all duration-500 relative overflow-hidden`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>

      {showLabel && !isUnlimited && percentage < 80 && (
        <p className="text-xs text-gray-400 font-mono">
          {remaining} {remaining === 1 ? "submission" : "submissions"} remaining
        </p>
      )}

      {getWarningMessage()}
    </div>
  );
}
