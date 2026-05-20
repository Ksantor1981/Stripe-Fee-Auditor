import { NextRequest, NextResponse } from "next/server";
import { appendReportAccessCookie } from "@/lib/report-access-cookie";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * One-time exchange: email/bookmark links with ?token= land here, get an httpOnly cookie, then redirect to a clean report URL.
 */
export async function GET(req: NextRequest) {
  const reportId = req.nextUrl.searchParams.get("reportId") ?? "";
  const token = req.nextUrl.searchParams.get("token") ?? "";

  if (!UUID_V4.test(reportId) || !token) {
    return NextResponse.json({ error: "reportId and token are required" }, { status: 400 });
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
