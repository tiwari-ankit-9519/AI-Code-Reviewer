import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hashPassword } from "./lib/security/password";
import { config } from "dotenv";

config();

async function createAdminUser() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const email = "tiwari.ankit3105@gmail.com";
    const name = "Ankit Tiwari";
    const password = "Admin@123456";

    console.log("Creating admin user...");

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("User already exists! Updating to ADMIN role...");

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: "ADMIN",
          emailVerified: new Date(),
        },
      });

      console.log("✅ User updated successfully!");
      console.log("Email:", updatedUser.email);
      console.log("Role:", updatedUser.role);
      console.log("Email Verified:", updatedUser.emailVerified);
    } else {
      console.log("Hashing password using lib/security/password...");
      const passwordHash = await hashPassword(password);

      console.log("Creating user in database...");
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: "ADMIN",
          emailVerified: new Date(),
          subscriptionTier: "LEGEND",
          subscriptionStatus: "ACTIVE",
          isTrialUsed: true,
        },
      });

      console.log("✅ Admin user created successfully!");
      console.log("Email:", user.email);
      console.log("Name:", user.name);
      console.log("Role:", user.role);
      console.log("Subscription:", user.subscriptionTier);
      console.log("\n🔐 Login Credentials:");
      console.log("Email:", email);
      console.log("Password:", password);
      console.log("\n⚠️  Please change the password after first login!");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createAdminUser()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
