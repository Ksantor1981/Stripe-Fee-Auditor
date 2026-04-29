"use client";

import { useState } from "react";
import { ExportInstructions } from "./ExportInstructions";
import { UploadZone } from "./UploadZone";

export type AnalyzeStep = "instructions" | "upload";

export function AnalyzeClient() {
  const [step, setStep] = useState<AnalyzeStep>("instructions");

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <a href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            ← Back
          </a>
          <span className="text-sm font-semibold text-gray-900">Stripe Fee Auditor</span>
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className={step === "instructions" ? "font-semibold text-blue-600" : "line-through"}>
              1. Export
            </span>
            <span>→</span>
            <span className={step === "upload" ? "font-semibold text-blue-600" : ""}>
              2. Upload
            </span>
            <span>→</span>
            <span>3. Results</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-10">
        {step === "instructions" ? (
          <ExportInstructions onReady={() => setStep("upload")} />
        ) : (
          <UploadZone onBack={() => setStep("instructions")} />
        )}
      </div>
    </main>
  );
}
