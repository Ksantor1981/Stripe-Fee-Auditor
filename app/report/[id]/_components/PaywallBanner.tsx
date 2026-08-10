"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChromeExtensionInstallCta } from "@/components/ChromeExtensionInstallCta";
import { trackEvent } from "@/lib/analytics";
import { fmt$ } from "@/lib/format";
import type { PaywallImpactSource } from "@/lib/paywall-impact";
import type { FreeDiagnosis } from "@/lib/free-diagnosis";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

interface Props {
  reportId: string;
  email?: string;
  annualImpact?: number;
  impactSource?: PaywallImpactSource;
  firstOpportunity?: string;
  diagnosis?: FreeDiagnosis;
}

export function PaywallBanner({
  reportId,
  email,
  annualImpact,
  impactSource,
  firstOpportunity,
  diagnosis,
}: Props) {
  const { t } = useReportTranslations();
  const [open, setOpen] = useState(false);
  const hasImpact = annualImpact != null && annualImpact > 0;

  function emailGatePath(): "email" | "skip" | "unknown" {
    try {
      const raw = sessionStorage.getItem(`feeauditor_email_gate_${reportId}`);
      if (raw === "email" || raw === "skip") return raw;
    } catch {
      /* ignore */
    }
    return "unknown";
  }

  function unlock(placement: "inline_banner" | "modal") {
    const gate = emailGatePath();
    trackEvent("funnel_checkout_redirect", {
      plan: "pro",
      placement,
      has_annual_impact: hasImpact,
      impact_source: impactSource ?? "none",
      diagnosis_driver: diagnosis?.kind ?? "none",
      email_gate: gate,
    });
    const params = new URLSearchParams({ plan: "pro", reportId });
    if (email) params.set("email", email);
    window.location.href = `/api/checkout?${params}`;
  }

  const included = [
    t("paywallBanner.includedUnusualCharges"),
    t("paywallBanner.includedSavings"),
    t("paywallBanner.includedMonthly"),
    t("paywallBanner.includedExport"),
    t("paywallBanner.includedLink"),
  ];

  const notIncluded = [
    t("paywallBanner.notIncludedOAuth"),
    t("paywallBanner.notIncludedAdvice"),
  ];

  const title = diagnosis
    ? t("paywallBanner.titleDiagnosis")
    : hasImpact
      ? impactSource === "fee_runrate"
        ? t("paywallBanner.titleFeeRunrate", { amount: fmt$(annualImpact!) })
        : t("paywallBanner.titleSavings", { amount: fmt$(annualImpact!) })
      : t("paywallBanner.titleDefault");

  const body = diagnosis
    ? t("paywallBanner.bodyDiagnosis", { diagnosis: diagnosis.title.toLowerCase() })
    : hasImpact
      ? impactSource === "fee_runrate"
        ? t("paywallBanner.bodyFeeRunrate", { amount: fmt$(annualImpact!) })
        : firstOpportunity
          ? t("paywallBanner.bodySavings", { opportunity: firstOpportunity })
          : t("paywallBanner.bodySavingsGeneric")
      : t("paywallBanner.bodyDefault");

  const cta = diagnosis
    ? t("paywallBanner.ctaDiagnosis")
    : hasImpact
      ? t("paywallBanner.ctaSavings", { amount: fmt$(annualImpact!) })
      : t("paywallBanner.ctaDefault");

  return (
    <>
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 text-center shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
          {t("paywallBanner.badge")}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">{body}</p>
        <Button
          className="mx-auto h-11 w-full max-w-md rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          onClick={() => unlock("inline_banner")}
        >
          {cta}
        </Button>
        <p className="mt-3 text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
          {t("paywallBanner.checkoutNote")}
        </p>
        <p className="mt-2 text-xs text-gray-400">
          {t("paywallBanner.footerNote")}{" "}
          <button
            type="button"
            className="underline hover:text-gray-600"
            onClick={() => {
              trackEvent("funnel_paywall_modal_open");
              setOpen(true);
            }}
          >
            {t("paywallBanner.whatsIncluded")}
          </button>
        </p>
        <p className="mt-2 text-xs text-gray-500">
          {t("paywallBanner.monitorUpsell")}{" "}
          <a href="/monitor" className="font-medium text-blue-600 hover:underline">
            {t("paywallBanner.monitorLink")}
          </a>
          {t("paywallBanner.monitorSuffix")}
        </p>
        <ChromeExtensionInstallCta placement="paywall_banner" variant="quiet" className="mt-3" />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-md p-0 overflow-hidden"
          closeButtonClassName="z-10 text-white hover:bg-white/15 hover:text-white"
        >
          <div className="bg-gray-900 px-6 py-5">
            <h2 className="text-lg font-bold text-white">{t("paywallBanner.modalTitle")}</h2>
            <p className="text-sm text-gray-400 mt-1">{t("paywallBanner.modalSubtitle")}</p>
          </div>
          <div className="p-5">
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-700">{t("paywallBanner.planName")}</span>
                <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">$12</span>
              </div>
              {hasImpact && (
                <p className="mb-3 text-xs leading-relaxed text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  {t("paywallBanner.previewPointsTo", {
                    amount: fmt$(annualImpact!),
                    opportunity: firstOpportunity ? ` (${firstOpportunity})` : "",
                  })}
                </p>
              )}
              <p className="mb-3 text-xs leading-relaxed text-blue-900/80">
                {t("paywallBanner.modalBody")}
              </p>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-700">
                {t("paywallBanner.includedHeading")}
              </p>
              <ul className="space-y-1">
                {included.map((f) => (
                  <li key={f} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <span className="text-blue-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                {t("paywallBanner.notIncludedHeading")}
              </p>
              <ul className="space-y-1">
                {notIncluded.map((f) => (
                  <li key={f} className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="text-gray-300">•</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="h-11 w-full rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              onClick={() => unlock("modal")}
            >
              {hasImpact
                ? t("paywallBanner.continueUnlock", { amount: fmt$(annualImpact!) })
                : t("paywallBanner.continueCheckout")}
            </button>
            <p className="text-xs text-center text-gray-500 mt-3 leading-relaxed">
              {t("paywallBanner.modalCheckoutNote")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
