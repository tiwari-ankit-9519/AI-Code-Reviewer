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
      pending: "bg-gray-100 text-gray-700 border-gray-200",
      analyzing: "bg-blue-100 text-blue-700 border-blue-200",
      completed: "bg-green-100 text-green-700 border-green-200",
      failed: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#15192c]">Review History</h1>
          <p className="text-[#6c7681] mt-2">
            {total} submission{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
        >
          New Review
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-[#ececec] p-4 shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#21242c] mb-2">
              Search
            </label>
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search by filename or code..."
              className="w-full px-4 py-2 border border-[#ececec] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#21242c] mb-2">
              Language
            </label>
            <select
              name="language"
              defaultValue={language || ""}
              className="w-full px-4 py-2 border border-[#ececec] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="flex-1 px-4 py-2 bg-[#007fff] text-white rounded-lg font-medium hover:bg-[#2b89ff] transition"
            >
              Filter
            </button>
            <Link
              href="/dashboard/submissions"
              className="px-4 py-2 border border-[#ececec] rounded-lg font-medium text-[#15192c] hover:bg-[#f9f9fa] transition"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#ececec] p-12 text-center shadow-sm">
          <svg
            className="w-16 h-16 text-[#b2b5be] mx-auto mb-4"
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
          <p className="text-[#6c7681] font-medium mb-2">
            No submissions found
          </p>
          <p className="text-[#b2b5be] text-sm mb-4">
            {search || language
              ? "Try adjusting your filters"
              : "Start your first code review"}
          </p>
          <Link
            href="/dashboard/new"
            className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
          >
            New Review
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-[#ececec] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f9f9fa] border-b border-[#ececec]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6c7681] uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6c7681] uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6c7681] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6c7681] uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6c7681] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#6c7681] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#ececec]">
                  {submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="hover:bg-[#f9f9fa] transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-[#6c7681] mr-2"
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
                          <div>
                            <p className="text-sm font-medium text-[#15192c]">
                              {submission.fileName || "Untitled"}
                            </p>
                            <p className="text-xs text-[#b2b5be]">
                              {submission.linesOfCode} lines •{" "}
                              {(submission.fileSize / 1024).toFixed(1)}KB
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {submission.language}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
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
                              className={`text-lg font-bold ${getScoreColor(
                                submission.analysis.overallScore
                              )}`}
                            >
                              {submission.analysis.overallScore}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-[#b2b5be]">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6c7681]">
                        {submission.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link
                          href={`/dashboard/submissions/${submission.id}`}
                          className="text-[#007fff] hover:text-[#005ecb] font-medium transition"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg border border-[#ececec] px-6 py-4 shadow-sm">
              <div className="text-sm text-[#6c7681]">
                Page {page} of {totalPages}
              </div>

              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/dashboard/submissions?page=${page - 1}${
                      language ? `&language=${language}` : ""
                    }${search ? `&search=${search}` : ""}`}
                    className="px-4 py-2 border border-[#ececec] rounded-lg text-sm font-medium text-[#15192c] hover:bg-[#f9f9fa] transition"
                  >
                    Previous
                  </Link>
                )}

                {page < totalPages && (
                  <Link
                    href={`/dashboard/submissions?page=${page + 1}${
                      language ? `&language=${language}` : ""
                    }${search ? `&search=${search}` : ""}`}
                    className="px-4 py-2 bg-[#007fff] text-white rounded-lg text-sm font-medium hover:bg-[#2b89ff] transition"
                  >
                    Next
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
