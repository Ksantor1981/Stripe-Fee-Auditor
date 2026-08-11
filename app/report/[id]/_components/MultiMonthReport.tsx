"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult, AnnotatedRow } from "@/lib/fee-analyzer";
import { fmtPct, fmtMonth } from "@/lib/format";
import { useFmtMoney } from "@/lib/report-currency";
import { transactionPrimaryLabel, transactionSecondaryLine } from "@/lib/transaction-display";
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
import { FeeGradeBadge } from "@/components/FeeGradeBadge";
import { resolvePaywallImpact } from "@/lib/paywall-impact";
import { selectFreeDiagnosis } from "@/lib/free-diagnosis";
import { OutlierRateComparison } from "./OutlierRateComparison";
import { ExpectedOutlierToggle } from "./ExpectedOutlierToggle";
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
    <div id="report-overview" className="scroll-mt-32 space-y-8">
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

      <div id="report-drivers" className="scroll-mt-32">
        <FeeInsightCards benchmark={result.benchmark} refundSummary={result.refundSummary} />
      </div>

      <div id="report-trends" className="scroll-mt-32">
        <ReportDashboardCharts result={result} />
      </div>

      {isPaid && <FeeLeakBreakdown items={result.feeLeakBreakdown} />}

      {isPaid && savings.length > 0 && <SavingsOpportunities opportunities={savings} />}

      {result.transactionBuckets && result.transactionBuckets.length > 0 && (
        <TransactionBuckets buckets={result.transactionBuckets} baselineRate={chargeRate} />
      )}

      {isPaid && result.geographySummary && (
        <GeographyBreakdown summary={result.geographySummary} />
      )}

      {/* Tabs */}
      <Tabs id="report-transactions" defaultValue="overview" className="scroll-mt-32">
        <TabsList className="h-auto min-h-10 w-full">
          <TabsTrigger value="overview" className="flex-1 px-2 text-xs sm:px-3 sm:text-sm">{t("multiMonthReport.tabOverview")}</TabsTrigger>
          <TabsTrigger value="anomalies" className="flex-1 px-2 text-xs sm:px-3 sm:text-sm">
            {t("multiMonthReport.tabHighFee")}
            {anomalyUiCount > 0 && (
              <Badge className="ml-1 bg-red-100 text-red-700 text-[10px] sm:ml-1.5 sm:text-xs">{anomalyUiCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1 px-2 text-xs sm:px-3 sm:text-sm">{t("multiMonthReport.tabMonthlyDetail")}</TabsTrigger>
        </TabsList>

        {/* Overview tab — Top 3 summary */}
        <TabsContent value="overview">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm mt-3 divide-y divide-gray-50">
            <div className="px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">{tc("topFeeDrivers")}</h3>
              <Badge variant="outline" className="text-xs">
                {isSampleReport
                  ? tc("sampleReportTop3")
                  : isPaid
                    ? tc("fullReportTop3")
                    : tc("freePreviewTop3")}
              </Badge>
            </div>
            {topDrivers.slice(0, 3).map((row, i) => (
              <div key={row.id} className="flex items-center justify-between px-5 py-3.5 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{transactionPrimaryLabel(row)}</p>
                    <p className="text-xs text-gray-400 truncate">{transactionSecondaryLine(row)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{fmt$(row.fee)}</p>
                  <p className="text-xs text-gray-400">
                    {row.amount > 0 ? fmtPct((row.fee / row.amount) * 100) : "—"} {tc("rate")}
                  </p>
                </div>
              </div>
            ))}

            {/* Paywall blur for rows 4+ */}
            {!isPaid && topDrivers.length > 3 && (
              <div className="relative">
                {topDrivers.slice(3, 6).map((row) => (
                  <div key={row.id} className="flex items-center justify-between px-5 py-3.5 gap-4 select-none pointer-events-none blur-sm opacity-60">
                    <p className="text-sm text-gray-800 truncate">{transactionPrimaryLabel(row)}</p>
                    <p className="text-sm font-semibold">{fmt$(row.fee)}</p>
                  </div>
                ))}
                <div className="absolute inset-0 flex items-center justify-center bg-white/60" />
              </div>
            )}
          </div>
          {!isPaid && (
            <div className="mt-4">
              <PaywallBanner {...paywallProps} />
            </div>
          )}
        </TabsContent>

        {/* Anomalies tab */}
        <TabsContent value="anomalies">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm mt-3">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">
                {t("multiMonthReport.chargesAboveBaseline")}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {t("multiMonthReport.chargesAboveBaselineSubtitle")}
              </p>
              {anomalyExplainer && (
                <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-3xl">{anomalyExplainer}</p>
              )}
            </div>

            {isPaid ? (
              paidAnomalyRows.length === 0 ? (
                <p className="px-5 py-8 text-sm text-center text-gray-400">
                  {t("multiMonthReport.noHighFeeCharges")}
                </p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {canMarkExpectedOutliers && (
                    <p className="px-5 py-3 text-xs text-gray-500 border-b border-gray-50 bg-gray-50/50">
                      {t("multiMonthReport.markOneOffHint")}
                    </p>
                  )}
                  {paidAnomalyRows.map((row) => {
                    const marked = expectedOutlierIds.includes(row.id);
                    return (
                      <div
                        key={row.id}
                        className={`flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 ${marked ? "bg-emerald-50/40" : ""}`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">{transactionPrimaryLabel(row)}</p>
                          <p className="text-xs text-gray-400 truncate">{transactionSecondaryLine(row)}</p>
                          {row.explanation && (
                            <div className="mt-3 rounded-lg border border-gray-100 bg-[#f0f1ee]/90 px-3 py-2.5 space-y-1.5">
                              <Badge variant="outline" className="text-[10px] font-medium text-gray-700 border-gray-200">
                                {translateFeeLabel(row.explanation.label)}
                              </Badge>
                              <p className="text-xs text-gray-600 leading-relaxed">{row.explanation.detail}</p>
                              <p className="text-xs text-emerald-800 leading-relaxed">
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
                        <div className="text-left sm:text-right flex-shrink-0">
                          <p className={`text-sm font-semibold ${marked ? "text-emerald-700" : "text-red-600"}`}>
                            {fmt$(row.fee)}
                          </p>
                          <Badge
                            className={`text-xs mt-1 ${marked ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                          >
                            {fmtPct((row.fee / row.amount) * 100)} {tc("rate")}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="text-2xl mb-2">🔒</p>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {anomalyUiCount === 1
                    ? t("multiMonthReport.highFeeFound", { count: anomalyUiCount })
                    : t("multiMonthReport.highFeeFoundPlural", { count: anomalyUiCount })}
                </p>
                <p className="text-xs text-gray-400 mb-4">{t("multiMonthReport.unlockHighFeeHint")}</p>
                <PaywallBanner {...paywallProps} />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Monthly detail tab */}
        <TabsContent value="monthly">
          {isPaid ? (
            <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm sm:overflow-visible">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 sm:px-5 sm:py-3">{tc("month")}</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:px-5 sm:py-3">{tc("volume")}</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:px-5 sm:py-3">{tc("fees")}</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:px-5 sm:py-3">{tc("rate")}</th>
                    <th className="hidden px-3 py-2.5 text-right text-xs font-medium text-gray-500 sm:table-cell sm:px-5 sm:py-3">{tc("charges")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {monthly.map((m, i) => {
                    const prev = monthly[i - 1];
                    const delta = prev ? m.fees - prev.fees : null;
                    return (
                      <tr key={m.month} className="hover:bg-gray-50/50">
                        <td className="px-3 py-2.5 font-medium text-gray-800 sm:px-5 sm:py-3">{fmtMonth(m.month)}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600 sm:px-5 sm:py-3">{fmt$(m.volume)}</td>
                        <td className="px-3 py-2.5 text-right sm:px-5 sm:py-3">
                          <span className="font-semibold text-gray-900">{fmt$(m.fees)}</span>
                          {delta !== null && (
                            <span className={`ml-1 text-[10px] sm:ml-1.5 sm:text-xs ${delta > 0 ? "text-red-500" : "text-green-500"}`}>
                              {delta > 0 ? "▲" : "▼"}{fmt$(Math.abs(delta))}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right text-gray-600 sm:px-5 sm:py-3">{fmtPct(m.rate)}</td>
                        <td className="hidden px-3 py-2.5 text-right text-gray-500 sm:table-cell sm:px-5 sm:py-3">{m.count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm mt-3 px-5 py-10 text-center">
              <p className="text-2xl mb-2">🔒</p>
              <p className="text-sm font-semibold text-gray-700 mb-4">
                {t("multiMonthReport.monthlyBreakdownLocked")}
              </p>
              <PaywallBanner {...paywallProps} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

