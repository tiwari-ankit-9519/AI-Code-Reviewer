"use server";

import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendTrialEndingEmail(userId: string, trialEndsAt: Date) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const hoursRemaining = Math.ceil(
    (trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60)
  );

  const html = `
    <html>
    <body style="margin:0; padding:0; background:#0a0e27; font-family:Arial, sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27; padding:40px 0">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1f3a; border-radius:12px; border:2px solid #fbbf24">
              <tr>
                <td align="center" style="padding:40px 40px 20px 40px">
                  <div style="width:80px; height:80px; background:linear-gradient(135deg, #fbbf24, #f59e0b); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px">
                    <span style="font-size:40px">⏰</span>
                  </div>
                  <h1 style="font-size:28px; color:#fbbf24; margin:0 0 12px 0; font-weight:900">Your Trial is Ending Soon!</h1>
                  <p style="font-size:16px; color:#e5e7eb; margin:0 0 8px 0">Hi ${user.name},</p>
                  <p style="font-size:16px; color:#e5e7eb; margin:0 0 24px 0">
                    Your 7-day Hero trial ends in <strong style="color:#fbbf24">${hoursRemaining} hours</strong>.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="padding:0 40px 30px 40px">
                  <div style="background:#0a0e27; border-radius:8px; padding:20px; margin-bottom:20px">
                    <h2 style="font-size:18px; color:#fbbf24; margin:0 0 12px 0">What You'll Lose:</h2>
                    <ul style="margin:0; padding:0; list-style:none">
                      <li style="color:#9ca3af; margin-bottom:8px; padding-left:24px; position:relative">
                        <span style="position:absolute; left:0">❌</span> Unlimited code reviews
                      </li>
                      <li style="color:#9ca3af; margin-bottom:8px; padding-left:24px; position:relative">
                        <span style="position:absolute; left:0">❌</span> Advanced security analysis
                      </li>
                      <li style="color:#9ca3af; margin-bottom:8px; padding-left:24px; position:relative">
                        <span style="position:absolute; left:0">❌</span> Priority support
                      </li>
                      <li style="color:#9ca3af; padding-left:24px; position:relative">
                        <span style="position:absolute; left:0">❌</span> Access to all features
                      </li>
                    </ul>
                  </div>

                  <div style="background:linear-gradient(135deg, #7c3aed, #a855f7); border-radius:8px; padding:20px; margin-bottom:24px">
                    <h2 style="font-size:18px; color:#ffffff; margin:0 0 12px 0">Continue Your Journey for ₹2999/month</h2>
                    <ul style="margin:0; padding:0; list-style:none">
                      <li style="color:#ffffff; margin-bottom:8px; padding-left:24px; position:relative">
                        <span style="position:absolute; left:0">✓</span> Unlimited submissions
                      </li>
                      <li style="color:#ffffff; margin-bottom:8px; padding-left:24px; position:relative">
                        <span style="position:absolute; left:0">✓</span> Advanced AI analysis
                      </li>
                      <li style="color:#ffffff; padding-left:24px; position:relative">
                        <span style="position:absolute; left:0">✓</span> Cancel anytime
                      </li>
                    </ul>
                  </div>

                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto">
                    <tr>
                      <td align="center" style="border-radius:8px; background:linear-gradient(135deg, #fbbf24, #f59e0b)">
                        <a href="${process.env.NEXTAUTH_URL}/pricing" 
                          style="display:inline-block; padding:16px 40px; color:#0a0e27; text-decoration:none; font-size:18px; font-weight:900; border-radius:8px">
                          UPGRADE TO HERO
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 40px; background:#0a0e27; border-radius:0 0 12px 12px">
                  <p style="margin:0; font-size:12px; color:#6b7280; text-align:center">
                    If you don't upgrade, you'll be moved to the Starter plan (5 reviews/month)
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `⏰ Your Hero Trial Ends in ${hoursRemaining} Hours!`,
    html,
  });

  return { success: true, email: user.email };
}

export async function sendTrialExpiredEmail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const html = `
    <html>
    <body style="margin:0; padding:0; background:#0a0e27; font-family:Arial, sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27; padding:40px 0">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1f3a; border-radius:12px; border:2px solid #6b7280">
              <tr>
                <td align="center" style="padding:40px 40px 20px 40px">
                  <div style="width:80px; height:80px; background:#374151; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px">
                    <span style="font-size:40px">📊</span>
                  </div>
                  <h1 style="font-size:28px; color:#e5e7eb; margin:0 0 12px 0; font-weight:900">Your Trial Has Ended</h1>
                  <p style="font-size:16px; color:#e5e7eb; margin:0 0 8px 0">Hi ${user.name},</p>
                  <p style="font-size:16px; color:#e5e7eb; margin:0 0 24px 0">
                    Your 7-day Hero trial has ended. You've been moved to the <strong>Starter plan</strong>.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="padding:0 40px 30px 40px">
                  <div style="background:#0a0e27; border-radius:8px; padding:20px; margin-bottom:20px">
                    <h2 style="font-size:18px; color:#e5e7eb; margin:0 0 12px 0">Your Starter Plan:</h2>
                    <ul style="margin:0; padding:0; list-style:none">
                      <li style="color:#9ca3af; margin-bottom:8px; padding-left:24px; position:relative">
                        <span style="position:absolute; left:0">✓</span> 5 code reviews per month
                      </li>
                      <li style="color:#9ca3af; margin-bottom:8px; padding-left:24px; position:relative">
                        <span style="position:absolute; left:0">✓</span> Basic security checks
                      </li>
                      <li style="color:#9ca3af; padding-left:24px; position:relative">
                        <span style="position:absolute; left:0">✓</span> Community support
                      </li>
                    </ul>
                  </div>

                  <div style="background:linear-gradient(135deg, #7c3aed, #a855f7); border-radius:8px; padding:20px; margin-bottom:24px">
                    <h2 style="font-size:18px; color:#ffffff; margin:0 0 12px 0">Want More? Upgrade to Hero</h2>
                    <p style="color:#ffffff; margin:0 0 12px 0">Get unlimited reviews for just ₹2999/month</p>
                    <ul style="margin:0; padding:0; list-style:none">
                      <li style="color:#ffffff; margin-bottom:8px; padding-left:24px; position:relative">
                        <span style="position:absolute; left:0">🚀</span> Unlimited submissions
                      </li>
                      <li style="color:#ffffff; margin-bottom:8px; padding-left:24px; position:relative">
                        <span style="position:absolute; left:0">🔒</span> Advanced security analysis
                      </li>
                      <li style="color:#ffffff; padding-left:24px; position:relative">
                        <span style="position:absolute; left:0">⚡</span> Priority support
                      </li>
                    </ul>
                  </div>

                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto">
                    <tr>
                      <td align="center" style="border-radius:8px; background:linear-gradient(135deg, #fbbf24, #f59e0b)">
                        <a href="${process.env.NEXTAUTH_URL}/pricing" 
                          style="display:inline-block; padding:16px 40px; color:#0a0e27; text-decoration:none; font-size:18px; font-weight:900; border-radius:8px">
                          UPGRADE NOW
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 40px; background:#0a0e27; border-radius:0 0 12px 12px">
                  <p style="margin:0; font-size:12px; color:#6b7280; text-align:center">
                    Questions? Reply to this email or visit our support page
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Your Hero Trial Has Ended - Welcome to Starter",
    html,
  });

  return { success: true, email: user.email };
}
