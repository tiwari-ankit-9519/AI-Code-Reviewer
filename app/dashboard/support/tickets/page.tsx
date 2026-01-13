// app/dashboard/support/tickets/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TicketList } from "@/components/support/ticket-list";
import { getUserTickets } from "@/lib/actions/support-tickets";
import { ArrowLeft, Plus, LifeBuoy } from "lucide-react";

export default async function TicketsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const tickets = await getUserTickets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/dashboard/support">
            <Button variant="ghost" className="gap-2 -ml-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Support
            </Button>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <LifeBuoy className="h-10 w-10" />
            My Tickets
          </h1>
          <p className="text-muted-foreground mt-2">
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
          </p>
        </div>
        <Link href="/dashboard/support/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Ticket
          </Button>
        </Link>
      </div>

      <TicketList tickets={tickets} />
    </div>
  );
}
