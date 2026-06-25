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
  const topFeeSlice = pieData.reduce(
    (best, item) => (item.value > best.value ? item : best),
    pieData[0] ?? { name: "-", value: 0, share: 0 },
  );
  const rateSpread = Math.max(0, peakRateMonth.rate - lowRateMonth.rate);
  const timelineFeeTotal = timelineData.reduce((sum, item) => sum + item.fees, 0);
  const rateMin = Math.min(...timelineData.map((item) => item.rate), chargeRate);
  const rateMax = Math.max(...timelineData.map((item) => item.rate), chargeRate);
  const rateDomainMin = Math.max(0, Math.floor((rateMin - 0.15) * 10) / 10);
  const rateDomainMax = Math.ceil((rateMax + 0.15) * 10) / 10;

  if (!showDonut && !showTimeline) return null;

  return (
    <div
      id="fee-dashboard-charts"
      className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/50 p-6 shadow-md shadow-slate-200/70"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Fee dashboard
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-950">
            Your Stripe fees, month by month
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500">
            Separate fee dollars from fee rate: volume can rise while your rate stays normal, or your mix can get worse even when revenue looks flat.
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Baseline rate
          </p>
          <p className="text-2xl font-bold text-gray-950">{fmtPct(chargeRate)}</p>
        </div>
      </div>

      {showTimeline && (
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Largest fee month</p>
            <p className="mt-1 text-lg font-bold text-gray-950">{peakFeeMonth.name}</p>
            <p className="text-sm text-gray-500">{fmt$(peakFeeMonth.fees)} in charge fees</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Highest rate month</p>
            <p className="mt-1 text-lg font-bold text-gray-950">{peakRateMonth.name}</p>
            <p className="text-sm text-gray-500">{fmtPct(peakRateMonth.rate)} processing rate</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Monthly spread</p>
            <p className="mt-1 text-lg font-bold text-gray-950">{fmtPct(rateSpread)}</p>
            <p className="text-sm text-gray-500">between best and worst rate</p>
          </div>
        </div>
      )}

      <div className={`grid gap-5 ${showDonut && showTimeline ? "lg:grid-cols-[1.45fr_0.85fr] lg:items-start" : ""}`}>
        {showTimeline && (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Fee dollars vs processing rate
                </p>
                <p className="mt-1 text-[11px] text-gray-400">
                  Blue bars = charge fees. Dark line = processing rate. Dashed line = export baseline.
                </p>
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                {fmt$(timelineFeeTotal)} tracked
              </div>
            </div>
            <ResponsiveContainer width="100%" height={310}>
              <ComposedChart data={timelineData} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="feeBarGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.72} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5edf8" />
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
                  contentStyle={{ borderRadius: 12, border: "1px solid #dbeafe", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)", fontSize: 12 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="fees"
                  name="Charge fees"
                  fill="url(#feeBarGradient)"
                  radius={[8, 8, 2, 2]}
                  barSize={38}
                />
                <ReferenceLine
                  yAxisId="right"
                  y={Number(chargeRate.toFixed(3))}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  ifOverflow="extendDomain"
                />
                <Line
                  yAxisId="right"
                  type="linear"
                  dataKey="rate"
                  name="Processing rate"
                  stroke="#0f172a"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0f172a", stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-gray-500">
              Read it this way: a high fee month with a flat rate usually means volume grew; a high rate month means the card mix, currency, or transaction size got worse.
            </p>
          </div>
        )}

        {showDonut && (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Fee mix</p>
                <p className="mt-1 text-[11px] text-gray-400">Grouped from Stripe Balance CSV reporting types.</p>
              </div>
              <div className="rounded-full bg-slate-50 px-3 py-1 text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Top driver</p>
                <p className="text-[11px] font-semibold text-gray-700">{topFeeSlice.name}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="44%"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="#fff" strokeWidth={1.5} />
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
                  contentStyle={{ borderRadius: 12, border: "1px solid #dbeafe", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)", fontSize: 12 }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={66}
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
              Directional grouping, not an official Stripe category report. Use it to decide where to inspect first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
