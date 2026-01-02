"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/security/password";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized - No session");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    throw new Error("Unauthorized - Admin access required");
  }

  return session;
}

function generateSecurePassword(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function updateLeadStatus(leadId: string, status: string) {
  await requireAdmin();

  await prisma.enterpriseLead.update({
    where: { id: leadId },
    data: { status },
  });

  revalidatePath("/dashboard/admin/leads");
  revalidatePath(`/dashboard/admin/leads/${leadId}`);
  return { success: true };
}

export async function updateLeadNotes(leadId: string, notes: string) {
  await requireAdmin();

  await prisma.enterpriseLead.update({
    where: { id: leadId },
    data: { notes },
  });

  revalidatePath(`/dashboard/admin/leads/${leadId}`);
  return { success: true };
}

export async function convertLeadToLegend(leadId: string, email: string) {
  await requireAdmin();

  let user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    const tempPassword = generateSecurePassword();
    const passwordHash = await hashPassword(tempPassword);

    user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: email.split("@")[0],
        passwordHash,
        emailVerified: new Date(),
        subscriptionTier: "LEGEND",
        subscriptionStatus: "ACTIVE",
        isTrialUsed: true,
        subscriptionStartDate: new Date(),
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Welcome to Legend Tier - AI Code Reviewer",
      html: `
        <html>
        <body style="margin:0; padding:0; background:#0a0e27; font-family:Arial, sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27; padding:40px 0">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1f3a; border-radius:12px; border:2px solid #fbbf24">
                  <tr>
                    <td align="center" style="padding:40px; background:linear-gradient(135deg, #fbbf24, #f59e0b); border-radius:12px 12px 0 0">
                      <h1 style="font-size:36px; color:#0a0e27; margin:0; font-weight:900">🎉 Welcome to Legend!</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding:40px">
                      <p style="color:#e5e7eb; font-size:18px; line-height:1.6; margin:0 0 20px 0">
                        Your Legend tier account has been activated!
                      </p>

                      <div style="background:#0a0e27; border-radius:8px; padding:20px; margin:20px 0">
                        <p style="color:#fbbf24; font-weight:bold; margin:0 0 10px 0">Login Credentials:</p>
                        <p style="color:#e5e7eb; margin:5px 0">
                          <strong>Email:</strong> ${email}
                        </p>
                        <p style="color:#e5e7eb; margin:5px 0">
                          <strong>Temporary Password:</strong> <code style="background:#374151; padding:4px 8px; border-radius:4px; color:#fbbf24">${tempPassword}</code>
                        </p>
                      </div>

                      <p style="color:#f59e0b; font-size:14px; margin:20px 0">
                        ⚠️ Please change your password after first login
                      </p>

                      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:30px auto 0">
                        <tr>
                          <td align="center" style="border-radius:8px; background:linear-gradient(135deg, #7c3aed, #a855f7)">
                            <a href="${process.env.NEXTAUTH_URL}/auth/signin" 
                              style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:900; border-radius:8px">
                              LOGIN NOW
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: "LEGEND",
        subscriptionStatus: "ACTIVE",
        monthlySubmissionCount: 0,
        subscriptionStartDate: new Date(),
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Upgraded to Legend Tier - AI Code Reviewer",
      html: `
        <html>
        <body style="margin:0; padding:0; background:#0a0e27; font-family:Arial, sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27; padding:40px 0">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1f3a; border-radius:12px; border:2px solid #fbbf24">
                  <tr>
                    <td align="center" style="padding:40px; background:linear-gradient(135deg, #fbbf24, #f59e0b); border-radius:12px 12px 0 0">
                      <h1 style="font-size:36px; color:#0a0e27; margin:0; font-weight:900">⬆️ Upgraded to Legend!</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding:40px">
                      <p style="color:#e5e7eb; font-size:18px; line-height:1.6; margin:0 0 20px 0">
                        Your account has been upgraded to <strong style="color:#fbbf24">Legend tier</strong>!
                      </p>

                      <div style="background:#0a0e27; border-radius:8px; padding:20px; margin:20px 0">
                        <p style="color:#fbbf24; font-weight:bold; margin:0 0 15px 0">✨ What's New:</p>
                        <ul style="color:#e5e7eb; margin:0; padding-left:20px">
                          <li style="margin:8px 0">Unlimited code submissions</li>
                          <li style="margin:8px 0">Priority support</li>
                          <li style="margin:8px 0">Advanced features</li>
                          <li style="margin:8px 0">No limits whatsoever</li>
                        </ul>
                      </div>

                      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:30px auto 0">
                        <tr>
                          <td align="center" style="border-radius:8px; background:linear-gradient(135deg, #7c3aed, #a855f7)">
                            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
                              style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:900; border-radius:8px">
                              START USING LEGEND
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  }

  await prisma.$transaction([
    prisma.enterpriseLead.update({
      where: { id: leadId },
      data: {
        status: "CONVERTED",
        convertedAt: new Date(),
      },
    }),
    prisma.subscriptionHistory.create({
      data: {
        userId: user.id,
        action: "SUBSCRIPTION_STARTED",
        fromTier: "STARTER",
        toTier: "LEGEND",
        reason: `converted_from_enterprise_lead_${leadId}`,
      },
    }),
  ]);

  revalidatePath("/dashboard/admin/leads");
  revalidatePath(`/dashboard/admin/leads/${leadId}`);
  revalidatePath("/dashboard/admin/users");

  return { success: true, userId: user.id };
}
