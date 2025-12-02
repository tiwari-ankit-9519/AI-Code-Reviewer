import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isLoggedIn = !!req.auth;

  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/verify-email");

  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/api/profile") ||
    path.startsWith("/api/submissions");

  // Unauthenticated user trying to access protected area
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access login/register pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).)",
    "/(api|trpc)(.*)",
    "/api/graphql",
  ],
  runtime: "nodejs",
};
