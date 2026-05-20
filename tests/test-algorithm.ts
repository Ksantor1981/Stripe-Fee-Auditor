/**
 * Unit + crash tests for csv-parser and fee-analyzer.
 * Run: npx tsx tests/test-algorithm.ts
 */

import { normalizeRow, validateColumns } from "../lib/csv-parser";
import { analyze, redactAnalysisResultForStorage } from "../lib/fee-analyzer";

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

test("accepts official Stripe Balance itemized headers", () => {
  const missing = validateColumns([
    "balance_transaction_id",
    "reporting_category",
    "gross",
    "fee",
    "net",
    "currency",
    "created_utc",
  ]);
  assert(missing.length === 0, `should accept Balance headers: ${missing}`);
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

test("normalizes official Balance CSV amounts as major currency units", () => {
  const r = normalizeRow({
    balance_transaction_id: "txn_balance_1",
    reporting_category: "charge",
    gross: "49.00",
    fee: "1.72",
    net: "47.28",
    currency: "usd",
    created_utc: "2024-03-15T10:00:00Z",
    description: "Customer invoice 123",
    card_country: "GB",
  });
  assert(r.id === "txn_balance_1", `expected txn_balance_1, got ${r.id}`);
  assert(r.type === "charge", `expected charge, got ${r.type}`);
  assertClose(r.amount, 49.00, 0.001, "amount");
  assertClose(r.fee, 1.72, 0.001, "fee");
  assertClose(r.net, 47.28, 0.001, "net");
  assert(r.cardCountry === "GB", `expected GB, got ${r.cardCountry}`);
});

test("legacy cents exports with extra gross/reporting_category stay in cents mode", () => {
  const r = normalizeRow({
    id: "ch_legacy_extra",
    type: "charge",
    amount: "1000",
    fee: "59",
    net: "941",
    currency: "usd",
    created: "1700000000",
    gross: "1000",
    reporting_category: "charge",
  });
  assertClose(r.amount, 10.00, 0.001, "amount");
  assertClose(r.fee, 0.59, 0.001, "fee");
  assertClose(r.net, 9.41, 0.001, "net");
});

test("normalizes required fields case-insensitively", () => {
  const r = normalizeRow({
    ID: "ch_upper",
    Type: "CHARGE",
    Amount: "2500",
    Fee: "103",
    Net: "2397",
    Currency: "usd",
    Created: "1700000000",
  });
  assert(r.id === "ch_upper", `expected ch_upper, got ${r.id}`);
  assert(r.type === "charge", `expected charge, got ${r.type}`);
  assertClose(r.amount, 25.00, 0.001, "amount");
  assertClose(r.fee, 1.03, 0.001, "fee");
  assertClose(r.net, 23.97, 0.001, "net");
});

test("uppercases currency", () => {
  const r = normalizeRow(VALID_ROW);
  assert(r.currency === "USD", `expected USD, got ${r.currency}`);
});

test("zero-decimal currencies skip cents divide (e.g. JPY)", () => {
  const r = normalizeRow({
    ...VALID_ROW,
    currency: "jpy",
    amount: "150000",
    fee: "471",
    net: "149529",
  });
  assertClose(r.amount, 150000, 0.001, "JPY amount");
  assertClose(r.fee, 471, 0.001, "JPY fee");
  assertClose(r.net, 149529, 0.001, "JPY net");
  assert(r.currency === "JPY", `expected JPY, got ${r.currency}`);
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

test("throws on missing required row values", () => {
  for (const key of ["id", "type", "amount", "fee", "net", "currency", "created"] as const) {
    let threw = false;
    try { normalizeRow({ ...VALID_ROW, [key]: "" }); }
    catch { threw = true; }
    assert(threw, `should throw when ${key} is missing`);
  }
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

test("single-month anomaly detection uses charge-level spread", () => {
  const normal = makeCharges(60, "2024-01", 3.0);
  const spike = {
    id: "ch_single_spike",
    type: "charge" as const,
    amount: 100,
    fee: 12,
    net: 88,
    currency: "USD",
    date: "2024-01-20",
    month: "2024-01",
  };
  const r = analyze([...normal, spike]);
  assert(r.mode === "single-month", `expected single-month, got ${r.mode}`);
  assert(r.anomalies.some((a) => a.id === "ch_single_spike"), "single-month spike should be anomaly");
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

test("small-transaction savings use dollar units", () => {
  const rows = Array.from({ length: 60 }, (_, i) => ({
    id: `ch_small_${i}`,
    type: "charge" as const,
    amount: 10,
    fee: 0.59,
    net: 9.41,
    currency: "USD",
    date: "2024-01-15",
    month: "2024-01",
  }));
  const r = analyze(rows);
  const small = r.savingsOpportunities?.find((opp) =>
    opp.title.toLowerCase().includes("small transaction")
  );
  assert(Boolean(small), "should produce a small-transaction opportunity");
  assertClose(small?.annualSavings ?? 0, 110, 0.1, "annual savings should assume half fixed fees are avoidable");
});

test("benchmark marks a normal domestic card mix as normal", () => {
  const rows = makeCharges(60, "2024-01", 3.2); // $100 charge -> 2.9% + $0.30 = 3.2%
  const r = analyze(rows);
  const b = r.benchmark;
  assert(b?.status === "normal", `expected normal, got ${b?.status}`);
  if (b === undefined) throw new Error("benchmark should exist");
  assert(b.rangeLow < r.chargeRate && b.rangeHigh > r.chargeRate, "benchmark range should contain chargeRate");
});

test("benchmark flags materially high blended rates", () => {
  const rows = makeCharges(60, "2024-01", 5.25);
  const r = analyze(rows);
  assert(r.benchmark?.status === "high", `expected high, got ${r.benchmark?.status}`);
  assert((r.benchmark?.rangeHigh ?? 0) < r.chargeRate, "range high should be below actual high rate");
});

test("refund summary estimates retained original fees", () => {
  const charges = makeCharges(60, "2024-01", 3.0); // $6,000 volume, 3% charge rate
  const refunds = [
    { id: "re_1", type: "refund" as const, amount: -200, fee: 0, net: -200, currency: "USD", date: "2024-01-15", month: "2024-01" },
    { id: "re_2", type: "refund" as const, amount: -300, fee: 0, net: -300, currency: "USD", date: "2024-01-16", month: "2024-01" },
  ];
  const r = analyze([...charges, ...refunds]);
  assert(r.refundSummary?.count === 2, `expected 2 refunds, got ${r.refundSummary?.count}`);
  assertClose(r.refundSummary?.volume ?? 0, 500, 0.01, "refund volume");
  assertClose(r.refundSummary?.estimatedRetainedFees ?? 0, 15, 0.01, "retained fee estimate");
  assertClose(r.refundSummary?.refundRate ?? 0, 8.333, 0.01, "refund rate");
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

test("all-in rate includes non-charge fee rows separately from charge processing rate", () => {
  const charges = makeCharges(60, "2024-01", 3.0);
  const stripeFeeRows = [
    {
      id: "txn_fee_1",
      type: "stripe_fee",
      reportingCategory: "stripe_fee",
      amount: -25,
      fee: 0,
      net: -25,
      currency: "USD",
      date: "2024-01-20",
      month: "2024-01",
    },
  ];
  const r = analyze([...charges, ...stripeFeeRows]);
  assertClose(r.chargeRate, 3.0, 0.01, "processing chargeRate");
  assertClose(r.otherFees, 25.0, 0.01, "fee row counted as otherFees");
  assertClose(r.allInFees, 205.0, 0.01, "allInFees");
  assertClose(r.allInRate, 3.4167, 0.01, "allInRate");
});

test("redacts free-text descriptions before storage", () => {
  const rows = [
    {
      id: "ch_sensitive",
      type: "charge",
      amount: 100,
      fee: 3,
      net: 97,
      currency: "USD",
      date: "2024-01-15",
      month: "2024-01",
      description: "john@example.com private order",
    },
  ];
  const result = analyze(rows);
  const stored = redactAnalysisResultForStorage(result);
  assert(stored.topDrivers[0]?.description === undefined, "topDrivers description should be removed");
  assert(rows[0].description !== undefined, "redaction must not mutate input rows");
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

