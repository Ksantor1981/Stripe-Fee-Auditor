"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const REQUIRED_COLUMNS = ["id", "type", "amount", "fee", "net", "currency", "created"] as const;
type RequiredCol = (typeof REQUIRED_COLUMNS)[number];

interface ParsedFile {
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

interface ColumnMapping {
  [key: string]: string;
}

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

export function UploadZone({ onBack }: Props) {
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

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
        if (headers.length === 0) {
          setError("Could not detect columns. Is this a valid CSV?");
          return;
        }
        const allRows = results.data as Record<string, string>[];
        setParsed({
          fileName: file.name,
          headers,
          rows: allRows.slice(0, 5),
          totalRows: allRows.length,
        });
        setMapping(autoDetect(headers));
      },
      error: () => setError("Failed to parse the CSV file. Please try again."),
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.ms-excel": [".csv"] },
    multiple: false,
  });

  const missing = missingCols(mapping);
  const needsMapping = parsed && missing.length > 0;
  const canAnalyze = parsed && missing.length === 0;

  function handleAnalyze() {
    setAnalyzing(true);
    // Day 3: POST /api/analyze
    setTimeout(() => setAnalyzing(false), 1500);
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">Step 2 of 2</p>
        <h1 className="text-2xl font-bold text-gray-900">Upload your CSV</h1>
        <p className="mt-2 text-gray-500 text-sm">
          Drop the file you just exported from Stripe.{" "}
          <button className="text-blue-600 underline underline-offset-2 hover:text-blue-800" onClick={onBack}>
            Back to export instructions
          </button>
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={[
          "relative rounded-2xl border-2 border-dashed cursor-pointer transition-colors p-10 text-center",
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : parsed
            ? "border-green-300 bg-green-50"
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
              <p className="text-sm text-gray-400 mt-1">or click to browse files</p>
            </div>
            <Badge variant="outline" className="text-xs text-gray-400">
              .csv files only
            </Badge>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 pointer-events-none">
            <span className="text-2xl">✅</span>
            <div className="text-left">
              <p className="font-semibold text-gray-800">{parsed.fileName}</p>
              <p className="text-xs text-gray-500">{parsed.totalRows} rows parsed</p>
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
                      <td key={h} className="px-3 py-2 text-gray-600 whitespace-nowrap max-w-[160px] truncate">
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

      {/* Column mapping — only if auto-detect failed */}
      {needsMapping && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800 mb-1">
            ⚠️ Some columns couldn&apos;t be auto-detected
          </p>
          <p className="text-xs text-amber-700 mb-4">
            Please map the missing columns manually. Expected:{" "}
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

      {/* Auto-detect success badge */}
      {parsed && !needsMapping && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
          <span className="text-green-600">✅</span>
          <p className="text-sm text-green-800">
            All required columns detected automatically.
          </p>
        </div>
      )}

      {/* CTA */}
      {parsed && (
        <div className="text-center pt-2">
          <Button
            size="lg"
            disabled={!canAnalyze || analyzing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 disabled:opacity-50"
            onClick={handleAnalyze}
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Analyzing…
              </span>
            ) : (
              "Analyze My Fees →"
            )}
          </Button>
          <p className="mt-3 text-xs text-gray-400">
            Your file is processed securely and deleted after 1 hour.
          </p>
        </div>
      )}
    </div>
  );
}
