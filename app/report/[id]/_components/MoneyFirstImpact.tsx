"use client";

import type { SavingsOpportunity } from "@/lib/fee-analyzer";
import { fmt$ } from "@/lib/format";
import { PaywallBanner } from "./PaywallBanner";

interface Props {
  reportId: string;
  savings?: SavingsOpportunity;
  /** Fallback when no savings opportunity — annual fee run-rate for context. */
  yearlyFeesAtThisRate?: number;
  highFeeCount?: number;
}

/**
 * Money-first free-preview block: lead with directional annual impact, then unlock CTA.
 * Avoids claiming "overpaying" — uses potential / directional language only.
 */
export function MoneyFirstImpact({
  reportId,
  savings,
  yearlyFeesAtThisRate,
  highFeeCount = 0,
}: Props) {
  const hasSavings = Boolean(savings && savings.annualSavings > 0);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
          {hasSavings ? "Potential annual impact found" : "Your fee snapshot"}
        </p>

        {hasSavings ? (
          <>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              up to ~{fmt$(savings!.annualSavings)}
              <span className="text-xl font-bold text-gray-500">/yr</span>
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700">
              Your first directional opportunity appears to be{" "}
              <span className="font-semibold text-gray-900">{savings!.title}</span>
              {savings!.confidence ? (
                <span className="text-gray-500"> · {savings!.confidence} confidence</span>
              ) : null}
              . Unlock the full report to see the affected rows, caveats, and next actions.
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {yearlyFeesAtThisRate != null && yearlyFeesAtThisRate > 0
                ? <>~{fmt$(yearlyFeesAtThisRate)}<span className="text-xl font-bold text-gray-500">/yr</span></>
                : "Full details gated"}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700">
              {highFeeCount > 0
                ? `${highFeeCount} high-fee charge${highFeeCount === 1 ? "" : "s"} cleared above your baseline. Unlock to see why and what to inspect.`
                : "Unlock the full report for high-fee rows, savings opportunities with caveats, and exportable detail."}
            </p>
          </>
        )}

        <p className="mt-3 text-xs leading-relaxed text-emerald-900/70">
          Estimates are directional and calculated from this upload — not guaranteed savings.
        </p>
      </div>

      <PaywallBanner
        reportId={reportId}
        annualImpact={hasSavings ? savings!.annualSavings : undefined}
        firstOpportunity={hasSavings ? savings!.title : undefined}
      />
    </div>
  );
}
