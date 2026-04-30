"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmt$, fmtPct, fmtMonth, fmtDate } from "@/lib/format";
import { PaywallBanner } from "./PaywallBanner";

interface Props {
  reportId: string;
  accessToken: string;
  result: AnalysisResult;
  isPaid: boolean;
}

export function MultiMonthReport({ reportId, accessToken, result, isPaid }: Props) {
  const { chargeFees, chargeRate, chargeVolume, otherFees, monthly, topDrivers, anomalies, periodDelta } = result;

  const chartData = monthly.map((m) => ({
    name: fmtMonth(m.month),
    fees: parseFloat(m.fees.toFixed(2)),
    rate: parseFloat(m.rate.toFixed(3)),
  }));

  const deltaPositive = periodDelta !== null && periodDelta > 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              {monthly.length}-month analysis
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              You paid <span className="text-blue-600">{fmt$(chargeFees)}</span> in Stripe fees
            </h1>
            {periodDelta !== null && (
              <p className={`mt-1 text-sm font-medium ${deltaPositive ? "text-red-600" : "text-green-600"}`}>
                {deltaPositive ? "▲" : "▼"} {fmt$(Math.abs(periodDelta))} vs previous period
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{fmtPct(chargeRate)}</p>
            <p className="text-xs text-gray-400 mt-0.5">effective fee rate</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Charge Volume", value: fmt$(chargeVolume) },
            { label: "Charge Fees", value: fmt$(chargeFees) },
            { label: "Other Fees", value: fmt$(otherFees) },
            { label: "Anomalies", value: String(anomalies.length) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Fees ($)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(v) => `$${v}`}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip
              formatter={(v) => [fmt$(Number(v ?? 0)), "Fees"]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            <Bar dataKey="fees" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="anomalies" className="flex-1">
            Anomalies
            {anomalies.length > 0 && (
              <Badge className="ml-1.5 bg-red-100 text-red-700 text-xs">{anomalies.length}</Badge>
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
                    <p className="text-sm font-medium text-gray-800 truncate">{row.id}</p>
                    <p className="text-xs text-gray-400">{fmtDate(row.date)}</p>
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
                    <p className="text-sm text-gray-800 truncate">{row.id}</p>
                    <p className="text-sm font-semibold">{fmt$(row.fee)}</p>
                  </div>
                ))}
                <div className="absolute inset-0 flex items-center justify-center bg-white/60" />
              </div>
            )}
          </div>
          {!isPaid && <div className="mt-4"><PaywallBanner reportId={reportId} accessToken={accessToken} /></div>}
        </TabsContent>

        {/* Anomalies tab */}
        <TabsContent value="anomalies">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm mt-3">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">
                Anomalous Transactions
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Charges with fee rate &gt; avg + 2σ
              </p>
            </div>

            {isPaid ? (
              anomalies.length === 0 ? (
                <p className="px-5 py-8 text-sm text-center text-gray-400">
                  No anomalies detected. Your fee rate looks consistent! 🎉
                </p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {anomalies.map((row) => (
                    <div key={row.id} className="flex items-center justify-between px-5 py-3.5 gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{row.id}</p>
                        <p className="text-xs text-gray-400">{fmtDate(row.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">{fmt$(row.fee)}</p>
                        <Badge className="text-xs bg-red-50 text-red-700">
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
                  {anomalies.length} anomalies found
                </p>
                <p className="text-xs text-gray-400 mb-4">Unlock to see which charges are costing you the most</p>
                <PaywallBanner reportId={reportId} accessToken={accessToken} />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Monthly detail tab */}
        <TabsContent value="monthly">
          {isPaid ? (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm mt-3 overflow-hidden">
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
              <PaywallBanner reportId={reportId} accessToken={accessToken} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
