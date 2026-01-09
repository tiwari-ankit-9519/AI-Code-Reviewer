// components/admin/UserFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";

interface UserFiltersProps {
  currentTier?: string;
  currentStatus?: string;
  currentSearch?: string;
}

export default function UserFilters({
  currentTier,
  currentStatus,
  currentSearch,
}: UserFiltersProps) {
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
    router.push(`/dashboard/admin/users?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", search);
  };

  const clearFilters = () => {
    setSearch("");
    router.push("/dashboard/admin/users");
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tier Filter */}
          <div className="space-y-2">
            <Label htmlFor="tier-filter">Tier</Label>
            <Select
              value={currentTier || "all"}
              onValueChange={(value) =>
                updateFilters("tier", value === "all" ? "" : value)
              }
            >
              <SelectTrigger id="tier-filter">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="HERO">Hero</SelectItem>
                <SelectItem value="LEGEND">Legend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={currentStatus || "all"}
              onValueChange={(value) =>
                updateFilters("status", value === "all" ? "" : value)
              }
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="TRIALING">Trialing</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="PAST_DUE">Past Due</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Filter */}
          <form onSubmit={handleSearch} className="md:col-span-2 space-y-2">
            <Label htmlFor="search-input">Search by email or name</Label>
            <div className="flex gap-2">
              <Input
                id="search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="flex-1"
              />
              <Button type="submit" className="gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
              {(currentTier || currentStatus || currentSearch) && (
                <Button
                  type="button"
                  onClick={clearFilters}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
