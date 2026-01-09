import { Badge } from "@/components/ui/badge";
import { Circle, Phone, Star, CheckCircle, XCircle } from "lucide-react";

export default function LeadStatusBadge({ status }: { status: string }) {
  const getStatusConfig = () => {
    switch (status) {
      case "NEW":
        return {
          variant: "secondary" as const,
          icon: Circle,
          className:
            "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/50",
        };
      case "CONTACTED":
        return {
          variant: "outline" as const,
          icon: Phone,
          className:
            "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/50",
        };
      case "QUALIFIED":
        return {
          variant: "outline" as const,
          icon: Star,
          className:
            "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/50",
        };
      case "CONVERTED":
        return {
          variant: "default" as const,
          icon: CheckCircle,
          className:
            "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/50",
        };
      case "LOST":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          className:
            "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/50",
        };
      default:
        return {
          variant: "outline" as const,
          icon: Circle,
          className: "bg-muted text-muted-foreground",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}
