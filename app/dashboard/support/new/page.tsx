// app/dashboard/support/new/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TicketForm } from "@/components/support/ticket-form";
import { ArrowLeft, LifeBuoy } from "lucide-react";

export default async function NewTicketPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/dashboard/support">
          <Button variant="ghost" className="gap-2 -ml-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Support
          </Button>
        </Link>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <LifeBuoy className="h-10 w-10" />
          Create Support Ticket
        </h1>
        <p className="text-muted-foreground mt-2">
          Describe your issue and our team will help you
        </p>
      </div>

      <TicketForm />
    </div>
  );
}
