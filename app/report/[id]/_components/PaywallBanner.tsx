"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  reportId: string;
}

const PLANS = [
  { id: "basic", label: "Basic Report", price: "$5", desc: "Full anomaly list + CSV export" },
  { id: "pro", label: "Pro Report", price: "$12", desc: "Everything + PDF export + monthly breakdown" },
  { id: "team", label: "Team", price: "$29", desc: "Pro + 5 reports + priority support" },
];

export function PaywallBanner({ reportId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Inline banner */}
      <div className="relative rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-blue-50 to-transparent pointer-events-none" />
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">
          Unlock Full Report
        </p>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          See the complete picture
        </h3>
        <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
          Full anomaly list, all monthly details, PDF &amp; CSV export — starting at $5.
        </p>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          onClick={() => setOpen(true)}
        >
          Unlock Full Report →
        </Button>
        <p className="mt-3 text-xs text-gray-400">One-time payment · Instant access</p>
      </div>

      {/* Payment modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="bg-gray-900 px-6 py-5">
            <h2 className="text-lg font-bold text-white">Unlock Your Report</h2>
            <p className="text-sm text-gray-400 mt-1">One-time payment · No subscription</p>
          </div>
          <div className="p-6 space-y-3">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3.5 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left group"
                onClick={() => {
                  // Day 5: redirect to LemonSqueezy checkout with ?reportId=...
                  alert(`LemonSqueezy checkout for ${plan.label} — implemented on Day 5`);
                }}
              >
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-700">{plan.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
                </div>
                <span className="text-lg font-bold text-gray-900 group-hover:text-blue-700">
                  {plan.price}
                </span>
              </button>
            ))}
            <p className="text-xs text-center text-gray-400 pt-2">
              Secure payment via LemonSqueezy · 30-day refund guarantee
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
