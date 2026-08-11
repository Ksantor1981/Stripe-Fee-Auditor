"use client";

import { useLocale } from "next-intl";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmtPct, fmtMonth } from "@/lib/format";
import { useFmtMoney } from "@/lib/report-currency";
import { transactionPrimaryLabel, transactionSecondaryLine } from "@/lib/transaction-display";
import { annualRunRate, periodTotalFees, stripeFeesPeriodTail } from "@/lib/fee-period-copy";
import { PaywallBanner } from "./PaywallBanner";
import { MoneyFirstImpact } from "./MoneyFirstImpact";
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
import { FeeGradeBadge } from "@/components/FeeGradeBadge";
import { OutlierRateComparison } from "./OutlierRateComparison";
import { ExpectedOutlierToggle } from "./ExpectedOutlierToggle";
import { resolvePaywallImpact } from "@/lib/paywall-impact";
import { selectFreeDiagnosis } from "@/lib/free-diagnosis";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

interface Props {
  reportId: string;
  result: AnalysisResult;
  originalResult: AnalysisResult;
  isPaid: boolean;
  isSampleReport?: boolean;
  expectedOutlierIds?: string[];
  onToggleExpectedOutlier?: (chargeId: string) => void;
  outlierSaving?: boolean;
  canMarkExpectedOutliers?: boolean;
}

