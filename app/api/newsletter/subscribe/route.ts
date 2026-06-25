import { NextRequest, NextResponse } from "next/server";
import { readAttributionFromRequest } from "@/lib/attribution";
import { consumeIpRequest, insertNewsletterSubscriber } from "@/lib/db";
import { logFunnelServer } from "@/lib/funnel-log";
import { getTrustedClientIp } from "@/lib/request-ip";
import { isValidWaitlistEmail, normalizeWaitlistEmail } from "@/lib/waitlist";

export const maxDuration = 15;

const NEWSLETTER_LIMIT_PER_IP_PER_DAY = 10;
const MAX_BODY_BYTES = 2 * 1024;

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  const ip = getTrustedClientIp(req);
  if (!ip) {
    return NextResponse.json({ error: "Unable to process request" }, { status: 400 });
  }

  const allowed = await consumeIpRequest(`newsletter:${ip}`, NEWSLETTER_LIMIT_PER_IP_PER_DAY);
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

  const payload = body as { email?: string; source?: string };
  const email = normalizeWaitlistEmail(asTrimmedString(payload.email));
  const source = asTrimmedString(payload.source) || "landing";

  if (!isValidWaitlistEmail(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (source.length > 64) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  const result = await insertNewsletterSubscriber({
    email,
    source,
    attribution: readAttributionFromRequest(req),
  });

  if (result === "inserted") {
    logFunnelServer("funnel_newsletter_signup", { source });
  }

  return NextResponse.json({ ok: true, status: result });
}
