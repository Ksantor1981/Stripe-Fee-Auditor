"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { EmailGate } from "./EmailGate";
import { MultiMonthReport } from "./MultiMonthReport";
import { SingleMonthReport } from "./SingleMonthReport";
import { LowVolumeReport } from "./LowVolumeReport";

interface Props {
  reportId: string;
  result: AnalysisResult;
  isPaid: boolean;
}

export function ReportShell({ reportId, result, isPaid }: Props) {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <EmailGate onUnlock={() => setUnlocked(true)} />;
  }

  const reportProps = { reportId, result, isPaid };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <a href="/" className="text-sm font-semibold text-gray-900">Stripe Fee Auditor</a>
          <a
            href="/analyze"
            className="text-sm text-blue-600 hover:underline"
          >
            Analyze another file →
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {result.mode === "multi-month" && <MultiMonthReport {...reportProps} />}
        {result.mode === "single-month" && <SingleMonthReport {...reportProps} />}
        {result.mode === "low-volume" && <LowVolumeReport {...reportProps} />}
      </div>

      <footer className="border-t px-4 py-6 text-center text-xs text-gray-400">
        Stripe Fee Auditor · Not affiliated with Stripe, Inc.
      </footer>
    </main>
  );
}
