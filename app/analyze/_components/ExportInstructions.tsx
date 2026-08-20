"use client";

import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

const STEPS = [
  {
    num: "1" as const,
    screenshot: "/screenshots/stripe-step1-reports.png",
    screenshotH: 420,
  },
  {
    num: "2" as const,
    screenshot: "/screenshots/stripe-step2-balance.png",
    screenshotH: 380,
  },
  {
    num: "3" as const,
    screenshot: "/screenshots/stripe-step3-export.png",
    screenshotH: 340,
  },
];

const richStrong = {
  strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
};

/** Export guide below the upload zone — collapsed by default so cold traffic isn't scared away. */
export function ExportInstructions() {
  const t = useTranslations("analyze");

  return (
    <div id="export-steps" className="scroll-mt-6 space-y-4">
      <details className="group rounded-xl border border-gray-200 bg-white shadow-sm open:shadow-md">
        <summary className="cursor-pointer list-none px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                {t("exportEyebrow")}
              </p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">{t("exportTitle")}</h2>
              <p className="mt-1 text-sm text-gray-500">{t("exportIntro")}</p>
            </div>
            <span className="shrink-0 text-sm font-medium text-blue-600 group-open:hidden">
              {t("exportShowSteps")}
            </span>
            <span className="hidden shrink-0 text-sm font-medium text-blue-600 group-open:inline">
              {t("exportHide")}
            </span>
          </div>
        </summary>

        <div className="space-y-4 border-t border-gray-100 px-5 py-5">
          <div className="flex flex-wrap gap-3">
            <a
              href="#upload-csv"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              onClick={() =>
                trackEvent("funnel_export_instructions_done", { placement: "scroll_to_upload" })
              }
            >
              {t("exportJumpUpload")}
            </a>
            <a
              href="/analyze?sample=1"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              onClick={() => trackEvent("funnel_sample_cta", { placement: "export_instructions" })}
            >
              {t("exportTrySample")}
            </a>
          </div>
          <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            {t.rich("exportUsdNote", richStrong)}
          </p>

          <div className="space-y-4">
            {STEPS.map(({ num, screenshot, screenshotH }) => (
              <div
                key={num}
                className="flex gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {num}
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-gray-900">{t(`exportStep${num}Title`)}</h3>
                  <p className="text-sm text-gray-500">{t(`exportStep${num}Body`)}</p>
                  <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                    <Image
                      src={screenshot}
                      alt={t(`exportStep${num}Alt`)}
                      width={800}
                      height={screenshotH}
                      className="h-auto w-full"
                    />
                  </div>
                  <p className="mt-2 text-xs italic text-gray-400">{t(`exportStep${num}Hint`)}</p>
                </div>
              </div>
            ))}
          </div>

          <Accordion className="rounded-xl border border-gray-100 bg-white px-4 shadow-sm">
            <AccordionItem value="no-balance">
              <AccordionTrigger className="text-sm font-medium text-gray-700">
                {t("exportFaqNoBalanceQ")}
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pb-4 text-sm text-gray-500">
                <p>{t.rich("exportFaqNoBalanceA1", richStrong)}</p>
                <p>{t.rich("exportFaqNoBalanceA2", richStrong)}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="wrong-file">
              <AccordionTrigger className="text-sm font-medium text-gray-700">
                {t("exportFaqWrongFileQ")}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm text-gray-500">
                {t.rich("exportFaqWrongFileA", {
                  ...richStrong,
                  code: (chunks) => <code className="rounded bg-gray-100 px-1">{chunks}</code>,
                })}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="wrong-export" className="border-none">
              <AccordionTrigger className="text-sm font-medium text-gray-700">
                {t("exportFaqPaymentsQ")}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm text-gray-500">
                {t.rich("exportFaqPaymentsA", richStrong)}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="how-much-data" className="border-none">
              <AccordionTrigger className="text-sm font-medium text-gray-700">
                {t("exportFaqHowMuchQ")}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm text-gray-500">
                {t.rich("exportFaqHowMuchA", richStrong)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </details>
    </div>
  );
}
