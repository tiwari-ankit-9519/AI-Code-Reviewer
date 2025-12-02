import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Simple production logging
const log = (
  level: string,
  message: string,
  data?: Record<string, unknown>
) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [MIDDLEWARE] [${level}] ${message}`, data || "");
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  log("INFO", "Middleware invoked", {
    path,
    method: request.method,
    origin: request.headers.get("origin"),
  });

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    log("INFO", "Token retrieved", {
      path,
      hasToken: !!token,
      userId: token?.id || "none",
      email: token?.email || "none",
    });

    const isAuthPage =
      path.startsWith("/login") ||
      path.startsWith("/register") ||
      path.startsWith("/verify-email") ||
      path.startsWith("/forgot-password") ||
      path.startsWith("/resend-verification");

    const isProtectedRoute =
      path.startsWith("/dashboard") ||
      path.startsWith("/api/submissions") ||
      path.startsWith("/api/profile");

    // Protected routes without token -> redirect to login
    if (isProtectedRoute && !token) {
      log(
        "WARN",
        "Protected route accessed without token, redirecting to login",
        { path }
      );
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }

    // Auth pages with token -> redirect to dashboard
    if (isAuthPage && token) {
      log("INFO", "Auth page accessed with token, redirecting to dashboard", {
        path,
      });
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    log("INFO", "Middleware allowing request", { path });
    return NextResponse.next();
  } catch (error) {
    log("ERROR", "Middleware error", {
      path,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/submissions/:path*",
    "/api/profile/:path*",
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/resend-verification",
  ],
  runtime: "nodejs",
};
