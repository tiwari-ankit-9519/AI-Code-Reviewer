import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import TierBadge from "@/components/admin/TierBadge";
import StatusBadge from "@/components/admin/StatusBadge";
import SubscriptionActions from "@/components/admin/SubscriptionActions";
import { FileX } from "lucide-react";

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
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <FileX className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No subscriptions found matching your filters
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Trial Ends</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <TierBadge tier={user.subscriptionTier} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.subscriptionStatus} />
                </TableCell>
                <TableCell>
                  <span className="font-mono">
                    {user.monthlySubmissionCount}
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">
                    /{user.subscriptionTier === "STARTER" ? "5" : "∞"}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.subscriptionStartDate
                    ? new Date(user.subscriptionStartDate).toLocaleDateString(
                        "en-IN",
                        { dateStyle: "medium" }
                      )
                    : "-"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.trialEndsAt
                    ? new Date(user.trialEndsAt).toLocaleDateString("en-IN", {
                        dateStyle: "medium",
                      })
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <SubscriptionActions user={user} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
