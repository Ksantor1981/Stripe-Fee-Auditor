"use client";

import { fmtPct } from "@/lib/format";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

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
  const { t } = useReportTranslations();
  const hasAdjustments = count > 0;
  const originalAllIn = original.allInRate ?? 0;
  const adjustedAllIn = adjusted.allInRate ?? 0;
  const partialLedger = original.chargeLedgerComplete === false;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-4 text-sm text-slate-900">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        {t("outlierRateComparison.eyebrow")}
      </p>
      <p className="mt-1 font-semibold text-slate-950">
        {hasAdjustments
          ? count === 1
            ? t("outlierRateComparison.excludingCount", { count })
            : t("outlierRateComparison.excludingCountPlural", { count })
          : t("outlierRateComparison.spikeQuestion")}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
          <p className="text-xs font-medium text-slate-500">{t("outlierRateComparison.normalLabel")}</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{fmtPct(original.chargeRate)}</p>
          <p className="text-xs text-slate-500">
            {t("outlierRateComparison.normalDetail", { rate: fmtPct(originalAllIn) })}
          </p>
        </div>
        <div
          className={`rounded-lg border px-3 py-3 ${
            hasAdjustments
              ? "border-emerald-200 bg-emerald-50/80"
              : "border-dashed border-slate-300 bg-white/60"
          }`}
        >
          <p className="text-xs font-medium text-slate-500">{t("outlierRateComparison.adjustedLabel")}</p>
          {hasAdjustments ? (
            <>
              <p className="mt-1 text-lg font-bold text-emerald-950">{fmtPct(adjusted.chargeRate)}</p>
              <p className="text-xs text-emerald-900/80">
                {t("outlierRateComparison.normalDetail", { rate: fmtPct(adjustedAllIn) })}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {t("outlierRateComparison.adjustedHint")}
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-600">
        {t("outlierRateComparison.footnote")}
        {partialLedger && t("outlierRateComparison.partialLedgerNote")}
      </p>
    </div>
  );
}
