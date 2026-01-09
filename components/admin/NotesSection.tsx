// components/admin/NotesSection.tsx
"use client";

import { useState } from "react";
import { updateLeadNotes } from "@/lib/actions/admin-leads";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Save, X, Loader2 } from "lucide-react";

interface NotesSectionProps {
  leadId: string;
  notes: string | null;
}

export default function NotesSection({ leadId, notes }: NotesSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState(notes || "");

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateLeadNotes(leadId, noteText);
      toast.success("Notes saved successfully");
      setEditing(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save notes"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNoteText(notes || "");
    setEditing(false);
  };

  if (!editing && !notes) {
    return (
      <Button
        onClick={() => setEditing(true)}
        variant="outline"
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Notes
      </Button>
    );
  }

  if (!editing) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm whitespace-pre-wrap">{notes}</p>
          </CardContent>
        </Card>
        <Button
          onClick={() => setEditing(true)}
          variant="outline"
          className="gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Notes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        rows={6}
        placeholder="Add internal notes about this lead..."
        className="resize-none"
      />
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Notes
            </>
          )}
        </Button>
        <Button
          onClick={handleCancel}
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
