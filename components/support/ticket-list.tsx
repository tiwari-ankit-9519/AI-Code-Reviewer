// components/support/ticket-list.tsx

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: Date;
  _count: {
    messages: number;
  };
}

interface TicketListProps {
  tickets: Ticket[];
}

export function TicketList({ tickets }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No tickets yet. Create one to get started!
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const config = {
      OPEN: { variant: "default" as const, label: "Open" },
      IN_PROGRESS: { variant: "secondary" as const, label: "In Progress" },
      WAITING_USER: { variant: "outline" as const, label: "Waiting for You" },
      RESOLVED: { variant: "outline" as const, label: "Resolved" },
      CLOSED: { variant: "secondary" as const, label: "Closed" },
    };
    return config[status as keyof typeof config] || config.OPEN;
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      LOW: { variant: "secondary" as const },
      MEDIUM: { variant: "default" as const },
      HIGH: { variant: "destructive" as const },
      CRITICAL: { variant: "destructive" as const },
    };
    return config[priority as keyof typeof config] || config.LOW;
  };

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const statusConfig = getStatusBadge(ticket.status);
        const priorityConfig = getPriorityBadge(ticket.priority);

        return (
          <Link
            key={ticket.id}
            href={`/dashboard/support/tickets/${ticket.id}`}
          >
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={statusConfig.variant}>
                        {statusConfig.label}
                      </Badge>
                      <Badge variant={priorityConfig.variant}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(ticket.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {ticket._count.messages} messages
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
