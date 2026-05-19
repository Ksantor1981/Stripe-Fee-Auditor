"use client";

import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmt$, fmtPct, fmtDate } from "@/lib/format";
import { transactionPrimaryLabel } from "@/lib/transaction-display";
import { annualRunRate, periodTotalFees, stripeFeesPeriodTail } from "@/lib/fee-period-copy";
import { Badge } from "@/components/ui/badge";
import { FeeInsightCards } from "./FeeInsightCards";
import { ReportDashboardCharts } from "./ReportDashboardCharts";
import { ReportTrustChecklist } from "./ReportTrustChecklist";

interface Props {
  reportId: string;
  result: AnalysisResult;
  isPaid: boolean;
}

export function LowVolumeReport({ result }: Props) {
  const { chargeFees, chargeRate, chargeVolume, otherFees, topDrivers, monthly } = result;
  const totalCharges = monthly.reduce((a, m) => a + m.count, 0);
  const monthCount = monthly.length;
  const periodFees = result.allInFees ?? periodTotalFees(chargeFees, otherFees);
  const allInRate = result.allInRate ?? (chargeVolume > 0 ? (periodFees / chargeVolume) * 100 : 0);
  const yearlyAtThisRate = annualRunRate(periodFees, monthCount);
  const advertisedRate = 2.9;
  const rateGap = chargeRate - advertisedRate;
  const rateGapText = `${rateGap >= 0 ? "+" : ""}${rateGap.toFixed(2)}pp vs 2.9%`;
  const diagnosis =
    rateGap > 0.25
      ? "Diagnosis: your small sample is already above advertised card pricing; upload a longer range to confirm the pattern."
      : "Diagnosis: this sample is too small for statistical anomalies; upload more months for a stronger read.";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div id="report-share-snapshot" className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <Badge variant="outline" className="text-xs text-gray-500">Low volume (&lt;50 transactions)</Badge>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Your Stripe fee summary
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {totalCharges} charges analyzed — statistical anomaly detection requires 50+ transactions.
        </p>
        <p className="mt-3 text-sm text-gray-700 leading-snug">
          You paid <span className="font-semibold text-gray-900">{fmt$(periodFees)}</span> in Stripe fees{" "}
          {stripeFeesPeriodTail(Math.max(1, monthCount))}
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
            { label: "Processing Rate", value: fmtPct(chargeRate), accent: true },
            { label: "All-in Cost Rate", value: fmtPct(allInRate) },
            { label: "Charge Volume", value: fmt$(chargeVolume) },
            { label: "All-in Fees", value: fmt$(periodFees) },
          ].map(({ label, value, accent }) => (
            <div key={label} className={`rounded-xl px-4 py-3 ${accent ? "bg-blue-50 border border-blue-100" : "bg-gray-50"}`}>
              <p className={`text-xs mb-0.5 ${accent ? "text-blue-500 font-semibold" : "text-gray-400"}`}>{label}</p>
              <p className={`text-xl font-bold ${accent ? "text-blue-700" : "text-gray-900"}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
            Your rate vs advertised card pricing
          </p>
          <p className="text-sm text-blue-900">
            Your card/charge processing rate is <span className="font-semibold">{fmtPct(chargeRate)}</span>{" "}
            (<span className="font-semibold">{rateGapText}</span>). On low-volume exports, fixed $0.30 fees and a few
            unusual charges can move the blended rate a lot. Your all-in Stripe cost rate for this export is{" "}
            <span className="font-semibold">{fmtPct(allInRate)}</span>.
          </p>
        </div>
      </div>

      <ReportTrustChecklist result={result} />

      <FeeInsightCards benchmark={result.benchmark} refundSummary={result.refundSummary} />

      <ReportDashboardCharts result={result} />

      {/* Top 5 highest-fee transactions */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Top 5 Highest-Fee Transactions</h2>
          <p className="text-xs text-gray-400 mt-0.5">Ranked by fee rate (fee / amount)</p>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">#</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Transaction</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Date</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Fee</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {topDrivers.slice(0, 5).map((row, i) => (
              <tr key={row.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3 text-xs font-bold text-gray-300">{i + 1}</td>
                <td className="px-5 py-3 text-xs text-gray-600 max-w-[180px]">
                  <div className="truncate font-medium text-gray-800">{transactionPrimaryLabel(row)}</div>
                  <div className="truncate text-[11px] text-gray-400">
                    {row.description?.trim()
                      ? row.id
                      : [row.reportingCategory, row.paymentMethodType].filter(Boolean).join(" · ") ||
                        `Ref ${row.id.slice(0, 18)}…`}
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">{fmtDate(row.date)}</td>
                <td className="px-5 py-3 text-right text-gray-700">{fmt$(row.amount)}</td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900">{fmt$(row.fee)}</td>
                <td className="px-5 py-3 text-right">
                  <Badge className="bg-orange-50 text-orange-700 text-xs">
                    {row.amount > 0 ? fmtPct((row.fee / row.amount) * 100) : "—"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No stats disclaimer */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4">
        <p className="text-xs text-gray-500">
          <strong>Note:</strong> Anomaly detection and trend analysis require 50+ charge transactions.
          Export a longer date range (3–12 months) and re-analyze for full statistical insights.
        </p>
      </div>

      {/* Upload more */}
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 text-center">
        <p className="text-sm font-semibold text-blue-800 mb-1">Want deeper analysis?</p>
        <p className="text-xs text-blue-600 mb-3">Export a longer date range from Stripe to unlock anomaly detection and trend charts.</p>
        <a
          href="/analyze"
          className="inline-block text-sm font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900"
        >
          Upload more data →
        </a>
      </div>
    </div>
  );
}

