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

interface TierConfigData {
  reviewsPerSession: number;
  coolingPeriodHours: number;
  monthlyReviewLimit: number | null;
}

const DEFAULT_TIER_CONFIGS: Record<SubscriptionTier, TierConfigData> = {
  STARTER: {
    reviewsPerSession: 5,
    coolingPeriodHours: 0,
    monthlyReviewLimit: 5,
  },
  HERO: {
    reviewsPerSession: 20,
    coolingPeriodHours: 24,
    monthlyReviewLimit: null,
  },
  LEGEND: {
    reviewsPerSession: 50,
    coolingPeriodHours: 0,
    monthlyReviewLimit: null,
  },
};

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined in .env file");
    process.exit(1);
  }

  try {
    await prisma.$connect();
    console.log("✅ Connected to database");
    console.log("Initializing tier configurations...\n");

    const tiers: SubscriptionTier[] = ["STARTER", "HERO", "LEGEND"];

    for (const tier of tiers) {
      const configData = DEFAULT_TIER_CONFIGS[tier];

      const existing = await prisma.tierLimitConfig.findUnique({
        where: { tier },
      });

      if (existing) {
        await prisma.tierLimitConfig.update({
          where: { tier },
          data: configData,
        });
        console.log(`✅ Updated config for ${tier}`);
        console.log(`   Reviews per session: ${configData.reviewsPerSession}`);
        console.log(`   Cooling period: ${configData.coolingPeriodHours}h`);
        console.log(
          `   Monthly limit: ${configData.monthlyReviewLimit || "∞"}\n`
        );
      } else {
        await prisma.tierLimitConfig.create({
          data: {
            tier,
            ...configData,
          },
        });
        console.log(`✅ Created config for ${tier}`);
        console.log(`   Reviews per session: ${configData.reviewsPerSession}`);
        console.log(`   Cooling period: ${configData.coolingPeriodHours}h`);
        console.log(
          `   Monthly limit: ${configData.monthlyReviewLimit || "∞"}\n`
        );
      }
    }

    console.log("✅ Tier configurations initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing tier configs:", error);
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
