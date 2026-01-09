// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  CreditCard,
  FileCode,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
  ArrowUpRight,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      monthlySubmissionCount: true,
      trialEndsAt: true,
    },
  });

  if (!user) {
    return null;
  }

  const submissions = await prisma.codeSubmission.findMany({
    where: { userId: session.user.id },
    include: {
      analysis: {
        select: {
          overallScore: true,
          securityScore: true,
          performanceScore: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalSubmissions = await prisma.codeSubmission.count({
    where: { userId: session.user.id },
  });

  const avgScoreResult = await prisma.analysisResult.aggregate({
    where: {
      submission: {
        userId: session.user.id,
      },
    },
    _avg: {
      overallScore: true,
    },
  });

  const avgScore = Math.round(avgScoreResult._avg?.overallScore ?? 0);

  const isStarter = user.subscriptionTier === "STARTER";
  const isAtLimit = isStarter && user.monthlySubmissionCount >= 5;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10";
    if (score >= 60) return "bg-blue-500/10";
    if (score >= 40) return "bg-amber-500/10";
    return "bg-red-500/10";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          Welcome back, {user.name}
        </h1>
        <p className="text-muted-foreground text-lg">
          Here&apos;s what&apos;s happening with your code reviews
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Reviews Card */}
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Reviews
              </h3>
              <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {user.subscriptionTier === "STARTER"
                ? `${user.monthlySubmissionCount}/5 this month`
                : "Unlimited reviews"}
            </p>
          </CardContent>
        </Card>

        {/* Average Score Card */}
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Average Score
              </h3>
              <div
                className={`p-2 rounded-lg ${getScoreBgColor(
                  avgScore
                )} transition-colors`}
              >
                <TrendingUp className={`h-4 w-4 ${getScoreColor(avgScore)}`} />
              </div>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
              {avgScore}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all reviews
            </p>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Subscription
              </h3>
              <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold">{user.subscriptionTier}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {user.subscriptionStatus}
            </p>
          </CardContent>
        </Card>

        {/* Quick Action Card */}
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group bg-linear-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Quick Action
              </h3>
            </div>
            <Link href={isAtLimit ? "/pricing" : "/dashboard/submissions/new"}>
              <Button className="w-full mt-2 group/btn" size="lg">
                {isAtLimit ? "Upgrade Plan" : "New Review"}
                <ArrowUpRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Limit Reached Alert */}
      {isAtLimit && (
        <Card className="border-2 border-destructive bg-destructive/5 animate-in slide-in-from-top duration-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                  Monthly Limit Reached
                  <Badge variant="destructive">Action Required</Badge>
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You&apos;ve used all 5 submissions this month. Upgrade to Hero
                  for unlimited code reviews and advanced features.
                </p>
                <Link href="/pricing">
                  <Button size="lg" className="gap-2 group">
                    Upgrade to Hero - ₹2,999/month
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Reviews */}
        <Card className="col-span-4 border-2 hover:border-primary/30 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileCode className="h-6 w-6 text-primary" />
                Recent Reviews
              </CardTitle>
              <Link href="/dashboard/submissions">
                <Button variant="ghost" size="sm" className="gap-2 group">
                  View All
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4 animate-pulse">
                  <FileCode className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-xl mb-2">No reviews yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Start your first code review to see insights here
                </p>
                <Link
                  href={isAtLimit ? "/pricing" : "/dashboard/submissions/new"}
                >
                  <Button size="lg" className="gap-2 group">
                    {isAtLimit ? "Upgrade to Start" : "Start Your First Review"}
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission, index) => (
                  <Link
                    key={submission.id}
                    href={`/dashboard/submissions/${submission.id}`}
                    className="block animate-in slide-in-from-left duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border-2 hover:border-primary/50 hover:bg-accent/50 transition-all duration-300 hover:scale-[1.02] group">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <FileCode className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <p className="font-semibold">
                            {submission.fileName || "Untitled"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {submission.language}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                submission.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {submission.analysis ? (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p
                              className={`text-xl font-bold ${getScoreColor(
                                submission.analysis.overallScore
                              )}`}
                            >
                              {submission.analysis.overallScore}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Score
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="animate-pulse border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                        >
                          Analyzing...
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="col-span-3 border-2 hover:border-primary/30 transition-all duration-300 bg-linear-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4 group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg group-hover:scale-110 transition-transform">
                  1
                </div>
                <div>
                  <p className="font-semibold mb-1 flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-primary" />
                    Upload Your Code
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Paste code or upload files for analysis
                  </p>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg group-hover:scale-110 transition-transform">
                  2
                </div>
                <div>
                  <p className="font-semibold mb-1 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    AI Analysis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get instant security & performance insights
                  </p>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg group-hover:scale-110 transition-transform">
                  3
                </div>
                <div>
                  <p className="font-semibold mb-1 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Improve Your Code
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Apply suggestions and best practices
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
