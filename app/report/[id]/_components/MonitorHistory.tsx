import type { MonitorHistoryPoint } from "@/lib/db";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmt$, fmtPct } from "@/lib/format";
import { compareMonitorHistory } from "@/lib/monitor-history";

function periodLabel(point: MonitorHistoryPoint): string {
  if (!point.periodStart) return new Date(point.createdAt).toLocaleDateString("en-US");
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
}: {
  current: AnalysisResult;
  history: MonitorHistoryPoint[];
}) {
  const comparison = compareMonitorHistory(current, history);
  const points = [comparison.current, ...history].slice(0, 6);

  return (
    <section className="mb-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
          Fee Monitor history
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-950">Rate drift across your uploads</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Private summary history linked to the subscriber email. Active Monitor reports are retained for up to 13 months.
        </p>
      </div>

      {!comparison.prior ? (
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
          This is your baseline report. Upload the next period with the same subscriber email to unlock
          month-over-month rate and fee deltas.
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Processing-rate drift</p>
              <p className={`mt-1 text-base font-bold ${deltaTone(comparison.chargeRateDeltaBps)}`}>
                {deltaLabel(comparison.chargeRateDeltaBps, " bps")}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">All-in-rate drift</p>
              <p className={`mt-1 text-base font-bold ${deltaTone(comparison.allInRateDeltaBps)}`}>
                {deltaLabel(comparison.allInRateDeltaBps, " bps")}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Fee change</p>
              <p className={`mt-1 text-base font-bold ${deltaTone(comparison.feeDelta)}`}>
                {comparison.feeDelta === null ? "—" : `${comparison.feeDelta > 0 ? "+" : ""}${fmt$(comparison.feeDelta)}`}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Volume change</p>
              <p className={`mt-1 text-base font-bold ${deltaTone(comparison.volumeDeltaPct, true)}`}>
                {deltaLabel(comparison.volumeDeltaPct, "%")}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Deltas compare whole uploaded periods. Use similar date ranges for a clean month-over-month comparison.
          </p>
        </>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-semibold">Period</th>
              <th className="px-3 py-2 font-semibold">Volume</th>
              <th className="px-3 py-2 font-semibold">Processing rate</th>
              <th className="px-3 py-2 font-semibold">All-in rate</th>
              <th className="px-3 py-2 font-semibold">Fees</th>
              <th className="px-3 py-2 font-semibold">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {points.map((point, index) => (
              <tr key={index} className={index === 0 ? "bg-emerald-50/50 font-semibold" : ""}>
                <td className="px-3 py-2">{index === 0 ? "Current · " : ""}{periodLabel(point)}</td>
                <td className="px-3 py-2">{fmt$(point.chargeVolume)}</td>
                <td className="px-3 py-2">{fmtPct(point.chargeRate)}</td>
                <td className="px-3 py-2">{fmtPct(point.allInRate)}</td>
                <td className="px-3 py-2">{fmt$(point.allInFees)}</td>
                <td className="px-3 py-2">{point.feeGrade ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
