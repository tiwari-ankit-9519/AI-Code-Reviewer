import TierBadge from "@/components/admin/TierBadge";
import StatusBadge from "@/components/admin/StatusBadge";
import SubscriptionActions from "@/components/admin/SubscriptionActions";

interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  stripeCustomerId: string | null;
  monthlySubmissionCount: number;
  trialEndsAt: Date | null;
  createdAt: Date;
}

export default function SubscriptionTable({ users }: { users: User[] }) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No subscriptions found matching your filters
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-900/50 border-b-2 border-purple-500/30">
          <tr>
            <th className="px-6 py-4 text-left text-gray-400 text-sm font-bold">
              User
            </th>
            <th className="px-6 py-4 text-left text-gray-400 text-sm font-bold">
              Tier
            </th>
            <th className="px-6 py-4 text-left text-gray-400 text-sm font-bold">
              Status
            </th>
            <th className="px-6 py-4 text-left text-gray-400 text-sm font-bold">
              Usage
            </th>
            <th className="px-6 py-4 text-left text-gray-400 text-sm font-bold">
              Start Date
            </th>
            <th className="px-6 py-4 text-left text-gray-400 text-sm font-bold">
              Trial Ends
            </th>
            <th className="px-6 py-4 text-right text-gray-400 text-sm font-bold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-all"
            >
              <td className="px-6 py-4">
                <div>
                  <p className="font-bold text-white">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <TierBadge tier={user.subscriptionTier} />
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={user.subscriptionStatus} />
              </td>
              <td className="px-6 py-4">
                <span className="text-white font-mono">
                  {user.monthlySubmissionCount}
                </span>
                <span className="text-gray-500 text-sm ml-1">
                  /{user.subscriptionTier === "STARTER" ? "5" : "∞"}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-400 text-sm">
                {user.subscriptionStartDate
                  ? new Date(user.subscriptionStartDate).toLocaleDateString(
                      "en-IN",
                      { dateStyle: "medium" }
                    )
                  : "-"}
              </td>
              <td className="px-6 py-4 text-gray-400 text-sm">
                {user.trialEndsAt
                  ? new Date(user.trialEndsAt).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })
                  : "-"}
              </td>
              <td className="px-6 py-4">
                <SubscriptionActions user={user} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
