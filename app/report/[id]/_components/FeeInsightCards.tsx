"use client";

import type { FeeBenchmark, RefundSummary } from "@/lib/fee-analyzer";
import { fmt$, fmtPct } from "@/lib/format";

interface Props {
  benchmark?: FeeBenchmark;
  refundSummary?: RefundSummary;
}

const TONE = {
  normal: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  watch: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
  },
  high: {
    badge: "bg-red-50 text-red-700 border-red-100",
    dot: "bg-red-500",
  },
} as const;

export function FeeInsightCards({ benchmark, refundSummary }: Props) {
  const hasRefunds = Boolean(refundSummary && refundSummary.count > 0 && refundSummary.volume > 0);
  if (!benchmark && !refundSummary) return null;

  const tone = benchmark ? TONE[benchmark.status] : TONE.normal;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {benchmark && (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Is this normal?
              </p>
              <h2 className="text-lg font-bold text-gray-900">{benchmark.label}</h2>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
              <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
              {benchmark.status}
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">{benchmark.summary}</p>
          <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-400">Rough expected range for this mix</p>
            <p className="mt-0.5 text-xl font-bold text-gray-900">
              {fmtPct(benchmark.rangeLow)}–{fmtPct(benchmark.rangeHigh)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Directional estimate based on charge size, fixed fees, visible cross-border/non-USD patterns, and refunds.
            </p>
          </div>
          {benchmark.drivers.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {benchmark.drivers.slice(0, 4).map((driver) => (
                <span key={driver} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {driver}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          Refund fee leakage
        </p>
        {hasRefunds && refundSummary ? (
          <>
            <h2 className="text-lg font-bold text-gray-900">
              ~{fmt$(refundSummary.estimatedRetainedFees)} retained fee impact
            </h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {refundSummary.count} refund{refundSummary.count === 1 ? "" : "s"} totaling {fmt$(refundSummary.volume)}.
              Stripe generally keeps the original processing fee when you refund, so this is an estimated margin leak.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-400">Refund rate</p>
                <p className="text-lg font-bold text-gray-900">{fmtPct(refundSummary.refundRate)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-400">At this pace</p>
                <p className="text-lg font-bold text-gray-900">~{fmt$(refundSummary.estimatedAnnualCost)}/yr</p>
              </div>
            </div>
            {refundSummary.directFees > 0 && (
              <p className="mt-3 text-xs text-gray-500">
                Includes {fmt$(refundSummary.directFees)} of direct refund-row fees found in the CSV.
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900">No refund leakage found</h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              No refund rows were detected in this export. If refunds happen outside this date range, export a longer period to measure their fee impact.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
