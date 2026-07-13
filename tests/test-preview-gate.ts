/**
 * Preview / paywall data gate — ensures unpaid tier does not receive paid-only fields.
 * Run: npx tsx tests/test-preview-gate.ts
 */

import Papa from "papaparse";
import { validateColumns, normalizeRow, type RawRow } from "../lib/csv-parser";
import { analyze } from "../lib/fee-analyzer";
import { toPreviewResult, PREVIEW_STRIPPED_KEYS } from "../lib/report-preview";
import { isBetaFlagEnabled } from "../lib/beta-access";

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

function makeStripeCSV(
  rows: {
    id: string;
    type: string;
    amount: number;
    fee: number;
    net: number;
    currency: string;
    created: string;
  }[]
): string {
  const header = "id,type,amount,fee,net,currency,created,description,reporting_category,source,status";
  const lines = rows.map(
    (r) =>
      `${r.id},${r.type},${r.amount},${r.fee},${r.net},${r.currency},${r.created},Payment,,${r.id},available`
  );
  return [header, ...lines].join("\n");
}

function runPipeline(csv: string) {
  const parsed = Papa.parse<RawRow>(csv, { header: true, skipEmptyLines: true });
  const missing = validateColumns(Object.keys(parsed.data[0] ?? {}));
  if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}`);
  return analyze(parsed.data.map(normalizeRow));
}

console.log("\n📋 report-preview / toPreviewResult");

const normal1 = Array.from({ length: 60 }, (_, i) => ({
  id: `ch_jan_${i}`,
  type: "charge",
  amount: 10000,
  fee: 300,
  net: 9700,
  currency: "usd",
  created: "1704067200",
}));
const normal2 = Array.from({ length: 60 }, (_, i) => ({
  id: `ch_feb_${i}`,
  type: "charge",
  amount: 10000,
  fee: 300,
  net: 9700,
  currency: "usd",
  created: "1706745600",
}));
const spike = {
  id: "ch_spike",
  type: "charge",
  amount: 10000,
  fee: 4000,
  net: 6000,
  currency: "usd",
  created: "1706745600",
};

const full = runPipeline(makeStripeCSV([...normal1, ...normal2, spike]));
const preview = toPreviewResult(full);

test("fixture includes paid-only data before preview strip", () => {
  assert(full.anomalies.length >= 1, "anomalies");
  assert(full.topDrivers.length > 3, ">3 top drivers");
  assert(Boolean(full.benchmark), "benchmark");
});

test("preview clears anomaly list (UI uses previewAnomalyCount for badges)", () => {
  assert(preview.anomalies.length === 0, "anomalies empty");
  assert((preview.annotatedAnomalies?.length ?? 0) <= 1, "at most one annotated teaser");
});

test("preview caps top drivers at 3", () => {
  assert(preview.topDrivers.length === 3, "topDrivers capped");
});

test("preview strips paid-only aggregate keys", () => {
  for (const key of PREVIEW_STRIPPED_KEYS) {
    assert(preview[key] === undefined, `${key} must be undefined`);
  }
});

test("preview keeps monthly totals for reconciliation", () => {
  assert(preview.monthly.length === full.monthly.length, "monthly preserved");
  assert(preview.chargeVolume === full.chargeVolume, "headline volume preserved");
});

test("preview savings teaser hides action steps", () => {
  const smallRows = Array.from({ length: 60 }, (_, i) => ({
    id: `ch_small_${i}`,
    type: "charge" as const,
    amount: 10,
    fee: 0.59,
    net: 9.41,
    currency: "USD",
    date: "2024-01-15",
    month: "2024-01",
  }));
  const withSavings = analyze(smallRows);
  const stripped = toPreviewResult(withSavings);
  const opp = stripped.savingsOpportunities?.[0];
  assert(Boolean(opp), "one savings teaser");
  assert(opp?.steps === undefined, "steps gated");
  assert(opp?.tip === "", "tip gated");
  assert(opp?.actionUrl === undefined, "action URL gated");
  assert(opp?.periodLoss === undefined, "period loss gated");
});

test("preview does not leak paid fields via JSON roundtrip", () => {
  const json = JSON.stringify(preview);
  assert(!json.includes('"feeLeakBreakdown"'), "no fee leak in JSON");
  assert(!json.includes('"geographySummary"'), "no geography in JSON");
});

console.log("\n📋 beta-access / post-beta default");

test("FULL_REPORTS_FREE_DURING_BETA defaults closed", () => {
  assert(isBetaFlagEnabled(undefined) === false, "unset = false");
  assert(isBetaFlagEnabled("false") === false, "false = false");
});

console.log(
  "\n" + (failed === 0 ? `✅ All ${passed} preview-gate tests passed` : `❌ ${failed} failed, ${passed} passed`)
);
process.exit(failed > 0 ? 1 : 0);
