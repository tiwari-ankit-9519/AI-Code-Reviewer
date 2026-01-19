// components/support/admin-ticket-actions.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { resolveTicket } from "@/lib/actions/support-tickets";
import { MoreVertical, CheckCircle, Loader2 } from "lucide-react";

interface AdminTicketActionsProps {
  ticketId: string;
  currentStatus: string;
}

export function AdminTicketActions({
  ticketId,
  currentStatus,
}: AdminTicketActionsProps) {
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  const handleResolve = async () => {
    setIsResolving(true);

    try {
      await resolveTicket(ticketId);
      toast.success("Ticket marked as resolved");
      setShowResolveDialog(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resolve ticket",
      );
    } finally {
      setIsResolving(false);
    }
  };

  if (currentStatus === "CLOSED" || currentStatus === "RESOLVED") {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowResolveDialog(true)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Resolved
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark ticket as resolved?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the ticket as resolved. The customer can still
              reply if they need further assistance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResolving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResolve} disabled={isResolving}>
              {isResolving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                "Mark as Resolved"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
