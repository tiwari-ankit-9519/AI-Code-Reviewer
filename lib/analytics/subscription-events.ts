"use server";

import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";

export enum SubscriptionEvent {
  TRIAL_STARTED = "trial_started",
  TRIAL_CONVERTED = "trial_converted",
  TRIAL_EXPIRED = "trial_expired",

  SUBSCRIPTION_CREATED = "subscription_created",
  SUBSCRIPTION_UPGRADED = "subscription_upgraded",
  SUBSCRIPTION_DOWNGRADED = "subscription_downgraded",
  SUBSCRIPTION_CANCELLED = "subscription_cancelled",
  SUBSCRIPTION_RENEWED = "subscription_renewed",

  SUBMISSION_CREATED = "submission_created",
  LIMIT_WARNING_SENT = "limit_warning_sent",
  LIMIT_REACHED = "limit_reached",

  PAYMENT_SUCCEEDED = "payment_succeeded",
  PAYMENT_FAILED = "payment_failed",
  REFUND_ISSUED = "refund_issued",
}

interface EventMetadata {
  tier?: string;
  amount?: number;
  method?: string;
  fromTier?: string;
  toTier?: string;
  reason?: string;
  submissionId?: string;
  errorMessage?: string;
  timestamp?: string;
  remaining?: number;
  [key: string]: string | number | boolean | undefined;
}

