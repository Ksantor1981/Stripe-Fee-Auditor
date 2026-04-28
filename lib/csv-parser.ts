// CSV parsing and normalization — implemented on Day 3

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

export const REQUIRED_COLUMNS = ["id", "type", "amount", "fee", "net", "currency", "created"] as const;

export function validateColumns(headers: string[]): string[] {
  return REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
}

export function normalizeRow(r: RawRow): NormalizedRow {
  return {
    id: r.id,
    type: r.type,
    amount: parseFloat(r.amount) / 100,
    fee: parseFloat(r.fee) / 100,
    net: parseFloat(r.net) / 100,
    currency: (r.currency ?? "USD").toUpperCase(),
    date: new Date(r.created).toISOString().slice(0, 10),
    month: new Date(r.created).toISOString().slice(0, 7),
  };
}
