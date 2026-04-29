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

export function validateColumns(headers: string[]): string[] {
  const lower = headers.map((h) => h.toLowerCase());
  return REQUIRED_COLUMNS.filter((col) => !lower.includes(col));
}

export function normalizeRow(r: RawRow): NormalizedRow {
  // Stripe Balance CSV stores amounts in smallest currency unit (cents)
  const amount = parseFloat(r.amount ?? "0") / 100;
  const fee = parseFloat(r.fee ?? "0") / 100;
  const net = parseFloat(r.net ?? "0") / 100;

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

  return {
    id: r.id ?? "",
    type: (r.type ?? "").toLowerCase().trim(),
    amount,
    fee,
    net,
    currency: (r.currency ?? "USD").toUpperCase(),
    date: isoDate.slice(0, 10),
    month: isoDate.slice(0, 7),
  };
}
