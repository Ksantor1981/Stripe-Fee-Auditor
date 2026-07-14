import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { verifyCronBearer } from "@/lib/cron-bearer";
import { logOpsError, logOpsInfo } from "@/lib/ops-log";

export const maxDuration = 60;

const DELETE_BATCH_SIZE = 5000;
const MAX_DELETE_BATCHES = 20;

async function drainDelete(runBatch: () => Promise<unknown[]>): Promise<number> {
  let total = 0;

  for (let i = 0; i < MAX_DELETE_BATCHES; i += 1) {
    const rows = await runBatch();
    total += rows.length;

    if (rows.length < DELETE_BATCH_SIZE) break;
  }

  return total;
}

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
    const deletedReports = await drainDelete(() => sql`
      DELETE FROM reports
      WHERE id IN (
        SELECT id FROM reports WHERE expires_at < NOW() LIMIT ${DELETE_BATCH_SIZE}
      )
      RETURNING id
    `);

    const deletedRateLimits = await drainDelete(() => sql`
      DELETE FROM rate_limits
      WHERE ctid IN (
        SELECT ctid FROM rate_limits WHERE created_at < NOW() - INTERVAL '2 days' LIMIT ${DELETE_BATCH_SIZE}
      )
      RETURNING id
    `);

    const deletedCheckoutSessions = await drainDelete(() => sql`
      DELETE FROM checkout_sessions
      WHERE checkout_id IN (
        SELECT checkout_id FROM checkout_sessions WHERE expires_at < NOW() LIMIT ${DELETE_BATCH_SIZE}
      )
      RETURNING checkout_id
    `);

    const deletedWebhookEvents = await drainDelete(() => sql`
      DELETE FROM webhook_events
      WHERE ctid IN (
        SELECT ctid FROM webhook_events WHERE created_at < NOW() - INTERVAL '90 days' LIMIT ${DELETE_BATCH_SIZE}
      )
      RETURNING id
    `);

    const body = {
      ok: true,
      deletedReports,
      deletedRateLimits,
      deletedCheckoutSessions,
      deletedWebhookEvents,
      deleteBatchSize: DELETE_BATCH_SIZE,
      maxDeleteBatches: MAX_DELETE_BATCHES,
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
