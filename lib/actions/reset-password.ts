"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/security/password";

export async function resetPasswordAction(
  token: string,
  email: string,
  newPassword: string
) {
  try {
    if (!token || !email || !newPassword) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
    });

    if (!verificationToken) {
      return {
        success: false,
        error: "Invalid or expired reset link",
      };
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token: token,
          },
        },
      });
      return {
        success: false,
        error: "Reset link has expired. Please request a new one.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
    });

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: "An error occurred. Please try again.",
    };
  }
}
