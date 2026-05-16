import { NextRequest, NextResponse } from "next/server";
import { getCheckoutSession } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const checkoutId = req.nextUrl.searchParams.get("checkout_id") ?? "";

  if (!checkoutId) {
    return NextResponse.redirect(new URL("/analyze?checkout=missing", req.url));
  }

  const session = await getCheckoutSession(checkoutId);
  if (!session) {
    return NextResponse.redirect(new URL("/analyze?checkout=expired", req.url));
  }

  const url = new URL(`/report/${session.reportId}`, req.url);
  url.searchParams.set("token", session.accessToken);
  url.searchParams.set("payment", "success");
  url.searchParams.set("checkout_id", checkoutId);

  return NextResponse.redirect(url);
}
