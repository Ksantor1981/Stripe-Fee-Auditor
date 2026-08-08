/**
 * Founder July 2026 — synthetic Stripe Balance CSV for Fee Auditor tests.
 *
 * ICP: indie SaaS founder, ~$10k MRR, USD Stripe (US account).
 * Mix: US domestic + heavy India international + some UK/EU.
 *
 * Why CSV (not Stripe API for July dates):
 * Stripe Test Clocks cannot start in the past — July charges cannot be backdated via API.
 *
 * Run:
 *   npm run seed:founder-july
 *   npm run seed:founder-july -- --stdout   # print only
 *
 * Output: temp/founder-july-2026-balance.csv
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_PATH = join(ROOT, "temp", "founder-july-2026-balance.csv");

const YEAR = 2026;
const MONTH = 7; // July

/** US account illustrative rates (cents): 2.9% + $0.30 domestic; +1.5% intl uplift. */
const DOMESTIC_RATE = 0.029;
const DOMESTIC_FIXED = 30;
const INTL_EXTRA = 0.015;

function isoUtc(day, hour = 10, minute = 0) {
  return new Date(Date.UTC(YEAR, MONTH - 1, day, hour, minute))
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");
}

function csvCell(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function feeCents(amountCents, international) {
  const rate = DOMESTIC_RATE + (international ? INTL_EXTRA : 0);
  return Math.round(amountCents * rate + DOMESTIC_FIXED);
}

/** Weighted plan picks — tuned to ~$10k gross charges in July. */
const PLAN_POOL = [
  // US domestic (~42% volume)
  { region: "us", amount: 9900, count: 53, desc: "Team plan monthly — US" },
  { region: "us", amount: 4900, count: 14, desc: "Business monthly — US" },
  { region: "us", amount: 2900, count: 8, desc: "Pro monthly — US" },
  { region: "us", amount: 14900, count: 3, desc: "Annual plan prepay — US" },
  { region: "us", amount: 1900, count: 5, desc: "Starter monthly — US" },
  // India (~38% charge count — PPP pricing, intl fee uplift)
  { region: "india", amount: 1900, count: 20, desc: "Starter monthly — India [international]" },
  { region: "india", amount: 2900, count: 24, desc: "Pro monthly — India [international]" },
  { region: "india", amount: 4900, count: 12, desc: "Business monthly — India [international]" },
  { region: "india", amount: 9900, count: 6, desc: "Team plan — India [international]" },
  // Other intl (~12%)
  { region: "intl", amount: 2900, count: 4, desc: "Pro monthly — UK [international]" },
  { region: "intl", amount: 4900, count: 8, desc: "Business monthly — EU [international]" },
  { region: "intl", amount: 9900, count: 4, desc: "Team plan — Canada [international]" },
];

/** Refund 4 charges — incl. one India starter. */
const REFUND_CHARGE_INDICES = [5, 22, 48, 71];

function buildCharges() {
  const charges = [];
  let seq = 1;
  let dayCursor = 1;

  for (const plan of PLAN_POOL) {
    for (let i = 0; i < plan.count; i++) {
      const day = ((dayCursor + i * 2) % 28) + 1;
      const hour = 8 + (seq % 10);
      const intl = plan.region !== "us";
      const amount = plan.amount;
      const fee = feeCents(amount, intl);
      charges.push({
        id: `txn_jul26_${String(seq).padStart(3, "0")}`,
        type: "charge",
        amount,
        fee,
        net: amount - fee,
        currency: "usd",
        created: isoUtc(day, hour, seq % 60),
        description: plan.desc,
        intl,
        region: plan.region,
      });
      seq++;
    }
    dayCursor += 3;
  }

  charges.sort((a, b) => a.created.localeCompare(b.created));
  return charges;
}

function buildRefunds(charges) {
  const refunds = [];
  for (const idx of REFUND_CHARGE_INDICES) {
    const ch = charges[idx];
    if (!ch) continue;
    const day = Math.min(28, Number(ch.created.slice(8, 10)) + 5);
    refunds.push({
      id: `txn_jul26_ref_${String(refunds.length + 1).padStart(2, "0")}`,
      type: "refund",
      amount: -ch.amount,
      fee: 0,
      net: -ch.amount,
      currency: "usd",
      created: isoUtc(day, 14, 30),
      description: `Refund — ${ch.description.replace(" [international]", "")}`,
    });
  }
  return refunds;
}

function buildExtras() {
  return [
    {
      id: "txn_jul26_radar",
      type: "stripe_fee",
      amount: 0,
      fee: 2500,
      net: -2500,
      currency: "usd",
      created: isoUtc(1, 6, 0),
      description: "Stripe Radar for Fraud Teams",
    },
    {
      id: "txn_jul26_payout",
      type: "payout",
      amount: -850000,
      fee: 0,
      net: -850000,
      currency: "usd",
      created: isoUtc(31, 9, 0),
      description: "STRIPE PAYOUT",
    },
  ];
}

function rowLine(r) {
  return [
    csvCell(r.id),
    r.type,
    r.amount,
    r.fee,
    r.net,
    r.currency,
    r.created,
    csvCell(r.description),
  ].join(",");
}

function buildCsv() {
  const header = "id,type,amount,fee,net,currency,created,description";
  const charges = buildCharges();
  const refunds = buildRefunds(charges);
  const extras = buildExtras();
  const rows = [...charges, ...refunds, ...extras].sort((a, b) =>
    a.created.localeCompare(b.created)
  );
  return { csv: [header, ...rows.map(rowLine)].join("\n"), charges, refunds, rows };
}

function summarize(charges) {
  const gross = charges.reduce((s, c) => s + c.amount, 0);
  const fees = charges.reduce((s, c) => s + c.fee, 0);
  const india = charges.filter((c) => c.region === "india");
  const us = charges.filter((c) => c.region === "us");
  const intl = charges.filter((c) => c.intl);
  const effectiveRate = gross > 0 ? (fees / gross) * 100 : 0;

  return {
    gross,
    fees,
    effectiveRate,
    chargeCount: charges.length,
    indiaCount: india.length,
    indiaPct: Math.round((india.length / charges.length) * 100),
    indiaVolume: india.reduce((s, c) => s + c.amount, 0),
    usCount: us.length,
    intlCount: intl.length,
  };
}

function main() {
  const stdoutOnly = process.argv.includes("--stdout");
  const { csv, charges, refunds } = buildCsv();
  const stats = summarize(charges);

  if (!stdoutOnly) {
    mkdirSync(dirname(OUT_PATH), { recursive: true });
    writeFileSync(OUT_PATH, csv, "utf8");
  }

  console.log("📊 Founder July 2026 — synthetic Balance CSV\n");
  console.log("   ICP: indie SaaS founder, ~$10k MRR, US Stripe account");
  console.log(`   Charges: ${stats.chargeCount}  |  Refunds: ${refunds.length}`);
  console.log(`   Gross volume: $${(stats.gross / 100).toFixed(2)}`);
  console.log(`   Processing fees: $${(stats.fees / 100).toFixed(2)}`);
  console.log(`   Implied processing rate: ${stats.effectiveRate.toFixed(2)}%`);
  console.log(
    `   India: ${stats.indiaCount} charges (${stats.indiaPct}%), $${(stats.indiaVolume / 100).toFixed(2)} volume`
  );
  console.log(`   US domestic: ${stats.usCount}  |  All intl-looking: ${stats.intlCount}\n`);

  if (stdoutOnly) {
    console.log(csv);
  } else {
    console.log(`✅ Written: ${OUT_PATH}`);
    console.log("   Upload at https://feeauditor.com/analyze");
    console.log("   Stripe Dashboard export for July 2026 will stay empty for API charges");
    console.log("   (use this CSV for July Fee Auditor test).\n");
  }
}

main();
