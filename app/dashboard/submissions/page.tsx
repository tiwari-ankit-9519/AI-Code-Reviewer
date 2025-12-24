import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SubmissionsPage() {
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
  });

  const totalSubmissions = submissions.length;
  const isStarter = user.subscriptionTier === "STARTER";

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

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors font-mono text-sm mb-4"
          >
            <span className="mr-2">←</span> BACK TO DASHBOARD
          </Link>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 via-pink-500 to-purple-500 uppercase font-mono mb-2">
            📝 QUEST HISTORY
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="text-sm text-gray-400 font-mono">
              Viewing:{" "}
              <span className="text-white font-black">{totalSubmissions}</span>{" "}
              submissions
            </span>
            {isStarter && (
              <span className="text-sm bg-yellow-500/20 border-2 border-yellow-400 text-yellow-400 px-3 py-1 rounded-lg font-black font-mono">
                {user.monthlySubmissionCount}/5 used this month
              </span>
            )}
          </div>
        </div>

        {submissions.length === 0 && isStarter ? (
          <div className="bg-linear-to-br from-gray-800/50 to-purple-900/50 rounded-2xl border-4 border-purple-500/30 p-12 text-center shadow-2xl">
            <div className="mb-6">
              <svg
                className="w-24 h-24 text-purple-400 mx-auto mb-4"
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
              <h3 className="text-3xl font-black text-white mb-4 uppercase font-mono">
                NO QUESTS YET
              </h3>
              <p className="text-gray-400 mb-2 text-lg font-mono">
                You have{" "}
                <span className="text-yellow-400 font-black">
                  {5 - user.monthlySubmissionCount}
                </span>{" "}
                free submissions remaining
              </p>
              <p className="text-gray-500 text-sm font-mono">
                Start your coding adventure now!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/new">
                <button className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-black hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-blue-500/50 uppercase font-mono">
                  ⚔️ START FIRST QUEST
                </button>
              </Link>
              <Link href="/pricing">
                <button className="bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg hover:shadow-yellow-500/50 uppercase font-mono border-4 border-yellow-600">
                  ⚡ GET UNLIMITED
                </button>
              </Link>
            </div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-linear-to-br from-gray-800/50 to-purple-900/50 rounded-2xl border-4 border-purple-500/30 p-12 text-center shadow-2xl">
            <svg
              className="w-24 h-24 text-purple-400 mx-auto mb-4"
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
            <h3 className="text-3xl font-black text-white mb-4 uppercase font-mono">
              NO QUESTS YET
            </h3>
            <p className="text-gray-400 mb-6 text-lg font-mono">
              Start your coding adventure now!
            </p>
            <Link href="/dashboard/new">
              <button className="bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg hover:shadow-yellow-500/50 uppercase font-mono border-4 border-yellow-600">
                ⚔️ START QUEST
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {submissions.map((submission) => (
              <Link
                key={submission.id}
                href={`/dashboard/submissions/${submission.id}`}
                className="bg-linear-to-br from-gray-800/50 to-purple-900/30 rounded-xl border-2 border-purple-500/30 p-6 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black text-white font-mono group-hover:text-yellow-400 transition-colors">
                        {submission.fileName || "Untitled"}
                      </h3>
                      <span className="px-3 py-1 bg-purple-500/20 border-2 border-purple-400 text-purple-300 text-xs font-black rounded-lg uppercase font-mono">
                        {submission.language}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 font-mono">
                      <span>
                        📅{" "}
                        {new Date(submission.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                      <span>•</span>
                      <span>📏 {submission.linesOfCode} lines</span>
                      <span>•</span>
                      <span>
                        💾 {(submission.fileSize / 1024).toFixed(1)}KB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {submission.analysis ? (
                      <div className="text-center">
                        <div
                          className={`text-4xl font-black ${getScoreColor(
                            submission.analysis.overallScore
                          )} font-mono mb-2`}
                          style={{
                            textShadow: "0 0 10px rgba(255,255,255,0.3)",
                          }}
                        >
                          {submission.analysis.overallScore}%
                        </div>
                        <div className="flex gap-2">
                          <div
                            className={`px-2 py-1 ${getScoreBg(
                              submission.analysis.securityScore
                            )} rounded text-xs font-black font-mono border-2`}
                          >
                            🔒 {submission.analysis.securityScore}
                          </div>
                          <div
                            className={`px-2 py-1 ${getScoreBg(
                              submission.analysis.performanceScore
                            )} rounded text-xs font-black font-mono border-2`}
                          >
                            ⚡ {submission.analysis.performanceScore}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="px-6 py-3 bg-yellow-500/20 border-2 border-yellow-400 text-yellow-300 text-sm font-black rounded-lg font-mono uppercase animate-pulse">
                        ⚡ ANALYZING
                      </div>
                    )}

                    <svg
                      className="w-8 h-8 text-purple-400 group-hover:text-yellow-400 transition-colors"
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
