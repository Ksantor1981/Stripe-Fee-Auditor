"use client";

import { fmtPct } from "@/lib/format";
import type { AnalysisResult } from "@/lib/fee-analyzer";

type Props = {
  original: AnalysisResult;
  adjusted: AnalysisResult;
  count: number;
};

/**
 * Always-visible PH ask: normal (all charges) vs outlier-adjusted run rate.
 * Dollar totals elsewhere stay original; this only reframes rates.
 */
export function OutlierRateComparison({ original, adjusted, count }: Props) {
  const hasAdjustments = count > 0;
  const originalAllIn = original.allInRate ?? 0;
  const adjustedAllIn = adjusted.allInRate ?? 0;
  const partialLedger = original.chargeLedgerComplete === false;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-4 text-sm text-slate-900">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        Normal rate vs outlier-adjusted
      </p>
      <p className="mt-1 font-semibold text-slate-950">
        {hasAdjustments
          ? `Excluding ${count} expected one-off charge${count === 1 ? "" : "s"}`
          : "Is the spike a recurring leak — or a one-off?"}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
          <p className="text-xs font-medium text-slate-500">Normal (all charges)</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{fmtPct(original.chargeRate)}</p>
          <p className="text-xs text-slate-500">processing · all-in {fmtPct(originalAllIn)}</p>
        </div>
        <div
          className={`rounded-lg border px-3 py-3 ${
            hasAdjustments
              ? "border-emerald-200 bg-emerald-50/80"
              : "border-dashed border-slate-300 bg-white/60"
          }`}
        >
          <p className="text-xs font-medium text-slate-500">Outlier-adjusted</p>
          {hasAdjustments ? (
            <>
              <p className="mt-1 text-lg font-bold text-emerald-950">{fmtPct(adjusted.chargeRate)}</p>
              <p className="text-xs text-emerald-900/80">processing · all-in {fmtPct(adjustedAllIn)}</p>
            </>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Mark high-fee charges as expected one-offs below. Adjusted rate shows your typical mix
              without those rows skewing the average.
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-600">
        Dollar totals still include everything Stripe charged. Use this to separate{" "}
        <strong>recurring leaks</strong> (intl cards, refunds, small tickets) from{" "}
        <strong>one-off spikes</strong>.
        {partialLedger &&
          " Large exports adjust marked rows only — re-upload a shorter CSV for full-period recalc."}
      </p>
    </div>
  );
}
