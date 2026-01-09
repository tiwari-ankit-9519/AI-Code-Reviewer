import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

if (
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASS ||
  !process.env.SMTP_HOST ||
  !process.env.SMTP_PORT
) {
  throw new Error("Please provide correct Email Configurations");
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;

  console.log("SMTP Config check:", {
    host: smtpHost,
    port: smtpPort,
    user: smtpUser,
    hasPassword: !!smtpPassword,
  });

  if (!smtpUser || !smtpPassword) {
    throw new Error("SMTP credentials are not configured properly");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost || "smtp.gmail.com",
    port: parseInt(smtpPort || "465"),
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || smtpUser,
      to: email,
      subject: "Reset Your Password - Code Review AI",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Code Review AI</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
              <p>Hi ${name},</p>
              <p>We received a request to reset your password. Click the button below to reset it:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
              </div>
              <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="color: #667eea; word-break: break-all; font-size: 12px;">${resetUrl}</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Code Review AI. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
