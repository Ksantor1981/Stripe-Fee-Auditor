import { NextRequest, NextResponse } from "next/server";
import { consumeIpRequest, getReportWithAccess } from "@/lib/db";
import { getTrustedClientIp } from "@/lib/request-ip";
import { appendReportAccessCookie } from "@/lib/report-access-cookie";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACCESS_EXCHANGE_LIMIT_PER_IP_PER_DAY = 30;

/**
 * One-time exchange: email/bookmark links with ?token= land here, get an httpOnly cookie, then redirect to a clean report URL.
 */
export async function GET(req: NextRequest) {
  const reportId = req.nextUrl.searchParams.get("reportId") ?? "";
  const token = req.nextUrl.searchParams.get("token") ?? "";

  if (!UUID_V4.test(reportId) || !token) {
    return NextResponse.json({ error: "reportId and token are required" }, { status: 400 });
  }

  const ip = getTrustedClientIp(req);
  if (!ip) {
    return NextResponse.json({ error: "Unable to identify request" }, { status: 400 });
  }

  const allowed = await consumeIpRequest(`report_access:${ip}`, ACCESS_EXCHANGE_LIMIT_PER_IP_PER_DAY);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const report = await getReportWithAccess(reportId, token);
  if (!report) {
    const fallback = new URL("/analyze", req.url);
    fallback.searchParams.set("error", "invalid_report_link");
    return NextResponse.redirect(fallback);
  }

  const destination = new URL(`/report/${reportId}`, req.url);
  for (const [key, value] of req.nextUrl.searchParams.entries()) {
    if (key === "reportId" || key === "token") continue;
    destination.searchParams.set(key, value);
  }

  const response = NextResponse.redirect(destination);
  appendReportAccessCookie(response, reportId, token);
  return response;
}
