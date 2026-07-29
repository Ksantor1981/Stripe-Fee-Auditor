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
import type { FeeGrade } from "@/lib/fee-grade";
import type { FreeDiagnosis, FreeDiagnosisKind } from "@/lib/free-diagnosis";
import { FeeGradeBadge } from "@/components/FeeGradeBadge";

export interface ReportHeadline {
  chargeVolume: number;
  chargeRate: number;
  chargeFees: number;
  otherFees: number;
  allInFees?: number;
  allInRate?: number;
  monthCount: number;
  topDrivers: NormalizedRow[];
  feeGrade?: FeeGrade;
  diagnosis?: FreeDiagnosis;
}

interface Props {
  reportId: string;
  headline: ReportHeadline;
  onUnlock: () => void;
}

const DRIVER_CATEGORY_LABELS: Record<FreeDiagnosisKind, string> = {
  international_card_uplift: "International cards",
  refund_fee_leakage: "Refund fee retention",
  small_ticket_drag: "Small-ticket fixed fees",
  other_fee_lines: "Other Stripe fee lines",
  above_benchmark_rate: "Rate above mix benchmark",
  unusual_charge: "Unusual high-fee charge",
};

/** First sentence only; strip dollar amounts so stage A stays headline-level. */
function diagnosisGateTeaser(body: string): string {
  const first = (body.split(/(?<=[.!?])\s+/)[0] ?? body).trim();
  const redacted = first.replace(/\$[\d,]+(?:\.\d{1,2})?/g, "…");
  const needsEllipsis = redacted.length < body.trim().length || /\$[\d,]/.test(first);
  return needsEllipsis && !redacted.endsWith("…") ? `${redacted}…` : redacted;
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
  const driverCategory =
    headline.diagnosis != null ? DRIVER_CATEGORY_LABELS[headline.diagnosis.kind] : undefined;

  useEffect(() => {
    trackEvent("funnel_email_gate_view");
    trackEvent("funnel_report_headline_view", {
      all_in_rate: displayAllInRate.toFixed(2),
      month_count: headline.monthCount,
    });
    if (headline.diagnosis) {
      trackEvent("free_diagnosis_view", { driver: headline.diagnosis.kind });
    }
  }, [displayAllInRate, headline.monthCount, headline.diagnosis]);

  function isValidEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (headline.diagnosis) {
      trackEvent("free_diagnosis_cta_click", { driver: headline.diagnosis.kind });
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
        {/* Headline — stage A: rates + hook, no $ driver breakdown */}
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

          {headline.feeGrade && (
            <div className="mt-4">
              <FeeGradeBadge grade={headline.feeGrade} size="sm" />
            </div>
          )}

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

          {headline.diagnosis && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-1">
                Free diagnosis
              </p>
              <h2 className="text-sm font-bold text-emerald-950">{headline.diagnosis.title}</h2>
              {driverCategory && (
                <p className="mt-1 text-xs font-medium text-emerald-800/90">
                  Likely driver category: {driverCategory}
                </p>
              )}
              <p className="mt-1 text-sm leading-relaxed text-emerald-900/85">
                {diagnosisGateTeaser(headline.diagnosis.body)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-emerald-800/75">
                Enter your email to see dollar amounts by driver and open the preview — still free, no
                card.
              </p>
            </div>
          )}
        </div>

        {/* Email — unlock stage B preview (drivers with $, charts) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-1">
            See driver amounts &amp; save your link
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Get dollar amounts for your top fee drivers, charts, and a private link you can return to —
            no credit card. Full charge rows and actions unlock for $12.
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
              {loading ? "Opening preview…" : "Open preview with driver amounts →"}
            </Button>
          </form>

          <button
            type="button"
            className="mt-3 w-full text-sm font-medium text-gray-500 hover:text-gray-800 underline underline-offset-2"
            onClick={() => {
              trackEvent("funnel_email_gate_skip");
              onUnlock();
            }}
          >
            Continue without email →
          </button>

          <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
            Email is optional. Submitting it asks us to store the address for a private report link
            (and transactional delivery if configured) and extends unpaid retention to about{" "}
            <strong>72 hours</strong>. Without email, preview expires in about <strong>1 hour</strong>.
            See{" "}
            <Link href="/privacy" className="underline hover:text-gray-500">
              Privacy
            </Link>
            .
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
