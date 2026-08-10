"use client";

import type { MonitorHistoryPoint } from "@/lib/db";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmtPct } from "@/lib/format";
import { useFmtMoney } from "@/lib/report-currency";
import { compareMonitorHistory } from "@/lib/monitor-history";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

function periodLabel(point: MonitorHistoryPoint): string {
  if (!point.periodStart) {
    const createdAt = new Date(point.createdAt);
    return Number.isNaN(createdAt.getTime())
      ? "Current upload"
      : createdAt.toLocaleDateString("en-US");
  }
  if (!point.periodEnd || point.periodEnd === point.periodStart) return point.periodStart;
  return `${point.periodStart} – ${point.periodEnd}`;
}

function deltaLabel(value: number | null, unit: string): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("en-US")}${unit}`;
}

function deltaTone(value: number | null, inverse = false): string {
  if (value === null || value === 0) return "text-slate-600";
  const worse = inverse ? value < 0 : value > 0;
  return worse ? "text-red-700" : "text-emerald-700";
}

export function MonitorHistory({
  current,
  history,
  ownerEmail,
  onHistoryHidden,
}: {
  current: AnalysisResult;
  history: MonitorHistoryPoint[];
  ownerEmail?: string;
  onHistoryHidden?: () => void;
}) {
  const fmt$ = useFmtMoney();
  const { t, tc } = useReportTranslations();
  const comparison = compareMonitorHistory(current, history);
  const points = [comparison.current, ...history].slice(0, 6);

  async function hideHistoryReport(reportId: string) {
    if (!ownerEmail) return;
    const confirmed = window.confirm("Hide this upload from Fee Monitor history?");
    if (!confirmed) return;
    const res = await fetch(`/api/reports/${reportId}/hide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email: ownerEmail }),
    });
    if (res.ok) onHistoryHidden?.();
  }

  return (
    <section className="mb-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
          {t("monitorHistory.eyebrow")}
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-950">{t("monitorHistory.title")}</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {t("monitorHistory.subtitle")}
        </p>
      </div>

      {!comparison.prior ? (
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
          {t("monitorHistory.baselineMessage")}
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">{t("monitorHistory.processingRateDrift")}</p>
              <p className={`mt-1 text-base font-bold ${deltaTone(comparison.chargeRateDeltaBps)}`}>
                {deltaLabel(comparison.chargeRateDeltaBps, " bps")}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">{t("monitorHistory.allInRateDrift")}</p>
              <p className={`mt-1 text-base font-bold ${deltaTone(comparison.allInRateDeltaBps)}`}>
                {deltaLabel(comparison.allInRateDeltaBps, " bps")}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">{t("monitorHistory.feeChange")}</p>
              <p className={`mt-1 text-base font-bold ${deltaTone(comparison.feeDelta)}`}>
                {comparison.feeDelta === null ? "—" : `${comparison.feeDelta > 0 ? "+" : ""}${fmt$(comparison.feeDelta)}`}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">{t("monitorHistory.volumeChange")}</p>
              <p className={`mt-1 text-base font-bold ${deltaTone(comparison.volumeDeltaPct, true)}`}>
                {deltaLabel(comparison.volumeDeltaPct, "%")}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            {comparison.samePeriodMatch
              ? "Compared against the prior upload covering the same export period."
              : t("monitorHistory.deltaFootnote")}
          </p>
        </>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-semibold">{t("monitorHistory.period")}</th>
              <th className="px-3 py-2 font-semibold">{tc("volume")}</th>
              <th className="px-3 py-2 font-semibold">{t("monitorHistory.processingRate")}</th>
              <th className="px-3 py-2 font-semibold">{t("monitorHistory.allInRate")}</th>
              <th className="px-3 py-2 font-semibold">{tc("fees")}</th>
              <th className="px-3 py-2 font-semibold">{t("monitorHistory.grade")}</th>
              {ownerEmail ? <th className="px-3 py-2 font-semibold"> </th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {points.map((point, index) => {
              const historyPoint = index === 0 ? null : history[index - 1];
              return (
                <tr key={index} className={index === 0 ? "bg-emerald-50/50 font-semibold" : ""}>
                  <td className="px-3 py-2">
                    {index === 0 ? t("monitorHistory.currentPrefix") : ""}
                    {periodLabel(point)}
                  </td>
                  <td className="px-3 py-2">{fmt$(point.chargeVolume)}</td>
                  <td className="px-3 py-2">{fmtPct(point.chargeRate)}</td>
                  <td className="px-3 py-2">{fmtPct(point.allInRate)}</td>
                  <td className="px-3 py-2">{fmt$(point.allInFees)}</td>
                  <td className="px-3 py-2">{point.feeGrade ?? "—"}</td>
                  {ownerEmail ? (
                    <td className="px-3 py-2 text-right">
                      {historyPoint?.reportId ? (
                        <button
                          type="button"
                          className="text-[11px] font-medium text-slate-500 hover:text-red-700"
                          onClick={() => void hideHistoryReport(historyPoint.reportId!)}
                        >
                          Hide
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
