"use client";

import type { ReactNode } from "react";
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
  PieChart,
  Pie,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmt$, fmtPct, fmtMonth } from "@/lib/format";
import { transactionPrimaryLabel } from "@/lib/transaction-display";

const SLATE = "#64748b";
const GRID = "#e2e8f0";
const BLUE = "#1d4ed8";
const AMBER = "#b45309";
const TEAL = "#0f766e";
const VOLUME_FILL = "#cbd5e1";
const MIX_COLORS = ["#1d4ed8", "#0f766e", "#b45309", "#475569", "#334155", "#94a3b8"];

interface Props {
  result: Pick<
    AnalysisResult,
    | "feeMix"
    | "monthly"
    | "chargeRate"
    | "topDrivers"
    | "geographySummary"
    | "anomalies"
    | "feeLeakBreakdown"
  >;
}

function Panel({
  title,
  eyebrow,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 ${className}`}>
      {eyebrow && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{eyebrow}</p>
      )}
      <p className={`text-sm font-semibold text-slate-900 ${eyebrow ? "mt-1" : ""}`}>{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
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
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="mt-1 tabular-nums text-slate-700">Rate {fmtPct(row.rate)}</p>
      <p className="tabular-nums text-slate-500">
        {fmt$(row.fees)} fees · {fmt$(row.volume)} volume
      </p>
    </div>
  );
}

export function ReportDashboardCharts({ result }: Props) {
  const {
    feeMix,
    monthly,
    chargeRate,
    topDrivers,
    geographySummary,
    anomalies,
    feeLeakBreakdown,
  } = result;

  const mixRows =
    feeMix
      ?.map((s) => ({ name: s.label, value: Number(s.amount.toFixed(2)), share: s.sharePct }))
      .filter((s) => s.value > 0)
      .sort((a, b) => b.value - a.value) ?? [];

  const timelineData = monthly.map((m, index) => ({
    key: m.month,
    index,
    name: fmtMonth(m.month),
    short: fmtMonth(m.month).replace(/ .*/, ""),
    fees: Number(m.fees.toFixed(2)),
    rate: Number(m.rate.toFixed(3)),
    volume: Number(m.volume.toFixed(2)),
    count: m.count,
  }));

  const expensiveRows = (topDrivers?.length ? topDrivers : anomalies ?? [])
    .filter((row) => row.amount > 0 && row.fee > 0)
    .slice(0, 6)
    .map((row, i) => ({
      id: row.id,
      label: truncate(transactionPrimaryLabel(row), 28),
      fullLabel: transactionPrimaryLabel(row),
      fee: Number(row.fee.toFixed(2)),
      rate: Number(((row.fee / row.amount) * 100).toFixed(2)),
      rank: i + 1,
    }));

  const showTimeline = timelineData.length >= 2;
  const showMix = mixRows.length > 0;
  const showExpensive = expensiveRows.length > 0;
  const showGeo = Boolean(geographySummary && geographySummary.internationalCount > 0);

  const radarRows = (feeLeakBreakdown ?? [])
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)
    .map((item) => ({
      axis: shortLeakLabel(item.label),
      fullLabel: item.label,
      score: Number(Math.min(100, Math.max(item.sharePct, 0)).toFixed(1)),
      amount: item.amount,
      severity: item.severity,
    }));
  const showRadar = radarRows.length >= 3;

  if (!showTimeline && !showMix && !showExpensive && !showGeo && !showRadar) return null;

  const first = timelineData[0];
  const peakRate = first
    ? timelineData.reduce((best, item) => (item.rate > best.rate ? item : best), first)
    : null;
  const peakFees = first
    ? timelineData.reduce((best, item) => (item.fees > best.fees ? item : best), first)
    : null;
  const lowRate = first
    ? timelineData.reduce((best, item) => (item.rate < best.rate ? item : best), first)
    : null;
  const rateSpread = peakRate && lowRate ? Math.max(0, peakRate.rate - lowRate.rate) : 0;
  const maxMonthFees = Math.max(...timelineData.map((m) => m.fees), 1);
  const mixTotal = mixRows.reduce((sum, row) => sum + row.value, 0);

  const rateMin = Math.min(...timelineData.map((item) => item.rate), chargeRate);
  const rateMax = Math.max(...timelineData.map((item) => item.rate), chargeRate);
  const ratePad = Math.max(0.2, (rateMax - rateMin) * 0.3);
  const rateDomain: [number, number] = [
    Math.max(0, Number((rateMin - ratePad).toFixed(2))),
    Number((rateMax + ratePad).toFixed(2)),
  ];

  const insightParts: string[] = [];
  if (peakRate && rateSpread >= 0.15) {
    insightParts.push(
      `${peakRate.name} peaked at ${fmtPct(peakRate.rate)} (${(peakRate.rate - chargeRate >= 0 ? "+" : "")}${(peakRate.rate - chargeRate).toFixed(2)}pp vs baseline)`
    );
  } else if (peakFees) {
    insightParts.push(`${peakFees.name} had the most fee dollars (${fmt$(peakFees.fees)})`);
  }
  if (showGeo && geographySummary) {
    insightParts.push(
      `intl cards ~${Math.round(geographySummary.pctDiff)}% pricier than domestic`
    );
  }
  if (expensiveRows[0]) {
    insightParts.push(`top charge fee ${fmt$(expensiveRows[0].fee)}`);
  }

  if (showRadar && radarRows[0]) {
    insightParts.push(`largest leak bucket: ${radarRows[0].fullLabel}`);
  }

  const geoPie = geographySummary
    ? [
        {
          name: "Domestic",
          value: Number(geographySummary.domVolume.toFixed(2)),
          rate: geographySummary.domRate,
        },
        {
          name: "International",
          value: Number(geographySummary.intlVolume.toFixed(2)),
          rate: geographySummary.intlRate,
        },
      ].filter((row) => row.value > 0)
    : [];

  return (
    <div id="fee-dashboard-charts" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Fee dashboard
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            Where your Stripe fees concentrate
          </h2>
          {insightParts.length > 0 && (
            <p className="mt-1.5 max-w-2xl text-sm leading-snug text-slate-600">
              {insightParts.join(" · ")}
            </p>
          )}
        </div>
        <div className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left sm:w-auto sm:text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Baseline</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
            {fmtPct(chargeRate)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
        {showTimeline && peakRate && (
          <Panel title="Rate vs volume" eyebrow="Trend" className="lg:col-span-1">
            <ResponsiveContainer width="100%" height={228}>
              <ComposedChart data={timelineData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="short" tick={{ fontSize: 11, fill: SLATE }} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="rate"
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10, fill: SLATE }}
                  tickLine={false}
                  axisLine={false}
                  width={38}
                  domain={rateDomain}
                />
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  tickFormatter={(v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`)}
                  tick={{ fontSize: 10, fill: SLATE }}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                />
                <Tooltip content={<RateTooltip />} cursor={{ fill: "rgba(15,23,42,0.04)" }} />
                <ReferenceLine
                  yAxisId="rate"
                  y={Number(chargeRate.toFixed(3))}
                  stroke={SLATE}
                  strokeDasharray="4 4"
                />
                <Area
                  yAxisId="volume"
                  type="monotone"
                  dataKey="volume"
                  name="Volume"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  fill={VOLUME_FILL}
                  fillOpacity={0.55}
                  dot={false}
                  activeDot={{ r: 4, fill: SLATE }}
                />
                <Bar yAxisId="rate" dataKey="rate" name="Rate" radius={[5, 5, 0, 0]} maxBarSize={40}>
                  {timelineData.map((row) => (
                    <Cell
                      key={row.key}
                      fill={row.key === peakRate.key && rateSpread >= 0.15 ? AMBER : BLUE}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-blue-700" /> Rate %
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-sm bg-slate-300" /> Volume (area)
              </span>
              <span>Dashed = baseline rate</span>
            </div>
          </Panel>
        )}

        {showMix && (
          <Panel title="Fee mix" eyebrow="Composition" className="lg:col-span-1">
            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_1.1fr] sm:gap-2">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={mixRows}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={2}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {mixRows.map((_, i) => (
                      <Cell key={i} fill={MIX_COLORS[i % MIX_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [fmt$(Number(value ?? 0)), String(name)]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Tracked fees</p>
                <p className="text-xl font-semibold tabular-nums text-slate-950">{fmt$(mixTotal)}</p>
                <ul className="mt-3 space-y-2">
                  {mixRows.slice(0, 4).map((row, i) => (
                    <li key={row.name} className="flex items-start gap-2 text-xs">
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: MIX_COLORS[i % MIX_COLORS.length] }}
                      />
                      <span className="min-w-0 flex-1 truncate text-slate-600">{row.name}</span>
                      <span className="shrink-0 tabular-nums font-medium text-slate-900">
                        {row.share.toFixed(0)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>
        )}

        {showExpensive && (
          <Panel title="Most expensive charges" eyebrow="Transactions" className="lg:col-span-1">
            <ResponsiveContainer width="100%" height={Math.max(180, expensiveRows.length * 36)}>
              <BarChart
                layout="vertical"
                data={expensiveRows}
                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fontSize: 10, fill: SLATE }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={96}
                  tick={{ fontSize: 10, fill: SLATE }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value, _name, item) => {
                    const rate = Number((item as { payload?: { rate?: number } })?.payload?.rate ?? 0);
                    return [`${fmt$(Number(value ?? 0))} · ${fmtPct(rate)}`, "Fee"];
                  }}
                  labelFormatter={(_, payload) => {
                    const full = (payload?.[0] as { payload?: { fullLabel?: string } } | undefined)
                      ?.payload?.fullLabel;
                    return full ?? "";
                  }}
                  contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="fee" radius={[0, 6, 6, 0]} barSize={14} fill={BLUE}>
                  {expensiveRows.map((row, i) => (
                    <Cell key={row.id} fill={i === 0 ? AMBER : BLUE} fillOpacity={i === 0 ? 1 : 0.75} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        )}

        {showGeo && geographySummary && geoPie.length > 0 && (
          <Panel title="Domestic vs international" eyebrow="Geography" className="lg:col-span-1">
            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[0.9fr_1.1fr] sm:gap-3">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={geoPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    <Cell fill={BLUE} />
                    <Cell fill={TEAL} />
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [fmt$(Number(value ?? 0)), `${name} volume`]}
                    contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Domestic rate</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {fmtPct(geographySummary.domRate)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200/80">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${rateBarWidth(geographySummary.domRate, geographySummary.intlRate)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">International rate</span>
                    <span className="font-semibold tabular-nums text-teal-800">
                      {fmtPct(geographySummary.intlRate)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200/80">
                    <div
                      className="h-full rounded-full bg-teal-700"
                      style={{
                        width: `${rateBarWidth(geographySummary.intlRate, geographySummary.domRate)}%`,
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-500">
                  Intl is ~{Math.round(geographySummary.pctDiff)}% more expensive per dollar ·{" "}
                  {Math.round(geographySummary.intlShare)}% of volume · ~{fmt$(geographySummary.excessIntlFees)}{" "}
                  uplift estimate
                </p>
              </div>
            </div>
          </Panel>
        )}

        {showRadar && (
          <Panel title="Fee leak profile" eyebrow="Radar" className="lg:col-span-1">
            <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1.15fr_0.85fr]">
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarRows} cx="50%" cy="50%" outerRadius="72%">
                  <PolarGrid stroke={GRID} />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: SLATE }} />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: SLATE }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Radar
                    name="Share of fees"
                    dataKey="score"
                    stroke={BLUE}
                    fill={BLUE}
                    fillOpacity={0.22}
                    strokeWidth={2}
                  />
                  <Tooltip
                    formatter={(value, _name, item) => {
                      const amount = Number(
                        (item as { payload?: { amount?: number } })?.payload?.amount ?? 0
                      );
                      return [`${Number(value ?? 0).toFixed(1)}% · ${fmt$(amount)}`, "Leak share"];
                    }}
                    labelFormatter={(_, payload) => {
                      const full = (payload?.[0] as { payload?: { fullLabel?: string } } | undefined)
                        ?.payload?.fullLabel;
                      return full ?? "";
                    }}
                    contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <ul className="space-y-2">
                {radarRows.map((row) => (
                  <li key={row.fullLabel} className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate text-slate-600">{row.fullLabel}</span>
                    <span className="shrink-0 tabular-nums font-semibold text-slate-900">
                      {fmt$(row.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Axes = share of all-in fees by leak bucket (directional; some estimates can overlap).
            </p>
          </Panel>
        )}

        {showTimeline && peakFees && (
          <Panel title="Fee timeline" eyebrow="Month intensity" className="lg:col-span-2">
            <div className="space-y-2.5">
              {timelineData.map((row) => {
                const widthPct = Math.max(6, (row.fees / maxMonthFees) * 100);
                const isPeak = row.key === peakFees.key;
                return (
                  <div key={row.key} className="grid grid-cols-[4.5rem_1fr_4.5rem] items-center gap-3 sm:grid-cols-[5.5rem_1fr_5.5rem]">
                    <span className="text-xs font-medium text-slate-600">{row.name}</span>
                    <div className="relative h-7 rounded-md bg-slate-100/90">
                      <div
                        className="absolute inset-y-0 left-0 flex items-center rounded-md px-2"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: isPeak ? AMBER : BLUE,
                        }}
                      >
                        <span className="truncate text-[10px] font-medium text-white/95">
                          {fmtPct(row.rate)}
                        </span>
                      </div>
                    </div>
                    <span className="text-right text-xs font-semibold tabular-nums text-slate-900">
                      {fmt$(row.fees)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Bar length = fee dollars that month (Gantt-style intensity). Label inside = processing rate.
            </p>
          </Panel>
        )}
      </div>
    </div>
  );
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function rateBarWidth(value: number, peer: number): number {
  const max = Math.max(value, peer, 0.01);
  return Math.max(8, (value / max) * 100);
}

function shortLeakLabel(label: string): string {
  const map: Record<string, string> = {
    "Fixed per-charge fees": "Fixed",
    "International card uplift": "Intl",
    "Currency conversion estimate": "FX",
    "Refund fee impact": "Refunds",
    "Other Stripe fee lines": "Other",
    "Base card processing": "Card",
  };
  if (map[label]) return map[label];
  if (label.toLowerCase().includes("fixed")) return "Fixed";
  if (label.toLowerCase().includes("international")) return "Intl";
  if (label.toLowerCase().includes("currency") || label.toLowerCase().includes("fx")) return "FX";
  if (label.toLowerCase().includes("refund")) return "Refunds";
  if (label.toLowerCase().includes("dispute")) return "Disputes";
  if (label.toLowerCase().includes("card")) return "Card";
  return truncate(label, 10);
}
