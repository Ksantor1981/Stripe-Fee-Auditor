"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmt$, fmtPct, fmtMonth } from "@/lib/format";

const DONUT_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0d9488",
  "#64748b",
];

interface Props {
  result: Pick<AnalysisResult, "feeMix" | "monthly" | "chargeRate">;
}

export function ReportDashboardCharts({ result }: Props) {
  const { feeMix, monthly, chargeRate } = result;
  const pieData =
    feeMix?.map((s) => ({
      name: s.label,
      value: s.amount,
      share: s.sharePct,
    })) ?? [];

  const timelineData = monthly.map((m) => ({
    name: fmtMonth(m.month),
    fees: Number(m.fees.toFixed(2)),
    rate: Number(m.rate.toFixed(3)),
    volume: Number(m.volume.toFixed(2)),
    count: m.count,
  }));

  const showDonut = pieData.length > 0;
  const showTimeline = timelineData.length >= 2;
  const fallbackMonth = { name: "-", fees: 0, rate: chargeRate, volume: 0, count: 0 };
  const firstMonth = timelineData[0] ?? fallbackMonth;
  const peakFeeMonth = timelineData.reduce((best, item) => (item.fees > best.fees ? item : best), firstMonth);
  const peakRateMonth = timelineData.reduce((best, item) => (item.rate > best.rate ? item : best), firstMonth);
  const lowRateMonth = timelineData.reduce((best, item) => (item.rate < best.rate ? item : best), firstMonth);
  const rateMin = Math.min(...timelineData.map((item) => item.rate), chargeRate);
  const rateMax = Math.max(...timelineData.map((item) => item.rate), chargeRate);
  const rateDomainMin = Math.max(0, Math.floor((rateMin - 0.15) * 10) / 10);
  const rateDomainMax = Math.ceil((rateMax + 0.15) * 10) / 10;

  if (!showDonut && !showTimeline) return null;

  return (
    <div id="fee-dashboard-charts" className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Fee dashboard
          </p>
          <h2 className="text-base font-bold text-gray-900 mt-0.5">
            Fee trend dashboard
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            See whether fee dollars and processing rate moved together. Categories are grouped from your CSV export, so treat this as directional rather than an official Stripe breakdown.
          </p>
        </div>
      </div>

      <div className={`grid gap-8 ${showDonut && showTimeline ? "lg:grid-cols-2 lg:items-start" : ""}`}>
        {showDonut && (
          <div className="min-h-[280px]">
            <p className="text-xs font-medium text-gray-500 mb-2">Mix of fee dollars</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={1.5}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="#fff" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, item) => {
                    const v = Number(value ?? 0);
                    const share = Number(
                      (item as { payload?: { share?: number } })?.payload?.share ?? 0,
                    );
                    return [`${fmt$(v)} (${share.toFixed(1)}%)`, "Fees"];
                  }}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={56}
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {showTimeline && (
          <div className="min-h-[280px]">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Monthly fees and processing rate
                </p>
                <p className="mt-1 text-[11px] text-gray-400">
                  Bars = charge fees. Line = processing rate. Dashed line = export baseline.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 text-right text-[11px] sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 px-2.5 py-2">
                  <p className="text-gray-400">Most fees</p>
                  <p className="font-semibold text-gray-800">{peakFeeMonth.name}</p>
                  <p className="text-gray-500">{fmt$(peakFeeMonth.fees)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-2.5 py-2">
                  <p className="text-gray-400">Highest rate</p>
                  <p className="font-semibold text-gray-800">{peakRateMonth.name}</p>
                  <p className="text-gray-500">{fmtPct(peakRateMonth.rate)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-2.5 py-2">
                  <p className="text-gray-400">Rate range</p>
                  <p className="font-semibold text-gray-800">{fmtPct(lowRateMonth.rate)}</p>
                  <p className="text-gray-500">to {fmtPct(peakRateMonth.rate)}</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={285}>
              <ComposedChart data={timelineData} margin={{ top: 14, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  domain={[rateDomainMin, rateDomainMax]}
                />
                <Tooltip
                  formatter={(val, key) => {
                    const n = Number(val ?? 0);
                    const k = String(key ?? "");
                    if (k === "fees") return [fmt$(n), "Charge fees"];
                    if (k === "volume") return [fmt$(n), "Charge volume"];
                    if (k === "count") return [String(Math.round(n)), "Charges"];
                    return [fmtPct(n), "Processing rate"];
                  }}
                  labelFormatter={(label) => label}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="fees"
                  name="Charge fees"
                  fill="#60a5fa"
                  radius={[6, 6, 0, 0]}
                  barSize={34}
                />
                <ReferenceLine
                  yAxisId="right"
                  y={Number(chargeRate.toFixed(3))}
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  ifOverflow="extendDomain"
                />
                <Line
                  yAxisId="right"
                  type="linear"
                  dataKey="rate"
                  name="Processing rate"
                  stroke="#111827"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#111827", stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="mt-2 text-[11px] text-gray-400">
              Baseline processing rate for the export: <span className="font-medium text-gray-500">{fmtPct(chargeRate)}</span>. A high fee month with a flat rate usually means volume grew; a high rate month means the mix got worse.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
