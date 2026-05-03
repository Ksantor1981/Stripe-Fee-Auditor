"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_CSV, SAMPLE_COLUMN_MAPPING } from "@/lib/sampleData";

const REQUIRED_COLUMNS = ["id", "type", "amount", "fee", "net", "currency", "created"] as const;
type RequiredCol = (typeof REQUIRED_COLUMNS)[number];

interface ParsedFile {
  file: File | null;
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  isSample?: boolean;
}

type ColumnMapping = Partial<Record<RequiredCol, string>>;

function autoDetect(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const col of REQUIRED_COLUMNS) {
    const match = headers.find(
      (h) => h.toLowerCase().replace(/[^a-z]/g, "") === col.toLowerCase()
    );
    if (match) mapping[col] = match;
  }
  return mapping;
}

function missingCols(mapping: ColumnMapping): RequiredCol[] {
  return REQUIRED_COLUMNS.filter((col) => !mapping[col]);
}

interface Props {
  onBack: () => void;
}

type Stage = "idle" | "uploading" | "analyzing";

export function UploadZone({ onBack }: Props) {
  const router = useRouter();
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setError(null);
    setParsed(null);

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file.");
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      preview: 6,
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        if (!headers.length) {
          setError("Could not detect columns. Is this a valid CSV?");
          return;
        }
        const rows = results.data as Record<string, string>[];
        setParsed({ file, fileName: file.name, headers, rows: rows.slice(0, 5), totalRows: rows.length });
        setMapping(autoDetect(headers));
      },
      error: () => setError("Failed to parse the file. Please try again."),
    });
  }, []);

  function loadSampleData() {
    setError(null);
    Papa.parse<Record<string, string>>(SAMPLE_CSV, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        const rows = results.data as Record<string, string>[];
        setParsed({
          file: null,
          fileName: "sample-stripe-balance.csv",
          headers,
          rows: rows.slice(0, 5),
          totalRows: rows.length,
          isSample: true,
        });
        setMapping(SAMPLE_COLUMN_MAPPING as ColumnMapping);
      },
    });
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.ms-excel": [".csv"] },
    multiple: false,
  });

  const missing = missingCols(mapping);
  const canAnalyze = !!parsed && missing.length === 0 && stage === "idle";

  async function handleAnalyze() {
    if (!parsed) return;
    setError(null);

    try {
      setStage("uploading");

      const csvText = parsed.isSample
        ? SAMPLE_CSV
        : await parsed.file!.text();

      if (!parsed.isSample) {
        const maxCsvBytes = 4 * 1024 * 1024;
        if (new TextEncoder().encode(csvText).length > maxCsvBytes) {
          setError("File too large (max 4 MB). Try a shorter date range in Stripe export.");
          setStage("idle");
          return;
        }
      }

      setStage("analyzing");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText, columnMapping: mapping }),
      });
      if (!analyzeRes.ok) {
        const j = await analyzeRes.json();
        throw new Error(j.error ?? "Analysis failed");
      }
      const { reportId, accessToken } = await analyzeRes.json();

      const qs = new URLSearchParams({ token: accessToken });
      if (parsed.isSample) qs.set("demo", "1");
      router.push(`/report/${reportId}?${qs}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStage("idle");
    }
  }

  const stageLabel: Record<Stage, string> = {
    idle: "Analyze My Fees →",
    uploading: "Reading file…",
    analyzing: "Analyzing…",
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">Step 2 of 2</p>
        <h1 className="text-2xl font-bold text-gray-900">Upload your CSV</h1>
        <p className="mt-2 text-gray-500 text-sm">
          Drop the file you exported from Stripe.{" "}
          <button className="text-blue-600 underline underline-offset-2 hover:text-blue-800" onClick={onBack}>
            Back to instructions
          </button>
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={[
          "relative rounded-2xl border-2 border-dashed cursor-pointer transition-colors p-10 text-center",
          isDragActive ? "border-blue-400 bg-blue-50"
            : parsed ? "border-green-300 bg-green-50"
            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40",
        ].join(" ")}
      >
        <input {...getInputProps()} />
        {!parsed ? (
          <div className="flex flex-col items-center gap-3 pointer-events-none">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
              {isDragActive ? "📂" : "📄"}
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {isDragActive ? "Drop it here!" : "Drag & drop your CSV"}
              </p>
              <p className="text-sm text-gray-400 mt-1">or click to browse</p>
            </div>
            <Badge variant="outline" className="text-xs text-gray-400">.csv only · max 4 MB</Badge>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 pointer-events-none">
            <span className="text-2xl">{parsed.isSample ? "🧪" : "✅"}</span>
            <div className="text-left">
              <p className="font-semibold text-gray-800">{parsed.fileName}</p>
              <p className="text-xs text-gray-500">
                {parsed.isSample ? "Sample data · " : ""}{parsed.totalRows} rows in preview
              </p>
            </div>
            <button
              className="pointer-events-auto ml-4 text-xs text-gray-400 hover:text-red-500 underline"
              onClick={(e) => { e.stopPropagation(); setParsed(null); setMapping({}); setError(null); }}
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Try with sample data */}
      {!parsed && (
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">Don&apos;t have your CSV yet?</p>
          <button
            onClick={loadSampleData}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2"
          >
            Try with sample data →
          </button>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </p>
      )}

      {/* CSV Preview */}
      {parsed && parsed.rows.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Preview <span className="text-gray-400 font-normal">(first {parsed.rows.length} rows)</span>
            {parsed.isSample && (
              <span className="ml-2 text-xs text-blue-500 font-normal">· sample data</span>
            )}
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {parsed.headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    {parsed.headers.map((h) => (
                      <td key={h} className="px-3 py-2 text-gray-600 whitespace-nowrap max-w-[140px] truncate">
                        {row[h] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Column mapping */}
      {parsed && missing.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800 mb-1">
            ⚠️ Some columns couldn&apos;t be auto-detected
          </p>
          <p className="text-xs text-amber-700 mb-4">
            Map the missing columns manually:&nbsp;
            {missing.map((c) => (
              <code key={c} className="mx-0.5 bg-amber-100 px-1 rounded">{c}</code>
            ))}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {missing.map((col) => (
              <div key={col}>
                <label className="block text-xs font-medium text-amber-800 mb-1">
                  {col} <span className="text-amber-500">*</span>
                </label>
                <select
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={mapping[col] ?? ""}
                  onChange={(e) => setMapping((prev) => ({ ...prev, [col]: e.target.value }))}
                >
                  <option value="">— select column —</option>
                  {parsed.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-detect success */}
      {parsed && missing.length === 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
          <span className="text-green-600">✅</span>
          <p className="text-sm text-green-800">All required columns detected automatically.</p>
        </div>
      )}

      {/* CTA */}
      {parsed && (
        <div className="text-center pt-2">
          <Button
            size="lg"
            disabled={!canAnalyze}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 disabled:opacity-50"
            onClick={handleAnalyze}
          >
            {stage !== "idle" ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {stageLabel[stage]}
              </span>
            ) : (
              stageLabel.idle
            )}
          </Button>
          <p className="mt-3 text-xs text-gray-400">
            {parsed.isSample
              ? "This is sample data for demonstration purposes."
              : "Your file is processed in memory only. Free previews expire in 1 hour."}
          </p>
        </div>
      )}
    </div>
  );
}
