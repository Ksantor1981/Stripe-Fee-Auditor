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
}

export const REQUIRED_COLUMNS = [
  "id",
  "type",
  "amount",
  "fee",
  "net",
  "currency",
  "created",
] as const;

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

export function validateColumns(headers: string[]): string[] {
  const lower = headers.map((h) => h.toLowerCase());
  return REQUIRED_COLUMNS.filter((col) => !lower.includes(col));
}

export function normalizeRow(r: RawRow): NormalizedRow {
  const currency = (r.currency ?? "USD").trim().toUpperCase();

  // Stripe Balance CSV stores amounts in smallest currency unit for most currencies (e.g. cents).
  // Zero-decimal currencies are already in major units in the export.
  const amount = toDollars(parseFloat(r.amount ?? "0"), currency);
  const fee = toDollars(parseFloat(r.fee ?? "0"), currency);
  const net = toDollars(parseFloat(r.net ?? "0"), currency);

  if (isNaN(amount) || isNaN(fee)) {
    throw new Error(`Invalid numeric values in row ${r.id}`);
  }

  // Accept both Unix timestamp (seconds) and ISO string
  const rawDate = r.created ?? r.Created ?? "";
  const ts = isNaN(Number(rawDate))
    ? new Date(rawDate)
    : new Date(Number(rawDate) * 1000);

  if (isNaN(ts.getTime())) {
    throw new Error(`Invalid date in row ${r.id}: ${rawDate}`);
  }

  const isoDate = ts.toISOString();

  const descRaw = r.description ?? r.Description ?? "";
  const description = String(descRaw).trim() || undefined;

  return {
    id: r.id ?? "",
    type: (r.type ?? "").toLowerCase().trim(),
    amount,
    fee,
    net,
    currency,
    date: isoDate.slice(0, 10),
    month: isoDate.slice(0, 7),
    description,
  };
}
