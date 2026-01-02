// FILE PATH: lib/actions/enterprise-contact.ts

"use server";

import { prisma } from "@/lib/prisma";
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

interface ContactData {
  name: string;
  email: string;
  company?: string;
  teamSize?: string;
  useCase: string;
  message?: string;
}

export async function submitEnterpriseContact(data: ContactData) {
  if (!data.name || !data.email || !data.useCase) {
    throw new Error("Missing required fields");
  }

  const lead = await prisma.enterpriseLead.create({
    data: {
      name: data.name,
      email: data.email,
      company: data.company || null,
      teamSize: data.teamSize || null,
      useCase: data.useCase,
      message: data.message || null,
      status: "NEW",
    },
  });

  const salesEmail = process.env.SALES_EMAIL || process.env.ADMIN_EMAIL;

  if (salesEmail) {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: salesEmail,
      subject: `New Enterprise Lead: ${data.company || data.name}`,
      html: `
        <html>
        <body style="margin:0; padding:0; background:#0a0e27; font-family:Arial, sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27; padding:40px 0">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1f3a; border-radius:12px; border:2px solid #7c3aed">
                  <tr>
                    <td align="center" style="padding:40px; background:linear-gradient(135deg, #7c3aed, #a855f7); border-radius:12px 12px 0 0">
                      <h1 style="font-size:32px; color:#ffffff; margin:0; font-weight:900">🚀 New Enterprise Lead</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding:30px 40px">
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color:#9ca3af; font-weight:bold">Name:</td>
                          <td style="color:#ffffff; font-weight:bold">${
                            data.name
                          }</td>
                        </tr>
                        <tr>
                          <td style="color:#9ca3af; font-weight:bold">Email:</td>
                          <td style="color:#ffffff"><a href="mailto:${
                            data.email
                          }" style="color:#a855f7">${data.email}</a></td>
                        </tr>
                        ${
                          data.company
                            ? `
                        <tr>
                          <td style="color:#9ca3af; font-weight:bold">Company:</td>
                          <td style="color:#ffffff">${data.company}</td>
                        </tr>
                        `
                            : ""
                        }
                        ${
                          data.teamSize
                            ? `
                        <tr>
                          <td style="color:#9ca3af; font-weight:bold">Team Size:</td>
                          <td style="color:#ffffff">${data.teamSize}</td>
                        </tr>
                        `
                            : ""
                        }
                      </table>

                      <div style="margin:20px 0; padding:20px; background:#0a0e27; border-radius:8px">
                        <p style="color:#fbbf24; font-weight:bold; margin:0 0 10px 0">Use Case:</p>
                        <p style="color:#e5e7eb; margin:0">${data.useCase}</p>
                      </div>

                      ${
                        data.message
                          ? `
                      <div style="margin:20px 0; padding:20px; background:#0a0e27; border-radius:8px">
                        <p style="color:#fbbf24; font-weight:bold; margin:0 0 10px 0">Additional Message:</p>
                        <p style="color:#e5e7eb; margin:0">${data.message}</p>
                      </div>
                      `
                          : ""
                      }

                      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:30px auto 0">
                        <tr>
                          <td align="center" style="border-radius:8px; background:linear-gradient(135deg, #7c3aed, #a855f7)">
                            <a href="${
                              process.env.NEXTAUTH_URL
                            }/dashboard/admin/leads/${lead.id}" 
                              style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:900; border-radius:8px">
                              VIEW IN ADMIN PANEL
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:20px 40px; background:#0a0e27; border-radius:0 0 12px 12px">
                      <p style="margin:0; font-size:12px; color:#6b7280; text-align:center">
                        Lead ID: ${lead.id}
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
    to: data.email,
    subject: "Thanks for your interest in Legend tier",
    html: `
      <html>
      <body style="margin:0; padding:0; background:#0a0e27; font-family:Arial, sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27; padding:40px 0">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1f3a; border-radius:12px; border:2px solid #fbbf24">
                <tr>
                  <td align="center" style="padding:40px; background:linear-gradient(135deg, #fbbf24, #f59e0b); border-radius:12px 12px 0 0">
                    <h1 style="font-size:32px; color:#0a0e27; margin:0; font-weight:900">Thanks for Reaching Out!</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding:40px">
                    <h2 style="color:#ffffff; font-size:24px; margin:0 0 20px 0">Hi ${data.name},</h2>
                    <p style="color:#e5e7eb; font-size:16px; line-height:1.6; margin:0 0 20px 0">
                      Thanks for reaching out about our <strong style="color:#fbbf24">Legend tier</strong>!
                    </p>
                    <p style="color:#e5e7eb; font-size:16px; line-height:1.6; margin:0 0 20px 0">
                      Our team will review your requirements and get back to you within <strong style="color:#fbbf24">24 hours</strong>.
                    </p>
                    <p style="color:#e5e7eb; font-size:16px; line-height:1.6; margin:0 0 30px 0">
                      In the meantime, feel free to explore our other pricing options.
                    </p>

                    <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto">
                      <tr>
                        <td align="center" style="border-radius:8px; background:linear-gradient(135deg, #7c3aed, #a855f7)">
                          <a href="${process.env.NEXTAUTH_URL}/pricing" 
                            style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:900; border-radius:8px">
                            VIEW PRICING
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
    `,
  });

  return { success: true, leadId: lead.id };
}
