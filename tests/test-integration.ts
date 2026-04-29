/**
 * Integration + crash tests for the full pipeline.
 * Simulates: CSV text → parse → normalize → analyze → assert results.
 * Run: npx tsx tests/test-integration.ts
 */

import Papa from "papaparse";
import { validateColumns, normalizeRow, type RawRow } from "../lib/csv-parser";
import { analyze } from "../lib/fee-analyzer";
import { fmt$, fmtPct, fmtMonth, fmtDate } from "../lib/format";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const r = fn();
    if (r instanceof Promise) {
      r.then(() => { console.log(`  ✅ ${name}`); passed++; })
       .catch((e) => { logFail(name, e); });
    } else {
      console.log(`  ✅ ${name}`);
      passed++;
    }
  } catch (e) {
    logFail(name, e);
  }
}

function logFail(name: string, e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  console.log(`  ❌ ${name}\n     → ${msg}`);
  failed++;
  failures.push(`${name}: ${msg}`);
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}
function assertClose(a: number, b: number, eps = 0.01, label = "") {
  if (Math.abs(a - b) > eps) throw new Error(`${label}: expected ~${b}, got ${a}`);
}

// ─── Real Stripe Balance CSV format ──────────────────────────────────────────

function makeStripeCSV(rows: {
  id: string; type: string; amount: number; fee: number;
  net: number; currency: string; created: string;
}[]): string {
  const header = "id,type,amount,fee,net,currency,created,description,reporting_category,source,status";
  const lines = rows.map(r =>
    `${r.id},${r.type},${r.amount},${r.fee},${r.net},${r.currency},${r.created},Payment,,${r.id},available`
  );
  return [header, ...lines].join("\n");
}

function parseCSV(csv: string): RawRow[] {
  const result = Papa.parse<RawRow>(csv, { header: true, skipEmptyLines: true });
  return result.data;
}

