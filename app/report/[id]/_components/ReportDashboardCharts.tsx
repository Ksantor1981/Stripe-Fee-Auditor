"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmt$, fmtPct, fmtMonth } from "@/lib/format";

const INK = "#0f172a";
const MUTED = "#94a3b8";
const GRID = "#e2e8f0";
const ACCENT = "#1d4ed8";
const PEAK = "#b45309";

interface Props {
  result: Pick<AnalysisResult, "feeMix" | "monthly" | "chargeRate">;
}

function RateTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: { rate: number; fees: number; volume: number; count: number } }>;
  label?: string;
}) {
  if (!active || !payload?.[0]) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="mt-1 text-slate-700">Rate {fmtPct(row.rate)}</p>
      <p className="text-slate-500">
        Fees {fmt$(row.fees)} · Volume {fmt$(row.volume)} · {row.count} charges
      </p>
    </div>
  );
}

export function ReportDashboardCharts({ result }: Props) {
  const { feeMix, monthly, chargeRate } = result;

  const mixRows =
    feeMix
      ?.map((s) => ({
        name: s.label,
        value: s.amount,
        share: s.sharePct,
      }))
      .sort((a, b) => b.value - a.value) ?? [];

  const timelineData = monthly.map((m) => ({
    key: m.month,
    name: fmtMonth(m.month),
    fees: Number(m.fees.toFixed(2)),
    rate: Number(m.rate.toFixed(3)),
    volume: Number(m.volume.toFixed(2)),
    count: m.count,
  }));

  const showMix = mixRows.length > 0;
  const showTimeline = timelineData.length >= 2;
  if (!showMix && !showTimeline) return null;

  const first = timelineData[0]!;
  const peakRate = timelineData.reduce((best, item) => (item.rate > best.rate ? item : best), first);
  const lowRate = timelineData.reduce((best, item) => (item.rate < best.rate ? item : best), first);
  const peakFees = timelineData.reduce((best, item) => (item.fees > best.fees ? item : best), first);
  const rateSpread = Math.max(0, peakRate.rate - lowRate.rate);
  const deltaVsBaseline = peakRate.rate - chargeRate;

  const rateMin = Math.min(...timelineData.map((item) => item.rate), chargeRate);
  const rateMax = Math.max(...timelineData.map((item) => item.rate), chargeRate);
  const ratePad = Math.max(0.2, (rateMax - rateMin) * 0.25);
  const rateDomain: [number, number] = [
    Math.max(0, Number((rateMin - ratePad).toFixed(2))),
    Number((rateMax + ratePad).toFixed(2)),
  ];

  const insight =
    showTimeline && rateSpread >= 0.15
      ? `${peakRate.name} was your highest-rate month at ${fmtPct(peakRate.rate)}${
          deltaVsBaseline >= 0.05 ? ` (${deltaVsBaseline >= 0 ? "+" : ""}${deltaVsBaseline.toFixed(2)}pp vs baseline)` : ""
        }.`
      : showTimeline
        ? `Rates stayed relatively flat (${fmtPct(lowRate.rate)}–${fmtPct(peakRate.rate)}). Biggest fee dollars: ${peakFees.name} (${fmt$(peakFees.fees)}).`
        : mixRows[0]
          ? `${mixRows[0].name} is ${mixRows[0].share.toFixed(0)}% of tracked fees.`
          : null;

  const maxMix = mixRows[0]?.value || 1;

  return (
    <div id="fee-dashboard-charts" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Monthly fee picture</h2>
          {insight && <p className="mt-1 max-w-2xl text-sm text-slate-600">{insight}</p>}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Baseline</p>
          <p className="text-xl font-semibold tabular-nums text-slate-950">{fmtPct(chargeRate)}</p>
        </div>
      </div>

      {showTimeline && (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Peak rate</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900 sm:text-base">
              {fmtPct(peakRate.rate)}
            </p>
            <p className="text-xs text-slate-500">{peakRate.name}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Peak fees</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900 sm:text-base">
              {fmt$(peakFees.fees)}
            </p>
            <p className="text-xs text-slate-500">{peakFees.name}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Spread</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900 sm:text-base">
              {fmtPct(rateSpread)}
            </p>
            <p className="text-xs text-slate-500">best → worst</p>
          </div>
        </div>
      )}

      <div className={`mt-5 grid gap-6 ${showMix && showTimeline ? "lg:grid-cols-5" : ""}`}>
        {showTimeline && (
          <div className={showMix ? "lg:col-span-3" : ""}>
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-slate-800">Processing rate by month</p>
              <p className="text-[11px] text-slate-400">dashed = baseline</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={timelineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: MUTED }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10, fill: MUTED }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  domain={rateDomain}
                />
                <Tooltip content={<RateTooltip />} cursor={{ fill: "rgba(15, 23, 42, 0.04)" }} />
                <ReferenceLine
                  y={Number(chargeRate.toFixed(3))}
                  stroke={MUTED}
                  strokeDasharray="4 4"
                  ifOverflow="extendDomain"
                />
                <Bar dataKey="rate" name="Processing rate" radius={[4, 4, 0, 0]} maxBarSize={56}>
                  {timelineData.map((row) => (
                    <Cell
                      key={row.key}
                      fill={row.key === peakRate.key && rateSpread >= 0.15 ? PEAK : ACCENT}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-xs text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="py-1.5 font-medium">Month</th>
                    <th className="py-1.5 font-medium text-right">Fees</th>
                    <th className="py-1.5 font-medium text-right">Volume</th>
                    <th className="py-1.5 font-medium text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {timelineData.map((row) => (
                    <tr key={row.key} className="border-b border-slate-50 last:border-0">
                      <td className="py-1.5 font-medium text-slate-800">{row.name}</td>
                      <td className="py-1.5 text-right tabular-nums">{fmt$(row.fees)}</td>
                      <td className="py-1.5 text-right tabular-nums text-slate-500">{fmt$(row.volume)}</td>
                      <td
                        className={`py-1.5 text-right tabular-nums ${
                          row.key === peakRate.key && rateSpread >= 0.15
                            ? "font-semibold text-amber-800"
                            : "text-slate-800"
                        }`}
                      >
                        {fmtPct(row.rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showMix && (
          <div className={showTimeline ? "lg:col-span-2" : ""}>
            <p className="mb-3 text-sm font-medium text-slate-800">Where fees came from</p>
            <ul className="space-y-3">
              {mixRows.slice(0, 5).map((row, index) => (
                <li key={row.name}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                    <span className="truncate font-medium text-slate-800">{row.name}</span>
                    <span className="shrink-0 tabular-nums text-slate-500">
                      {fmt$(row.value)} · {row.share.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(4, (row.value / maxMix) * 100)}%`,
                        backgroundColor: index === 0 ? ACCENT : INK,
                        opacity: index === 0 ? 1 : 0.35 + (1 - index / 5) * 0.35,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
