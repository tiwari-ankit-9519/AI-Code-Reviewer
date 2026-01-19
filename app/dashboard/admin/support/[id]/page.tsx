// app/dashboard/admin/support/[id]/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User, Shield, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AdminTicketActions } from "@/components/support/admin-ticket-actions";
import { AdminTicketResponse } from "@/components/support/admin-ticket-response";

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionTier: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!ticket) {
    redirect("/dashboard/admin/support");
  }

  const getStatusBadge = (status: string) => {
    const config = {
      OPEN: { variant: "destructive" as const, label: "Open" },
      IN_PROGRESS: { variant: "default" as const, label: "In Progress" },
      WAITING_USER: { variant: "secondary" as const, label: "Waiting User" },
      RESOLVED: { variant: "outline" as const, label: "Resolved" },
      CLOSED: { variant: "secondary" as const, label: "Closed" },
    };
    return config[status as keyof typeof config] || config.OPEN;
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      LOW: { variant: "secondary" as const, color: "bg-gray-500" },
      MEDIUM: { variant: "default" as const, color: "bg-yellow-500" },
      HIGH: { variant: "destructive" as const, color: "bg-orange-500" },
      CRITICAL: { variant: "destructive" as const, color: "bg-red-500" },
    };
    return config[priority as keyof typeof config] || config.LOW;
  };

  const statusConfig = getStatusBadge(ticket.status);
  const priorityConfig = getPriorityBadge(ticket.priority);

  const timeSinceCreated =
    new Date().getTime() - new Date(ticket.createdAt).getTime();
  const hoursSinceCreated = timeSinceCreated / (1000 * 60 * 60);
  const slaViolated =
    !ticket.firstResponseAt && hoursSinceCreated > ticket.slaResponseTime;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-6">
        <div className="space-y-4">
          <Link href="/dashboard/admin/support">
            <Button variant="ghost" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Support Dashboard
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
                <Badge variant="outline">{ticket.user.subscriptionTier}</Badge>
                {slaViolated && (
                  <Badge variant="destructive" className="gap-1">
                    <Clock className="h-3 w-3" />
                    SLA Violated
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  Ticket #{ticket.id.slice(0, 8)}
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <AdminTicketActions
                ticketId={ticket.id}
                currentStatus={ticket.status}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                <p className="font-semibold">{ticket.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <a
                  href={`mailto:${ticket.user.email}`}
                  className="font-semibold text-primary hover:underline flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  {ticket.user.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Subscription Tier
                </p>
                <Badge variant="outline" className="text-base">
                  {ticket.user.subscriptionTier}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="font-semibold text-sm">
                    {formatDistanceToNow(new Date(ticket.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">SLA Time</p>
                  <p className="font-semibold text-sm">
                    {ticket.slaResponseTime}h
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    First Response
                  </p>
                  <p className="font-semibold text-sm">
                    {ticket.firstResponseAt
                      ? formatDistanceToNow(new Date(ticket.firstResponseAt), {
                          addSuffix: true,
                        })
                      : "Not yet"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Messages</p>
                  <p className="font-semibold text-sm">
                    {ticket.messages.length}
                  </p>
                </div>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                  <p className="font-semibold text-sm">
                    {formatDistanceToNow(new Date(ticket.resolvedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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

        {ticket.status !== "CLOSED" && ticket.status !== "RESOLVED" && (
          <AdminTicketResponse ticketId={ticket.id} />
        )}

        {(ticket.status === "CLOSED" || ticket.status === "RESOLVED") && (
          <Card className="border-muted">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                This ticket has been {ticket.status.toLowerCase()}. No further
                action needed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
