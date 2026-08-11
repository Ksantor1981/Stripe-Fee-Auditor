"use client";

import type { AnalysisResult, AnnotatedRow } from "@/lib/fee-analyzer";
import { fmtPct } from "@/lib/format";
import { useFmtMoney } from "@/lib/report-currency";
import { annualRunRate, periodTotalFees, stripeFeesPeriodTail } from "@/lib/fee-period-copy";
import { PaywallBanner } from "./PaywallBanner";
import { MoneyFirstImpact } from "./MoneyFirstImpact";
import { FeeInsightCards } from "./FeeInsightCards";
import { TransactionBuckets } from "./TransactionBuckets";
import { SavingsOpportunities } from "./SavingsOpportunities";
import { GeographyBreakdown } from "./GeographyBreakdown";
import { ReportDashboardCharts } from "./ReportDashboardCharts";
import { ReportTrustChecklist } from "./ReportTrustChecklist";
import { FeeLeakBreakdown } from "./FeeLeakBreakdown";
import { FirstActionCallout } from "./FirstActionCallout";
import { ReportMainFinding } from "./ReportMainFinding";
import { ReportWorkspace, ReportWorkspacePanel } from "./ReportWorkspaceNav";
import { ReportReconciliation } from "./ReportReconciliation";
import { LockedReportPreview } from "./LockedReportPreview";
import { MonthlyDetailPanel } from "./MonthlyDetailPanel";
import { MultiMonthTransactionsPanel } from "./MultiMonthTransactionsPanel";
import { FeeGradeBadge } from "@/components/FeeGradeBadge";
import { resolvePaywallImpact } from "@/lib/paywall-impact";
import { selectFreeDiagnosis } from "@/lib/free-diagnosis";
import { OutlierRateComparison } from "./OutlierRateComparison";
import { useReportTranslations, useFeeLabelTranslator } from "@/lib/i18n/use-report-translations";

function anomalyExplainerText(
  count: number,
  baselineRate: number,
  paidRows: AnnotatedRow[],
  isPaid: boolean,
  t: ReturnType<typeof useReportTranslations>["t"],
  translateFeeLabel: (english: string) => string
): string | null {
  if (count <= 0) return null;
  if (!isPaid) {
    return t("multiMonthReport.anomalyPreviewLocked", { count });
  }
  const labels = paidRows.map((r) => translateFeeLabel(r.explanation?.label ?? t("multiMonthReport.elevatedRate")));
  const tally = new Map<string, number>();
  for (const l of labels) tally.set(l, (tally.get(l) ?? 0) + 1);
  const sorted = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  if (!top || paidRows.length === 0) {
    return t("multiMonthReport.anomalyPaidGeneric", {
      count,
      baseline: baselineRate.toFixed(2),
    });
  }
  const [topLabel, topN] = top;
  const shownCount = paidRows.length;
  const pct = Math.round((topN / Math.max(1, shownCount)) * 100);
  const sampleCopy = shownCount < count ? t("multiMonthReport.showingTopRows", { count: shownCount }) : "";
  return t("multiMonthReport.anomalyPaidDetailed", {
    count,
    baseline: baselineRate.toFixed(2),
    sampleCopy,
    pct,
    scope: shownCount < count ? t("multiMonthReport.shownRows") : t("multiMonthReport.them"),
    label: topLabel,
  });
}

interface Props {
  reportId: string;
  result: AnalysisResult;
  originalResult: AnalysisResult;
  isPaid: boolean;
  isSampleReport?: boolean;
  /** Free preview strips anomaly rows; keep real count for badges and copy. */
  previewAnomalyCount?: number;
  expectedOutlierIds?: string[];
  onToggleExpectedOutlier?: (chargeId: string) => void;
  outlierSaving?: boolean;
  canMarkExpectedOutliers?: boolean;
}

