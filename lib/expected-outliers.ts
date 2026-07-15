import type { AnalysisResult, ChargeLedgerEntry } from "./fee-analyzer";
import type { NormalizedRow } from "./csv-parser";
import { analyze } from "./fee-analyzer";
import { computeFeeGrade } from "./fee-grade";

function ledgerToCharges(entries: ChargeLedgerEntry[]): NormalizedRow[] {
  return entries.map((entry) => ({
    id: entry.id,
    type: "charge",
    amount: entry.amount,
    fee: entry.fee,
    net: entry.amount - entry.fee,
    currency: "USD",
    date: `${entry.month}-01`,
    month: entry.month,
  }));
}

function sumLedger(entries: ChargeLedgerEntry[], key: "amount" | "fee"): number {
  return entries.reduce((acc, row) => acc + row[key], 0);
}

/**
 * Recompute headline rates when the user marks high-fee charges as expected one-offs
 * (Product Hunt feedback — Oktay, Jul 2026).
 */
export function applyExpectedOutlierExclusions(
  result: AnalysisResult,
  excludedIds: string[]
): AnalysisResult {
  const uniqueExcluded = [...new Set(excludedIds.filter(Boolean))];
  if (uniqueExcluded.length === 0) {
    const { expectedOutlierIds: _removed, ...rest } = result;
    void _removed;
    return rest;
  }

  const ledger = result.chargeLedger;
  if (!ledger?.length) {
    return { ...result, expectedOutlierIds: uniqueExcluded };
  }

  const excludedSet = new Set(uniqueExcluded);
  const excludedEntries = ledger.filter((row) => excludedSet.has(row.id));
  if (excludedEntries.length === 0) {
    return { ...result, expectedOutlierIds: uniqueExcluded };
  }

  const excludedVolume = sumLedger(excludedEntries, "amount");
  const excludedFees = sumLedger(excludedEntries, "fee");

  const chargeVolume = Math.max(0, result.chargeVolume - excludedVolume);
  const chargeFees = Math.max(0, result.chargeFees - excludedFees);
  const chargeRate = chargeVolume > 0 ? (chargeFees / chargeVolume) * 100 : 0;
  const allInFees = chargeFees + result.otherFees;
  const allInRate = chargeVolume > 0 ? (allInFees / chargeVolume) * 100 : 0;

  const remainingEntries = ledger.filter((row) => !excludedSet.has(row.id));
  const chargeCount =
    result.chargeCount ??
    result.monthly.reduce((acc, month) => acc + month.count, 0);

  let monthly = result.monthly;
  let anomalies = result.anomalies.filter((row) => !excludedSet.has(row.id));
  let anomalyCount = anomalies.length;
  let annotatedAnomalies = result.annotatedAnomalies?.filter((row) => !excludedSet.has(row.id));
  let benchmark = result.benchmark;
  let feeGrade = result.feeGrade;
  let savingsOpportunities = result.savingsOpportunities;
  let feeLeakBreakdown = result.feeLeakBreakdown;
  let geographySummary = result.geographySummary;
  let transactionBuckets = result.transactionBuckets;

  const canFullReanalyze =
    result.chargeLedgerComplete === true && remainingEntries.length > 0;

  if (canFullReanalyze) {
    const partial = analyze(ledgerToCharges(remainingEntries));
    monthly = partial.monthly;
    anomalies = partial.anomalies;
    anomalyCount = partial.anomalyCount ?? partial.anomalies.length;
    annotatedAnomalies = partial.annotatedAnomalies;
    benchmark = partial.benchmark;
    savingsOpportunities = partial.savingsOpportunities;
    feeLeakBreakdown = partial.feeLeakBreakdown;
    geographySummary = partial.geographySummary;
    transactionBuckets = partial.transactionBuckets;
    feeGrade = computeFeeGrade({
      mode: partial.mode,
      chargeVolume,
      chargeFees,
      chargeRate,
      otherFees: result.otherFees,
      allInFees,
      allInRate,
      anomalyCount,
      anomalies,
      benchmark: partial.benchmark,
      geographySummary: partial.geographySummary,
      refundSummary: result.refundSummary,
      feeLeakBreakdown: partial.feeLeakBreakdown,
      savingsOpportunities: partial.savingsOpportunities,
      chargeCount: remainingEntries.length,
    });
  } else if (remainingEntries.length > 0) {
    const monthTotals = new Map<string, { volume: number; fees: number; count: number }>();
    for (const entry of remainingEntries) {
      const bucket = monthTotals.get(entry.month) ?? { volume: 0, fees: 0, count: 0 };
      bucket.volume += entry.amount;
      bucket.fees += entry.fee;
      bucket.count += 1;
      monthTotals.set(entry.month, bucket);
    }
    monthly = result.monthly.map((month) => {
      const adjusted = monthTotals.get(month.month);
      if (!adjusted) {
        return { ...month, volume: 0, fees: 0, rate: 0, count: 0 };
      }
      return {
        ...month,
        volume: adjusted.volume,
        fees: adjusted.fees,
        rate: adjusted.volume > 0 ? (adjusted.fees / adjusted.volume) * 100 : 0,
        count: adjusted.count,
      };
    });

    feeGrade = computeFeeGrade({
      mode: result.mode,
      chargeVolume,
      chargeFees,
      chargeRate,
      otherFees: result.otherFees,
      allInFees,
      allInRate,
      anomalyCount,
      anomalies,
      benchmark: result.benchmark,
      geographySummary: result.geographySummary,
      refundSummary: result.refundSummary,
      feeLeakBreakdown: result.feeLeakBreakdown,
      savingsOpportunities: result.savingsOpportunities,
      chargeCount: Math.max(0, chargeCount - excludedEntries.length),
    });
  }

  return {
    ...result,
    expectedOutlierIds: uniqueExcluded,
    chargeVolume,
    chargeFees,
    chargeRate,
    allInFees,
    allInRate,
    monthly,
    anomalies,
    anomalyCount,
    annotatedAnomalies,
    benchmark,
    savingsOpportunities,
    feeLeakBreakdown,
    geographySummary,
    transactionBuckets,
    feeGrade,
  };
}
