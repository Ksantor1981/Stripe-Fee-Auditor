"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ExportInstructions } from "./ExportInstructions";
import { UploadZone } from "./UploadZone";
import { trackEvent } from "@/lib/analytics";

function AnalyzeSteps() {
  const searchParams = useSearchParams();
  const isSample = searchParams.get("sample") === "1";

  useEffect(() => {
    trackEvent("funnel_analyze_page_view", { sample_query: isSample });
  }, [isSample]);

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="font-semibold text-blue-600">Upload</span>
        <span>→</span>
        <span>Results</span>
        {!isSample && (
          <>
            <span className="text-gray-300">·</span>
            <a href="#export-steps" className="text-blue-600 hover:underline">
              Need export help?
            </a>
          </>
        )}
      </div>

      {/* Upload first: people with a CSV convert without an extra Continue click */}
      <UploadZone autoLoadSample={isSample} />

      {!isSample && <ExportInstructions />}
    </div>
  );
}

export function AnalyzeClient() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <AnalyzeSteps />
    </Suspense>
  );
}
