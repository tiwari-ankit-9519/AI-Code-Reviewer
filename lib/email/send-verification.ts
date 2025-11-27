import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verificationUrl = `${process.env.AUTH_URL}/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Code Review Assistant <noreply@resend.dev>",
      to: [email],
      subject: "Verify your email address",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Email</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f7f9;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <tr>
                      <td style="padding: 40px 40px 30px 40px; text-align: center;">
                        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #007fff 0%, #0051cb 100%); border-radius: 16px; margin: 0 auto 24px auto; display: flex; align-items: center; justify-content: center;">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                          </svg>
                        </div>
                        <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #15192c;">Verify your email address</h1>
                        <p style="margin: 0 0 8px 0; font-size: 16px; color: #6c7681; line-height: 1.5;">Hi ${name},</p>
                        <p style="margin: 0 0 32px 0; font-size: 16px; color: #6c7681; line-height: 1.5;">Thanks for signing up! Please verify your email address to get started with Code Review Assistant.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 40px 40px 40px; text-align: center;">
                        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #007fff 0%, #0051cb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">Verify Email Address</a>
                        <p style="margin: 24px 0 0 0; font-size: 14px; color: #b2b5be; line-height: 1.5;">Or copy and paste this link into your browser:</p>
                        <p style="margin: 8px 0 0 0; font-size: 14px; color: #007fff; word-break: break-all;">${verificationUrl}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 32px 40px; background-color: #f9f9fa; border-top: 1px solid #ececec; border-radius: 0 0 8px 8px;">
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #6c7681; line-height: 1.5;">This link will expire in 24 hours.</p>
                        <p style="margin: 0; font-size: 13px; color: #6c7681; line-height: 1.5;">If you didn't create an account, you can safely ignore this email.</p>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 24px 0 0 0; font-size: 12px; color: #b2b5be; text-align: center;">Code Review Assistant - AI-Powered Code Analysis</p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Email send error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
