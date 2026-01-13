// prisma/seeds/phase1-tier-config-seed.ts

import { PrismaClient, SubscriptionTier, SupportLevel } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { config } from "dotenv";

config();

const adapter = new PrismaPg(
  new pg.Pool({
    connectionString: process.env.DATABASE_URL!,
  })
);

const prisma = new PrismaClient({
  adapter,
});

const TIER_FILE_SIZES = {
  STARTER: 50 * 1024,
  HERO: 100 * 1024,
  LEGEND: 500 * 1024,
};

const TIER_SUPPORT_LEVELS = {
  STARTER: SupportLevel.COMMUNITY,
  HERO: SupportLevel.PRIORITY,
  LEGEND: SupportLevel.DEDICATED,
};

const TIER_API_ACCESS = {
  STARTER: false,
  HERO: true,
  LEGEND: true,
};

async function main() {
  console.log("🚀 Starting Phase 1 Seed Updates...\n");

  console.log("📊 Step 1: Updating TierLimitConfig...");

  for (const [tier, maxFileSize] of Object.entries(TIER_FILE_SIZES)) {
    try {
      await prisma.tierLimitConfig.upsert({
        where: { tier: tier as SubscriptionTier },
        update: {
          maxFileSize,
        },
        create: {
          tier: tier as SubscriptionTier,
          reviewsPerSession: tier === "STARTER" ? 1 : tier === "HERO" ? 1 : 10,
          coolingPeriodHours: tier === "STARTER" ? 0 : tier === "HERO" ? 24 : 0,
          maxFileSize,
          monthlyReviewLimit: tier === "STARTER" ? 5 : null,
        },
      });

      console.log(`  ✅ ${tier}: ${maxFileSize / 1024}KB`);
    } catch (error) {
      console.error(`  ❌ Error updating ${tier}:`, error);
    }
  }

  console.log("\n📊 Step 2: Updating existing users...");

  const starterUpdate = await prisma.user.updateMany({
    where: {
      subscriptionTier: SubscriptionTier.STARTER,
    },
    data: {
      maxFileSize: TIER_FILE_SIZES.STARTER,
      apiAccessEnabled: TIER_API_ACCESS.STARTER,
      supportLevel: TIER_SUPPORT_LEVELS.STARTER,
    },
  });
  console.log(`  ✅ Updated ${starterUpdate.count} STARTER users`);

  const heroUpdate = await prisma.user.updateMany({
    where: {
      subscriptionTier: SubscriptionTier.HERO,
    },
    data: {
      maxFileSize: TIER_FILE_SIZES.HERO,
      apiAccessEnabled: TIER_API_ACCESS.HERO,
      supportLevel: TIER_SUPPORT_LEVELS.HERO,
    },
  });
  console.log(`  ✅ Updated ${heroUpdate.count} HERO users`);

  const legendUpdate = await prisma.user.updateMany({
    where: {
      subscriptionTier: SubscriptionTier.LEGEND,
    },
    data: {
      maxFileSize: TIER_FILE_SIZES.LEGEND,
      apiAccessEnabled: TIER_API_ACCESS.LEGEND,
      supportLevel: TIER_SUPPORT_LEVELS.LEGEND,
    },
  });
  console.log(`  ✅ Updated ${legendUpdate.count} LEGEND users`);

  console.log("\n📊 Step 3: Updating API keys...");

  const apiKeyUpdate = await prisma.apiKey.updateMany({
    where: {},
    data: {
      isActive: true,
    },
  });
  console.log(`  ✅ Updated ${apiKeyUpdate.count} API keys to active status`);

  console.log("\n📊 Step 4: Verifying updates...");

  const stats = await Promise.all([
    prisma.user.groupBy({
      by: ["subscriptionTier", "supportLevel", "apiAccessEnabled"],
      _count: true,
    }),
    prisma.tierLimitConfig.findMany({
      select: {
        tier: true,
        maxFileSize: true,
        reviewsPerSession: true,
        coolingPeriodHours: true,
      },
    }),
  ]);

  console.log("\n📈 User Distribution:");
  stats[0].forEach((stat) => {
    console.log(
      `  ${stat.subscriptionTier}: ${stat._count} users - Support: ${stat.supportLevel}, API: ${stat.apiAccessEnabled}`
    );
  });

  console.log("\n📈 Tier Configurations:");
  stats[1].forEach((config) => {
    console.log(
      `  ${config.tier}: ${config.maxFileSize / 1024}KB file size, ${
        config.reviewsPerSession
      } reviews/session, ${config.coolingPeriodHours}h cooling`
    );
  });

  console.log("\n✅ Phase 1 Seed Updates Complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
