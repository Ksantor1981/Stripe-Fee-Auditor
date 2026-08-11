"use client";

import type { ReactNode } from "react";
import type { AnnotatedRow } from "@/lib/fee-analyzer";
import type { NormalizedRow } from "@/lib/csv-parser";
import { Badge } from "@/components/ui/badge";
import { fmtPct } from "@/lib/format";
import { useFmtMoney } from "@/lib/report-currency";
import { transactionPrimaryLabel, transactionSecondaryLine } from "@/lib/transaction-display";
import { useFeeLabelTranslator, useReportTranslations } from "@/lib/i18n/use-report-translations";
import { ExpectedOutlierToggle } from "./ExpectedOutlierToggle";
import { LockedReportPreview } from "./LockedReportPreview";

interface Props {
  topDrivers: NormalizedRow[];
  anomalyRows: AnnotatedRow[];
  anomalyCount: number;
  isPaid: boolean;
  isSampleReport: boolean;
  explainer: string | null;
  expectedOutlierIds: string[];
  canMarkExpectedOutliers: boolean;
  onToggleExpectedOutlier?: (chargeId: string) => void;
  outlierSaving: boolean;
  paywall: ReactNode;
}

export function MultiMonthTransactionsPanel({
  topDrivers,
  anomalyRows,
  anomalyCount,
  isPaid,
  isSampleReport,
  explainer,
  expectedOutlierIds,
  canMarkExpectedOutliers,
  onToggleExpectedOutlier,
  outlierSaving,
  paywall,
}: Props) {
  const fmt$ = useFmtMoney();
  const { t, tc } = useReportTranslations();
  const translateFeeLabel = useFeeLabelTranslator();

  return (
    <div className="space-y-6">
      <div className="divide-y divide-gray-50 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">{tc("topFeeDrivers")}</h3>
            <p className="mt-0.5 text-xs text-gray-400">{t("multiMonthReport.chargesAboveBaselineSubtitle")}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {isSampleReport ? tc("sampleReportTop3") : isPaid ? tc("fullReportTop3") : tc("freePreviewTop3")}
          </Badge>
        </div>
        {topDrivers.slice(0, 3).map((row, index) => (
          <div key={row.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-4 text-xs font-bold text-gray-300">{index + 1}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">{transactionPrimaryLabel(row)}</p>
                <p className="truncate text-xs text-gray-400">{transactionSecondaryLine(row)}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-gray-900">{fmt$(row.fee)}</p>
              <p className="text-xs text-gray-400">{row.amount > 0 ? fmtPct((row.fee / row.amount) * 100) : "—"} {tc("rate")}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-700">{t("multiMonthReport.chargesAboveBaseline")}</h3>
          {explainer && <p className="mt-1 max-w-3xl text-xs leading-relaxed text-gray-500">{explainer}</p>}
        </div>

        {isPaid ? (
          anomalyRows.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">{t("multiMonthReport.noHighFeeCharges")}</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {canMarkExpectedOutliers && (
                <p className="border-b border-gray-50 bg-gray-50/50 px-5 py-3 text-xs text-gray-500">
                  {t("multiMonthReport.markOneOffHint")}
                </p>
              )}
              {anomalyRows.map((row) => {
                const marked = expectedOutlierIds.includes(row.id);
                const rowClass =
                  "flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 " +
                  (marked ? "bg-emerald-50/40" : "");
                return (
                  <div key={row.id} className={rowClass}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">{transactionPrimaryLabel(row)}</p>
                      <p className="truncate text-xs text-gray-400">{transactionSecondaryLine(row)}</p>
                      {row.explanation && (
                        <div className="mt-3 space-y-1.5 rounded-lg border border-gray-100 bg-[#f0f1ee]/90 px-3 py-2.5">
                          <Badge variant="outline" className="border-gray-200 text-[10px] font-medium text-gray-700">
                            {translateFeeLabel(row.explanation.label)}
                          </Badge>
                          <p className="text-xs leading-relaxed text-gray-600">{row.explanation.detail}</p>
                          <p className="text-xs leading-relaxed text-emerald-800">
                            <span className="font-medium">{tc("tip")}:</span> {row.explanation.savingsTip}
                          </p>
                        </div>
                      )}
                      {canMarkExpectedOutliers && onToggleExpectedOutlier && (
                        <div className="mt-3">
                          <ExpectedOutlierToggle
                            chargeId={row.id}
                            marked={marked}
                            disabled={outlierSaving}
                            onToggle={onToggleExpectedOutlier}
                          />
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <p className={"text-sm font-semibold " + (marked ? "text-emerald-700" : "text-red-600")}>
                        {fmt$(row.fee)}
                      </p>
                      <Badge className={"mt-1 text-xs " + (marked ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                        {row.amount > 0 ? fmtPct((row.fee / row.amount) * 100) : "—"} {tc("rate")}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="space-y-4 p-5">
            <p className="text-center text-sm font-semibold text-gray-700">
              {anomalyCount === 1
                ? t("multiMonthReport.highFeeFound", { count: anomalyCount })
                : t("multiMonthReport.highFeeFoundPlural", { count: anomalyCount })}
            </p>
            <LockedReportPreview kind="transactions" />
            {paywall}
          </div>
        )}
      </div>
    </div>
  );
}
