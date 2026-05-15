"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { trackEvent } from "@/lib/analytics";
import { EmailGate } from "./EmailGate";
import { FeedbackForm } from "./FeedbackForm";
import { MultiMonthReport } from "./MultiMonthReport";
import { SingleMonthReport } from "./SingleMonthReport";
import { LowVolumeReport } from "./LowVolumeReport";

interface Props {
  reportId: string;
  accessToken: string;
  result: AnalysisResult;
  isPaid: boolean;
  /** Sample/demo flow: URL ?demo=1 skips email capture. */
  demoSkipEmailGate?: boolean;
  /** Demo sample reports can show paid sections without enabling paid exports. */
  demoFullAccess?: boolean;
  /** Polar redirected back before the payment webhook finished processing. */
  paymentPending?: boolean;
  /** Full anomaly count before preview strips rows (free tier UI). */
  previewAnomalyCount?: number;
}

export function ReportShell({
  reportId,
  accessToken,
  result,
  isPaid,
  demoSkipEmailGate = false,
  demoFullAccess = false,
  paymentPending = false,
  previewAnomalyCount,
}: Props) {
  const router = useRouter();
  // Paid users skip EmailGate entirely — they already provided email at checkout.
  // Demo sample links skip the gate and show full sample insights without enabling exports.
  const hasFullAccess = isPaid || demoFullAccess;
  const [unlocked, setUnlocked] = useState(hasFullAccess || demoSkipEmailGate || paymentPending);
  const tokenQuery = `token=${encodeURIComponent(accessToken)}`;

  useEffect(() => {
    if (!paymentPending || hasFullAccess) return;
    const interval = window.setInterval(() => router.refresh(), 2500);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 30000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [hasFullAccess, paymentPending, router]);

  useEffect(() => {
    trackEvent("funnel_report_view", {
      mode: result.mode,
      paid: isPaid,
      demo_access: demoFullAccess,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per mount; token/report identity must not leak to analytics
  }, []);

  if (!unlocked) {
    return <EmailGate reportId={reportId} accessToken={accessToken} onUnlock={() => setUnlocked(true)} />;
  }

  const baseReportProps = { reportId, accessToken, result, isPaid: hasFullAccess };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <a href="/" className="text-sm font-semibold text-gray-900">Stripe Fee Auditor</a>
          <div className="flex items-center gap-3">
            {isPaid && (
              <>
                <a
                  href={`/api/export/csv?reportId=${reportId}&${tokenQuery}`}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors"
                >
                  ↓ CSV
                </a>
                <a
                  href={`/report/${reportId}/print?${tokenQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors"
                >
                  ↓ Print PDF
                </a>
              </>
            )}
            <a
              href="/analyze"
              className="text-sm text-blue-600 hover:underline"
            >
              Analyze another file →
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {paymentPending && !isPaid && (
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Payment received. We&apos;re unlocking your report now. This page will refresh automatically.
          </div>
        )}
        {/* Save link reminder */}
        {isPaid && (
          <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
            <span className="flex-shrink-0">🔗</span>
            <span>
              <strong>Save this page link</strong> — your private report is available for 30 days.{" "}
              We also sent it to your email if delivery is configured.
            </span>
          </div>
        )}
        {/* Multi-currency warning */}
        {result.currencies && result.currencies.length > 1 && (
          <div className="mb-6 rounded-xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 flex items-start gap-2">
            <span className="flex-shrink-0">⚠️</span>
            <span>
              Your export contains multiple currencies ({result.currencies.join(", ").toUpperCase()}).
              Amounts are shown as-is without conversion — totals may not be directly comparable.
              For best results, export a single-currency period.
            </span>
          </div>
        )}
        {result.mode === "multi-month" && (
          <MultiMonthReport {...baseReportProps} previewAnomalyCount={previewAnomalyCount} />
        )}
        {result.mode === "single-month" && <SingleMonthReport {...baseReportProps} />}
        {result.mode === "low-volume" && <LowVolumeReport reportId={reportId} result={result} isPaid={isPaid} />}

        <div className="mt-8">
          <FeedbackForm reportId={reportId} />
        </div>
      </div>

      <footer className="border-t px-4 py-6 text-center text-xs text-gray-400 space-y-1">
        <p>Stripe Fee Auditor · Not affiliated with Stripe, Inc.</p>
        <p className="flex justify-center gap-3 flex-wrap">
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:underline">Terms of Service</a>
          <span>·</span>
          <a href="/refund" className="hover:underline">Refund Policy</a>
        </p>
        <p className="flex justify-center gap-3 flex-wrap">
          <a href="/blog/why-stripe-fees-increase" className="hover:underline">Why fees increase</a>
          <span>·</span>
          <a href="/blog/how-to-reduce-stripe-fees" className="hover:underline">Reduce Stripe fees</a>
          <span>·</span>
          <a href="/blog/stripe-effective-fee-rate-explained" className="hover:underline">Fee rate explained</a>
        </p>
      </footer>
    </main>
  );
}
