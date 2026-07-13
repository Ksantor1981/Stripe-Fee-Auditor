import type { AnalysisResult } from "./fee-analyzer";

/** Strip paid-only fields before sending report props to the client (free preview tier). */
export function toPreviewResult(result: AnalysisResult): AnalysisResult {
  const teaserSavings = result.savingsOpportunities?.slice(0, 1).map((opp) => ({
    title: opp.title,
    annualSavings: opp.annualSavings,
    confidence: opp.confidence,
    // Free preview shows one value teaser, but keeps advice, row context, and actions gated.
    tip: "",
    steps: undefined,
    actionLabel: undefined,
    actionUrl: undefined,
    periodLoss: undefined,
    periodLossNote: undefined,
    annualSavingsNote: undefined,
  }));
  const teaserAnomalies = result.annotatedAnomalies?.slice(0, 1);

  return {
    ...result,
    topDrivers: result.topDrivers.slice(0, 3),
    anomalies: [],
    annotatedAnomalies: teaserAnomalies ?? [],
    savingsOpportunities: teaserSavings ?? [],
    monthly: result.monthly,
    benchmark: undefined,
    refundSummary: undefined,
    transactionBuckets: undefined,
    geographySummary: undefined,
    feeMix: undefined,
    feeLeakBreakdown: undefined,
  };
}

/** Keys that must never appear in preview client props (paid-only aggregates). */
export const PREVIEW_STRIPPED_KEYS = [
  "benchmark",
  "refundSummary",
  "transactionBuckets",
  "geographySummary",
  "feeMix",
  "feeLeakBreakdown",
] as const satisfies readonly (keyof AnalysisResult)[];
