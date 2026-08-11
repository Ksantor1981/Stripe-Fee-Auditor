"use client";

import { useLocale } from "next-intl";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmtPct, fmtDate } from "@/lib/format";
import { useFmtMoney } from "@/lib/report-currency";
import { transactionPrimaryLabel } from "@/lib/transaction-display";
import { annualRunRate, periodTotalFees } from "@/lib/fee-period-copy";
import { Badge } from "@/components/ui/badge";
import { FeeInsightCards } from "./FeeInsightCards";
import { ReportDashboardCharts } from "./ReportDashboardCharts";
import { ReportTrustChecklist } from "./ReportTrustChecklist";
import { SavingsOpportunities } from "./SavingsOpportunities";
import { FeeLeakBreakdown } from "./FeeLeakBreakdown";
import { FirstActionCallout } from "./FirstActionCallout";
import { ReportMainFinding } from "./ReportMainFinding";
import { ReportWorkspace, ReportWorkspacePanel } from "./ReportWorkspaceNav";
import { ReportReconciliation } from "./ReportReconciliation";
import { LockedReportPreview } from "./LockedReportPreview";
import { MoneyFirstImpact } from "./MoneyFirstImpact";
import { PaywallBanner } from "./PaywallBanner";
import { FeeGradeBadge } from "@/components/FeeGradeBadge";
import { resolvePaywallImpact } from "@/lib/paywall-impact";
import { selectFreeDiagnosis } from "@/lib/free-diagnosis";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

interface Props {
  reportId: string;
  result: AnalysisResult;
  isPaid: boolean;
  isSampleReport?: boolean;
}

