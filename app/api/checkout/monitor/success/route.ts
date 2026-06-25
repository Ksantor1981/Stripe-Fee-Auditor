import { NextRequest, NextResponse } from "next/server";
import { upsertMonitorSubscriberFromPayment } from "@/lib/db";
import { sendMonitorWelcomeEmail } from "@/lib/email";
import { getSucceededCheckout, isMonitorProductId } from "@/lib/polar";
import { logOpsError, logOpsWarn } from "@/lib/ops-log";

export const dynamic = "force-dynamic";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeReturnPath(value: string | null): string {
  const path = value?.trim();
  if (!path) return "/monitor";
  if (path === "/monitor" || path === "/analyze") return path;

  const reportMatch = path.match(/^\/report\/([^/?#]+)$/);
  if (reportMatch && UUID_V4.test(reportMatch[1])) return path;

  return "/monitor";
}

function redirectTo(req: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, req.url));
}

export async function GET(req: NextRequest) {
  const checkoutId = req.nextUrl.searchParams.get("checkout_id") ?? "";
  const returnPath = sanitizeReturnPath(req.nextUrl.searchParams.get("return_to"));

  if (!checkoutId || checkoutId.includes("{CHECKOUT_ID}")) {
    return redirectTo(req, returnPath);
  }

  try {
    const checkout = await getSucceededCheckout(checkoutId);

    if (!checkout?.productId || !isMonitorProductId(checkout.productId)) {
      logOpsWarn("monitor_checkout_success_not_confirmed", {
        checkoutId: checkoutId.slice(0, 16),
        hasProductId: Boolean(checkout?.productId),
      });
      return redirectTo(req, returnPath);
    }

    if (checkout.email) {
      const { isNewSubscriber } = await upsertMonitorSubscriberFromPayment({
        email: checkout.email,
        productId: checkout.productId,
        source: "checkout.success",
      });

      if (isNewSubscriber) {
        await sendMonitorWelcomeEmail(checkout.email).catch((err) =>
          logOpsError("monitor_checkout_success_welcome_email_failed", {
            checkoutId: checkoutId.slice(0, 16),
            message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
          })
        );
      }
    }

    return redirectTo(req, "/monitor?payment=success");
  } catch (err) {
    logOpsError("monitor_checkout_success_failed", {
      checkoutId: checkoutId.slice(0, 16),
      message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
    });
    return redirectTo(req, "/monitor?payment=pending");
  }
}
