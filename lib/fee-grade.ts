import type { AnalysisResult } from "./fee-analyzer";

export type FeeGradeLetter = "A" | "B" | "C" | "D" | "F";

export interface FeeGrade {
  letter: FeeGradeLetter;
  /** Internal 0–100 score used for sorting and share cards. */
  score: number;
  summary: string;
  topIssue: string | null;
}

export type FeeGradeInput = Pick<
  AnalysisResult,
  | "mode"
  | "chargeVolume"
  | "chargeRate"
  | "allInRate"
  | "allInFees"
  | "chargeFees"
  | "otherFees"
  | "anomalyCount"
  | "anomalies"
  | "benchmark"
  | "geographySummary"
  | "refundSummary"
  | "feeLeakBreakdown"
  | "savingsOpportunities"
> & {
  chargeCount: number;
};

function letterFromScore(score: number): FeeGradeLetter {
  if (score >= 86) return "A";
  if (score >= 74) return "B";
  if (score >= 62) return "C";
  if (score >= 48) return "D";
  return "F";
}

function summaryForLetter(letter: FeeGradeLetter, lowVolume: boolean): string {
  if (lowVolume) {
    if (letter === "A" || letter === "B") {
      return "Directional grade from a small sample — upload more months to confirm.";
    }
    return "Early signal only: fee drivers look elevated for this small export.";
  }

  switch (letter) {
    case "A":
      return "Stripe fee setup looks efficient for your transaction mix.";
    case "B":
      return "Mostly healthy, with a few fee drivers worth watching.";
    case "C":
      return "Noticeable fee leakage — review international cards and add-on fee lines.";
    case "D":
      return "Material fee leakage — several drivers are pushing your all-in cost up.";
    default:
      return "High fee leakage — your all-in Stripe cost is well above a typical mix.";
  }
}

/** Letter grade (A–F) from analysis metrics — inspired by severity-ranked audit findings. */
export function computeFeeGrade(input: FeeGradeInput): FeeGrade | undefined {
  if (input.chargeVolume <= 0 || input.chargeCount <= 0) return undefined;

  let score = 92;
  const issues: string[] = [];

  const allInRate = input.allInRate;
  const expected = input.benchmark?.expectedRate ?? 3.2;
  const rateDelta = allInRate - expected;

  if (rateDelta > 1.5) {
    score -= 28;
    issues.push("all-in rate is far above the expected mix");
  } else if (rateDelta > 0.75) {
    score -= 18;
    issues.push("all-in rate is materially above the expected mix");
  } else if (rateDelta > 0.35) {
    score -= 10;
    issues.push("all-in rate is slightly above the expected mix");
  }

  if (input.benchmark?.status === "high") {
    score -= 8;
    if (input.benchmark.drivers[0]) issues.push(input.benchmark.drivers[0]);
  } else if (input.benchmark?.status === "watch") {
    score -= 4;
  }

  const otherShare =
    input.allInFees > 0 ? input.otherFees / input.allInFees : 0;
  if (otherShare > 0.2) {
    score -= 14;
    issues.push("non-charge Stripe fee lines are a large share of total fees");
  } else if (otherShare > 0.12) {
    score -= 7;
    issues.push("add-on or non-charge fee lines are adding to all-in cost");
  }

  const intlShare = (input.geographySummary?.intlShare ?? 0) / 100;
  if (intlShare > 0.4) {
    score -= 10;
    issues.push("international cards are a large share of volume");
  } else if (intlShare > 0.22) {
    score -= 5;
  }

  const refundRate = input.refundSummary?.refundRate ?? 0;
  if (refundRate > 8) {
    score -= 10;
    issues.push("refund volume is increasing retained processing fees");
  } else if (refundRate > 4) {
    score -= 5;
  }

  const anomalyCount = input.anomalyCount ?? input.anomalies.length;
  const anomalyRatio = anomalyCount / Math.max(1, input.chargeCount);
  if (anomalyRatio > 0.2) {
    score -= 10;
    issues.push("many high-fee charges vs your baseline");
  } else if (anomalyRatio > 0.1) {
    score -= 5;
  }

  const highLeakItems =
    input.feeLeakBreakdown?.filter((item) => item.severity === "high").length ?? 0;
  if (highLeakItems >= 2) {
    score -= 8;
    issues.push("multiple high-severity fee leak drivers");
  }

  const topSaving = input.savingsOpportunities?.[0];
  if (topSaving && topSaving.annualSavings >= 1500) {
    score -= 4;
    if (!issues.length) issues.push(topSaving.title);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const lowVolume = input.mode === "low-volume";
  if (lowVolume && score >= 86) score = 85;

  let letter = letterFromScore(score);
  if (lowVolume && (letter === "A" || letter === "B") && rateDelta > 0.5) {
    letter = "C";
  }

  const topIssue =
    input.feeLeakBreakdown?.find((item) => item.severity === "high")?.label ??
    input.benchmark?.drivers[0] ??
    topSaving?.title ??
    issues[0] ??
    null;

  return {
    letter,
    score,
    summary: summaryForLetter(letter, lowVolume),
    topIssue,
  };
}

export function feeGradeShareTitle(grade: FeeGrade, allInRate: number): string {
  return `Stripe Fee Grade ${grade.letter} — ${allInRate.toFixed(2)}% all-in cost`;
}