export function MultiMonthReport({
  reportId,
  result,
  originalResult,
  isPaid,
  isSampleReport = false,
  previewAnomalyCount,
  expectedOutlierIds = [],
  onToggleExpectedOutlier,
  outlierSaving = false,
  canMarkExpectedOutliers = false,
}: Props) {
  const fmt$ = useFmtMoney();
  const { t, tc } = useReportTranslations();
  const translateFeeLabel = useFeeLabelTranslator();
  const {
    chargeRate,
    chargeVolume,
    monthly,
    topDrivers,
    periodDelta,
  } = result;
  const {
    chargeFees: actualChargeFees,
    otherFees: actualOtherFees,
    allInFees: actualAllInFees,
    allInRate: originalAllInRate,
  } = originalResult;
  const anomalyUiCount = previewAnomalyCount ?? result.anomalyCount ?? result.anomalies.length;
  const savings = result.savingsOpportunities ?? [];
  const benchmarkRate = result.benchmark?.expectedRate ?? (result.pricingProfile?.domesticPercent ?? 0.029) * 100;
  const rateGap = chargeRate - benchmarkRate;
  const rateGapText = tc("rateGapVsBenchmark", {
    gap: `${rateGap >= 0 ? "+" : ""}${rateGap.toFixed(2)}pp`,
    benchmark: benchmarkRate.toFixed(2),
  });
  const diagnosis =
    rateGap > 0.25
      ? t("multiMonthReport.diagnosisAboveBenchmark")
      : anomalyUiCount > 0
        ? t("multiMonthReport.diagnosisNearWithAnomalies")
        : t("multiMonthReport.diagnosisConsistent");

  const paidAnomalyRows: AnnotatedRow[] =
    originalResult.annotatedAnomalies && originalResult.annotatedAnomalies.length > 0
      ? originalResult.annotatedAnomalies
      : originalResult.anomalies.map((row) => ({ ...row }));

  const deltaPositive = periodDelta !== null && periodDelta > 0;
  const monthCount = monthly.length;
  const periodFees = actualAllInFees ?? periodTotalFees(actualChargeFees, actualOtherFees);
  const adjustedAllInRate =
    result.allInRate ?? (chargeVolume > 0 ? ((result.chargeFees + actualOtherFees) / chargeVolume) * 100 : 0);
  const yearlyAtThisRate = annualRunRate(periodFees, monthCount);
  const anomalyExplainer = anomalyExplainerText(
    anomalyUiCount,
    chargeRate,
    paidAnomalyRows.filter((row) => !expectedOutlierIds.includes(row.id)),
    isPaid,
    t,
    translateFeeLabel
  );
  const teaserSavings = savings[0];
  const freeDiagnosis = selectFreeDiagnosis(originalResult);
  const paywallImpact = resolvePaywallImpact({
    savingsAnnual: teaserSavings?.annualSavings,
    savingsTitle: teaserSavings?.title,
    chargeRate,
    chargeVolume,
    monthCount,
    yearlyFeesAtThisRate: yearlyAtThisRate,
    baselineRate: result.benchmark?.expectedRate,
  });
  const paywallProps = {
    reportId,
    annualImpact: paywallImpact?.amount,
    impactSource: paywallImpact?.source,
    firstOpportunity: paywallImpact?.label,
    diagnosis: freeDiagnosis,
  };

  return (
    <ReportWorkspace transactionCount={anomalyUiCount}>
      <ReportWorkspacePanel value="overview">
      {/* Hero */}
      <div id="report-share-snapshot" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        {result.feeGrade && (
          <div className="mb-4">
            <FeeGradeBadge grade={result.feeGrade} size="lg" />
          </div>
        )}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              {t("multiMonthReport.monthAnalysisEyebrow", { count: monthly.length })}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">
              {isSampleReport ? tc("thisSampleShows") : tc("youPaid")}{" "}
              <span className="text-blue-600">{fmt$(periodFees)}</span> {tc("inStripeFees")}{" "}
              {stripeFeesPeriodTail(monthCount)}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {tc("thats")}{" "}
              <span className="font-semibold text-gray-900">{fmt$(yearlyAtThisRate)}</span>
              {tc("yearSuffix")} {tc("atThisRate")}.
            </p>
            <ReportMainFinding diagnosis={freeDiagnosis} fallback={diagnosis} />
            {periodDelta !== null && (
              <p className={`mt-1 text-sm font-medium ${deltaPositive ? "text-red-600" : "text-green-600"}`}>
                {deltaPositive ? "▲" : "▼"} {fmt$(Math.abs(periodDelta))} {tc("vsPreviousPeriod")}
              </p>
            )}
          </div>
          <div className="w-full text-left sm:w-auto sm:text-right">
            <p className="text-3xl font-bold text-gray-900">{fmtPct(chargeRate)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{tc("processingFeeRate")}</p>
            <p className="mt-2 text-xl font-bold text-gray-700">{fmtPct(adjustedAllInRate)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{tc("allInCostRateShort")}</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: tc("chargeVolume"), value: fmt$(chargeVolume) },
            { label: tc("chargeFees"), value: fmt$(actualChargeFees) },
            { label: tc("allInFees"), value: fmt$(periodFees) },
            { label: tc("highFeeCharges"), value: String(anomalyUiCount) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-[#f0f1ee] px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {anomalyExplainer && (
          <p className="mt-3 text-xs text-gray-500 leading-relaxed max-w-3xl">{anomalyExplainer}</p>
        )}

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
            {t("multiMonthReport.rateComparisonBody", {
              chargeRate: fmtPct(chargeRate),
              rateGap: rateGapText,
              allInRate: fmtPct(adjustedAllInRate),
              adjustedNote:
                expectedOutlierIds.length > 0 && originalAllInRate !== undefined
                  ? t("multiMonthReport.adjustedWas", { rate: fmtPct(originalAllInRate) })
                  : "",
            })}
          </p>
        </div>
      </div>

      {!isPaid && (
        <MoneyFirstImpact
          reportId={reportId}
          savings={teaserSavings}
          yearlyFeesAtThisRate={yearlyAtThisRate}
          highFeeCount={anomalyUiCount}
          chargeRate={chargeRate}
          chargeVolume={chargeVolume}
          monthCount={monthCount}
          diagnosis={freeDiagnosis}
        />
      )}

      {isPaid && <FirstActionCallout opportunity={teaserSavings} />}

      <ReportTrustChecklist result={result} />
      <ReportReconciliation result={result} />
      </ReportWorkspacePanel>

      <ReportWorkspacePanel value="drivers">
        {isPaid ? (
          <>
            <FeeInsightCards benchmark={result.benchmark} refundSummary={result.refundSummary} />
            <FeeLeakBreakdown items={result.feeLeakBreakdown} />
            {savings.length > 0 && <SavingsOpportunities opportunities={savings} />}
            {result.transactionBuckets && result.transactionBuckets.length > 0 && (
              <TransactionBuckets buckets={result.transactionBuckets} baselineRate={chargeRate} />
            )}
            {result.geographySummary && <GeographyBreakdown summary={result.geographySummary} />}
          </>
        ) : (
          <>
            <LockedReportPreview kind="drivers" />
            <PaywallBanner {...paywallProps} />
          </>
        )}
      </ReportWorkspacePanel>

      <ReportWorkspacePanel value="trends">
        <ReportDashboardCharts result={result} />
        <MonthlyDetailPanel
          monthly={monthly}
          isPaid={isPaid}
          paywall={<PaywallBanner {...paywallProps} />}
        />
      </ReportWorkspacePanel>

      <ReportWorkspacePanel value="transactions">
        <MultiMonthTransactionsPanel
          topDrivers={topDrivers}
          anomalyRows={paidAnomalyRows}
          anomalyCount={anomalyUiCount}
          isPaid={isPaid}
          isSampleReport={isSampleReport}
          explainer={anomalyExplainer}
          expectedOutlierIds={expectedOutlierIds}
          canMarkExpectedOutliers={canMarkExpectedOutliers}
          onToggleExpectedOutlier={onToggleExpectedOutlier}
          outlierSaving={outlierSaving}
          paywall={<PaywallBanner {...paywallProps} />}
        />
      </ReportWorkspacePanel>    </ReportWorkspace>
  );
}

