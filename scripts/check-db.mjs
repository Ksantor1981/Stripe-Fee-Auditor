import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const match = env.match(/DATABASE_URL=(.+)/);
if (!match) { console.log("No DATABASE_URL found"); process.exit(1); }

const sql = neon(match[1].trim());

const reports = await sql`
  SELECT id, session_id, is_paid, expires_at,
         result IS NOT NULL as has_result
  FROM reports
  ORDER BY expires_at DESC
  LIMIT 10
`;
console.log("REPORTS:", JSON.stringify(reports, null, 2));

const limits = await sql`
  SELECT ip, COUNT(*)::int as cnt FROM rate_limits GROUP BY ip
`;
console.log("RATE_LIMITS:", JSON.stringify(limits, null, 2));
