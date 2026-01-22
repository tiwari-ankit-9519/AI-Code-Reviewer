"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function uploadAvatar(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const file = formData.get("avatar") as File;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, and WebP are allowed",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "File too large. Maximum size is 5MB",
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), "public", "uploads", "avatars");
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `${session.user.id}-${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });

    if (user?.avatar) {
      try {
        const oldPath = join(process.cwd(), "public", user.avatar);
        if (existsSync(oldPath)) {
          await unlink(oldPath);
        }
      } catch (error) {
        console.error("Failed to delete old avatar:", error);
      }
    }

    const avatarUrl = `/uploads/avatars/${filename}`;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarUrl },
    });

    revalidatePath("/dashboard/settings");
    return { success: true, avatarUrl };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return { success: false, error: "Failed to upload avatar" };
  }
}

export async function removeAvatar() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });

    if (user?.avatar) {
      try {
        const filepath = join(process.cwd(), "public", user.avatar);
        if (existsSync(filepath)) {
          await unlink(filepath);
        }
      } catch (error) {
        console.error("Failed to delete avatar file:", error);
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: null },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error removing avatar:", error);
    return { success: false, error: "Failed to remove avatar" };
  }
}
