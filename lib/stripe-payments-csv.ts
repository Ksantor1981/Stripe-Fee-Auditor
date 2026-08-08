import type { RawRow } from "./csv-parser";

function normalizeHeaderName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function readCell(row: RawRow, aliases: string[]): string {
  const wanted = aliases.map(normalizeHeaderName);
  const key = Object.keys(row).find((h) => wanted.includes(normalizeHeaderName(h)));
  if (!key) return "";
  const v = row[key];
  return typeof v === "string" ? v.trim() : "";
}

function parseMajorAmount(raw: string): number {
  const n = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function toCentsString(major: number): string {
  return String(Math.round(major * 100));
}

function intlHint(row: RawRow, description: string): string {
  const cardType = readCell(row, [
    "card_type (metadata)",
    "card_type",
    "card type (metadata)",
    "card type",
  ]).toLowerCase();

  if (cardType === "international" && !/\[international\]/i.test(description)) {
    return `${description} [international]`.trim();
  }
  if (/intl|india|brazil|uk|eu|canada|cross-border/i.test(description) && !/\[international\]/i.test(description)) {
    return `${description} [international]`.trim();
  }
  return description;
}

export function isStripePaymentsExport(headers: string[]): boolean {
  if (!headers.length) return false;
  const norm = new Set(headers.map(normalizeHeaderName));

  const hasId = norm.has("id") || norm.has("chargeid") || norm.has("paymentid");
  const hasAmount = norm.has("amount") || norm.has("convertedamount");
  const hasFee = norm.has("fee") || norm.has("fees");
  const hasCreated =
    norm.has("createddateutc") ||
    norm.has("createdutc") ||
    norm.has("createddate") ||
    norm.has("created");
  const hasPaymentMeta =
    norm.has("status") || norm.has("amountrefunded") || norm.has("captured") || norm.has("sellermessage");

  const isBalanceExport =
    norm.has("balancetransactionid") ||
    norm.has("reportingcategory") ||
    (norm.has("gross") && norm.has("net") && norm.has("type"));

  return hasId && hasAmount && hasFee && hasCreated && hasPaymentMeta && !isBalanceExport;
}

/**
 * Convert Payments export rows → legacy Balance-style rows (amounts in cents).
 * One payment may become charge + optional refund row.
 */
export function convertPaymentsCsvToBalanceRows(rows: RawRow[]): RawRow[] {
  const out: RawRow[] = [];

  for (const row of rows) {
    const id = readCell(row, ["id"]);
    if (!id) continue;

    const status = readCell(row, ["status"]).toLowerCase();
    if (status && !["paid", "refunded", "succeeded"].includes(status)) continue;

    const captured = readCell(row, ["captured"]).toLowerCase();
    if (captured === "false") continue;

    const amountMajor = parseMajorAmount(readCell(row, ["amount"]));
    if (amountMajor <= 0) continue;

    const feeMajor = parseMajorAmount(readCell(row, ["fee"]));
    const refundedMajor = parseMajorAmount(readCell(row, ["amount refunded"]));
    const currency = readCell(row, ["currency"]).toLowerCase() || "usd";
    const created = readCell(row, [
      "created date (utc)",
      "created (utc)",
      "created date",
      "created utc",
      "created",
      "date",
    ]);
    const refundDate = readCell(row, ["refunded date (utc)", "refunded date"]) || created;
    const description = intlHint(row, readCell(row, ["description"]) || "Payment");

    const netMajor = Math.max(0, amountMajor - feeMajor);

    out.push({
      id,
      type: "charge",
      amount: toCentsString(amountMajor),
      fee: toCentsString(feeMajor),
      net: toCentsString(netMajor),
      currency,
      created,
      description,
    });

    if (refundedMajor > 0) {
      out.push({
        id: `${id}_refund`,
        type: "refund",
        amount: toCentsString(-refundedMajor),
        fee: "0",
        net: toCentsString(-refundedMajor),
        currency,
        created: refundDate,
        description: `Refund — ${description.replace(/\s*\[international\]/i, "")}`,
      });
    }
  }

  return out;
}

export function paymentsExportNotice(): string {
  return "Converted Stripe Payments export. For refunds, disputes, and full all-in rate, export Reports → Balance summary → Itemized.";
}
