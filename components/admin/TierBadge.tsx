import { Badge } from "@/components/ui/badge";
import { Award, Zap, Crown } from "lucide-react";

export default function TierBadge({ tier }: { tier: string }) {
  const getTierConfig = () => {
    switch (tier) {
      case "STARTER":
        return {
          variant: "outline" as const,
          icon: Award,
          className:
            "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/50",
        };
      case "HERO":
        return {
          variant: "default" as const,
          icon: Zap,
          className:
            "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/50",
        };
      case "LEGEND":
        return {
          variant: "secondary" as const,
          icon: Crown,
          className:
            "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/50",
        };
      default:
        return {
          variant: "outline" as const,
          icon: Award,
          className: "bg-muted text-muted-foreground",
        };
    }
  };

  const config = getTierConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {tier}
    </Badge>
  );
}
