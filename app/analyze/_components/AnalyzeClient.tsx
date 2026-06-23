"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ExportInstructions } from "./ExportInstructions";
import { UploadZone } from "./UploadZone";
import { trackEvent } from "@/lib/analytics";

export type AnalyzeStep = "instructions" | "upload";

function AnalyzeSteps() {
  const searchParams = useSearchParams();
  const isSample = searchParams.get("sample") === "1";

  const [step, setStep] = useState<AnalyzeStep>(isSample ? "upload" : "instructions");

  useEffect(() => {
    if (isSample) setStep("upload");
  }, [isSample]);

  useEffect(() => {
    trackEvent("funnel_analyze_page_view", { sample_query: isSample });
  }, [isSample]);

  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-xs text-gray-400">
        <span className={step === "instructions" ? "font-semibold text-blue-600" : "line-through"}>
          1. Export
        </span>
        <span>→</span>
        <span className={step === "upload" ? "font-semibold text-blue-600" : ""}>2. Upload</span>
        <span>→</span>
        <span>3. Results</span>
      </div>

      {step === "instructions" ? (
        <ExportInstructions onReady={() => setStep("upload")} />
      ) : (
        <UploadZone onBack={() => setStep("instructions")} autoLoadSample={isSample} />
      )}
    </>
  );
}

export function AnalyzeClient() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <AnalyzeSteps />
    </Suspense>
  );
}
