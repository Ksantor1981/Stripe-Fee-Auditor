"use client";

import Link from "next/link";
import { useState } from "react";
import { FunnelAnchor } from "@/components/FunnelAnchor";

type Stat = { label: string; value: string };

type SampleScenario = {
  id: string;
  label: string;
  blurb: string;
  stats: Stat[];
  imageAlt: string;
};

/** Illustrative scenarios — same report UI; stats match published case study / docs. */
const SCENARIOS: SampleScenario[] = [
  {
    id: "typical",
    label: "Typical SaaS",
    blurb: "Real export pattern: mixed US + some international — close to what many founders see.",
    stats: [
      { label: "Volume (4 mo)", value: "$89,490" },
      { label: "Processing rate", value: "3.82%" },
      { label: "All-in cost", value: "4.02%" },
      { label: "Directional opportunity", value: "~$1,400/yr" },
    ],
    imageAlt:
      "Fee Auditor report UI: effective rate, fee drivers, high-fee charges — typical SaaS mix around 4% all-in",
  },
  {
    id: "intl",
    label: "High international",
    blurb: "Heavy cross-border card mix — shows intl uplift and refund drag clearly (edge case).",
    stats: [
      { label: "Stripe fees (quarter)", value: "$498.76" },
      { label: "Processing rate", value: "6.33%" },
      { label: "All-in cost", value: "6.67%" },
      { label: "Extra vs 2.9% headline", value: "~$270/qtr" },
    ],
    imageAlt:
      "Fee Auditor report UI with elevated all-in rate from international card mix and refund fee leakage",
  },
  {
    id: "micro",
    label: "Micro-transactions",
    blurb: "Low-ticket subscriptions — fixed $0.30 fee dominates; effective rate spikes on small charges.",
    stats: [
      { label: "Avg charge size", value: "~$12" },
      { label: "Processing rate", value: "8.4%" },
      { label: "All-in cost", value: "8.9%" },
      { label: "High-fee rows flagged", value: "847" },
    ],
    imageAlt:
      "Fee Auditor report UI highlighting small-ticket Stripe charges where fixed fees push effective rate above 8%",
  },
];

const REPORT_IMG = {
  webp1x: "/screenshots/report-preview.webp",
  webp2x: "/screenshots/report-preview@2x.webp",
  png1x: "/screenshots/report-preview.png",
  png2x: "/screenshots/report-preview@2x.png",
};

export function LandingSampleTabs() {
  const [activeId, setActiveId] = useState(SCENARIOS[0].id);
  const active = SCENARIOS.find((s) => s.id === activeId) ?? SCENARIOS[0];

  return (
    <div>
      <div
        className="mx-auto flex max-w-xl flex-wrap justify-center gap-2"
        role="tablist"
        aria-label="Sample report scenarios"
      >
        {SCENARIOS.map((scenario) => {
          const selected = scenario.id === activeId;
          return (
            <button
              key={scenario.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`sample-panel-${scenario.id}`}
              id={`sample-tab-${scenario.id}`}
              onClick={() => setActiveId(scenario.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-blue-200 hover:text-blue-700"
              }`}
            >
              {scenario.label}
            </button>
          );
        })}
      </div>

      <div
        id={`sample-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`sample-tab-${active.id}`}
        className="mt-6"
      >
        <p className="text-center text-sm text-gray-600 max-w-2xl mx-auto">{active.blurb}</p>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-center sm:flex sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-3">
          {active.stats.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{value}</p>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <picture>
            <source
              type="image/webp"
              srcSet={`${REPORT_IMG.webp1x} 1x, ${REPORT_IMG.webp2x} 2x`}
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
            <img
              src={REPORT_IMG.png1x}
              srcSet={`${REPORT_IMG.png1x} 1x, ${REPORT_IMG.png2x} 2x`}
              sizes="(max-width: 1024px) 100vw, 1024px"
              alt={active.imageAlt}
              width={1024}
              height={616}
              loading="lazy"
              decoding="async"
              className="mx-auto block h-auto w-full max-w-[1024px]"
            />
          </picture>
        </div>

        <p className="mt-3 text-center text-xs text-gray-500">
          Same report UI — stats above match each scenario.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <FunnelAnchor
            href="/analyze?sample=1"
            utm={{ source: "landing", medium: "cta", campaign: "sample_tabs_interactive" }}
            funnelEvent="funnel_sample_cta"
            funnelProps={{ placement: "sample_tabs", scenario: active.id }}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
          >
            Open live sample report →
          </FunnelAnchor>
          {active.id === "typical" ? (
            <Link
              href="/blog/how-i-found-1400-in-hidden-stripe-fees"
              className="text-sm font-medium text-blue-700 underline hover:text-blue-800"
            >
              Read the $1,400/yr case study
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
