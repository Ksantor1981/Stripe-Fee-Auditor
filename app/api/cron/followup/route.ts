import { NextRequest, NextResponse } from "next/server";
import { claimReportsForFollowUp } from "@/lib/db";
import { sendFollowUpEmail } from "@/lib/email";
import { decryptSecretPayload } from "@/lib/token-crypto";
import { verifyCronBearer } from "@/lib/cron-bearer";
import { logOpsError, logOpsInfo } from "@/lib/ops-log";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const started = Date.now();
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    logOpsError("cron_followup_misconfigured", { reason: "CRON_SECRET missing" });
    return NextResponse.json({ error: "Cron is not configured" }, { status: 503 });
  }

  const authHeader = req.headers.get("authorization");
  if (!verifyCronBearer(authHeader, cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Atomic: marks follow_up_sent_at = NOW() and returns the claimed rows in
    // one statement. FOR UPDATE SKIP LOCKED prevents parallel cron runs from
    // claiming the same report twice.
    const reports = await claimReportsForFollowUp(50);

    let sent = 0;
    let failed = 0;

    for (const report of reports) {
      const accessToken = report.access_token_ciphertext
        ? decryptSecretPayload(report.access_token_ciphertext)
        : null;

      const totalFeesCents =
        report.all_in_fees != null ? Math.round(Number(report.all_in_fees) * 100) : undefined;

      const expiresAt = new Date(report.expires_at);

      try {
        await sendFollowUpEmail(report.email, report.id, accessToken, totalFeesCents, expiresAt);
        sent++;
      } catch (err) {
        failed++;
        logOpsError("cron_followup_email_failed", {
          reportId: report.id,
          message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
        });
      }
    }

    const body = {
      ok: true,
      found: reports.length,
      sent,
      failed,
      durationMs: Date.now() - started,
    };

    logOpsInfo("cron_followup_complete", body);
    return NextResponse.json(body);
  } catch (err) {
    logOpsError("cron_followup_failed", {
      message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      durationMs: Date.now() - started,
    });
    return NextResponse.json({ error: "Follow-up cron failed" }, { status: 500 });
  }
}
