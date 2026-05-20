export type RawRow = Record<string, string>;

export interface NormalizedRow {
  id: string;
  type: string;
  amount: number;
  fee: number;
  net: number;
  currency: string;
  date: string;
  month: string;
  /** From Balance CSV description column when present — used for anomaly classification. */
  description?: string;
  reportingCategory?: string;
  source?: string;
  paymentMethodType?: string;
  cardCountry?: string;
}

export const LEGACY_REQUIRED_COLUMNS = [
  "id",
  "type",
  "amount",
  "fee",
  "net",
  "currency",
  "created",
] as const;

export const BALANCE_REQUIRED_COLUMNS = [
  "balance_transaction_id",
  "reporting_category",
  "gross",
  "fee",
  "net",
  "currency",
] as const;

export const REQUIRED_COLUMNS = LEGACY_REQUIRED_COLUMNS;

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

function toDollars(amount: number, currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase()) ? amount : amount / 100;
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function readValue(row: RawRow, aliases: string[]): string | undefined {
  const wanted = aliases.map(normalizeKey);
  const actualKey = Object.keys(row).find((candidate) => wanted.includes(normalizeKey(candidate)));
  if (!actualKey) return undefined;
  const value = row[actualKey];
  return typeof value === "string" ? value.trim() : undefined;
}

function requiredValue(row: RawRow, aliases: string[], label: string): string {
  const value = readValue(row, aliases);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required value '${label}' in row ${readValue(row, ["id", "balance_transaction_id"]) ?? "(unknown)"}`);
  }
  return value;
}

function parseAmount(raw: string): number {
  return Number(raw.replace(/,/g, ""));
}

function hasColumn(headers: string[], column: string): boolean {
  const wanted = normalizeKey(column);
  return headers.some((h) => normalizeKey(h) === wanted);
}

function hasAll(headers: string[], required: readonly string[]): boolean {
  return required.every((col) => hasColumn(headers, col));
}

export function validateColumns(headers: string[]): string[] {
  if (hasAll(headers, LEGACY_REQUIRED_COLUMNS)) return [];
  if (hasAll(headers, BALANCE_REQUIRED_COLUMNS)) return [];
  const legacyMissing = LEGACY_REQUIRED_COLUMNS.filter((col) => !hasColumn(headers, col));
  const balanceMissing = BALANCE_REQUIRED_COLUMNS.filter((col) => !hasColumn(headers, col));
  return legacyMissing.length <= balanceMissing.length ? legacyMissing : balanceMissing;
}

export function normalizeRow(r: RawRow): NormalizedRow {
  const balanceTransactionId = readValue(r, ["balance_transaction_id"]);
  const reportingCategoryValue = readValue(r, ["reporting_category"]);
  const grossValue = readValue(r, ["gross"]);
  const legacyAmountValue = readValue(r, ["amount"]);
  const isOfficialBalanceRow = Boolean(
    balanceTransactionId ||
    (reportingCategoryValue && grossValue && !legacyAmountValue)
  );

  const id = requiredValue(r, ["balance_transaction_id", "id"], "id");
  const type = requiredValue(r, ["reporting_category", "type"], "type").toLowerCase();
  const currency = requiredValue(r, ["currency"], "currency").toUpperCase();
  const rawDate = requiredValue(
    r,
    ["created", "created_utc", "effective_at", "effective_at_utc", "available_on", "available_on_utc"],
    "created"
  );

  const rawAmount = requiredValue(r, ["gross", "amount"], "amount");
  const rawFee = requiredValue(r, ["fee"], "fee");
  const rawNet = requiredValue(r, ["net"], "net");

  // Stripe Balance reports use major currency units for gross/fee/net.
  // Older API-style exports may use amount/fee/net in smallest units.
  const amount = isOfficialBalanceRow ? parseAmount(rawAmount) : toDollars(parseAmount(rawAmount), currency);
  const fee = isOfficialBalanceRow ? parseAmount(rawFee) : toDollars(parseAmount(rawFee), currency);
  const net = isOfficialBalanceRow ? parseAmount(rawNet) : toDollars(parseAmount(rawNet), currency);

  if (!Number.isFinite(amount) || !Number.isFinite(fee) || !Number.isFinite(net)) {
    throw new Error(`Invalid numeric values in row ${id}`);
  }

  // Accept both Unix timestamp (seconds) and ISO string
  const ts = isNaN(Number(rawDate))
    ? new Date(rawDate)
    : new Date(Number(rawDate) * 1000);

  if (isNaN(ts.getTime())) {
    throw new Error(`Invalid date in row ${id}: ${rawDate}`);
  }

  const isoDate = ts.toISOString();

  const description = readValue(r, ["description"]);
  const reportingCategory = readValue(r, ["reporting_category", "reporting category"]);
  const source = readValue(r, ["source", "source_id", "charge_id"]);
  const paymentMethodType = readValue(r, ["payment_method_type", "payment method type"]);
  const cardCountry = readValue(r, ["card_country", "card country", "issuer_country", "issuer country"]);

  return {
    id,
    type,
    amount,
    fee,
    net,
    currency,
    date: isoDate.slice(0, 10),
    month: isoDate.slice(0, 7),
    description,
    reportingCategory,
    source,
    paymentMethodType,
    cardCountry,
  };
}
