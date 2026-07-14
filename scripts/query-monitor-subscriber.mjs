import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const email = process.argv[2] ?? "ksantor19811606@gmail.com";
const env = readFileSync(".env.local", "utf8");
const match = env.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(match[1].trim());

try {
  const rows = await sql`
    SELECT email, source, status, created_at, updated_at, last_paid_at, last_reminded_at, reminder_count, polar_product_id
    FROM monitor_subscribers
    WHERE email = ${email}
  `;
  if (rows.length === 0) {
    console.log(`No monitor_subscribers row for ${email}`);
  } else {
    console.log(JSON.stringify(rows, null, 2));
  }
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("subscribed_at") || message.includes("does not exist")) {
    console.error("Note: monitor_subscribers has no subscribed_at column. Use created_at / last_paid_at instead.");
  }
  console.error(message);
  process.exit(1);
}
