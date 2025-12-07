import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

type LanguageGroup = {
  language: string;
  _count: number;
};

type AnalysisSummary = {
  overallScore: number;
  securityScore?: number;
  performanceScore?: number;
  qualityScore?: number;
} | null;

type SubmissionItem = {
  id: string;
  fileName: string | null;
  language: string;
  linesOfCode: number;
  fileSize: number;
  status: string;
  createdAt: Date;
  analysis: AnalysisSummary;
};

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; language?: string; search?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const page = Number(params.page || 1);
  const language = params.language;
  const search = params.search;
  const perPage = 10;

  const where: {
    userId: string;
    language?: string;
    OR?: Array<{
      fileName?: { contains: string; mode: "insensitive" };
      code?: { contains: string; mode: "insensitive" };
    }>;
  } = { userId: session.user.id };

  if (language) {
    where.language = language;
  }

  if (search) {
    where.OR = [
      { fileName: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }

  const [submissionsRaw, total] = await Promise.all([
    prisma.codeSubmission.findMany({
      where,
      include: {
        analysis: {
          select: {
            overallScore: true,
            securityScore: true,
            performanceScore: true,
            qualityScore: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.codeSubmission.count({ where }),
  ]);

  type SubmissionRaw = (typeof submissionsRaw)[number];

  const submissions: SubmissionItem[] = submissionsRaw.map(
    (s: SubmissionRaw) => ({
      id: s.id,
      fileName: s.fileName,
      language: s.language,
      linesOfCode: s.linesOfCode ?? 0,
      fileSize: s.fileSize ?? 0,
      status: s.status,
      createdAt: s.createdAt,
      analysis: s.analysis
        ? {
            overallScore: s.analysis.overallScore,
            securityScore: s.analysis.securityScore,
            performanceScore: s.analysis.performanceScore,
            qualityScore: s.analysis.qualityScore,
          }
        : null,
    })
  );

  const totalPages = Math.ceil(total / perPage);

  const languagesRaw = await prisma.codeSubmission.groupBy({
    by: ["language"],
    where: { userId: session.user.id },
    _count: { language: true },
  });

  type LanguageRaw = (typeof languagesRaw)[number];

  const languages: LanguageGroup[] = languagesRaw.map((item: LanguageRaw) => ({
    language: item.language,
    _count: item._count.language,
  }));

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-gray-500/20 text-gray-300 border-gray-400/50",
      analyzing: "bg-blue-500/20 text-blue-300 border-blue-400/50",
      completed: "bg-green-500/20 text-green-300 border-green-400/50",
      failed: "bg-red-500/20 text-red-300 border-red-400/50",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-4xl md:text-5xl font-black text-white font-mono uppercase"
            style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
          >
            📜 Battle History
          </h1>
          <p className="text-gray-400 mt-2 font-mono text-lg">
            {total} quest{total !== 1 ? "s" : ""} completed
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="px-6 py-3 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase border-4 border-yellow-600"
        >
          ⚔️ New Quest
        </Link>
      </div>

      <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 p-6 shadow-2xl">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-black text-gray-300 mb-2 font-mono uppercase">
              🔍 Search
            </label>
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search by filename or code..."
              className="w-full px-4 py-3 bg-[#0a0e27] border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-gray-300 mb-2 font-mono uppercase">
              💻 Language
            </label>
            <select
              name="language"
              defaultValue={language || ""}
              className="w-full px-4 py-3 bg-[#0a0e27] border-2 border-purple-500/30 rounded-xl text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition font-mono"
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang.language} value={lang.language}>
                  {lang.language.charAt(0).toUpperCase() +
                    lang.language.slice(1)}{" "}
                  ({lang._count})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 px-5 py-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-black hover:from-blue-400 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/50 hover:-translate-y-1 font-mono uppercase border-4 border-blue-600"
            >
              Filter
            </button>
            <Link
              href="/dashboard/submissions"
              className="px-5 py-3 bg-gray-700 text-white rounded-xl font-black hover:bg-gray-600 transition-all border-4 border-gray-800 font-mono uppercase"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 p-12 text-center shadow-2xl">
          <svg
            className="w-20 h-20 text-purple-400 mx-auto mb-6"
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
          <p className="text-gray-300 font-black font-mono text-xl mb-2">
            No Quests Found
          </p>
          <p className="text-gray-500 font-mono mb-6">
            {search || language
              ? "Try adjusting your filters"
              : "Begin your coding adventure"}
          </p>
          <Link
            href="/dashboard/new"
            className="inline-block px-8 py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 hover:-translate-y-1 font-mono uppercase border-4 border-yellow-600"
          >
            ⚔️ Start Quest
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-purple-900/20 to-pink-900/20 border-b-4 border-purple-500/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-300 uppercase tracking-wider font-mono">
                      File
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-300 uppercase tracking-wider font-mono">
                      Language
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-300 uppercase tracking-wider font-mono">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-300 uppercase tracking-wider font-mono">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-300 uppercase tracking-wider font-mono">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-gray-300 uppercase tracking-wider font-mono">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y-2 divide-purple-500/20">
                  {submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="hover:bg-purple-500/10 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 border-2 border-blue-400/50">
                            <svg
                              className="w-5 h-5 text-blue-400"
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
                          <div>
                            <p className="text-sm font-black text-white font-mono">
                              {submission.fileName || "Untitled"}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              {submission.linesOfCode} lines •{" "}
                              {(submission.fileSize / 1024).toFixed(1)}KB
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-blue-500/20 text-blue-300 border-2 border-blue-400/50 font-mono">
                          {submission.language}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black border-2 font-mono ${getStatusBadge(
                            submission.status
                          )}`}
                        >
                          {submission.status.charAt(0).toUpperCase() +
                            submission.status.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.analysis ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-2xl font-black font-mono ${getScoreColor(
                                submission.analysis.overallScore
                              )}`}
                              style={{
                                textShadow: "0 0 10px rgba(255,255,255,0.3)",
                              }}
                            >
                              {submission.analysis.overallScore}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 font-mono">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                        {submission.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link
                          href={`/dashboard/submissions/${submission.id}`}
                          className="text-yellow-400 hover:text-yellow-300 font-black transition font-mono"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 px-6 py-4 shadow-2xl">
              <div className="text-sm text-gray-400 font-mono font-bold">
                Page {page} of {totalPages}
              </div>

              <div className="flex gap-3">
                {page > 1 && (
                  <Link
                    href={`/dashboard/submissions?page=${page - 1}${
                      language ? `&language=${language}` : ""
                    }${search ? `&search=${search}` : ""}`}
                    className="px-5 py-3 bg-gray-700 text-white rounded-xl font-black hover:bg-gray-600 transition-all border-4 border-gray-800 font-mono uppercase"
                  >
                    ← Previous
                  </Link>
                )}

                {page < totalPages && (
                  <Link
                    href={`/dashboard/submissions?page=${page + 1}${
                      language ? `&language=${language}` : ""
                    }${search ? `&search=${search}` : ""}`}
                    className="px-5 py-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-black hover:from-blue-400 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/50 hover:-translate-y-1 font-mono uppercase border-4 border-blue-600"
                  >
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
