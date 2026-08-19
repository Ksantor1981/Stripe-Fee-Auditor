"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  STRIPE_ACCOUNT_COUNTRIES,
  estimateCountryStripeFee,
  type StripeAccountCountry,
} from "@/lib/stripe-country-fees";

function parseUsd(raw: string) {
  const value = Number.parseFloat(raw.replace(/,/g, "").trim());
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function parsePct(raw: string) {
  const value = Number.parseFloat(raw.replace(/%/g, "").trim());
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function formatMoney(value: number, locale: string, currency = "USD") {
  return new Intl.NumberFormat(locale, {
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
  const t = useTranslations("feeCalculatorWidget");
  const locale = useLocale();
  const [volumeRaw, setVolumeRaw] = useState("50000");
  const [averageChargeRaw, setAverageChargeRaw] = useState("50");
  const [intlShareRaw, setIntlShareRaw] = useState("15");
  const [fxShareRaw, setFxShareRaw] = useState("5");
  const [targetNetRaw, setTargetNetRaw] = useState("100");
  const [accountCountry, setAccountCountry] = useState<StripeAccountCountry>("US");

  const estimate = useMemo(() => {
    const monthlyVolume = parseUsd(volumeRaw);
    const averageCharge = Math.max(parseUsd(averageChargeRaw), 0.01);
    const intlShare = parsePct(intlShareRaw) / 100;
    const fxShare = parsePct(fxShareRaw) / 100;
    const targetNet = Math.max(parseUsd(targetNetRaw), 0);
    const chargeCount = monthlyVolume > 0 ? Math.max(1, Math.round(monthlyVolume / averageCharge)) : 0;
    const countryEstimate = estimateCountryStripeFee({
      amount: monthlyVolume,
      accountCountry,
      internationalShare: intlShare,
      fxShare,
      chargeCount,
    });
    const profile = countryEstimate.profile;
    const publishedFee =
      monthlyVolume > 0
        ? monthlyVolume * profile.domesticPercent + chargeCount * profile.domesticFixed
        : 0;
    const publishedRate = monthlyVolume > 0 ? publishedFee / monthlyVolume : 0;
    const estimatedRate = countryEstimate.effectiveRate;
    const estimatedFee = countryEstimate.estimatedFee;
    const gapVsPublished = Math.max(0, estimatedFee - publishedFee);
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
      fxShare,
      targetNet,
      profile,
      publishedFee,
      publishedRate,
      estimatedRate,
      estimatedFee,
      gapVsPublished,
      reverseGross,
      reverseFee,
      reverseEffectiveRate,
    };
  }, [accountCountry, averageChargeRaw, fxShareRaw, intlShareRaw, targetNetRaw, volumeRaw]);

  const shellClass = compact
    ? "rounded-2xl border border-blue-100 bg-blue-50/40 p-5 sm:p-6"
    : "mb-14 rounded-2xl border border-blue-100 bg-blue-50/40 p-6";

  const domesticPct = (estimate.profile.domesticPercent * 100).toFixed(2);
  const fixedFee = formatMoney(estimate.profile.domesticFixed, locale, estimate.profile.currency);
  const money = (value: number) => formatMoney(value, locale, estimate.profile.currency);

  return (
    <section className={shellClass} id="instant-estimate">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{t("title")}</h2>
      <p className="text-sm text-gray-500 mb-5">{t("intro")}</p>

      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-gray-600">{t("accountCountry")}</span>
            <select
              value={accountCountry}
              onChange={(event) => setAccountCountry(event.target.value as StripeAccountCountry)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {STRIPE_ACCOUNT_COUNTRIES.map((country) => (
                <option key={country.id} value={country.id}>
                  {t(`country.${country.id}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600">{t("monthlyVolume")}</span>
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
            <span className="text-xs font-medium text-gray-600">{t("averageCharge")}</span>
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
            <span className="text-xs font-medium text-gray-600">{t("targetNet")}</span>
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
            <span className="text-xs font-medium text-gray-600">{t("intlShare")}</span>
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
          <label className="block">
            <span className="text-xs font-medium text-gray-600">{t("fxShare")}</span>
            <input
              type="number"
              min={0}
              max={100}
              step="1"
              value={fxShareRaw}
              onChange={(event) => setFxShareRaw(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <p className="text-xs leading-relaxed text-gray-500">
            {t("chargesHint", {
              count: estimate.chargeCount.toLocaleString(locale),
              uplift: (estimate.profile.crossBorderPercent * 100).toFixed(1),
            })}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {t("estimatedRate")}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
            {estimate.monthlyVolume > 0 ? formatRate(estimate.estimatedRate) : "—"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {t("publishedEstimateFor", { country: t(`country.${estimate.profile.id}`) })}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">
                {t("publishedRate", { percent: domesticPct, fixedFee })}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {estimate.monthlyVolume > 0 ? money(estimate.publishedFee) : "-"}
                <span className="ml-1 text-xs font-medium text-gray-400">{t("perMonth")}</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {t("effective", { rate: (estimate.publishedRate * 100).toFixed(2) })}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 px-3 py-3">
              <p className="text-xs text-blue-700">{t("estimatedFees")}</p>
              <p className="text-lg font-bold text-blue-950">
                {estimate.monthlyVolume > 0 ? money(estimate.estimatedFee) : "-"}
                <span className="ml-1 text-xs font-medium text-blue-700/70">{t("perMonth")}</span>
              </p>
              <p className="mt-0.5 text-xs text-blue-700">
                {estimate.gapVsPublished > 0
                  ? t("abovePublished", { amount: money(estimate.gapVsPublished) })
                  : t("closeToPublished")}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
            <p className="text-xs text-gray-500">
              {t("toReceive", { amount: money(estimate.targetNet) })}
            </p>
            <p className="mt-0.5 text-lg font-bold text-gray-900">
              {t("askFor", { amount: estimate.targetNet > 0 ? money(estimate.reverseGross) : "-" })}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {t("stripeFeeAbout", {
                amount: estimate.targetNet > 0 ? money(estimate.reverseFee) : "-",
                rate: estimate.targetNet > 0 ? ` (${formatRate(estimate.reverseEffectiveRate)})` : "",
              })}
            </p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            {estimate.monthlyVolume > 0 && estimate.estimatedRate > estimate.publishedRate
              ? t("aboveDomestic", {
                  estimated: formatRate(estimate.estimatedRate),
                  published: (estimate.publishedRate * 100).toFixed(2),
                })
              : t("publishedOnly")}
            {t("exclusions")}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            {t.rich("ratesChecked", {
              stripePricing: (chunks) => (
                <a
                  href="https://stripe.com/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blue-200 bg-white px-4 py-4 sm:px-5">
        <p className="text-sm font-semibold text-gray-900">{t("confirmTitle")}</p>
        <p className="mt-1 text-sm text-gray-500">
          {t.rich("confirmBody", {
            csvLink: (chunks) => (
              <Link href="/stripe-balance-csv" className="text-blue-600 underline hover:text-blue-800">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/analyze?sample=1"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            {t("sampleCta")}
          </Link>
          <Link
            href="/analyze"
            className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            {t("uploadCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
