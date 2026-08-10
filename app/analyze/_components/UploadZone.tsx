"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_CSV, SAMPLE_COLUMN_MAPPING } from "@/lib/sampleData";
import { trackEvent } from "@/lib/analytics";
import { MAX_CSV_ROWS } from "@/lib/analyze-input";
import {
  detectStripeCsvFormat,
  isAutoRecognizedStripeCsv,
  stripeCsvFormatLabel,
  stripeCsvFormatNotice,
  type StripeCsvFormat,
} from "@/lib/stripe-csv-import";
import { validateColumns } from "@/lib/csv-parser";
import {
  STRIPE_ACCOUNT_COUNTRIES,
  type StripeAccountCountry,
} from "@/lib/stripe-country-fees";


const REQUIRED_COLUMNS = ["id", "type", "amount", "fee", "net", "currency", "created"] as const;
const MAX_CSV_BYTES = 4 * 1024 * 1024;
const PREVIEW_ROW_LIMIT = 200;
type RequiredCol = (typeof REQUIRED_COLUMNS)[number];

interface ParsedFile {
  file: File | null;
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  isSample?: boolean;
  stripeFormat?: StripeCsvFormat;
}

type ColumnMapping = Partial<Record<RequiredCol, string>>;

const COLUMN_ALIASES: Record<RequiredCol, string[]> = {
  id: ["id", "balance_transaction_id", "balance transaction id", "balance_transaction", "transaction_id"],
  type: ["type", "reporting_category", "reporting category"],
  amount: ["amount", "gross", "gross_amount", "gross amount"],
  fee: ["fee", "fees", "stripe_fee", "stripe fee"],
  net: ["net", "net_amount", "net amount"],
  currency: ["currency"],
  created: [
    "created",
    "created_utc",
    "created utc",
    "created date (utc)",
    "created date utc",
    "effective_at",
    "effective_at_utc",
    "effective at utc",
    "available_on",
    "available_on_utc",
    "available on utc",
  ],
};

function normalizeHeaderName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function autoDetect(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const col of REQUIRED_COLUMNS) {
    const aliases = COLUMN_ALIASES[col].map(normalizeHeaderName);
    const match = headers.find((h) => aliases.includes(normalizeHeaderName(h)));
    // Identity mapping must count as mapped (CSV header "id" → required field id).
    if (match) mapping[col] = match;
  }
  return mapping;
}

function missingCols(mapping: ColumnMapping): RequiredCol[] {
  return REQUIRED_COLUMNS.filter((col) => !mapping[col]);
}

interface Props {
  autoLoadSample?: boolean;
}

type Stage = "idle" | "uploading" | "analyzing";

