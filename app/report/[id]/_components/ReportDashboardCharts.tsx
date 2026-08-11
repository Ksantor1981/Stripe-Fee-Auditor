"use client";

import { useState, type ReactNode } from "react";
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
import { fmtPct, fmtMonth } from "@/lib/format";
import { useFmtMoney } from "@/lib/report-currency";
import { transactionPrimaryLabel } from "@/lib/transaction-display";
import { useReportTranslations, useFeeLabelTranslator } from "@/lib/i18n/use-report-translations";

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
  rateLabel,
  feesVolumeLabel,
}: {
  active?: boolean;
  payload?: Array<{ payload: { rate: number; fees: number; volume: number; count: number } }>;
  label?: string;
  rateLabel: (rate: string) => string;
  feesVolumeLabel: (fees: string, volume: string) => string;
}) {
  const fmt$ = useFmtMoney();
  if (!active || !payload?.[0]) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="mt-1 tabular-nums text-slate-700">{rateLabel(fmtPct(row.rate))}</p>
      <p className="tabular-nums text-slate-500">
        {feesVolumeLabel(fmt$(row.fees), fmt$(row.volume))}
      </p>
    </div>
  );
}

export function ReportDashboardCharts({ result }: Props) {
  const fmt$ = useFmtMoney();
  const { t, tc } = useReportTranslations();
  const translateFeeLabel = useFeeLabelTranslator();
  const [range, setRange] = useState<"all" | "1" | "3" | "6" | "12">("all");
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

  const visibleMonthly = range === "all" ? monthly : monthly.slice(-Number(range));
  const timelineData = visibleMonthly.map((m, index) => ({
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
      axis: shortLeakLabel(item.label, t, translateFeeLabel),
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
      t("reportDashboardCharts.insightPeakRate", {
        month: peakRate.name,
        rate: fmtPct(peakRate.rate),
        delta: `${peakRate.rate - chargeRate >= 0 ? "+" : ""}${(peakRate.rate - chargeRate).toFixed(2)}pp`,
      })
    );
  } else if (peakFees) {
    insightParts.push(t("reportDashboardCharts.insightPeakFees", { month: peakFees.name, fees: fmt$(peakFees.fees) }));
  }
  if (showGeo && geographySummary) {
    insightParts.push(
      t("reportDashboardCharts.insightIntlCards", { pct: Math.round(geographySummary.pctDiff) })
    );
  }
  if (expensiveRows[0]) {
    insightParts.push(t("reportDashboardCharts.insightTopCharge", { fee: fmt$(expensiveRows[0].fee) }));
  }

  if (showRadar && radarRows[0]) {
    insightParts.push(t("reportDashboardCharts.insightLargestLeak", { label: radarRows[0].fullLabel }));
  }

  const geoPie = geographySummary
    ? [
        {
          name: tc("domestic"),
          value: Number(geographySummary.domVolume.toFixed(2)),
          rate: geographySummary.domRate,
        },
        {
          name: tc("international"),
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
            {t("reportDashboardCharts.eyebrow")}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            {t("reportDashboardCharts.title")}
          </h2>
          {insightParts.length > 0 && (
            <p className="mt-1.5 max-w-2xl text-sm leading-snug text-slate-600">
              {insightParts.join(" · ")}
            </p>
          )}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {monthly.length > 3 && (
            <div className="flex rounded-lg border border-slate-200 bg-white p-1" aria-label="Chart period">
            {(["all", "1", "3", "6", "12"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRange(value)}
                  disabled={value !== "all" && monthly.length < Number(value)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    range === value
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
                  }`}
                >
                  {value === "all" ? "All" : `${value}M`}
                </button>
              ))}
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{tc("baseline")}</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
              {fmtPct(chargeRate)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
        {showTimeline && peakRate && (
          <Panel title={t("reportDashboardCharts.panelRateVsVolume")} eyebrow={t("reportDashboardCharts.panelRateVsVolumeEyebrow")} className="lg:col-span-1">
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
                <Tooltip
                  content={
                    <RateTooltip
                      rateLabel={(rate) => t("reportDashboardCharts.tooltipRate", { rate })}
                      feesVolumeLabel={(fees, volume) =>
                        t("reportDashboardCharts.tooltipFeesVolume", { fees, volume })
                      }
                    />
                  }
                  cursor={{ fill: "rgba(15,23,42,0.04)" }}
                />
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
                  name={t("reportDashboardCharts.chartVolume")}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  fill={VOLUME_FILL}
                  fillOpacity={0.55}
                  dot={false}
                  activeDot={{ r: 4, fill: SLATE }}
                />
                <Bar yAxisId="rate" dataKey="rate" name={t("reportDashboardCharts.chartRate")} radius={[5, 5, 0, 0]} maxBarSize={40}>
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
                <span className="h-2 w-2 rounded-sm bg-blue-700" /> {t("reportDashboardCharts.legendRate")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-sm bg-slate-300" /> {t("reportDashboardCharts.legendVolume")}
              </span>
              <span>{t("reportDashboardCharts.legendBaseline")}</span>
            </div>
          </Panel>
        )}

        {showMix && (
          <Panel title={t("reportDashboardCharts.panelFeeMix")} eyebrow={t("reportDashboardCharts.panelFeeMixEyebrow")} className="lg:col-span-1">
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
                <p className="text-[10px] uppercase tracking-wider text-slate-400">{t("reportDashboardCharts.trackedFees")}</p>
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
          <Panel title={t("reportDashboardCharts.panelExpensiveCharges")} eyebrow={t("reportDashboardCharts.panelExpensiveChargesEyebrow")} className="lg:col-span-1">
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
                    return [`${fmt$(Number(value ?? 0))} · ${fmtPct(rate)}`, t("reportDashboardCharts.tooltipFee")];
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
          <Panel title={t("reportDashboardCharts.panelDomesticIntl")} eyebrow={t("reportDashboardCharts.panelDomesticIntlEyebrow")} className="lg:col-span-1">
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
                    formatter={(value, name) => [fmt$(Number(value ?? 0)), `${name} ${t("reportDashboardCharts.tooltipVolumeSuffix")}`]}
                    contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{t("reportDashboardCharts.domesticRate")}</span>
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
                    <span className="text-slate-500">{t("reportDashboardCharts.internationalRate")}</span>
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
                  {t("reportDashboardCharts.intlMoreExpensive", {
                    pct: Math.round(geographySummary.pctDiff),
                    share: Math.round(geographySummary.intlShare),
                    fees: fmt$(geographySummary.excessIntlFees),
                  })}
                </p>
              </div>
            </div>
          </Panel>
        )}

        {showRadar && (
          <Panel title={t("reportDashboardCharts.panelFeeLeakProfile")} eyebrow={t("reportDashboardCharts.panelFeeLeakProfileEyebrow")} className="lg:col-span-1">
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
                    name={t("reportDashboardCharts.chartShareOfFees")}
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
                      return [`${Number(value ?? 0).toFixed(1)}% · ${fmt$(amount)}`, t("reportDashboardCharts.tooltipLeakShare")];
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
              {t("reportDashboardCharts.radarFootnote")}
            </p>
          </Panel>
        )}

        {showTimeline && peakFees && (
          <Panel title={t("reportDashboardCharts.panelFeeTimeline")} eyebrow={t("reportDashboardCharts.panelFeeTimelineEyebrow")} className="lg:col-span-2">
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
              {t("reportDashboardCharts.timelineFootnote")}
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

function shortLeakLabel(
  label: string,
  t: ReturnType<typeof useReportTranslations>["t"],
  translateFeeLabel: (english: string) => string
): string {
  const translated = translateFeeLabel(label);
  const map: Record<string, string> = {
    [translateFeeLabel("Fixed per-charge fees")]: t("reportDashboardCharts.shortFixed"),
    [translateFeeLabel("International card uplift")]: t("reportDashboardCharts.shortIntl"),
    [translateFeeLabel("Currency conversion estimate")]: t("reportDashboardCharts.shortFx"),
    [translateFeeLabel("Refund fee impact")]: t("reportDashboardCharts.shortRefunds"),
    [translateFeeLabel("Other Stripe fee lines")]: t("reportDashboardCharts.shortOther"),
    [translateFeeLabel("Base card processing")]: t("reportDashboardCharts.shortCard"),
  };
  if (map[translated]) return map[translated];
  if (label.toLowerCase().includes("fixed")) return t("reportDashboardCharts.shortFixed");
  if (label.toLowerCase().includes("international")) return t("reportDashboardCharts.shortIntl");
  if (label.toLowerCase().includes("currency") || label.toLowerCase().includes("fx")) return t("reportDashboardCharts.shortFx");
  if (label.toLowerCase().includes("refund")) return t("reportDashboardCharts.shortRefunds");
  if (label.toLowerCase().includes("dispute")) return t("reportDashboardCharts.shortDisputes");
  if (label.toLowerCase().includes("card")) return t("reportDashboardCharts.shortCard");
  return truncate(label, 10);
}
