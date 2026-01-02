// lib/auth-helper.ts
"use server";

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }

  return { error: null, session };
}

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      ),
      session: null,
    };
  }

  return { error: null, session };
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}
