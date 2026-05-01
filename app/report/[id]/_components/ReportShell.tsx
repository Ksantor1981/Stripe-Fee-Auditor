"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { EmailGate } from "./EmailGate";
import { MultiMonthReport } from "./MultiMonthReport";
import { SingleMonthReport } from "./SingleMonthReport";
import { LowVolumeReport } from "./LowVolumeReport";

interface Props {
  reportId: string;
  accessToken: string;
  result: AnalysisResult;
  isPaid: boolean;
}

export function ReportShell({ reportId, accessToken, result, isPaid }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const tokenQuery = `token=${encodeURIComponent(accessToken)}`;

  if (!unlocked) {
    return <EmailGate reportId={reportId} accessToken={accessToken} onUnlock={() => setUnlocked(true)} />;
  }

  const reportProps = { reportId, accessToken, result, isPaid };

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
        {result.mode === "multi-month" && <MultiMonthReport {...reportProps} />}
        {result.mode === "single-month" && <SingleMonthReport {...reportProps} />}
        {result.mode === "low-volume" && <LowVolumeReport {...reportProps} />}
      </div>

      <footer className="border-t px-4 py-6 text-center text-xs text-gray-400 space-y-1">
        <p>Stripe Fee Auditor · Not affiliated with Stripe, Inc.</p>
        <p className="flex justify-center gap-3 flex-wrap">
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:underline">Terms of Service</a>
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
