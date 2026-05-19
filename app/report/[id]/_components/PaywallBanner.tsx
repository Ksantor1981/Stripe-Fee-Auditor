"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";

interface Props {
  reportId: string;
  accessToken: string;
  email?: string;
}

export function PaywallBanner({ reportId, accessToken, email }: Props) {
  const [open, setOpen] = useState(false);

  function unlock() {
    trackEvent("funnel_checkout_redirect", { plan: "pro" });
    const params = new URLSearchParams({ plan: "pro", reportId, token: accessToken });
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
      {/* Inline banner */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
          Full report · $12 one-time
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Unlock the decision-making details</h3>
        <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
          See every high-fee row, why it was flagged, what to check in Stripe, and which action is most likely to reduce fees.
        </p>
        <div className="mb-4 grid gap-2 text-left text-xs text-gray-600 sm:grid-cols-2">
          {[
            "All unusual charges",
            "Savings plan",
            "Monthly detail",
            "CSV + print export",
          ].map((item) => (
            <div key={item} className="rounded-lg bg-white/80 px-3 py-2">
              <span className="font-semibold text-blue-600">✓</span> {item}
            </div>
          ))}
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          onClick={() => {
            trackEvent("funnel_paywall_modal_open");
            setOpen(true);
          }}
        >
          Unlock Full Report — $12 →
        </Button>
        <p className="mt-3 text-xs text-gray-400">
          One-time payment · 30-day private link · Refund available if access fails
        </p>
      </div>

      {/* Confirmation modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
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
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition-colors"
              onClick={unlock}
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
