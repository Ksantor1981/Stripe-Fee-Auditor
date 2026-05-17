"use client";

import type { SavingsOpportunity } from "@/lib/fee-analyzer";
import { fmt$ } from "@/lib/format";

interface Props {
  opportunities: SavingsOpportunity[];
}

const CONFIDENCE_STYLE = {
  high: {
    badge: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-100",
    bg: "bg-emerald-50/40",
    dot: "bg-emerald-500",
  },
  medium: {
    badge: "bg-amber-50 text-amber-700",
    border: "border-amber-100",
    bg: "bg-amber-50/30",
    dot: "bg-amber-400",
  },
  low: {
    badge: "bg-gray-100 text-gray-500",
    border: "border-gray-100",
    bg: "bg-gray-50/40",
    dot: "bg-gray-400",
  },
} as const;

export function SavingsOpportunities({ opportunities }: Props) {
  if (!opportunities || opportunities.length === 0) return null;

  const totalSavings = opportunities.reduce((a, o) => a + o.annualSavings, 0);

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">
            What to do about it
          </p>
          <h2 className="text-base font-bold text-gray-900">
            {opportunities.length} action{opportunities.length > 1 ? "s" : ""}, ranked by impact
          </h2>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-emerald-700">~{fmt$(totalSavings)}</p>
          <p className="text-xs text-gray-400">estimated / year</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-5">
        Directional estimates based on your transaction patterns. Verify before changing billing rules.
      </p>

      <div className="space-y-3">
        {opportunities.map((opp, i) => {
          const confidence = opp.confidence ?? "medium";
          const style = CONFIDENCE_STYLE[confidence as keyof typeof CONFIDENCE_STYLE] ?? CONFIDENCE_STYLE.medium;

          return (
            <div
              key={i}
              className={`rounded-xl border px-4 py-4 ${style.border} ${style.bg}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-500 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{opp.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-700">up to ~{fmt$(opp.annualSavings)}/yr</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${style.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {confidence} confidence
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed ml-7 mb-3">{opp.tip}</p>

              {opp.steps && opp.steps.length > 0 && (
                <div className="ml-7 flex flex-wrap gap-1.5">
                  {opp.steps.map((step, si) => (
                    <span
                      key={si}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 bg-white border border-gray-100 rounded-md px-2 py-1"
                    >
                      <span className="text-gray-300 font-medium">{si + 1}.</span>
                      {step}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
