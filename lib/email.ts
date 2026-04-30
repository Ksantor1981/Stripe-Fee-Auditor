import { Resend } from "resend";

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendReportEmail(to: string, reportId: string, accessToken?: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] RESEND_API_KEY not set, skipping email to ${to}`);
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://stripe-fee-auditor.vercel.app";
  const reportUrl = new URL(`/report/${reportId}`, baseUrl);
  if (accessToken) reportUrl.searchParams.set("token", accessToken);

  await getResend().emails.send({
    from: "Stripe Fee Auditor <noreply@stripe-fee-auditor.vercel.app>",
    to,
    subject: "Your Stripe Fee Report is ready",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;color:#111">Your Stripe fee report is ready</h1>
        <p style="color:#555;font-size:14px">Here is your private report link. Keep it handy if you want to return to the report later.</p>
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
