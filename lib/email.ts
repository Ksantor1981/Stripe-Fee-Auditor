import { Resend } from "resend";
import { buildBillingPortalUrl } from "@/lib/billing-token";
import { buildNewsletterUnsubscribeUrl } from "@/lib/newsletter-token";
import type { MonthlyReminderAudience } from "@/lib/db";

const DEFAULT_BASE_URL = "https://feeauditor.com";
const DEFAULT_EMAIL_FROM = "Fee Auditor <noreply@feeauditor.com>";

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  return new Resend(process.env.RESEND_API_KEY);
}

function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export async function sendReportEmail(
  to: string,
  reportId: string,
  accessToken?: string,
  totalFeesCents?: number
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] RESEND_API_KEY not set, skipping email to ${to}`);
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? DEFAULT_BASE_URL;
  const from = process.env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;
  const reportUrl = accessToken
    ? new URL("/api/report/access", baseUrl)
    : new URL(`/report/${reportId}`, baseUrl);
  if (accessToken) {
    reportUrl.searchParams.set("reportId", reportId);
    reportUrl.searchParams.set("token", accessToken);
  }

  const feeSummary =
    totalFeesCents != null
      ? `<p style="color:#555;font-size:14px;margin:0 0 16px">Total Stripe fees in your export: <strong>${formatUsdFromCents(totalFeesCents)}</strong> (charges + other fees).</p>`
      : "";

  const subject =
    totalFeesCents != null
      ? `${formatUsdFromCents(totalFeesCents)} in Stripe fees — Your report is ready · feeauditor.com`
      : "Your Stripe Fee Report is Ready — feeauditor.com";

  await getResend().emails.send({
    from,
    to,
    subject,
    replyTo: process.env.EMAIL_REPLY_TO,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;color:#111">Your Stripe fee report is ready.</h1>
        ${feeSummary}
        <p style="color:#555;font-size:14px;margin:0 0 8px">Here's what we found:</p>
        <ul style="color:#555;font-size:14px;margin:0 0 20px;padding-left:20px;line-height:1.5">
          <li>Your effective fee rate and how it compares to Stripe's advertised 2.9%</li>
          <li>Month-by-month fee trends</li>
          <li>Your top fee drivers and high-fee charges</li>
        </ul>
        <p style="color:#555;font-size:14px;margin:0 0 16px">Keep this link — it's your private access to the report for 30 days.</p>
        <a href="${reportUrl.toString()}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px">
          View My Report
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px">
          Stripe Fee Auditor · Not affiliated with Stripe, Inc.<br>
          Questions? Reply to this email.
        </p>
      </div>
    `,
  });
}

const DEFAULT_WAITLIST_NOTIFY =
  process.env.FEEDBACK_TO?.trim() ||
  process.env.EMAIL_REPLY_TO?.trim() ||
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
  "support@feeauditor.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendFollowUpEmail(
  to: string,
  reportId: string,
  accessToken: string | null,
  totalFeesCents?: number,
  expiresAt?: Date
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] RESEND_API_KEY not set, skipping follow-up to ${to}`);
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? DEFAULT_BASE_URL;
  const from = process.env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;

  const reportUrl = accessToken
    ? new URL("/api/report/access", baseUrl)
    : new URL(`/report/${reportId}`, baseUrl);
  if (accessToken) {
    reportUrl.searchParams.set("reportId", reportId);
    reportUrl.searchParams.set("token", accessToken);
  }

  const feeLine =
    totalFeesCents != null
      ? `<strong>${formatUsdFromCents(totalFeesCents)}</strong> in Stripe fees`
      : "your Stripe fees";

  const hoursLeft = expiresAt
    ? Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / 3_600_000))
    : null;
  const expiryLine =
    hoursLeft != null
      ? `<p style="color:#d97706;font-size:14px;margin:0 0 16px">⏳ Your report closes in roughly <strong>${hoursLeft} hours</strong>.</p>`
      : "";

  const deadlineLabel =
    hoursLeft != null && hoursLeft <= 26
      ? "expires today"
      : "expires tomorrow";

  const subject =
    totalFeesCents != null
      ? `Your ${formatUsdFromCents(totalFeesCents)} Stripe fee report ${deadlineLabel}`
      : `Your Stripe fee report ${deadlineLabel}`;

  await getResend().emails.send({
    from,
    to,
    subject,
    replyTo: process.env.EMAIL_REPLY_TO,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;color:#111;margin:0 0 12px">
          You analyzed ${feeLine} 2 days ago.
        </h1>
        <p style="color:#555;font-size:14px;margin:0 0 12px">
          The free preview showed your headline rate. The full report adds:
        </p>
        <ul style="color:#555;font-size:14px;margin:0 0 20px;padding-left:20px;line-height:1.6">
          <li>Every high-fee transaction with an explanation</li>
          <li>Which charges could move to ACH or local payment</li>
          <li>Estimated annual savings if you act on the top driver</li>
          <li>CSV export and printable version</li>
        </ul>
        ${expiryLine}
        <a href="${reportUrl.toString()}"
           style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px">
          View Full Report — $12 one-time →
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px;line-height:1.5">
          Stripe Fee Auditor · Not affiliated with Stripe, Inc.<br>
          You received this because you analyzed a CSV on feeauditor.com.
          Questions? Reply to this email.
        </p>
      </div>
    `,
  });
}

