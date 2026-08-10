"use client";

import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmt$ } from "@/lib/format";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

interface Props {
  result: Pick<AnalysisResult, "chargeVolume" | "chargeFees" | "monthly">;
}

export function ReportTrustChecklist({ result }: Props) {
  const { t } = useReportTranslations();
  const chargeCount = result.monthly.reduce((total, month) => total + month.count, 0);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {t("reportTrustChecklist.eyebrow")}
          </p>
          <h2 className="mt-1 text-base font-bold text-gray-900">
            {t("reportTrustChecklist.title")}
          </h2>
        </div>
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {t("reportTrustChecklist.badge")}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {t("reportTrustChecklist.body")}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: t("reportTrustChecklist.chargeVolume"), value: fmt$(result.chargeVolume) },
          { label: t("reportTrustChecklist.chargeFees"), value: fmt$(result.chargeFees) },
          { label: t("reportTrustChecklist.chargeRows"), value: chargeCount.toLocaleString("en-US") },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="mt-0.5 text-lg font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
