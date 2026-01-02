"use client";

import { useState } from "react";
import { updateLeadNotes } from "@/lib/actions/admin-leads";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
      toast.success("Notes saved");
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
      <button
        onClick={() => setEditing(true)}
        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
      >
        + Add Notes
      </button>
    );
  }

  if (!editing) {
    return (
      <div>
        <div className="bg-gray-900/50 rounded-xl p-4 mb-4 border border-gray-700">
          <p className="text-gray-300 whitespace-pre-wrap">{notes}</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all"
        >
          Edit Notes
        </button>
      </div>
    );
  }

  return (
    <div>
      <textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        rows={6}
        className="w-full px-4 py-3 bg-gray-900 border-2 border-purple-500/30 rounded-xl text-white focus:border-purple-500 outline-none resize-none mb-4"
        placeholder="Add internal notes about this lead..."
      />
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Notes"}
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
