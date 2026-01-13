// lib/services/priority-support-service.ts
import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";

export async function checkPrioritySupport(userId: string): Promise<{
  hasPrioritySupport: boolean;
  tier: SubscriptionTier;
  responseTime: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) {
    return {
      hasPrioritySupport: false,
      tier: "STARTER",
      responseTime: "48-72 hours",
    };
  }

  const supportTiers = {
    STARTER: {
      hasPrioritySupport: false,
      responseTime: "48-72 hours",
    },
    HERO: {
      hasPrioritySupport: true,
      responseTime: "24 hours",
    },
    LEGEND: {
      hasPrioritySupport: true,
      responseTime: "4-8 hours",
    },
  };

  const config = supportTiers[user.subscriptionTier];

  return {
    hasPrioritySupport: config.hasPrioritySupport,
    tier: user.subscriptionTier,
    responseTime: config.responseTime,
  };
}

export async function createSupportTicket(
  userId: string,
  subject: string,
  message: string,
  priority: "low" | "medium" | "high"
): Promise<{ id: string; priority: boolean }> {
  const supportStatus = await checkPrioritySupport(userId);

  const ticket = await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "SUPPORT_TICKET_CREATED",
      toTier: supportStatus.tier,
      reason: "support_request",
      metadata: {
        subject,
        message,
        priority: supportStatus.hasPrioritySupport ? priority : "low",
        responseTime: supportStatus.responseTime,
        timestamp: new Date().toISOString(),
      },
    },
  });

  return {
    id: ticket.id,
    priority: supportStatus.hasPrioritySupport,
  };
}
