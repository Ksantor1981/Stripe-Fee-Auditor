import { NextRequest, NextResponse } from "next/server";
import { buildCheckoutUrl, type PlanId } from "@/lib/lemonsqueezy";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const planId = searchParams.get("plan") as PlanId | null;
  const reportId = searchParams.get("reportId");
  const email = searchParams.get("email") ?? undefined;

  if (!planId || !reportId) {
    return NextResponse.json({ error: "plan and reportId are required" }, { status: 400 });
  }

  try {
    const url = buildCheckoutUrl(planId, reportId, email);
    return NextResponse.redirect(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Checkout unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
