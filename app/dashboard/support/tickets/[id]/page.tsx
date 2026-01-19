// app/dashboard/support/tickets/[id]/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTicketById } from "@/lib/actions/support-tickets";
import { ArrowLeft, Clock, User, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TicketMessageForm } from "@/components/support/ticket-message-form";
import { CloseTicketButton } from "@/components/support/close-ticket-button";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const ticket = await getTicketById(id);

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

  const statusConfig = getStatusBadge(ticket.status);
  const priorityConfig = getPriorityBadge(ticket.priority);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="space-y-6">
        <div className="space-y-4">
          <Link href="/dashboard/support/tickets">
            <Button variant="ghost" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Tickets
            </Button>
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold tracking-tight mb-3">
                {ticket.subject}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
                <Badge variant={priorityConfig.variant}>
                  {ticket.priority}
                </Badge>
                <Badge variant="outline">{ticket.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  Ticket #{ticket.id.slice(0, 8)}
                </span>
              </div>
            </div>
            {ticket.status !== "CLOSED" && ticket.status !== "RESOLVED" && (
              <div className="shrink-0">
                <CloseTicketButton ticketId={ticket.id} />
              </div>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Ticket Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Created</p>
                <p className="font-semibold">
                  {formatDistanceToNow(new Date(ticket.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Response Time SLA
                </p>
                <p className="font-semibold">{ticket.slaResponseTime} hours</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Tier</p>
                <p className="font-semibold">{ticket.user.subscriptionTier}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Messages</p>
                <p className="font-semibold">{ticket.messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {ticket.messages.map((message) => (
                <div key={message.id} className="flex gap-4">
                  <div className="shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        message.isStaff
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.isStaff ? (
                        <Shield className="h-5 w-5" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">
                        {message.isStaff ? "Support Team" : ticket.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${
                        message.isStaff
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {ticket.status !== "CLOSED" && (
          <TicketMessageForm ticketId={ticket.id} />
        )}

        {ticket.status === "CLOSED" && (
          <Card className="border-muted">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                This ticket has been closed. Please create a new ticket if you
                need further assistance.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