export async function trackEvent(
  event: SubscriptionEvent,
  userId: string,
  metadata?: EventMetadata
) {
  try {
    const toTier = metadata?.toTier as SubscriptionTier | undefined;
    const fromTier = metadata?.fromTier as SubscriptionTier | undefined;
    const amount = metadata?.amount;
    const reason = metadata?.reason;

    await prisma.subscriptionHistory.create({
      data: {
        userId,
        action: event,
        toTier: toTier || SubscriptionTier.STARTER,
        fromTier: fromTier,
        amount: amount,
        reason: reason,
        metadata: metadata || {},
      },
    });

    if (process.env.ANALYTICS_ENABLED === "true") {
      await sendToAnalytics(event, userId, metadata);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to track event:", error);
    return { success: false, error };
  }
}

async function sendToAnalytics(
  event: SubscriptionEvent,
  userId: string,
  metadata?: EventMetadata
) {
  const analyticsProviders = [
    process.env.MIXPANEL_TOKEN && sendToMixpanel,
    process.env.SEGMENT_WRITE_KEY && sendToSegment,
    process.env.POSTHOG_API_KEY && sendToPostHog,
  ].filter(Boolean);

  await Promise.allSettled(
    analyticsProviders.map((send) =>
      send ? send(event, userId, metadata) : Promise.resolve()
    )
  );
}

async function sendToMixpanel(
  event: SubscriptionEvent,
  userId: string,
  metadata?: EventMetadata
) {
  try {
    const response = await fetch("https://api.mixpanel.com/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event,
        properties: {
          distinct_id: userId,
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Mixpanel tracking failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Mixpanel error:", error);
  }
}

async function sendToSegment(
  event: SubscriptionEvent,
  userId: string,
  metadata?: EventMetadata
) {
  try {
    const writeKey = process.env.SEGMENT_WRITE_KEY;
    const auth = Buffer.from(`${writeKey}:`).toString("base64");

    const response = await fetch("https://api.segment.io/v1/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        userId,
        event,
        properties: metadata,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Segment tracking failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Segment error:", error);
  }
}

async function sendToPostHog(
  event: SubscriptionEvent,
  userId: string,
  metadata?: EventMetadata
) {
  try {
    const response = await fetch("https://app.posthog.com/capture/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.POSTHOG_API_KEY,
        event,
        distinct_id: userId,
        properties: metadata,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`PostHog tracking failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error("PostHog error:", error);
  }
}

export async function trackTrialStarted(userId: string, tier: string) {
  return trackEvent(SubscriptionEvent.TRIAL_STARTED, userId, {
    tier,
    toTier: tier,
    timestamp: new Date().toISOString(),
  });
}

export async function trackTrialConverted(
  userId: string,
  tier: string,
  amount: number
) {
  return trackEvent(SubscriptionEvent.TRIAL_CONVERTED, userId, {
    tier,
    toTier: tier,
    amount,
    timestamp: new Date().toISOString(),
  });
}

export async function trackTrialExpired(userId: string, tier: string) {
  return trackEvent(SubscriptionEvent.TRIAL_EXPIRED, userId, {
    tier,
    toTier: tier,
    timestamp: new Date().toISOString(),
  });
}

export async function trackSubscriptionCreated(
  userId: string,
  tier: string,
  amount: number,
  method: string
) {
  return trackEvent(SubscriptionEvent.SUBSCRIPTION_CREATED, userId, {
    tier,
    toTier: tier,
    amount,
    method,
    timestamp: new Date().toISOString(),
  });
}

export async function trackSubscriptionUpgraded(
  userId: string,
  fromTier: string,
  toTier: string,
  amount: number
) {
  return trackEvent(SubscriptionEvent.SUBSCRIPTION_UPGRADED, userId, {
    fromTier,
    toTier,
    amount,
    timestamp: new Date().toISOString(),
  });
}

export async function trackSubscriptionDowngraded(
  userId: string,
  fromTier: string,
  toTier: string
) {
  return trackEvent(SubscriptionEvent.SUBSCRIPTION_DOWNGRADED, userId, {
    fromTier,
    toTier,
    timestamp: new Date().toISOString(),
  });
}

export async function trackSubscriptionCancelled(
  userId: string,
  tier: string,
  reason?: string
) {
  return trackEvent(SubscriptionEvent.SUBSCRIPTION_CANCELLED, userId, {
    tier,
    toTier: tier,
    reason,
    timestamp: new Date().toISOString(),
  });
}

export async function trackSubscriptionRenewed(
  userId: string,
  tier: string,
  amount: number
) {
  return trackEvent(SubscriptionEvent.SUBSCRIPTION_RENEWED, userId, {
    tier,
    toTier: tier,
    amount,
    timestamp: new Date().toISOString(),
  });
}

export async function trackSubmissionCreated(
  userId: string,
  submissionId: string,
  tier: string
) {
  return trackEvent(SubscriptionEvent.SUBMISSION_CREATED, userId, {
    submissionId,
    tier,
    toTier: tier,
    timestamp: new Date().toISOString(),
  });
}

export async function trackLimitWarningSent(
  userId: string,
  tier: string,
  remaining: number
) {
  return trackEvent(SubscriptionEvent.LIMIT_WARNING_SENT, userId, {
    tier,
    toTier: tier,
    remaining,
    timestamp: new Date().toISOString(),
  });
}

export async function trackLimitReached(userId: string, tier: string) {
  return trackEvent(SubscriptionEvent.LIMIT_REACHED, userId, {
    tier,
    toTier: tier,
    timestamp: new Date().toISOString(),
  });
}

export async function trackPaymentSucceeded(
  userId: string,
  amount: number,
  method: string,
  tier: string
) {
  return trackEvent(SubscriptionEvent.PAYMENT_SUCCEEDED, userId, {
    amount,
    method,
    tier,
    toTier: tier,
    timestamp: new Date().toISOString(),
  });
}

export async function trackPaymentFailed(
  userId: string,
  amount: number,
  method: string,
  errorMessage: string
) {
  return trackEvent(SubscriptionEvent.PAYMENT_FAILED, userId, {
    amount,
    method,
    errorMessage,
    toTier: "STARTER",
    timestamp: new Date().toISOString(),
  });
}

export async function trackRefundIssued(
  userId: string,
  amount: number,
  reason: string
) {
  return trackEvent(SubscriptionEvent.REFUND_ISSUED, userId, {
    amount,
    reason,
    toTier: "STARTER",
    timestamp: new Date().toISOString(),
  });
}

export async function getEventHistory(
  userId: string,
  limit: number = 50,
  eventType?: SubscriptionEvent
) {
  const where: { userId: string; action?: string } = { userId };

  if (eventType) {
    where.action = eventType;
  }

  return prisma.subscriptionHistory.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getEventStats(
  startDate: Date,
  endDate: Date,
  eventType?: SubscriptionEvent
) {
  const where: {
    createdAt: { gte: Date; lte: Date };
    action?: string;
  } = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (eventType) {
    where.action = eventType;
  }

  const [total, byEvent] = await Promise.all([
    prisma.subscriptionHistory.count({ where }),
    prisma.subscriptionHistory.groupBy({
      by: ["action"],
      where,
      _count: {
        action: true,
      },
    }),
  ]);

  return {
    total,
    byEvent: byEvent.reduce((acc, item) => {
      acc[item.action] = item._count.action;
      return acc;
    }, {} as Record<string, number>),
  };
}
