"use client";

import type { GeographySummary } from "@/lib/fee-analyzer";
import { fmt$, fmtPct } from "@/lib/format";

interface Props {
  summary: GeographySummary;
}

export function GeographyBreakdown({ summary }: Props) {
  const {
    domRate,
    intlRate,
    pctDiff,
    intlShare,
    intlExcessShare,
    excessIntlFees,
    internationalCount,
    intlVolume,
  } = summary;

  const maxRate = Math.max(domRate, intlRate);
  const domBarWidth = maxRate > 0 ? (domRate / maxRate) * 100 : 0;
  const intlBarWidth = maxRate > 0 ? (intlRate / maxRate) * 100 : 0;

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
        Domestic vs international
      </p>
      <h2 className="text-base font-bold text-gray-900 mb-4">
        You pay{" "}
        <span className="text-red-600">{Math.round(pctDiff)}% more</span>{" "}
        on international charges
      </h2>

      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-24 shrink-0">Domestic</span>
          <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-blue-400"
              style={{ width: `${domBarWidth}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-900 w-12 text-right">
            {fmtPct(domRate)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-24 shrink-0">International</span>
          <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-red-400"
              style={{ width: `${intlBarWidth}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-red-600 w-12 text-right">
            {fmtPct(intlRate)}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600 leading-relaxed">
        International charges average{" "}
        <strong className="text-gray-900">{fmtPct(intlRate)}</strong> vs{" "}
        <strong className="text-gray-900">{fmtPct(domRate)}</strong> domestic — about{" "}
        <strong className="text-red-600">{Math.round(pctDiff)}% more per dollar processed</strong>.
        They make up{" "}
        <strong className="text-gray-900">{Math.round(intlShare)}% of charge volume</strong>.
        The slice we attribute to international uplift (international fees minus what the same volume would cost at your domestic effective rate) is about{" "}
        <strong className="text-gray-900">
          {Math.round(Math.max(0, intlExcessShare))}% of charge fees
        </strong>
        — so most absolute fee dollars still come from domestic volume, even though each international dollar is pricier.
        {" "}
        {intlShare > 20
          ? "Switching EU customers to SEPA Direct Debit or iDEAL eliminates the 1.5% cross-border surcharge entirely."
          : "Enable local payment methods (SEPA, iDEAL) for international customers to reduce cross-border costs."}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Intl transactions", value: String(internationalCount) },
          { label: "Intl volume", value: fmt$(intlVolume) },
          { label: "Excess fees est.", value: fmt$(Math.max(0, excessIntlFees)) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-gray-50 px-3 py-2.5">
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
