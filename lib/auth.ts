// lib/auth.ts
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
          const { email, password } = loginSchema.parse(credentials);
          const identifier = email.toLowerCase();

          const rateLimit = await checkRateLimit(loginLimiter, identifier);
          if (!rateLimit.success) {
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
              role: true,
            },
          });

          if (!user) {
            return null;
          }

          if (!user.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          const isPasswordValid = await verifyPassword(
            password,
            user.passwordHash
          );
          if (!isPasswordValid) {
            return null;
          }

          if (await needsRehash(user.passwordHash)) {
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

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
            role: user.role,
          };
        } catch (error) {
          if (error instanceof z.ZodError) {
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
        token.id = user.id || "";
        token.email = user.email || "";
        token.role = user.role || "USER";
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id && token?.email) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          role: token.role as string,
        };
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return baseUrl + url;
      return url;
    },
  },

  trustHost: true,
});
