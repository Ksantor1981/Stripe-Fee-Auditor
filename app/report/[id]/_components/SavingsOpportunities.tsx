"use client";

import type { SavingsOpportunity } from "@/lib/fee-analyzer";
import { fmt$ } from "@/lib/format";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

interface Props {
  opportunities: SavingsOpportunity[];
}

const CONFIDENCE_STYLE = {
  high: {
    badge: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-100",
    bg: "bg-emerald-50/40",
    dot: "bg-emerald-500",
  },
  medium: {
    badge: "bg-amber-50 text-amber-700",
    border: "border-amber-100",
    bg: "bg-amber-50/30",
    dot: "bg-amber-400",
  },
  low: {
    badge: "bg-gray-100 text-gray-500",
    border: "border-gray-100",
    bg: "bg-gray-50/40",
    dot: "bg-gray-400",
  },
} as const;

export function SavingsOpportunities({ opportunities }: Props) {
  const { t, tc } = useReportTranslations();

  if (!opportunities || opportunities.length === 0) return null;

  const totalSavings = opportunities.reduce((a, o) => a + o.annualSavings, 0);

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">
            {t("savingsOpportunities.eyebrow")}
          </p>
          <h2 className="text-base font-bold text-gray-900">
            {opportunities.length === 1
              ? t("savingsOpportunities.titleSingular")
              : t("savingsOpportunities.titlePlural", { count: opportunities.length })}
          </h2>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-emerald-700">~{fmt$(totalSavings)}</p>
          <p className="text-xs text-gray-400">{tc("potentialPerYear")}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-5">
        {t("savingsOpportunities.intro")}
      </p>

      <div className="space-y-3">
        {opportunities.map((opp, i) => {
          const confidence = opp.confidence ?? "medium";
          const style = CONFIDENCE_STYLE[confidence as keyof typeof CONFIDENCE_STYLE] ?? CONFIDENCE_STYLE.medium;

          return (
            <div
              key={i}
              className={`rounded-xl border px-4 py-4 ${style.border} ${style.bg}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-500 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{opp.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-700">
                    {t("savingsOpportunities.potentialPerYear", { amount: fmt$(opp.annualSavings) })}
                  </p>
                  {opp.annualSavingsNote && (
                    <p className="text-[11px] text-gray-500 mt-0.5 max-w-[11rem] ml-auto leading-snug">
                      {opp.annualSavingsNote}
                    </p>
                  )}
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${style.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {tc("confidence", { level: confidence })}
                  </span>
                </div>
              </div>

              {opp.periodLoss != null && opp.periodLoss > 0 && (
                <p className="text-xs font-medium text-amber-800 ml-7 mb-2">
                  {t("savingsOpportunities.periodCost", { amount: fmt$(opp.periodLoss) })}
                  {opp.periodLossNote ? ` (${opp.periodLossNote})` : ` (${tc("estimate")})`}
                </p>
              )}

              <p className="text-xs text-gray-600 leading-relaxed ml-7 mb-3">{opp.tip}</p>

              {/ACH/i.test(opp.title) && (
                <p className="text-xs text-amber-800 leading-relaxed ml-7 mb-3 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2">
                  {t("savingsOpportunities.achWarning")}
                </p>
              )}

              {opp.steps && opp.steps.length > 0 && (
                <ol className="ml-7 mb-3 list-decimal list-inside space-y-1 text-xs text-gray-600">
                  {opp.steps.map((step, si) => (
                    <li key={si}>{step}</li>
                  ))}
                </ol>
              )}

              {opp.actionUrl && opp.actionLabel && (
                <a
                  href={opp.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-7 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {opp.actionLabel} →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
