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
    (trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60),
  );

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Your Trial is Ending Soon</title>
      <style>
        body, table, td, a { 
          -webkit-text-size-adjust: 100%; 
          -ms-text-size-adjust: 100%; 
        }
        table, td { 
          mso-table-lspace: 0pt; 
          mso-table-rspace: 0pt; 
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f9fafb;
        }
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; margin: 0 !important; }
          .mobile-padding { padding: 24px !important; }
          .mobile-title { font-size: 24px !important; }
          .button { padding: 14px 28px !important; font-size: 16px !important; }
        }
        .button {
          display: inline-block;
          padding: 16px 32px;
          background-color: #f59e0b;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb;">
        <tr>
          <td style="padding: 40px 20px;">
            <center>
              <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                    <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                      <span style="font-size: 40px;">⏰</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.2;" class="mobile-title">
                      Your Trial is Ending Soon!
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td class="mobile-padding" style="padding: 40px;">
                    <p style="margin: 0 0 8px 0; color: #111827; font-size: 18px; font-weight: 600;">
                      Hi ${user.name},
                    </p>
                    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Your 7-day Hero trial ends in <strong style="color: #f59e0b;">${hoursRemaining} hours</strong>. Don't lose access to unlimited code reviews and advanced features!
                    </p>

                    <!-- Warning Notice -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding-right: 12px; vertical-align: top;">
                            <span style="font-size: 20px;">⚠️</span>
                          </td>
                          <td>
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5; font-weight: 600;">
                              After your trial ends, you'll be moved to the Starter plan with only 5 reviews per month.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- What You'll Lose -->
                    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                      <h2 style="margin: 0 0 16px 0; color: #991b1b; font-size: 16px; font-weight: 600;">
                        What You'll Lose:
                      </h2>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding-right: 8px; vertical-align: top;">
                                  <span style="color: #dc2626;">✗</span>
                                </td>
                                <td style="color: #7f1d1d; font-size: 14px;">Unlimited code reviews</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding-right: 8px; vertical-align: top;">
                                  <span style="color: #dc2626;">✗</span>
                                </td>
                                <td style="color: #7f1d1d; font-size: 14px;">Advanced security analysis</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding-right: 8px; vertical-align: top;">
                                  <span style="color: #dc2626;">✗</span>
                                </td>
                                <td style="color: #7f1d1d; font-size: 14px;">Priority support</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding-right: 8px; vertical-align: top;">
                                  <span style="color: #dc2626;">✗</span>
                                </td>
                                <td style="color: #7f1d1d; font-size: 14px;">Access to all premium features</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Continue Your Journey -->
                    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                      <h2 style="margin: 0 0 8px 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                        Continue Your Journey
                      </h2>
                      <p style="margin: 0 0 16px 0; color: #e0e7ff; font-size: 16px;">
                        Keep unlimited reviews for just ₹2,999/month
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding-right: 8px; vertical-align: top;">
                                  <span style="color: #ffffff;">✓</span>
                                </td>
                                <td style="color: #ffffff; font-size: 14px;">Unlimited submissions</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding-right: 8px; vertical-align: top;">
                                  <span style="color: #ffffff;">✓</span>
                                </td>
                                <td style="color: #ffffff; font-size: 14px;">Advanced AI analysis</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding-right: 8px; vertical-align: top;">
                                  <span style="color: #ffffff;">✓</span>
                                </td>
                                <td style="color: #ffffff; font-size: 14px;">Cancel anytime, no commitment</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- CTA Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="text-align: center; padding: 8px 0;">
                          <a href="${process.env.NEXTAUTH_URL}/pricing" class="button" style="background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                            Upgrade to Hero Now
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 40px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      If you don't upgrade, you'll automatically move to the Starter plan (5 reviews/month)
                    </p>
                  </td>
                </tr>

              </table>
            </center>
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
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Your Trial Has Ended</title>
      <style>
        body, table, td, a { 
          -webkit-text-size-adjust: 100%; 
          -ms-text-size-adjust: 100%; 
        }
        table, td { 
          mso-table-lspace: 0pt; 
          mso-table-rspace: 0pt; 
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f9fafb;
        }
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; margin: 0 !important; }
          .mobile-padding { padding: 24px !important; }
          .mobile-title { font-size: 24px !important; }
          .button { padding: 14px 28px !important; font-size: 16px !important; }
        }
        .button {
          display: inline-block;
          padding: 16px 32px;
          background-color: #6366f1;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb;">
        <tr>
          <td style="padding: 40px 20px;">
            <center>
              <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                    <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                      <span style="font-size: 40px;">📊</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.2;" class="mobile-title">
                      Your Trial Has Ended
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td class="mobile-padding" style="padding: 40px;">
                    <p style="margin: 0 0 8px 0; color: #111827; font-size: 18px; font-weight: 600;">
                      Hi ${user.name},
                    </p>
                    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Your 7-day Hero trial has ended. You've been moved to the <strong>Starter plan</strong>, but you can upgrade anytime to get unlimited reviews back!
                    </p>

                    <!-- Info Notice -->
                    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding-right: 12px; vertical-align: top;">
                            <span style="font-size: 20px;">ℹ️</span>
                          </td>
                          <td>
                            <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.5; font-weight: 600;">
                              You're now on the Starter plan with 5 free reviews per month
                            </p>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Your Starter Plan -->
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                      <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 16px; font-weight: 600;">
                        Your Starter Plan Includes:
                      </h2>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding-right: 8px; vertical-align: top;">
                                  <span style="color: #10b981;">✓</span>
                                </td>
                                <td style="color: #374151; font-size: 14px;">5 code reviews per month</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding-right: 8px; vertical-align: top;">
                                  <span style="color: #10b981;">✓</span>
                                </td>
                                <td style="color: #374151; font-size: 14px;">Basic security checks</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding-right: 8px; vertical-align: top;">
                                  <span style="color: #10b981;">✓</span>
                                </td>
                                <td style="color: #374151; font-size: 14px;">Community support</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Want More? -->
                    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                      <h2 style="margin: 0 0 8px 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                        Want More? Upgrade to Hero
                      </h2>
                      <p style="margin: 0 0 16px 0; color: #e0e7ff; font-size: 16px;">
                        Get unlimited reviews for just ₹2,999/month
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding-right: 8px; vertical-align: top;">
                                  <span style="font-size: 16px;">🚀</span>
                                </td>
                                <td style="color: #ffffff; font-size: 14px;">Unlimited submissions</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding-right: 8px; vertical-align: top;">
                                  <span style="font-size: 16px;">🔒</span>
                                </td>
                                <td style="color: #ffffff; font-size: 14px;">Advanced security analysis</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding-right: 8px; vertical-align: top;">
                                  <span style="font-size: 16px;">⚡</span>
                                </td>
                                <td style="color: #ffffff; font-size: 14px;">Priority support</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- CTA Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="text-align: center; padding: 8px 0;">
                          <a href="${process.env.NEXTAUTH_URL}/pricing" class="button" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                            Upgrade to Hero
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 40px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      Questions? Reply to this email or <a href="${process.env.NEXTAUTH_URL}/support" style="color: #6366f1; text-decoration: none;">visit our support page</a>
                    </p>
                  </td>
                </tr>

              </table>
            </center>
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
