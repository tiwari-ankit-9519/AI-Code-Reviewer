// lib/email/support-emails.ts
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

export async function sendTicketCreatedEmail(ticketId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          subscriptionTier: true,
        },
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!ticket) return;

  const supportEmail = process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL;

  const priorityColors = {
    LOW: "#6b7280",
    MEDIUM: "#f59e0b",
    HIGH: "#ef4444",
    CRITICAL: "#dc2626",
  };

  const emailStyles = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
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
        }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background-color: #6366f1;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
        }
      </style>
    </head>
  `;

  // Send notification to support team
  if (supportEmail) {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: supportEmail,
      subject: `[${ticket.priority}] New Support Ticket: ${ticket.subject}`,
      html: `
        ${emailStyles}
        <body style="margin: 0; padding: 0; background-color: #f9fafb;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb;">
            <tr>
              <td style="padding: 40px 20px;">
                <center>
                  <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                        <div style="background-color: rgba(255, 255, 255, 0.2); width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                          <span style="font-size: 32px;">🎫</span>
                        </div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;" class="mobile-title">
                          New Support Ticket
                        </h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td class="mobile-padding" style="padding: 40px;">
                        
                        <!-- Priority Badge -->
                        <div style="text-align: center; margin-bottom: 24px;">
                          <span style="background-color: ${priorityColors[ticket.priority]}; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600;">
                            ${ticket.priority} PRIORITY
                          </span>
                        </div>

                        <!-- Ticket Details -->
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 24px;">
                          <tr>
                            <td style="padding: 20px;">
                              <table role="presentation" cellpadding="8" cellspacing="0" border="0" width="100%">
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px; width: 30%;">User</td>
                                  <td style="color: #111827; font-size: 14px; font-weight: 600;">${ticket.user.name}</td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px;">Email</td>
                                  <td style="color: #6366f1; font-size: 14px;">
                                    <a href="mailto:${ticket.user.email}" style="color: #6366f1; text-decoration: none;">${ticket.user.email}</a>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px;">Tier</td>
                                  <td>
                                    <span style="background-color: #eff6ff; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                                      ${ticket.user.subscriptionTier}
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px;">Category</td>
                                  <td style="color: #111827; font-size: 14px;">${ticket.category}</td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px;">SLA</td>
                                  <td style="color: #111827; font-size: 14px; font-weight: 600;">${ticket.slaResponseTime}h response time</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <!-- Subject & Message -->
                        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                          <p style="color: #6b7280; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Subject</p>
                          <p style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">${ticket.subject}</p>
                          
                          <p style="color: #6b7280; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Message</p>
                          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${ticket.messages[0]?.message || ""}</p>
                        </div>

                        <!-- CTA Button -->
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td style="text-align: center; padding: 8px 0;">
                              <a href="${process.env.NEXTAUTH_URL}/dashboard/admin/support/${ticket.id}" class="button" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
                                View & Respond to Ticket
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
                          Ticket ID: <span style="color: #111827; font-weight: 600;">${ticket.id}</span>
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
      `,
    });
  }

  // Send confirmation to user
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: ticket.user.email,
    subject: `Support Ticket Created: ${ticket.subject}`,
    html: `
      ${emailStyles}
      <body style="margin: 0; padding: 0; background-color: #f9fafb;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb;">
          <tr>
            <td style="padding: 40px 20px;">
              <center>
                <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                      <div style="background-color: rgba(255, 255, 255, 0.2); width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="font-size: 32px;">✅</span>
                      </div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;" class="mobile-title">
                        Ticket Received
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td class="mobile-padding" style="padding: 40px;">
                      <p style="margin: 0 0 8px 0; color: #111827; font-size: 18px; font-weight: 600;">
                        Hi ${ticket.user.name},
                      </p>
                      <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        We've received your support ticket and our team will respond within <strong style="color: #10b981;">${ticket.slaResponseTime} hours</strong>.
                      </p>

                      <!-- Ticket Info -->
                      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td style="padding-right: 12px; vertical-align: top;">
                              <span style="font-size: 20px;">ℹ️</span>
                            </td>
                            <td>
                              <p style="margin: 0 0 4px 0; color: #166534; font-size: 14px; font-weight: 600;">
                                Your ticket has been created
                              </p>
                              <p style="margin: 0; color: #166534; font-size: 13px;">
                                You'll receive an email when we respond
                              </p>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Ticket Details -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Ticket ID</p>
                            <p style="margin: 0 0 16px 0; color: #111827; font-size: 16px; font-weight: 600; font-family: monospace;">${ticket.id}</p>
                            
                            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Subject</p>
                            <p style="margin: 0; color: #111827; font-size: 14px;">${ticket.subject}</p>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center; padding: 8px 0;">
                            <a href="${process.env.NEXTAUTH_URL}/dashboard/support/tickets/${ticket.id}" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                              View Ticket
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
                        You can reply to this ticket anytime from your dashboard
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
    `,
  });

  return { success: true };
}

export async function sendTicketResponseEmail(ticketId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        where: {
          isStaff: true,
        },
      },
    },
  });

  if (!ticket || !ticket.messages[0]) return;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: ticket.user.email,
    subject: `Response to your ticket: ${ticket.subject}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
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
                    <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                      <div style="background-color: rgba(255, 255, 255, 0.2); width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="font-size: 32px;">💬</span>
                      </div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;" class="mobile-title">
                        New Response
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td class="mobile-padding" style="padding: 40px;">
                      <p style="margin: 0 0 8px 0; color: #111827; font-size: 18px; font-weight: 600;">
                        Hi ${ticket.user.name},
                      </p>
                      <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        Our support team has responded to your ticket.
                      </p>

                      <!-- Response Box -->
                      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 20px; margin-bottom: 24px;">
                        <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
                          Support Team Response:
                        </p>
                        <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${ticket.messages[0].message}</p>
                      </div>

                      <!-- CTA Button -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center; padding: 8px 0;">
                            <a href="${process.env.NEXTAUTH_URL}/dashboard/support/tickets/${ticket.id}" style="display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                              View & Reply
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
                        Ticket ID: <span style="color: #111827; font-weight: 600;">${ticket.id}</span>
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
    `,
  });

  return { success: true };
}
