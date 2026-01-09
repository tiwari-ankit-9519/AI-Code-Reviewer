import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Circle,
} from "lucide-react";

export default function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = () => {
    switch (status) {
      case "ACTIVE":
        return {
          variant: "default" as const,
          icon: CheckCircle,
          className:
            "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/50",
        };
      case "TRIALING":
        return {
          variant: "secondary" as const,
          icon: Clock,
          className:
            "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/50",
        };
      case "CANCELLED":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          className:
            "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/50",
        };
      case "PAST_DUE":
        return {
          variant: "outline" as const,
          icon: AlertTriangle,
          className:
            "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/50",
        };
      default:
        return {
          variant: "outline" as const,
          icon: Circle,
          className: "bg-muted text-muted-foreground",
        };
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ");
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {formatStatus(status)}
    </Badge>
  );
}
