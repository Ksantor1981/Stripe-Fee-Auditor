import { NextRequest, NextResponse } from "next/server";
import { consumeIpRequest, getCheckoutSession, processPaidWebhook } from "@/lib/db";
import { sendReportEmail } from "@/lib/email";
import { getSucceededCheckout, isAllowedProductId } from "@/lib/polar";
import { appendReportAccessCookie } from "@/lib/report-access-cookie";
import { getTrustedClientIp } from "@/lib/request-ip";

export const dynamic = "force-dynamic";

const CHECKOUT_SUCCESS_LIMIT_PER_IP_PER_DAY = 10;

export async function GET(req: NextRequest) {
  const ip = getTrustedClientIp(req);
  if (ip && !(await consumeIpRequest(`checkout_success:${ip}`, CHECKOUT_SUCCESS_LIMIT_PER_IP_PER_DAY))) {
    return NextResponse.json(
      { error: "Too many checkout confirmation requests from this network. Try again later." },
      { status: 429 }
    );
  }

  const checkoutId = req.nextUrl.searchParams.get("checkout_id") ?? "";

  if (!checkoutId) {
    return NextResponse.redirect(new URL("/analyze?checkout=missing", req.url));
  }

  const session = await getCheckoutSession(checkoutId);
  if (!session) {
    return NextResponse.redirect(new URL("/analyze?checkout=expired", req.url));
  }

  try {
    const checkout = await getSucceededCheckout(checkoutId);
    if (checkout?.productId && isAllowedProductId(checkout.productId)) {
      const status = await processPaidWebhook({
        eventId: `checkout.success:${checkoutId}`,
        eventName: "checkout.success",
        reportId: session.reportId,
        email: checkout.email,
        accessToken: session.accessToken,
      });

      if (status === "processed" && checkout.email) {
        await sendReportEmail(checkout.email, session.reportId, session.accessToken).catch((err) =>
          console.error("[checkout-success] Email send failed:", err)
        );
      }
    }
  } catch (err) {
    console.error("[checkout-success] Could not confirm checkout status:", err);
  }

  const url = new URL(`/report/${session.reportId}`, req.url);
  url.searchParams.set("payment", "success");

  const response = NextResponse.redirect(url);
  appendReportAccessCookie(response, session.reportId, session.accessToken);
  return response;
}
