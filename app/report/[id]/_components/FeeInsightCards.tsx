"use client";

import type { FeeBenchmark, RefundSummary } from "@/lib/fee-analyzer";
import { fmtPct } from "@/lib/format";
import { useFmtMoney } from "@/lib/report-currency";
import { useFeeLabelTranslator, useReportTranslations } from "@/lib/i18n/use-report-translations";

interface Props {
  benchmark?: FeeBenchmark;
  refundSummary?: RefundSummary;
  chargeRate?: number;
}

const TONE = {
  normal: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  watch: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
  },
  high: {
    badge: "bg-red-50 text-red-700 border-red-100",
    dot: "bg-red-500",
  },
} as const;

export function FeeInsightCards({ benchmark, refundSummary, chargeRate }: Props) {
  const fmt$ = useFmtMoney();
  const { t, tc } = useReportTranslations();
  const translateFeeLabel = useFeeLabelTranslator();
  const hasRefunds = Boolean(refundSummary && refundSummary.count > 0 && refundSummary.volume > 0);
  if (!benchmark && !refundSummary) return null;

  const tone = benchmark ? TONE[benchmark.status] : TONE.normal;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {benchmark && (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                {t("feeInsightCards.isThisNormal")}
              </p>
              <h2 className="text-lg font-bold text-gray-900">{translateFeeLabel(benchmark.label)}</h2>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
              <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
              {tc(benchmark.status)}
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            {t(`feeInsightCards.benchmarkSummary${benchmark.status === "normal" ? "Normal" : benchmark.status === "watch" ? "Watch" : "High"}`, {
              rate: fmtPct(chargeRate ?? 0),
            })}
          </p>
          <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-400">{t("feeInsightCards.expectedRange")}</p>
            <p className="mt-0.5 text-xl font-bold text-gray-900">
              {fmtPct(benchmark.rangeLow)}–{fmtPct(benchmark.rangeHigh)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {t("feeInsightCards.expectedRangeNote")}
            </p>
          </div>
          {benchmark.drivers.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {benchmark.drivers.slice(0, 4).map((driver) => (
                <span key={translateFeeLabel(driver)} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {translateFeeLabel(driver)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          {t("feeInsightCards.refundLeakage")}
        </p>
        {hasRefunds && refundSummary ? (
          <>
            <h2 className="text-lg font-bold text-gray-900">
              {t("feeInsightCards.retainedImpact", { amount: fmt$(refundSummary.estimatedRetainedFees) })}
            </h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {refundSummary.count === 1
                ? t("feeInsightCards.refundBody", {
                    count: refundSummary.count,
                    volume: fmt$(refundSummary.volume),
                  })
                : t("feeInsightCards.refundBodyPlural", {
                    count: refundSummary.count,
                    volume: fmt$(refundSummary.volume),
                  })}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-400">{t("feeInsightCards.refundRate")}</p>
                <p className="text-lg font-bold text-gray-900">{fmtPct(refundSummary.refundRate)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-400">{t("feeInsightCards.atThisPace")}</p>
                <p className="text-lg font-bold text-gray-900">~{fmt$(refundSummary.estimatedAnnualCost)}{tc("yearSuffix")}</p>
              </div>
            </div>
            {refundSummary.directFees > 0 && (
              <p className="mt-3 text-xs text-gray-500">
                {t("feeInsightCards.directRefundFees", { amount: fmt$(refundSummary.directFees) })}
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900">{t("feeInsightCards.noRefundLeakage")}</h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {t("feeInsightCards.noRefundBody")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