export function LowVolumeReport({
  reportId,
  result,
  isPaid,
  isSampleReport = false,
}: Props) {
  const fmt$ = useFmtMoney();
  const locale = useLocale();
  const { t, tc } = useReportTranslations();
  const { chargeFees, chargeRate, chargeVolume, otherFees, topDrivers, monthly, savingsOpportunities } =
    result;
  const savings = savingsOpportunities ?? [];
  const freeDiagnosis = selectFreeDiagnosis(result);
  const totalCharges = monthly.reduce((a, m) => a + m.count, 0);
  const monthCount = monthly.length;
  const periodTail =
    monthCount <= 1
      ? tc("periodThisMonth")
      : monthCount === 3
        ? tc("periodThisQuarter")
        : monthCount === 12
          ? tc("periodThisYear")
          : tc("periodLastMonths", { count: monthCount });
  const periodFees = result.allInFees ?? periodTotalFees(chargeFees, otherFees);
  const allInRate = result.allInRate ?? (chargeVolume > 0 ? (periodFees / chargeVolume) * 100 : 0);
  const yearlyAtThisRate = annualRunRate(periodFees, monthCount);
  const paywallImpact = resolvePaywallImpact({
    savingsAnnual: savings[0]?.annualSavings,
    savingsTitle: savings[0]?.title,
    chargeRate,
    chargeVolume,
    monthCount,
    yearlyFeesAtThisRate: yearlyAtThisRate,
    baselineRate: result.benchmark?.expectedRate,
  });
  const benchmarkRate = result.benchmark?.expectedRate ?? (result.pricingProfile?.domesticPercent ?? 0.029) * 100;
  const rateGap = chargeRate - benchmarkRate;
  const rateGapText = tc("rateGapVsBenchmark", {
    gap: `${rateGap >= 0 ? "+" : ""}${rateGap.toFixed(2)}${tc("percentagePointsShort")}`,
    benchmark: benchmarkRate.toFixed(2),
  });
  const diagnosis =
    rateGap > 0.25
      ? t("lowVolumeReport.diagnosisAboveBenchmark")
      : t("lowVolumeReport.diagnosisTooSmall");

  return (
    <ReportWorkspace transactionCount={result.anomalyCount ?? result.anomalies?.length ?? 0}>
      <ReportWorkspacePanel value="overview">
      {/* Hero */}
      <div id="report-share-snapshot" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {result.feeGrade && (
          <div className="mb-4">
            <FeeGradeBadge grade={result.feeGrade} size="sm" showSummary />
          </div>
        )}
        <div className="flex items-start gap-3 mb-4">
          <Badge variant="outline" className="text-xs text-gray-500">{t("lowVolumeReport.badge")}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isSampleReport ? t("lowVolumeReport.titleSample") : t("lowVolumeReport.titleYour")}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {t("lowVolumeReport.chargesAnalyzed", { count: totalCharges })}
        </p>
        <p className="mt-3 text-sm text-gray-700 leading-snug">
          {isSampleReport ? tc("thisSampleShows") : tc("youPaid")}{" "}
          <span className="font-semibold text-gray-900">{fmt$(periodFees)}</span> {tc("inStripeFees")}{" "}
          {periodTail}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          {tc("thats")}{" "}
          <span className="font-semibold text-gray-900">{fmt$(yearlyAtThisRate)}</span>
          {tc("yearSuffix")} {tc("atThisRate")}.
        </p>
        <ReportMainFinding diagnosis={freeDiagnosis} fallback={diagnosis} />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: tc("processingRate"), value: fmtPct(chargeRate), accent: true },
            { label: tc("allInCostRate"), value: fmtPct(allInRate) },
            { label: tc("chargeVolume"), value: fmt$(chargeVolume) },
            { label: tc("allInFees"), value: fmt$(periodFees) },
          ].map(({ label, value, accent }) => (
            <div key={label} className={`rounded-xl px-4 py-3 ${accent ? "border border-blue-100 bg-blue-50" : "border border-gray-200 bg-[#f0f1ee]"}`}>
              <p className={`text-xs mb-0.5 ${accent ? "text-blue-500 font-semibold" : "text-gray-400"}`}>{label}</p>
              <p className={`text-xl font-bold ${accent ? "text-blue-700" : "text-gray-900"}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
            {tc("yourRateVsAdvertised")}
          </p>
          <p className="text-sm text-blue-900">
            {t("lowVolumeReport.rateComparisonBody", {
              chargeRate: fmtPct(chargeRate),
              rateGap: rateGapText,
              allInRate: fmtPct(allInRate),
            })}
          </p>
        </div>
      </div>

      {!isPaid && (
        <MoneyFirstImpact
          reportId={reportId}
          savings={savings[0]}
          yearlyFeesAtThisRate={yearlyAtThisRate}
          chargeRate={chargeRate}
          chargeVolume={chargeVolume}
          monthCount={monthCount}
          diagnosis={freeDiagnosis}
        />
      )}

      {isPaid && <FirstActionCallout opportunity={savings[0]} />}

      <ReportTrustChecklist result={result} />
      <ReportReconciliation result={result} />
      </ReportWorkspacePanel>

      <ReportWorkspacePanel value="drivers">
        <FeeInsightCards benchmark={result.benchmark} refundSummary={result.refundSummary} chargeRate={result.chargeRate} />
        {!isPaid && <LockedReportPreview kind="drivers" />}
      </ReportWorkspacePanel>

      <ReportWorkspacePanel value="trends">
        <ReportDashboardCharts result={result} />
      </ReportWorkspacePanel>

      <ReportWorkspacePanel value="drivers">
      {isPaid && <FeeLeakBreakdown items={result.feeLeakBreakdown} />}

      {isPaid && savings.length > 0 && <SavingsOpportunities opportunities={savings} />}
      </ReportWorkspacePanel>

      {/* Top 5 highest-fee transactions */}
      <ReportWorkspacePanel value="transactions">
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">{t("lowVolumeReport.top5Title")}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{t("lowVolumeReport.top5Subtitle")}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">#</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">{t("lowVolumeReport.tableTransaction")}</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">{t("lowVolumeReport.tableDate")}</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">{t("lowVolumeReport.tableAmount")}</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">{t("lowVolumeReport.tableFee")}</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">{t("lowVolumeReport.tableRate")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topDrivers.slice(0, isPaid ? 5 : 3).map((row, i) => (
                <tr key={row.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-xs font-bold text-gray-300">{i + 1}</td>
                  <td className="px-5 py-3 text-xs text-gray-600 max-w-[180px]">
                    <div className="truncate font-medium text-gray-800">{transactionPrimaryLabel(row, tc("charge"))}</div>
                    <div className="truncate text-[11px] text-gray-400">
                      {row.description?.trim()
                        ? row.id
                        : [row.reportingCategory, row.paymentMethodType].filter(Boolean).join(" · ") ||
                          `${tc("reference")} ${row.id.slice(0, 18)}…`}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(row.date, locale)}</td>
                  <td className="px-5 py-3 text-right text-gray-700 whitespace-nowrap">{fmt$(row.amount)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">{fmt$(row.fee)}</td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <Badge className="bg-orange-50 text-orange-700 text-xs">
                      {row.amount > 0 ? fmtPct((row.fee / row.amount) * 100) : "—"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isPaid && <div className="p-5"><LockedReportPreview kind="transactions" /></div>}

        {!isPaid && (
          <div className="p-5 border-t border-gray-50">
            <PaywallBanner
              reportId={reportId}
              annualImpact={paywallImpact?.amount}
              impactSource={paywallImpact?.source}
              firstOpportunity={paywallImpact?.label}
              diagnosis={freeDiagnosis}
            />
          </div>
        )}
      </div>
      </ReportWorkspacePanel>

      <ReportWorkspacePanel value="overview">
      {/* No stats disclaimer */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4">
        <p className="text-xs text-gray-500">
          <strong>{t("lowVolumeReport.noteTitle")}</strong> {t("lowVolumeReport.noteBody")}
        </p>
      </div>
      </ReportWorkspacePanel>

      <ReportWorkspacePanel value="trends">
      {/* Upload more */}
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 text-center">
        <p className="text-sm font-semibold text-blue-800 mb-1">{t("lowVolumeReport.deeperAnalysisTitle")}</p>
        <p className="text-xs text-blue-600 mb-3">{t("lowVolumeReport.deeperAnalysisBody")}</p>
        <a
          href="/analyze"
          className="inline-block text-sm font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900"
        >
          {t("lowVolumeReport.deeperAnalysisLink")}
        </a>
      </div>
      </ReportWorkspacePanel>
    </ReportWorkspace>
  );
}

