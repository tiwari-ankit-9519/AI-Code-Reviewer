import { prisma } from "@/lib/prisma";
import { Prisma, SubscriptionTier, SubscriptionStatus } from "@prisma/client";
import UserFilters from "@/components/admin/UserFilters";
import UserTable from "@/components/admin/UserTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";

interface SearchParams {
  page?: string;
  tier?: string;
  status?: string;
  search?: string;
}

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const pageSize = 50;

  const whereConditions: Prisma.UserWhereInput[] = [];

  if (params.tier && params.tier in SubscriptionTier) {
    whereConditions.push({
      subscriptionTier: params.tier as SubscriptionTier,
    });
  }

  if (params.status && params.status in SubscriptionStatus) {
    whereConditions.push({
      subscriptionStatus: params.status as SubscriptionStatus,
    });
  }

  if (params.search) {
    whereConditions.push({
      OR: [
        { email: { contains: params.search, mode: "insensitive" } },
        { name: { contains: params.search, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.UserWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        trialEndsAt: true,
        isTrialUsed: true,
        monthlySubmissionCount: true,
        stripeCustomerId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const buildPageUrl = (pageNum: number) => {
    const queryParams = new URLSearchParams();
    queryParams.set("page", pageNum.toString());
    if (params.tier) queryParams.set("tier", params.tier);
    if (params.status) queryParams.set("status", params.status);
    if (params.search) queryParams.set("search", params.search);
    return `/dashboard/admin/users?${queryParams.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Users className="h-8 w-8" />
          User Management
        </h1>
        <p className="text-muted-foreground">
          Manage all platform users and their data
        </p>
      </div>

      {/* Filters */}
      <UserFilters
        currentTier={params.tier}
        currentStatus={params.status}
        currentSearch={params.search}
      />

      {/* Table Card */}
      <Card>
        <CardContent className="p-6">
          {/* Pagination Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Showing {users.length} of {totalCount} users
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={buildPageUrl(page - 1)}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={buildPageUrl(page + 1)}>
                  <Button variant="outline" size="sm" className="gap-2">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Table */}
          <UserTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
