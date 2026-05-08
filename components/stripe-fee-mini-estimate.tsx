"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/** Published US card rate — illustrative only; blended rate comes from your Balance CSV. */
const PERCENT = 0.029;
const FIXED = 0.3;

export function StripeFeeMiniEstimate() {
  const [raw, setRaw] = useState("100");

  const chargeUsd = useMemo(() => {
    const n = parseFloat(String(raw).replace(/,/g, "").trim());
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [raw]);

  const fee = chargeUsd > 0 ? chargeUsd * PERCENT + FIXED : 0;
  const effectivePct = chargeUsd > 0 ? (fee / chargeUsd) * 100 : 0;

  return (
    <section className="mb-14 rounded-2xl border border-blue-100 bg-blue-50/40 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Quick fee estimate (published rate)
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Standard US pricing is often quoted as 2.9% + $0.30 per successful card charge. Try an amount
        below — then compare with your real blended rate from a Balance CSV.
      </p>
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <label className="flex-1 block">
          <span className="text-xs font-medium text-gray-600">Charge amount (USD)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm sm:min-w-[200px]">
          <p className="text-xs text-gray-500">Estimated Stripe fee</p>
          <p className="text-xl font-bold text-gray-900">
            {chargeUsd > 0 ? `$${fee.toFixed(2)}` : "—"}
          </p>
          {chargeUsd > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Effective on this charge: {effectivePct.toFixed(2)}%
            </p>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-500 leading-relaxed">
        This does not include international cards, FX, Radar, refunds, or micro-transaction effects.
        For your actual effective rate and trends, upload your{" "}
        <Link href="/stripe-balance-csv" className="text-blue-600 underline hover:text-blue-800">
          Balance CSV
        </Link>{" "}
        — analysis runs in seconds.
      </p>
      <div className="mt-4">
        <Link
          href="/analyze"
          className="inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          Analyze real fees from CSV →
        </Link>
      </div>
    </section>
  );
}
