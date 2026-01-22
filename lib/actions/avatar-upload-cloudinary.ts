// lib/actions/avatar-upload-cloudinary.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, and WebP are allowed",
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "File too large. Maximum size is 5MB",
      };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get old avatar to delete from Cloudinary
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });

    // Delete old avatar from Cloudinary if exists
    if (user?.avatar) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = user.avatar.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split(".")[0];

        if (publicId && urlParts.includes("cloudinary.com")) {
          await cloudinary.uploader.destroy(`avatars/${publicId}`);
        }
      } catch (error) {
        console.error("Failed to delete old avatar from Cloudinary:", error);
      }
    }

    // Upload to Cloudinary with proper typing
    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "avatars",
              public_id: `${session.user.id}-${Date.now()}`,
              transformation: [
                { width: 400, height: 400, crop: "fill", gravity: "face" },
                { quality: "auto", fetch_format: "auto" },
              ],
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else if (result) {
                resolve(result);
              } else {
                reject(new Error("Upload failed - no result returned"));
              }
            },
          )
          .end(buffer);
      },
    );

    // Update database with Cloudinary URL
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: uploadResult.secure_url },
    });

    revalidatePath("/dashboard/settings");
    return { success: true, avatarUrl: uploadResult.secure_url };
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

    // Delete from Cloudinary if exists
    if (user?.avatar) {
      try {
        const urlParts = user.avatar.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split(".")[0];

        if (publicId && urlParts.includes("cloudinary.com")) {
          await cloudinary.uploader.destroy(`avatars/${publicId}`);
        }
      } catch (error) {
        console.error("Failed to delete avatar from Cloudinary:", error);
      }
    }

    // Update database
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
