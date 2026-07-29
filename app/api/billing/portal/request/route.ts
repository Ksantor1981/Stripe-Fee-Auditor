import { NextRequest, NextResponse } from "next/server";
import { sendBillingPortalEmail } from "@/lib/email";
import { getTrustedClientIp } from "@/lib/request-ip";
import { consumeIpRequest, isActiveMonitorSubscriber } from "@/lib/db";
import { isValidWaitlistEmail, normalizeWaitlistEmail } from "@/lib/waitlist";
import { logOpsError } from "@/lib/ops-log";

export const maxDuration = 15;

const BILLING_PORTAL_LIMIT_PER_IP_PER_DAY = 5;
const MAX_BODY_BYTES = 2 * 1024;

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  const ip = getTrustedClientIp(req);
  if (!ip) {
    return NextResponse.json({ error: "Unable to process request" }, { status: 400 });
  }

  const allowed = await consumeIpRequest(`billing_portal:${ip}`, BILLING_PORTAL_LIMIT_PER_IP_PER_DAY);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many billing requests from this network. Try again tomorrow." },
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

  const email = normalizeWaitlistEmail(asTrimmedString((body as { email?: string }).email));
  if (!isValidWaitlistEmail(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Avoid turning this public endpoint into an email sender for arbitrary
  // addresses. The response stays generic so subscriber status is not exposed.
  if (!(await isActiveMonitorSubscriber(email))) {
    return NextResponse.json({ ok: true });
  }

  try {
    await sendBillingPortalEmail(email);
  } catch (err) {
    logOpsError("billing_portal_email_failed", {
      message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
    });
    return NextResponse.json({ error: "Could not send billing email. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
