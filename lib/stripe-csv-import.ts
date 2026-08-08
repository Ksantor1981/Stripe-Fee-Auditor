import { validateColumns, type RawRow } from "./csv-parser";
import {
  convertPaymentsCsvToBalanceRows,
  isStripePaymentsExport,
} from "./stripe-payments-csv";

/** Supported Stripe CSV shapes — user may export from any common Dashboard path. */
export type StripeCsvFormat =
  | "balance_itemized"
  | "balance_legacy"
  | "payments"
  | "unknown";

function normalizeHeaderName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const FORMAT_LABELS: Record<Exclude<StripeCsvFormat, "unknown">, string> = {
  balance_itemized: "Stripe Balance (itemized) export",
  balance_legacy: "Stripe Balance CSV",
  payments: "Stripe Payments export",
};

const FORMAT_NOTICES: Partial<Record<StripeCsvFormat, string>> = {
  payments:
    "Recognized Stripe Payments export — converted automatically. For disputes, Radar, and payout lines, use Reports → Balance summary → Itemized when available.",
};

/**
 * Detect which Stripe export the user uploaded.
 * Prefer native Balance formats; fall back to Payments/Charges unified export.
 */
export function detectStripeCsvFormat(headers: string[]): StripeCsvFormat {
  if (!headers.length) return "unknown";

  if (validateColumns(headers).length === 0) {
    const norm = new Set(headers.map(normalizeHeaderName));
    if (
      norm.has("balancetransactionid") ||
      (norm.has("gross") && norm.has("reportingcategory"))
    ) {
      return "balance_itemized";
    }
    return "balance_legacy";
  }

  if (isStripePaymentsExport(headers)) return "payments";

  return "unknown";
}

export function isAutoRecognizedStripeCsv(headers: string[]): boolean {
  return detectStripeCsvFormat(headers) !== "unknown";
}

export function stripeCsvFormatLabel(format: StripeCsvFormat): string | null {
  if (format === "unknown") return null;
  return FORMAT_LABELS[format];
}

export function stripeCsvFormatNotice(format: StripeCsvFormat): string | undefined {
  return FORMAT_NOTICES[format];
}

export type PrepareStripeCsvResult = {
  rows: RawRow[];
  format: StripeCsvFormat;
  notice?: string;
};

/** Normalize any supported Stripe CSV to rows `validateColumns` + `normalizeRow` accept. */
export function prepareStripeCsvRows(rows: RawRow[], headers: string[]): PrepareStripeCsvResult {
  const format = detectStripeCsvFormat(headers);

  if (format === "payments") {
    const converted = convertPaymentsCsvToBalanceRows(rows);
    return {
      rows: converted,
      format,
      notice: FORMAT_NOTICES.payments,
    };
  }

  if (format === "unknown") {
    return { rows, format };
  }

  return { rows, format, notice: FORMAT_NOTICES[format] };
}