export function UploadZone({ autoLoadSample }: Props) {
  const router = useRouter();
  const t = useTranslations("analyze");
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [accountCountry, setAccountCountry] = useState<StripeAccountCountry>("US");
  const [formatNotice, setFormatNotice] = useState<string | null>(null);
  const autoAnalyzeStarted = useRef(false);
  const pendingSampleAutoAnalyze = useRef(false);

  // Auto-load sample data when coming from ?sample=1
  useEffect(() => {
    if (!autoLoadSample) return;
    const result = Papa.parse<Record<string, string>>(SAMPLE_CSV, {
      header: true,
      skipEmptyLines: true,
    });
    const headers = result.meta.fields ?? [];
    const rows = result.data;
    const detectedMapping = autoDetect(headers);
    setParsed({
      file: null,
      fileName: "sample-stripe-balance.csv",
      headers,
      rows,
      totalRows: rows.length,
      isSample: true,
    });
    setMapping({ ...detectedMapping, ...SAMPLE_COLUMN_MAPPING });
    trackEvent("funnel_csv_loaded", { sample: true, auto: true });
  }, [autoLoadSample]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setError(null);
    setParsed(null);
    setFormatNotice(null);

    if (!file.name.endsWith(".csv")) {
      setError(t("errorNotCsv"));
      return;
    }

    if (file.size > MAX_CSV_BYTES) {
      setError(t("errorTooLarge"));
      return;
    }

    const previewRows: Record<string, string>[] = [];
    const parseErrors: Papa.ParseError[] = [];
    let headers: string[] = [];
    let totalRows = 0;
    let tooManyRows = false;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      step: (result, parser) => {
        if (!headers.length) {
          headers = result.meta.fields ?? Object.keys(result.data ?? {});
        }

        if (result.errors?.length) {
          parseErrors.push(...result.errors);
        }

        totalRows += 1;
        if (previewRows.length < PREVIEW_ROW_LIMIT) {
          previewRows.push(result.data);
        }

        if (totalRows > MAX_CSV_ROWS) {
          tooManyRows = true;
          parser.abort();
        }
      },
      complete: (results) => {
        if (!headers.length) {
          headers = results.meta.fields ?? [];
        }

        if (tooManyRows) {
          setError(t("errorTooManyRows", { max: MAX_CSV_ROWS.toLocaleString() }));
          return;
        }

        if (parseErrors.length > 0) {
          const firstError = parseErrors[0];
          setError(
            t("errorParseRow", {
              row: String(firstError.row ?? "unknown"),
              message: firstError.message ?? "invalid CSV",
            })
          );
          return;
        }

        if (!headers.length) {
          setError(t("errorNoColumns"));
          return;
        }

        const stripeFormat = detectStripeCsvFormat(headers);
        const notice = stripeCsvFormatNotice(stripeFormat);
        if (notice) setFormatNotice(notice);

        setParsed({
          file,
          fileName: file.name,
          headers,
          rows: previewRows,
          totalRows,
          stripeFormat,
        });
        setMapping(autoDetect(headers));
        trackEvent("funnel_csv_loaded", { sample: false });
      },
      error: () => setError(t("errorParseFailed")),
    });
  }, [t]);

  function loadSampleData() {
    setError(null);
    pendingSampleAutoAnalyze.current = true;
    autoAnalyzeStarted.current = false;
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
          rows,
          totalRows: rows.length,
          isSample: true,
        });
        setMapping(SAMPLE_COLUMN_MAPPING as ColumnMapping);
        trackEvent("funnel_csv_loaded", { sample: true, auto: false });
      },
    });
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.ms-excel": [".csv"] },
    multiple: false,
  });

  const missing = missingCols(mapping);
  const autoRecognized = parsed ? isAutoRecognizedStripeCsv(parsed.headers) || validateColumns(parsed.headers).length === 0 : false;
  const canAnalyze =
    !!parsed && stage === "idle" && (autoRecognized || missing.length === 0);

  const runAnalyze = useCallback(
    async (source: ParsedFile, columnMapping: ColumnMapping) => {
      setError(null);

      try {
        setStage("uploading");
        trackEvent("funnel_analyze_submit", { sample: Boolean(source.isSample) });

        const csvText = source.isSample ? SAMPLE_CSV : await source.file!.text();

        if (!source.isSample) {
          if (new TextEncoder().encode(csvText).length > MAX_CSV_BYTES) {
            setError(t("errorTooLarge"));
            setStage("idle");
            return;
          }
        }

        setStage("analyzing");
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ csvText, columnMapping, accountCountry }),
        });
        if (!analyzeRes.ok) {
          const j = await analyzeRes.json();
          throw new Error(j.error ?? t("errorAnalysisFailed"));
        }
        const { reportId, mode } = await analyzeRes.json();

        trackEvent("funnel_analyze_client_ok", {
          sample: Boolean(source.isSample),
          mode: typeof mode === "string" ? mode : "unknown",
        });

        const qs = source.isSample ? "?demo=1" : "";
        router.push(`/report/${reportId}${qs}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errorGeneric"));
        setStage("idle");
      }
    },
    [accountCountry, router, t]
  );

  // Sample path → start analysis automatically (URL ?sample=1 or “Try sample” button)
  useEffect(() => {
    if (!parsed?.isSample || missing.length > 0 || stage !== "idle") return;
    if (!autoLoadSample && !pendingSampleAutoAnalyze.current) return;
    if (autoAnalyzeStarted.current) return;
    autoAnalyzeStarted.current = true;
    pendingSampleAutoAnalyze.current = false;
    void runAnalyze(parsed, mapping);
  }, [autoLoadSample, parsed, mapping, missing.length, stage, runAnalyze]);

  async function handleAnalyze() {
    if (!parsed) return;
    await runAnalyze(parsed, mapping);
  }

  const stageLabel: Record<Stage, string> = {
    idle: t("ctaIdle"),
    uploading: t("ctaUploading"),
    analyzing: t("ctaAnalyzing"),
  };

  return (
    <div id="upload-csv" className="space-y-8 scroll-mt-6">
      {/* Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
          {autoLoadSample ? t("badgeSample") : t("badgeYourFile")}
        </p>
        <h2 className="text-xl font-bold text-gray-900">
          {autoLoadSample ? t("headingSampleLoading") : t("headingUpload")}
        </h2>
        <p className="mt-2 text-gray-500 text-sm">
          {autoLoadSample ? t("hintSample") : t("hintUpload")}
        </p>
      </div>

      {!autoLoadSample && (
        <label className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <span className="text-sm font-semibold text-gray-900">Stripe account country</span>
          <span className="mt-1 block text-xs leading-relaxed text-gray-500">
            Used to classify domestic vs international cards and select the directional standard-pricing benchmark.
          </span>
          <select
            value={accountCountry}
            onChange={(event) => setAccountCountry(event.target.value as StripeAccountCountry)}
            disabled={stage !== "idle"}
            className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
          >
            {STRIPE_ACCOUNT_COUNTRIES.map((country) => (
              <option key={country.id} value={country.id}>
                {country.label}
              </option>
            ))}
          </select>
          <span className="mt-2 block text-xs text-amber-700">
            Current upload reports accept USD settlement only. Custom pricing and FX are estimates, not direct Stripe fee details.
          </span>
        </label>
      )}
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
                {isDragActive ? t("dropActive") : t("dropIdle")}
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
                {parsed.isSample ? t("samplePrefix") : ""}
                {parsed.totalRows.toLocaleString()} rows
                {stage !== "idle" ? " · analyzing…" : " · preview below"}
              </p>
            </div>
            {stage === "idle" && (
              <button
                className="pointer-events-auto ml-4 text-xs text-gray-400 hover:text-red-500 underline"
                onClick={(e) => {
                  e.stopPropagation();
                  autoAnalyzeStarted.current = true; // don't auto-restart after manual remove
                  setParsed(null);
                  setMapping({});
                  setError(null);
                }}
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sample path — equal weight to upload for cold LinkedIn traffic */}
      {!parsed && !autoLoadSample && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-center shadow-sm">
          <p className="text-sm text-gray-600 mb-3">No file yet? See the product with demo data first.</p>
          <button
            type="button"
            onClick={() => {
              trackEvent("funnel_sample_cta", { placement: "upload_zone_button" });
              loadSampleData();
            }}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            Try with sample data →
          </button>
          <p className="mt-2 text-xs text-gray-400">
            Then export your own CSV when you&apos;re ready —{" "}
            <a href="#export-steps" className="text-blue-600 hover:underline">
              steps below
            </a>
            .
          </p>
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
            Preview{" "}
            <span className="text-gray-400 font-normal">
              ({parsed.rows.length.toLocaleString()} of {parsed.totalRows.toLocaleString()} rows · scroll vertically to browse)
            </span>
            {parsed.isSample && (
              <span className="ml-2 text-xs text-blue-500 font-normal">· sample data</span>
            )}
            {!parsed.isSample && parsed.totalRows > parsed.rows.length && (
              <span className="ml-2 text-xs text-gray-400 font-normal">
                · first {parsed.rows.length.toLocaleString()} shown
              </span>
            )}
          </p>
          <div className="max-h-52 overflow-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="min-w-full text-xs">
              <thead className="sticky top-0 z-[1] bg-gray-50 shadow-[0_1px_0_0_rgb(243_244_246)]">
                <tr className="border-b border-gray-100">
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

      {formatNotice && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {formatNotice}
        </div>
      )}

      {/* Column mapping — only when format is truly unknown */}
      {parsed && missing.length > 0 && !autoRecognized && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800 mb-1">
            ⚠️ Some columns couldn&apos;t be auto-detected
          </p>
          <p className="text-xs text-amber-700 mb-4">
            We didn&apos;t recognize this as a standard Stripe export. Map columns below, or re-export from
            Stripe Dashboard → <strong>Reports → Balance summary → Itemized</strong> (best) or{" "}
            <strong>Payments → Export</strong>.
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
      {parsed && autoRecognized && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
          <span className="text-green-600">✅</span>
          <p className="text-sm text-green-800">
            {parsed.stripeFormat && parsed.stripeFormat !== "unknown"
              ? `${stripeCsvFormatLabel(parsed.stripeFormat)} recognized — ready to analyze.`
              : t("readyAnalyze")}
          </p>
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
              ? t("privacySample")
              : t("privacyUpload")}
          </p>
        </div>
      )}
    </div>
  );
}
