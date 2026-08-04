"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChromeExtensionInstallCta } from "@/components/ChromeExtensionInstallCta";
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
      {!isSample && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="text-sm font-semibold text-blue-950">Don&apos;t have a CSV open right now?</p>
          <p className="mt-1 text-sm text-blue-800">
            Run the sample first (about 10 seconds). You can upload your own Balance CSV anytime
            after.
          </p>
          <a
            href="/analyze?sample=1"
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => trackEvent("funnel_sample_cta", { placement: "analyze_top_banner" })}
          >
            Try sample in 10s →
          </a>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="font-semibold text-blue-600">
          {isSample ? "Sample" : "Upload"}
        </span>
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

      <UploadZone autoLoadSample={isSample} />

      <ChromeExtensionInstallCta placement="analyze_page" variant="quiet" />

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
