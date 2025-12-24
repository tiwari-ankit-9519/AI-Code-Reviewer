import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckSubscriptionStatus } from "@/components/subscription/subscription-status";
import { TrialCountdown } from "@/components/subscription/trial-countdown";

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

  const stats = await Promise.all([
    prisma.codeSubmission.count({
      where: { userId: session.user.id },
    }),
    prisma.analysisResult.aggregate({
      where: {
        submission: {
          userId: session.user.id,
        },
      },
      _avg: {
        overallScore: true,
      },
    }),
  ]);

  const totalSubmissions = stats[0];
  const avgScore = Math.round(stats[1]._avg.overallScore || 0);

  const isStarter = user.subscriptionTier === "STARTER";
  const isInTrial = user.subscriptionStatus === "TRIALING";
  const isAtLimit = isStarter && user.monthlySubmissionCount >= 5;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/20 border-green-400";
    if (score >= 60) return "bg-blue-500/20 border-blue-400";
    if (score >= 40) return "bg-yellow-500/20 border-yellow-400";
    return "bg-red-500/20 border-red-400";
  };

  const getScoreGlow = (score: number) => {
    if (score >= 80) return "shadow-green-500/50";
    if (score >= 60) return "shadow-blue-500/50";
    if (score >= 40) return "shadow-yellow-500/50";
    return "shadow-red-500/50";
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1
            className="text-4xl md:text-5xl font-black text-white font-mono uppercase"
            style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
          >
            Welcome Back, {user.name}!
          </h1>
          <p className="text-gray-400 mt-2 font-mono text-lg">
            Your epic code journey continues
          </p>
        </div>

        {isInTrial && user.trialEndsAt && (
          <TrialCountdown
            trialEndsAt={user.trialEndsAt}
            variant="banner"
            showUpgradeCTA={true}
          />
        )}

        <div className="grid grid-cols-1 gap-6">
          <CheckSubscriptionStatus user={user} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-linear-to-br from-blue-900/50 to-blue-950/50 rounded-2xl border-4 border-blue-500 p-6 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-blue-300 text-sm font-black font-mono uppercase tracking-wide">
                  Total Quests
                </p>
                <p
                  className="text-5xl font-black text-white mt-2 font-mono"
                  style={{ textShadow: "0 0 10px rgba(59,130,246,0.5)" }}
                >
                  {totalSubmissions}
                </p>
                {isStarter && (
                  <p className="text-xs text-blue-300 mt-2 font-mono font-bold">
                    {user.monthlySubmissionCount}/5 this month
                  </p>
                )}
              </div>
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div
            className={`bg-linear-to-br from-green-900/50 to-green-950/50 rounded-2xl border-4 ${getScoreBg(
              avgScore
            )} p-6 shadow-2xl ${getScoreGlow(
              avgScore
            )} hover:shadow-green-500/50 transition-all hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-black font-mono uppercase tracking-wide">
                  Power Level
                </p>
                <p
                  className={`text-5xl font-black mt-2 font-mono ${getScoreColor(
                    avgScore
                  )}`}
                  style={{ textShadow: "0 0 10px rgba(34,197,94,0.5)" }}
                >
                  {avgScore}%
                </p>
              </div>
              <div
                className={`w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center shadow-lg ${getScoreGlow(
                  avgScore
                )}`}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-purple-900/50 to-purple-950/50 rounded-2xl border-4 border-purple-500 p-6 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-black font-mono uppercase tracking-wide">
                  Quick Action
                </p>
                <p className="text-lg text-white mt-2 font-bold font-mono">
                  {isAtLimit ? "Upgrade" : "New Quest"}
                </p>
              </div>
              {isAtLimit ? (
                <Link
                  href="/pricing"
                  className="w-16 h-16 bg-linear-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center hover:from-yellow-300 hover:to-orange-400 transition-all shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:scale-110 border-4 border-yellow-600"
                >
                  <svg
                    className="w-8 h-8 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/dashboard/new"
                  className="w-16 h-16 bg-linear-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center hover:from-yellow-300 hover:to-orange-400 transition-all shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:scale-110 border-4 border-yellow-600"
                >
                  <svg
                    className="w-8 h-8 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>

        {isAtLimit && (
          <div className="bg-linear-to-br from-red-900/30 to-orange-900/30 rounded-2xl border-4 border-red-500 p-6 shadow-2xl shadow-red-500/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-lg animate-pulse">
                🚫
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-red-300 font-mono uppercase mb-2">
                  Monthly Limit Reached
                </h3>
                <p className="text-red-200 font-mono text-sm mb-4">
                  You&apos;ve used all 5 submissions this month. Upgrade to Hero
                  for unlimited code reviews and advanced features!
                </p>
                <Link
                  href="/pricing"
                  className="inline-block px-6 py-3 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase text-sm border-4 border-yellow-600"
                >
                  ⚡ Upgrade to Hero - ₹2999/month
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/30 shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b-4 border-purple-500/30 bg-linear-to-r from-purple-900/20 to-pink-900/20">
            <h2
              className="text-2xl font-black text-white font-mono uppercase"
              style={{ textShadow: "0 0 10px rgba(168,85,247,0.3)" }}
            >
              Recent Battle Log
            </h2>
          </div>

          {submissions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <svg
                className="w-16 h-16 text-purple-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-300 font-black font-mono text-lg">
                No Quests Yet
              </p>
              <p className="text-gray-500 text-sm mt-1 font-mono">
                Begin your first code adventure now
              </p>
              {!isAtLimit && (
                <Link
                  href="/dashboard/new"
                  className="inline-block mt-6 px-8 py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase text-lg border-4 border-yellow-600"
                >
                  Start Quest
                </Link>
              )}
              {isAtLimit && (
                <Link
                  href="/pricing"
                  className="inline-block mt-6 px-8 py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase text-lg border-4 border-yellow-600"
                >
                  Upgrade to Hero
                </Link>
              )}
            </div>
          ) : (
            <div>
              {submissions.map((submission) => (
                <Link
                  key={submission.id}
                  href={`/dashboard/submissions/${submission.id}`}
                  className="px-6 py-5 hover:bg-purple-500/10 transition-all flex items-center justify-between border-b-2 border-purple-500/20 last:border-b-0 group"
                >
                  <div className="flex-1">
                    <p className="font-black text-white font-mono text-lg group-hover:text-yellow-400 transition-colors">
                      {submission.fileName || "Untitled.js"}
                    </p>
                    <p className="text-sm text-gray-400 mt-1 font-mono">
                      <span className="text-purple-400 font-bold">
                        {submission.language}
                      </span>{" "}
                      • {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      {submission.analysis ? (
                        <>
                          <p
                            className={`text-3xl font-black ${getScoreColor(
                              submission.analysis.overallScore
                            )} font-mono`}
                            style={{
                              textShadow: "0 0 10px rgba(255,255,255,0.3)",
                            }}
                          >
                            {submission.analysis.overallScore}%
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded font-mono font-bold border border-blue-400/50">
                              SEC {submission.analysis.securityScore}
                            </span>
                            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded font-mono font-bold border border-purple-400/50">
                              PERF {submission.analysis.performanceScore}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="inline-block px-4 py-2 bg-yellow-500/20 text-yellow-300 text-xs font-black rounded-lg font-mono uppercase border-2 border-yellow-400 shadow-lg shadow-yellow-500/20 animate-pulse">
                          ⚡ Analyzing
                        </span>
                      )}
                    </div>
                    <svg
                      className="w-6 h-6 text-purple-400 group-hover:text-yellow-400 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-linear-to-br from-cyan-900/30 to-cyan-950/30 rounded-2xl border-4 border-cyan-500/50 p-6 shadow-xl">
            <h3 className="text-xl font-black text-cyan-300 font-mono uppercase mb-4">
              🏆 Achievements
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-xl">🥇</span>
                </div>
                <div>
                  <p className="text-white font-bold font-mono">
                    First Victory
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    Complete your first quest
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <p className="text-white font-bold font-mono">Speed Runner</p>
                  <p className="text-xs text-gray-400 font-mono">
                    10 quests in one day
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-pink-900/30 to-pink-950/30 rounded-2xl border-4 border-pink-500/50 p-6 shadow-xl">
            <h3 className="text-xl font-black text-pink-300 font-mono uppercase mb-4">
              📊 Weekly Stats
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400 font-mono">
                    Quests Completed
                  </span>
                  <span className="text-white font-black font-mono">
                    {Math.min(totalSubmissions, 10)}/10
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-pink-500 to-purple-500 rounded-full"
                    style={{
                      width: `${Math.min((totalSubmissions / 10) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400 font-mono">Avg Score</span>
                  <span className="text-green-400 font-black font-mono">
                    {avgScore}%
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-green-400 to-emerald-500 rounded-full"
                    style={{ width: `${avgScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
