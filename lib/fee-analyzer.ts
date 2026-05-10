// Fee analysis algorithm
import type { NormalizedRow } from "./csv-parser";

export type AnalysisMode = "multi-month" | "single-month" | "low-volume";

export type AnomalyReason =
  | "international_card"    // [international] in description
  | "small_transaction"     // fixed $0.30 dominates small amounts
  | "ach_mismatch"          // ACH but high rate (shouldn't happen, flag it)
  | "currency_conversion"   // currency != usd
  | "elevated_rate"         // generic: rate significantly above baseline
  | "refund_fee_loss";      // refund but fee was charged (non-zero fee on refund)

export interface AnomalyExplanation {
  reason: AnomalyReason;
  label: string;         // short tag, e.g. "International card"
  detail: string;        // one-sentence explanation
  savingsTip: string;    // actionable tip
}

export interface MonthlyBreakdown {
  month: string;
  volume: number;
  fees: number;
  rate: number;
  count: number;
}

export interface AnnotatedRow extends NormalizedRow {
  explanation?: AnomalyExplanation;
}

export interface SavingsOpportunity {
  title: string;
  annualSavings: number;
  tip: string;
}

export interface AnalysisResult {
  mode: AnalysisMode;
  chargeVolume: number;
  chargeFees: number;
  chargeRate: number;
  otherFees: number;
  monthly: MonthlyBreakdown[];
  topDrivers: NormalizedRow[];
  anomalies: NormalizedRow[];
  /** Pro: anomalies with explanations — may be absent on older stored reports. */
  annotatedAnomalies?: AnnotatedRow[];
  /** Pro: actionable savings — may be absent on older stored reports. */
  savingsOpportunities?: SavingsOpportunity[];
  periodDelta: number | null;
  /** Unique currencies found in charge rows — used for multi-currency warning. */
  currencies: string[];
}

function sum(rows: NormalizedRow[], key: keyof NormalizedRow): number {
  return rows.reduce((acc, r) => acc + (r[key] as number), 0);
}

