"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import type { MonitorHistoryPoint } from "@/lib/db";
import { applyExpectedOutlierExclusions } from "@/lib/expected-outliers";
import { selectFreeDiagnosis } from "@/lib/free-diagnosis";
import { ChromeWebStoreReviewAsk } from "@/components/ChromeWebStoreReviewAsk";
import { AppShellHeader } from "@/components/AppShellHeader";
import { trackEvent } from "@/lib/analytics";
import { EmailGate } from "./EmailGate";
import { FeedbackForm } from "./FeedbackForm";
import { MonitorWaitlistForm } from "./MonitorWaitlistForm";
import { MultiMonthReport } from "./MultiMonthReport";
import { SingleMonthReport } from "./SingleMonthReport";
import { LowVolumeReport } from "./LowVolumeReport";
import { ShareEmbedBenchmark } from "./ShareEmbedBenchmark";
import { ReportReconciliation } from "./ReportReconciliation";
import { MonitorHistory } from "./MonitorHistory";

interface Props {
  reportId: string;
  /** Public embed iframe URL (includes token by design for third-party embeds). */
  embedShareUrl?: string;
  result: AnalysisResult;
  isPaid: boolean;
  /** Sample/demo flow: URL ?demo=1 skips email capture. */
  demoSkipEmailGate?: boolean;
  /** Demo sample reports can show paid sections without enabling paid exports. */
  demoFullAccess?: boolean;
  /** Temporary beta flow: real uploaded reports show full insights without checkout. */
  betaFullAccess?: boolean;
  /** Active Fee Monitor subscription unlocks full reports for the saved email. */
  monitorFullAccess?: boolean;
  /** Summary-only prior reports linked to this active Monitor email. */
  monitorHistory?: MonitorHistoryPoint[];
  /** Polar redirected back before the payment webhook finished processing. */
  paymentPending?: boolean;
  /** Full anomaly count before preview strips rows (free tier UI). */
  previewAnomalyCount?: number;
}

