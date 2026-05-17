"use client";

import type { TransactionBucket } from "@/lib/fee-analyzer";
import { fmt$, fmtPct } from "@/lib/format";

interface Props {
  buckets: TransactionBucket[];
  baselineRate: number;
}

export function TransactionBuckets({ buckets, baselineRate }: Props) {
  if (!buckets || buckets.length === 0) return null;

  const maxRate = Math.max(...buckets.map((b) => b.rate));

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-700">Fee Rate by Transaction Size</h2>
        <span className="text-xs text-gray-400">
          Baseline: {fmtPct(baselineRate)}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-5">
        Smaller transactions pay more due to the fixed $0.30 fee. All size tiers are listed; empty tiers show 0 charges.
      </p>

      <div className="space-y-3">
        {buckets.map((b) => {
          const isHigh = b.rate > baselineRate + 0.5;
          const barWidth = maxRate > 0 ? (b.rate / maxRate) * 100 : 0;

          return (
            <div key={b.label}>
              {/* Row header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 w-20">{b.label}</span>
                  <span className="text-xs text-gray-400">
                    {b.count === 0 ? "0 charges" : `${b.count} charges`}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-500">
                    {b.count === 0 ? "—" : `${fmt$(b.fees)} fees`}
                  </span>
                  <span
                    className={`font-bold w-14 text-right ${
                      b.count === 0 ? "text-gray-400" : isHigh ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {b.count === 0 ? "—" : fmtPct(b.rate)}
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isHigh ? "bg-red-400" : "bg-blue-400"
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Baseline marker */}
              {maxRate > 0 && (
                <div className="relative h-0">
                  <div
                    className="absolute top-[-8px] w-px h-3 bg-gray-400 opacity-50"
                    style={{ left: `${(baselineRate / maxRate) * 100}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded-full bg-blue-400" />
          <span>Near baseline</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded-full bg-red-400" />
          <span>Above baseline (+0.5pp)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-px h-3 bg-gray-400 opacity-50" />
          <span>Your baseline</span>
        </div>
      </div>

      {/* Summary insight */}
      {buckets.some((b) => b.label === "<$20" && b.rate > baselineRate + 1) && (
        <div className="mt-4 rounded-lg bg-orange-50 border border-orange-100 px-3 py-2.5 text-xs text-orange-800">
          💡 Your small transactions (&lt;$20) have a{" "}
          <strong>{fmtPct(buckets.find((b) => b.label === "<$20")!.rate)}</strong> effective rate —{" "}
          the fixed $0.30 fee is disproportionately large. Consider bundling or minimum charge limits.
        </div>
      )}
    </div>
  );
}
