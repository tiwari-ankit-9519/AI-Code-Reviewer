// FILE PATH: components/admin/ManualTriggerPanel.tsx
// This component shows the 6 MANUAL TRIGGER BUTTONS
// Used by: app/dashboard/admin/jobs/page.tsx (shown at bottom of main page)

"use client";

import { useState } from "react";
import { toast } from "sonner";
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
  icon: string;
  action: () => Promise<CronActionResult>;
  variant: "danger" | "warning" | "success" | "info";
}

export default function ManualTriggerPanel() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleTrigger = async (button: TriggerButton) => {
    setLoading(button.id);
    try {
      const result = await button.action();

      if (result.success) {
        toast.success(`${button.label} completed!`, {
          description: JSON.stringify(result, null, 2),
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
      icon: "⏰",
      action: triggerExpireTrials,
      variant: "danger",
    },
    {
      id: "trial-reminders",
      label: "Send Trial Reminders",
      description: "Email users with trials ending in 24h",
      icon: "📧",
      action: triggerTrialReminders,
      variant: "warning",
    },
    {
      id: "reset-submissions",
      label: "Reset Submissions",
      description: "Reset all users' monthly submission counts",
      icon: "🔄",
      action: triggerResetSubmissions,
      variant: "info",
    },
    {
      id: "sync-stripe",
      label: "Sync Stripe",
      description: "Sync subscription status with Stripe",
      icon: "💳",
      action: triggerSyncStripe,
      variant: "info",
    },
    {
      id: "generate-snapshot",
      label: "Generate Snapshot",
      description: "Create analytics snapshot for last month",
      icon: "📊",
      action: triggerGenerateSnapshot,
      variant: "success",
    },
    {
      id: "email-report",
      label: "Email Report",
      description: "Generate and email monthly report",
      icon: "📨",
      action: triggerEmailAdminReport,
      variant: "success",
    },
  ];

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case "danger":
        return "bg-red-500/20 border-red-500 hover:bg-red-500/30 text-red-400";
      case "warning":
        return "bg-yellow-500/20 border-yellow-500 hover:bg-yellow-500/30 text-yellow-400";
      case "success":
        return "bg-green-500/20 border-green-500 hover:bg-green-500/30 text-green-400";
      case "info":
        return "bg-blue-500/20 border-blue-500 hover:bg-blue-500/30 text-blue-400";
      default:
        return "bg-gray-500/20 border-gray-500 hover:bg-gray-500/30 text-gray-400";
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-yellow-500/30 rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500 mb-2">
          🎮 MANUAL TRIGGERS
        </h2>
        <p className="text-gray-400 text-sm">
          Manually execute cron jobs for testing or emergency situations
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buttons.map((button) => (
          <button
            key={button.id}
            onClick={() => handleTrigger(button)}
            disabled={loading !== null}
            className={`
              relative overflow-hidden
              border-2 rounded-xl p-6
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${getVariantStyles(button.variant)}
              ${loading === button.id ? "animate-pulse" : ""}
            `}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{button.icon}</div>
              <h3 className="font-black text-lg mb-2">{button.label}</h3>
              <p className="text-xs opacity-80 mb-4">{button.description}</p>
              <div className="text-sm font-mono font-bold">
                {loading === button.id ? "RUNNING..." : "TRIGGER"}
              </div>
            </div>

            {loading === button.id && (
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 bg-gray-900/50 border border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-bold text-yellow-400 mb-2">
          ⚠️ Important Notes
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• All manual triggers are logged to the database</li>
          <li>• Triggering will execute the job immediately</li>
          <li>• Check the job status cards above for results</li>
          <li>• Avoid triggering multiple jobs simultaneously</li>
        </ul>
      </div>
    </div>
  );
}
