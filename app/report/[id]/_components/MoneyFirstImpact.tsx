"use client";

import type { SavingsOpportunity } from "@/lib/fee-analyzer";
import { fmt$ } from "@/lib/format";
import { resolvePaywallImpact } from "@/lib/paywall-impact";
import type { FreeDiagnosis } from "@/lib/free-diagnosis";
import { PaywallBanner } from "./PaywallBanner";

interface Props {
  reportId: string;
  savings?: SavingsOpportunity;
  /** Fallback when no savings opportunity — annual fee run-rate for context. */
  yearlyFeesAtThisRate?: number;
  highFeeCount?: number;
  chargeRate?: number;
  chargeVolume?: number;
  monthCount?: number;
  diagnosis?: FreeDiagnosis;
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
  chargeRate,
  chargeVolume,
  monthCount,
  diagnosis,
}: Props) {
  const impact = resolvePaywallImpact({
    savingsAnnual: savings?.annualSavings,
    savingsTitle: savings?.title,
    chargeRate,
    chargeVolume,
    monthCount,
    yearlyFeesAtThisRate,
  });

  const headline =
    diagnosis
      ? "We found a concrete fee driver"
      : impact?.source === "savings"
      ? "Potential annual impact found"
      : impact?.source === "rate_gap"
        ? "Rate gap vs advertised pricing"
        : impact
          ? "Your fee run-rate"
          : "Your fee snapshot";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">{headline}</p>

        {diagnosis ? (
          <>
            <p className="mt-2 text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
              {diagnosis.title}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700">
              {diagnosis.body} Unlock the full report to see every affected row, the caveats, and
              what to inspect first.
            </p>
            {diagnosis.disclaimer && (
              <p className="mt-3 text-xs leading-relaxed text-emerald-900/70">
                {diagnosis.disclaimer}
              </p>
            )}
          </>
        ) : impact ? (
          <>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {impact.source === "fee_runrate" ? "~" : "up to ~"}
              {fmt$(impact.amount)}
              <span className="text-xl font-bold text-gray-500">/yr</span>
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700">
              {impact.source === "savings" ? (
                <>
                  Your first directional opportunity appears to be{" "}
                  <span className="font-semibold text-gray-900">{impact.label}</span>
                  {savings?.confidence ? (
                    <span className="text-gray-500"> · {savings.confidence} confidence</span>
                  ) : null}
                  . Unlock the full report to see the affected rows, caveats, and next actions.
                </>
              ) : impact.source === "rate_gap" ? (
                <>
                  Your processing rate sits {impact.label}. Unlock the full report to see which
                  charges and fee drivers create that gap — and what to check in Stripe.
                </>
              ) : (
                <>
                  You&apos;re on track for ~{fmt$(impact.amount)}/yr in Stripe fees at this rate.
                  Unlock to see high-fee rows, drivers, and directional savings actions.
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Full details gated
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
        annualImpact={impact?.amount}
        impactSource={impact?.source}
        firstOpportunity={impact?.label}
        diagnosis={diagnosis}
      />
    </div>
  );
}
