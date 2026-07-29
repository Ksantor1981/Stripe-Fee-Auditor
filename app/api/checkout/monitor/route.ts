import { NextRequest, NextResponse } from "next/server";
import { consumeIpRequest, extendReportForCheckout, getReportWithAccess } from "@/lib/db";
import { buildMonitorCheckoutUrl } from "@/lib/polar";
import { getTrustedClientIp } from "@/lib/request-ip";
import { resolveReportAccessFromRequest } from "@/lib/report-access-cookie";
import { isValidWaitlistEmail, normalizeWaitlistEmail } from "@/lib/waitlist";

const MONITOR_CHECKOUT_LIMIT_PER_IP_PER_DAY = 10;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeSource(value: string | null): string {
  const source = (value ?? "monitor").trim();
  return /^[a-z0-9_-]{1,64}$/i.test(source) ? source : "monitor";
}

function sanitizeReturnPath(value: string | null): string {
  const path = value?.trim();
  if (!path) return "/monitor";
  if (path === "/monitor" || path === "/analyze") return path;

  const reportMatch = path.match(/^\/report\/([^/?#]+)$/);
  if (reportMatch && UUID_V4.test(reportMatch[1])) return path;

  return "/monitor";
}

function getReportIdFromPath(path: string): string | null {
  const reportMatch = path.match(/^\/report\/([^/?#]+)$/);
  if (!reportMatch || !UUID_V4.test(reportMatch[1])) return null;
  return reportMatch[1];
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

  const returnPath = sanitizeReturnPath(req.nextUrl.searchParams.get("return_to"));
  const reportId = getReportIdFromPath(returnPath);
  let reportAccessToken: string | undefined;

  if (reportId) {
    const token = resolveReportAccessFromRequest(req, reportId);
    if (token) {
      const report = await getReportWithAccess(reportId, token).catch(() => null);
      if (report) {
        await extendReportForCheckout(reportId, token).catch(() => false);
        reportAccessToken = token;
      }
    }
  }

  try {
    const url = await buildMonitorCheckoutUrl({
      email,
      source: sanitizeSource(req.nextUrl.searchParams.get("source")),
      returnPath,
      reportId: reportAccessToken ? reportId ?? undefined : undefined,
      accessToken: reportAccessToken,
    });
    return NextResponse.redirect(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Checkout unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
