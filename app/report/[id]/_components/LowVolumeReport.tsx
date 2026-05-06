"use client";

import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmt$, fmtPct, fmtDate } from "@/lib/format";
import { annualRunRate, periodTotalFees, stripeFeesPeriodTail } from "@/lib/fee-period-copy";
import { Badge } from "@/components/ui/badge";

interface Props {
  reportId: string;
  result: AnalysisResult;
  isPaid: boolean;
}

export function LowVolumeReport({ result }: Props) {
  const { chargeFees, chargeRate, chargeVolume, otherFees, topDrivers, monthly } = result;
  const totalCharges = monthly.reduce((a, m) => a + m.count, 0);
  const monthCount = monthly.length;
  const periodFees = periodTotalFees(chargeFees, otherFees);
  const yearlyAtThisRate = annualRunRate(periodFees, monthCount);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
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

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Effective Rate", value: fmtPct(chargeRate), accent: true },
            { label: "Total Fees", value: fmt$(chargeFees + otherFees) },
            { label: "Charge Volume", value: fmt$(chargeVolume) },
            { label: "Charge Fees", value: fmt$(chargeFees) },
          ].map(({ label, value, accent }) => (
            <div key={label} className={`rounded-xl px-4 py-3 ${accent ? "bg-blue-50 border border-blue-100" : "bg-gray-50"}`}>
              <p className={`text-xs mb-0.5 ${accent ? "text-blue-500 font-semibold" : "text-gray-400"}`}>{label}</p>
              <p className={`text-xl font-bold ${accent ? "text-blue-700" : "text-gray-900"}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

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
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Transaction ID</th>
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
                <td className="px-5 py-3 font-mono text-xs text-gray-600 max-w-[140px] truncate">{row.id}</td>
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
