"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";
import { fmt$, fmtPct } from "@/lib/format";
import { annualRunRate, periodTotalFees, stripeFeesPeriodTail } from "@/lib/fee-period-copy";
import type { NormalizedRow } from "@/lib/csv-parser";

export interface ReportHeadline {
  chargeVolume: number;
  chargeRate: number;
  chargeFees: number;
  otherFees: number;
  allInFees?: number;
  allInRate?: number;
  monthCount: number;
  topDrivers: NormalizedRow[];
}

interface Props {
  reportId: string;
  headline: ReportHeadline;
  onUnlock: () => void;
}

export function EmailGate({ reportId, headline, onUnlock }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const periodFees = headline.allInFees ?? periodTotalFees(headline.chargeFees, headline.otherFees);
  const displayAllInRate =
    headline.allInRate ??
    (headline.chargeVolume > 0 ? (periodFees / headline.chargeVolume) * 100 : 0);
  const yearlyAtThisRate = annualRunRate(periodFees, headline.monthCount);

  useEffect(() => {
    trackEvent("funnel_email_gate_view");
    trackEvent("funnel_report_headline_view", {
      all_in_rate: displayAllInRate.toFixed(2),
      month_count: headline.monthCount,
    });
  }, [displayAllInRate, headline.monthCount]);

  function isValidEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Could not open this report.");
      }
      const body = await res.json().catch(() => null);
      if (body?.monitorFullAccess) {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open this report.");
      setLoading(false);
      return;
    }
    trackEvent("funnel_email_unlock_ok");
    onUnlock();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg space-y-5">
        {/* Headline — visible before email */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            {headline.monthCount > 1 ? `${headline.monthCount}-month analysis` : "Your Stripe fees"}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">
            You paid <span className="text-blue-600">{fmt$(periodFees)}</span> in Stripe fees{" "}
            {stripeFeesPeriodTail(headline.monthCount)}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            That&apos;s{" "}
            <span className="font-semibold text-gray-900">{fmt$(yearlyAtThisRate)}</span>
            /year at this rate.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-400">Processing rate</p>
              <p className="text-xl font-bold text-gray-900">{fmtPct(headline.chargeRate)}</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-400">All-in cost rate</p>
              <p className="text-xl font-bold text-gray-900">{fmtPct(displayAllInRate)}</p>
            </div>
          </div>

          {headline.topDrivers.length > 0 && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
                Top fee drivers (preview)
              </p>
              <ul className="space-y-1.5">
                {headline.topDrivers.slice(0, 3).map((row, i) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-gray-600 truncate">
                      {i + 1}. {row.id}
                    </span>
                    <span className="font-semibold text-gray-900 shrink-0">{fmt$(row.fee)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Email — save link + unlock full preview */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-1">
            Save your report link
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Your analysis is ready. Enter your email to unlock the full preview and get a private link
            you can return to — no credit card required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="h-11"
              autoFocus
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {loading ? "Opening report…" : "Unlock Full Preview →"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
            No spam. Unsubscribe anytime. Preview expires in about{" "}
            <strong>1 hour</strong> — see{" "}
            <Link href="/privacy" className="underline hover:text-gray-500">
              Privacy
            </Link>{" "}
            for retention.
          </p>
        </div>

        <div className="flex justify-center gap-6 text-xs text-gray-400">
          <span>🔒 No credit card</span>
          <span>⚡ Instant results</span>
          <span>🗑️ Auto-deleted</span>
        </div>
      </div>
    </main>
  );
}
