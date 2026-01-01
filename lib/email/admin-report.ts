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
  snapshot: MonthlySnapshot
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
    if (value > 0) return "#10b981";
    if (value < 0) return "#ef4444";
    return "#6b7280";
  };

  const html = `
    <html>
    <head>
      <style>
        .metric-card {
          background: #1a1f3a;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
        }
        .metric-title {
          color: #9ca3af;
          font-size: 14px;
          margin: 0 0 8px 0;
        }
        .metric-value {
          color: #ffffff;
          font-size: 32px;
          font-weight: 900;
          margin: 0 0 4px 0;
        }
        .metric-change {
          font-size: 14px;
          font-weight: 600;
        }
        .section-title {
          color: #fbbf24;
          font-size: 20px;
          font-weight: 900;
          margin: 24px 0 16px 0;
        }
      </style>
    </head>
    <body style="margin:0; padding:0; background:#0a0e27; font-family:Arial, sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e27; padding:40px 0">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1f3a; border-radius:12px; border:2px solid #7c3aed">
              
              <tr>
                <td align="center" style="padding:40px 40px 20px 40px; background:linear-gradient(135deg, #7c3aed, #a855f7); border-radius:12px 12px 0 0">
                  <h1 style="font-size:32px; color:#ffffff; margin:0 0 8px 0; font-weight:900">📊 Monthly Report</h1>
                  <p style="font-size:18px; color:#e5e7eb; margin:0">${
                    snapshot.period
                  }</p>
                </td>
              </tr>

              <tr>
                <td style="padding:30px 40px">
                  
                  <h2 class="section-title">💰 Revenue Metrics</h2>
                  
                  <div class="metric-card">
                    <p class="metric-title">Monthly Recurring Revenue</p>
                    <p class="metric-value">${formatCurrency(snapshot.mrr)}</p>
                    <p class="metric-change" style="color: ${getGrowthColor(
                      snapshot.revenueGrowthRate
                    )}">
                      ${formatPercent(
                        snapshot.revenueGrowthRate
                      )} from last month
                    </p>
                  </div>

                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px">
                    <div class="metric-card">
                      <p class="metric-title">ARR</p>
                      <p class="metric-value" style="font-size:24px">${formatCurrency(
                        snapshot.arr
                      )}</p>
                    </div>
                    <div class="metric-card">
                      <p class="metric-title">ARPU</p>
                      <p class="metric-value" style="font-size:24px">${formatCurrency(
                        snapshot.arpu
                      )}</p>
                    </div>
                  </div>

                  <h2 class="section-title">👥 User Metrics</h2>
                  
                  <div class="metric-card">
                    <p class="metric-title">Total Users</p>
                    <p class="metric-value">${snapshot.totalUsers.toLocaleString()}</p>
                    <p class="metric-change" style="color: ${getGrowthColor(
                      snapshot.userGrowthRate
                    )}">
                      ${formatPercent(snapshot.userGrowthRate)} growth
                    </p>
                  </div>

                  <div style="background:#0a0e27; border-radius:8px; padding:20px; margin-bottom:16px">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color:#9ca3af; font-size:14px">Starter Users</td>
                        <td align="right" style="color:#ffffff; font-size:16px; font-weight:700">${
                          snapshot.starterUsers
                        }</td>
                      </tr>
                      <tr>
                        <td style="color:#9ca3af; font-size:14px">Hero Users</td>
                        <td align="right" style="color:#a855f7; font-size:16px; font-weight:700">${
                          snapshot.heroUsers
                        }</td>
                      </tr>
                      <tr>
                        <td style="color:#9ca3af; font-size:14px">Legend Users</td>
                        <td align="right" style="color:#fbbf24; font-size:16px; font-weight:700">${
                          snapshot.legendUsers
                        }</td>
                      </tr>
                      <tr style="border-top:1px solid #374151">
                        <td style="color:#9ca3af; font-size:14px; padding-top:12px">Active</td>
                        <td align="right" style="color:#10b981; font-size:16px; font-weight:700; padding-top:12px">${
                          snapshot.activeUsers
                        }</td>
                      </tr>
                      <tr>
                        <td style="color:#9ca3af; font-size:14px">Trialing</td>
                        <td align="right" style="color:#fbbf24; font-size:16px; font-weight:700">${
                          snapshot.trialingUsers
                        }</td>
                      </tr>
                      <tr>
                        <td style="color:#9ca3af; font-size:14px">Cancelled</td>
                        <td align="right" style="color:#ef4444; font-size:16px; font-weight:700">${
                          snapshot.cancelledUsers
                        }</td>
                      </tr>
                    </table>
                  </div>

                  <h2 class="section-title">🎯 Trial Performance</h2>
                  
                  <div class="metric-card">
                    <p class="metric-title">Trial Conversion Rate</p>
                    <p class="metric-value">${snapshot.trialConversionRate.toFixed(
                      1
                    )}%</p>
                    <p style="color:#9ca3af; font-size:14px; margin:0">
                      ${snapshot.trialsConverted} / ${
    snapshot.trialsStarted
  } trials converted
                    </p>
                  </div>

                  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:16px">
                    <div class="metric-card">
                      <p class="metric-title" style="font-size:12px">Started</p>
                      <p class="metric-value" style="font-size:20px">${
                        snapshot.trialsStarted
                      }</p>
                    </div>
                    <div class="metric-card">
                      <p class="metric-title" style="font-size:12px">Converted</p>
                      <p class="metric-value" style="font-size:20px; color:#10b981">${
                        snapshot.trialsConverted
                      }</p>
                    </div>
                    <div class="metric-card">
                      <p class="metric-title" style="font-size:12px">Expired</p>
                      <p class="metric-value" style="font-size:20px; color:#ef4444">${
                        snapshot.trialsExpired
                      }</p>
                    </div>
                  </div>

                  <h2 class="section-title">📊 Usage Stats</h2>
                  
                  <div class="metric-card">
                    <p class="metric-title">Total Submissions</p>
                    <p class="metric-value">${snapshot.totalSubmissions.toLocaleString()}</p>
                    <p style="color:#9ca3af; font-size:14px; margin:0">
                      ${snapshot.avgSubmissionsPerUser.toFixed(1)} avg per user
                    </p>
                  </div>

                  <div style="background:#0a0e27; border-radius:8px; padding:20px">
                    <p style="color:#9ca3af; font-size:14px; margin:0 0 12px 0">Submissions by Tier</p>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color:#e5e7eb">Starter</td>
                        <td align="right" style="color:#ffffff; font-weight:700">${
                          snapshot.submissionsByTier.starter
                        }</td>
                        <td align="right" style="color:#9ca3af; font-size:14px">${(
                          (snapshot.submissionsByTier.starter /
                            snapshot.totalSubmissions) *
                          100
                        ).toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td style="color:#e5e7eb">Hero</td>
                        <td align="right" style="color:#a855f7; font-weight:700">${
                          snapshot.submissionsByTier.hero
                        }</td>
                        <td align="right" style="color:#9ca3af; font-size:14px">${(
                          (snapshot.submissionsByTier.hero /
                            snapshot.totalSubmissions) *
                          100
                        ).toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td style="color:#e5e7eb">Legend</td>
                        <td align="right" style="color:#fbbf24; font-weight:700">${
                          snapshot.submissionsByTier.legend
                        }</td>
                        <td align="right" style="color:#9ca3af; font-size:14px">${(
                          (snapshot.submissionsByTier.legend /
                            snapshot.totalSubmissions) *
                          100
                        ).toFixed(1)}%</td>
                      </tr>
                    </table>
                  </div>

                </td>
              </tr>

              <tr>
                <td style="padding:20px 40px; background:#0a0e27; border-radius:0 0 12px 12px">
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto">
                    <tr>
                      <td align="center" style="border-radius:8px; background:linear-gradient(135deg, #7c3aed, #a855f7)">
                        <a href="${
                          process.env.NEXTAUTH_URL
                        }/dashboard/admin/analytics" 
                          style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:900; border-radius:8px">
                          VIEW FULL ANALYTICS
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:16px 0 0 0; font-size:12px; color:#6b7280; text-align:center">
                    Report generated on ${new Date().toLocaleDateString(
                      "en-IN",
                      { dateStyle: "full" }
                    )}
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
    to: adminEmail,
    subject: `📊 Monthly Report - ${snapshot.period} | MRR: ${formatCurrency(
      snapshot.mrr
    )}`,
    html,
  });

  return { success: true, email: adminEmail, period: snapshot.period };
}
