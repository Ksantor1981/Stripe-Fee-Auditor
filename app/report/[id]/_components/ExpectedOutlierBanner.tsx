"use client";

import { fmtPct } from "@/lib/format";
import type { AnalysisResult } from "@/lib/fee-analyzer";

type Props = {
  original: AnalysisResult;
  adjusted: AnalysisResult;
  count: number;
};

/** Banner when the user excluded expected one-off charges from rate views. */
export function ExpectedOutlierBanner({ original, adjusted, count }: Props) {
  if (count <= 0) return null;

  const partialLedger = original.chargeLedgerComplete === false;

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-950">
      <p className="font-semibold">
        Adjusted rate excluding {count} expected one-off charge{count === 1 ? "" : "s"}
      </p>
      <p className="mt-1 text-emerald-900/90">
        Processing: <strong>{fmtPct(adjusted.chargeRate)}</strong>
        {original.chargeRate !== adjusted.chargeRate && (
          <>
            {" "}
            (was {fmtPct(original.chargeRate)})
          </>
        )}
        {" · "}
        All-in: <strong>{fmtPct(adjusted.allInRate ?? 0)}</strong>
        {(original.allInRate ?? 0) !== (adjusted.allInRate ?? 0) && (
          <>
            {" "}
            (was {fmtPct(original.allInRate ?? 0)})
          </>
        )}
      </p>
      <p className="mt-1 text-xs text-emerald-800/80">
        Dollar totals above still reflect everything Stripe charged. Adjusted rates remove marked charges
        from the volume mix so one-offs do not skew your typical run rate.
        {partialLedger && " Large exports adjust marked rows only — re-upload a shorter CSV for full-period recalc."}
      </p>
    </div>
  );
}
