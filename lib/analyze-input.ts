import Papa from "papaparse";
import type { RawRow } from "./csv-parser";

/** Hard cap on parsed CSV rows to limit CPU/memory DoS per request. */
export const MAX_CSV_ROWS = 75_000;

export type CsvParseOutcome =
  | { ok: true; rows: RawRow[]; errors: Papa.ParseError[] }
  | { ok: false; reason: "too_many_rows" };

/** Parse CSV with early abort once row count exceeds MAX_CSV_ROWS. */
export function parseCsvWithRowLimit(csvText: string): CsvParseOutcome {
  const rows: RawRow[] = [];
  const errors: Papa.ParseError[] = [];
  let tooManyRows = false;

  Papa.parse<RawRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    step: (result, parser) => {
      if (result.errors?.length) errors.push(...result.errors);
      rows.push(result.data);
      if (rows.length > MAX_CSV_ROWS) {
        tooManyRows = true;
        parser.abort();
      }
    },
  });

  if (tooManyRows) return { ok: false, reason: "too_many_rows" };
  return { ok: true, rows, errors };
}

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Strip unsafe mapping keys and unknown canonical columns before remap.
 * Prevents prototype pollution-style keys and limits remap surface.
 */
export function sanitizeColumnMapping(
  mapping: Record<string, string> | undefined,
  allowedCanonical: ReadonlySet<string>
): Record<string, string> | undefined {
  if (!mapping || typeof mapping !== "object") return undefined;
  const out: Record<string, string> = {};
  for (const [canonical, original] of Object.entries(mapping)) {
    if (typeof canonical !== "string" || typeof original !== "string") continue;
    const c = canonical.trim();
    const o = original.trim();
    if (!c || DANGEROUS_KEYS.has(c) || DANGEROUS_KEYS.has(o)) continue;
    if (!allowedCanonical.has(c)) continue;
    out[c] = o;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