function stdDev(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

const FIXED_CARD_FEE_USD = 0.3;
const SMALL_TRANSACTION_USD = 20;
const LARGE_CARD_CHARGE_USD = 500;
const ACH_RATE = 0.008;
const ACH_CAP_USD = 5;

function searchableText(row: NormalizedRow): string {
  return `${row.id} ${row.description ?? ""}`.toLowerCase();
}

/** Classify why a charge has an elevated fee rate */
function classifyAnomaly(row: NormalizedRow, baselineRate: number): AnomalyExplanation {
  const desc = searchableText(row);
  const rate = row.amount > 0 ? (row.fee / row.amount) * 100 : 0;

  // 1. International card — most common cause
  if (desc.includes("[international]") || desc.includes("international")) {
    const extraFee = row.amount * 0.015; // ~1.5% cross-border fee
    return {
      reason: "international_card",
      label: "International card",
      detail: `Stripe adds a 1.5% cross-border fee for cards issued outside your country. This transaction paid ~$${extraFee.toFixed(2)} extra.`,
      savingsTip: "Consider enabling local payment methods (iDEAL, SEPA, etc.) for EU customers to avoid cross-border fees.",
    };
  }

  // 2. Small transaction — fixed $0.30 fee dominates
  if (row.amount > 0 && row.amount < SMALL_TRANSACTION_USD) {
    const fixedFeeImpact = (FIXED_CARD_FEE_USD / row.amount) * 100;
    return {
      reason: "small_transaction",
      label: "Small transaction",
      detail: `The fixed $0.30 Stripe fee represents ${fixedFeeImpact.toFixed(1)}% of this $${row.amount.toFixed(2)} charge — much more than on larger transactions.`,
      savingsTip: "Bundle small charges or switch to monthly billing to reduce the fixed-fee impact.",
    };
  }

  // 3. Non-USD currency conversion
  if (row.currency && row.currency.toLowerCase() !== "usd") {
    return {
      reason: "currency_conversion",
      label: "Currency conversion",
      detail: `Stripe charges 1–2% for currency conversion on ${row.currency.toUpperCase()} transactions.`,
      savingsTip: "Enable multi-currency payouts in Stripe to settle in the customer's currency and avoid conversion fees.",
    };
  }

  // 4. ACH mismatch (ACH should be cheap — flag if expensive)
  if (desc.includes("ach")) {
    return {
      reason: "ach_mismatch",
      label: "ACH anomaly",
      detail: `ACH payments normally cost 0.8% (capped at $5), but this transaction has a ${rate.toFixed(2)}% effective rate.`,
      savingsTip: "Check if Stripe Billing or additional services are adding fees to this ACH transaction.",
    };
  }

  // 5. Generic elevated rate
  return {
    reason: "elevated_rate",
    label: "Slightly elevated rate",
    detail: `This charge has a ${rate.toFixed(2)}% effective rate vs your ${baselineRate.toFixed(2)}% baseline. This typically occurs with certain card types (Amex, corporate cards) or minor interchange variations — not a major issue but worth monitoring if it appears often.`,
    savingsTip: "For B2B invoices over $500, offering ACH bank transfer (0.8%, capped at $5) can significantly reduce fees compared to card processing.",
  };
}

/** Build savings opportunities summary from anomaly patterns */
function buildSavingsOpportunities(
  charges: NormalizedRow[],
  anomalies: NormalizedRow[],
  baselineRate: number
): SavingsOpportunity[] {
  const opportunities: SavingsOpportunity[] = [];
  const monthsInData = new Set(charges.map((r) => r.month)).size || 1;

  // International card savings
  const intlCharges = charges.filter((r) => searchableText(r).includes("international"));
  if (intlCharges.length > 0) {
    const intlFees = sum(intlCharges, "fee");
    const expectedFees = intlCharges.reduce((acc, r) => acc + r.amount * (baselineRate / 100), 0);
    const excessFees = intlFees - expectedFees;
    if (excessFees > 0) {
      const annualSavings = Math.round(((excessFees * 12) / monthsInData) / 10) * 10;
      opportunities.push({
        title: `Up to ~${intlCharges.length} international card charges (est. savings)`,
        annualSavings,
        tip: "Enable local payment methods (SEPA, iDEAL, Bancontact) to avoid the 1.5% cross-border surcharge.",
      });
    }
  }

  // Small transaction savings
  const smallCharges = charges.filter((r) => r.amount > 0 && r.amount < SMALL_TRANSACTION_USD);
  if (smallCharges.length > 5) {
    const avgSmallAmount = sum(smallCharges, "amount") / smallCharges.length;
    const fixedFeeWaste = smallCharges.length * FIXED_CARD_FEE_USD;
    const annualSavings = Math.round(((fixedFeeWaste * 12) / monthsInData) / 10) * 10;
    if (annualSavings > 0) {
      opportunities.push({
        title: `Up to ~${smallCharges.length} small transactions under $20`,
        annualSavings,
        tip: `Bundling charges or switching to monthly billing for avg $${avgSmallAmount.toFixed(2)} transactions reduces the fixed $0.30 fee impact.`,
      });
    }
  }

  // ACH opportunity for large charges
  const largeCardCharges = charges.filter(
    (r) =>
      r.amount >= LARGE_CARD_CHARGE_USD &&
      !searchableText(r).includes("ach")
  );
  if (largeCardCharges.length > 0) {
    const cardFees = sum(largeCardCharges, "fee");
    const achFees = largeCardCharges.reduce(
      (acc, r) => acc + Math.min(ACH_CAP_USD, r.amount * ACH_RATE),
      0
    );
    const savings = cardFees - achFees;
    if (savings > 0) {
      opportunities.push({
        title: `Up to ~${largeCardCharges.length} large card charges over $500`,
        annualSavings: Math.round(((savings * 12) / monthsInData) / 10) * 10,
        tip: "Offer ACH/bank transfer for invoices over $500. ACH costs 0.8% (max $5) vs 2.9%+ for cards.",
      });
    }
  }

  return opportunities.slice(0, 3); // max 3 tips
}

export function analyze(rows: NormalizedRow[]): AnalysisResult {
  const charges = rows.filter((r) => r.type === "charge");
  const others = rows.filter((r) => r.type !== "charge");

  const chargeVolume = sum(charges, "amount");
  const chargeFees = sum(charges, "fee");
  const chargeRate = chargeVolume > 0 ? (chargeFees / chargeVolume) * 100 : 0;
  const otherFees = sum(others, "fee");

  // Monthly breakdown
  const monthMap = new Map<string, NormalizedRow[]>();
  for (const c of charges) {
    const arr = monthMap.get(c.month) ?? [];
    arr.push(c);
    monthMap.set(c.month, arr);
  }
  const monthly: MonthlyBreakdown[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, rows]) => {
      const volume = sum(rows, "amount");
      const fees = sum(rows, "fee");
      return { month, volume, fees, rate: volume > 0 ? (fees / volume) * 100 : 0, count: rows.length };
    });

  // Mode determination
  let mode: AnalysisMode;
  if (charges.length < 50) {
    mode = "low-volume";
  } else if (monthly.length >= 2) {
    mode = "multi-month";
  } else {
    mode = "single-month";
  }

  // Top drivers and anomalies
  let topDrivers: NormalizedRow[] = [];
  let anomalies: NormalizedRow[] = [];

  if (mode === "low-volume") {
    topDrivers = [...charges].sort((a, b) => b.fee / b.amount - a.fee / a.amount).slice(0, 5);
  } else {
    const rates = monthly.map((m) => m.rate);
    const threshold = chargeRate + 2.5 * stdDev(rates);
    anomalies = charges.filter((c) => c.amount > 0 && (c.fee / c.amount) * 100 > threshold);
    topDrivers = [...charges].sort((a, b) => b.fee - a.fee).slice(0, 10);
  }

  // Annotate anomalies with explanations (used for Pro tier)
  const annotatedAnomalies: AnnotatedRow[] = anomalies.map((row) => ({
    ...row,
    explanation: classifyAnomaly(row, chargeRate),
  }));

  // Build savings opportunities (used for Pro tier)
  const savingsOpportunities = buildSavingsOpportunities(charges, anomalies, chargeRate);

  // Period delta
  let periodDelta: number | null = null;
  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    periodDelta = last.fees - prev.fees;
  }

  const currencies = [...new Set(charges.map((r) => r.currency).filter(Boolean))];

  return {
    mode,
    chargeVolume,
    chargeFees,
    chargeRate,
    otherFees,
    monthly,
    topDrivers,
    anomalies,
    annotatedAnomalies,
    savingsOpportunities,
    periodDelta,
    currencies,
  };
}
