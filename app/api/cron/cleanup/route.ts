import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { verifyCronBearer } from "@/lib/cron-bearer";
import { logOpsError, logOpsInfo } from "@/lib/ops-log";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const started = Date.now();
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    logOpsError("cron_cleanup_misconfigured", { reason: "CRON_SECRET missing" });
    return NextResponse.json({ error: "Cron is not configured" }, { status: 503 });
  }

  const authHeader = req.headers.get("authorization");
  if (!verifyCronBearer(authHeader, cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reportsResult = await sql`
      DELETE FROM reports
      WHERE id IN (
        SELECT id FROM reports WHERE expires_at < NOW() LIMIT 1000
      )
      RETURNING id
    `;

    const rateLimitsResult = await sql`
      DELETE FROM rate_limits
      WHERE ctid IN (
        SELECT ctid FROM rate_limits WHERE created_at < NOW() - INTERVAL '2 days' LIMIT 1000
      )
      RETURNING id
    `;

    const checkoutResult = await sql`
      DELETE FROM checkout_sessions
      WHERE expires_at < NOW()
      RETURNING checkout_id
    `;

    const webhookResult = await sql`
      DELETE FROM webhook_events
      WHERE ctid IN (
        SELECT ctid FROM webhook_events WHERE created_at < NOW() - INTERVAL '90 days' LIMIT 1000
      )
      RETURNING id
    `;

    const body = {
      ok: true,
      deletedReports: reportsResult.length,
      deletedRateLimits: rateLimitsResult.length,
      deletedCheckoutSessions: checkoutResult.length,
      deletedWebhookEvents: webhookResult.length,
      durationMs: Date.now() - started,
    };

    logOpsInfo("cron_cleanup_complete", body);
    return NextResponse.json(body);
  } catch (err) {
    logOpsError("cron_cleanup_failed", {
      message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      durationMs: Date.now() - started,
    });
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
