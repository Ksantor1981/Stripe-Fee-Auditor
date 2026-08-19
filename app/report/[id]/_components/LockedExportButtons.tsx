"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { PaywallImpactSource } from "@/lib/paywall-impact";
import type { FreeDiagnosis } from "@/lib/free-diagnosis";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";
import { FULL_REPORTS_FREE } from "@/lib/beta-access";
import { usePaywallCheckout } from "@/lib/i18n/use-paywall-checkout";
import { PaywallDetailsModal } from "./PaywallDetailsModal";

interface Props {
  reportId: string;
  email?: string;
  annualImpact?: number;
  impactSource?: PaywallImpactSource;
  firstOpportunity?: string;
  diagnosis?: FreeDiagnosis;
  /** Sample reports expose print/PDF; hide the locked PDF affordance. */
  hidePdf?: boolean;
}

export function LockedExportButtons({
  reportId,
  email,
  annualImpact,
  impactSource,
  firstOpportunity,
  diagnosis,
  hidePdf = false,
}: Props) {
  const { tc } = useReportTranslations();
  const { unlock } = usePaywallCheckout(reportId, email);
  const [open, setOpen] = useState(false);
  if (FULL_REPORTS_FREE) return null;

  function showDetails(format: "csv" | "pdf") {
    trackEvent("funnel_paywall_modal_open", { placement: "locked_export_" + format });
    setOpen(true);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => showDetails("csv")}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-950"
        >
          🔒 {tc("exportCsv")}
        </button>
        {!hidePdf ? (
          <button
            type="button"
            onClick={() => showDetails("pdf")}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-950"
          >
            🔒 {tc("exportPrintPdf")}
          </button>
        ) : null}
      </div>
      <PaywallDetailsModal
        open={open}
        onOpenChange={setOpen}
        annualImpact={annualImpact}
        firstOpportunity={firstOpportunity}
        onCheckout={() =>
          unlock({
            placement: "modal",
            hasImpact: annualImpact != null && annualImpact > 0,
            impactSource,
            diagnosisKind: diagnosis?.kind ?? "none",
          })
        }
      />
    </>
  );
}
