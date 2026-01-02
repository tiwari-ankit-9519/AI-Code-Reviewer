import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export default async function RecentActivity({ limit }: { limit: number }) {
  const activities = await prisma.subscriptionHistory.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "SUBSCRIPTION_STARTED":
        return "🎉";
      case "TRIAL_STARTED":
        return "🆓";
      case "TRIAL_CONVERTED":
        return "✅";
      case "TRIAL_EXPIRED":
        return "⏰";
      case "SUBSCRIPTION_UPGRADED":
        return "⬆️";
      case "SUBSCRIPTION_DOWNGRADED":
        return "⬇️";
      case "SUBSCRIPTION_CANCELLED":
        return "❌";
      case "SUBSCRIPTION_RENEWED":
        return "🔄";
      default:
        return "📌";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "SUBSCRIPTION_STARTED":
      case "TRIAL_CONVERTED":
      case "SUBSCRIPTION_RENEWED":
        return "text-green-400";
      case "SUBSCRIPTION_UPGRADED":
        return "text-blue-400";
      case "TRIAL_STARTED":
        return "text-yellow-400";
      case "SUBSCRIPTION_CANCELLED":
      case "TRIAL_EXPIRED":
        return "text-red-400";
      case "SUBSCRIPTION_DOWNGRADED":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No recent activity</div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-all"
        >
          <span className="text-2xl mt-1">
            {getActionIcon(activity.action)}
          </span>
          <div className="flex-1 min-w-0">
            <p className={`font-bold ${getActionColor(activity.action)}`}>
              {formatAction(activity.action)}
            </p>
            <p className="text-sm text-gray-400 truncate">
              {activity.user.name} ({activity.user.email})
            </p>
            {activity.fromTier && activity.toTier && (
              <p className="text-xs text-gray-500">
                {activity.fromTier} → {activity.toTier}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDistanceToNow(new Date(activity.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      ))}
    </div>
  );
}
