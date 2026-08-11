"use client";

import { useLocale } from "next-intl";
import type { AnalysisResult, FeeLeakBreakdownKind } from "@/lib/fee-analyzer";
import { useFmtMoney } from "@/lib/report-currency";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

export function ReportReconciliation({ result }: { result: AnalysisResult }) {
  const fmt$ = useFmtMoney();
  const locale = useLocale();
  const { t } = useReportTranslations();
  const reconciliation = result.reconciliation;
  if (!reconciliation) return null;

  const evidenceKinds = new Set((result.feeLeakBreakdown ?? []).map((item) => item.kind));
  const countryCode = result.accountCountry?.toUpperCase();
  let accountLabel = result.pricingProfile?.label ?? result.accountCountry ?? "United States";
  if (countryCode?.length === 2) {
    try {
      accountLabel = new Intl.DisplayNames([locale], { type: "region" }).of(countryCode) ?? accountLabel;
    } catch {
      // Keep the pricing profile label when Intl.DisplayNames is unavailable.
    }
  }

  const kindLabel = (kind: FeeLeakBreakdownKind): string => {
    if (kind === "direct") return t("reportReconciliation.kindDirect");
    if (kind === "calculated") return t("reportReconciliation.kindCalculated");
    return t("reportReconciliation.kindEstimated");
  };

  const statusLabel =
    reconciliation.status === "reconciled"
      ? t("reportReconciliation.statusReconciled")
      : t("reportReconciliation.statusMismatch", { count: reconciliation.mismatchedChargeRows });
  const statusClassName =
    "shrink-0 rounded-full px-3 py-1 text-xs font-semibold " +
    (reconciliation.status === "reconciled"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-amber-50 text-amber-700");

  return (
    <details className="group mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm">
        <span>
          <span className="font-semibold text-slate-900">{t("reportReconciliation.title")}</span>
          <span className="ml-2 text-xs text-slate-500">{t("reportReconciliation.subtitle")}</span>
        </span>
        <span className={statusClassName}>
          {statusLabel} <span aria-hidden>⌄</span>
        </span>
      </summary>

      <div className="border-t border-slate-100 px-4 pb-4 pt-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [t("reportReconciliation.sourceRows"), reconciliation.sourceRowCount.toLocaleString(locale)],
            [t("reportReconciliation.chargeVolume"), fmt$(reconciliation.chargeVolume)],
            [t("reportReconciliation.directChargeFees"), fmt$(reconciliation.chargeFees)],
            [t("reportReconciliation.otherDirectFees"), fmt$(reconciliation.otherFees)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-base font-bold text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
          <span>{t("reportReconciliation.chargeRowsCount", { count: reconciliation.chargeRowCount.toLocaleString(locale) })}</span>
          <span>{t("reportReconciliation.nonChargeRowsCount", { count: reconciliation.nonChargeRowCount.toLocaleString(locale) })}</span>
          <span>{t("reportReconciliation.directNonChargeRows", { count: reconciliation.directNonChargeFeeRows.toLocaleString(locale) })}</span>
          <span>{t("reportReconciliation.accountBenchmark", { label: accountLabel })}</span>
        </div>

        {evidenceKinds.size > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[...evidenceKinds].map((kind) => (
              <span key={kind} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                {kindLabel(kind)}
              </span>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}
