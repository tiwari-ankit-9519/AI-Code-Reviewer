// components/support/admin-ticket-response.tsx

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { addStaffResponse } from "@/lib/actions/support-tickets";
import { Loader2, Send } from "lucide-react";

interface AdminTicketResponseProps {
  ticketId: string;
}

export function AdminTicketResponse({ ticketId }: AdminTicketResponseProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);

    try {
      await addStaffResponse(ticketId, message);
      setMessage("");
      toast.success("Response sent successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send response",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Response</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Type your response to the customer..."
            disabled={isSubmitting}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
