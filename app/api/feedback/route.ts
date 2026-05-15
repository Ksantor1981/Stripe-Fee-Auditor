import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const maxDuration = 15;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FEEDBACK_EMAIL = process.env.FEEDBACK_TO ?? "ksantor19811606@gmail.com";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { reportId, useful, missing, willPay } = body as {
    reportId?: string;
    useful?: string;
    missing?: string;
    willPay?: string;
  };

  if (!useful || (useful !== "yes" && useful !== "no")) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const missingSafe = missing ? escapeHtml(missing).replace(/\n/g, "<br>") : "";
  const willPaySafe = willPay ? escapeHtml(willPay) : "";
  const reportSafe = reportId ? escapeHtml(String(reportId)) : "unknown";

  // Send email via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "Fee Auditor <noreply@feeauditor.com>",
        to: FEEDBACK_EMAIL,
        replyTo: FEEDBACK_EMAIL,
        subject: `[Feedback] ${useful === "yes" ? "👍 Useful" : "👎 Not useful"} — feeauditor.com`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
            <h2 style="font-size:18px;color:#111;margin-bottom:16px">
              New feedback from feeauditor.com
            </h2>

            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr>
                <td style="padding:8px 0;color:#666;width:140px">Was it useful?</td>
                <td style="padding:8px 0;font-weight:600;color:${useful === "yes" ? "#059669" : "#dc2626"}">
                  ${useful === "yes" ? "👍 Yes" : "👎 No"}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#666;vertical-align:top">What's missing?</td>
                <td style="padding:8px 0;color:#111">
                  ${missing ? missingSafe : "<span style='color:#999'>— not filled —</span>"}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#666">Would they pay?</td>
                <td style="padding:8px 0;color:#111;font-weight:600">
                  ${willPay ? willPaySafe : "<span style='color:#999'>— not filled —</span>"}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#666">Report ID</td>
                <td style="padding:8px 0;color:#999;font-size:12px;font-family:monospace">
                  ${reportSafe}
                </td>
              </tr>
            </table>
          </div>
        `,
      });
    } catch (err) {
      console.error("[feedback] Email send failed:", err);
      // Don't return error — feedback acknowledged, email is best-effort
    }
  }

  return NextResponse.json({ received: true });
}
