/**
 * Security-focused unit tests for input guards (cron bearer, column mapping).
 * Run: npx tsx tests/security-input.ts
 */

import { sanitizeColumnMapping, MAX_CSV_ROWS } from "../lib/analyze-input";
import { verifyCronBearer } from "../lib/cron-bearer";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  ❌ ${name}\n     → ${msg}`);
    failed++;
  }
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

console.log("\n📋 cron-bearer / verifyCronBearer");

test("rejects missing secret", () => {
  assert(verifyCronBearer("Bearer abc", undefined) === false, "undefined secret");
  assert(verifyCronBearer(null, "") === false, "empty secret");
});

test("rejects wrong length (timing-safe path)", () => {
  assert(verifyCronBearer("Bearer short", "this-is-the-real-secret-value") === false, "short auth");
  assert(verifyCronBearer(null, "secret") === false, "null header");
});

test("rejects wrong bearer token", () => {
  const secret = "cron-secret-12345";
  assert(verifyCronBearer(`Bearer wrong-${secret}`, secret) === false, "wrong value");
});

test("accepts correct Bearer secret", () => {
  const secret = "vercel-cron-test-secret";
  assert(verifyCronBearer(`Bearer ${secret}`, secret) === true, "match");
});

console.log("\n📋 analyze-input / sanitizeColumnMapping");

const ALLOWED = new Set(["id", "type", "amount", "fee"]);

test("returns undefined for non-object", () => {
  assert(sanitizeColumnMapping(undefined, ALLOWED) === undefined, "undefined");
  assert(sanitizeColumnMapping({} as Record<string, string>, ALLOWED) === undefined, "empty");
});

test("drops prototype pollution-style keys", () => {
  const m: Record<string, string> = { amount: " Amount Paid " };
  m["__proto__"] = "evil";
  m["constructor"] = "evil";
  m["prototype"] = "evil";
  const out = sanitizeColumnMapping(m, ALLOWED);
  assert(out !== undefined, "should have amount");
  assert(Object.keys(out!).length === 1, "only safe keys");
  assert(out!.amount === "Amount Paid", "trimmed original column name");
});

test("ignores unknown canonical columns", () => {
  const out = sanitizeColumnMapping({ evil_col: "x", amount: "Gross" }, ALLOWED);
  assert(out !== undefined && Object.keys(out).length === 1 && out.amount === "Gross", "allowlist");
});

test("skips non-string entries", () => {
  const m = { amount: 123, id: "col1" } as unknown as Record<string, string>;
  const out = sanitizeColumnMapping(m, ALLOWED);
  assert(out?.id === "col1" && !("amount" in (out ?? {})), "only string pairs");
});

console.log("\n📋 analyze-input / MAX_CSV_ROWS export");

test("MAX_CSV_ROWS is positive", () => {
  assert(Number.isFinite(MAX_CSV_ROWS) && MAX_CSV_ROWS > 0, "bound");
});

console.log("\n" + (failed === 0 ? `✅ All ${passed} tests passed` : `❌ ${failed} failed, ${passed} passed`));
process.exit(failed > 0 ? 1 : 0);
