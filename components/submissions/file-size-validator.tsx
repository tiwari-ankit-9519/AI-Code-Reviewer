// components/submissions/file-size-validator.tsx

"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { FileWarning, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FileSizeValidatorProps {
  fileSize: number;
  tier: "STARTER" | "HERO" | "LEGEND";
  limit: number;
}

export function FileSizeValidator({
  fileSize,
  tier,
  limit,
}: FileSizeValidatorProps) {
  const percentage = Math.min(100, (fileSize / limit) * 100);
  const remaining = Math.max(0, limit - fileSize);

  const formatSize = (bytes: number) => {
    return `${(bytes / 1024).toFixed(1)}KB`;
  };

  const getStatus = () => {
    if (fileSize > limit) {
      return {
        variant: "destructive" as const,
        icon: AlertCircle,
        title: "File too large",
        color: "text-red-600 dark:text-red-400",
      };
    } else if (percentage >= 80) {
      return {
        variant: "default" as const,
        icon: FileWarning,
        title: "Approaching limit",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    } else {
      return {
        variant: "default" as const,
        icon: CheckCircle,
        title: "Size OK",
        color: "text-green-600 dark:text-green-400",
      };
    }
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <Alert variant={status.variant}>
      <Icon className={`h-4 w-4 ${status.color}`} />
      <AlertTitle className="flex items-center gap-2">
        {status.title}
        <Badge variant="outline" className="ml-auto">
          {tier}
        </Badge>
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Current: <strong>{formatSize(fileSize)}</strong>
          </span>
          <span>
            Limit: <strong>{formatSize(limit)}</strong>
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        {fileSize <= limit ? (
          <p className="text-xs">
            {formatSize(remaining)} remaining ({Math.round(100 - percentage)}%
            available)
          </p>
        ) : (
          <p className="text-xs font-semibold">
            Exceeds limit by {formatSize(fileSize - limit)}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
