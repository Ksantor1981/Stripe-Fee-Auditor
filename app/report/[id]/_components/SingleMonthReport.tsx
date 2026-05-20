"use client";

import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmt$, fmtPct, fmtMonth } from "@/lib/format";
import { transactionPrimaryLabel, transactionSecondaryLine } from "@/lib/transaction-display";
import { annualRunRate, periodTotalFees, stripeFeesPeriodTail } from "@/lib/fee-period-copy";
import { PaywallBanner } from "./PaywallBanner";
import { FeeInsightCards } from "./FeeInsightCards";
import { ReportDashboardCharts } from "./ReportDashboardCharts";
import { ReportTrustChecklist } from "./ReportTrustChecklist";
import { SavingsOpportunities } from "./SavingsOpportunities";

interface Props {
  reportId: string;
  result: AnalysisResult;
  isPaid: boolean;
}

export function SingleMonthReport({ reportId, result, isPaid }: Props) {
  const { chargeFees, chargeRate, chargeVolume, otherFees, monthly, topDrivers, savingsOpportunities } =
    result;
  const savings = savingsOpportunities ?? [];
  const month = monthly[0];
  const periodFees = result.allInFees ?? periodTotalFees(chargeFees, otherFees);
  const allInRate = result.allInRate ?? (chargeVolume > 0 ? (periodFees / chargeVolume) * 100 : 0);
  const yearlyAtThisRate = annualRunRate(periodFees, 1);
  const advertisedRate = 2.9;
  const rateGap = chargeRate - advertisedRate;
  const rateGapText = `${rateGap >= 0 ? "+" : ""}${rateGap.toFixed(2)}pp vs 2.9%`;
  const diagnosis =
    rateGap > 0.25
      ? "Diagnosis: this month is running above advertised card pricing; inspect the top fee drivers first."
      : "Diagnosis: this month is close to advertised card pricing; top fee drivers are still worth checking.";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div id="report-share-snapshot" className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          Single-month analysis
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          Your Stripe fees for{" "}
          <span className="text-blue-600">{month ? fmtMonth(month.month) : "this period"}</span>
        </h1>
        <p className="mt-2 text-sm text-gray-700 leading-snug">
          You paid <span className="font-semibold text-gray-900">{fmt$(periodFees)}</span> in Stripe fees{" "}
          {stripeFeesPeriodTail(1)}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          That&apos;s{" "}
          <span className="font-semibold text-gray-900">{fmt$(yearlyAtThisRate)}</span>
          /year at this rate.
        </p>
        <p className="mt-2 max-w-2xl text-sm font-medium text-gray-800">
          {diagnosis}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Processing Rate", value: fmtPct(chargeRate), highlight: true },
            { label: "All-in Cost Rate", value: fmtPct(allInRate) },
            { label: "Charge Fees", value: fmt$(chargeFees) },
            { label: "Charge Volume", value: fmt$(chargeVolume) },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`rounded-xl px-4 py-3 ${highlight ? "bg-blue-50 border border-blue-100" : "bg-gray-50"}`}>
              <p className={`text-xs mb-0.5 ${highlight ? "text-blue-500 font-semibold" : "text-gray-400"}`}>{label}</p>
              <p className={`text-xl font-bold ${highlight ? "text-blue-700" : "text-gray-900"}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
            Your rate vs advertised card pricing
          </p>
          <p className="text-sm text-blue-900">
            Your card/charge processing rate is <span className="font-semibold">{fmtPct(chargeRate)}</span>{" "}
            (<span className="font-semibold">{rateGapText}</span>). Stripe&apos;s advertised card rate starts at
            2.9% + $0.30, but the real rate often moves higher because of fixed fees, international cards, and card mix.
            Your all-in Stripe cost rate for this export is <span className="font-semibold">{fmtPct(allInRate)}</span>.
          </p>
        </div>
      </div>

      <ReportTrustChecklist result={result} />

      <FeeInsightCards benchmark={result.benchmark} refundSummary={result.refundSummary} />

      <ReportDashboardCharts result={result} />

      {isPaid && savings.length > 0 && <SavingsOpportunities opportunities={savings} />}

      {/* Fee blocks */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Charge Fees</h2>
          <p className="text-3xl font-bold text-gray-900">{fmt$(chargeFees)}</p>
          <p className="text-sm text-gray-400 mt-1">
            {fmtPct(chargeRate)} on {fmt$(chargeVolume)} volume
          </p>
          {month && (
            <p className="text-xs text-gray-400 mt-1">{month.count} charges processed</p>
          )}
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">All-in Stripe Fees</h2>
          <p className="text-3xl font-bold text-gray-900">{fmt$(periodFees)}</p>
          <p className="text-sm text-gray-400 mt-1">
            Charge fees plus refunds, disputes, payouts &amp; other Stripe fee lines
          </p>
        </div>
      </div>

      {/* Top drivers */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Top Fee Drivers</h2>
          <span className="text-xs text-gray-400">Free preview · Top 3</span>
        </div>
        <div className="divide-y divide-gray-50">
          {topDrivers.slice(0, 3).map((row, i) => (
            <div key={row.id} className="flex items-center justify-between px-5 py-3.5 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{transactionPrimaryLabel(row)}</p>
                  <p className="text-xs text-gray-400 truncate">{transactionSecondaryLine(row)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{fmt$(row.fee)}</p>
                <p className="text-xs text-gray-400">
                  {row.amount > 0 ? fmtPct((row.fee / row.amount) * 100) : "—"} rate
                </p>
              </div>
            </div>
          ))}
        </div>
        {!isPaid && <div className="p-5"><PaywallBanner reportId={reportId} /></div>}
      </div>

      {/* Upload more CTA */}
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 text-center">
        <p className="text-sm font-semibold text-blue-800 mb-1">Want trend analysis?</p>
        <p className="text-xs text-blue-600 mb-3">Upload 2+ months of data to see month-over-month trends and anomaly detection.</p>
        <a
          href="/analyze"
          className="inline-block text-sm font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900"
        >
          Upload more months →
        </a>
      </div>
    </div>
  );
}

