"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function updateProfile(data: { name: string; email: string }) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const validated = updateProfileSchema.parse(data);

  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email },
  });

  if (existingUser && existingUser.id !== session.user.id) {
    throw new Error("Email already in use");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: validated.name,
      email: validated.email.toLowerCase(),
      updatedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/settings");

  return { success: true };
}

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const validated = updatePasswordSchema.parse(data);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isValid = await verifyPassword(
    validated.currentPassword,
    user.passwordHash
  );

  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  const newHash = await hashPassword(validated.newPassword);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      passwordHash: newHash,
      updatedAt: new Date(),
    },
  });

  return { success: true };
}

export async function deleteAccount() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.$transaction([
    prisma.issue.deleteMany({
      where: { submission: { userId: session.user.id } },
    }),
    prisma.analysisResult.deleteMany({
      where: { submission: { userId: session.user.id } },
    }),
    prisma.codeSubmission.deleteMany({
      where: { userId: session.user.id },
    }),
    prisma.user.delete({
      where: { id: session.user.id },
    }),
  ]);

  return { success: true };
}

export async function getUserProfile() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
      emailVerified: true,
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
