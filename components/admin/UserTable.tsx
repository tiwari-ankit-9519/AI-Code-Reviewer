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
import UserActions from "@/components/admin/UserActions";
import { formatDistanceToNow } from "date-fns";
import { Users } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionStartDate: Date | null;
  trialEndsAt: Date | null;
  isTrialUsed: boolean;
  monthlySubmissionCount: number;
  stripeCustomerId: string | null;
  createdAt: Date;
}

export default function UserTable({ users }: { users: User[] }) {
  if (users.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No users found matching your filters
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
              <TableHead>Trial Info</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Joined</TableHead>
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
                  {user.subscriptionStatus === "TRIALING" &&
                  user.trialEndsAt ? (
                    <div>
                      <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                        Ends{" "}
                        {formatDistanceToNow(new Date(user.trialEndsAt), {
                          addSuffix: true,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.trialEndsAt).toLocaleDateString(
                          "en-IN",
                          {
                            dateStyle: "medium",
                          }
                        )}
                      </p>
                    </div>
                  ) : user.isTrialUsed ? (
                    <span className="text-sm text-muted-foreground">
                      Trial used
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No trial
                    </span>
                  )}
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
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <UserActions user={user} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
