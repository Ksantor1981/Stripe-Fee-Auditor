/**
 * Unit + crash tests for csv-parser and fee-analyzer.
 * Run: npx tsx tests/test-algorithm.ts
 */

import { normalizeRow, validateColumns } from "../lib/csv-parser";
import { analyze } from "../lib/fee-analyzer";

// ─── Test runner ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  ❌ ${name}\n     → ${msg}`);
    failed++;
    failures.push(`${name}: ${msg}`);
  }
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function assertClose(a: number, b: number, eps = 0.001, msg = "") {
  if (Math.abs(a - b) > eps) throw new Error(`${msg} expected ~${b}, got ${a}`);
}

// ─── csv-parser ───────────────────────────────────────────────────────────────

console.log("\n📋 csv-parser / validateColumns");

test("validates correct headers", () => {
  const missing = validateColumns(["id","type","amount","fee","net","currency","created"]);
  assert(missing.length === 0, `unexpected missing: ${missing}`);
});

test("detects missing columns", () => {
  const missing = validateColumns(["id","amount","fee"]);
  assert(missing.includes("type"), "should detect missing 'type'");
  assert(missing.includes("currency"), "should detect missing 'currency'");
});

test("case-insensitive column matching", () => {
  const missing = validateColumns(["ID","Type","Amount","Fee","Net","Currency","Created"]);
  assert(missing.length === 0, `should accept uppercase: ${missing}`);
});

console.log("\n📋 csv-parser / normalizeRow");

const VALID_ROW = {
  id: "ch_001",
  type: "charge",
  amount: "1000",   // $10.00
  fee: "59",        // $0.59
  net: "941",
  currency: "usd",
  created: "1700000000",
};

test("normalizes amounts from cents to dollars", () => {
  const r = normalizeRow(VALID_ROW);
  assertClose(r.amount, 10.00, 0.001, "amount");
  assertClose(r.fee, 0.59, 0.001, "fee");
  assertClose(r.net, 9.41, 0.001, "net");
});

test("uppercases currency", () => {
  const r = normalizeRow(VALID_ROW);
  assert(r.currency === "USD", `expected USD, got ${r.currency}`);
});

test("lowercases type", () => {
  const r = normalizeRow({ ...VALID_ROW, type: "CHARGE" });
  assert(r.type === "charge", `expected charge, got ${r.type}`);
});

test("parses unix timestamp (seconds)", () => {
  const r = normalizeRow(VALID_ROW);
  assert(r.date.match(/^\d{4}-\d{2}-\d{2}$/) !== null, `bad date: ${r.date}`);
  assert(r.month.match(/^\d{4}-\d{2}$/) !== null, `bad month: ${r.month}`);
});

test("parses ISO date string", () => {
  const r = normalizeRow({ ...VALID_ROW, created: "2024-03-15T10:00:00Z" });
  assert(r.date === "2024-03-15", `expected 2024-03-15, got ${r.date}`);
  assert(r.month === "2024-03", `expected 2024-03, got ${r.month}`);
});

test("handles zero fee (free plan charges)", () => {
  const r = normalizeRow({ ...VALID_ROW, fee: "0", net: "1000" });
  assertClose(r.fee, 0, 0.001, "fee should be 0");
});

test("throws on invalid date", () => {
  let threw = false;
  try { normalizeRow({ ...VALID_ROW, created: "not-a-date" }); }
  catch { threw = true; }
  assert(threw, "should throw on invalid date");
});

// ─── fee-analyzer ─────────────────────────────────────────────────────────────

console.log("\n📋 fee-analyzer / analyze");

function makeCharges(n: number, month = "2024-01", feeOverride?: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `ch_${month}_${i}`,
    type: "charge" as const,
    amount: 100,
    fee: feeOverride ?? 3.0,
    net: 97,
    currency: "USD",
    date: `${month}-15`,
    month,
  }));
}

