import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import TierBadge from "@/components/admin/TierBadge";
import StatusBadge from "@/components/admin/StatusBadge";
import UserDetailActions from "@/components/admin/UserDetailActions";

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
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/admin/users"
            className="text-purple-400 hover:text-purple-300 mb-2 inline-block"
          >
            ← Back to Users
          </Link>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500">
            USER DETAILS
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-black text-white mb-6">
              User Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-400">Name</label>
                <p className="text-white font-bold text-lg">{user.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-white font-bold text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">User ID</label>
                <p className="text-gray-300 font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Joined</label>
                <p className="text-white">
                  {new Date(user.createdAt).toLocaleDateString("en-IN", {
                    dateStyle: "long",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-black text-white mb-6">
              Subscription Details
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-400">Current Tier</label>
                <div className="mt-2">
                  <TierBadge tier={user.subscriptionTier} />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Status</label>
                <div className="mt-2">
                  <StatusBadge status={user.subscriptionStatus} />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Start Date</label>
                <p className="text-white">
                  {user.subscriptionStartDate
                    ? new Date(user.subscriptionStartDate).toLocaleDateString(
                        "en-IN",
                        { dateStyle: "medium" }
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">End Date</label>
                <p className="text-white">
                  {user.subscriptionEndDate
                    ? new Date(user.subscriptionEndDate).toLocaleDateString(
                        "en-IN",
                        { dateStyle: "medium" }
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">
                  Stripe Customer ID
                </label>
                <p className="text-gray-300 font-mono text-sm">
                  {user.stripeCustomerId || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Trial Status</label>
                {user.subscriptionStatus === "TRIALING" && user.trialEndsAt ? (
                  <p className="text-yellow-400 font-bold">
                    Ends{" "}
                    {formatDistanceToNow(new Date(user.trialEndsAt), {
                      addSuffix: true,
                    })}
                  </p>
                ) : user.isTrialUsed ? (
                  <p className="text-gray-400">Trial used</p>
                ) : (
                  <p className="text-gray-400">No trial</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-black text-white mb-6">
              Usage Statistics
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <label className="text-sm text-gray-400">
                  Monthly Submissions
                </label>
                <p className="text-3xl font-black text-white mt-2">
                  {user.monthlySubmissionCount}
                </p>
                <p className="text-sm text-gray-500">
                  of {user.subscriptionTier === "STARTER" ? "5" : "unlimited"}
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <label className="text-sm text-gray-400">
                  Total Submissions
                </label>
                <p className="text-3xl font-black text-white mt-2">
                  {user.submissions.length}
                </p>
                <p className="text-sm text-gray-500">all time</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <label className="text-sm text-gray-400">Last Reset</label>
                <p className="text-sm text-white mt-2">
                  {formatDistanceToNow(new Date(user.lastSubmissionReset), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {submissionStats.length > 0 && (
              <div className="mt-6">
                <label className="text-sm text-gray-400 mb-3 block">
                  Submissions by Language
                </label>
                <div className="flex gap-3 flex-wrap">
                  {submissionStats.map((stat) => (
                    <div
                      key={stat.language}
                      className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-4 py-2"
                    >
                      <span className="text-purple-400 font-bold">
                        {stat.language}
                      </span>
                      <span className="text-white ml-2">{stat._count.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-black text-white mb-6">
              Subscription History
            </h2>
            {user.subscriptionHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No subscription history
              </p>
            ) : (
              <div className="space-y-3">
                {user.subscriptionHistory.map((history) => (
                  <div
                    key={history.id}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-bold">
                          {history.action.replace(/_/g, " ")}
                        </p>
                        {history.fromTier && history.toTier && (
                          <p className="text-sm text-gray-400">
                            {history.fromTier} → {history.toTier}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(history.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {history.reason && (
                      <p className="text-sm text-gray-500">
                        Reason: {history.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-yellow-500/30 rounded-xl p-6 sticky top-8">
            <h2 className="text-xl font-black text-white mb-6">
              Quick Actions
            </h2>
            <UserDetailActions user={user} />
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-black text-white mb-4">
              Recent Submissions
            </h2>
            {user.submissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">
                No submissions yet
              </p>
            ) : (
              <div className="space-y-2">
                {user.submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="bg-gray-900/50 rounded p-3 border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-bold text-sm">
                        {submission.language}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(submission.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
