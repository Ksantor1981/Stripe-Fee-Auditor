"use client";

import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmt$, fmtPct, fmtMonth, fmtDate } from "@/lib/format";
import { annualRunRate, periodTotalFees, stripeFeesPeriodTail } from "@/lib/fee-period-copy";
import { PaywallBanner } from "./PaywallBanner";

interface Props {
  reportId: string;
  accessToken: string;
  result: AnalysisResult;
  isPaid: boolean;
}

export function SingleMonthReport({ reportId, accessToken, result, isPaid }: Props) {
  const { chargeFees, chargeRate, chargeVolume, otherFees, monthly, topDrivers } = result;
  const month = monthly[0];
  const periodFees = periodTotalFees(chargeFees, otherFees);
  const yearlyAtThisRate = annualRunRate(periodFees, 1);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
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

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Effective Rate", value: fmtPct(chargeRate), highlight: true },
            { label: "Charge Fees", value: fmt$(chargeFees) },
            { label: "Charge Volume", value: fmt$(chargeVolume) },
            { label: "Other Fees", value: fmt$(otherFees) },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`rounded-xl px-4 py-3 ${highlight ? "bg-blue-50 border border-blue-100" : "bg-gray-50"}`}>
              <p className={`text-xs mb-0.5 ${highlight ? "text-blue-500 font-semibold" : "text-gray-400"}`}>{label}</p>
              <p className={`text-xl font-bold ${highlight ? "text-blue-700" : "text-gray-900"}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

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
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Other Fees</h2>
          <p className="text-3xl font-bold text-gray-900">{fmt$(otherFees)}</p>
          <p className="text-sm text-gray-400 mt-1">
            Refunds, disputes, payouts &amp; other
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
                  <p className="text-sm font-medium text-gray-800 truncate">{row.id}</p>
                  <p className="text-xs text-gray-400">{fmtDate(row.date)}</p>
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
        {!isPaid && <div className="p-5"><PaywallBanner reportId={reportId} accessToken={accessToken} /></div>}
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
