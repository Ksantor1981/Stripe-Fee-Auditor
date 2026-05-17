import type { NormalizedRow } from "./csv-parser";
import { fmt$, fmtDate } from "./format";

/** Primary line for lists when description may be redacted in stored reports. */
export function transactionPrimaryLabel(row: NormalizedRow): string {
  const d = row.description?.trim();
  if (d) return d;
  const bits: string[] = [`${fmt$(row.amount)} charge`];
  if (row.reportingCategory?.trim()) bits.push(row.reportingCategory.trim());
  return bits.join(" · ");
}

/** Secondary line: date plus id when we showed description; otherwise context without raw txn id as headline. */
export function transactionSecondaryLine(row: NormalizedRow): string {
  const date = fmtDate(row.date);
  if (row.description?.trim()) return `${date} · ${row.id}`;
  const meta = [row.paymentMethodType, row.currency?.toUpperCase()].filter(Boolean).join(" · ");
  return meta ? `${date} · ${meta}` : `${date} · Ref ${row.id.slice(0, 18)}…`;
}
