import { prisma } from "@/lib/prisma";

export async function checkAndResetSubmissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      lastSubmissionReset: true,
      monthlySubmissionCount: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const lastReset = new Date(user.lastSubmissionReset);

  const isNewMonth =
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear();

  if (isNewMonth) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlySubmissionCount: 0,
        lastSubmissionReset: now,
        submissionLimitNotified: false,
      },
    });

    return {
      reset: true,
      previousCount: user.monthlySubmissionCount,
      newCount: 0,
      resetDate: now,
    };
  }

  return {
    reset: false,
    currentCount: user.monthlySubmissionCount,
    lastResetDate: lastReset,
  };
}

export async function resetAllUsers() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const usersToReset = await prisma.user.findMany({
    where: {
      lastSubmissionReset: {
        lt: firstDayOfMonth,
      },
    },
    select: {
      id: true,
      email: true,
      monthlySubmissionCount: true,
      lastSubmissionReset: true,
    },
  });

  if (usersToReset.length === 0) {
    return {
      resetCount: 0,
      message: "No users needed reset",
    };
  }

  await prisma.user.updateMany({
    where: {
      id: {
        in: usersToReset.map((u) => u.id),
      },
    },
    data: {
      monthlySubmissionCount: 0,
      lastSubmissionReset: now,
      submissionLimitNotified: false,
    },
  });

  return {
    resetCount: usersToReset.length,
    message: `Reset ${usersToReset.length} users`,
    users: usersToReset.map((u) => ({
      id: u.id,
      email: u.email,
      previousCount: u.monthlySubmissionCount,
    })),
  };
}

export async function resetUserSubmissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      monthlySubmissionCount: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const previousCount = user.monthlySubmissionCount;

  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlySubmissionCount: 0,
      lastSubmissionReset: new Date(),
      submissionLimitNotified: false,
    },
  });

  return {
    userId: user.id,
    email: user.email,
    previousCount,
    newCount: 0,
    resetDate: new Date(),
  };
}

export async function getResetSchedule() {
  const now = new Date();
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilReset = Math.ceil(
    (nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    currentDate: now,
    nextResetDate: nextReset,
    daysUntilReset,
  };
}

export async function getUsersNeedingReset() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return await prisma.user.findMany({
    where: {
      lastSubmissionReset: {
        lt: firstDayOfMonth,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      subscriptionTier: true,
      monthlySubmissionCount: true,
      lastSubmissionReset: true,
    },
  });
}

export async function forceResetAll() {
  const result = await prisma.user.updateMany({
    data: {
      monthlySubmissionCount: 0,
      lastSubmissionReset: new Date(),
      submissionLimitNotified: false,
    },
  });

  return {
    resetCount: result.count,
    message: `Force reset all ${result.count} users`,
    resetDate: new Date(),
  };
}
