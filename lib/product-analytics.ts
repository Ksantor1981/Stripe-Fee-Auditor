import type { AnalysisResult } from "./fee-analyzer";

export type PaymentVolumeSegment =
  | "under_10k"
  | "10k_50k"
  | "50k_250k"
  | "250k_1m"
  | "1m_plus";

export function monthlyPaymentVolume(result: AnalysisResult): number {
  return result.chargeVolume / Math.max(1, result.monthly.length);
}

export function paymentVolumeSegment(result: AnalysisResult): PaymentVolumeSegment {
  const volume = monthlyPaymentVolume(result);
  if (volume < 10_000) return "under_10k";
  if (volume < 50_000) return "10k_50k";
  if (volume < 250_000) return "50k_250k";
  if (volume < 1_000_000) return "250k_1m";
  return "1m_plus";
}

/** Internal demand metric; the label is intentionally not exposed in the UI. */
export function hasMaterialFinding(result: AnalysisResult): boolean {
  const expectedRate = result.benchmark?.expectedRate;
  const highRate = expectedRate != null && result.chargeRate >= expectedRate + 0.5;
  const meaningfulOtherFees = result.otherFees >= Math.max(25, result.allInFees * 0.1);
  const meaningfulInternational =
    (result.geographySummary?.excessIntlFees ?? 0) >= Math.max(25, result.allInFees * 0.1);
  const meaningfulRefunds = (result.refundSummary?.estimatedRetainedFees ?? 0) >= 25;
  const anomalyFound = (result.anomalyCount ?? result.anomalies.length) > 0;

  return highRate || meaningfulOtherFees || meaningfulInternational || meaningfulRefunds || anomalyFound;
}
