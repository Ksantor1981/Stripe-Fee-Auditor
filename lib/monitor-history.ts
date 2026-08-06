import type { MonitorHistoryPoint } from "@/lib/db";
import type { AnalysisResult } from "@/lib/fee-analyzer";

export interface MonitorComparison {
  current: MonitorHistoryPoint;
  prior: MonitorHistoryPoint | null;
  chargeRateDeltaBps: number | null;
  allInRateDeltaBps: number | null;
  feeDelta: number | null;
  volumeDeltaPct: number | null;
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function currentMonitorPoint(result: AnalysisResult): MonitorHistoryPoint {
  const months = result.monthly ?? [];
  return {
    createdAt: new Date().toISOString(),
    periodStart: months[0]?.month ?? null,
    periodEnd: months.at(-1)?.month ?? null,
    chargeVolume: result.chargeVolume,
    chargeFees: result.chargeFees,
    otherFees: result.otherFees,
    allInFees: result.allInFees,
    chargeRate: result.chargeRate,
    allInRate: result.allInRate,
    feeGrade: result.feeGrade?.letter ?? null,
  };
}

export function compareMonitorHistory(
  result: AnalysisResult,
  history: MonitorHistoryPoint[]
): MonitorComparison {
  const current = currentMonitorPoint(result);
  const prior = history[0] ?? null;

  if (!prior) {
    return {
      current,
      prior: null,
      chargeRateDeltaBps: null,
      allInRateDeltaBps: null,
      feeDelta: null,
      volumeDeltaPct: null,
    };
  }

  return {
    current,
    prior,
    chargeRateDeltaBps: round((current.chargeRate - prior.chargeRate) * 100, 0),
    allInRateDeltaBps: round((current.allInRate - prior.allInRate) * 100, 0),
    feeDelta: round(current.allInFees - prior.allInFees),
    volumeDeltaPct:
      prior.chargeVolume > 0
        ? round(((current.chargeVolume - prior.chargeVolume) / prior.chargeVolume) * 100, 1)
        : null,
  };
}
