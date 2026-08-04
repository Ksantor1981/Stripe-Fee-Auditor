"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  STRIPE_ACCOUNT_COUNTRIES,
  estimateCountryStripeFee,
  type StripeAccountCountry,
} from "@/lib/stripe-country-fees";

/** Extra buffer for refunds, disputes, Radar/Billing add-ons (all-in vs processing). */
const ALL_IN_BUFFER_LOW = 0.002;
const ALL_IN_BUFFER_HIGH = 0.006;

function parseUsd(raw: string) {
  const value = Number.parseFloat(raw.replace(/,/g, "").trim());
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function parsePct(raw: string) {
  const value = Number.parseFloat(raw.replace(/%/g, "").trim());
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function formatMoney(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRate(rate: number) {
  return `${(rate * 100).toFixed(1)}%`;
}

interface Props {
  /** Compact variant for embedding on the homepage hero flow. */
  compact?: boolean;
}

export function StripeFeeMiniEstimate({ compact = false }: Props) {
  const [volumeRaw, setVolumeRaw] = useState("50000");
  const [averageChargeRaw, setAverageChargeRaw] = useState("50");
  const [intlShareRaw, setIntlShareRaw] = useState("15");
  const [targetNetRaw, setTargetNetRaw] = useState("100");
  const [accountCountry, setAccountCountry] = useState<StripeAccountCountry>("US");

  const estimate = useMemo(() => {
    const monthlyVolume = parseUsd(volumeRaw);
    const averageCharge = Math.max(parseUsd(averageChargeRaw), 0.01);
    const intlShare = parsePct(intlShareRaw) / 100;
    const targetNet = Math.max(parseUsd(targetNetRaw), 0);
    const chargeCount = monthlyVolume > 0 ? Math.max(1, Math.round(monthlyVolume / averageCharge)) : 0;
    const countryEstimate = estimateCountryStripeFee({
      amount: monthlyVolume,
      accountCountry,
      internationalShare: intlShare,
    });
    const profile = countryEstimate.profile;
    const publishedFee =
      monthlyVolume > 0
        ? monthlyVolume * profile.domesticPercent + chargeCount * profile.domesticFixed
        : 0;
    const publishedRate = monthlyVolume > 0 ? publishedFee / monthlyVolume : 0;
    const midRate = countryEstimate.effectiveRate;
    const lowRate = midRate + ALL_IN_BUFFER_LOW;
    const highRate = midRate + ALL_IN_BUFFER_HIGH + intlShare * 0.002;
    const midFee = monthlyVolume * midRate;
    const highFee = monthlyVolume * highRate;
    const gapVsPublished = Math.max(0, midFee - publishedFee);
    const reverseGross =
      targetNet > 0 && profile.domesticPercent < 1
        ? (targetNet + profile.domesticFixed) / (1 - profile.domesticPercent)
        : 0;
    const reverseFee = Math.max(0, reverseGross - targetNet);
    const reverseEffectiveRate = reverseGross > 0 ? reverseFee / reverseGross : 0;

    return {
      monthlyVolume,
      averageCharge,
      chargeCount,
      intlShare,
      targetNet,
      profile,
      publishedFee,
      publishedRate,
      lowRate,
      highRate,
      midFee,
      highFee,
      gapVsPublished,
      reverseGross,
      reverseFee,
      reverseEffectiveRate,
    };
  }, [accountCountry, averageChargeRaw, intlShareRaw, targetNetRaw, volumeRaw]);

  const shellClass = compact
    ? "rounded-2xl border border-blue-100 bg-blue-50/40 p-5 sm:p-6"
    : "mb-14 rounded-2xl border border-blue-100 bg-blue-50/40 p-6";

  const domesticPct = (estimate.profile.domesticPercent * 100).toFixed(2);
  const fixedFee = formatMoney(estimate.profile.domesticFixed, estimate.profile.currency);

  return (
    <section className={shellClass} id="instant-estimate">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Monthly Stripe fee estimate + reverse fee calculator
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        No file needed. Estimate monthly Stripe fees, see a likely all-in range, or calculate how much
        to charge when you want to receive a specific net amount.
      </p>

      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Stripe account country</span>
            <select
              value={accountCountry}
              onChange={(event) => setAccountCountry(event.target.value as StripeAccountCountry)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {STRIPE_ACCOUNT_COUNTRIES.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.label}
                </option>
              ))}
            </select>
          </label>
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
          <label className="block">
            <span className="text-xs font-medium text-gray-600">I want to receive after fees</span>
            <input
              type="number"
              min={0}
              step="1"
              value={targetNetRaw}
              onChange={(event) => setTargetNetRaw(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600">International card share (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              step="1"
              value={intlShareRaw}
              onChange={(event) => setIntlShareRaw(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <p className="text-xs leading-relaxed text-gray-500">
            ~{estimate.chargeCount.toLocaleString("en-US")} charges/month. Smaller averages make the
            fixed fee matter more; international share adds ~{(estimate.profile.crossBorderPercent * 100).toFixed(1)}% uplift on that volume.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Your likely all-in rate
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
            {estimate.monthlyVolume > 0
              ? `${formatRate(estimate.lowRate)}–${formatRate(estimate.highRate)}`
              : "—"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Directional range for {estimate.profile.label}: domestic card pricing, international
            uplift, and a small buffer for refunds / add-ons.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">
                Published {domesticPct}% + {fixedFee}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {estimate.monthlyVolume > 0 ? formatMoney(estimate.publishedFee) : "-"}
                <span className="ml-1 text-xs font-medium text-gray-400">/mo</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Effective: {(estimate.publishedRate * 100).toFixed(2)}%
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 px-3 py-3">
              <p className="text-xs text-blue-700">At mid of your range</p>
              <p className="text-lg font-bold text-blue-950">
                {estimate.monthlyVolume > 0 ? formatMoney(estimate.midFee) : "-"}
                <span className="ml-1 text-xs font-medium text-blue-700/70">/mo</span>
              </p>
              <p className="mt-0.5 text-xs text-blue-700">
                {estimate.gapVsPublished > 0
                  ? `${formatMoney(estimate.gapVsPublished)} above published`
                  : "Close to published mix"}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
            <p className="text-xs text-gray-500">
              To receive {formatMoney(estimate.targetNet, estimate.profile.currency)} on one domestic charge
            </p>
            <p className="mt-0.5 text-lg font-bold text-gray-900">
              Ask for {estimate.targetNet > 0 ? formatMoney(estimate.reverseGross, estimate.profile.currency) : "-"}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Stripe fee about {estimate.targetNet > 0 ? formatMoney(estimate.reverseFee, estimate.profile.currency) : "-"}
              {estimate.targetNet > 0 ? ` (${formatRate(estimate.reverseEffectiveRate)})` : ""}
            </p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            {estimate.monthlyVolume > 0 && estimate.midRate > estimate.publishedRate
              ? `Your rough estimate (${formatRate(estimate.lowRate)}–${formatRate(estimate.highRate)}) sits above the headline domestic rate (${(estimate.publishedRate * 100).toFixed(2)}% effective on this mix). `
              : "This is only a published-pricing estimate. "}
            The exact gap depends on international cards, refunds, small charges, and other fee lines —
            not this form.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blue-200 bg-white px-4 py-4 sm:px-5">
        <p className="text-sm font-semibold text-gray-900">
          Confirm the real rate from your Balance CSV
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Upload to verify the gap — or open a sample report in ~10 seconds. Itemized{" "}
          <Link href="/stripe-balance-csv" className="text-blue-600 underline hover:text-blue-800">
            Balance CSV
          </Link>{" "}
          only.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/analyze?sample=1"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Try sample in 10s →
          </Link>
          <Link
            href="/analyze"
            className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            Upload my CSV →
          </Link>
        </div>
      </div>
    </section>
  );
}
