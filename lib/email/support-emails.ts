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

  if (supportEmail) {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: supportEmail,
      subject: `[${ticket.priority}] New Support Ticket: ${ticket.subject}`,
      html: `
        <html>
        <body style="margin:0; padding:0; background:#0a0e27; font-family:Arial, sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27; padding:40px 0">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1f3a; border-radius:12px; border:2px solid #7c3aed">
                  <tr>
                    <td align="center" style="padding:40px; background:linear-gradient(135deg, #7c3aed, #a855f7); border-radius:12px 12px 0 0">
                      <h1 style="font-size:32px; color:#ffffff; margin:0; font-weight:900">🎫 New Support Ticket</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding:30px 40px">
                      <div style="background:#0a0e27; border-radius:8px; padding:20px; margin-bottom:20px">
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color:#9ca3af; font-weight:bold">User:</td>
                            <td style="color:#ffffff; font-weight:bold">${
                              ticket.user.name
                            }</td>
                          </tr>
                          <tr>
                            <td style="color:#9ca3af; font-weight:bold">Email:</td>
                            <td style="color:#ffffff"><a href="mailto:${
                              ticket.user.email
                            }" style="color:#a855f7">${
        ticket.user.email
      }</a></td>
                          </tr>
                          <tr>
                            <td style="color:#9ca3af; font-weight:bold">Tier:</td>
                            <td style="color:#fbbf24; font-weight:bold">${
                              ticket.user.subscriptionTier
                            }</td>
                          </tr>
                          <tr>
                            <td style="color:#9ca3af; font-weight:bold">Priority:</td>
                            <td style="color:${
                              priorityColors[ticket.priority]
                            }; font-weight:bold">${ticket.priority}</td>
                          </tr>
                          <tr>
                            <td style="color:#9ca3af; font-weight:bold">Category:</td>
                            <td style="color:#ffffff">${ticket.category}</td>
                          </tr>
                          <tr>
                            <td style="color:#9ca3af; font-weight:bold">SLA:</td>
                            <td style="color:#ffffff">${
                              ticket.slaResponseTime
                            }h response time</td>
                          </tr>
                        </table>
                      </div>

                      <div style="margin:20px 0; padding:20px; background:#0a0e27; border-radius:8px">
                        <p style="color:#fbbf24; font-weight:bold; margin:0 0 10px 0">Subject:</p>
                        <p style="color:#ffffff; font-size:18px; margin:0 0 20px 0">${
                          ticket.subject
                        }</p>
                        
                        <p style="color:#fbbf24; font-weight:bold; margin:0 0 10px 0">Message:</p>
                        <p style="color:#e5e7eb; margin:0; white-space:pre-wrap">${
                          ticket.messages[0]?.message || ""
                        }</p>
                      </div>

                      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:30px auto 0">
                        <tr>
                          <td align="center" style="border-radius:8px; background:linear-gradient(135deg, #7c3aed, #a855f7)">
                            <a href="${
                              process.env.NEXTAUTH_URL
                            }/dashboard/admin/support/${ticket.id}" 
                              style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:900; border-radius:8px">
                              VIEW TICKET
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:20px 40px; background:#0a0e27; border-radius:0 0 12px 12px">
                      <p style="margin:0; font-size:12px; color:#6b7280; text-align:center">
                        Ticket ID: ${ticket.id}
                      </p>
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

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: ticket.user.email,
    subject: `Support Ticket Created: ${ticket.subject}`,
    html: `
      <html>
      <body style="margin:0; padding:0; background:#0a0e27; font-family:Arial, sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27; padding:40px 0">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1f3a; border-radius:12px; border:2px solid #7c3aed">
                <tr>
                  <td align="center" style="padding:40px; background:linear-gradient(135deg, #7c3aed, #a855f7); border-radius:12px 12px 0 0">
                    <h1 style="font-size:32px; color:#ffffff; margin:0; font-weight:900">✅ Ticket Received</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:40px">
                    <h2 style="color:#ffffff; font-size:24px; margin:0 0 20px 0">Hi ${ticket.user.name},</h2>
                    <p style="color:#e5e7eb; font-size:16px; line-height:1.6; margin:0 0 20px 0">
                      We've received your support ticket and our team will respond within <strong style="color:#fbbf24">${ticket.slaResponseTime} hours</strong>.
                    </p>

                    <div style="background:#0a0e27; border-radius:8px; padding:20px; margin-bottom:20px">
                      <p style="color:#9ca3af; font-size:14px; margin:0 0 8px 0">Ticket ID</p>
                      <p style="color:#ffffff; font-size:18px; font-weight:bold; margin:0">${ticket.id}</p>
                    </div>

                    <div style="background:#0a0e27; border-radius:8px; padding:20px; margin-bottom:20px">
                      <p style="color:#9ca3af; font-size:14px; margin:0 0 8px 0">Subject</p>
                      <p style="color:#ffffff; font-size:16px; margin:0">${ticket.subject}</p>
                    </div>

                    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto">
                      <tr>
                        <td align="center" style="border-radius:8px; background:linear-gradient(135deg, #7c3aed, #a855f7)">
                          <a href="${process.env.NEXTAUTH_URL}/dashboard/support/tickets/${ticket.id}" 
                            style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:900; border-radius:8px">
                            VIEW TICKET
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 40px; background:#0a0e27; border-radius:0 0 12px 12px">
                    <p style="margin:0; font-size:12px; color:#6b7280; text-align:center">
                      You can reply to this ticket anytime from your dashboard
                    </p>
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
      <html>
      <body style="margin:0; padding:0; background:#0a0e27; font-family:Arial, sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27; padding:40px 0">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1f3a; border-radius:12px; border:2px solid #10b981">
                <tr>
                  <td align="center" style="padding:40px; background:linear-gradient(135deg, #10b981, #059669); border-radius:12px 12px 0 0">
                    <h1 style="font-size:32px; color:#ffffff; margin:0; font-weight:900">💬 New Response</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:40px">
                    <h2 style="color:#ffffff; font-size:24px; margin:0 0 20px 0">Hi ${ticket.user.name},</h2>
                    <p style="color:#e5e7eb; font-size:16px; line-height:1.6; margin:0 0 20px 0">
                      Our support team has responded to your ticket.
                    </p>

                    <div style="background:#0a0e27; border-radius:8px; padding:20px; margin-bottom:20px">
                      <p style="color:#10b981; font-weight:bold; margin:0 0 10px 0">Response:</p>
                      <p style="color:#e5e7eb; margin:0; white-space:pre-wrap">${ticket.messages[0].message}</p>
                    </div>

                    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto">
                      <tr>
                        <td align="center" style="border-radius:8px; background:linear-gradient(135deg, #10b981, #059669)">
                          <a href="${process.env.NEXTAUTH_URL}/dashboard/support/tickets/${ticket.id}" 
                            style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:900; border-radius:8px">
                            VIEW & REPLY
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 40px; background:#0a0e27; border-radius:0 0 12px 12px">
                    <p style="margin:0; font-size:12px; color:#6b7280; text-align:center">
                      Ticket ID: ${ticket.id}
                    </p>
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

  return { success: true };
}
