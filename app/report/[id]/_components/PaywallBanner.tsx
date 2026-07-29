"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";
import { fmt$ } from "@/lib/format";
import type { PaywallImpactSource } from "@/lib/paywall-impact";
import type { FreeDiagnosis } from "@/lib/free-diagnosis";

interface Props {
  reportId: string;
  email?: string;
  /** Directional annual $ figure (savings, rate gap, or fee run-rate). */
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
    "Full unusual-charge list with explanations",
    "Savings opportunities with step-by-step actions",
    "Monthly volume, fees, charge count, and trends",
    "CSV export and print-ready report",
    "Private report link for 30 days",
  ];

  const notIncluded = [
    "No Stripe OAuth or API connection",
    "No tax, accounting, or contractual fee advice",
  ];

  const title = diagnosis
    ? "We found the problem. See every affected row."
    : hasImpact
    ? impactSource === "fee_runrate"
      ? `Unlock the drivers behind ~${fmt$(annualImpact)}/yr in fees`
      : `Unlock why this could be worth ~${fmt$(annualImpact)}/yr`
    : "Unlock why your rate looks the way it does";

  const body = diagnosis
    ? `Your free diagnosis points to ${diagnosis.title.toLowerCase()}. Pay $12 once for every affected row, the caveats, and the next checks in Stripe.`
    : hasImpact
    ? impactSource === "fee_runrate"
      ? `Pay $12 once to see high-fee rows, caveats, and actions behind ~${fmt$(annualImpact)}/yr at this rate.`
      : `Pay $12 once to see the rows, caveats, and actions behind${
          firstOpportunity ? ` “${firstOpportunity}”` : " this directional impact"
        }.`
    : "Pay $12 once for every high-fee row, why it was flagged, and which Stripe checks are most likely to reduce fees.";

  const cta = diagnosis
    ? "Unlock the full investigation — $12 →"
    : hasImpact
    ? `Unlock ~${fmt$(annualImpact)}/yr insight — $12 →`
    : "Unlock Full Report — $12 →";

  return (
    <>
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 text-center shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
          Full report · $12 one-time
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
          You&apos;ll leave feeauditor.com briefly for{" "}
          <strong className="font-semibold text-gray-700">secure checkout powered by Polar</strong>. We
          never connect to your Stripe account (no OAuth).
        </p>
        <p className="mt-2 text-xs text-gray-400">
          One-time · 30-day private link · Refund available if access fails ·{" "}
          <button
            type="button"
            className="underline hover:text-gray-600"
            onClick={() => {
              trackEvent("funnel_paywall_modal_open");
              setOpen(true);
            }}
          >
            What&apos;s included?
          </button>
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Prefer a monthly habit?{" "}
          <a href="/monitor" className="font-medium text-blue-600 hover:underline">
            Fee Monitor is $9/mo
          </a>
          {" "}— reminders + rate drift checks after this audit.
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-md p-0 overflow-hidden"
          closeButtonClassName="z-10 text-white hover:bg-white/15 hover:text-white"
        >
          <div className="bg-gray-900 px-6 py-5">
            <h2 className="text-lg font-bold text-white">Get Full Report</h2>
            <p className="text-sm text-gray-400 mt-1">
              $12 once. Open this report for 30 days.
            </p>
          </div>
          <div className="p-5">
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-700">Full Report</span>
                <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">$12</span>
              </div>
              {hasImpact && (
                <p className="mb-3 text-xs leading-relaxed text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  Preview points to ~{fmt$(annualImpact)}/yr
                  {firstOpportunity ? ` (${firstOpportunity})` : ""}. Unlock shows rows, caveats, and actions.
                </p>
              )}
              <p className="mb-3 text-xs leading-relaxed text-blue-900/80">
                The preview already showed your headline rate and top drivers. Unlock adds the rows,
                explanations, savings actions, exports, and monthly detail.
              </p>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-700">
                Included
              </p>
              <ul className="space-y-1">
                {included.map((f) => (
                  <li key={f} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <span className="text-blue-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Not included
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
              {hasImpact ? `Continue — unlock ~${fmt$(annualImpact)}/yr insight →` : "Continue to Secure Checkout →"}
            </button>
            <p className="text-xs text-center text-gray-500 mt-3 leading-relaxed">
              Next step: <strong className="font-semibold text-gray-700">secure checkout powered by Polar</strong>.
              No Stripe OAuth to your account. If payment succeeds but the report does not unlock, request a
              refund.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
