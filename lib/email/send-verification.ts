import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verificationUrl = `https://ai-code-reviewer-gamma-vert.vercel.app/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Code Review Assistant <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your email address",
      html: `
        <html>
        <body style="margin:0; padding:0; background:#f6f7f9; font-family:Arial, sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9; padding:40px 0">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; border:1px solid #e5e7eb">
                  <tr>
                    <td align="center" style="padding:40px 40px 20px 40px">
                      <h1 style="font-size:24px; color:#15192c; margin:0 0 12px 0">Verify your email address</h1>
                      <p style="font-size:16px; color:#6c7681; margin:0 0 8px 0">Hi ${name},</p>
                      <p style="font-size:16px; color:#6c7681; margin:0 0 24px 0">Please verify your email to get started.</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:0 40px 30px 40px">
                      <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                        <tr>
                          <td align="center" bgcolor="#0051cb" style="border-radius:8px">
                            <a href="${verificationUrl}" 
                              style="display:inline-block; padding:14px 32px; background:linear-gradient(135deg,#007fff,#0051cb); 
                              color:#ffffff; text-decoration:none; font-size:16px; border-radius:8px;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin-top:20px; font-size:14px; color:#6c7681">Or copy this link:</p>
                      <p style="font-size:14px; color:#007fff; word-break:break-all">${verificationUrl}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 40px; background:#f9f9fa; border-top:1px solid #ececec; border-radius:0 0 8px 8px">
                      <p style="font-size:13px; color:#6c7681; margin:0 0 8px 0">This link expires in 24 hours.</p>
                      <p style="font-size:13px; color:#6c7681; margin:0">If you didn’t create an account, ignore this email.</p>
                    </td>
                  </tr>
                </table>
                <p style="margin-top:24px; font-size:12px; color:#b2b5be">Code Review Assistant</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
