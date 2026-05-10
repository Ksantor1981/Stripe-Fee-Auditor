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
  const reportUrl = new URL(`/report/${reportId}`, baseUrl);
  if (accessToken) reportUrl.searchParams.set("token", accessToken);

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
