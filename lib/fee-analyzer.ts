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
}

function sum(rows: NormalizedRow[], key: keyof NormalizedRow): number {
  return rows.reduce((acc, r) => acc + (r[key] as number), 0);
}

function stdDev(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/** Classify why a charge has an elevated fee rate */
function classifyAnomaly(row: NormalizedRow, baselineRate: number): AnomalyExplanation {
  const desc = (row.description ?? "").toLowerCase();
  const rate = row.amount > 0 ? (row.fee / row.amount) * 100 : 0;
  const excessRate = rate - baselineRate;

  // 1. International card — most common cause
  if (desc.includes("[international]") || desc.includes("international")) {
    const extraFee = Math.round(row.amount * 0.015); // ~1.5% cross-border fee
    return {
      reason: "international_card",
      label: "International card",
      detail: `Stripe adds a 1.5% cross-border fee for cards issued outside your country. This transaction paid ~$${(extraFee / 100).toFixed(2)} extra.`,
      savingsTip: "Consider enabling local payment methods (iDEAL, SEPA, etc.) for EU customers to avoid cross-border fees.",
    };
  }

  // 2. Small transaction — fixed $0.30 fee dominates
  if (row.amount > 0 && row.amount < 2000) {
    const fixedFeeImpact = (30 / row.amount) * 100;
    return {
      reason: "small_transaction",
      label: "Small transaction",
      detail: `The fixed $0.30 Stripe fee represents ${fixedFeeImpact.toFixed(1)}% of this $${(row.amount / 100).toFixed(2)} charge — much more than on larger transactions.`,
      savingsTip: "Bundle small charges or switch to monthly billing to reduce the fixed-fee impact.",
    };
  }

  // 3. Non-USD currency conversion
  if (row.currency && row.currency !== "usd") {
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
    label: "Elevated rate",
    detail: `This transaction's effective rate (${rate.toFixed(2)}%) is ${excessRate.toFixed(2)}pp above your ${baselineRate.toFixed(2)}% baseline — likely a premium card type (Amex, corporate card) or additional Stripe add-on.`,
    savingsTip: "Check if this customer uses an American Express or corporate card. ACH may be a better option for high-value B2B invoices.",
  };
}

/** Build savings opportunities summary from anomaly patterns */
function buildSavingsOpportunities(
  charges: NormalizedRow[],
  anomalies: NormalizedRow[],
  baselineRate: number
): SavingsOpportunity[] {
  const opportunities: SavingsOpportunity[] = [];

  // International card savings
  const intlCharges = charges.filter(
    (r) => (r.description ?? "").toLowerCase().includes("international")
  );
  if (intlCharges.length > 0) {
    const intlFees = sum(intlCharges, "fee");
    const expectedFees = intlCharges.reduce((acc, r) => acc + r.amount * (baselineRate / 100), 0);
    const excessFees = intlFees - expectedFees;
    if (excessFees > 0) {
      const annualSavings = Math.round((excessFees / charges.length) * 12 * intlCharges.length / 100) * 100;
      opportunities.push({
        title: `${intlCharges.length} international card charges`,
        annualSavings,
        tip: "Enable local payment methods (SEPA, iDEAL, Bancontact) to avoid the 1.5% cross-border surcharge.",
      });
    }
  }

  // Small transaction savings
  const smallCharges = charges.filter((r) => r.amount > 0 && r.amount < 2000);
  if (smallCharges.length > 5) {
    const avgSmallAmount = sum(smallCharges, "amount") / smallCharges.length;
    const fixedFeeWaste = smallCharges.length * 30; // $0.30 per charge
    const annualSavings = Math.round((fixedFeeWaste / charges.length) * 12 / 100) * 100;
    if (annualSavings > 0) {
      opportunities.push({
        title: `${smallCharges.length} small transactions under $20`,
        annualSavings,
        tip: `Bundling charges or switching to monthly billing for avg $${(avgSmallAmount / 100).toFixed(2)} transactions reduces the fixed $0.30 fee impact.`,
      });
    }
  }

  // ACH opportunity for large charges
  const largeCardCharges = charges.filter(
    (r) =>
      r.amount >= 50000 &&
      !(r.description ?? "").toLowerCase().includes("ach")
  );
  if (largeCardCharges.length > 0) {
    const totalLargeVolume = sum(largeCardCharges, "amount");
    const cardFees = sum(largeCardCharges, "fee");
    const achFees = Math.min(largeCardCharges.length * 500, totalLargeVolume * 0.008); // ACH: 0.8% capped at $5
    const savings = cardFees - achFees;
    if (savings > 0) {
      opportunities.push({
        title: `${largeCardCharges.length} large card charges over $500`,
        annualSavings: Math.round((savings / charges.length) * 12 / 100) * 100,
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
    const threshold = chargeRate + 2 * stdDev(rates);
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
  };
}
