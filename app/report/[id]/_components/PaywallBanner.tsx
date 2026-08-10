"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChromeExtensionInstallCta } from "@/components/ChromeExtensionInstallCta";
import { trackEvent } from "@/lib/analytics";
import { fmt$ } from "@/lib/format";
import type { PaywallImpactSource } from "@/lib/paywall-impact";
import type { FreeDiagnosis } from "@/lib/free-diagnosis";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";
import { usePaywallCheckout } from "@/lib/i18n/use-paywall-checkout";
import { useTranslatedDiagnosis } from "@/lib/i18n/report-insights";
import { PaywallDetailsModal } from "./PaywallDetailsModal";

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
  const { unlock } = usePaywallCheckout(reportId, email);
  const translatedDiagnosis = useTranslatedDiagnosis(diagnosis);
  const [open, setOpen] = useState(false);
  const hasImpact = annualImpact != null && annualImpact > 0;
  const diagnosisTitle = translatedDiagnosis?.title ?? diagnosis?.title;

  function goCheckout(placement: "inline_banner" | "modal") {
    unlock({
      placement,
      hasImpact,
      impactSource,
      diagnosisKind: diagnosis?.kind ?? "none",
    });
  }

  const title = diagnosis
    ? t("paywallBanner.titleDiagnosis")
    : hasImpact
      ? impactSource === "fee_runrate"
        ? t("paywallBanner.titleFeeRunrate", { amount: fmt$(annualImpact!) })
        : t("paywallBanner.titleSavings", { amount: fmt$(annualImpact!) })
      : t("paywallBanner.titleDefault");

  const body = diagnosis
    ? t("paywallBanner.bodyDiagnosis", { diagnosis: (diagnosisTitle ?? "").toLowerCase() })
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
          onClick={() => goCheckout("inline_banner")}
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
              trackEvent("funnel_paywall_modal_open", { placement: "inline_banner" });
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

      <PaywallDetailsModal
        open={open}
        onOpenChange={setOpen}
        annualImpact={annualImpact}
        firstOpportunity={firstOpportunity}
        onCheckout={() => goCheckout("modal")}
      />
    </>
  );
}
