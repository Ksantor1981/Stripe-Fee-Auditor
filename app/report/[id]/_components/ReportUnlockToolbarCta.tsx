"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

import { useFmtMoney } from "@/lib/report-currency";
import type { PaywallImpactSource } from "@/lib/paywall-impact";
import type { FreeDiagnosis } from "@/lib/free-diagnosis";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";
import { usePaywallCheckout } from "@/lib/i18n/use-paywall-checkout";
import { FULL_REPORTS_FREE } from "@/lib/beta-access";
import { PaywallDetailsModal } from "./PaywallDetailsModal";

interface Props {
  reportId: string;
  email?: string;
  annualImpact?: number;
  impactSource?: PaywallImpactSource;
  firstOpportunity?: string;
  diagnosis?: FreeDiagnosis;
  disabled?: boolean;
}

export function ReportUnlockToolbarCta({
  reportId,
  email,
  annualImpact,
  impactSource,
  firstOpportunity,
  diagnosis,
  disabled = false,
}: Props) {
  const fmt$ = useFmtMoney();
  const { t } = useReportTranslations();
  const { unlock } = usePaywallCheckout(reportId, email);
  const [modalOpen, setModalOpen] = useState(false);
  const hasImpact = annualImpact != null && annualImpact > 0;
  if (FULL_REPORTS_FREE) return null;

  function goCheckout(placement: "toolbar" | "modal") {
    unlock({
      placement,
      hasImpact,
      impactSource,
      diagnosisKind: diagnosis?.kind ?? "none",
    });
  }

  const ctaLabel = hasImpact
    ? t("reportShell.unlockToolbarCtaImpact", { amount: fmt$(annualImpact!) })
    : t("reportShell.unlockToolbarCta");

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => goCheckout("toolbar")}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {ctaLabel}
        </button>
        <button
          type="button"
          className="text-xs font-medium text-blue-600 hover:underline"
          onClick={() => {
            trackEvent("funnel_paywall_modal_open", { placement: "toolbar" });
            setModalOpen(true);
          }}
        >
          {t("reportShell.unlockToolbarDetails")}
        </button>
      </div>

      <PaywallDetailsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        annualImpact={annualImpact}
        firstOpportunity={firstOpportunity}
        onCheckout={() => goCheckout("modal")}
      />
    </>
  );
}
