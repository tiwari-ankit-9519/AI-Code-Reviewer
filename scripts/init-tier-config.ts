// scripts/update-user-check-levels.ts

import { PrismaClient, SubscriptionTier } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const adapter = new PrismaPg(
  new pg.Pool({
    connectionString: process.env.DATABASE_URL!,
  })
);

const prisma = new PrismaClient({
  adapter,
});

interface CheckLevels {
  security: "BASIC" | "ADVANCED" | "ENTERPRISE";
  performance: "BASIC" | "ADVANCED" | "ENTERPRISE";
}

const TIER_CHECK_LEVELS: Record<SubscriptionTier, CheckLevels> = {
  STARTER: { security: "BASIC", performance: "BASIC" },
  HERO: { security: "ADVANCED", performance: "ADVANCED" },
  LEGEND: { security: "ENTERPRISE", performance: "ENTERPRISE" },
};

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined in .env file");
    process.exit(1);
  }

  try {
    await prisma.$connect();
    console.log("✅ Connected to database");
    console.log("Updating user check levels...\n");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
      },
    });

    console.log(`Found ${users.length} users to update\n`);

    let updatedCount = 0;

    for (const user of users) {
      const levels =
        TIER_CHECK_LEVELS[user.subscriptionTier] || TIER_CHECK_LEVELS.STARTER;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          securityCheckLevel: levels.security,
          performanceCheckLevel: levels.performance,
        },
      });

      console.log(`✅ Updated ${user.email}`);
      console.log(`   Tier: ${user.subscriptionTier}`);
      console.log(`   Security Level: ${levels.security}`);
      console.log(`   Performance Level: ${levels.performance}\n`);

      updatedCount++;
    }

    console.log(`✅ Successfully updated ${updatedCount} users!`);
  } catch (error) {
    console.error("❌ Error updating user check levels:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log("✅ Disconnected from database");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
