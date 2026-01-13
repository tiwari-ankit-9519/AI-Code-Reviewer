"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SubscriptionTier } from "@prisma/client";
import { updateTierConfig } from "@/lib/actions/admin-tier-config";
import { toast } from "sonner";
import { Shield, Zap, Crown, Save, Loader2, Lock, Edit } from "lucide-react";

interface TierConfigCardProps {
  tier: SubscriptionTier;
  config: {
    id: string;
    tier: SubscriptionTier;
    reviewsPerSession: number;
    coolingPeriodHours: number;
    monthlyReviewLimit: number | null;
    isActive: boolean;
    modifiedBy: string | null;
    lastModified: Date;
  } | null;
  adminId: string;
}

export default function TierConfigCard({
  tier,
  config,
  adminId,
}: TierConfigCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    reviewsPerSession: config?.reviewsPerSession || 10,
    coolingPeriodHours: config?.coolingPeriodHours || 0,
    monthlyReviewLimit: config?.monthlyReviewLimit,
  });

  const tierConfig = {
    STARTER: {
      icon: Shield,
      bgColor: "bg-gray-100 dark:bg-gray-900",
      borderColor: "border-gray-200 dark:border-gray-800",
      textColor: "text-gray-900 dark:text-gray-100",
      badgeVariant: "secondary" as const,
      disabled: true,
      label: "FREE TIER",
    },
    HERO: {
      icon: Zap,
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      textColor: "text-purple-900 dark:text-purple-100",
      badgeVariant: "default" as const,
      disabled: false,
      label: "PREMIUM TIER",
    },
    LEGEND: {
      icon: Crown,
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      textColor: "text-orange-900 dark:text-orange-100",
      badgeVariant: "default" as const,
      disabled: false,
      label: "ENTERPRISE TIER",
    },
  };

  const currentConfig = tierConfig[tier];
  const Icon = currentConfig.icon;
  const isDisabled = currentConfig.disabled;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateTierConfig(tier, formData, adminId);
      toast.success("Configuration updated successfully", {
        description: `${tier} tier limits have been updated`,
      });
      setIsEditing(false);
      setShowConfirm(false);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update configuration", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (isDisabled) {
      toast.error("STARTER tier cannot be modified", {
        description: "This tier has fixed limits",
      });
      return;
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      reviewsPerSession: config?.reviewsPerSession || 10,
      coolingPeriodHours: config?.coolingPeriodHours || 0,
      monthlyReviewLimit: config?.monthlyReviewLimit,
    });
    setIsEditing(false);
  };

  return (
    <>
      <Card
        className={`${currentConfig.bgColor} ${currentConfig.borderColor} border-2 transition-all duration-300 hover:shadow-lg`}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentConfig.bgColor}`}>
                <Icon className={`h-6 w-6 ${currentConfig.textColor}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{tier}</h3>
                <p className="text-xs text-muted-foreground font-normal">
                  {currentConfig.label}
                </p>
              </div>
            </div>
            {isDisabled && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                LOCKED
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Reviews Per Session
              </Label>
              {isEditing && !isDisabled ? (
                <Input
                  type="number"
                  value={formData.reviewsPerSession}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reviewsPerSession: parseInt(e.target.value),
                    })
                  }
                  min={1}
                  max={1000}
                />
              ) : (
                <div className="text-3xl font-bold">
                  {config?.reviewsPerSession || "N/A"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Cooling Period (Hours)
              </Label>
              {isEditing && !isDisabled ? (
                <Input
                  type="number"
                  value={formData.coolingPeriodHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coolingPeriodHours: parseInt(e.target.value),
                    })
                  }
                  min={0}
                  max={168}
                />
              ) : (
                <div className="text-3xl font-bold">
                  {config?.coolingPeriodHours || 0}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Monthly Limit
              </Label>
              {isEditing && !isDisabled ? (
                <Input
                  type="number"
                  value={formData.monthlyReviewLimit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyReviewLimit: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Unlimited (leave empty)"
                  min={1}
                />
              ) : (
                <div className="text-3xl font-bold">
                  {config?.monthlyReviewLimit || "∞"}
                </div>
              )}
            </div>
          </div>

          {config?.lastModified && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                Last modified: {new Date(config.lastModified).toLocaleString()}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {isEditing ? (
              <>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEdit}
                disabled={isDisabled}
                variant="outline"
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Config
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to update the {tier} tier configuration. This will
              affect all users on this tier immediately.
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-semibold">
                  Reviews per session: {formData.reviewsPerSession}
                </p>
                <p className="text-sm font-semibold">
                  Cooling period: {formData.coolingPeriodHours}h
                </p>
                <p className="text-sm font-semibold">
                  Monthly limit: {formData.monthlyReviewLimit || "Unlimited"}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
