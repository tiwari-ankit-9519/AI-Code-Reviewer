import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllTicketsAdmin } from "@/lib/actions/support-tickets";
import { formatDistanceToNow } from "date-fns";
import { LifeBuoy, Clock, AlertCircle, CheckCircle } from "lucide-react";

export default async function AdminSupportPage() {
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

  const tickets = await getAllTicketsAdmin();

  const stats = {
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    waitingUser: tickets.filter((t) => t.status === "WAITING_USER").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  };

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
      LOW: { variant: "secondary" as const },
      MEDIUM: { variant: "default" as const },
      HIGH: { variant: "destructive" as const },
      CRITICAL: { variant: "destructive" as const },
    };
    return config[priority as keyof typeof config] || config.LOW;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <LifeBuoy className="h-10 w-10" />
          Support Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage customer support tickets
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Waiting User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waitingUser}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No tickets yet
              </p>
            ) : (
              tickets.map((ticket) => {
                const statusConfig = getStatusBadge(ticket.status);
                const priorityConfig = getPriorityBadge(ticket.priority);

                return (
                  <Link
                    key={ticket.id}
                    href={`/dashboard/admin/support/${ticket.id}`}
                  >
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
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
                            <Badge variant="outline">
                              {ticket.user.subscriptionTier}
                            </Badge>
                          </div>
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{ticket.user.name}</span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(ticket.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            <span>•</span>
                            <span>{ticket._count.messages} messages</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
