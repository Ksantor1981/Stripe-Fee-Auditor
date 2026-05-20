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
  /** Present on newly generated reports; older stored JSON may omit. */
  confidence?: "high" | "medium" | "low";
  steps?: string[];
  /** Primary CTA — Stripe Dashboard or docs. */
  actionLabel?: string;
  actionUrl?: string;
  /** Estimated loss in the export period (for Problem → Loss copy). */
  periodLoss?: number;
}

/** Pre-aggregated domestic vs international charge mix for report UI (no raw rows). */
export interface GeographySummary {
  domesticCount: number;
  internationalCount: number;
  domVolume: number;
  intlVolume: number;
  domRate: number;
  intlRate: number;
  intlShare: number;
  /** Percent more expensive: international effective rate vs domestic. */
  pctDiff: number;
  intlExcessShare: number;
  excessIntlFees: number;
}

export type BenchmarkStatus = "normal" | "watch" | "high";

export interface FeeBenchmark {
  status: BenchmarkStatus;
  label: string;
  rangeLow: number;
  rangeHigh: number;
  expectedRate: number;
  summary: string;
  drivers: string[];
}

export interface RefundSummary {
  count: number;
  volume: number;
  refundRate: number;
  directFees: number;
  estimatedRetainedFees: number;
  estimatedAnnualCost: number;
}

export interface TransactionBucket {
  label: string; // "<$20", "$20–50", etc.
  minAmount: number;
  maxAmount: number;
  count: number;
  volume: number;
  fees: number;
  rate: number; // effective rate %
  avgFee: number; // avg fee per transaction
}

/** Share of all-in Stripe fees for donut / breakdown charts (derived from CSV rows). */
export interface FeeMixSlice {
  label: string;
  amount: number;
  /** Percent of total all-in fees (sums ~100 across slices). */
  sharePct: number;
}

export type FeeLeakBreakdownKind = "direct" | "estimated";
export type FeeLeakBreakdownSeverity = "low" | "medium" | "high";

