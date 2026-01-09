// components/admin/StatCard.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  IndianRupee,
  Users,
  Target,
  TrendingDown as ChurnIcon,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: "revenue" | "users" | "target" | "churn";
  trend: number;
  trendLabel?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
}: StatCardProps) {
  const getTrendColor = () => {
    if (trend > 0) return "text-green-600 dark:text-green-400";
    if (trend < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const renderTrendIcon = () => {
    const iconClass = "h-3 w-3";
    if (trend > 0) return <TrendingUp className={iconClass} />;
    if (trend < 0) return <TrendingDown className={iconClass} />;
    return <Minus className={iconClass} />;
  };

  const renderIcon = () => {
    const iconClass = "h-6 w-6 text-primary";
    switch (icon) {
      case "revenue":
        return <IndianRupee className={iconClass} />;
      case "users":
        return <Users className={iconClass} />;
      case "target":
        return <Target className={iconClass} />;
      case "churn":
        return <ChurnIcon className={iconClass} />;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-primary/10">{renderIcon()}</div>
          <Badge variant="outline" className={`gap-1 ${getTrendColor()}`}>
            {renderTrendIcon()}
            {trendLabel || `${Math.abs(trend).toFixed(1)}%`}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
