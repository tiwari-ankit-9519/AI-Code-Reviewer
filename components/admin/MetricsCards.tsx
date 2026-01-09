"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  Users,
  Target,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";

interface Metrics {
  mrr: number;
  arr: number;
  arpu: number;
  ltv: number;
  churnRate: number;
  trialConversion: number;
  revenueGrowth: number;
  userGrowth: number;
}

interface MetricsCardsProps {
  metrics: Metrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-600 dark:text-green-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const renderTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4" />;
    if (value < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* MRR Card */}
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <IndianRupee className="h-6 w-6 text-primary" />
            </div>
            <Badge
              variant="outline"
              className={`gap-1 ${getTrendColor(metrics.revenueGrowth)}`}
            >
              {renderTrendIcon(metrics.revenueGrowth)}
              {Math.abs(metrics.revenueGrowth).toFixed(1)}%
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Monthly Recurring Revenue
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {formatCurrency(metrics.mrr)}
            </p>
            <p className="text-xs text-muted-foreground">
              ARR: {formatCurrency(metrics.arr)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ARPU Card */}
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge
              variant="outline"
              className={`gap-1 ${getTrendColor(metrics.userGrowth)}`}
            >
              {renderTrendIcon(metrics.userGrowth)}
              {Math.abs(metrics.userGrowth).toFixed(1)}%
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Average Revenue Per User
            </p>
            <p className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {formatCurrency(metrics.arpu)}
            </p>
            <p className="text-xs text-muted-foreground">Per month</p>
          </div>
        </CardContent>
      </Card>

      {/* Trial Conversion Card */}
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <Badge variant="outline" className="text-muted-foreground">
              LTV
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Trial Conversion Rate
            </p>
            <p className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">
              {metrics.trialConversion.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              Lifetime Value: {formatCurrency(metrics.ltv)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Churn Rate Card */}
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <TrendingDown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <Badge
              variant={metrics.churnRate < 5 ? "default" : "destructive"}
              className="gap-1"
            >
              {metrics.churnRate < 5 ? "Good" : "High"}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Churn Rate</p>
            <p className="text-3xl font-bold tracking-tight text-yellow-600 dark:text-yellow-400">
              {metrics.churnRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Monthly churn</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
