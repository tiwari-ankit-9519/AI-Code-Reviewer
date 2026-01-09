import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Play,
  CheckCircle,
  XCircle,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

interface TrialMetrics {
  started: number;
  converted: number;
  expired: number;
  conversionRate: number;
}

interface TrialPerformanceProps {
  metrics: TrialMetrics;
}

export default function TrialPerformance({ metrics }: TrialPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Trial Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Trials Started */}
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Trials Started
                </p>
              </div>
              <p className="text-4xl font-bold mb-2">{metrics.started}</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          {/* Converted to Paid */}
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Converted to Paid
                </p>
              </div>
              <p className="text-4xl font-bold mb-2">{metrics.converted}</p>
              <p className="text-xs text-muted-foreground">
                {metrics.started > 0
                  ? ((metrics.converted / metrics.started) * 100).toFixed(1)
                  : 0}
                % of trials
              </p>
            </CardContent>
          </Card>

          {/* Expired */}
          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Expired
                </p>
              </div>
              <p className="text-4xl font-bold mb-2">{metrics.expired}</p>
              <p className="text-xs text-muted-foreground">
                {metrics.started > 0
                  ? ((metrics.expired / metrics.started) * 100).toFixed(1)
                  : 0}
                % of trials
              </p>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-primary">
                  Conversion Rate
                </p>
              </div>
              <p className="text-4xl font-bold mb-2">
                {metrics.conversionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {metrics.conversionRate >= 20 ? "Above target" : "Below target"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trial Insights */}
        <Alert className="border-blue-500/50 bg-blue-500/5">
          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-600 dark:text-blue-400">
            Trial Insights
          </AlertTitle>
          <AlertDescription className="text-sm">
            {metrics.conversionRate >= 20
              ? "Great conversion rate! Your trial experience is working well."
              : "Consider improving onboarding to increase trial conversions."}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
