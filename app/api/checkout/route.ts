import { NextRequest, NextResponse } from "next/server";
import { buildCheckoutUrl, type PlanId } from "@/lib/lemonsqueezy";
import { getReport } from "@/lib/db";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const planId = searchParams.get("plan") as PlanId | null;
  const reportId = searchParams.get("reportId");
  const email = searchParams.get("email") ?? undefined;

  if (!planId || !reportId) {
    return NextResponse.json({ error: "plan and reportId are required" }, { status: 400 });
  }

  if (!UUID_V4.test(reportId)) {
    return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
  }

  const report = await getReport(reportId);
  if (!report) {
    return NextResponse.json(
      { error: "Report not found or expired. Please re-upload your CSV." },
      { status: 404 }
    );
  }

  if (report.is_paid) {
    return NextResponse.redirect(new URL(`/report/${reportId}`, req.url));
  }

  try {
    const url = buildCheckoutUrl(planId, reportId, email);
    return NextResponse.redirect(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Checkout unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
