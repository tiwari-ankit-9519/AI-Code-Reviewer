// components/support/close-ticket-button.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { closeTicket } from "@/lib/actions/support-tickets";
import { Loader2, X } from "lucide-react";

interface CloseTicketButtonProps {
  ticketId: string;
}

export function CloseTicketButton({ ticketId }: CloseTicketButtonProps) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = async () => {
    setIsClosing(true);

    try {
      await closeTicket(ticketId);
      toast.success("Ticket closed successfully");
      router.push("/dashboard/support/tickets");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to close ticket"
      );
      setIsClosing(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isClosing}>
          {isClosing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Closing...
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-2" />
              Close Ticket
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close this ticket?</AlertDialogTitle>
          <AlertDialogDescription>
            This will mark the ticket as closed. You can create a new ticket if
            you need further assistance.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClose}>
            Close Ticket
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
