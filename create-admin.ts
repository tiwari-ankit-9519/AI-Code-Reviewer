import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hashPassword } from "@/lib/security/password";
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

async function createAdminUser() {
  const email = "tiwari.ankit3105@gmail.com";
  const name = "Ankit Tiwari";
  const password = "Admin@123456";

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not defined in .env file");
    process.exit(1);
  }

  try {
    await prisma.$connect();
    console.log("✅ Connected to database");

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("User already exists. Updating to ADMIN role...");

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: "ADMIN",
          subscriptionTier: "STARTER",
          subscriptionStatus: "ACTIVE",
          stripeCustomerId: null,
        },
      });

      console.log("✅ User updated to ADMIN role successfully!");
      console.log("User ID:", updatedUser.id);
      console.log("Email:", updatedUser.email);
      console.log("Role:", updatedUser.role);
      console.log("Tier:", updatedUser.subscriptionTier);
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "ADMIN",
        emailVerified: new Date(),
        subscriptionTier: "STARTER",
        subscriptionStatus: "ACTIVE",
        subscriptionStartDate: new Date(),
        isTrialUsed: true,
        stripeCustomerId: null,
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Password:", password);
    console.log("Role:", user.role);
    console.log("Subscription:", user.subscriptionTier);
    console.log(
      "\n⚠️  IMPORTANT: Please change your password after first login!"
    );
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log("✅ Disconnected from database");
  }
}

createAdminUser().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
