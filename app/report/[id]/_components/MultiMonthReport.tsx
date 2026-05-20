"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult, AnnotatedRow, SavingsOpportunity } from "@/lib/fee-analyzer";
import { fmt$, fmtPct, fmtMonth } from "@/lib/format";
import { transactionPrimaryLabel, transactionSecondaryLine } from "@/lib/transaction-display";
import { annualRunRate, periodTotalFees, stripeFeesPeriodTail } from "@/lib/fee-period-copy";
import { PaywallBanner } from "./PaywallBanner";
import { FeeInsightCards } from "./FeeInsightCards";
import { TransactionBuckets } from "./TransactionBuckets";
import { SavingsOpportunities } from "./SavingsOpportunities";
import { GeographyBreakdown } from "./GeographyBreakdown";
import { ReportDashboardCharts } from "./ReportDashboardCharts";
import { ReportTrustChecklist } from "./ReportTrustChecklist";

function anomalyExplainerText(
  count: number,
  baselineRate: number,
  paidRows: AnnotatedRow[],
  isPaid: boolean
): string | null {
  if (count <= 0) return null;
  if (!isPaid) {
    return `${count} charges cleared above your statistical threshold vs your baseline — unlock for categories and line-by-line tips.`;
  }
  const labels = paidRows.map((r) => r.explanation?.label ?? "Elevated rate");
  const tally = new Map<string, number>();
  for (const l of labels) tally.set(l, (tally.get(l) ?? 0) + 1);
  const sorted = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  if (!top || paidRows.length === 0) {
    return `${count} charges paid above your ~${baselineRate.toFixed(2)}% baseline — common when card mix includes international or premium interchange; not necessarily errors.`;
  }
  const [topLabel, topN] = top;
  const pct = Math.round((topN / count) * 100);
  return `${count} charges paid above your ~${baselineRate.toFixed(2)}% baseline — about ${pct}% tagged “${topLabel}”. Typical when international or premium cards are a large share; not necessarily errors.`;
}

