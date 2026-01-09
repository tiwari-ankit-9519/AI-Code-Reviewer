import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  Gift,
  Clock,
  ArrowUp,
  ArrowDown,
  XCircle,
  RotateCcw,
  Activity,
} from "lucide-react";

export default async function RecentActivity({
  limit = 10,
}: {
  limit?: number;
}) {
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

  const getActivityIcon = (action: string) => {
    const iconClass = "h-4 w-4";
    switch (action) {
      case "TRIAL_STARTED":
        return <Gift className={iconClass} />;
      case "TRIAL_CONVERTED":
        return <CheckCircle className={iconClass} />;
      case "SUBSCRIPTION_UPGRADED":
        return <ArrowUp className={iconClass} />;
      case "SUBSCRIPTION_DOWNGRADED":
        return <ArrowDown className={iconClass} />;
      case "SUBSCRIPTION_CANCELLED":
        return <XCircle className={iconClass} />;
      case "TRIAL_EXPIRED":
        return <Clock className={iconClass} />;
      case "SUBSCRIPTION_RENEWED":
        return <RotateCcw className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  };

  const getActivityColor = (
    action: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (action) {
      case "TRIAL_STARTED":
      case "TRIAL_CONVERTED":
      case "SUBSCRIPTION_RENEWED":
      case "SUBSCRIPTION_UPGRADED":
        return "default";
      case "SUBSCRIPTION_DOWNGRADED":
        return "secondary";
      case "SUBSCRIPTION_CANCELLED":
      case "TRIAL_EXPIRED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return new Date(date).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Activity className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-80 pr-4">
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-10 w-10 border">
              <AvatarFallback className="text-xs font-semibold">
                {getInitials(activity.user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={getActivityColor(activity.action)}
                  className="gap-1 text-xs capitalize"
                >
                  {getActivityIcon(activity.action)}
                  {formatAction(activity.action)}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimestamp(activity.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-xs font-medium truncate">
                  {activity.user.name}
                </p>
                <span className="text-xs text-muted-foreground truncate">
                  ({activity.user.email})
                </span>
              </div>

              {activity.fromTier && activity.toTier && (
                <p className="text-xs text-muted-foreground">
                  {activity.fromTier} → {activity.toTier}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
