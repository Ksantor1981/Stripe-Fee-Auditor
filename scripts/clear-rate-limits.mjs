import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const match = env.match(/DATABASE_URL=(.+)/);
const sql = neon(match[1].trim());

await sql`DELETE FROM rate_limits`;
console.log("Rate limits cleared.");
