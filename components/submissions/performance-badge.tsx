// components/submissions/performance-badge.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PerformanceBadgeProps {
  level: "BASIC" | "ADVANCED" | "ENTERPRISE";
  checksPerformed?: string[];
  checksSkipped?: string[];
}

export function PerformanceBadge({
  level,
  checksPerformed = [],
  checksSkipped = [],
}: PerformanceBadgeProps) {
  const config = {
    BASIC: {
      label: "Basic Performance",
      icon: "🔍",
      color:
        "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
      description: "Core performance bottleneck detection",
    },
    ADVANCED: {
      label: "Advanced Performance",
      icon: "⚡",
      color:
        "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
      description: "Deep performance analysis with optimization strategies",
    },
    ENTERPRISE: {
      label: "Enterprise Performance",
      icon: "🚀",
      color:
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
      description: "Complete performance suite with scalability analysis",
    },
  };

  const { label, icon, color, description } = config[level];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`gap-1.5 ${color}`}>
            <span>{icon}</span>
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{description}</p>
            {checksPerformed.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Checks Performed:</p>
                <ul className="text-xs space-y-0.5 list-disc list-inside">
                  {checksPerformed.slice(0, 5).map((check, idx) => (
                    <li key={idx}>{check.replace(/_/g, " ")}</li>
                  ))}
                  {checksPerformed.length > 5 && (
                    <li>+{checksPerformed.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
