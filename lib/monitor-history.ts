import type { MonitorHistoryPoint } from "@/lib/db";
import type { AnalysisResult } from "@/lib/fee-analyzer";

export interface MonitorComparison {
  current: MonitorHistoryPoint;
  prior: MonitorHistoryPoint | null;
  /** When true, prior was matched by overlapping export period, not just most recent upload. */
  samePeriodMatch: boolean;
  chargeRateDeltaBps: number | null;
  allInRateDeltaBps: number | null;
  feeDelta: number | null;
  volumeDeltaPct: number | null;
}

export const MONITOR_RATE_ALERT_BPS = 25;

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function periodKey(point: MonitorHistoryPoint): string | null {
  if (!point.periodStart) return null;
  const end = point.periodEnd && point.periodEnd !== point.periodStart ? point.periodEnd : point.periodStart;
  return `${point.periodStart}|${end}`;
}

/** Prefer a prior upload covering the same export window; fall back to most recent. */
export function findPriorMonitorPoint(
  current: MonitorHistoryPoint,
  history: MonitorHistoryPoint[]
): { prior: MonitorHistoryPoint | null; samePeriodMatch: boolean } {
  if (history.length === 0) return { prior: null, samePeriodMatch: false };

  const currentKey = periodKey(current);
  if (currentKey) {
    const match = history.find((point) => periodKey(point) === currentKey);
    if (match) return { prior: match, samePeriodMatch: true };
  }

  return { prior: history[0] ?? null, samePeriodMatch: false };
}

export function currentMonitorPoint(result: AnalysisResult): MonitorHistoryPoint {
  const months = result.monthly ?? [];
  return {
    createdAt: "",
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
  const { prior, samePeriodMatch } = findPriorMonitorPoint(current, history);

  if (!prior) {
    return {
      current,
      prior: null,
      samePeriodMatch: false,
      chargeRateDeltaBps: null,
      allInRateDeltaBps: null,
      feeDelta: null,
      volumeDeltaPct: null,
    };
  }

  return {
    current,
    prior,
    samePeriodMatch,
    chargeRateDeltaBps: round((current.chargeRate - prior.chargeRate) * 100, 0),
    allInRateDeltaBps: round((current.allInRate - prior.allInRate) * 100, 0),
    feeDelta: round(current.allInFees - prior.allInFees),
    volumeDeltaPct:
      prior.chargeVolume > 0
        ? round(((current.chargeVolume - prior.chargeVolume) / prior.chargeVolume) * 100, 1)
        : null,
  };
}

export function shouldSendMonitorRateAlert(comparison: MonitorComparison): boolean {
  if (!comparison.prior) return false;
  const chargeDrift = comparison.chargeRateDeltaBps ?? 0;
  const allInDrift = comparison.allInRateDeltaBps ?? 0;
  return (
    Math.abs(chargeDrift) >= MONITOR_RATE_ALERT_BPS ||
    Math.abs(allInDrift) >= MONITOR_RATE_ALERT_BPS
  );
}
