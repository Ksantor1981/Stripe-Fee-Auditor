import { NextRequest, NextResponse } from "next/server";
import {
  getCheckoutReportMetadata,
  isAllowedProductId,
  isMonitorProductId,
  readReportMetadata,
  verifyPolarWebhook,
} from "@/lib/polar";
import {
  getCheckoutSession,
  processPaidWebhook,
  syncMonitorSubscriberFromSubscription,
  upsertMonitorSubscriberFromPayment,
} from "@/lib/db";
import { sendMonitorWelcomeEmail, sendReportEmail } from "@/lib/email";
import { logOpsError, logOpsWarn } from "@/lib/ops-log";

export const maxDuration = 30;

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UnlockPayload = {
  eventId: string;
  eventName: string;
  productId: string | null;
  email: string;
  reportId?: string;
  accessToken?: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  metadataLookupFailed?: boolean;
};

function shortId(value: string | null | undefined): string | null {
  return value ? value.slice(0, 16) : null;
}

async function buildUnlockPayload(event: ReturnType<typeof verifyPolarWebhook>): Promise<UnlockPayload | null> {
  if (event.type === "order.paid" || event.type === "order.created") {
    const order = event.data;

    if (!order.paid || order.status !== "paid") {
      console.info(`[polar-webhook] Ignoring ${event.type} for unpaid order`, {
        orderId: shortId(order.id),
        status: order.status,
        paid: order.paid,
      });
      return null;
    }

    const orderMetadata = readReportMetadata(order.metadata);
    let reportId = orderMetadata.reportId;
    let accessToken: string | undefined;
    let metadataLookupFailed = false;

    if ((!reportId || !accessToken) && order.checkoutId) {
      try {
        const checkoutSession = await getCheckoutSession(order.checkoutId);
        reportId ??= checkoutSession?.reportId;
        accessToken ??= checkoutSession?.accessToken;
      } catch (err) {
        metadataLookupFailed = true;
        logOpsError("polar_webhook_checkout_lookup_failed", {
          message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
        });
      }
    }

    if ((!reportId || !accessToken) && order.checkoutId) {
      try {
        const checkoutMetadata = await getCheckoutReportMetadata(order.checkoutId);
        reportId ??= checkoutMetadata.reportId;
      } catch (err) {
        metadataLookupFailed = true;
        logOpsError("polar_webhook_checkout_metadata_failed", {
          message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
        });
      }
    }

    return {
      eventId: `${event.type}:${order.id}`,
      eventName: event.type,
      productId: order.productId,
      email: order.customer?.email ?? "",
      reportId,
      accessToken,
      customerId: order.customerId,
      subscriptionId: order.subscriptionId,
      metadataLookupFailed,
    };
  }

  if (event.type === "checkout.updated") {
    const checkout = event.data;

    if (checkout.status !== "succeeded") {
      return null;
    }

    const metadata = readReportMetadata(checkout.metadata);
    const checkoutSession = await getCheckoutSession(checkout.id);
    return {
      eventId: `${event.type}:${checkout.id}`,
      eventName: event.type,
      productId: checkout.productId,
      email: checkout.customerEmail ?? "",
      reportId: checkoutSession?.reportId ?? metadata.reportId,
      accessToken: checkoutSession?.accessToken,
      customerId: checkout.customerId,
      subscriptionId: checkout.subscriptionId,
    };
  }

  return null;
}

function subscriptionStatusForAccess(eventType: string, status: string): string {
  if (eventType === "subscription.canceled") return "canceled";
  if (eventType === "subscription.revoked") return "revoked";
  if (eventType === "subscription.past_due") return "past_due";
  return status;
}

