import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { token, identifier } = await request.json(); // Need both!

    if (!token || !identifier) {
      return NextResponse.json(
        { error: "Token and identifier (email) are required" },
        { status: 400 }
      );
    }

    // Use findFirst() since no single-field unique index exists
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token,
        expires: { gt: new Date() }, // Check expiration upfront
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Verify user's email
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete using compound key
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);

    if (error instanceof Error && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