function PreviewValueTeaser({
  anomalyCount,
  anomalyLabel,
  savings,
}: {
  anomalyCount: number;
  anomalyLabel?: string;
  savings?: SavingsOpportunity;
}) {
  if (anomalyCount <= 0 && !savings) return null;

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Preview value found
          </p>
          <h2 className="mt-1 text-base font-bold text-blue-950">
            The full report is not just more rows
          </h2>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
          Your data
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {anomalyCount > 0 && (
          <div className="rounded-xl bg-white px-4 py-3">
            <p className="text-xs font-medium text-gray-400">Unusual charges</p>
            <p className="mt-0.5 text-lg font-bold text-gray-900">{anomalyCount} found</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Top visible reason: {anomalyLabel ?? "elevated fee rate"}. Unlock to see the affected rows and tips.
            </p>
          </div>
        )}

        {savings && (
          <div className="rounded-xl bg-white px-4 py-3">
            <p className="text-xs font-medium text-gray-400">Savings teaser</p>
            <p className="mt-0.5 text-lg font-bold text-emerald-700">
              up to ~{fmt$(savings.annualSavings)}/yr
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              First opportunity: {savings.title}. Full report shows the steps and caveats.
            </p>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-blue-900/75">
        Estimates are directional, but they are calculated from this upload, not from a generic demo.
      </p>
    </div>
  );
}

interface Props {
  reportId: string;
  result: AnalysisResult;
  isPaid: boolean;
  /** Free preview strips anomaly rows; keep real count for badges and copy. */
  previewAnomalyCount?: number;
}

export function MultiMonthReport({ reportId, result, isPaid, previewAnomalyCount }: Props) {
  const {
    chargeFees,
    chargeRate,
    chargeVolume,
    otherFees,
    allInFees,
    allInRate,
    monthly,
    topDrivers,
    anomalies,
    periodDelta,
  } = result;
  const anomalyUiCount = previewAnomalyCount ?? anomalies.length;
  const savings = result.savingsOpportunities ?? [];
  const advertisedRate = 2.9;
  const rateGap = chargeRate - advertisedRate;
  const rateGapText = `${rateGap >= 0 ? "+" : ""}${rateGap.toFixed(2)}pp vs 2.9%`;
  const diagnosis =
    rateGap > 0.25
      ? "Diagnosis: your blended rate is materially above advertised card pricing; start with savings opportunities and anomalous transactions."
      : anomalyUiCount > 0
        ? "Diagnosis: your blended rate is close to baseline, but several transactions are still worth reviewing."
        : "Diagnosis: your blended rate looks consistent; monitor monthly changes for future spikes.";

  const paidAnomalyRows: AnnotatedRow[] =
    result.annotatedAnomalies && result.annotatedAnomalies.length > 0
      ? result.annotatedAnomalies
      : anomalies.map((row) => ({ ...row }));

  const deltaPositive = periodDelta !== null && periodDelta > 0;
  const monthCount = monthly.length;
  const periodFees = allInFees ?? periodTotalFees(chargeFees, otherFees);
  const displayAllInRate = allInRate ?? (chargeVolume > 0 ? (periodFees / chargeVolume) * 100 : 0);
  const yearlyAtThisRate = annualRunRate(periodFees, monthCount);
  const anomalyExplainer = anomalyExplainerText(anomalyUiCount, chargeRate, paidAnomalyRows, isPaid);
  const teaserAnomalyLabel = result.annotatedAnomalies?.[0]?.explanation?.label;
  const teaserSavings = savings[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div id="report-share-snapshot" className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              {monthly.length}-month analysis
            </p>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">
              You paid <span className="text-blue-600">{fmt$(periodFees)}</span> in Stripe fees{" "}
              {stripeFeesPeriodTail(monthCount)}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              That&apos;s{" "}
              <span className="font-semibold text-gray-900">{fmt$(yearlyAtThisRate)}</span>
              /year at this rate.
            </p>
            <p className="mt-2 max-w-2xl text-sm font-medium text-gray-800">
              {diagnosis}
            </p>
            {periodDelta !== null && (
              <p className={`mt-1 text-sm font-medium ${deltaPositive ? "text-red-600" : "text-green-600"}`}>
                {deltaPositive ? "▲" : "▼"} {fmt$(Math.abs(periodDelta))} vs previous period
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{fmtPct(chargeRate)}</p>
            <p className="text-xs text-gray-400 mt-0.5">processing fee rate</p>
            <p className="mt-2 text-xl font-bold text-gray-700">{fmtPct(displayAllInRate)}</p>
            <p className="text-xs text-gray-400 mt-0.5">all-in cost rate</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Charge Volume", value: fmt$(chargeVolume) },
            { label: "Charge Fees", value: fmt$(chargeFees) },
            { label: "All-in Fees", value: fmt$(periodFees) },
            { label: "Anomalies", value: String(anomalyUiCount) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {anomalyExplainer && (
          <p className="mt-3 text-xs text-gray-500 leading-relaxed max-w-3xl">{anomalyExplainer}</p>
        )}

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
            Your rate vs advertised card pricing
          </p>
          <p className="text-sm text-blue-900">
            Your card/charge processing rate is <span className="font-semibold">{fmtPct(chargeRate)}</span>{" "}
            (<span className="font-semibold">{rateGapText}</span>). Stripe&apos;s advertised card rate starts at
            2.9% + $0.30, but international cards, small charges, card mix, currency conversion, and add-ons can push
            the real rate higher. Your all-in Stripe cost rate for this export is{" "}
            <span className="font-semibold">{fmtPct(displayAllInRate)}</span>.
          </p>
        </div>
      </div>

      {!isPaid && (
        <PreviewValueTeaser
          anomalyCount={anomalyUiCount}
          anomalyLabel={teaserAnomalyLabel}
          savings={teaserSavings}
        />
      )}

      <ReportTrustChecklist result={result} />

      <FeeInsightCards benchmark={result.benchmark} refundSummary={result.refundSummary} />

      <ReportDashboardCharts result={result} />

      {isPaid && savings.length > 0 && <SavingsOpportunities opportunities={savings} />}

      {result.transactionBuckets && result.transactionBuckets.length > 0 && (
        <TransactionBuckets buckets={result.transactionBuckets} baselineRate={chargeRate} />
      )}

      {isPaid && result.geographySummary && (
        <GeographyBreakdown summary={result.geographySummary} />
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="anomalies" className="flex-1">
            Anomalies
            {anomalyUiCount > 0 && (
              <Badge className="ml-1.5 bg-red-100 text-red-700 text-xs">{anomalyUiCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1">Monthly Detail</TabsTrigger>
        </TabsList>

        {/* Overview tab — Top 3 FREE */}
        <TabsContent value="overview">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm mt-3 divide-y divide-gray-50">
            <div className="px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Top Fee Drivers</h3>
              <Badge variant="outline" className="text-xs">Free preview · Top 3</Badge>
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
                    {row.amount > 0 ? fmtPct((row.fee / row.amount) * 100) : "—"} rate
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
          {!isPaid && <div className="mt-4"><PaywallBanner reportId={reportId} /></div>}
        </TabsContent>

        {/* Anomalies tab */}
        <TabsContent value="anomalies">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm mt-3">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">
                Anomalous Transactions
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Charges with unusually high fee rate versus your baseline
              </p>
              {anomalyExplainer && (
                <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-3xl">{anomalyExplainer}</p>
              )}
            </div>

            {isPaid ? (
              anomalies.length === 0 ? (
                <p className="px-5 py-8 text-sm text-center text-gray-400">
                  No anomalies detected. Your fee rate looks consistent! 🎉
                </p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {paidAnomalyRows.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{transactionPrimaryLabel(row)}</p>
                        <p className="text-xs text-gray-400 truncate">{transactionSecondaryLine(row)}</p>
                        {row.explanation && (
                          <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 space-y-1.5">
                            <Badge variant="outline" className="text-[10px] font-medium text-gray-700 border-gray-200">
                              {row.explanation.label}
                            </Badge>
                            <p className="text-xs text-gray-600 leading-relaxed">{row.explanation.detail}</p>
                            <p className="text-xs text-emerald-800 leading-relaxed">
                              <span className="font-medium">Tip:</span> {row.explanation.savingsTip}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-red-600">{fmt$(row.fee)}</p>
                        <Badge className="text-xs bg-red-50 text-red-700 mt-1">
                          {fmtPct((row.fee / row.amount) * 100)} rate
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="text-2xl mb-2">🔒</p>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {anomalyUiCount} anomalies found
                </p>
                <p className="text-xs text-gray-400 mb-4">Unlock to see which charges are costing you the most</p>
                <PaywallBanner reportId={reportId} />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Monthly detail tab */}
        <TabsContent value="monthly">
          {isPaid ? (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Month</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Volume</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Fees</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Rate</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Charges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {monthly.map((m, i) => {
                    const prev = monthly[i - 1];
                    const delta = prev ? m.fees - prev.fees : null;
                    return (
                      <tr key={m.month} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium text-gray-800">{fmtMonth(m.month)}</td>
                        <td className="px-5 py-3 text-right text-gray-600">{fmt$(m.volume)}</td>
                        <td className="px-5 py-3 text-right">
                          <span className="font-semibold text-gray-900">{fmt$(m.fees)}</span>
                          {delta !== null && (
                            <span className={`ml-1.5 text-xs ${delta > 0 ? "text-red-500" : "text-green-500"}`}>
                              {delta > 0 ? "▲" : "▼"}{fmt$(Math.abs(delta))}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-600">{fmtPct(m.rate)}</td>
                        <td className="px-5 py-3 text-right text-gray-500">{m.count}</td>
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
                Detailed monthly breakdown is in the paid report
              </p>
              <PaywallBanner reportId={reportId} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

