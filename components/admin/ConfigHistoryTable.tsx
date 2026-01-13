"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { SubscriptionTier } from "@prisma/client";

interface ConfigMetadata {
  config?: {
    reviewsPerSession?: number;
    coolingPeriodHours?: number;
    monthlyReviewLimit?: number | null;
  };
  updatedBy?: string;
  timestamp?: string;
}

interface ConfigHistoryTableProps {
  history: Array<{
    id: string;
    action: string;
    toTier: SubscriptionTier;
    metadata: unknown;
    createdAt: Date;
    user: {
      name: string;
      email: string;
    };
  }>;
}

export default function ConfigHistoryTable({
  history,
}: ConfigHistoryTableProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-semibold">
          No configuration history
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Changes to tier configurations will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tier</TableHead>
            <TableHead>Changes</TableHead>
            <TableHead>Modified By</TableHead>
            <TableHead className="text-right">Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((record) => {
            const metadata = record.metadata as ConfigMetadata;
            return (
              <TableRow key={record.id}>
                <TableCell>
                  <Badge variant="outline">{record.toTier}</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {metadata?.config && (
                    <div className="space-y-1">
                      <div>
                        Reviews:{" "}
                        <span className="font-semibold">
                          {metadata.config.reviewsPerSession}
                        </span>
                      </div>
                      <div>
                        Cooling:{" "}
                        <span className="font-semibold">
                          {metadata.config.coolingPeriodHours}h
                        </span>
                      </div>
                      <div>
                        Monthly:{" "}
                        <span className="font-semibold">
                          {metadata.config.monthlyReviewLimit || "∞"}
                        </span>
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{record.user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {record.user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(record.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
