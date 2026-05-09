import { NextRequest, NextResponse } from "next/server";
import {
  getCheckoutReportMetadata,
  isAllowedProductId,
  readReportMetadata,
  verifyPolarWebhook,
} from "@/lib/polar";
import { processPaidWebhook } from "@/lib/db";
import { sendReportEmail } from "@/lib/email";

export const maxDuration = 30;

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UnlockPayload = {
  eventId: string;
  eventName: string;
  productId: string | null;
  email: string;
  reportId?: string;
  accessToken?: string;
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
    let accessToken = orderMetadata.accessToken;
    let metadataLookupFailed = false;

    if ((!reportId || !accessToken) && order.checkoutId) {
      try {
        const checkoutMetadata = await getCheckoutReportMetadata(order.checkoutId);
        reportId ??= checkoutMetadata.reportId;
        accessToken ??= checkoutMetadata.accessToken;
      } catch (err) {
        metadataLookupFailed = true;
        console.error("[polar-webhook] Checkout metadata lookup failed:", err);
      }
    }

    return {
      eventId: `${event.type}:${order.id}`,
      eventName: event.type,
      productId: order.productId,
      email: order.customer?.email ?? "",
      reportId,
      accessToken,
      metadataLookupFailed,
    };
  }

  if (event.type === "checkout.updated") {
    const checkout = event.data;

    if (checkout.status !== "succeeded") {
      return null;
    }

    const metadata = readReportMetadata(checkout.metadata);
    return {
      eventId: `${event.type}:${checkout.id}`,
      eventName: event.type,
      productId: checkout.productId,
      email: checkout.customerEmail ?? "",
      reportId: metadata.reportId,
      accessToken: metadata.accessToken,
    };
  }

  return null;
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
    console.error("[polar-webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // order.paid is the normal paid path. order.created can be already paid for
  // fully discounted/free orders. checkout.updated covers succeeded checkouts
  // where order metadata is delayed or unavailable.
  const unlock = await buildUnlockPayload(event);
  if (!unlock) {
    return NextResponse.json({ received: true });
  }

  const { eventId, eventName, productId, email, reportId, accessToken } = unlock;

  if (!productId || !isAllowedProductId(productId)) {
    console.warn(`[polar-webhook] Unknown or missing product id: ${productId}`, {
      eventName,
      eventId: shortId(eventId),
    });
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  if (!reportId || !UUID_V4.test(reportId) || !accessToken) {
    console.warn(`[polar-webhook] ${eventName} without valid report_id/access_token in metadata`, {
      eventId: shortId(eventId),
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
      console.warn("[polar-webhook] report_not_found for paid order", shortId(eventId));
      // Return 500 so Polar retries. A successful payment must not get stranded.
      return NextResponse.json({ error: "Report not found, will retry" }, { status: 500 });
    }
  } catch (err) {
    console.error("[polar-webhook] DB update failed:", err);
    // Return 500 so Polar retries - user paid, must not lose the unlock
    return NextResponse.json({ error: "DB error, will retry" }, { status: 500 });
  }

  if (email) {
    await sendReportEmail(email, reportId, accessToken).catch((err) =>
      console.error("[polar-webhook] Email send failed:", err)
    );
  }

  return NextResponse.json({ received: true });
}
