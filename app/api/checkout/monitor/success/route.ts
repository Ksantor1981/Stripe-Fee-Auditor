import { NextRequest, NextResponse } from "next/server";
import { getCheckoutSession, processPaidWebhook, upsertMonitorSubscriberFromPayment } from "@/lib/db";
import { sendMonitorWelcomeEmail } from "@/lib/email";
import { getSucceededCheckout, isMonitorProductId } from "@/lib/polar";
import { logOpsError, logOpsWarn } from "@/lib/ops-log";
import { appendReportAccessCookie } from "@/lib/report-access-cookie";

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

function redirectTo(
  req: NextRequest,
  path: string,
  reportSession?: { reportId: string; accessToken: string } | null
): NextResponse {
  const response = NextResponse.redirect(new URL(path, req.url));
  if (reportSession) {
    appendReportAccessCookie(response, reportSession.reportId, reportSession.accessToken);
  }
  return response;
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
        customerId: checkout.customerId,
        subscriptionId: checkout.subscriptionId,
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

    const reportSession = await getCheckoutSession(checkoutId).catch((err) => {
      logOpsWarn("monitor_checkout_success_session_lookup_failed", {
        checkoutId: checkoutId.slice(0, 16),
        message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      });
      return null;
    });

    if (reportSession?.reportId && reportSession.accessToken) {
      const status = await processPaidWebhook({
        eventId: `monitor.checkout.success:${checkoutId}`,
        eventName: "monitor.checkout.success",
        reportId: reportSession.reportId,
        email: checkout.email,
        accessToken: reportSession.accessToken,
      });

      if (status === "report_not_found") {
        logOpsError("monitor_checkout_success_report_unlock_failed", {
          checkoutId: checkoutId.slice(0, 16),
          reportId: reportSession.reportId.slice(0, 8),
        });
      }
    }

    return redirectTo(req, "/monitor?payment=success", reportSession);
  } catch (err) {
    logOpsError("monitor_checkout_success_failed", {
      checkoutId: checkoutId.slice(0, 16),
      message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
    });
    return redirectTo(req, "/monitor?payment=pending");
  }
}
