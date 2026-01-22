"use server";

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

interface MonthlySnapshot {
  period: string;
  totalUsers: number;
  starterUsers: number;
  heroUsers: number;
  legendUsers: number;
  newUsers: number;
  churnedUsers: number;
  activeUsers: number;
  trialingUsers: number;
  cancelledUsers: number;
  trialsStarted: number;
  trialsConverted: number;
  trialsExpired: number;
  trialConversionRate: number;
  mrr: number;
  arr: number;
  arpu: number;
  totalSubmissions: number;
  submissionsByTier: {
    starter: number;
    hero: number;
    legend: number;
  };
  avgSubmissionsPerUser: number;
  userGrowthRate: number;
  revenueGrowthRate: number;
}

export async function emailMonthlyReport(
  adminEmail: string,
  snapshot: MonthlySnapshot,
) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return "#10b981"; // green
    if (value < 0) return "#ef4444"; // red
    return "#6b7280"; // gray
  };

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Monthly Report - ${snapshot.period}</title>
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
            padding: 20px !important;
          }
          .mobile-text {
            font-size: 14px !important;
          }
          .mobile-title {
            font-size: 24px !important;
          }
          .metric-value {
            font-size: 28px !important;
          }
          .two-column {
            display: block !important;
            width: 100% !important;
          }
          .column {
            display: block !important;
            width: 100% !important;
            padding-bottom: 12px !important;
          }
        }
        
        /* Component styles */
        .metric-card {
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 12px;
        }
        .metric-title {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 8px 0;
        }
        .metric-value {
          color: #111827;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 4px 0;
          line-height: 1.2;
        }
        .metric-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }
        .section-title {
          color: #111827;
          font-size: 18px;
          font-weight: 600;
          margin: 24px 0 12px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #6366f1;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb;">
        <tr>
          <td style="padding: 20px 0;">
            <center>
              <!-- Main Container -->
              <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 40px 30px 40px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 32px; font-weight: 700; line-height: 1.2;" class="mobile-title">
                      Monthly Report
                    </h1>
                    <p style="margin: 0; color: #e0e7ff; font-size: 16px;">
                      ${snapshot.period}
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td class="mobile-padding" style="padding: 32px 40px;">
                    
                    <!-- Revenue Section -->
                    <h2 class="section-title">💰 Revenue Metrics</h2>
                    
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="metric-card">
                      <tr>
                        <td>
                          <p class="metric-title">Monthly Recurring Revenue</p>
                          <p class="metric-value">${formatCurrency(snapshot.mrr)}</p>
                          <p class="metric-subtitle" style="color: ${getGrowthColor(snapshot.revenueGrowthRate)}; font-weight: 600;">
                            ${formatPercent(snapshot.revenueGrowthRate)} from last month
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Two Column Metrics -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="two-column">
                      <tr>
                        <td class="column" width="48%" valign="top" style="padding-right: 8px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="metric-card">
                            <tr>
                              <td>
                                <p class="metric-title">ARR</p>
                                <p class="metric-value" style="font-size: 24px;">${formatCurrency(snapshot.arr)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td class="column" width="48%" valign="top" style="padding-left: 8px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="metric-card">
                            <tr>
                              <td>
                                <p class="metric-title">ARPU</p>
                                <p class="metric-value" style="font-size: 24px;">${formatCurrency(snapshot.arpu)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- User Metrics Section -->
                    <h2 class="section-title">👥 User Metrics</h2>
                    
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="metric-card">
                      <tr>
                        <td>
                          <p class="metric-title">Total Users</p>
                          <p class="metric-value">${snapshot.totalUsers.toLocaleString()}</p>
                          <p class="metric-subtitle" style="color: ${getGrowthColor(snapshot.userGrowthRate)}; font-weight: 600;">
                            ${formatPercent(snapshot.userGrowthRate)} growth
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- User Breakdown -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="metric-card">
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="8" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Starter Users</td>
                              <td align="right" style="color: #111827; font-size: 16px; font-weight: 600; padding: 8px 0;">${snapshot.starterUsers}</td>
                            </tr>
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Hero Users</td>
                              <td align="right" style="color: #6366f1; font-size: 16px; font-weight: 600; padding: 8px 0;">${snapshot.heroUsers}</td>
                            </tr>
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Legend Users</td>
                              <td align="right" style="color: #f59e0b; font-size: 16px; font-weight: 600; padding: 8px 0;">${snapshot.legendUsers}</td>
                            </tr>
                            <tr style="border-top: 1px solid #e5e7eb;">
                              <td style="color: #6b7280; font-size: 14px; padding: 12px 0 8px 0;">Active</td>
                              <td align="right" style="color: #10b981; font-size: 16px; font-weight: 600; padding: 12px 0 8px 0;">${snapshot.activeUsers}</td>
                            </tr>
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Trialing</td>
                              <td align="right" style="color: #f59e0b; font-size: 16px; font-weight: 600; padding: 8px 0;">${snapshot.trialingUsers}</td>
                            </tr>
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Cancelled</td>
                              <td align="right" style="color: #ef4444; font-size: 16px; font-weight: 600; padding: 8px 0;">${snapshot.cancelledUsers}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Trial Performance Section -->
                    <h2 class="section-title">🎯 Trial Performance</h2>
                    
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="metric-card">
                      <tr>
                        <td>
                          <p class="metric-title">Trial Conversion Rate</p>
                          <p class="metric-value">${snapshot.trialConversionRate.toFixed(1)}%</p>
                          <p class="metric-subtitle">
                            ${snapshot.trialsConverted} / ${snapshot.trialsStarted} trials converted
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Three Column Trial Stats -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="32%" valign="top" style="padding-right: 8px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="metric-card">
                            <tr>
                              <td style="text-align: center;">
                                <p class="metric-title">Started</p>
                                <p class="metric-value" style="font-size: 24px;">${snapshot.trialsStarted}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="32%" valign="top" style="padding: 0 4px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="metric-card">
                            <tr>
                              <td style="text-align: center;">
                                <p class="metric-title">Converted</p>
                                <p class="metric-value" style="font-size: 24px; color: #10b981;">${snapshot.trialsConverted}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="32%" valign="top" style="padding-left: 8px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="metric-card">
                            <tr>
                              <td style="text-align: center;">
                                <p class="metric-title">Expired</p>
                                <p class="metric-value" style="font-size: 24px; color: #ef4444;">${snapshot.trialsExpired}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Usage Stats Section -->
                    <h2 class="section-title">📊 Usage Statistics</h2>
                    
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="metric-card">
                      <tr>
                        <td>
                          <p class="metric-title">Total Submissions</p>
                          <p class="metric-value">${snapshot.totalSubmissions.toLocaleString()}</p>
                          <p class="metric-subtitle">
                            ${snapshot.avgSubmissionsPerUser.toFixed(1)} average per user
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Submissions by Tier -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="metric-card">
                      <tr>
                        <td>
                          <p class="metric-title" style="margin-bottom: 12px;">Submissions by Tier</p>
                          <table role="presentation" cellpadding="8" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="color: #111827; font-size: 14px; padding: 8px 0;">Starter</td>
                              <td align="right" style="color: #111827; font-weight: 600; padding: 8px 0;">${snapshot.submissionsByTier.starter}</td>
                              <td align="right" style="color: #6b7280; font-size: 14px; padding: 8px 0;">${((snapshot.submissionsByTier.starter / snapshot.totalSubmissions) * 100).toFixed(1)}%</td>
                            </tr>
                            <tr>
                              <td style="color: #111827; font-size: 14px; padding: 8px 0;">Hero</td>
                              <td align="right" style="color: #6366f1; font-weight: 600; padding: 8px 0;">${snapshot.submissionsByTier.hero}</td>
                              <td align="right" style="color: #6b7280; font-size: 14px; padding: 8px 0;">${((snapshot.submissionsByTier.hero / snapshot.totalSubmissions) * 100).toFixed(1)}%</td>
                            </tr>
                            <tr>
                              <td style="color: #111827; font-size: 14px; padding: 8px 0;">Legend</td>
                              <td align="right" style="color: #f59e0b; font-weight: 600; padding: 8px 0;">${snapshot.submissionsByTier.legend}</td>
                              <td align="right" style="color: #6b7280; font-size: 14px; padding: 8px 0;">${((snapshot.submissionsByTier.legend / snapshot.totalSubmissions) * 100).toFixed(1)}%</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 32px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td>
                          <a href="${process.env.NEXTAUTH_URL}/dashboard/admin/analytics" class="button" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">
                            View Full Analytics
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 16px 0 0 0; font-size: 12px; color: #6b7280;">
                      Report generated on ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}
                    </p>
                  </td>
                </tr>

              </table>
              <!-- End Main Container -->

              <!-- Footer Note -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 16px auto 0 auto;" class="email-container">
                <tr>
                  <td style="text-align: center; padding: 16px; color: #6b7280; font-size: 12px;">
                    <p style="margin: 0;">Code Review AI</p>
                    <p style="margin: 4px 0 0 0;">This is an automated monthly report</p>
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
    to: adminEmail,
    subject: `📊 Monthly Report - ${snapshot.period} | MRR: ${formatCurrency(snapshot.mrr)}`,
    html,
  });

  return { success: true, email: adminEmail, period: snapshot.period };
}