export function ReportShell({
  reportId,
  embedShareUrl,
  result,
  isPaid,
  demoSkipEmailGate = false,
  demoFullAccess = false,
  betaFullAccess = false,
  monitorFullAccess = false,
  paymentPending = false,
  monitorHistory = [],
  previewAnomalyCount,
}: Props) {
  const router = useRouter();
  // Paid users skip EmailGate entirely — they already provided email at checkout.
  // Demo sample links skip the gate and show full sample insights without enabling exports.
  const hasFullAccess = isPaid || demoFullAccess || betaFullAccess;
  const exportsEnabled = isPaid || betaFullAccess;
  const [unlocked, setUnlocked] = useState(hasFullAccess || demoSkipEmailGate || paymentPending);
  const paymentSuccessTracked = useRef(false);
  const [expectedOutlierIds, setExpectedOutlierIds] = useState<string[]>(
    result.expectedOutlierIds ?? []
  );
  const [outlierSaving, setOutlierSaving] = useState(false);

  useEffect(() => {
    setExpectedOutlierIds(result.expectedOutlierIds ?? []);
  }, [result.expectedOutlierIds]);

  const baseResult = result;
  const adjustedResult = useMemo(
    () => applyExpectedOutlierExclusions(baseResult, expectedOutlierIds),
    [baseResult, expectedOutlierIds]
  );
  const freeDiagnosis = useMemo(() => selectFreeDiagnosis(baseResult), [baseResult]);
  const canMarkExpectedOutliers = Boolean(baseResult.chargeLedger?.length) && hasFullAccess;

  const toggleExpectedOutlier = useCallback(
    async (chargeId: string) => {
      const next = expectedOutlierIds.includes(chargeId)
        ? expectedOutlierIds.filter((id) => id !== chargeId)
        : [...expectedOutlierIds, chargeId];
      const previous = expectedOutlierIds;
      setExpectedOutlierIds(next);
      setOutlierSaving(true);
      try {
        const res = await fetch(`/api/reports/${reportId}/expected-outliers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ excludedIds: next }),
        });
        if (!res.ok) {
          setExpectedOutlierIds(previous);
          return;
        }
        trackEvent("expected_outlier_toggle", { count: next.length });
      } catch {
        setExpectedOutlierIds(previous);
      } finally {
        setOutlierSaving(false);
      }
    },
    [expectedOutlierIds, reportId]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const fromCheckout =
      params.get("payment") === "success" || params.has("checkout_id");
    if (!fromCheckout) return;

    if (isPaid && !paymentSuccessTracked.current) {
      paymentSuccessTracked.current = true;
      trackEvent("funnel_payment_success", {
        source: paymentPending ? "webhook_poll" : "immediate",
      });
    }

    if (isPaid) {
      router.replace(`/report/${reportId}`, { scroll: false });
    }
  }, [isPaid, paymentPending, reportId, router]);

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
      beta_full_access: betaFullAccess,
      monitor_full_access: monitorFullAccess,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per mount; token/report identity must not leak to analytics
  }, []);

  if (!unlocked) {
    return (
      <EmailGate
        reportId={reportId}
        headline={{
          chargeVolume: result.chargeVolume,
          chargeRate: result.chargeRate,
          chargeFees: result.chargeFees,
          otherFees: result.otherFees,
          allInFees: result.allInFees,
          allInRate: result.allInRate,
          monthCount: Math.max(1, result.monthly.length),
          topDrivers: result.topDrivers,
          feeGrade: result.feeGrade,
          diagnosis: freeDiagnosis,
        }}
        onUnlock={() => setUnlocked(true)}
      />
    );
  }

  const reportViewProps = {
    reportId,
    result: adjustedResult,
    originalResult: baseResult,
    isPaid: hasFullAccess,
    expectedOutlierIds,
    onToggleExpectedOutlier: canMarkExpectedOutliers ? toggleExpectedOutlier : undefined,
    outlierSaving,
    canMarkExpectedOutliers,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <AppShellHeader
        toolbar={
          <>
            <Link href={`/report/${reportId}`} className="text-sm font-semibold text-gray-900 shrink-0">
              Your report
            </Link>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
              {exportsEnabled && (
                <>
                  <a
                    href={`/api/export/csv?reportId=${reportId}`}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors bg-white"
                  >
                    ↓ CSV
                  </a>
                  <a
                    href={`/report/${reportId}/print`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors bg-white"
                  >
                    ↓ Print PDF
                  </a>
                </>
              )}
              <Link href="/analyze" className="text-sm font-medium text-blue-600 hover:underline">
                Analyze another file →
              </Link>
            </div>
          </>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        {paymentPending && !isPaid && (
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Payment received. We&apos;re unlocking your report now. This page will refresh automatically.
          </div>
        )}
        {/* Save link reminder */}
        {isPaid && !monitorFullAccess && (
          <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
            <span className="flex-shrink-0">🔗</span>
            <span>
              <strong>Save this page link</strong> — your private report is available for 30 days.{" "}
              We also sent it to your email if delivery is configured.
            </span>
          </div>
        )}
        {monitorFullAccess && (
          <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <strong>Fee Monitor is active.</strong> This report is unlocked by your subscription. Upload a fresh
            Stripe Balance CSV next month to compare rate drift and fee drivers.
          </div>
        )}
        {betaFullAccess && !isPaid && (
          <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Full report is free during beta. Save this private link — it stays available for up to 30 days.
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
        <ReportReconciliation result={adjustedResult} />
        {monitorFullAccess && (
          <MonitorHistory current={adjustedResult} history={monitorHistory} />
        )}
        {result.mode === "multi-month" && (
          <MultiMonthReport {...reportViewProps} previewAnomalyCount={previewAnomalyCount} />
        )}
        {result.mode === "single-month" && <SingleMonthReport {...reportViewProps} />}
        {result.mode === "low-volume" && <LowVolumeReport reportId={reportId} result={adjustedResult} isPaid={hasFullAccess} />}

        <div className="mt-8 space-y-8">
          {hasFullAccess && (
            <ShareEmbedBenchmark embedShareUrl={embedShareUrl!} result={adjustedResult} />
          )}
          {monitorFullAccess ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                Fee Monitor active
              </p>
              <h3 className="mt-2 text-base font-bold text-emerald-950">
                Monthly tracking is connected to this email
              </h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-emerald-800/80">
                Your current report is unlocked. Upload the next Stripe Balance CSV when the month closes to compare
                rate drift and fee drivers.
              </p>
              <a
                href="/monitor"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                View Monitor workflow →
              </a>
            </div>
          ) : (
            <MonitorWaitlistForm reportId={reportId} />
          )}
          <FeedbackForm reportId={reportId} />
          <ChromeWebStoreReviewAsk
            placement={hasFullAccess ? "full_report" : "sample_or_preview"}
            className="text-center"
          />
        </div>
      </div>

      <footer className="border-t px-4 py-6 text-center text-xs text-gray-400 space-y-1">
        <p>Stripe Fee Auditor · Not affiliated with Stripe, Inc.</p>
        <p className="flex justify-center gap-3 flex-wrap">
          <a href="/about" className="hover:underline">About</a>
          <span>·</span>
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
