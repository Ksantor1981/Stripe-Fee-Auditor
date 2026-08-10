"use client";

import type { GeographySummary } from "@/lib/fee-analyzer";
import { fmtPct } from "@/lib/format";
import { useFmtMoney } from "@/lib/report-currency";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

interface Props {
  summary: GeographySummary;
}

export function GeographyBreakdown({ summary }: Props) {
  const fmt$ = useFmtMoney();
  const { t } = useReportTranslations();
  const {
    domRate,
    intlRate,
    pctDiff,
    intlShare,
    intlExcessShare,
    excessIntlFees,
    internationalCount,
    intlVolume,
  } = summary;

  const maxRate = Math.max(domRate, intlRate);
  const domBarWidth = maxRate > 0 ? (domRate / maxRate) * 100 : 0;
  const intlBarWidth = maxRate > 0 ? (intlRate / maxRate) * 100 : 0;

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
        {t("geographyBreakdown.eyebrow")}
      </p>
      <h2 className="text-base font-bold text-gray-900 mb-4">
        {t("geographyBreakdown.title", { pct: Math.round(pctDiff) })}
      </h2>

      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-24 shrink-0">{t("geographyBreakdown.domesticLabel")}</span>
          <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-blue-400"
              style={{ width: `${domBarWidth}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-900 w-12 text-right">
            {fmtPct(domRate)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-24 shrink-0">{t("geographyBreakdown.internationalLabel")}</span>
          <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-red-400"
              style={{ width: `${intlBarWidth}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-red-600 w-12 text-right">
            {fmtPct(intlRate)}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600 leading-relaxed">
        {t("geographyBreakdown.summaryBody", {
          intlRate: fmtPct(intlRate),
          domRate: fmtPct(domRate),
          pctDiff: Math.round(pctDiff),
          intlShare: Math.round(intlShare),
          intlExcessShare: Math.round(Math.max(0, intlExcessShare)),
        })}{" "}
        {intlShare > 20 ? t("geographyBreakdown.tipHighIntlShare") : t("geographyBreakdown.tipDefault")}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: t("geographyBreakdown.intlTransactions"), value: String(internationalCount) },
          { label: t("geographyBreakdown.intlVolume"), value: fmt$(intlVolume) },
          { label: t("geographyBreakdown.excessFeesEst"), value: fmt$(Math.max(0, excessIntlFees)) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-gray-50 px-3 py-2.5">
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
