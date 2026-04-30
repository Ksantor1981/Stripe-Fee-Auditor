import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Vercel Cron sends an Authorization header with CRON_SECRET
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron/cleanup] CRON_SECRET is not configured");
    return NextResponse.json({ error: "Cron is not configured" }, { status: 503 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let deletedReports = 0;

  try {
    // Delete expired reports from Neon
    const result = await sql`
      DELETE FROM reports WHERE expires_at < NOW() RETURNING id
    `;
    deletedReports = result.length;

    // Clean up old rate_limits entries (older than 2 days)
    await sql`DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '2 days'`;

  } catch (err) {
    console.error("[cron/cleanup]", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }

  console.log(`[cron/cleanup] Deleted ${deletedReports} reports`);
  return NextResponse.json({ deletedReports });
}
