import { NextRequest, NextResponse } from "next/server";
import { consumeIpRequest, insertMonitorWaitlistSignup } from "@/lib/db";
import { sendWaitlistConfirmationEmail, sendWaitlistNotifyEmail } from "@/lib/email";
import { logFunnelServer } from "@/lib/funnel-log";
import { getTrustedClientIp } from "@/lib/request-ip";
import { isValidWaitlistEmail, normalizeWaitlistEmail } from "@/lib/waitlist";

export const maxDuration = 15;

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WAITLIST_LIMIT_PER_IP_PER_DAY = 10;
const MAX_BODY_BYTES = 2 * 1024;

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  const ip = getTrustedClientIp(req);
  if (!ip) {
    return NextResponse.json({ error: "Unable to process request" }, { status: 400 });
  }

  const allowed = await consumeIpRequest(`waitlist:${ip}`, WAITLIST_LIMIT_PER_IP_PER_DAY);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many signups from this network. Try again tomorrow." },
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

  const payload = body as { email?: string; reportId?: string; source?: string };
  const email = normalizeWaitlistEmail(asTrimmedString(payload.email));
  const reportId = asTrimmedString(payload.reportId);
  const source = asTrimmedString(payload.source) || "report";

  if (!isValidWaitlistEmail(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (reportId && !UUID_V4.test(reportId)) {
    return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
  }

  if (source.length > 64) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  const result = await insertMonitorWaitlistSignup({
    email,
    reportId: reportId || null,
    source,
  });

  if (result === "inserted") {
    logFunnelServer("waitlist_signup", {
      report_id: reportId || "",
      source,
    });

    try {
      await sendWaitlistNotifyEmail({ email, reportId: reportId || null, source });
    } catch (err) {
      console.error("[waitlist] Notify email failed:", err);
    }
  }

  try {
    await sendWaitlistConfirmationEmail({ email, source, status: result });
  } catch (err) {
    console.error("[waitlist] Confirmation email failed:", err);
  }

  return NextResponse.json({ ok: true, status: result });
}
