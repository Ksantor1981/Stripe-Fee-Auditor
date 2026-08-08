/**
 * Convert Stripe Payments export → Balance-style CSV.
 * Usage: npx tsx scripts/convert_payments_csv_v1.ts "path/to/unified_payments.csv"
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";
import {
  convertPaymentsCsvToBalanceRows,
  isStripePaymentsExport,
} from "../lib/stripe-payments-csv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const input = process.argv[2];
if (!input) {
  console.error("Usage: npx tsx scripts/convert_payments_csv_v1.ts <unified_payments.csv> [output.csv]");
  process.exit(1);
}

const output =
  process.argv[3] ?? join(ROOT, "temp", `${basename(input, ".csv")}-balance.csv`);

const csv = readFileSync(input, "utf8");
const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
const headers = parsed.meta.fields ?? [];

if (!isStripePaymentsExport(headers)) {
  console.error("Not a Stripe Payments export (unified_payments.csv).");
  console.error("Use Reports → Balance summary → Export → Itemized for native format.");
  process.exit(1);
}

const rows = convertPaymentsCsvToBalanceRows(parsed.data);
if (!rows.length) {
  console.error("No paid charges found in file.");
  process.exit(1);
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, Papa.unparse(rows), "utf8");

console.log(`✅ Converted ${parsed.data.length} payment rows → ${rows.length} balance rows`);
console.log(`   ${output}`);
