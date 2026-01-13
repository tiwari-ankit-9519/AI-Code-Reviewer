// app/dashboard/api-keys/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserApiKeys } from "@/lib/services/api-key-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserSubscription } from "@/lib/subscription/subscription-utils";
import ApiKeysList from "@/components/api-keys/api-keys-list";

export default async function ApiKeysPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const subscription = await getUserSubscription(session.user.id);
  const apiKeys = await getUserApiKeys(session.user.id);

  const hasApiAccess =
    subscription.subscriptionTier === "HERO" ||
    subscription.subscriptionTier === "LEGEND";
  const maxKeys =
    subscription.subscriptionTier === "HERO"
      ? 3
      : subscription.subscriptionTier === "LEGEND"
      ? 10
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 mb-2">
          <Key className="h-10 w-10" />
          API Keys
        </h1>
        <p className="text-muted-foreground">
          Manage your API keys for programmatic access
        </p>
      </div>

      {!hasApiAccess ? (
        <Card className="border-2 border-orange-500/50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              API Access Not Available
            </h2>
            <p className="text-muted-foreground mb-4">
              API access is only available for HERO and LEGEND tiers
            </p>
            <Link href="/pricing">
              <Button size="lg">Upgrade to HERO</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your API Keys</CardTitle>
                  <CardDescription>
                    You have {apiKeys.length} / {maxKeys} API keys
                  </CardDescription>
                </div>
                {apiKeys.length < maxKeys && (
                  <Link href="/dashboard/api-keys/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Key
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ApiKeysList apiKeys={apiKeys} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Include your API key in the Authorization header:
                </p>
                <code className="block p-3 bg-muted rounded text-sm">
                  Authorization: Bearer cr_your_api_key_here
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Submit Code for Review</h3>
                <code className="block p-3 bg-muted rounded text-sm">
                  POST /api/v1/submissions
                  <br />
                  {`{`}
                  <br />
                  &nbsp;&nbsp;&quot;code&quot;: &quot;your code here&quot;,
                  <br />
                  &nbsp;&nbsp;&quot;language&quot;: &quot;javascript&quot;,
                  <br />
                  &nbsp;&nbsp;&quot;fileName&quot;: &quot;example.js&quot;
                  <br />
                  {`}`}
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Rate Limits</h3>
                <div className="space-y-2">
                  <Badge variant="outline">HERO: 100 requests/hour</Badge>
                  <Badge variant="outline" className="ml-2">
                    LEGEND: 500 requests/hour
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
