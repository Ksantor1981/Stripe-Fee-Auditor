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

  return (
    <>
      {/* Inline banner */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
          Full report
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Unlock the full report</h3>
        <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
          Full anomaly breakdown with explanations, savings opportunities, monthly details, CSV export, and print-ready report.
        </p>
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
          One-time payment · Instant access · Refund available
        </p>
      </div>

      {/* Confirmation modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="bg-gray-900 px-6 py-5">
            <h2 className="text-lg font-bold text-white">Get Full Report</h2>
            <p className="text-sm text-gray-400 mt-1">
              One-time access to the complete analysis
            </p>
          </div>
          <div className="p-5">
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-700">Full Report</span>
                <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">$12</span>
              </div>
              <ul className="space-y-1">
                {[
                  "Full anomaly list with explanations",
                  "Savings opportunities (est. annual)",
                  "Monthly fee breakdown",
                  "CSV export",
                  "Print-ready report",
                ].map((f) => (
                  <li key={f} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <span className="text-blue-500">✓</span> {f}
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
              Processed by Polar · Refund available — see policy
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