async function handleSubscriptionEvent(event: ReturnType<typeof verifyPolarWebhook>): Promise<NextResponse | null> {
  if (
    event.type !== "subscription.created" &&
    event.type !== "subscription.updated" &&
    event.type !== "subscription.active" &&
    event.type !== "subscription.uncanceled" &&
    event.type !== "subscription.canceled" &&
    event.type !== "subscription.revoked" &&
    event.type !== "subscription.past_due"
  ) {
    return null;
  }

  const subscription = event.data;
  if (!isMonitorProductId(subscription.productId)) {
    return NextResponse.json({ received: true, ignored: "non-monitor-subscription" });
  }

  try {
    await syncMonitorSubscriberFromSubscription({
      email: subscription.customer.email ?? null,
      customerId: subscription.customerId,
      subscriptionId: subscription.id,
      productId: subscription.productId,
      status: subscriptionStatusForAccess(event.type, subscription.status),
      currentPeriodEnd: subscription.currentPeriodEnd,
      canceledAt: subscription.canceledAt,
      source: event.type,
    });
  } catch (err) {
    logOpsError("polar_webhook_subscription_sync_failed", {
      eventName: event.type,
      message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
    });
    return NextResponse.json({ error: "Subscription sync failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true, subscription: true });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Build headers map for Polar webhook verification
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let event: ReturnType<typeof verifyPolarWebhook>;
  try {
    event = verifyPolarWebhook(rawBody, headers);
  } catch {
    logOpsWarn("polar_webhook_invalid_signature", {});
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const subscriptionResponse = await handleSubscriptionEvent(event);
  if (subscriptionResponse) return subscriptionResponse;

  // order.paid is the normal paid path. order.created can be already paid for
  // fully discounted/free orders. checkout.updated covers succeeded checkouts
  // where order metadata is delayed or unavailable.
  const unlock = await buildUnlockPayload(event);
  if (!unlock) {
    return NextResponse.json({ received: true });
  }

  const { eventId, eventName, productId, email, reportId, accessToken, customerId, subscriptionId } = unlock;

  if (!productId || !isAllowedProductId(productId)) {
    logOpsWarn("polar_webhook_invalid_product", {
      eventName,
      eventId: shortId(eventId) ?? "unknown",
    });
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  if (isMonitorProductId(productId)) {
    if (email) {
      try {
        const { isNewSubscriber } = await upsertMonitorSubscriberFromPayment({
          email,
          productId,
          customerId,
          subscriptionId,
          source: eventName,
        });

        if (isNewSubscriber) {
          await sendMonitorWelcomeEmail(email).catch((err) =>
            logOpsError("polar_webhook_monitor_welcome_email_failed", {
              message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
              eventId: shortId(eventId) ?? "unknown",
            })
          );
        }
      } catch (err) {
        logOpsError("polar_webhook_monitor_subscriber_failed", {
          message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
          eventId: shortId(eventId) ?? "unknown",
        });
        return NextResponse.json({ error: "Monitor subscriber save failed" }, { status: 500 });
      }
    }

    if (reportId && UUID_V4.test(reportId) && accessToken) {
      try {
        const status = await processPaidWebhook({
          eventId: `monitor:${eventId}`,
          eventName: `monitor.${eventName}`,
          reportId,
          email,
          accessToken,
        });

        if (status === "report_not_found") {
          logOpsError("polar_webhook_monitor_report_unlock_failed", {
            eventName,
            eventId: shortId(eventId) ?? "unknown",
            reportId: reportId.slice(0, 8),
          });
        }
      } catch (err) {
        logOpsError("polar_webhook_monitor_report_unlock_error", {
          message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
          eventId: shortId(eventId) ?? "unknown",
        });
      }
    }

    return NextResponse.json({ received: true, monitor: true });
  }

  if (!reportId || !UUID_V4.test(reportId) || !accessToken) {
    logOpsWarn("polar_webhook_missing_metadata", {
      eventName,
      eventId: shortId(eventId) ?? "unknown",
      hasReportId: Boolean(reportId),
      hasAccessToken: Boolean(accessToken),
    });

    if (unlock.metadataLookupFailed) {
      return NextResponse.json({ error: "Metadata lookup failed, will retry" }, { status: 500 });
    }

    return NextResponse.json({ error: "Invalid report metadata" }, { status: 400 });
  }

  try {
    const status = await processPaidWebhook({
      eventId,
      eventName,
      reportId,
      email,
      accessToken,
    });

    if (status === "duplicate") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (status === "already_paid") {
      return NextResponse.json({ received: true, alreadyPaid: true });
    }

    if (status === "report_not_found") {
      logOpsError("polar_webhook_report_not_found", {
        eventId: shortId(eventId) ?? "unknown",
      });
      return NextResponse.json({ error: "Report not found, will retry" }, { status: 500 });
    }
  } catch (err) {
    logOpsError("polar_webhook_db_failed", {
      message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      eventId: shortId(eventId) ?? "unknown",
    });
    return NextResponse.json({ error: "DB error, will retry" }, { status: 500 });
  }

  if (email) {
    // Get total fees from report result for personalized subject line
    let totalFeesCents: number | undefined;
    try {
      const { getReportWithAccess } = await import("@/lib/db");
      const report = await getReportWithAccess(reportId, accessToken);
      if (report?.result) {
        const r = report.result;
        totalFeesCents = Math.round((r.chargeFees + r.otherFees) * 100);
      }
    } catch {
      // non-critical — send email without fee amount
    }

    await sendReportEmail(email, reportId, accessToken, totalFeesCents).catch((err) =>
      logOpsError("polar_webhook_email_failed", {
        message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
        reportId: reportId.slice(0, 8),
      })
    );
  }

  return NextResponse.json({ received: true });
}
