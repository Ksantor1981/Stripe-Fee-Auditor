"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FunnelAnchor } from "@/components/FunnelAnchor";

const SCENARIO_IDS = ["typical", "intl", "micro"] as const;
type ScenarioId = (typeof SCENARIO_IDS)[number];

const STAT_KEYS: Record<ScenarioId, readonly string[]> = {
  typical: ["volume4mo", "processingRate", "allInCost", "directionalOpportunity"],
  intl: ["stripeFeesQuarter", "processingRate", "allInCost", "extraVsHeadline"],
  micro: ["avgChargeSize", "processingRate", "allInCost", "highFeeRows"],
};

const REPORT_IMG = {
  webp1x: "/screenshots/report-preview.webp",
  webp2x: "/screenshots/report-preview@2x.webp",
  png1x: "/screenshots/report-preview.png",
  png2x: "/screenshots/report-preview@2x.png",
};

/** Mobile: always 1x (~32 KiB). Desktop: width srcset caps at 1024px container. */
const REPORT_IMG_SIZES = "(max-width: 768px) calc(100vw - 3rem), 1024px";

const CASE_STUDY_HREF = "/blog/how-i-found-1400-in-hidden-stripe-fees";

export function LandingSampleTabs() {
  const t = useTranslations("landingSampleTabs");
  const [activeId, setActiveId] = useState<ScenarioId>("typical");

  const scenarios = useMemo(
    () =>
      SCENARIO_IDS.map((id) => ({
        id,
        label: t(`scenarios.${id}.label`),
        blurb: t(`scenarios.${id}.blurb`),
        imageAlt: t(`scenarios.${id}.imageAlt`),
        stats: STAT_KEYS[id].map((key) => ({
          key,
          label: t(`scenarios.${id}.stats.${key}.label`),
          value: t(`scenarios.${id}.stats.${key}.value`),
        })),
      })),
    [t]
  );

  const active = scenarios.find((s) => s.id === activeId) ?? scenarios[0];

  return (
    <div>
      <div
        className="mx-auto flex max-w-xl flex-wrap justify-center gap-2"
        role="tablist"
        aria-label={t("tablistAria")}
      >
        {scenarios.map((scenario) => {
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
          {active.stats.map(({ key, label, value }) => (
            <div key={key}>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">{value}</p>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <picture>
            <source
              media="(max-width: 768px)"
              type="image/webp"
              srcSet={REPORT_IMG.webp1x}
            />
            <source
              type="image/webp"
              srcSet={`${REPORT_IMG.webp1x} 1024w, ${REPORT_IMG.webp2x} 2048w`}
              sizes={REPORT_IMG_SIZES}
            />
            <source media="(max-width: 768px)" srcSet={REPORT_IMG.png1x} />
            <img
              src={REPORT_IMG.png1x}
              srcSet={`${REPORT_IMG.png1x} 1024w, ${REPORT_IMG.png2x} 2048w`}
              sizes={REPORT_IMG_SIZES}
              alt={active.imageAlt}
              width={1024}
              height={616}
              loading="lazy"
              decoding="async"
              className="mx-auto block h-auto w-full max-w-[1024px]"
            />
          </picture>
        </div>

        <p className="mt-3 text-center text-xs text-gray-500">{t("footnote")}</p>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <FunnelAnchor
            href="/analyze?sample=1"
            utm={{ source: "landing", medium: "cta", campaign: "sample_tabs_interactive" }}
            funnelEvent="funnel_sample_cta"
            funnelProps={{ placement: "sample_tabs", scenario: active.id }}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
          >
            {t("openSampleCta")}
          </FunnelAnchor>
          {active.id === "typical" ? (
            <Link
              href={CASE_STUDY_HREF}
              className="text-sm font-medium text-blue-700 underline hover:text-blue-800"
            >
              {t("caseStudyLink")}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
