import { NextRequest, NextResponse } from "next/server";
import { consumeIpRequest } from "@/lib/db";
import { buildMonitorCheckoutUrl } from "@/lib/polar";
import { getTrustedClientIp } from "@/lib/request-ip";
import { isValidWaitlistEmail, normalizeWaitlistEmail } from "@/lib/waitlist";

const MONITOR_CHECKOUT_LIMIT_PER_IP_PER_DAY = 20;

function sanitizeSource(value: string | null): string {
  const source = (value ?? "monitor").trim();
  return /^[a-z0-9_-]{1,64}$/i.test(source) ? source : "monitor";
}

export async function GET(req: NextRequest) {
  const ip = getTrustedClientIp(req);
  if (!ip) {
    return NextResponse.json({ error: "Unable to process request" }, { status: 400 });
  }

  const allowed = await consumeIpRequest(`monitor_checkout:${ip}`, MONITOR_CHECKOUT_LIMIT_PER_IP_PER_DAY);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts from this network. Try again tomorrow." },
      { status: 429 }
    );
  }

  const rawEmail = req.nextUrl.searchParams.get("email");
  const email = rawEmail ? normalizeWaitlistEmail(rawEmail) : undefined;
  if (email && !isValidWaitlistEmail(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  try {
    const url = await buildMonitorCheckoutUrl({
      email,
      source: sanitizeSource(req.nextUrl.searchParams.get("source")),
    });
    return NextResponse.redirect(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Checkout unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
