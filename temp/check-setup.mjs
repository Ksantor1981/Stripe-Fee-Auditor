import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { execSync } from "child_process";

const envContent = readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.+)$/);
  if (match) env[match[1]] = match[2].trim();
}

console.log("=== .env.local ===");
console.log("DATABASE_URL:         ", env.DATABASE_URL && !env.DATABASE_URL.includes("password@host") ? "OK" : "MISSING/PLACEHOLDER");
console.log("BLOB_READ_WRITE_TOKEN:", env.BLOB_READ_WRITE_TOKEN && !env.BLOB_READ_WRITE_TOKEN.includes("...") ? "OK" : "MISSING/PLACEHOLDER");

console.log("\n=== Neon connection ===");
try {
  const sql = neon(env.DATABASE_URL);
  const result = await sql`SELECT version() as v`;
  console.log("Neon: OK -", result[0].v.split(" ").slice(0, 2).join(" "));
} catch (e) {
  console.log("Neon: FAIL -", e.message);
}

console.log("\n=== Dependencies ===");
const deps = ["next", "papaparse", "recharts", "@neondatabase/serverless"];
for (const dep of deps) {
  try {
    const pkg = JSON.parse(readFileSync("node_modules/" + dep + "/package.json", "utf-8"));
    console.log(dep + "@" + pkg.version + ": OK");
  } catch {
    console.log(dep + ": MISSING");
  }
}

console.log("\n=== Git ===");
try {
  const remote = execSync("git remote get-url origin").toString().trim();
  console.log("Remote:", remote);
  const ahead = execSync("git rev-list --count origin/master..HEAD 2>nul").toString().trim();
  console.log("Unpushed commits:", ahead === "0" ? "none (in sync)" : ahead + " commit(s)");
} catch (e) {
  console.log("Git error:", e.message);
}
