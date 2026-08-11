"use client";

import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import type { MonthlyBreakdown } from "@/lib/fee-analyzer";
import { fmtMonth } from "@/lib/format";
import { useFmtMoney } from "@/lib/report-currency";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";
import { LockedReportPreview } from "./LockedReportPreview";

export function MonthlyDetailPanel({
  monthly,
  isPaid,
  paywall,
}: {
  monthly: MonthlyBreakdown[];
  isPaid: boolean;
  paywall: ReactNode;
}) {
  const fmt$ = useFmtMoney();
  const locale = useLocale();
  const { tc } = useReportTranslations();

  if (!isPaid) {
    return (
      <div className="space-y-4">
        <LockedReportPreview kind="trends" />
        {paywall}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm sm:overflow-visible">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:px-5 sm:py-3">{tc("month")}</th>
            <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:px-5 sm:py-3">{tc("volume")}</th>
            <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:px-5 sm:py-3">{tc("fees")}</th>
            <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:px-5 sm:py-3">{tc("rate")}</th>
            <th className="hidden px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:table-cell sm:px-5 sm:py-3">{tc("charges")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {monthly.map((row, index) => {
            const previous = monthly[index - 1];
            const delta = previous ? row.fees - previous.fees : null;
            const deltaClass = delta != null && delta > 0 ? "text-red-500" : "text-green-600";
            return (
              <tr key={row.month} className="hover:bg-gray-50/50">
                <td className="px-3 py-2.5 font-medium text-gray-800 sm:px-5 sm:py-3">{fmtMonth(row.month, locale)}</td>
                <td className="px-3 py-2.5 text-right text-gray-600 sm:px-5 sm:py-3">{fmt$(row.volume)}</td>
                <td className="px-3 py-2.5 text-right sm:px-5 sm:py-3">
                  <span className="font-semibold text-gray-900">{fmt$(row.fees)}</span>
                  {delta !== null && (
                    <span className={"ml-1 text-[10px] sm:ml-1.5 sm:text-xs " + deltaClass}>
                      {delta > 0 ? "▲" : "▼"}{fmt$(Math.abs(delta))}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right text-gray-600 sm:px-5 sm:py-3">
                  {row.rate.toFixed(2)}%
                </td>
                <td className="hidden px-3 py-2.5 text-right text-gray-500 sm:table-cell sm:px-5 sm:py-3">{row.count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
