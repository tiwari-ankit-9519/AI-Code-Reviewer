// components/api-keys/api-keys-list.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
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

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

export default function ApiKeysList({ apiKeys }: { apiKeys: ApiKey[] }) {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);

  const toggleKeyVisibility = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const handleDelete = async () => {
    if (!deleteKeyId) return;

    try {
      const response = await fetch(`/api/user/api-keys/${deleteKeyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete API key");
      }

      toast.success("API key deleted successfully");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete API key");
    }
  };

  const maskKey = (key: string) => {
    return `${key.substring(0, 10)}...${key.substring(key.length - 10)}`;
  };

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No API keys yet. Create your first one to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {apiKeys.map((apiKey) => (
          <div
            key={apiKey.id}
            className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold">{apiKey.name}</p>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(apiKey.createdAt).toLocaleDateString()}
                </p>
              </div>
              {apiKey.lastUsedAt && (
                <Badge variant="outline">
                  Last used {new Date(apiKey.lastUsedAt).toLocaleDateString()}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleKeyVisibility(apiKey.id)}
              >
                {showKeys[apiKey.id] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(apiKey.key)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteKeyId(apiKey.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog
        open={deleteKeyId !== null}
        onOpenChange={() => setDeleteKeyId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Any applications using this key will
              stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
