"use client";

import { trackEvent } from "@/lib/analytics";
import type { PaywallImpactSource } from "@/lib/paywall-impact";
import type { FreeDiagnosisKind } from "@/lib/free-diagnosis";

type UnlockPlacement = "inline_banner" | "modal" | "toolbar";

export function usePaywallCheckout(reportId: string, email?: string) {
  function emailGatePath(): "email" | "skip" | "unknown" {
    try {
      const raw = sessionStorage.getItem(`feeauditor_email_gate_${reportId}`);
      if (raw === "email" || raw === "skip") return raw;
    } catch {
      /* ignore */
    }
    return "unknown";
  }

  function unlock(input: {
    placement: UnlockPlacement;
    hasImpact?: boolean;
    impactSource?: PaywallImpactSource;
    diagnosisKind?: FreeDiagnosisKind | "none";
  }) {
    trackEvent("funnel_checkout_redirect", {
      plan: "pro",
      placement: input.placement,
      has_annual_impact: Boolean(input.hasImpact),
      impact_source: input.impactSource ?? "none",
      diagnosis_driver: input.diagnosisKind ?? "none",
      email_gate: emailGatePath(),
    });
    const params = new URLSearchParams({ plan: "pro", reportId });
    if (email) params.set("email", email);
    window.location.href = `/api/checkout?${params}`;
  }

  return { unlock, emailGatePath };
}
