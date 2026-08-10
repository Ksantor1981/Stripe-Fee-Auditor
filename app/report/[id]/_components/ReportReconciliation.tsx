"use client";

import type { AnalysisResult, FeeLeakBreakdownKind } from "@/lib/fee-analyzer";
import { fmt$ } from "@/lib/format";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

export function ReportReconciliation({ result }: { result: AnalysisResult }) {
  const { t } = useReportTranslations();
  const reconciliation = result.reconciliation;
  if (!reconciliation) return null;

  const evidenceKinds = new Set((result.feeLeakBreakdown ?? []).map((item) => item.kind));
  const accountLabel = result.pricingProfile?.label ?? result.accountCountry ?? "United States";

  const kindLabel = (kind: FeeLeakBreakdownKind): string => {
    if (kind === "direct") return t("reportReconciliation.kindDirect");
    if (kind === "calculated") return t("reportReconciliation.kindCalculated");
    return t("reportReconciliation.kindEstimated");
  };

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {t("reportReconciliation.eyebrow")}
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">{t("reportReconciliation.title")}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            {t("reportReconciliation.subtitle")}
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
            reconciliation.status === "reconciled"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {reconciliation.status === "reconciled"
            ? t("reportReconciliation.statusReconciled")
            : t("reportReconciliation.statusMismatch", { count: reconciliation.mismatchedChargeRows })}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [t("reportReconciliation.sourceRows"), reconciliation.sourceRowCount.toLocaleString("en-US")],
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

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
        <span>{t("reportReconciliation.chargeRowsCount", { count: reconciliation.chargeRowCount.toLocaleString("en-US") })}</span>
        <span>{t("reportReconciliation.nonChargeRowsCount", { count: reconciliation.nonChargeRowCount.toLocaleString("en-US") })}</span>
        <span>{t("reportReconciliation.directNonChargeRows", { count: reconciliation.directNonChargeFeeRows.toLocaleString("en-US") })}</span>
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
    </section>
  );
}
