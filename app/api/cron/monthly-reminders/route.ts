import { NextRequest, NextResponse } from "next/server";
import {
  claimMonitorSubscribersForMonthlyReminder,
  claimNewsletterSubscribersForMonthlyReminder,
} from "@/lib/db";
import { verifyCronBearer } from "@/lib/cron-bearer";
import { sendMonthlyCsvReminderEmail } from "@/lib/email";
import { logOpsError, logOpsInfo } from "@/lib/ops-log";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const started = Date.now();
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    logOpsError("cron_monthly_reminders_misconfigured", { reason: "CRON_SECRET missing" });
    return NextResponse.json({ error: "Cron is not configured" }, { status: 503 });
  }

  const authHeader = req.headers.get("authorization");
  if (!verifyCronBearer(authHeader, cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const monitorRecipients = await claimMonitorSubscribersForMonthlyReminder(100);
    const newsletterRecipients = await claimNewsletterSubscribersForMonthlyReminder(250);
    const recipients = [...monitorRecipients, ...newsletterRecipients];

    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        await sendMonthlyCsvReminderEmail({
          to: recipient.email,
          audience: recipient.audience,
          reminderCount: recipient.reminder_count,
        });
        sent++;
      } catch (err) {
        failed++;
        logOpsError("cron_monthly_reminder_email_failed", {
          audience: recipient.audience,
          message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
        });
      }
    }

    const body = {
      ok: true,
      found: recipients.length,
      monitorFound: monitorRecipients.length,
      newsletterFound: newsletterRecipients.length,
      sent,
      failed,
      durationMs: Date.now() - started,
    };

    logOpsInfo("cron_monthly_reminders_complete", body);
    return NextResponse.json(body);
  } catch (err) {
    logOpsError("cron_monthly_reminders_failed", {
      message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      durationMs: Date.now() - started,
    });
    return NextResponse.json({ error: "Monthly reminders failed" }, { status: 500 });
  }
}
