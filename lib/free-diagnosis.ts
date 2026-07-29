import type { AnalysisResult, FeeLeakBreakdownItem } from "./fee-analyzer";

export type FreeDiagnosisKind =
  | "international_card_uplift"
  | "refund_fee_leakage"
  | "small_ticket_drag"
  | "other_fee_lines"
  | "above_benchmark_rate"
  | "unusual_charge";

export interface FreeDiagnosis {
  kind: FreeDiagnosisKind;
  title: string;
  /** Directional period amount; never sent to analytics. */
  amount: number;
  body: string;
  disclaimer?: string;
}

const MIN_DIAGNOSIS_AMOUNT = 0.01;

function breakdownItem(
  items: FeeLeakBreakdownItem[] | undefined,
  key: string
): FeeLeakBreakdownItem | undefined {
  return items?.find((item) => item.key === key && item.amount >= MIN_DIAGNOSIS_AMOUNT);
}

/**
 * Select exactly one concrete, privacy-safe finding for the free preview.
 * This is a directional explanation, not a claim that every fee is avoidable.
 */
export function selectFreeDiagnosis(result: AnalysisResult): FreeDiagnosis | undefined {
  const international = breakdownItem(result.feeLeakBreakdown, "international-uplift");
  if (international) {
    const count = result.geographySummary?.internationalCount ?? 0;
    return {
      kind: "international_card_uplift",
      title: "International cards are lifting your rate",
      amount: international.amount,
      body: `${count} international-looking charge${count === 1 ? "" : "s"} paid above your domestic mix. That is about $${international.amount.toFixed(2)} of directional cross-border/card-mix uplift in this export.`,
      disclaimer: "Estimate compares visible international-looking charges with your domestic mix.",
    };
  }

  const refunds = breakdownItem(result.feeLeakBreakdown, "refund-fee-impact");
  if (refunds) {
    const count = result.refundSummary?.count ?? 0;
    return {
      kind: "refund_fee_leakage",
      title: "Refunds left processing fees behind",
      amount: refunds.amount,
      body: `${count} refund${count === 1 ? "" : "s"} left an estimated $${refunds.amount.toFixed(2)} in retained processing fees in this export.`,
      disclaimer: "Stripe commonly does not return the original processing fee after a refund.",
    };
  }

  const smallTickets = breakdownItem(result.feeLeakBreakdown, "fixed-card-fees");
  if (smallTickets) {
    const smallBucket = result.transactionBuckets?.find((bucket) => bucket.label === "<$20");
    if (smallBucket && smallBucket.count > 0) {
      return {
        kind: "small_ticket_drag",
        title: "Small charges are amplifying fixed fees",
        amount: smallTickets.amount,
        body: `${smallBucket.count} charge${smallBucket.count === 1 ? "" : "s"} under $20 paid ${smallBucket.rate.toFixed(2)}% on average. Fixed per-charge fees account for about $${smallTickets.amount.toFixed(2)} across this export.`,
        disclaimer: "This is the fixed-fee component of your card charges, not a claim that it is avoidable.",
      };
    }
  }

  const otherFees = breakdownItem(result.feeLeakBreakdown, "other-stripe-fees");
  if (otherFees) {
    return {
      kind: "other_fee_lines",
      title: "Non-processing Stripe fee lines showed up",
      amount: otherFees.amount,
      body: `$${otherFees.amount.toFixed(2)} in non-charge Stripe fee lines appears in this export, separate from card processing fees.`,
    };
  }

  const expectedRate = result.benchmark?.expectedRate ?? 0;
  const rateGap = result.chargeRate - expectedRate;
  if (result.benchmark?.status === "high" && rateGap >= 0.1 && result.chargeVolume > 0) {
    const amount = (result.chargeVolume * rateGap) / 100;
    return {
      kind: "above_benchmark_rate",
      title: "Your processing rate is above this mix's benchmark",
      amount,
      body: `Your ${result.chargeRate.toFixed(2)}% processing rate is ${rateGap.toFixed(2)} percentage points above the rough ${expectedRate.toFixed(2)}% benchmark for this mix — about $${amount.toFixed(2)} across this export.`,
      disclaimer: "This is a directional benchmark, not proof that the difference is avoidable.",
    };
  }

  const unusual = result.anomalies
    .filter((row) => row.fee >= MIN_DIAGNOSIS_AMOUNT)
    .sort((a, b) => b.fee - a.fee)[0];
  if (unusual) {
    return {
      kind: "unusual_charge",
      title: "One charge deserves a closer look",
      amount: unusual.fee,
      body: `We found an unusually high-fee charge with $${unusual.fee.toFixed(2)} in Stripe fees. The full report explains the pattern and shows the affected rows.`,
    };
  }

  return undefined;
}
