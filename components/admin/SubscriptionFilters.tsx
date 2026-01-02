"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface SubscriptionFiltersProps {
  currentTier?: string;
  currentStatus?: string;
  currentSearch?: string;
}

export default function SubscriptionFilters({
  currentTier,
  currentStatus,
  currentSearch,
}: SubscriptionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || "");

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/dashboard/admin/subscriptions?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", search);
  };

  const clearFilters = () => {
    setSearch("");
    router.push("/dashboard/admin/subscriptions");
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Tier</label>
          <select
            value={currentTier || ""}
            onChange={(e) => updateFilters("tier", e.target.value)}
            className="w-full bg-gray-900 border-2 border-purple-500/30 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
          >
            <option value="">All Tiers</option>
            <option value="STARTER">Starter</option>
            <option value="HERO">Hero</option>
            <option value="LEGEND">Legend</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Status</label>
          <select
            value={currentStatus || ""}
            onChange={(e) => updateFilters("status", e.target.value)}
            className="w-full bg-gray-900 border-2 border-purple-500/30 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIALING">Trialing</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="PAST_DUE">Past Due</option>
          </select>
        </div>

        <form onSubmit={handleSearch} className="md:col-span-2">
          <label className="block text-sm text-gray-400 mb-2">
            Search by email or name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="flex-1 bg-gray-900 border-2 border-purple-500/30 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold transition-all"
            >
              Search
            </button>
            {(currentTier || currentStatus || currentSearch) && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
