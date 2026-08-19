/**
 * Post-P0 Monitor security spot-check (Neon, read-only).
 * Usage: node scripts/security-monitor-spotcheck.mjs
 *
 * Looks for cross-tenant artifacts from the pre-session email bypass:
 * - report.client_id owned by a different email
 * - active subscriber emails on many reports (manual review)
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const match = env.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(match[1].trim());
const PATCH_DATE = "2026-08-19";

console.log("Monitor security spot-check (read-only)\n");

const crossOwner = await sql`
  SELECT r.id, r.email AS report_email, c.owner_email, c.name, r.created_at
  FROM reports r
  JOIN clients c ON c.id = r.client_id
  WHERE r.client_id IS NOT NULL
    AND r.email IS NOT NULL
    AND lower(r.email) <> lower(c.owner_email)
  ORDER BY r.created_at DESC
  LIMIT 50
`;

console.log(`1. Reports with client_id owned by another email: ${crossOwner.length}`);
if (crossOwner.length > 0) {
  console.log(JSON.stringify(crossOwner, null, 2));
}

const prePatchSubscriberReports = await sql`
  SELECT r.email, count(*)::int AS report_count, min(r.created_at) AS first_seen, max(r.created_at) AS last_seen
  FROM reports r
  INNER JOIN monitor_subscribers m ON lower(m.email) = lower(r.email) AND m.status = 'active'
  WHERE r.email IS NOT NULL
    AND r.created_at < ${PATCH_DATE}::timestamptz
  GROUP BY r.email
  ORDER BY report_count DESC
  LIMIT 20
`;

console.log(`\n2. Active subscriber emails on reports created before ${PATCH_DATE}: ${prePatchSubscriberReports.length}`);
if (prePatchSubscriberReports.length > 0) {
  console.log(JSON.stringify(prePatchSubscriberReports, null, 2));
}

const orphanClients = await sql`
  SELECT c.id, c.owner_email, c.name, c.created_at,
         (SELECT count(*)::int FROM reports r WHERE r.client_id = c.id) AS linked_reports
  FROM clients c
  WHERE NOT EXISTS (
    SELECT 1 FROM reports r
    WHERE lower(r.email) = lower(c.owner_email)
  )
  ORDER BY c.created_at DESC
  LIMIT 20
`;

console.log(`\n3. Client profiles with no report from owner email (review): ${orphanClients.length}`);
if (orphanClients.length > 0) {
  console.log(JSON.stringify(orphanClients, null, 2));
}

console.log("\nDone. Investigate any cross-owner client links immediately.");
