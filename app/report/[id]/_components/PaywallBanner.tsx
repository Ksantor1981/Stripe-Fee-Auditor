"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  reportId: string;
  accessToken: string;
  email?: string;
}

const PLANS: { id: string; label: string; price: string; features: string[]; highlight?: boolean }[] = [
  {
    id: "basic",
    label: "Basic Report",
    price: "$5",
    features: ["Full anomaly list", "CSV export", "Shareable link"],
  },
  {
    id: "pro",
    label: "Pro Report",
    price: "$12",
    features: ["Everything in Basic", "Print to PDF", "Full monthly breakdown"],
    highlight: true,
  },
  {
    id: "team",
    label: "Team",
    price: "$29",
    features: ["Everything in Pro", "5 report credits", "Priority support"],
  },
];

export function PaywallBanner({ reportId, accessToken, email }: Props) {
  const [open, setOpen] = useState(false);

  function checkout(planId: string) {
    const params = new URLSearchParams({ plan: planId, reportId, token: accessToken });
    if (email) params.set("email", email);
    window.location.href = `/api/checkout?${params}`;
  }

  return (
    <>
      {/* Inline banner */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">
          Unlock Full Report
        </p>
        <h3 className="text-lg font-bold text-gray-900 mb-1">See the complete picture</h3>
        <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
          Full anomaly list, all monthly details, CSV export, and print-ready report.
        </p>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          onClick={() => setOpen(true)}
        >
          Unlock Full Report →
        </Button>
        <p className="mt-3 text-xs text-gray-400">One-time payment · Instant access · 30-day refund</p>
      </div>

      {/* Payment modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="bg-gray-900 px-6 py-5">
            <h2 className="text-lg font-bold text-white">Unlock Your Report</h2>
            <p className="text-sm text-gray-400 mt-1">One-time payment · No subscription · 30-day refund</p>
          </div>
          <div className="p-5 space-y-3">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                className={[
                  "w-full rounded-xl border px-4 py-4 text-left transition-colors group",
                  plan.highlight
                    ? "border-blue-400 bg-blue-50 hover:bg-blue-100"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50",
                ].join(" ")}
                onClick={() => checkout(plan.id)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-semibold ${plan.highlight ? "text-blue-700" : "text-gray-900"}`}>
                    {plan.label}
                    {plan.highlight && (
                      <span className="ml-2 text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">Popular</span>
                    )}
                  </span>
                  <span className="text-lg font-bold text-gray-900">{plan.price}</span>
                </div>
                <ul className="space-y-0.5">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
            <p className="text-xs text-center text-gray-400 pt-1">
              Secure payment via LemonSqueezy
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
