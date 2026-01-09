"use server";

import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email/forgot-password-email";

export async function forgotPasswordAction(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        error:
          "If an account exists with this email, you will receive a password reset link.",
      };
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);

    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
      create: {
        identifier: email,
        token: token,
        expires: expires,
      },
      update: {
        token: token,
        expires: expires,
      },
    });

    const resetUrl = `${
      process.env.AUTH_URL
    }/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail(email, user.name, resetUrl);

    return {
      success: true,
      message: "Password reset link sent! Check your email.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      error: "An error occurred. Please try again.",
    };
  }
}
