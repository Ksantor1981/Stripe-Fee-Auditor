// Fee analysis algorithm — full implementation on Day 3
import type { NormalizedRow } from "./csv-parser";

export type AnalysisMode = "multi-month" | "single-month" | "low-volume";

export interface MonthlyBreakdown {
  month: string;
  volume: number;
  fees: number;
  rate: number;
  count: number;
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

  // Period delta
  let periodDelta: number | null = null;
  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    periodDelta = last.fees - prev.fees;
  }

  return { mode, chargeVolume, chargeFees, chargeRate, otherFees, monthly, topDrivers, anomalies, periodDelta };
}
