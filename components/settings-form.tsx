"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SettingsForm({
  user,
}: {
  user: { name: string | null; email: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({ name, email });
      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#21242c] mb-2">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-[#ececec] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          minLength={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#21242c] mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-[#ececec] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
