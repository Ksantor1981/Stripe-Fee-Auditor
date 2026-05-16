import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { consumeIpRequest } from "@/lib/db";
import { getTrustedClientIp } from "@/lib/request-ip";

export const maxDuration = 15;

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FEEDBACK_LIMIT_PER_IP_PER_DAY = 10;
const MAX_BODY_BYTES = 8 * 1024;
const MAX_MISSING_LEN = 1200;
const MAX_WILL_PAY_LEN = 200;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

const FEEDBACK_EMAIL = process.env.FEEDBACK_TO ?? "ksantor19811606@gmail.com";

export async function POST(req: NextRequest) {
  const ip = getTrustedClientIp(req);
  if (!ip) {
    return NextResponse.json({ error: "Unable to process request" }, { status: 400 });
  }

  const allowed = await consumeIpRequest(`feedback:${ip}`, FEEDBACK_LIMIT_PER_IP_PER_DAY);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many feedback submissions from this network. Try again tomorrow." },
      { status: 429 }
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  const rawBody = await req.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as {
    reportId?: string;
    useful?: string;
    missing?: string;
    willPay?: string;
  };
  const reportId = asTrimmedString(payload.reportId);
  const useful = asTrimmedString(payload.useful);
  const missing = asTrimmedString(payload.missing);
  const willPay = asTrimmedString(payload.willPay);

  if (!useful || (useful !== "yes" && useful !== "no")) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (missing.length > MAX_MISSING_LEN || willPay.length > MAX_WILL_PAY_LEN) {
    return NextResponse.json({ error: "Feedback is too long" }, { status: 413 });
  }

  if (reportId && !UUID_V4.test(reportId)) {
    return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
  }

  const missingSafe = missing ? escapeHtml(missing).replace(/\n/g, "<br>") : "";
  const willPaySafe = willPay ? escapeHtml(willPay) : "";
  const reportSafe = reportId ? escapeHtml(reportId) : "unknown";

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
