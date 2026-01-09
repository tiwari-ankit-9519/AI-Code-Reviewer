// lib/actions/user-settings.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/security/password";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Update user profile (name and email)
export async function updateProfile(data: { name: string; email: string }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if email is already taken by another user
    if (data.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return { success: false, error: "Email already in use" };
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        email: data.email,
        // If email changed, mark as unverified
        ...(data.email !== session.user.email && { emailVerified: null }),
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

// Change user password
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "User not found or no password set" };
    }

    // Verify current password using Argon2
    const isValidPassword = await verifyPassword(
      data.currentPassword,
      user.passwordHash
    );

    if (!isValidPassword) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password using Argon2
    const hashedPassword = await hashPassword(data.newPassword);

    // Update password and passwordChangedAt
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Failed to change password" };
  }
}

// Update notification settings
export async function updateNotificationSettings(data: {
  emailNotifications: boolean;
  marketingEmails: boolean;
  submissionUpdates: boolean;
  securityAlerts: boolean;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Store notification preferences in the user table
    // When you add the fields to the User model, this will work
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailNotifications: data.emailNotifications,
        marketingEmails: data.marketingEmails,
        submissionUpdates: data.submissionUpdates,
        securityAlerts: data.securityAlerts,
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return { success: false, error: "Failed to update notification settings" };
  }
}

// Delete user account
export async function deleteAccount() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete user's data in order (due to foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // Delete user's submissions
      await tx.codeSubmission.deleteMany({
        where: { userId: session.user.id },
      });

      // Delete user's subscription history
      await tx.subscriptionHistory.deleteMany({
        where: { userId: session.user.id },
      });

      // Delete user's verification tokens
      await tx.verificationToken.deleteMany({
        where: { identifier: session.user.email! },
      });

      // Delete user's sessions
      await tx.session.deleteMany({
        where: { userId: session.user.id },
      });

      // Delete user's accounts (OAuth connections)
      await tx.account.deleteMany({
        where: { userId: session.user.id },
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: session.user.id },
      });
    });

    // Redirect to home page after deletion
    redirect("/");
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}