export function SingleMonthReport({
  reportId,
  result,
  originalResult,
  isPaid,
  isSampleReport = false,
  expectedOutlierIds = [],
  onToggleExpectedOutlier,
  outlierSaving = false,
  canMarkExpectedOutliers = false,
}: Props) {
  const fmt$ = useFmtMoney();
  const locale = useLocale();
  const { t, tc } = useReportTranslations();
  const { chargeRate, chargeVolume, monthly, topDrivers, savingsOpportunities } = result;
  const {
    chargeFees: actualChargeFees,
    allInFees: actualAllInFees,
    otherFees: actualOtherFees,
  } = originalResult;
  const savings = savingsOpportunities ?? [];
  const freeDiagnosis = selectFreeDiagnosis(originalResult);
  const month = monthly[0];
  const periodFees = actualAllInFees ?? periodTotalFees(actualChargeFees, actualOtherFees);
  const allInRate =
    result.allInRate ?? (chargeVolume > 0 ? ((result.chargeFees + actualOtherFees) / chargeVolume) * 100 : 0);
  const yearlyAtThisRate = annualRunRate(periodFees, 1);
  const paywallImpact = resolvePaywallImpact({
    savingsAnnual: savings[0]?.annualSavings,
    savingsTitle: savings[0]?.title,
    chargeRate,
    chargeVolume,
    monthCount: 1,
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
      ? t("singleMonthReport.diagnosisAboveBenchmark")
      : t("singleMonthReport.diagnosisNearBenchmark");

  return (
    <ReportWorkspace transactionCount={result.anomalyCount ?? result.anomalies?.length ?? 0}>
      <ReportWorkspacePanel value="overview">
      {/* Hero */}
      <div id="report-share-snapshot" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        {result.feeGrade && (
          <div className="mb-4">
            <FeeGradeBadge grade={result.feeGrade} size="lg" />
          </div>
        )}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          {t("singleMonthReport.eyebrow")}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          {isSampleReport ? t("singleMonthReport.titleSample") : t("singleMonthReport.titleYour")}
          <span className="text-blue-600">{month ? fmtMonth(month.month, locale) : t("singleMonthReport.thisPeriod")}</span>
        </h1>
        <p className="mt-2 text-sm text-gray-700 leading-snug">
          {isSampleReport ? tc("thisSampleShows") : tc("youPaid")}{" "}
          <span className="font-semibold text-gray-900">{fmt$(periodFees)}</span> {tc("inStripeFees")}{" "}
          {stripeFeesPeriodTail(1)}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          {tc("thats")}{" "}
          <span className="font-semibold text-gray-900">{fmt$(yearlyAtThisRate)}</span>
          {tc("yearSuffix")} {tc("atThisRate")}.
        </p>
        <ReportMainFinding diagnosis={freeDiagnosis} fallback={diagnosis} />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: tc("processingRate"), value: fmtPct(chargeRate), highlight: true },
            { label: tc("allInCostRate"), value: fmtPct(allInRate) },
            { label: tc("chargeFees"), value: fmt$(actualChargeFees) },
            { label: tc("chargeVolume"), value: fmt$(chargeVolume) },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`rounded-xl px-4 py-3 ${highlight ? "border border-blue-100 bg-blue-50" : "border border-gray-200 bg-[#f0f1ee]"}`}>
              <p className={`text-xs mb-0.5 ${highlight ? "text-blue-500 font-semibold" : "text-gray-400"}`}>{label}</p>
              <p className={`text-xl font-bold ${highlight ? "text-blue-700" : "text-gray-900"}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <OutlierRateComparison
            original={originalResult}
            adjusted={result}
            count={expectedOutlierIds.length}
          />
        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
            {tc("yourRateVsAdvertised")}
          </p>
          <p className="text-sm text-blue-900">
            {t("singleMonthReport.rateComparisonBody", {
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
          highFeeCount={result.anomalyCount ?? result.anomalies?.length ?? 0}
          chargeRate={chargeRate}
          chargeVolume={chargeVolume}
          monthCount={1}
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
        {isPaid && <FeeLeakBreakdown items={result.feeLeakBreakdown} />}
        {isPaid && savings.length > 0 && <SavingsOpportunities opportunities={savings} />}
        <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{tc("chargeFees")}</h2>
          <p className="text-3xl font-bold text-gray-900">{fmt$(actualChargeFees)}</p>
          <p className="text-sm text-gray-400 mt-1">
            {t("singleMonthReport.chargeFeesOnVolume", { rate: fmtPct(chargeRate), volume: fmt$(chargeVolume) })}
          </p>
          {month && (
            <p className="text-xs text-gray-400 mt-1">{t("singleMonthReport.chargesProcessed", { count: month.count })}</p>
          )}
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{tc("allInStripeFees")}</h2>
          <p className="text-3xl font-bold text-gray-900">{fmt$(periodFees)}</p>
          <p className="text-sm text-gray-400 mt-1">
            {t("singleMonthReport.allInFeesSubtitle")}
          </p>
        </div>
      </div>
      </ReportWorkspacePanel>

      <ReportWorkspacePanel value="trends">
        <ReportDashboardCharts result={result} />
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 text-center">
          <p className="text-sm font-semibold text-blue-800 mb-1">{t("singleMonthReport.trendCtaTitle")}</p>
          <p className="text-xs text-blue-600 mb-3">{t("singleMonthReport.trendCtaBody")}</p>
          <a
            href="/analyze"
            className="inline-block text-sm font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900"
          >
            {t("singleMonthReport.trendCtaLink")}
          </a>
        </div>
      </ReportWorkspacePanel>

      {/* Top drivers */}
      <ReportWorkspacePanel value="transactions">
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">{tc("topFeeDrivers")}</h2>
          <span className="text-xs text-gray-400">
            {isSampleReport
              ? tc("sampleReportTop3")
              : isPaid
                ? tc("fullReportTop3")
                : tc("freePreviewTop3")}
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {canMarkExpectedOutliers && topDrivers.length > 0 && (
            <p className="px-5 py-3 text-xs text-gray-500 border-b border-gray-50 bg-gray-50/50">
              {t("singleMonthReport.markExpectedOutliersHint")}
            </p>
          )}
          {topDrivers.slice(0, 3).map((row, i) => {
            const marked = expectedOutlierIds.includes(row.id);
            return (
              <div
                key={row.id}
                className={`flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4 ${marked ? "bg-emerald-50/40" : ""}`}
              >
                <div className="flex min-w-0 gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4 pt-0.5">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{transactionPrimaryLabel(row, tc("charge"))}</p>
                    <p className="text-xs text-gray-400 truncate">{transactionSecondaryLine(row)}</p>
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
                </div>
                <div className="text-left sm:text-right">
                  <p className={`text-sm font-semibold ${marked ? "text-emerald-700" : "text-gray-900"}`}>
                    {fmt$(row.fee)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {row.amount > 0 ? fmtPct((row.fee / row.amount) * 100) : "—"} {tc("rate")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {!isPaid && <div className="p-5"><LockedReportPreview kind="transactions" /></div>}

        {!isPaid && (
          <div className="p-5">
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
    </ReportWorkspace>
  );
}

