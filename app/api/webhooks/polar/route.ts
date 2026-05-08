import { NextRequest, NextResponse } from "next/server";
import { isAllowedProductId, verifyPolarWebhook } from "@/lib/polar";
import { processPaidWebhook } from "@/lib/db";
import { sendReportEmail } from "@/lib/email";

export const maxDuration = 30;

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  // Only handle successful orders
  if (event.type !== "order.created") {
    return NextResponse.json({ received: true });
  }

  const order = event.data;
  const eventId = order.id;
  const productId = order.productId;
  const email = order.customer?.email ?? "";

  if (!productId || !isAllowedProductId(productId)) {
    console.warn(`[polar-webhook] Unknown or missing product id: ${productId}`);
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  // Extract report_id and access_token from metadata
  const metadata = (order.metadata ?? {}) as Record<string, string>;
  const reportId = metadata["report_id"];
  const accessToken = metadata["access_token"];

  if (!eventId) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  if (!reportId || !UUID_V4.test(reportId) || !accessToken) {
    console.warn("[polar-webhook] order.created without valid report_id/access_token in metadata");
    return NextResponse.json({ error: "Invalid report metadata" }, { status: 400 });
  }

  try {
    const status = await processPaidWebhook({
      eventId,
      eventName: "order.created",
      reportId,
      email,
      accessToken,
    });

    if (status === "duplicate") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (status === "report_not_found") {
      console.warn("[polar-webhook] report_not_found for paid order", String(eventId).slice(0, 16));
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (email) {
      await sendReportEmail(email, reportId, accessToken).catch((err) =>
        console.error("[polar-webhook] Email send failed:", err)
      );
    }
  } catch (err) {
    console.error("[polar-webhook] DB update failed:", err);
    // Return 500 so Polar retries — user paid, must not lose the unlock
    return NextResponse.json({ error: "DB error, will retry" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
