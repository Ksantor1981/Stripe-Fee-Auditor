import { NextRequest, NextResponse } from "next/server";
import { getCheckoutSession, processPaidWebhook } from "@/lib/db";
import { sendReportEmail } from "@/lib/email";
import { getSucceededCheckout, isAllowedProductId } from "@/lib/polar";
import { appendReportAccessCookie } from "@/lib/report-access-cookie";

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
  url.searchParams.set("checkout_id", checkoutId);

  const response = NextResponse.redirect(url);
  appendReportAccessCookie(response, session.reportId, session.accessToken);
  return response;
}
