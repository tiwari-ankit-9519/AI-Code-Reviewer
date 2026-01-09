// app/dashboard/admin/users/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TierBadge from "@/components/admin/TierBadge";
import StatusBadge from "@/components/admin/StatusBadge";
import UserDetailActions from "@/components/admin/UserDetailActions";
import {
  ArrowLeft,
  User,
  CreditCard,
  BarChart3,
  History,
  Zap,
  FileCode,
  Calendar,
  Mail,
  Hash,
  Clock,
} from "lucide-react";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      subscriptionHistory: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          language: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const submissionStats = await prisma.codeSubmission.groupBy({
    by: ["language"],
    where: { userId: id },
    _count: { id: true },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/admin/users">
          <Button variant="ghost" className="gap-2 -ml-2 mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </Link>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
          <User className="h-8 w-8" />
          User Details
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <User className="h-4 w-4" />
                    Name
                  </label>
                  <p className="font-semibold text-lg">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <p className="font-semibold text-lg">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <Hash className="h-4 w-4" />
                    User ID
                  </label>
                  <p className="font-mono text-sm text-muted-foreground">
                    {user.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4" />
                    Joined
                  </label>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      dateStyle: "long",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Current Tier
                  </label>
                  <TierBadge tier={user.subscriptionTier} />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Status
                  </label>
                  <StatusBadge status={user.subscriptionStatus} />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Start Date
                  </label>
                  <p className="font-medium">
                    {user.subscriptionStartDate
                      ? new Date(user.subscriptionStartDate).toLocaleDateString(
                          "en-IN",
                          { dateStyle: "medium" }
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    End Date
                  </label>
                  <p className="font-medium">
                    {user.subscriptionEndDate
                      ? new Date(user.subscriptionEndDate).toLocaleDateString(
                          "en-IN",
                          { dateStyle: "medium" }
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Stripe Customer ID
                  </label>
                  <p className="font-mono text-sm text-muted-foreground">
                    {user.stripeCustomerId || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Trial Status
                  </label>
                  {user.subscriptionStatus === "TRIALING" &&
                  user.trialEndsAt ? (
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                      Ends{" "}
                      {formatDistanceToNow(new Date(user.trialEndsAt), {
                        addSuffix: true,
                      })}
                    </p>
                  ) : user.isTrialUsed ? (
                    <p className="text-muted-foreground">Trial used</p>
                  ) : (
                    <p className="text-muted-foreground">No trial</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Monthly Submissions
                    </label>
                    <p className="text-3xl font-bold">
                      {user.monthlySubmissionCount}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      of {user.subscriptionTier === "STARTER" ? "5" : "∞"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Total Submissions
                    </label>
                    <p className="text-3xl font-bold">
                      {user.submissions.length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      all time
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <label className="text-sm font-medium text-muted-foreground block mb-2 items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last Reset
                    </label>
                    <p className="text-sm font-medium mt-2">
                      {formatDistanceToNow(new Date(user.lastSubmissionReset), {
                        addSuffix: true,
                      })}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {submissionStats.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Submissions by Language
                    </label>
                    <div className="flex gap-2 flex-wrap mt-3">
                      {submissionStats.map((stat) => (
                        <Badge key={stat.language} variant="secondary">
                          {stat.language}
                          <span className="ml-2 font-bold">
                            {stat._count.id}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Subscription History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Subscription History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.subscriptionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No subscription history
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {user.subscriptionHistory.map((history) => (
                    <Card key={history.id} className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">
                              {history.action.replace(/_/g, " ")}
                            </p>
                            {history.fromTier && history.toTier && (
                              <p className="text-sm text-muted-foreground">
                                {history.fromTier} → {history.toTier}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(history.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        {history.reason && (
                          <p className="text-sm text-muted-foreground">
                            Reason: {history.reason}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-yellow-500/50 sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserDetailActions user={user} />
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Recent Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.submissions.length === 0 ? (
                <div className="text-center py-4">
                  <FileCode className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No submissions yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {user.submissions.map((submission) => (
                    <Card key={submission.id} className="bg-muted/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">
                            {submission.language}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(submission.createdAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
