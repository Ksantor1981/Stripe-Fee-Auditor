"use client";

import type { SavingsOpportunity } from "@/lib/fee-analyzer";
import { fmt$ } from "@/lib/format";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

interface Props {
  opportunity?: SavingsOpportunity;
}

export function FirstActionCallout({ opportunity }: Props) {
  const { t, tc } = useReportTranslations();

  if (!opportunity) return null;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
            {t("firstActionCallout.eyebrow")}
          </p>
          <h2 className="mt-1 text-base font-bold text-gray-950">
            {opportunity.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            {opportunity.tip}
          </p>
        </div>

        {opportunity.annualSavings > 0 && (
          <div className="rounded-xl bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-lg font-bold text-emerald-700">
              {t("firstActionCallout.upToPerYear", { amount: fmt$(opportunity.annualSavings) })}
            </p>
            <p className="text-xs text-gray-400">
              {opportunity.annualSavingsNote ?? tc("directionalEstimate")}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {opportunity.periodLoss != null && opportunity.periodLoss > 0 && (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-800">
            {t("firstActionCallout.periodCost", { amount: fmt$(opportunity.periodLoss) })}
            {opportunity.periodLossNote ? ` (${opportunity.periodLossNote})` : ""}
          </span>
        )}
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500">
          {t("firstActionCallout.notGuaranteed")}
        </span>
        {opportunity.actionUrl && opportunity.actionLabel && (
          <a
            href={opportunity.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            {opportunity.actionLabel} →
          </a>
        )}
      </div>
    </div>
  );
}