export async function sendWaitlistNotifyEmail(params: {
  email: string;
  reportId?: string | null;
  source?: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] RESEND_API_KEY not set, skipping waitlist notify for ${params.email}`);
    return;
  }

  const to = process.env.WAITLIST_NOTIFY_TO?.trim() || DEFAULT_WAITLIST_NOTIFY;
  const from = process.env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? DEFAULT_BASE_URL;
  const emailSafe = escapeHtml(params.email);
  const sourceSafe = escapeHtml(params.source ?? "report");
  const reportLine = params.reportId
    ? `<tr><td style="padding:8px 0;color:#666">Report ID</td><td style="padding:8px 0;color:#999;font-size:12px;font-family:monospace">${escapeHtml(params.reportId)}</td></tr>`
    : "";
  const reportLink = params.reportId
    ? `<p style="margin:16px 0 0"><a href="${baseUrl}/report/${encodeURIComponent(params.reportId)}" style="color:#2563eb">View report</a></p>`
    : "";

  await getResend().emails.send({
    from,
    to,
    replyTo: process.env.EMAIL_REPLY_TO,
    subject: `[Waitlist] Fee Monitor beta — ${params.email}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="font-size:18px;color:#111;margin-bottom:16px">New Fee Monitor waitlist signup</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr>
            <td style="padding:8px 0;color:#666;width:140px">Email</td>
            <td style="padding:8px 0;font-weight:600;color:#111">${emailSafe}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#666">Source</td>
            <td style="padding:8px 0;color:#111">${sourceSafe}</td>
          </tr>
          ${reportLine}
        </table>
        ${reportLink}
      </div>
    `,
  });
}

export async function sendWaitlistConfirmationEmail(params: {
  email: string;
  source?: string;
  status?: "inserted" | "duplicate";
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] RESEND_API_KEY not set, skipping waitlist confirmation for ${params.email}`);
    return;
  }

  const from = process.env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? DEFAULT_BASE_URL;
  const monitorUrl = new URL("/monitor", baseUrl);
  const analyzeUrl = new URL("/analyze", baseUrl);
  const isDuplicate = params.status === "duplicate";

  await getResend().emails.send({
    from,
    to: params.email,
    replyTo: process.env.EMAIL_REPLY_TO,
    subject: isDuplicate
      ? "You're already on the Fee Monitor early list · feeauditor.com"
      : "You're on the Fee Monitor early list · feeauditor.com",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;color:#111;margin:0 0 12px">
          ${isDuplicate ? "You're already on the Fee Monitor early list." : "You're on the Fee Monitor early list."}
        </h1>
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px">
          Fee Monitor is the next step for Stripe Fee Auditor: private report history,
          month-over-month comparisons, and monthly reminders without permanent Stripe OAuth access.
        </p>
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px">
          We'll email you again when early access opens. Until then, you can still run a
          one-time Stripe Balance CSV audit whenever you need it.
        </p>
        <a href="${analyzeUrl.toString()}"
           style="display:inline-block;margin:8px 0 16px;padding:12px 20px;background:#2563eb;color:#fff;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px">
          Analyze a Stripe CSV
        </a>
        <p style="color:#888;font-size:12px;line-height:1.5;margin-top:16px">
          You received this because this email was submitted on
          <a href="${monitorUrl.toString()}" style="color:#2563eb">Fee Monitor</a>.
          Questions? Reply to this email.
        </p>
      </div>
    `,
  });
}

export async function sendMonitorWelcomeEmail(to: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] RESEND_API_KEY not set, skipping monitor welcome to ${to}`);
    return;
  }

  const from = process.env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? DEFAULT_BASE_URL;
  const analyzeUrl = new URL("/analyze", baseUrl);
  analyzeUrl.searchParams.set("utm_source", "email");
  analyzeUrl.searchParams.set("utm_medium", "monitor_welcome");
  analyzeUrl.searchParams.set("utm_campaign", "fee_monitor");

  const monitorUrl = new URL("/monitor", baseUrl);
  monitorUrl.searchParams.set("utm_source", "email");
  monitorUrl.searchParams.set("utm_medium", "monitor_welcome");
  const billingUrl = buildBillingPortalUrl(to);

  await getResend().emails.send({
    from,
    to,
    subject: "You're subscribed to Fee Monitor — here's your monthly workflow",
    replyTo: process.env.EMAIL_REPLY_TO,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <p style="color:#2563eb;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin:0 0 10px">
          Fee Monitor
        </p>
        <h1 style="font-size:20px;color:#111;margin:0 0 12px">
          You're subscribed — $9/month
        </h1>
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px">
          Thanks for joining Fee Monitor. No Stripe OAuth, no API keys — just a monthly CSV check
          against your real processing and all-in Stripe cost rates.
        </p>
        <p style="color:#555;font-size:14px;font-weight:600;margin:0 0 8px">Your monthly workflow</p>
        <ol style="color:#555;font-size:14px;margin:0 0 20px;padding-left:20px;line-height:1.6">
          <li>Export an itemized Stripe Balance CSV for the last month</li>
          <li>Upload it to Fee Auditor and review rate + month-over-month drift</li>
          <li>Watch for high-fee charges, refunds, and small-charge drag</li>
        </ol>
        <a href="${analyzeUrl.toString()}"
           style="display:inline-block;margin:0 0 12px;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px">
          Upload this month's CSV →
        </a>
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px">
          We'll email you about once a month when it's time for the next check. Full details live on
          <a href="${monitorUrl.toString()}" style="color:#2563eb">the Fee Monitor page</a>.
          Billing and cancellation are managed through Polar.
        </p>
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px">
          <a href="${billingUrl}" style="color:#2563eb">Manage or cancel your subscription</a>.
        </p>
        <p style="color:#888;font-size:12px;line-height:1.5;margin-top:24px">
          Stripe Fee Auditor · Not affiliated with Stripe, Inc.<br>
          Questions? Reply to this email.
        </p>
      </div>
    `,
  });
}

export async function sendBillingPortalEmail(to: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] RESEND_API_KEY not set, skipping billing portal email to ${to}`);
    return;
  }

  const from = process.env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;
  const billingUrl = buildBillingPortalUrl(to);

  await getResend().emails.send({
    from,
    to,
    subject: "Manage your Fee Monitor subscription",
    replyTo: process.env.EMAIL_REPLY_TO,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <p style="color:#2563eb;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin:0 0 10px">
          Fee Monitor billing
        </p>
        <h1 style="font-size:20px;color:#111;margin:0 0 12px">
          Manage your subscription
        </h1>
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px">
          Use this private link to open the Polar customer portal. You can update payment details,
          view receipts, or cancel Fee Monitor.
        </p>
        <a href="${billingUrl}"
           style="display:inline-block;margin:8px 0 16px;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px">
          Manage billing →
        </a>
        <p style="color:#888;font-size:12px;line-height:1.5;margin-top:16px">
          This link expires soon. If it expires, request a fresh one from the Fee Monitor page.
        </p>
      </div>
    `,
  });
}

export async function sendMonthlyCsvReminderEmail(params: {
  to: string;
  audience: MonthlyReminderAudience;
  reminderCount?: number;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] RESEND_API_KEY not set, skipping monthly reminder to ${params.to}`);
    return;
  }

  const from = process.env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? DEFAULT_BASE_URL;
  const analyzeUrl = new URL("/analyze", baseUrl);
  analyzeUrl.searchParams.set("utm_source", "email");
  analyzeUrl.searchParams.set("utm_medium", "monthly_reminder");
  analyzeUrl.searchParams.set("utm_campaign", params.audience === "monitor" ? "fee_monitor" : "newsletter");

  const isMonitor = params.audience === "monitor";
  const subject = isMonitor
    ? "Fee Monitor: time to check this month's Stripe CSV"
    : "Monthly Stripe fee check: did your rate drift?";

  const intro = isMonitor
    ? "Your monthly Fee Monitor check is due. Upload a fresh Stripe Balance CSV and compare this month against your previous audit."
    : "Stripe fees can drift quietly month to month. Upload a fresh Balance CSV when you have a minute and check whether your real rate moved.";

  const footer = isMonitor
    ? `You received this because you joined Fee Monitor. Questions? Reply to this email.`
    : `You received this because you subscribed to monthly Stripe fee tips. <a href="${buildNewsletterUnsubscribeUrl(
        params.to
      )}" style="color:#888">Unsubscribe</a>.`;

  await getResend().emails.send({
    from,
    to: params.to,
    subject,
    replyTo: process.env.EMAIL_REPLY_TO,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <p style="color:#2563eb;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin:0 0 10px">
          ${isMonitor ? "Fee Monitor" : "Monthly fee tips"}
        </p>
        <h1 style="font-size:20px;color:#111;margin:0 0 12px">
          Time for your monthly Stripe fee check
        </h1>
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px">
          ${intro}
        </p>
        <ul style="color:#555;font-size:14px;margin:0 0 20px;padding-left:20px;line-height:1.6">
          <li>See your processing rate vs all-in Stripe cost</li>
          <li>Spot month-over-month rate changes</li>
          <li>Find new high-fee charges, refunds, and small-charge drag</li>
        </ul>
        <a href="${analyzeUrl.toString()}"
           style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px">
          Upload this month's CSV →
        </a>
        <p style="color:#888;font-size:12px;line-height:1.5;margin-top:24px">
          Stripe Fee Auditor · Not affiliated with Stripe, Inc.<br>
          ${footer}
        </p>
      </div>
    `,
  });
}
