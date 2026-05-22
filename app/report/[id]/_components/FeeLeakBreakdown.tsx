"use client";

import type { FeeLeakBreakdownItem } from "@/lib/fee-analyzer";
import { fmt$ } from "@/lib/format";

interface Props {
  items?: FeeLeakBreakdownItem[];
}

const SEVERITY_STYLE = {
  high: "bg-red-50 text-red-700 border-red-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  low: "bg-gray-50 text-gray-600 border-gray-100",
} as const;

const KIND_LABEL = {
  direct: "direct CSV fee",
  estimated: "estimate",
} as const;

export function FeeLeakBreakdown({ items }: Props) {
  const visibleItems = items?.filter((item) => item.amount > 0) ?? [];
  if (visibleItems.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Where fees leak
          </p>
          <h2 className="mt-1 text-base font-bold text-gray-900">
            Fee dollars, translated into actions
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-gray-500">
            Direct rows come from your Stripe Balance CSV. Estimates separate likely fixed-fee drag,
            international uplift, FX, and refund impact so you know what to inspect first. Items are
            diagnostic and may overlap, so do not add them together as guaranteed savings.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100">
        <div className="hidden grid-cols-[1.25fr_0.65fr_0.7fr_1.8fr] gap-4 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 md:grid">
          <span>Bucket</span>
          <span className="text-right">Impact</span>
          <span>Type</span>
          <span>Next action</span>
        </div>

        <div className="divide-y divide-gray-100">
          {visibleItems.map((item) => {
            const severityClass = SEVERITY_STYLE[item.severity] ?? SEVERITY_STYLE.medium;
            return (
              <div
                key={item.key}
                className="grid gap-3 px-4 py-4 md:grid-cols-[1.25fr_0.65fr_0.7fr_1.8fr] md:items-start md:gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${severityClass}`}>
                      {item.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.detail}</p>
                </div>

                <div className="md:text-right">
                  <p className="text-sm font-bold text-gray-900">{fmt$(item.amount)}</p>
                  <p className="text-xs text-gray-400">~{item.sharePct.toFixed(1)}% of fees</p>
                </div>

                <div>
                  <span className="inline-flex rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500">
                    {KIND_LABEL[item.kind]}
                  </span>
                </div>

                <div>
                  <p className="text-xs leading-relaxed text-gray-600">{item.action}</p>
                  {item.actionUrl && item.actionLabel && (
                    <a
                      href={item.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {item.actionLabel} →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
