// components/submissions/security-badge.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SecurityBadgeProps {
  level: "BASIC" | "ADVANCED" | "ENTERPRISE";
  checksPerformed?: string[];
  checksSkipped?: string[];
}

export function SecurityBadge({
  level,
  checksPerformed = [],
  checksSkipped = [],
}: SecurityBadgeProps) {
  const config = {
    BASIC: {
      label: "Basic Security",
      icon: Shield,
      color:
        "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/30",
      description: "Essential security vulnerability detection",
    },
    ADVANCED: {
      label: "Advanced Security",
      icon: ShieldAlert,
      color:
        "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
      description:
        "Comprehensive security analysis with attack vector detection",
    },
    ENTERPRISE: {
      label: "Enterprise Security",
      icon: ShieldCheck,
      color:
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
      description: "Full security suite with compliance and zero-day detection",
    },
  };

  const { label, icon: Icon, color, description } = config[level];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`gap-1.5 ${color}`}>
            <Icon className="h-3 w-3" />
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
