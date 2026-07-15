import { annualRunRate } from "./fee-period-copy";

const ADVERTISED_CARD_RATE = 2.9;

export type PaywallImpactSource = "savings" | "rate_gap" | "fee_runrate";

export type PaywallImpact = {
  /** Directional annual $ figure shown next to the $12 unlock. */
  amount: number;
  source: PaywallImpactSource;
  /** Short label for copy (opportunity title or generic). */
  label?: string;
};

/**
 * Prefer savings opportunity; else annualize excess vs advertised 2.9%;
 * else fall back to annual fee run-rate so paywall never leads with a feature list.
 */
export function resolvePaywallImpact(input: {
  savingsAnnual?: number | null;
  savingsTitle?: string | null;
  chargeRate?: number | null;
  chargeVolume?: number | null;
  monthCount?: number | null;
  yearlyFeesAtThisRate?: number | null;
}): PaywallImpact | null {
  const savings = input.savingsAnnual;
  if (typeof savings === "number" && Number.isFinite(savings) && savings > 0) {
    return {
      amount: Math.round(savings),
      source: "savings",
      label: input.savingsTitle?.trim() || undefined,
    };
  }

  const rate = input.chargeRate ?? 0;
  const volume = input.chargeVolume ?? 0;
  const months = Math.max(1, input.monthCount ?? 1);
  if (rate > ADVERTISED_CARD_RATE && volume > 0) {
    const periodExcess = ((rate - ADVERTISED_CARD_RATE) / 100) * volume;
    const annualExcess = annualRunRate(periodExcess, months);
    if (annualExcess >= 50) {
      return {
        amount: Math.round(annualExcess / 10) * 10,
        source: "rate_gap",
        label: `above ${ADVERTISED_CARD_RATE}% advertised card pricing`,
      };
    }
  }

  const yearly = input.yearlyFeesAtThisRate;
  if (typeof yearly === "number" && Number.isFinite(yearly) && yearly >= 100) {
    return {
      amount: Math.round(yearly),
      source: "fee_runrate",
      label: "Stripe fees at this rate",
    };
  }

  return null;
}
