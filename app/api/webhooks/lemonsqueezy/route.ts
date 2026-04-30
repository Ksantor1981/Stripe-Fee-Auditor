import { NextRequest, NextResponse } from "next/server";
import { isAllowedVariantId, verifyWebhookSignature } from "@/lib/lemonsqueezy";
import { processPaidWebhook } from "@/lib/db";
import { sendReportEmail } from "@/lib/email";

export const maxDuration = 30;

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type LemonSqueezyEvent = {
  meta?: {
    event_name?: string;
    custom_data?: {
      report_id?: string;
      access_token?: string;
    };
  };
  data?: {
    id?: string;
    attributes?: {
      user_email?: string;
      variant_id?: number | string;
      first_order_item?: {
        variant_id?: number | string;
      };
    };
  };
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error("[webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: LemonSqueezyEvent;

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = event.meta?.event_name;

  // Handle successful payment
  if (eventName === "order_created") {
    const eventId = event.data?.id;
    const reportId = event.meta?.custom_data?.report_id;
    const accessToken = event.meta?.custom_data?.access_token;
    const email = event.data?.attributes?.user_email;
    const variantId = String(
      event.data?.attributes?.first_order_item?.variant_id ??
      event.data?.attributes?.variant_id ??
      ""
    );

    if (!eventId) {
      return NextResponse.json({ error: "Missing event id" }, { status: 400 });
    }

    if (!reportId || !UUID_V4.test(reportId) || !accessToken) {
      console.warn("[webhook] order_created without valid report_id/access_token in custom_data");
      return NextResponse.json({ error: "Invalid report metadata" }, { status: 400 });
    }

    if (!isAllowedVariantId(variantId)) {
      console.warn(`[webhook] Unknown variant id: ${variantId || "(missing)"}`);
      return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
    }

    try {
      const status = await processPaidWebhook({
        eventId,
        eventName,
        reportId,
        email: email ?? "",
        accessToken,
      });

      if (status === "duplicate") {
        return NextResponse.json({ received: true, duplicate: true });
      }

      if (status === "report_not_found") {
        console.warn(`[webhook] Report ${reportId} not found for paid order ${eventId}`);
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }

      console.log(`[webhook] Report ${reportId} marked as paid`);

      if (email) {
        await sendReportEmail(email, reportId, accessToken).catch((err) =>
          console.error("[webhook] Email send failed:", err)
        );
      }
    } catch (err) {
      console.error("[webhook] DB update failed:", err);
      // Return 500 so LemonSqueezy retries — user paid, must not lose the unlock
      return NextResponse.json({ error: "DB error, will retry" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
