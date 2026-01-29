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

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
) {
  const verificationUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Verify Your Email</title>
      <!--[if mso]>
      <style type="text/css">
        table {border-collapse: collapse;}
      </style>
      <![endif]-->
      <style>
        /* Reset styles */
        body, table, td, a { 
          -webkit-text-size-adjust: 100%; 
          -ms-text-size-adjust: 100%; 
        }
        table, td { 
          mso-table-lspace: 0pt; 
          mso-table-rspace: 0pt; 
        }
        img { 
          -ms-interpolation-mode: bicubic; 
          border: 0; 
          height: auto; 
          line-height: 100%; 
          outline: none; 
          text-decoration: none; 
        }
        
        /* Base styles */
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f9fafb;
        }
        
        /* Responsive styles */
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
            margin: 0 !important;
          }
          .mobile-padding {
            padding: 24px !important;
          }
          .mobile-text {
            font-size: 14px !important;
          }
          .mobile-title {
            font-size: 24px !important;
          }
          .button {
            padding: 14px 28px !important;
            font-size: 15px !important;
          }
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
          text-align: center;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb;">
        <tr>
          <td style="padding: 40px 20px;">
            <center>
              <!-- Main Container -->
              <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="text-align: center;">
                          <!-- Icon -->
                          <div style="background-color: rgba(255, 255, 255, 0.2); width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                            <span style="font-size: 32px;">✉️</span>
                          </div>
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.2;" class="mobile-title">
                            Code Review AI
                          </h1>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td class="mobile-padding" style="padding: 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="text-align: center;">
                          <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
                            Verify Your Email Address
                          </h2>
                          
                          <p style="margin: 0 0 8px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                            Hi ${name},
                          </p>
                          
                          <p style="margin: 0 0 32px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                            Thanks for signing up! Please verify your email address to activate your account and start using Code Review AI.
                          </p>

                          <!-- Button -->
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="text-align: center; padding: 0 0 32px 0;">
                                <a href="${verificationUrl}" class="button" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                                  Verify Email Address
                                </a>
                              </td>
                            </tr>
                          </table>

                          <!-- Alternative Link -->
                          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: left; margin-bottom: 24px;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                              If the button doesn't work, copy and paste this link:
                            </p>
                            <p style="margin: 0; color: #6366f1; font-size: 13px; word-break: break-all; line-height: 1.5;">
                              ${verificationUrl}
                            </p>
                          </div>

                          <!-- Info Notice -->
                          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; text-align: left;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr>
                                <td style="padding-right: 12px; vertical-align: top;">
                                  <span style="font-size: 20px;">ℹ️</span>
                                </td>
                                <td>
                                  <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; line-height: 1.5; font-weight: 600;">
                                    This verification link expires in 24 hours
                                  </p>
                                  <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.5;">
                                    If you didn't create an account with Code Review AI, you can safely ignore this email.
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Features Section -->
                <tr>
                  <td style="padding: 0 40px 32px 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding-top: 24px; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; text-align: center; font-weight: 500;">
                            What you'll get with Code Review AI:
                          </p>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 8px 0;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="padding-right: 8px; vertical-align: top;">
                                      <span style="color: #10b981; font-size: 16px;">✓</span>
                                    </td>
                                    <td>
                                      <span style="color: #374151; font-size: 14px;">AI-powered code analysis</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="padding-right: 8px; vertical-align: top;">
                                      <span style="color: #10b981; font-size: 16px;">✓</span>
                                    </td>
                                    <td>
                                      <span style="color: #374151; font-size: 14px;">Security vulnerability detection</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="padding-right: 8px; vertical-align: top;">
                                      <span style="color: #10b981; font-size: 16px;">✓</span>
                                    </td>
                                    <td>
                                      <span style="color: #374151; font-size: 14px;">Performance optimization suggestions</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="padding-right: 8px; vertical-align: top;">
                                      <span style="color: #10b981; font-size: 16px;">✓</span>
                                    </td>
                                    <td>
                                      <span style="color: #374151; font-size: 14px;">7-day free Hero trial</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 32px 40px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="text-align: center;">
                          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                            Need help? We're here for you
                          </p>
                          <p style="margin: 0 0 16px 0;">
                            <a href="${process.env.AUTH_URL}/support" style="color: #6366f1; text-decoration: none; font-size: 14px; font-weight: 500;">
                              Contact Support
                            </a>
                          </p>
                          <div style="height: 1px; background-color: #e5e7eb; margin: 16px 0;"></div>
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                            © ${new Date().getFullYear()} Code Review AI. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
              <!-- End Main Container -->

              <!-- Footer Note -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 16px auto 0 auto;" class="email-container">
                <tr>
                  <td style="text-align: center; padding: 16px;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                      This is an automated message. Please do not reply to this email.
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

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify Your Email - Code Review AI",
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    console.error("Failed to send verification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
