import { NextRequest, NextResponse } from "next/server";
import { del, list } from "@vercel/blob";
import sql from "@/lib/db";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Vercel Cron sends an Authorization header with CRON_SECRET
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let deletedBlobs = 0;
  let deletedReports = 0;

  try {
    // 1. Delete expired blobs from Vercel Blob (uploads/ prefix)
    const { blobs } = await list({ prefix: "uploads/" });
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const blob of blobs) {
      if (new Date(blob.uploadedAt) < oneHourAgo) {
        await del(blob.url);
        deletedBlobs++;
      }
    }

    // 2. Delete expired reports from Neon
    const result = await sql`
      DELETE FROM reports WHERE expires_at < NOW() RETURNING id
    `;
    deletedReports = result.length;

    // 3. Clean up old rate_limits entries (older than 2 days)
    await sql`DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '2 days'`;

  } catch (err) {
    console.error("[cron/cleanup]", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }

  console.log(`[cron/cleanup] Deleted ${deletedBlobs} blobs, ${deletedReports} reports`);
  return NextResponse.json({ deletedBlobs, deletedReports });
}
