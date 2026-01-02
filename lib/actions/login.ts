// lib/actions/login.ts
"use server";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { config } from "dotenv";

config();

interface LoginState {
  success: boolean;
  message: string;
  redirect?: string;
}

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "EMAIL_NOT_VERIFIED") {
        return {
          success: false,
          message:
            "Please verify your email address. Check your inbox or request a new verification link.",
        };
      }

      if (result.error === "TWO_FACTOR_REQUIRED") {
        return {
          success: true,
          message: "Two-factor authentication required. Redirecting...",
          redirect: "/two-factor",
        };
      }

      if (result.error === "CredentialsSignin") {
        return { success: false, message: "Invalid email or password" };
      }

      return { success: false, message: result.error };
    }

    if (result && !result.error) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { role: true },
      });

      const redirectPath =
        user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard";

      return {
        success: true,
        message: "Login successful",
        redirect: `${process.env.NEXTAUTH_URL}${redirectPath}`,
      };
    }

    return { success: false, message: "Login failed. Please try again." };
  } catch (err) {
    console.error("loginAction error", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "An unknown error occurred",
    };
  }
}
