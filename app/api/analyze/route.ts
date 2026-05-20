import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { validateColumns, normalizeRow, type RawRow } from "@/lib/csv-parser";
import { analyze, redactAnalysisResultForStorage } from "@/lib/fee-analyzer";
import { logFunnelServer } from "@/lib/funnel-log";
import {
  consumeIpRequest,
  createReport,
  createReportAccessToken,
  hashReportAccessToken,
} from "@/lib/db";
import { getTrustedClientIp } from "@/lib/request-ip";
import { SAMPLE_CSV } from "@/lib/sampleData";
import { MAX_CSV_ROWS, sanitizeColumnMapping } from "@/lib/analyze-input";
import { FULL_REPORTS_FREE_DURING_BETA } from "@/lib/beta-access";
import { appendReportAccessCookie } from "@/lib/report-access-cookie";

export const maxDuration = 30;

const ANALYZE_LIMIT_PER_IP_PER_DAY = 10;
const DEMO_LIMIT = 20;
const VERCEL_MAX_BODY_BYTES = Math.floor(4.5 * 1024 * 1024);
const MAX_CSV_BYTES = 4 * 1024 * 1024;

const ALLOWED_CANONICAL = new Set([
  "id",
  "balance_transaction_id",
  "type",
  "reporting_category",
  "amount",
  "gross",
  "fee",
  "net",
  "currency",
  "created",
  "description",
  "source",
  "status",
]);

/** Normalise whitespace so comparison is robust */
const SAMPLE_CSV_TRIMMED = SAMPLE_CSV.trim();

function isSampleCsv(csvText: string): boolean {
  return csvText.trim() === SAMPLE_CSV_TRIMMED;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > VERCEL_MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body too large (max ~4 MB CSV)" }, { status: 413 });
    }

    let body: { csvText?: string; columnMapping?: Record<string, string> };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.csvText || !body.csvText.trim()) {
      return NextResponse.json({ error: "csvText is required" }, { status: 400 });
    }

    if (Buffer.byteLength(body.csvText, "utf8") > MAX_CSV_BYTES) {
      return NextResponse.json({ error: "File too large (max 4 MB)" }, { status: 413 });
    }

    const csvText = body.csvText;
    const isDemo = isSampleCsv(csvText);

    // ── Rate limiting ─────────────────────────────────────────────────────────
    const ip = getTrustedClientIp(req);
    if (!ip) {
      return NextResponse.json(
        { error: "Unable to process request" },
        { status: 400 }
      );
    }

    const limitKey = isDemo ? `sample:${ip}` : ip;
    const limit = isDemo ? DEMO_LIMIT : ANALYZE_LIMIT_PER_IP_PER_DAY;
    const allowed = await consumeIpRequest(limitKey, limit);
    if (!allowed) {
      return NextResponse.json(
        {
          error: isDemo
            ? "Sample report limit reached. Please try again tomorrow."
            : "Rate limit reached. Max 10 free reports per day per IP.",
        },
        { status: 429 }
      );
    }

    // ── Parse CSV ─────────────────────────────────────────────────────────────
    const parsed = Papa.parse<RawRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (!parsed.data.length) {
      return NextResponse.json({ error: "CSV is empty or could not be parsed" }, { status: 422 });
    }

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        {
          error: `CSV parse error near row ${parsed.errors[0]?.row ?? "unknown"}: ${parsed.errors[0]?.message ?? "invalid CSV"}`,
        },
        { status: 422 }
      );
    }

    if (parsed.data.length > MAX_CSV_ROWS) {
      return NextResponse.json(
        { error: `CSV too many rows (max ${MAX_CSV_ROWS}). Narrow your Stripe date range and export again.` },
        { status: 413 }
      );
    }

    const columnMapping = sanitizeColumnMapping(body.columnMapping, ALLOWED_CANONICAL);

    let rows = parsed.data;
    if (columnMapping && Object.keys(columnMapping).length > 0) {
      rows = rows.map((row) => {
        const remapped: RawRow = { ...row };
        for (const [canonical, original] of Object.entries(columnMapping)) {
          if (!ALLOWED_CANONICAL.has(canonical)) continue;
          if (original && original !== canonical) {
            remapped[canonical] = row[original];
          }
        }
        return remapped;
      });
    }

    const effectiveHeaders = Object.keys(rows[0] ?? {});
    const missing = validateColumns(effectiveHeaders);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missing.join(", ")}` },
        { status: 422 }
      );
    }

    // ── Normalize ──────────────────────────────────────────────────────────────
    const normalized = rows
      .map((row) => {
        try {
          return normalizeRow(row);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as ReturnType<typeof normalizeRow>[];

    if (!normalized.length) {
      return NextResponse.json({ error: "No valid rows after normalization" }, { status: 422 });
    }

    // Financial reports must not silently ignore malformed rows.
    const skipped = rows.length - normalized.length;
    if (skipped > 0) {
      return NextResponse.json(
        {
          error: `${skipped} of ${rows.length} rows could not be parsed. Please check your CSV format or use the Itemized export from Stripe.`,
        },
        { status: 422 }
      );
    }

    // USD-only beta: block non-USD CSV
    if (!isDemo) {
      const currencies = [...new Set(normalized.map((r) => r.currency?.toLowerCase()).filter(Boolean))];
      const nonUsd = currencies.filter((c) => c !== "usd");
      if (nonUsd.length > 0) {
        return NextResponse.json(
          {
            error: `USD accounts only in beta. Your CSV contains: ${nonUsd.map((c) => c.toUpperCase()).join(", ")}. Multi-currency support is coming soon.`,
          },
          { status: 422 }
        );
      }
    }

    // ── Analyze ────────────────────────────────────────────────────────────────
    const result = analyze(normalized);
    const storedResult = redactAnalysisResultForStorage(result);
    const accessToken = createReportAccessToken();

    const reportId = await createReport({
      sessionId: isDemo ? "demo-sample" : crypto.randomUUID(),
      blobUrl: null,
      result: storedResult,
      accessTokenHash: hashReportAccessToken(accessToken),
      retention: FULL_REPORTS_FREE_DURING_BETA && !isDemo ? "beta_full_access" : "free_preview",
    });

    logFunnelServer("funnel_analyze_saved", {
      mode: result.mode,
      is_demo: isDemo,
    });

    const res = NextResponse.json({
      reportId,
      mode: result.mode,
      isDemo,
      summary: {
        chargeVolume: result.chargeVolume,
        chargeFees: result.chargeFees,
        chargeRate: result.chargeRate,
        otherFees: result.otherFees,
        allInFees: result.allInFees,
        allInRate: result.allInRate,
        periodDelta: result.periodDelta,
        monthCount: result.monthly.length,
        anomalyCount: result.anomalies.length,
      },
    });
    appendReportAccessCookie(res, reportId, accessToken);
    return res;
  } catch (err) {
    console.error("[analyze]", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
