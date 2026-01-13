import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TierConfigCard from "@/components/admin/TierConfigCard";
import ConfigHistoryTable from "@/components/admin/ConfigHistoryTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, History } from "lucide-react";
import {
  getTierConfigs,
  getConfigHistory,
} from "@/lib/actions/admin-tier-config";

export default async function TierConfigPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const configMap = await getTierConfigs();
  const history = await getConfigHistory();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 mb-2">
          <Settings className="h-10 w-10" />
          Tier Configuration
        </h1>
        <p className="text-muted-foreground">
          Configure review limits and cooling periods for each subscription tier
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <TierConfigCard
          tier="STARTER"
          config={configMap.STARTER}
          adminId={session.user.id}
        />
        <TierConfigCard
          tier="HERO"
          config={configMap.HERO}
          adminId={session.user.id}
        />
        <TierConfigCard
          tier="LEGEND"
          config={configMap.LEGEND}
          adminId={session.user.id}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Configuration History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigHistoryTable history={history} />
        </CardContent>
      </Card>
    </div>
  );
}
