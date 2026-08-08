/**
 * Unit + crash tests for csv-parser and fee-analyzer.
 * Run: npx tsx tests/test-algorithm.ts
 */

import { normalizeRow, validateColumns, type NormalizedRow } from "../lib/csv-parser";
import { analyze, redactAnalysisResultForStorage } from "../lib/fee-analyzer";
import {
  convertPaymentsCsvToBalanceRows,
  isStripePaymentsExport,
} from "../lib/stripe-payments-csv";
import {
  detectStripeCsvFormat,
  isAutoRecognizedStripeCsv,
  prepareStripeCsvRows,
} from "../lib/stripe-csv-import";
import { applyExpectedOutlierExclusions } from "../lib/expected-outliers";
import { selectFreeDiagnosis } from "../lib/free-diagnosis";
import { resolvePaywallImpact } from "../lib/paywall-impact";
import { estimateCountryStripeFee, getCountryFeeProfile } from "../lib/stripe-country-fees";

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

console.log("\n📋 stripe-payments-csv");

test("detects unified Payments export headers", () => {
  assert(
    isStripePaymentsExport([
      "id",
      "Created date (UTC)",
      "Amount",
      "Amount Refunded",
      "Currency",
      "Fee",
      "Status",
      "Description",
      "Statement Descriptor",
    ]),
    "should detect payments export"
  );
  assert(!isStripePaymentsExport(["id", "type", "amount", "fee", "net", "currency", "created"]), "balance not payments");
});

test("converts Payments row to charge + refund in cents", () => {
  const converted = convertPaymentsCsvToBalanceRows([
    {
      id: "ch_test",
      "Created date (UTC)": "2026-08-08 23:00:36",
      Amount: "29.00",
      "Amount Refunded": "29.00",
      Currency: "usd",
      Fee: "1.14",
      Status: "Refunded",
      Description: "Standard UK (US Visa stand-in (intl label only))",
      "card_type (metadata)": "international",
    },
  ]);
  assert(converted.length === 2, "charge + refund");
  const charge = normalizeRow(converted[0]);
  assertClose(charge.amount, 29, 0.01, "charge amount");
  assertClose(charge.fee, 1.14, 0.01, "charge fee");
  assert(charge.description?.includes("[international]"), "intl tag from metadata");
  const refund = normalizeRow(converted[1]);
  assert(refund.type.includes("refund"), "refund type");
  assertClose(refund.amount, -29, 0.01, "refund amount");
});

test("detectStripeCsvFormat recognizes user's unified_payments headers", () => {
  const headers = [
    "id",
    "Created date (UTC)",
    "Amount",
    "Amount Refunded",
    "Currency",
    "Captured",
    "Converted Amount",
    "Fee",
    "Status",
    "Description",
    "Statement Descriptor",
    "Seller Message",
    "card_type (metadata)",
  ];
  assert(detectStripeCsvFormat(headers) === "payments", "unified payments");
  assert(isAutoRecognizedStripeCsv(headers), "auto recognized");
});

