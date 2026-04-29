/**
 * Run once to create DB tables in Neon.
 * Usage: node scripts/init-db.mjs
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const envContent = readFileSync(".env.local", "utf-8");
const urlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!urlMatch) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}
const sql = neon(urlMatch[1].trim());

console.log("Creating tables...");

await sql`
  CREATE TABLE IF NOT EXISTS reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  TEXT NOT NULL,
    blob_url    TEXT,
    result      JSONB,
    is_paid     BOOLEAN NOT NULL DEFAULT FALSE,
    email       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 hour'
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS rate_limits (
    id         SERIAL PRIMARY KEY,
    ip         TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_created ON rate_limits(ip, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS idx_reports_session ON reports(session_id)`;
await sql`CREATE INDEX IF NOT EXISTS idx_reports_expires ON reports(expires_at)`;

console.log("Done. Tables created: reports, rate_limits");
