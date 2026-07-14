import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const ip = process.argv[2];
if (!ip) {
  console.error("Usage: node scripts/clear-ip-rate-limits.mjs <ip>");
  process.exit(1);
}

const env = readFileSync(".env.local", "utf8");
const match = env.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(match[1].trim());
const like = `%${ip}`;

const before = await sql`
  SELECT ip, COUNT(*)::int AS cnt
  FROM rate_limits
  WHERE ip = ${ip} OR ip LIKE ${like}
  GROUP BY ip
  ORDER BY ip
`;
console.log("Before:", JSON.stringify(before, null, 2));

const deleted = await sql`
  DELETE FROM rate_limits
  WHERE ip = ${ip} OR ip LIKE ${like}
  RETURNING ip
`;
console.log(`Deleted ${deleted.length} row(s) for IP ${ip}.`);