test("low-volume mode for <50 charges", () => {
  const rows = makeCharges(10);
  const r = analyze(rows);
  assert(r.mode === "low-volume", `expected low-volume, got ${r.mode}`);
  assert(r.topDrivers.length <= 5, "topDrivers should be ≤5");
  assert(r.anomalies.length === 0, "no anomalies in low-volume mode");
});

test("single-month mode for ≥50 charges in one month", () => {
  const rows = makeCharges(60);
  const r = analyze(rows);
  assert(r.mode === "single-month", `expected single-month, got ${r.mode}`);
});

test("multi-month mode for ≥50 charges across ≥2 months", () => {
  const rows = [...makeCharges(60, "2024-01"), ...makeCharges(60, "2024-02")];
  const r = analyze(rows);
  assert(r.mode === "multi-month", `expected multi-month, got ${r.mode}`);
  assert(r.monthly.length === 2, `expected 2 months, got ${r.monthly.length}`);
});

test("chargeRate calculation is correct", () => {
  const rows = makeCharges(60, "2024-01", 3.0); // fee=$3, amount=$100 → 3%
  const r = analyze(rows);
  assertClose(r.chargeRate, 3.0, 0.01, "chargeRate");
});

test("periodDelta is last.fees - prev.fees", () => {
  const m1 = makeCharges(60, "2024-01", 3.0);  // 60*3 = $180
  const m2 = makeCharges(60, "2024-02", 4.0);  // 60*4 = $240
  const r = analyze([...m1, ...m2]);
  assertClose(r.periodDelta ?? 0, 60.0, 0.1, "periodDelta");
});

test("periodDelta is null for single month", () => {
  const rows = makeCharges(60);
  const r = analyze(rows);
  assert(r.periodDelta === null, "periodDelta should be null for 1 month");
});

test("non-charge rows go to otherFees", () => {
  const charges = makeCharges(60);
  const refunds = Array.from({ length: 5 }, (_, i) => ({
    id: `re_${i}`,
    type: "refund",
    amount: 100,
    fee: 1.5,
    net: -101.5,
    currency: "USD",
    date: "2024-01-15",
    month: "2024-01",
  }));
  const r = analyze([...charges, ...refunds]);
  assertClose(r.otherFees, 7.5, 0.01, "otherFees");
});

test("anomaly detection flags high-rate charges", () => {
  const normal = makeCharges(60, "2024-01", 3.0);
  const normal2 = makeCharges(60, "2024-02", 3.0);
  // Add a very expensive charge
  const spike = { id: "ch_spike", type: "charge" as const, amount: 100, fee: 50, net: 50, currency: "USD", date: "2024-02-15", month: "2024-02" };
  const r = analyze([...normal, ...normal2, spike]);
  assert(r.anomalies.some(a => a.id === "ch_spike"), "spike charge should be anomaly");
});

test("handles empty input gracefully — no crash", () => {
  const r = analyze([]);
  assert(r.mode === "low-volume", "empty input → low-volume");
  assertClose(r.chargeVolume, 0, 0.001, "volume");
  assertClose(r.chargeFees, 0, 0.001, "fees");
  assert(r.monthly.length === 0, "no monthly entries");
});

test("handles all-zero amounts — no division by zero", () => {
  const rows = makeCharges(5, "2024-01", 0).map(r => ({ ...r, amount: 0, fee: 0 }));
  const r = analyze(rows); // should not throw
  assertClose(r.chargeRate, 0, 0.001, "rate should be 0");
});

test("stdDev=0 case — threshold equals avg, all charges become anomalies", () => {
  // All same rate → stdDev=0 → threshold = avg → technically nothing exceeds it
  const rows = [...makeCharges(60, "2024-01", 3.0), ...makeCharges(60, "2024-02", 3.0)];
  const r = analyze(rows);
  // Should not throw — anomalies can be 0 or some, not crash
  assert(typeof r.anomalies.length === "number", "anomalies should be array");
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log("\nFailures:");
  failures.forEach(f => console.log(`  • ${f}`));
  process.exit(1);
} else {
  console.log("All tests passed ✅\n");
}
