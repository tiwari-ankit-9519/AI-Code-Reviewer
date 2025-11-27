import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/security/password";
import {
  passwordSchema,
  isPasswordCompromised,
  calculatePasswordStrength,
} from "@/lib/security/password-validation";
import { checkRateLimit, registerLimiter } from "@/lib/security/rate-limit";
import { sendVerificationEmail } from "@/lib/email/send-verification";
import { z } from "zod";
import crypto from "crypto";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  password: passwordSchema,
});

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateLimit = await checkRateLimit(registerLimiter, ip);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many registration attempts. Please try again later.",
          retryAfter: rateLimit.reset,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    if (await isPasswordCompromised(password)) {
      return NextResponse.json(
        {
          error:
            "This password has been compromised in data breaches. Please choose a different password.",
        },
        { status: 400 }
      );
    }

    const strength = calculatePasswordStrength(password);
    if (strength < 2) {
      return NextResponse.json(
        { error: "Password is too weak. Please use a stronger password." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: tokenExpiry,
      },
    });

    await sendVerificationEmail(user.email, user.name, verificationToken);

    return NextResponse.json(
      {
        message:
          "Account created successfully. Check your email to verify your account.",
        user,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
