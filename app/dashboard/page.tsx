import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50";
    if (score >= 60) return "bg-blue-50";
    if (score >= 40) return "bg-yellow-50";
    return "bg-red-50";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#15192c]">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-[#6c7681] mt-2">
          Here&apos;s your code review summary
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-[#ececec] p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b2b5be] text-sm font-medium">
                Total Submissions
              </p>
              <p className="text-3xl font-bold text-[#15192c] mt-2">
                {totalSubmissions}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
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

        <div className="bg-white rounded-lg border border-[#ececec] p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b2b5be] text-sm font-medium">
                Average Score
              </p>
              <p
                className={`text-3xl font-bold mt-2 ${getScoreColor(avgScore)}`}
              >
                {avgScore}%
              </p>
            </div>
            <div
              className={`w-12 h-12 ${getScoreBg(
                avgScore
              )} rounded-lg flex items-center justify-center`}
            >
              <svg
                className={`w-6 h-6 ${getScoreColor(avgScore)}`}
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

        <div className="bg-white rounded-lg border border-[#ececec] p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#b2b5be] text-sm font-medium">Quick Action</p>
              <p className="text-sm text-[#15192c] mt-2 font-medium">
                Start a new review
              </p>
            </div>
            <Link
              href="/dashboard/new"
              className="w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center hover:shadow-lg transition"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#ececec] shadow-sm">
        <div className="px-6 py-4 border-b border-[#ececec]">
          <h2 className="text-lg font-semibold text-[#15192c]">
            Recent Reviews
          </h2>
        </div>

        {submissions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg
              className="w-12 h-12 text-[#b2b5be] mx-auto mb-4"
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
            <p className="text-[#6c7681] font-medium">No submissions yet</p>
            <p className="text-[#b2b5be] text-sm mt-1">
              Start your first code review now
            </p>
            <Link
              href="/dashboard/new"
              className="inline-block mt-4 px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
            >
              New Review
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#ececec]">
            {submissions.map((submission) => (
              <Link
                key={submission.id}
                href={`/dashboard/submissions/${submission.id}`}
                className="px-6 py-4 hover:bg-[#f9f9fa] transition flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="font-medium text-[#15192c]">
                    {submission.fileName || "Untitled.js"}
                  </p>
                  <p className="text-sm text-[#b2b5be] mt-1">
                    {submission.language} •{" "}
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {submission.analysis ? (
                      <p
                        className={`text-lg font-bold ${getScoreColor(
                          submission.analysis.overallScore
                        )}`}
                      >
                        {submission.analysis.overallScore}%
                      </p>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                        Analyzing
                      </span>
                    )}
                  </div>
                  <svg
                    className="w-5 h-5 text-[#b2b5be]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
