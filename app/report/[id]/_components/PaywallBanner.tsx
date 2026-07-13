"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";
import { fmt$ } from "@/lib/format";

interface Props {
  reportId: string;
  email?: string;
  /** Directional annual savings from preview teaser (when available). */
  annualImpact?: number;
  firstOpportunity?: string;
}

export function PaywallBanner({ reportId, email, annualImpact, firstOpportunity }: Props) {
  const [open, setOpen] = useState(false);
  const hasImpact = annualImpact != null && annualImpact > 0;

  function unlock() {
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

  return (
    <>
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 text-center shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
          Full report · $12 one-time
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {hasImpact
            ? `Unlock why this could be worth ~${fmt$(annualImpact)}/yr`
            : "Unlock the decision-making details"}
        </h3>
        <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
          {hasImpact
            ? `Pay $12 once to see the rows, caveats, and actions behind${
                firstOpportunity ? ` “${firstOpportunity}”` : " this directional impact"
              }.`
            : "See every high-fee row, why it was flagged, what to check in Stripe, and which action is most likely to reduce fees."}
        </p>
        <div className="mb-4 grid gap-2 text-left text-xs text-gray-600 sm:grid-cols-2">
          {[
            "All high-fee charges",
            "Savings plan + caveats",
            "Monthly detail",
            "CSV + print export",
          ].map((item) => (
            <div key={item} className="rounded-lg bg-white/80 px-3 py-2">
              <span className="font-semibold text-blue-600">✓</span> {item}
            </div>
          ))}
        </div>
        <Button
          className="mx-auto h-11 w-full max-w-md rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          onClick={() => {
            trackEvent("funnel_checkout_redirect", {
              plan: "pro",
              placement: "inline_banner",
              has_annual_impact: hasImpact,
            });
            unlock();
          }}
        >
          {hasImpact
            ? `Unlock Full Report — $12 (check ~${fmt$(annualImpact)}/yr) →`
            : "Unlock Full Report — $12 →"}
        </Button>
        <p className="mt-3 text-xs text-gray-400">
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
                  Preview found directional impact up to ~{fmt$(annualImpact)}/yr
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
              onClick={() => {
                trackEvent("funnel_checkout_redirect", {
                  plan: "pro",
                  placement: "modal",
                  has_annual_impact: hasImpact,
                });
                unlock();
              }}
            >
              Continue to Secure Checkout →
            </button>
            <p className="text-xs text-center text-gray-400 mt-3">
              Processed by Polar · If payment succeeds but the report does not unlock, request a refund.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
