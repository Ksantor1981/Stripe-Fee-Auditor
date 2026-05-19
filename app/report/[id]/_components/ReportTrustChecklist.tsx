"use client";

import type { AnalysisResult } from "@/lib/fee-analyzer";
import { fmt$ } from "@/lib/format";

interface Props {
  result: Pick<AnalysisResult, "chargeVolume" | "chargeFees" | "monthly">;
}

export function ReportTrustChecklist({ result }: Props) {
  const chargeCount = result.monthly.reduce((total, month) => total + month.count, 0);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Verify the math
          </p>
          <h2 className="mt-1 text-base font-bold text-gray-900">
            Three numbers to match against Stripe
          </h2>
        </div>
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Reconciliation check
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        Before trusting any insight, compare these against the same Balance CSV date range in
        Stripe. The processing rate is simply charge fees divided by charge volume.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Charge volume", value: fmt$(result.chargeVolume) },
          { label: "Charge fees", value: fmt$(result.chargeFees) },
          { label: "Charge rows", value: chargeCount.toLocaleString("en-US") },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="mt-0.5 text-lg font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
