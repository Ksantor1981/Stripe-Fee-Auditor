"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AnalyzePageIntroInner() {
  const isSample = useSearchParams().get("sample") === "1";

  if (isSample) {
    return (
      <>
        <h1 className="text-2xl font-bold text-gray-900">See a sample Stripe fee report</h1>
        <p className="mt-2 text-base text-gray-600">
          Illustrative Balance CSV — not your account. Upload your own file anytime for real numbers.
        </p>
        <p className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          <strong>Sample only.</strong> The report below uses demo data matching our homepage example.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">See your real Stripe fee rate</h1>
      <p className="mt-2 text-base text-gray-600">
        Upload your Balance CSV or run the sample report first.
      </p>
    </>
  );
}

export function AnalyzePageIntro() {
  return (
    <Suspense fallback={<h1 className="text-2xl font-bold text-gray-900">See your real Stripe fee rate</h1>}>
      <AnalyzePageIntroInner />
    </Suspense>
  );
}
