import { Resend } from "resend";

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
          <li>Your top fee drivers and anomalies</li>
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