"use client";

import { useMemo, useState } from "react";
import {
  STRIPE_ACCOUNT_COUNTRIES,
  getCountryFeeProfile,
  type StripeAccountCountry,
} from "@/lib/stripe-country-fees";

const BILLING_RATE = 0.007;

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function percent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export function StripeTakeCalculator() {
  const [amountRaw, setAmountRaw] = useState("100");
  const [accountCountry, setAccountCountry] = useState<StripeAccountCountry>("US");
  const [isInternational, setIsInternational] = useState(false);
  const [hasFx, setHasFx] = useState(false);
  const [hasBilling, setHasBilling] = useState(false);

  const amount = useMemo(() => {
    const value = Number.parseFloat(amountRaw.replace(/,/g, "").trim());
    return Number.isFinite(value) && value > 0 ? value : 0;
  }, [amountRaw]);

  const profile = useMemo(() => getCountryFeeProfile(accountCountry), [accountCountry]);

  const rows = useMemo(() => {
    const base = amount * profile.domesticPercent + profile.domesticFixed;
    const international = isInternational ? amount * profile.crossBorderPercent : 0;
    const fx = hasFx ? amount * profile.currencyConversionPercent : 0;
    const billing = hasBilling ? amount * BILLING_RATE : 0;
    const total = base + international + fx + billing;
    const effectiveRate = amount > 0 ? total / amount : 0;

    return {
      base,
      international,
      fx,
      billing,
      total,
      effectiveRate,
    };
  }, [amount, hasBilling, hasFx, isInternational, profile]);

  const domesticPct = (profile.domesticPercent * 100).toFixed(2);
  const intlPct = (profile.crossBorderPercent * 100).toFixed(1);
  const fxPct = (profile.currencyConversionPercent * 100).toFixed(0);

  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Quick Stripe percentage calculator</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Estimate one card charge by account country, then compare it with your real blended rate
            from a Balance CSV.
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-left sm:min-w-[180px]">
          <p className="text-xs font-medium text-gray-500">Effective on this charge</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">
            {amount > 0 ? percent(rows.effectiveRate) : "-"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {amount > 0 ? money(rows.total, profile.currency) : "-"} total fee
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1.1fr]">
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
            <span className="text-xs font-medium text-gray-600">Charge amount (USD)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={amountRaw}
              onChange={(event) => setAmountRaw(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
            {[
              {
                checked: isInternational,
                label: "International card",
                onChange: setIsInternational,
                note: `+${intlPct}%`,
              },
              {
                checked: hasFx,
                label: "Currency conversion",
                onChange: setHasFx,
                note: `~+${fxPct}%`,
              },
              {
                checked: hasBilling,
                label: "Stripe Billing pay-as-you-go",
                onChange: setHasBilling,
                note: "~+0.7%",
              },
            ].map((item) => (
              <label key={item.label} className="flex items-start justify-between gap-3 text-sm">
                <span className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(event) => item.onChange(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{item.label}</span>
                </span>
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {item.note}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Fee breakdown</p>
          <div className="mt-3 space-y-2 text-sm">
            {[
              {
                label: `Base card fee (${domesticPct}% + ${money(profile.domesticFixed, profile.currency)})`,
                value: rows.base,
              },
              { label: "International card add-on", value: rows.international },
              { label: "Currency conversion", value: rows.fx },
              { label: "Stripe Billing add-on", value: rows.billing },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 text-gray-600">
                <span>{row.label}</span>
                <span className="font-mono text-gray-900">
                  {amount > 0 ? money(row.value, profile.currency) : "-"}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3 font-semibold text-gray-900">
              <span>Total estimated Stripe fee</span>
              <span className="font-mono">
                {amount > 0 ? money(rows.total, profile.currency) : "-"}
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            Rates reflect published {profile.label} card pricing. Your real Stripe percentage depends
            on the full mix of charges, refunds, disputes, other fee lines, and month-to-month customer
            mix.
          </p>
        </div>
      </div>
    </section>
  );
}