function runPipeline(csv: string, columnMapping?: Record<string, string>) {
  let rows = parseCSV(csv);
  if (columnMapping) {
    rows = rows.map(row => {
      const r = { ...row };
      for (const [canonical, original] of Object.entries(columnMapping)) {
        if (original && original !== canonical) r[canonical] = row[original];
      }
      return r;
    });
  }
  const missing = validateColumns(Object.keys(rows[0] ?? {}));
  if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}`);
  const normalized = rows.map(normalizeRow);
  return analyze(normalized);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

console.log("\n📋 Pipeline: Real Stripe CSV format");

test("multi-month Stripe CSV parses and analyzes correctly", () => {
  const rows = [
    // Jan: 60 charges × $100 @ $3 fee
    ...Array.from({ length: 60 }, (_, i) => ({
      id: `ch_jan_${i}`, type: "charge", amount: 10000, fee: 300,
      net: 9700, currency: "usd", created: "1704067200", // 2024-01-01
    })),
    // Feb: 60 charges × $100 @ $3.5 fee
    ...Array.from({ length: 60 }, (_, i) => ({
      id: `ch_feb_${i}`, type: "charge", amount: 10000, fee: 350,
      net: 9650, currency: "usd", created: "1706745600", // 2024-02-01
    })),
  ];
  const csv = makeStripeCSV(rows);
  const r = runPipeline(csv);
  assert(r.mode === "multi-month", `mode: ${r.mode}`);
  assert(r.monthly.length === 2, `months: ${r.monthly.length}`);
  assertClose(r.chargeRate, 3.25, 0.1, "chargeRate");
  // jan: 60 * $3 = $180, feb: 60 * $3.5 = $210, delta = $30
  assertClose(r.periodDelta ?? 0, 30.0, 1.0, "periodDelta");
  assert(r.anomalies.length === 0, "no anomalies — consistent rates");
});

test("single-month CSV → single-month mode", () => {
  const rows = Array.from({ length: 60 }, (_, i) => ({
    id: `ch_${i}`, type: "charge", amount: 5000, fee: 175,
    net: 4825, currency: "usd", created: "1704067200",
  }));
  const r = runPipeline(makeStripeCSV(rows));
  assert(r.mode === "single-month", `mode: ${r.mode}`);
  assert(r.periodDelta === null, "no delta for single month");
  assertClose(r.chargeRate, 3.5, 0.01, "chargeRate");
});

test("low-volume (<50 charges) → low-volume mode, top 5 drivers", () => {
  const rows = Array.from({ length: 15 }, (_, i) => ({
    id: `ch_${i}`, type: "charge",
    amount: (i + 1) * 1000,
    fee: (i + 1) * 50,
    net: (i + 1) * 950,
    currency: "usd", created: "1704067200",
  }));
  const r = runPipeline(makeStripeCSV(rows));
  assert(r.mode === "low-volume", `mode: ${r.mode}`);
  assert(r.topDrivers.length <= 5, "topDrivers ≤5");
  assert(r.anomalies.length === 0, "no anomalies in low-volume mode");
});

test("mixed charge + refund + payout rows", () => {
  const charges = Array.from({ length: 60 }, (_, i) => ({
    id: `ch_${i}`, type: "charge", amount: 10000, fee: 300, net: 9700, currency: "usd", created: "1704067200",
  }));
  const refunds = Array.from({ length: 5 }, (_, i) => ({
    id: `re_${i}`, type: "refund", amount: -5000, fee: 0, net: -5000, currency: "usd", created: "1704067200",
  }));
  const payouts = [{ id: "po_1", type: "payout", amount: -50000, fee: 0, net: -50000, currency: "usd", created: "1704067200" }];
  const r = runPipeline(makeStripeCSV([...charges, ...refunds, ...payouts]));
  assert(r.mode === "single-month", "charges ≥50 → not low-volume");
  assertClose(r.otherFees, 0, 0.01, "otherFees=0 (refunds and payouts had fee=0)");
});

console.log("\n📋 Pipeline: Column mapping");

test("column mapping remaps non-standard headers", () => {
  // CSV with different column names
  const csv = [
    "transaction_id,transaction_type,gross,stripe_fee,net_amount,curr,timestamp",
    "ch_001,charge,10000,300,9700,usd,1704067200",
    ...Array.from({ length: 59 }, (_, i) =>
      `ch_${i+2},charge,10000,300,9700,usd,1704067200`
    ),
  ].join("\n");

  const mapping = {
    id: "transaction_id",
    type: "transaction_type",
    amount: "gross",
    fee: "stripe_fee",
    net: "net_amount",
    currency: "curr",
    created: "timestamp",
  };
  const r = runPipeline(csv, mapping);
  assert(r.mode === "single-month", `mode: ${r.mode}`);
  assertClose(r.chargeRate, 3.0, 0.01, "chargeRate");
});

console.log("\n📋 Pipeline: Edge cases & crash tests");

test("CSV with Windows CRLF line endings", () => {
  const rows = Array.from({ length: 10 }, (_, i) => ({
    id: `ch_${i}`, type: "charge", amount: 10000, fee: 300, net: 9700, currency: "usd", created: "1704067200",
  }));
  const csv = makeStripeCSV(rows).replace(/\n/g, "\r\n");
  const r = runPipeline(csv);
  assert(r.mode === "low-volume", "CRLF should parse fine");
});

test("CSV with extra whitespace in headers", () => {
  const csv = " id , type , amount , fee , net , currency , created \nch_001,charge,10000,300,9700,usd,1704067200";
  const rows = parseCSV(csv);
  // After trimHeader in Papa config, should work
  assert(rows.length > 0, "should parse at least 1 row");
});

test("CSV with only non-charge rows → empty charges", () => {
  const rows = Array.from({ length: 10 }, (_, i) => ({
    id: `re_${i}`, type: "refund", amount: -10000, fee: 0, net: -10000, currency: "usd", created: "1704067200",
  }));
  const r = runPipeline(makeStripeCSV(rows));
  assertClose(r.chargeVolume, 0, 0.01, "volume should be 0");
  assertClose(r.chargeFees, 0, 0.01, "fees should be 0");
  assertClose(r.chargeRate, 0, 0.01, "rate should be 0 (no charges)");
});

test("anomaly spike in multi-month data", () => {
  const normal1 = Array.from({ length: 60 }, (_, i) => ({
    id: `ch_jan_${i}`, type: "charge", amount: 10000, fee: 300, net: 9700, currency: "usd", created: "1704067200",
  }));
  const normal2 = Array.from({ length: 60 }, (_, i) => ({
    id: `ch_feb_${i}`, type: "charge", amount: 10000, fee: 300, net: 9700, currency: "usd", created: "1706745600",
  }));
  const spike = { id: "ch_spike", type: "charge", amount: 10000, fee: 4000, net: 6000, currency: "usd", created: "1706745600" };
  const r = runPipeline(makeStripeCSV([...normal1, ...normal2, spike]));
  assert(r.anomalies.some(a => a.id === "ch_spike"), "spike should be flagged");
  assert(r.anomalies.every(a => a.type === "charge"), "anomalies are charges only");
});

test("very large CSV simulation (1000 rows) — no crash", () => {
  const rows = Array.from({ length: 1000 }, (_, i) => ({
    id: `ch_${i}`,
    type: i % 10 === 0 ? "refund" : "charge",
    amount: 10000 + (i * 100),
    fee: 300 + (i % 50),
    net: 9700,
    currency: "usd",
    created: i < 500 ? "1704067200" : "1706745600",
  }));
  const r = runPipeline(makeStripeCSV(rows));
  assert(["multi-month", "single-month"].includes(r.mode), `unexpected mode: ${r.mode}`);
  assert(r.monthly.length >= 1, "should have monthly data");
});

console.log("\n📋 Format utilities");

test("fmt$ formats correctly", () => {
  assert(fmt$(3.5) === "$3.50", `got ${fmt$(3.5)}`);
  assert(fmt$(1234.567) === "$1,234.57", `got ${fmt$(1234.567)}`);
  assert(fmt$(0) === "$0.00", `got ${fmt$(0)}`);
});

test("fmtPct formats correctly", () => {
  assert(fmtPct(3.245) === "3.25%", `got ${fmtPct(3.245)}`);
  assert(fmtPct(0) === "0.00%", `got ${fmtPct(0)}`);
});

test("fmtMonth parses YYYY-MM", () => {
  const m = fmtMonth("2024-03");
  assert(m.includes("2024"), `should include year: ${m}`);
  assert(m.toLowerCase().includes("mar"), `should include Mar: ${m}`);
});

test("fmtDate parses ISO date", () => {
  const d = fmtDate("2024-03-15");
  assert(d.includes("2024"), `should include year: ${d}`);
  assert(d.includes("15"), `should include day: ${d}`);
});

// ─── Summary ──────────────────────────────────────────────────────────────────

setTimeout(() => {
  console.log(`\n${"─".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log("\nFailures:");
    failures.forEach(f => console.log(`  • ${f}`));
    process.exit(1);
  } else {
    console.log("All tests passed ✅\n");
  }
}, 200);
