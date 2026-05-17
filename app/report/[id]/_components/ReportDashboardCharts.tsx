"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
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
  }));

  const showDonut = pieData.length > 0;
  const showTimeline = timelineData.length >= 2;

  if (!showDonut && !showTimeline) return null;

  return (
    <div id="fee-dashboard-charts" className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Fee dashboard
          </p>
          <h2 className="text-base font-bold text-gray-900 mt-0.5">
            Where your Stripe fees go
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Categories are grouped from your CSV export (reporting types). Use as a directional view — not an official Stripe breakdown.
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
            <p className="text-xs font-medium text-gray-500 mb-2">
              Timeline — fees vs processing rate by month
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={timelineData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  formatter={(val, key) => {
                    const n = Number(val ?? 0);
                    const k = String(key ?? "");
                    return k === "fees"
                      ? [fmt$(n), "Fees"]
                      : [fmtPct(n), "Charge rate"];
                  }}
                  labelFormatter={(label) => label}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="fees"
                  name="Fees ($)"
                  fill="#bfdbfe"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={0.85}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="rate"
                  name="Charge rate"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#7c3aed" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="mt-1 text-[11px] text-gray-400">
              Purple line = weighted charge processing rate per month; shaded area = total charge fees. Baseline blended rate for the export is {fmtPct(chargeRate)}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
