import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/lemonsqueezy";
import { markReportPaid } from "@/lib/db";
import { sendReportEmail } from "@/lib/email";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error("[webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { meta: { event_name: string; custom_data?: { report_id?: string } }; data: { attributes: { user_email?: string } } };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = event.meta?.event_name;

  // Handle successful payment
  if (eventName === "order_created") {
    const reportId = event.meta?.custom_data?.report_id;
    const email = event.data?.attributes?.user_email;

    if (!reportId) {
      console.warn("[webhook] order_created without report_id in custom_data");
      return NextResponse.json({ received: true });
    }

    try {
      await markReportPaid(reportId, email ?? "");
      console.log(`[webhook] Report ${reportId} marked as paid`);

      if (email) {
        await sendReportEmail(email, reportId).catch((err) =>
          console.error("[webhook] Email send failed:", err)
        );
      }
    } catch (err) {
      console.error("[webhook] DB update failed:", err);
      // Return 200 to prevent LemonSqueezy from retrying; log for manual review
    }
  }

  return NextResponse.json({ received: true });
}