export interface FeeLeakBreakdownItem {
  key: string;
  label: string;
  amount: number;
  /** Share of direct all-in Stripe fees. Estimated items can overlap and are not additive. */
  sharePct: number;
  kind: FeeLeakBreakdownKind;
  severity: FeeLeakBreakdownSeverity;
  detail: string;
  action: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface AnalysisResult {
  mode: AnalysisMode;
  chargeVolume: number;
  chargeFees: number;
  chargeRate: number;
  otherFees: number;
  /** Direct Stripe fees in the export: charge fees + non-charge fee lines. */
  allInFees: number;
  /** Direct Stripe fees divided by charge volume. This excludes estimated retained refund fees. */
  allInRate: number;
  monthly: MonthlyBreakdown[];
  topDrivers: NormalizedRow[];
  anomalies: NormalizedRow[];
  /** Pro: anomalies with explanations — may be absent on older stored reports. */
  annotatedAnomalies?: AnnotatedRow[];
  /** Pro: actionable savings — may be absent on older stored reports. */
  savingsOpportunities?: SavingsOpportunity[];
  /** Rough directional benchmark against the expected Stripe fee range for this transaction mix. */
  benchmark?: FeeBenchmark;
  /** Estimated cost of refunds where the original processing fee is not returned. */
  refundSummary?: RefundSummary;
  transactionBuckets?: TransactionBucket[];
  /** Domestic vs international aggregates derived from all charge rows. */
  geographySummary?: GeographySummary;
  /** Coarse fee buckets: card processing vs disputes, refunds, etc. */
  feeMix?: FeeMixSlice[];
  /** Action-oriented breakdown for the report UI: fixed fees, international uplift, refunds, and other fee lines. */
  feeLeakBreakdown?: FeeLeakBreakdownItem[];
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
/** Conservative share of eligible $500+ invoices expected to move off cards to ACH. */
const ACH_SWITCHING_SHARE_ASSUMPTION = 0.2;

function searchableText(row: NormalizedRow): string {
  return `${row.id} ${row.description ?? ""}`.toLowerCase();
}

function isInternationalLike(row: NormalizedRow): boolean {
  if (row.cardCountry && row.cardCountry.toUpperCase() !== "US") return true;
  const text = searchableText(row);
  return text.includes("[international]") || text.includes("international") || text.includes("cross-border");
}

function isAchLike(row: NormalizedRow): boolean {
  const text = `${row.paymentMethodType ?? ""} ${searchableText(row)}`.toLowerCase();
  return text.includes("ach") || text.includes("us_bank_account");
}

function nonChargeFeeAmount(row: NormalizedRow): number {
  if (row.type === "charge") return 0;

  const directFee = Math.abs(row.fee);
  if (directFee > 0) return directFee;

  const category = `${row.type} ${row.reportingCategory ?? ""}`.toLowerCase();
  if (category.includes("fee")) {
    return Math.abs(row.amount || row.net);
  }

  // Dispute/chargeback rows often carry the $15 cost as amount with fee=0 in Balance CSV.
  if (category.includes("dispute") || category.includes("chargeback")) {
    return Math.abs(row.amount || row.net);
  }

  return 0;
}

function nonChargeFeeCategory(row: NormalizedRow): string {
  const t = `${row.type} ${row.reportingCategory ?? ""}`.toLowerCase();
  if (t.includes("refund")) return "Refund-related fees";
  if (t.includes("dispute") || t.includes("chargeback")) return "Disputes & chargebacks";
  if (t.includes("radar") || t.includes("fraud")) return "Radar & fraud tools";
  if (t.includes("billing") || t.includes("invoice") || t.includes("subscription"))
    return "Billing & subscriptions";
  if (t.includes("payout") || t.includes("transfer")) return "Payouts & transfers";
  if (t.includes("tax") || t.includes("stripe_tax")) return "Tax & compliance";
  if (t.includes("connect") || t.includes("application_fee")) return "Connect & platform";
  if (t.includes("terminal")) return "Terminal";
  if (t.includes("climate")) return "Climate & contributions";
  const raw = (row.reportingCategory || row.type).replace(/_/g, " ").trim();
  if (!raw) return "Other Stripe fees";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Buckets for donut chart: charge processing + grouped non-charge fee lines. */
function buildFeeMix(rows: NormalizedRow[], chargeFees: number, allInFees: number): FeeMixSlice[] | undefined {
  if (allInFees <= 0) return undefined;

  const buckets = new Map<string, number>();
  for (const row of rows) {
    if (row.type === "charge") continue;
    const amt = nonChargeFeeAmount(row);
    if (amt <= 0) continue;
    const label = nonChargeFeeCategory(row);
    buckets.set(label, (buckets.get(label) ?? 0) + amt);
  }

  const slices: FeeMixSlice[] = [];
  if (chargeFees > 0.005) {
    slices.push({
      label: "Card & charge processing",
      amount: roundMoney(chargeFees),
      sharePct: 0,
    });
  }

  for (const [label, amount] of [...buckets.entries()].sort((a, b) => b[1] - a[1])) {
    if (amount < 0.005) continue;
    slices.push({
      label,
      amount: roundMoney(amount),
      sharePct: 0,
    });
  }

  if (slices.length === 0) return undefined;

  const total = slices.reduce((acc, s) => acc + s.amount, 0);
  if (total <= 0) return undefined;

  return slices.map((s) => ({
    ...s,
    sharePct: roundMoney((s.amount / total) * 100),
  }));
}

function feeShare(amount: number, allInFees: number): number {
  return allInFees > 0 ? roundMoney((amount / allInFees) * 100) : 0;
}

function buildFeeLeakBreakdown(
  rows: NormalizedRow[],
  charges: NormalizedRow[],
  chargeFees: number,
  otherFees: number,
  allInFees: number,
  geographySummary: GeographySummary | undefined,
  refundSummary: RefundSummary
): FeeLeakBreakdownItem[] | undefined {
  if (allInFees <= 0 || charges.length === 0) return undefined;

  const items: FeeLeakBreakdownItem[] = [];
  const addItem = (item: Omit<FeeLeakBreakdownItem, "sharePct">) => {
    if (item.amount <= 0.005) return;
    items.push({
      ...item,
      amount: roundMoney(item.amount),
      sharePct: feeShare(item.amount, allInFees),
    });
  };

  const fixedFeeDrag = Math.min(chargeFees, charges.length * FIXED_CARD_FEE_USD);
  addItem({
    key: "fixed-card-fees",
    label: "Fixed per-charge fees",
    amount: fixedFeeDrag,
    kind: "estimated",
    severity: fixedFeeDrag / allInFees >= 0.25 ? "high" : "medium",
    detail: `$${FIXED_CARD_FEE_USD.toFixed(2)} x ${charges.length} charge rows. This is why low-ticket subscriptions can look much more expensive than 2.9%.`,
    action: "Bundle tiny charges, move very small plans to monthly billing, or set a minimum invoice size where it fits your model.",
    actionLabel: "Review Stripe Billing settings",
    actionUrl: "https://dashboard.stripe.com/settings/billing",
  });

  const internationalExcess = geographySummary?.excessIntlFees ?? 0;
  if (internationalExcess > 0) {
    addItem({
      key: "international-uplift",
      label: "International card uplift",
      amount: internationalExcess,
      kind: "estimated",
      severity: internationalExcess / allInFees >= 0.15 ? "high" : "medium",
      detail: `${geographySummary?.internationalCount ?? 0} international-looking charges paid above your domestic mix. This is a directional cross-border/card-mix estimate.`,
      action: "Offer local payment methods in high-volume regions and consider local currency pricing where you have meaningful customer concentration.",
      actionLabel: "Open Stripe payment methods",
      actionUrl: "https://dashboard.stripe.com/settings/payment_methods",
    });
  }

  const nonUsdCharges = charges.filter((r) => r.currency && r.currency.toLowerCase() !== "usd");
  const nonUsdVolume = sum(nonUsdCharges, "amount");
  const estimatedFxSpread = nonUsdVolume * 0.01;
  if (estimatedFxSpread > 0) {
    addItem({
      key: "currency-conversion",
      label: "Currency conversion estimate",
      amount: estimatedFxSpread,
      kind: "estimated",
      severity: estimatedFxSpread / allInFees >= 0.1 ? "high" : "medium",
      detail: `${nonUsdCharges.length} non-USD charges found. Stripe conversion spread is usually not shown as a clean fee row, so this is an estimate.`,
      action: "If you repeatedly sell in the same currency, compare local settlement / multi-currency payout options before scaling that market.",
      actionLabel: "Open Stripe payout settings",
      actionUrl: "https://dashboard.stripe.com/settings/payouts",
    });
  }

  if (refundSummary.count > 0 && refundSummary.estimatedRetainedFees > 0) {
    addItem({
      key: "refund-fee-impact",
      label: "Refund fee impact",
      amount: refundSummary.estimatedRetainedFees,
      kind: "estimated",
      severity: refundSummary.estimatedRetainedFees / allInFees >= 0.1 ? "high" : "medium",
      detail: `${refundSummary.count} refunds totaling $${refundSummary.volume.toFixed(2)}. Stripe commonly keeps the original processing fee when a charge is refunded.`,
      action: "Track refund reasons and consider trial gates, clearer billing copy, or annual plans if refunds cluster around renewals.",
    });
  }

  if (otherFees > 0) {
    addItem({
      key: "other-stripe-fees",
      label: "Other Stripe fee lines",
      amount: otherFees,
      kind: "direct",
      severity: otherFees / allInFees >= 0.15 ? "high" : "medium",
      detail: "Direct non-charge fee rows in the Balance CSV: refunds, disputes, payouts, Radar, Billing, Tax, Connect, or other Stripe services.",
      action: "Open the CSV export and filter non-charge rows by reporting category to identify which add-ons or events are driving this bucket.",
    });
  }

  const explainableEstimates = fixedFeeDrag + Math.max(0, internationalExcess);
  const baseCardFees = Math.max(0, chargeFees - Math.min(chargeFees, explainableEstimates));
  addItem({
    key: "base-card-processing",
    label: "Base card processing",
    amount: baseCardFees,
    kind: "direct",
    severity: "low",
    detail: "The remaining direct card-processing fees after separating fixed-fee drag and visible international uplift estimates.",
    action: "Usually not the first optimization target. Focus on fixed-fee drag, international mix, refunds, and other fee lines first.",
  });

  const hasNonChargeFeeRows = rows.some((row) => row.type !== "charge" && nonChargeFeeAmount(row) > 0);
  if (!hasNonChargeFeeRows && otherFees <= 0 && items.length <= 2) {
    addItem({
      key: "clean-export",
      label: "No separate fee rows found",
      amount: 0.01,
      kind: "direct",
      severity: "low",
      detail: "This export is mostly charge processing. For a fuller all-in view, include refunds, disputes, payouts, and Stripe service fees in the Balance export.",
      action: "Export an itemized Balance report for the full period if you expected disputes, refunds, or payout fees.",
    });
  }

  return items.sort((a, b) => b.amount - a.amount).slice(0, 6);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Classify why a charge has an elevated fee rate */
function classifyAnomaly(row: NormalizedRow, baselineRate: number): AnomalyExplanation {
  const rate = row.amount > 0 ? (row.fee / row.amount) * 100 : 0;

  // 1. International card — most common cause
  if (isInternationalLike(row)) {
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
  if (isAchLike(row)) {
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
  baselineRate: number,
  monthsInData: number
): SavingsOpportunity[] {
  const opportunities: SavingsOpportunity[] = [];
  const months = Math.max(1, monthsInData);

  // International card savings
  const intlCharges = charges.filter(isInternationalLike);
  if (intlCharges.length > 0) {
    const intlFees = sum(intlCharges, "fee");
    const intlVolume = sum(intlCharges, "amount");
    const expectedFees = intlCharges.reduce((acc, r) => acc + r.amount * (baselineRate / 100), 0);
    const observedExcessFees = Math.max(0, intlFees - expectedFees);
    const avoidableCrossBorderFees = intlVolume * 0.015;
    const excessFees = Math.min(observedExcessFees, avoidableCrossBorderFees);
    if (excessFees > 0) {
      const annualSavings = Math.round(((excessFees * 12) / months) / 10) * 10;
      opportunities.push({
        title: "High international card fees",
        periodLoss: roundMoney(excessFees),
        annualSavings,
        tip: "Cross-border cards often add ~1.5% on top of domestic pricing. Local methods (SEPA, iDEAL) can reduce that for EU customers.",
        confidence: "medium",
        actionLabel: "Open Stripe payment methods",
        actionUrl: "https://dashboard.stripe.com/settings/payment_methods",
        steps: [
          "Enable SEPA Direct Debit (EU) or iDEAL (Netherlands)",
          "Offer local methods at checkout for EU/UK customers",
        ],
      });
    }
  }

  // Small transaction savings
  const smallCharges = charges.filter((r) => r.amount > 0 && r.amount < SMALL_TRANSACTION_USD);
  if (smallCharges.length > 5) {
    const avgSmallAmount = sum(smallCharges, "amount") / smallCharges.length;
    const assumedAvoidableFixedFees = Math.floor(smallCharges.length / 2) * FIXED_CARD_FEE_USD;
    const annualSavings = Math.round(((assumedAvoidableFixedFees * 12) / months) / 10) * 10;
    if (annualSavings > 0) {
      opportunities.push({
        title: "Small transactions — fixed $0.30 dominates",
        periodLoss: roundMoney(assumedAvoidableFixedFees),
        annualSavings,
        tip: `${smallCharges.length} charges under $20 (avg $${avgSmallAmount.toFixed(2)}). Bundling or monthly billing cuts repeated $0.30 fixed fees.`,
        confidence: "medium",
        actionLabel: "Review Stripe Billing settings",
        actionUrl: "https://dashboard.stripe.com/settings/billing",
        steps: [
          "Set a minimum charge in checkout where it fits your model",
          "Move sub-$10 subs to one monthly invoice",
        ],
      });
    }
  }

  // ACH opportunity for large charges
  const largeCardCharges = charges.filter(
    (r) =>
      r.amount >= LARGE_CARD_CHARGE_USD &&
      !isAchLike(r)
  );
  if (largeCardCharges.length > 0) {
    const cardFees = sum(largeCardCharges, "fee");
    const achFees = largeCardCharges.reduce(
      (acc, r) => acc + Math.min(ACH_CAP_USD, r.amount * ACH_RATE),
      0
    );
    const savings = cardFees - achFees;
    if (savings > 0) {
      const rawAnnualIfFullSwitch = ((savings * 12) / months) * ACH_SWITCHING_SHARE_ASSUMPTION;
      const annualSavings = Math.round(rawAnnualIfFullSwitch / 10) * 10;
      opportunities.push({
        title: "Large invoices still on cards — ACH is cheaper",
        periodLoss: roundMoney(savings),
        annualSavings,
        tip: `${largeCardCharges.length} charges over $500 on cards. ACH is ~0.8% (max $5) vs card pricing. Estimate assumes ~${Math.round(ACH_SWITCHING_SHARE_ASSUMPTION * 100)}% could switch.`,
        confidence: "high",
        actionLabel: "Enable ACH in Stripe",
        actionUrl: "https://dashboard.stripe.com/settings/payment_methods",
        steps: [
          "Enable ACH Direct Debit under Payment methods",
          "Offer bank transfer on $500+ invoices",
        ],
      });
    }
  }

  return opportunities.slice(0, 3); // max 3 tips
}

function buildRefundSummary(
  rows: NormalizedRow[],
  chargeVolume: number,
  chargeRate: number,
  monthsInData: number
): RefundSummary {
  const refunds = rows.filter((r) => r.type.toLowerCase().includes("refund"));
  const volume = refunds.reduce((acc, r) => acc + Math.abs(r.amount), 0);
  const directFees = refunds.reduce((acc, r) => acc + Math.abs(r.fee), 0);
  const estimatedOriginalFees = chargeRate > 0 ? volume * (chargeRate / 100) : 0;
  const estimatedRetainedFees = roundMoney(estimatedOriginalFees + directFees);

  return {
    count: refunds.length,
    volume: roundMoney(volume),
    refundRate: chargeVolume > 0 ? (volume / chargeVolume) * 100 : 0,
    directFees: roundMoney(directFees),
    estimatedRetainedFees,
    estimatedAnnualCost: monthsInData > 0 ? roundMoney((estimatedRetainedFees * 12) / monthsInData) : 0,
  };
}

function buildFeeBenchmark(
  charges: NormalizedRow[],
  chargeRate: number,
  refundSummary: RefundSummary
): FeeBenchmark {
  const chargeVolume = sum(charges, "amount");
  if (charges.length === 0 || chargeVolume <= 0) {
    return {
      status: "normal",
      label: "No charge benchmark",
      rangeLow: 0,
      rangeHigh: 0,
      expectedRate: 0,
      summary: "There are no charge rows to benchmark yet.",
      drivers: [],
    };
  }

  const baseCardFees = charges.reduce(
    (acc, r) => acc + Math.max(0, r.amount) * 0.029 + FIXED_CARD_FEE_USD,
    0
  );
  const internationalCharges = charges.filter(isInternationalLike);
  const nonUsdCharges = charges.filter((r) => r.currency && r.currency.toLowerCase() !== "usd");
  const smallCharges = charges.filter((r) => r.amount > 0 && r.amount < SMALL_TRANSACTION_USD);
  const internationalVolume = sum(internationalCharges, "amount");
  const nonUsdVolume = sum(nonUsdCharges, "amount");

  // Directional benchmark: published card pricing + common visible surcharges in the CSV.
  const expectedFees = baseCardFees + internationalVolume * 0.015 + nonUsdVolume * 0.01;
  const expectedRate = (expectedFees / chargeVolume) * 100;
  const lowVolumePadding = charges.length < 50 ? 1.0 : 0.65;
  const rangeLow = Math.max(0, expectedRate - 0.25);
  const rangeHigh = expectedRate + lowVolumePadding;

  const status: BenchmarkStatus =
    chargeRate <= rangeHigh ? "normal" : chargeRate <= rangeHigh + 0.75 ? "watch" : "high";

  const drivers: string[] = [];
  if (internationalVolume / chargeVolume >= 0.05) drivers.push("international / cross-border cards");
  if (nonUsdVolume > 0) drivers.push("non-USD or currency conversion mix");
  if (smallCharges.length / charges.length >= 0.15) drivers.push("small charges where the fixed $0.30 fee matters");
  if (refundSummary.count > 0) drivers.push("refunds with retained processing fees");
  if (status !== "normal" && drivers.length === 0) {
    drivers.push("premium cards, disputes, Radar/add-on fees, or plan-specific pricing");
  }
  if (drivers.length === 0) drivers.push("domestic card mix and fixed per-transaction fees");

  const label =
    status === "normal"
      ? charges.length < 50 ? "Directional benchmark" : "Looks normal for this mix"
      : status === "watch"
        ? "Worth reviewing"
        : "High versus typical range";

  const summary =
    status === "normal"
      ? `Your ${chargeRate.toFixed(2)}% blended rate is inside the rough range expected for this transaction mix.`
      : status === "watch"
        ? `Your ${chargeRate.toFixed(2)}% blended rate is slightly above the rough expected range for this mix.`
        : `Your ${chargeRate.toFixed(2)}% blended rate is materially above the rough expected range for this mix.`;

  return {
    status,
    label,
    rangeLow: roundMoney(rangeLow),
    rangeHigh: roundMoney(rangeHigh),
    expectedRate: roundMoney(expectedRate),
    summary,
    drivers,
  };
}

function buildGeographySummary(charges: NormalizedRow[]): GeographySummary | undefined {
  const domestic = charges.filter((r) => !isInternationalLike(r));
  const international = charges.filter(isInternationalLike);
  if (international.length === 0) return undefined;

  const domVolume = sum(domestic, "amount");
  const domFees = sum(domestic, "fee");
  const domRate = domVolume > 0 ? (domFees / domVolume) * 100 : 0;

  const intlVolume = sum(international, "amount");
  const intlFees = sum(international, "fee");
  const intlRate = intlVolume > 0 ? (intlFees / intlVolume) * 100 : 0;

  const totalVolume = domVolume + intlVolume;
  const intlShare = totalVolume > 0 ? (intlVolume / totalVolume) * 100 : 0;

  const totalFees = domFees + intlFees;
  const excessIntlFees = intlFees - intlVolume * (domRate / 100);
  const intlExcessShare = totalFees > 0 ? (Math.max(0, excessIntlFees) / totalFees) * 100 : 0;
  const pctDiff = domRate > 0 ? ((intlRate - domRate) / domRate) * 100 : 0;

  return {
    domesticCount: domestic.length,
    internationalCount: international.length,
    domVolume: roundMoney(domVolume),
    intlVolume: roundMoney(intlVolume),
    domRate: roundMoney(domRate),
    intlRate: roundMoney(intlRate),
    intlShare: roundMoney(intlShare),
    pctDiff: roundMoney(pctDiff),
    intlExcessShare: roundMoney(Math.max(0, intlExcessShare)),
    excessIntlFees: roundMoney(Math.max(0, excessIntlFees)),
  };
}

function buildTransactionBuckets(charges: NormalizedRow[]): TransactionBucket[] {
  const BUCKETS: { label: string; min: number; max: number }[] = [
    { label: "<$20", min: 0, max: 20 },
    { label: "$20–50", min: 20, max: 50 },
    { label: "$50–100", min: 50, max: 100 },
    { label: "$100–250", min: 100, max: 250 },
    { label: "$250+", min: 250, max: Infinity },
  ];

  return BUCKETS.map(({ label, min, max }) => {
    const rows = charges.filter((r) => r.amount >= min && r.amount < max);
    const volume = rows.reduce((a, r) => a + r.amount, 0);
    const fees = rows.reduce((a, r) => a + r.fee, 0);
    return {
      label,
      minAmount: min,
      maxAmount: max,
      count: rows.length,
      volume: roundMoney(volume),
      fees: roundMoney(fees),
      rate: volume > 0 ? roundMoney((fees / volume) * 100) : 0,
      avgFee: rows.length > 0 ? roundMoney(fees / rows.length) : 0,
    };
  });
}

function redactStoredRow<T extends NormalizedRow>(row: T): T {
  const clone = { ...row };
  delete clone.description;
  return clone;
}

/**
 * Keep descriptions available in-memory for classification, but avoid persisting
 * free-text customer/order details from Stripe CSV exports in report JSON.
 */
export function redactAnalysisResultForStorage(result: AnalysisResult): AnalysisResult {
  return {
    ...result,
    topDrivers: result.topDrivers.map(redactStoredRow),
    anomalies: result.anomalies.map(redactStoredRow),
    annotatedAnomalies: result.annotatedAnomalies?.map(redactStoredRow),
  };
}

export function analyze(rows: NormalizedRow[]): AnalysisResult {
  const charges = rows.filter((r) => r.type === "charge");
  const others = rows.filter((r) => r.type !== "charge");

  const chargeVolume = sum(charges, "amount");
  const chargeFees = sum(charges, "fee");
  const chargeRate = chargeVolume > 0 ? (chargeFees / chargeVolume) * 100 : 0;
  const otherFees = others.reduce((acc, row) => acc + nonChargeFeeAmount(row), 0);
  const allInFees = chargeFees + otherFees;
  const allInRate = chargeVolume > 0 ? (allInFees / chargeVolume) * 100 : 0;

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
  const monthsInData = monthly.length || 1;

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
    const rates =
      mode === "single-month"
        ? charges.filter((c) => c.amount > 0).map((c) => (c.fee / c.amount) * 100)
        : monthly.map((m) => m.rate);
    const minimumSingleMonthDelta = mode === "single-month" ? 0.5 : 0;
    const threshold = chargeRate + Math.max(minimumSingleMonthDelta, 2.5 * stdDev(rates));
    anomalies = charges.filter((c) => c.amount > 0 && (c.fee / c.amount) * 100 > threshold);
    topDrivers = [...charges].sort((a, b) => b.fee - a.fee).slice(0, 10);
  }

  // Annotate anomalies with explanations (used for Pro tier)
  const annotatedAnomalies: AnnotatedRow[] = anomalies.map((row) => ({
    ...row,
    explanation: classifyAnomaly(row, chargeRate),
  }));

  // Build savings opportunities (used for Pro tier)
  const savingsOpportunities = buildSavingsOpportunities(charges, anomalies, chargeRate, monthsInData);
  const refundSummary = buildRefundSummary(rows, chargeVolume, chargeRate, monthsInData);
  const benchmark = buildFeeBenchmark(charges, chargeRate, refundSummary);

  // Period delta
  let periodDelta: number | null = null;
  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    periodDelta = last.fees - prev.fees;
  }

  const currencies = [...new Set(charges.map((r) => r.currency).filter(Boolean))];

  const transactionBuckets = buildTransactionBuckets(charges);
  const geographySummary = buildGeographySummary(charges);
  const feeMix = buildFeeMix(rows, chargeFees, allInFees);
  const feeLeakBreakdown = buildFeeLeakBreakdown(rows, charges, chargeFees, otherFees, allInFees, geographySummary, refundSummary);

  return {
    mode,
    chargeVolume,
    chargeFees,
    chargeRate,
    otherFees,
    allInFees,
    allInRate,
    monthly,
    topDrivers,
    anomalies,
    annotatedAnomalies,
    savingsOpportunities,
    benchmark,
    refundSummary,
    transactionBuckets,
    geographySummary,
    feeMix,
    feeLeakBreakdown,
    periodDelta,
    currencies,
  };
}

