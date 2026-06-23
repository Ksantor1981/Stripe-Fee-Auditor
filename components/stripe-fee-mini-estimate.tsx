"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/** Published US card rate — illustrative only; blended rate comes from your Balance CSV. */
const PERCENT = 0.029;
const FIXED = 0.3;
const REALISTIC_RATE = 0.038;

function parseUsd(raw: string) {
  const value = Number.parseFloat(raw.replace(/,/g, "").trim());
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function StripeFeeMiniEstimate() {
  const [volumeRaw, setVolumeRaw] = useState("50000");
  const [averageChargeRaw, setAverageChargeRaw] = useState("50");

  const estimate = useMemo(() => {
    const monthlyVolume = parseUsd(volumeRaw);
    const averageCharge = Math.max(parseUsd(averageChargeRaw), 0.01);
    const chargeCount = monthlyVolume > 0 ? Math.max(1, Math.round(monthlyVolume / averageCharge)) : 0;
    const publishedFee = monthlyVolume > 0 ? monthlyVolume * PERCENT + chargeCount * FIXED : 0;
    const publishedRate = monthlyVolume > 0 ? publishedFee / monthlyVolume : 0;
    const realisticFee = monthlyVolume * REALISTIC_RATE;
    const gap = Math.max(0, realisticFee - publishedFee);

    return {
      monthlyVolume,
      averageCharge,
      chargeCount,
      publishedFee,
      publishedRate,
      realisticFee,
      gap,
    };
  }, [averageChargeRaw, volumeRaw]);

  return (
    <section className="mb-14 rounded-2xl border border-blue-100 bg-blue-50/40 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Monthly Stripe fee estimate
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Start with Stripe&apos;s published 2.9% + $0.30 card pricing. Then compare it with the
        real blended rate you may see once international cards, refunds, add-ons, and small
        charges show up in your Balance CSV.
      </p>

      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Monthly card volume (USD)</span>
            <input
              type="number"
              min={0}
              step="100"
              value={volumeRaw}
              onChange={(event) => setVolumeRaw(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Average charge amount (USD)</span>
            <input
              type="number"
              min={0.01}
              step="1"
              value={averageChargeRaw}
              onChange={(event) => setAverageChargeRaw(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <p className="text-xs leading-relaxed text-gray-500">
            Estimated transactions: {estimate.chargeCount.toLocaleString("en-US")}. Smaller average
            charges make the fixed $0.30 fee matter more.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Published-rate estimate
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">Estimated monthly fee</p>
              <p className="text-2xl font-bold text-gray-900">
                {estimate.monthlyVolume > 0 ? formatMoney(estimate.publishedFee) : "-"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Effective: {(estimate.publishedRate * 100).toFixed(2)}%
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 px-3 py-3">
              <p className="text-xs text-blue-700">If real rate is 3.8%</p>
              <p className="text-xl font-bold text-blue-950">
                {estimate.monthlyVolume > 0 ? formatMoney(estimate.realisticFee) : "-"}
              </p>
              <p className="mt-1 text-xs text-blue-700">
                {estimate.gap > 0 ? `${formatMoney(estimate.gap)} higher` : "No gap at this mix"}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            3.8% is not a promise or benchmark; it is a common enough SaaS scenario when the mix
            includes international cards, small charges, refunds, and other Stripe fee lines.
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500 leading-relaxed">
        This calculator estimates the expected fee from public pricing. To see what Stripe actually
        took from your account, upload your{" "}
        <Link href="/stripe-balance-csv" className="text-blue-600 underline hover:text-blue-800">
          Balance CSV
        </Link>{" "}
        and calculate the rate from real transactions.
      </p>
      <div className="mt-4">
        <Link
          href="/analyze"
          className="inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          Analyze real fees from CSV -&gt;
        </Link>
      </div>
    </section>
  );
}
