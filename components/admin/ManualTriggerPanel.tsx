"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Clock,
  Mail,
  RotateCcw,
  CreditCard,
  BarChart3,
  Send,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  triggerExpireTrials,
  triggerTrialReminders,
  triggerResetSubmissions,
  triggerSyncStripe,
  triggerGenerateSnapshot,
  triggerEmailAdminReport,
} from "@/lib/actions/admin-cron";

interface CronActionResult {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

interface TriggerButton {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => Promise<CronActionResult>;
  variant: "destructive" | "outline" | "default" | "secondary";
}

export default function ManualTriggerPanel() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleTrigger = async (button: TriggerButton) => {
    setLoading(button.id);
    try {
      const result = await button.action();

      if (result.success) {
        // Format result for display
        const resultData = Object.entries(result)
          .filter(([key]) => key !== "success")
          .map(([key, value]) => {
            const formattedKey = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())
              .trim();
            return `${formattedKey}: ${value}`;
          })
          .join("\n");

        toast.success(`${button.label} completed!`, {
          description: resultData || "Operation completed successfully",
        });
      } else {
        toast.error(`${button.label} failed`, {
          description: result.error || "Unknown error",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setLoading(null);
    }
  };

  const buttons: TriggerButton[] = [
    {
      id: "expire-trials",
      label: "Expire Trials",
      description: "Downgrade expired trial users to Starter",
      icon: Clock,
      action: triggerExpireTrials,
      variant: "destructive",
    },
    {
      id: "trial-reminders",
      label: "Send Trial Reminders",
      description: "Email users with trials ending in 24h",
      icon: Mail,
      action: triggerTrialReminders,
      variant: "outline",
    },
    {
      id: "reset-submissions",
      label: "Reset Submissions",
      description: "Reset all users' monthly submission counts",
      icon: RotateCcw,
      action: triggerResetSubmissions,
      variant: "secondary",
    },
    {
      id: "sync-stripe",
      label: "Sync Stripe",
      description: "Sync subscription status with Stripe",
      icon: CreditCard,
      action: triggerSyncStripe,
      variant: "secondary",
    },
    {
      id: "generate-snapshot",
      label: "Generate Snapshot",
      description: "Create analytics snapshot for last month",
      icon: BarChart3,
      action: triggerGenerateSnapshot,
      variant: "default",
    },
    {
      id: "email-report",
      label: "Email Report",
      description: "Generate and email monthly report",
      icon: Send,
      action: triggerEmailAdminReport,
      variant: "default",
    },
  ];

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <BarChart3 className="h-6 w-6" />
          Manual Triggers
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manually execute cron jobs for testing or emergency situations
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buttons.map((button) => {
            const Icon = button.icon;
            const isLoading = loading === button.id;
            const isDisabled = loading !== null;

            return (
              <Card
                key={button.id}
                className={`${
                  isLoading ? "border-primary" : ""
                } transition-colors`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {button.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {button.description}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleTrigger(button)}
                      disabled={isDisabled}
                      variant={button.variant}
                      className="w-full"
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isLoading ? "Running..." : "Trigger"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Notes</AlertTitle>
          <AlertDescription>
            <ul className="text-sm space-y-1 mt-2">
              <li>• All manual triggers are logged to the database</li>
              <li>• Triggering will execute the job immediately</li>
              <li>• Check the job status cards above for results</li>
              <li>• Avoid triggering multiple jobs simultaneously</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
