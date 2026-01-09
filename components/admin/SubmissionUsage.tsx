import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Zap, Crown, Award } from "lucide-react";

interface SubmissionMetrics {
  total: number;
  byTier: {
    starter: number;
    hero: number;
    legend: number;
  };
  avgPerUser: number;
}

interface SubmissionUsageProps {
  metrics: SubmissionMetrics;
}

export default function SubmissionUsage({ metrics }: SubmissionUsageProps) {
  const getPercentage = (value: number) => {
    return metrics.total > 0 ? (value / metrics.total) * 100 : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Submission Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Total & Breakdown */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Total Submissions This Month
              </p>
              <p className="text-5xl font-bold tracking-tight">
                {metrics.total.toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              {/* Starter Tier */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Starter Tier</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {metrics.byTier.starter} (
                    {getPercentage(metrics.byTier.starter).toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={getPercentage(metrics.byTier.starter)}
                  className="h-2"
                />
              </div>

              {/* Hero Tier */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Hero Tier
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {metrics.byTier.hero} (
                    {getPercentage(metrics.byTier.hero).toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={getPercentage(metrics.byTier.hero)}
                  className="h-2 [&>div]:bg-primary"
                />
              </div>

              {/* Legend Tier */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      Legend Tier
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                    {metrics.byTier.legend} (
                    {getPercentage(metrics.byTier.legend).toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={getPercentage(metrics.byTier.legend)}
                  className="h-2 [&>div]:bg-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Average Stats */}
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  Average Submissions per User
                </h3>
              </div>

              <div className="mb-6">
                <p className="text-6xl font-bold text-primary mb-2">
                  {metrics.avgPerUser.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  submissions per user this month
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Starter (Limit: 5)
                    </span>
                  </div>
                  <Badge
                    variant={metrics.byTier.starter > 0 ? "default" : "outline"}
                  >
                    {metrics.byTier.starter > 0 ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm text-primary">
                      Hero (Unlimited)
                    </span>
                  </div>
                  <Badge
                    variant={metrics.byTier.hero > 0 ? "default" : "outline"}
                  >
                    {metrics.byTier.hero > 0 ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                      Legend (Unlimited)
                    </span>
                  </div>
                  <Badge
                    variant={metrics.byTier.legend > 0 ? "default" : "outline"}
                  >
                    {metrics.byTier.legend > 0 ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
