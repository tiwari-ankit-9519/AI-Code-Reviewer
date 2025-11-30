import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  needsRehash,
} from "@/lib/security/password";
import { checkRateLimit, loginLimiter } from "@/lib/security/rate-limit";
import { passwordSchema } from "@/lib/security/password-validation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
});

const log = (
  level: string,
  message: string,
  data?: Record<string, unknown> | string
) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [AUTH] [${level}] ${message}`, data || "");
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  debug: process.env.NODE_ENV === "development",

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          log("INFO", "Authorization attempt started", {
            email: (credentials?.email as string) || "unknown",
          });

          const { email, password } = loginSchema.parse(credentials);
          const identifier = email.toLowerCase();

          const rateLimit = await checkRateLimit(loginLimiter, identifier);
          if (!rateLimit.success) {
            log("WARN", "Rate limit exceeded", { email: identifier });
            throw new Error("RATE_LIMITED");
          }

          const user = await prisma.user.findUnique({
            where: { email: identifier },
            select: {
              id: true,
              email: true,
              name: true,
              passwordHash: true,
              avatar: true,
              emailVerified: true,
            },
          });

          if (!user) {
            log("WARN", "User not found", { email: identifier });
            return null;
          }

          if (!user.emailVerified) {
            log("WARN", "Email not verified", { email: identifier });
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          const isPasswordValid = await verifyPassword(
            password,
            user.passwordHash
          );
          if (!isPasswordValid) {
            log("WARN", "Invalid password", { email: identifier });
            return null;
          }

          if (await needsRehash(user.passwordHash)) {
            log("INFO", "Rehashing password", { userId: user.id });
            const newHash = await hashPassword(password);
            await prisma.user.update({
              where: { id: user.id },
              data: { passwordHash: newHash },
            });
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { updatedAt: new Date() },
          });

          log("SUCCESS", "User authorized successfully", {
            userId: user.id,
            email: user.email,
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
          };
        } catch (error) {
          if (error instanceof z.ZodError) {
            log("ERROR", "Validation error", JSON.stringify(error.issues));
            return null;
          }

          if (error instanceof Error) {
            if (
              error.message === "EMAIL_NOT_VERIFIED" ||
              error.message === "RATE_LIMITED"
            ) {
              throw error;
            }
          }

          log(
            "ERROR",
            "Authorization error",
            error instanceof Error ? error.message : "Unknown error"
          );
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        log("INFO", "JWT callback - user present", {
          userId: user.id || "unknown",
          email: user.email || "unknown",
        });
        token.id = user.id || "";
        token.email = user.email || "";
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id && token?.email) {
        log("INFO", "Session callback", {
          userId: token.id as string,
          email: token.email as string,
        });
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      } else {
        log(
          "WARN",
          "Session callback - missing token data",
          JSON.stringify(token)
        );
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      log("INFO", "Redirect callback", { url, baseUrl });

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      log("INFO", "SignIn event", {
        userId: user.id || "",
        email: user.email || "",
        isNewUser: isNewUser || false,
      });
    },
    async signOut(message) {
      if ("token" in message && message.token) {
        log("INFO", "SignOut event", {
          userId: (message.token.id as string) || "",
          email: (message.token.email as string) || "",
        });
      } else {
        log("INFO", "SignOut event", "{}");
      }
    },
    async session(message) {
      if ("token" in message && message.token) {
        log("INFO", "Session event", {
          userId: (message.token.id as string) || "",
          email: (message.token.email as string) || "",
        });
      } else {
        log("INFO", "Session event", "{}");
      }
    },
  },

  trustHost: true,
});
