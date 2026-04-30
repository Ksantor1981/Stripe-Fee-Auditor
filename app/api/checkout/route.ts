import { NextRequest, NextResponse } from "next/server";
import { buildCheckoutUrl, isPlanId } from "@/lib/lemonsqueezy";
import { extendReportForCheckout, getReportWithAccess } from "@/lib/db";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const planId = searchParams.get("plan");
  const reportId = searchParams.get("reportId");
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? undefined;

  if (!planId || !reportId || !token) {
    return NextResponse.json({ error: "plan, reportId, and token are required" }, { status: 400 });
  }

  if (!isPlanId(planId)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (!UUID_V4.test(reportId)) {
    return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
  }

  const report = await getReportWithAccess(reportId, token);
  if (!report) {
    return NextResponse.json(
      { error: "Report not found or expired. Please re-upload your CSV." },
      { status: 404 }
    );
  }

  if (report.is_paid) {
    return NextResponse.redirect(new URL(`/report/${reportId}?token=${encodeURIComponent(token)}`, req.url));
  }

  try {
    const extended = await extendReportForCheckout(reportId, token);
    if (!extended) {
      return NextResponse.json({ error: "Report not found or expired" }, { status: 404 });
    }

    const url = buildCheckoutUrl(planId, reportId, token, email);
    return NextResponse.redirect(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Checkout unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