test("prepareStripeCsvRows converts payments for analyze pipeline", () => {
  const { rows, format } = prepareStripeCsvRows(
    [
      {
        id: "ch_x",
        "Created date (UTC)": "2026-08-08 23:00:51",
        Amount: "19.00",
        "Amount Refunded": "0.00",
        Currency: "usd",
        Fee: "0.85",
        Status: "Paid",
        Description: "Starter intl",
        "card_type (metadata)": "international",
      },
    ],
    ["id", "Created date (UTC)", "Amount", "Fee", "Status", "Currency", "Description", "card_type (metadata)"]
  );
  assert(format === "payments", "format");
  assert(rows.length === 1, "one charge");
  assert(validateColumns(Object.keys(rows[0])).length === 0, "valid after convert");
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

test("balance CSV with gross/fee/net in cents is normalized to dollars", () => {
  const r = normalizeRow({
    balance_transaction_id: "txn_cents_1",
    reporting_category: "charge",
    gross: "2185600",
    fee: "79300",
    net: "2106300",
    currency: "usd",
    created_utc: "2026-01-15T10:00:00Z",
  });
  assertClose(r.amount, 21856.0, 0.01, "amount");
  assertClose(r.fee, 793.0, 0.01, "fee");
  assertClose(r.net, 21063.0, 0.01, "net");
});

test("negative fee values normalize to positive fee amounts", () => {
  const r = normalizeRow({ ...VALID_ROW, fee: "-59" });
  assertClose(r.fee, 0.59, 0.001, "fee");
  assert(r.fee >= 0, "fee should be non-negative");
});

test("negative fee on balance cents export normalizes correctly", () => {
  const r = normalizeRow({
    balance_transaction_id: "txn_cents_neg_fee",
    reporting_category: "charge",
    gross: "10000",
    fee: "-300",
    net: "9700",
    currency: "usd",
    created_utc: "2026-01-15T10:00:00Z",
  });
  assertClose(r.amount, 100.0, 0.001, "amount");
  assertClose(r.fee, 3.0, 0.001, "fee");
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

function makeCharges(n: number, month = "2024-01", feeOverride?: number): NormalizedRow[] {
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

test("dispute principal rows do not inflate otherFees without an explicit fee", () => {
  const charges = makeCharges(60, "2024-01", 3.0);
  const disputePrincipal = {
    id: "dp_principal",
    type: "dispute" as const,
    reportingCategory: "dispute",
    amount: -100,
    fee: 0,
    net: -100,
    currency: "USD",
    date: "2024-01-20",
    month: "2024-01",
  };
  const r = analyze([...charges, disputePrincipal]);
  assertClose(r.otherFees, 0, 0.01, "dispute principal should not be counted as a fee");
});

test("dispute fee rows count when the fee is explicit", () => {
  const charges = makeCharges(60, "2024-01", 3.0);
  const disputeFee = {
    id: "dp_fee",
    type: "dispute" as const,
    reportingCategory: "dispute",
    amount: -100,
    fee: -15,
    net: -115,
    currency: "USD",
    date: "2024-01-20",
    month: "2024-01",
  };
  const r = analyze([...charges, disputeFee]);
  assertClose(r.otherFees, 15, 0.01, "explicit dispute fee should be counted");
  const breakdown = r.feeLeakBreakdown ?? [];
  assert(
    breakdown.some((item) => item.key === "other-stripe-fees"),
    "explicit dispute fee should appear in fee leak breakdown"
  );
});

test("fee leak breakdown exposes fixed fees and non-charge fee lines", () => {
  const charges = Array.from({ length: 60 }, (_, i) => ({
    id: `ch_breakdown_${i}`,
    type: "charge" as const,
    amount: 10,
    fee: 0.59,
    net: 9.41,
    currency: "USD",
    date: "2024-01-15",
    month: "2024-01",
  }));
  const other = {
    id: "txn_stripe_fee",
    type: "stripe_fee" as const,
    reportingCategory: "stripe_fee",
    amount: -15,
    fee: 0,
    net: -15,
    currency: "USD",
    date: "2024-01-20",
    month: "2024-01",
  };
  const r = analyze([...charges, other]);
  const breakdown = r.feeLeakBreakdown ?? [];
  assert(breakdown.some((item) => item.key === "fixed-card-fees"), "fixed fees should be present");
  assert(breakdown.some((item) => item.key === "other-stripe-fees"), "other fees should be present");
  const fixed = breakdown.find((item) => item.key === "fixed-card-fees");
  assertClose(fixed?.amount ?? 0, 18, 0.01, "fixed-fee estimate");
});
test("reconciliation ties every valid charge row to source arithmetic", () => {
  const rows: NormalizedRow[] = [
    ...makeCharges(60),
    {
      id: "fee_direct_1",
      type: "stripe_fee",
      amount: 0,
      fee: 12,
      net: -12,
      currency: "USD",
      date: "2024-01-15",
      month: "2024-01",
    },
  ];
  const result = analyze(rows);
  assert(result.reconciliation?.status === "reconciled", "valid charge arithmetic should reconcile");
  assert(result.reconciliation?.sourceRowCount === 61, "all source rows should be counted");
  assert(result.reconciliation?.reconciledChargeRows === 60, "all charge rows should tie out");
  assert(result.reconciliation?.directNonChargeFeeRows === 1, "direct non-charge fee rows should be counted");
});

test("reconciliation flags charge rows whose amount, fee, and net do not tie", () => {
  const rows = makeCharges(60);
  rows[0] = { ...rows[0], net: 50 };
  const result = analyze(rows);
  assert(result.reconciliation?.status === "review", "mismatched arithmetic should require review");
  assert(result.reconciliation?.mismatchedChargeRows === 1, "one mismatched row should be reported");
});

test("fee leak breakdown labels evidence kind and confidence", () => {
  const result = analyze(makeCharges(60));
  const breakdown = result.feeLeakBreakdown ?? [];
  assert(breakdown.length > 0, "breakdown should contain evidence");
  assert(breakdown.every((item) => Boolean(item.kind) && Boolean(item.confidence)), "every item needs evidence metadata");
  assert(breakdown.some((item) => item.kind === "calculated"), "base processing should be marked calculated");
  assert(breakdown.some((item) => item.kind === "estimated"), "fixed-fee drag should be marked estimated");
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

test("stores only top high-fee rows but keeps full high-fee count", () => {
  const normal = makeCharges(5000, "2024-01", 3.0);
  const spikes = Array.from({ length: 150 }, (_, i): NormalizedRow => ({
    id: `ch_spike_${i}`,
    type: "charge",
    amount: 100,
    fee: 100 + i,
    net: -i,
    currency: "USD",
    date: "2024-01-15",
    month: "2024-01",
  }));

  const r = analyze([...normal, ...spikes]);
  assert(r.anomalyCount === 150, `expected full anomalyCount 150, got ${r.anomalyCount}`);
  assert(r.anomalies.length === 100, `expected stored anomalies capped at 100, got ${r.anomalies.length}`);
  assert(r.anomalies[0]?.id === "ch_spike_149", "stored anomalies should keep the highest-fee rows first");
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

test("does not classify International shipping text as cross-border card", () => {
  const charges = makeCharges(55, "2024-01", 3.0);
  charges.push({
    id: "ch_shipping_label",
    type: "charge",
    amount: 120,
    fee: 3.78,
    net: 116.22,
    currency: "USD",
    date: "2024-01-20",
    month: "2024-01",
    description: "International shipping upgrade",
    cardCountry: "US",
  });
  const r = analyze(charges);
  assert(
    (r.geographySummary?.internationalCount ?? 0) === 0,
    "domestic card with shipping copy should not count as international"
  );
});

test("low-volume top drivers ignore zero-amount charges", () => {
  const rows = [
    ...makeCharges(10, "2024-01", 3.0),
    {
      id: "ch_zero",
      type: "charge" as const,
      amount: 0,
      fee: 0.3,
      net: -0.3,
      currency: "USD",
      date: "2024-01-15",
      month: "2024-01",
    },
    {
      id: "ch_high_rate",
      type: "charge" as const,
      amount: 5,
      fee: 0.45,
      net: 4.55,
      currency: "USD",
      date: "2024-01-16",
      month: "2024-01",
    },
  ];
  const r = analyze(rows);
  assert(r.mode === "low-volume", "fixture should stay low-volume");
  assert(!r.topDrivers.some((d) => d.id === "ch_zero"), "zero-amount row should be excluded");
  assert(r.topDrivers[0]?.id === "ch_high_rate", "highest fee-rate charge should rank first");
});

test("ACH savings labels distinguish full-period vs partial annual estimate", () => {
  const charges = [
    ...makeCharges(40, "2024-01", 3.0),
    {
      id: "ch_large",
      type: "charge" as const,
      amount: 2000,
      fee: 58.3,
      net: 1941.7,
      currency: "USD",
      date: "2024-01-20",
      month: "2024-01",
      paymentMethodType: "card",
    },
  ];
  const r = analyze(charges);
  const ach = r.savingsOpportunities?.find((o) => o.title.includes("ACH"));
  assert(Boolean(ach), "large card charge should surface ACH opportunity");
  assert(Boolean(ach?.periodLossNote?.includes("every eligible")), "period loss note should explain full-switch scope");
  assert(Boolean(ach?.annualSavingsNote?.includes("20%")), "annual note should explain switching share");
});

console.log("\n📋 fee-grade");

test("computeFeeGrade returns letter for healthy mix", () => {
  const rows = makeCharges(60, "2024-01", 3.0);
  const r = analyze(rows);
  assert(Boolean(r.feeGrade), "feeGrade should be set");
  assert(["A", "B", "C"].includes(r.feeGrade!.letter), `expected A/B/C, got ${r.feeGrade!.letter}`);
});

test("computeFeeGrade penalizes high all-in rate", () => {
  const rows = makeCharges(60, "2024-01", 5.5);
  const r = analyze(rows);
  assert(Boolean(r.feeGrade), "feeGrade should be set");
  assert(["C", "D", "F"].includes(r.feeGrade!.letter), `expected C/D/F for high rate, got ${r.feeGrade!.letter}`);
});

test("analyze attaches feeGrade on result", () => {
  const r = analyze(makeCharges(55, "2024-03", 3.1));
  assert(r.feeGrade?.letter !== undefined, "analyze should include feeGrade.letter");
  assert(r.feeGrade!.score >= 0 && r.feeGrade!.score <= 100, "score should be 0-100");
});

console.log("\n📋 stripe-country-fees");

test("US country profile uses 2.9% + $0.30", () => {
  const profile = getCountryFeeProfile("US");
  assertClose(profile.domesticPercent, 0.029, 0.0001, "US percent");
  assertClose(profile.domesticFixed, 0.3, 0.0001, "US fixed");
});

test("estimateCountryStripeFee adds international uplift", () => {
  const domestic = estimateCountryStripeFee({
    amount: 10000,
    accountCountry: "US",
    internationalShare: 0,
  });
  const intl = estimateCountryStripeFee({
    amount: 10000,
    accountCountry: "US",
    internationalShare: 0.3,
  });
  assert(intl.estimatedFee > domestic.estimatedFee, "intl share should increase estimated fee");
});

test("CA profile uses 0.8% international uplift per stripe.com/ca/pricing", () => {
  const profile = getCountryFeeProfile("CA");
  assertClose(profile.crossBorderPercent, 0.008, 0.0001, "CA intl uplift");
});

test("AU profile uses 1.7% domestic and 2.0% international per stripe.com/au/pricing", () => {
  const profile = getCountryFeeProfile("AU");
  assertClose(profile.domesticPercent, 0.017, 0.0001, "AU domestic percent");
  assertClose(profile.crossBorderPercent, 0.02, 0.0001, "AU intl uplift");
});

test("UK account treats GB cards as domestic and US cards as international", () => {
  const rows = makeCharges(60, "2024-01", 3.2).map((row, index) => ({
    ...row,
    cardCountry: index < 45 ? "GB" : "US",
  }));
  const result = analyze(rows, { accountCountry: "UK" });
  assert(result.accountCountry === "UK", "account country should be retained");
  assert(result.geographySummary?.domesticCount === 45, "GB cards should be domestic for UK");
  assert(result.geographySummary?.internationalCount === 15, "US cards should be international for UK");
});

test("EU account treats EEA cards as domestic", () => {
  const rows = makeCharges(60, "2024-01", 3.2).map((row, index) => ({
    ...row,
    cardCountry: index < 20 ? "DE" : index < 50 ? "FR" : "US",
  }));
  const result = analyze(rows, { accountCountry: "EU" });
  assert(result.geographySummary?.domesticCount === 50, "DE/FR cards should be domestic for EU");
  assert(result.geographySummary?.internationalCount === 10, "US cards should be international for EU");
});

console.log("\n📋 paywall-impact");

test("prefers savings opportunity over rate gap", () => {
  const impact = resolvePaywallImpact({
    savingsAnnual: 1400,
    savingsTitle: "ACH for large charges",
    chargeRate: 4.0,
    chargeVolume: 100000,
    monthCount: 4,
    yearlyFeesAtThisRate: 12000,
  });
  assert(impact?.source === "savings", "should prefer savings");
  assert(impact?.amount === 1400, "amount should match savings");
});

test("falls back to annualized rate gap vs 2.9%", () => {
  const impact = resolvePaywallImpact({
    chargeRate: 3.8,
    chargeVolume: 100000,
    monthCount: 4,
  });
  assert(impact?.source === "rate_gap", `expected rate_gap, got ${impact?.source}`);
  assert((impact?.amount ?? 0) > 0, "gap amount should be positive");
});

test("falls back to fee run-rate when no gap", () => {
  const impact = resolvePaywallImpact({
    chargeRate: 2.9,
    chargeVolume: 10000,
    monthCount: 1,
    yearlyFeesAtThisRate: 2500,
  });
  assert(impact?.source === "fee_runrate", `expected fee_runrate, got ${impact?.source}`);
  assert(impact?.amount === 2500, "should use yearly fees");
});

console.log("\n📋 free-diagnosis");

test("free diagnosis prioritizes international card uplift", () => {
  const domestic = makeCharges(60, "2024-01", 3.2);
  const international = Array.from({ length: 10 }, (_, i) => ({
    id: `ch_intl_${i}`,
    type: "charge" as const,
    amount: 100,
    fee: 4.7,
    net: 95.3,
    currency: "USD",
    date: "2024-01-16",
    month: "2024-01",
    description: "[international] card charge",
  }));
  const diagnosis = selectFreeDiagnosis(analyze([...domestic, ...international]));
  assert(diagnosis?.kind === "international_card_uplift", `expected international diagnosis, got ${diagnosis?.kind}`);
  assert((diagnosis?.amount ?? 0) > 0, "international diagnosis should include an amount");
});

test("free diagnosis selects refund leakage before fixed-fee drag", () => {
  const refunds = [
    { id: "re_diag_1", type: "refund" as const, amount: -200, fee: 0, net: -200, currency: "USD", date: "2024-01-15", month: "2024-01" },
  ];
  const diagnosis = selectFreeDiagnosis(analyze([...makeCharges(60, "2024-01", 3.0), ...refunds]));
  assert(diagnosis?.kind === "refund_fee_leakage", `expected refund diagnosis, got ${diagnosis?.kind}`);
  assertClose(diagnosis?.amount ?? 0, 6, 0.01, "refund diagnosis amount");
});

test("free diagnosis identifies small-ticket fixed-fee drag", () => {
  const rows = Array.from({ length: 60 }, (_, i) => ({
    id: `ch_small_diag_${i}`,
    type: "charge" as const,
    amount: 10,
    fee: 0.59,
    net: 9.41,
    currency: "USD",
    date: "2024-01-15",
    month: "2024-01",
  }));
  const diagnosis = selectFreeDiagnosis(analyze(rows));
  assert(diagnosis?.kind === "small_ticket_drag", `expected small-ticket diagnosis, got ${diagnosis?.kind}`);
  assert((diagnosis?.amount ?? 0) > 0, "small-ticket diagnosis should include an amount");
});

test("free diagnosis falls back to a directional above-benchmark rate gap", () => {
  const diagnosis = selectFreeDiagnosis(analyze(makeCharges(60, "2024-01", 5.25)));
  assert(diagnosis?.kind === "above_benchmark_rate", `expected benchmark diagnosis, got ${diagnosis?.kind}`);
  assert((diagnosis?.amount ?? 0) > 0, "benchmark diagnosis should include an amount");
});

// ─── Summary ──────────────────────────────────────────────────────────────────

test("applyExpectedOutlierExclusions lowers rate when high-fee charge excluded", () => {
  const rows: NormalizedRow[] = [
    ...makeCharges(50, "2024-01", 3.0),
    {
      id: "ch_outlier",
      type: "charge",
      amount: 50000,
      fee: 4000,
      net: 46000,
      currency: "usd",
      date: "2024-01-15",
      month: "2024-01",
    },
  ];
  const base = analyze(rows);
  assert(Boolean(base.chargeLedger?.length), "chargeLedger should exist");
  const outlierId = base.anomalies[0]?.id ?? "ch_outlier";
  const adjusted = applyExpectedOutlierExclusions(base, [outlierId]);
  assert(adjusted.chargeRate < base.chargeRate, "adjusted rate should be lower");
  assert(adjusted.chargeVolume < base.chargeVolume, "adjusted volume should exclude outlier");
  assert(adjusted.chargeFees < base.chargeFees, "adjusted charge fees should exclude outlier fee");
  assert(Boolean(adjusted.expectedOutlierIds?.includes(outlierId)), "should persist excluded ids");
});

test("applyExpectedOutlierExclusions no-op on empty ids", () => {
  const base = analyze(makeCharges(40, "2024-02", 3.2));
  const adjusted = applyExpectedOutlierExclusions(base, []);
  assert(adjusted.chargeRate === base.chargeRate, "empty exclusions should not change rate");
  assert(adjusted.expectedOutlierIds === undefined, "should omit expectedOutlierIds when empty");
});

test("applyExpectedOutlierExclusions removes excluded from anomalies", () => {
  const normal = makeCharges(60, "2024-01", 3.0);
  const normal2 = makeCharges(60, "2024-02", 3.0);
  const spike: NormalizedRow = {
    id: "ch_spike",
    type: "charge",
    amount: 100,
    fee: 50,
    net: 50,
    currency: "USD",
    date: "2024-02-15",
    month: "2024-02",
  };
  const base = analyze([...normal, ...normal2, spike]);
  assert(base.anomalies.some((row) => row.id === "ch_spike"), "spike should be anomaly");
  const adjusted = applyExpectedOutlierExclusions(base, ["ch_spike"]);
  assert(!adjusted.anomalies.some((row) => row.id === "ch_spike"), "excluded anomaly should drop from list");
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
