// FILE PATH: app/dashboard/admin/subscriptions/page.tsx

import { prisma } from "@/lib/prisma";
import { Prisma, SubscriptionTier, SubscriptionStatus } from "@prisma/client";
import SubscriptionFilters from "@/components/admin/SubscriptionFilters";
import SubscriptionTable from "@/components/admin/SubscriptionTable";

interface SearchParams {
  page?: string;
  tier?: string;
  status?: string;
  search?: string;
}

export default async function AdminSubscriptions({
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
        subscriptionEndDate: true,
        stripeCustomerId: true,
        monthlySubmissionCount: true,
        trialEndsAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500 mb-2">
          SUBSCRIPTION MANAGEMENT
        </h1>
        <p className="text-gray-400">
          Manage all user subscriptions and billing
        </p>
      </div>

      <SubscriptionFilters
        currentTier={params.tier}
        currentStatus={params.status}
        currentSearch={params.search}
      />

      <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-400">
            Showing {users.length} of {totalCount} subscriptions
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/dashboard/admin/subscriptions?page=${page - 1}${
                  params.tier ? `&tier=${params.tier}` : ""
                }${params.status ? `&status=${params.status}` : ""}${
                  params.search ? `&search=${params.search}` : ""
                }`}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold transition-all"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/dashboard/admin/subscriptions?page=${page + 1}${
                  params.tier ? `&tier=${params.tier}` : ""
                }${params.status ? `&status=${params.status}` : ""}${
                  params.search ? `&search=${params.search}` : ""
                }`}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold transition-all"
              >
                Next
              </a>
            )}
          </div>
        </div>

        <SubscriptionTable users={users} />
      </div>
    </div>
  );
}
