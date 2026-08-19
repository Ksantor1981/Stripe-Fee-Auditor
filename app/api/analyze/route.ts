import { NextRequest, NextResponse } from "next/server";
import { validateColumns, normalizeRow, type RawRow } from "@/lib/csv-parser";
import { analyze, redactAnalysisResultForStorage } from "@/lib/fee-analyzer";
import { logFunnelServer } from "@/lib/funnel-log";
import {
  consumeIpRequest,
  createReport,
  createReportAccessToken,
  hashReportAccessToken,
} from "@/lib/db";
import { encryptSecretPayload } from "@/lib/token-crypto";
import { readAttributionFromRequest } from "@/lib/attribution";
import { getTrustedClientIp } from "@/lib/request-ip";
import { SAMPLE_CSV } from "@/lib/sampleData";
import { MAX_CSV_ROWS, sanitizeColumnMapping, parseCsvWithRowLimit } from "@/lib/analyze-input";
import { prepareStripeCsvRows } from "@/lib/stripe-csv-import";
import { appendReportAccessCookie } from "@/lib/report-access-cookie";
import { logOpsError, logOpsInfo } from "@/lib/ops-log";
import {
  isStripeAccountCountry,
  type StripeAccountCountry,
} from "@/lib/stripe-country-fees";
import { validateSettlementCurrency } from "@/lib/settlement-currency";
import { hasMaterialFinding, paymentVolumeSegment } from "@/lib/product-analytics";

export const maxDuration = 30;

const ANALYZE_LIMIT_PER_IP_PER_DAY = 10;
const ANALYZE_REQUEST_LIMIT_PER_IP_PER_DAY = 20;
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
  let failureStage = "request";

  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > VERCEL_MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body too large (max ~4 MB CSV)" }, { status: 413 });
    }

    // Limit before reading the body. Per-analysis limits below still distinguish
    // real uploads from the sample, but this protects parsing/memory from repeats.
    const ip = getTrustedClientIp(req);
    if (!ip) {
      return NextResponse.json(
        { error: "Unable to process request" },
        { status: 400 }
      );
    }

    failureStage = "request_rate_limit";
    const requestAllowed = await consumeIpRequest(
      `analyze_request:${ip}`,
      ANALYZE_REQUEST_LIMIT_PER_IP_PER_DAY
    );
    if (!requestAllowed) {
      return NextResponse.json(
        { error: "Too many analysis requests from this network. Try again tomorrow." },
        { status: 429 }
      );
    }

    let body: {
      csvText?: string;
      columnMapping?: Record<string, string>;
      accountCountry?: StripeAccountCountry;
      clientId?: string;
    };
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

    if (body.accountCountry !== undefined && !isStripeAccountCountry(body.accountCountry)) {
      return NextResponse.json({ error: "Unsupported Stripe account country" }, { status: 400 });
    }
    const accountCountry: StripeAccountCountry = isDemo
      ? "US"
      : body.accountCountry ?? "US";

    // ── Rate limiting ─────────────────────────────────────────────────────────
    if (!isDemo && !(await consumeIpRequest(`analyze:${ip}`, ANALYZE_LIMIT_PER_IP_PER_DAY))) {
      return NextResponse.json(
        {
          error: "Rate limit reached. Max 10 free reports per day per IP.",
        },
        { status: 429 }
      );
    }

    // ── Parse CSV (abort early if row count exceeds limit) ───────────────────
    const parsed = parseCsvWithRowLimit(csvText);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: `CSV too many rows (max ${MAX_CSV_ROWS}). Narrow your Stripe date range and export again.` },
        { status: 413 }
      );
    }

    const { rows: parsedRows, errors: parseErrors } = parsed;

    if (!parsedRows.length) {
      return NextResponse.json({ error: "CSV is empty or could not be parsed" }, { status: 422 });
    }

    if (parseErrors.length > 0) {
      return NextResponse.json(
        {
          error: `CSV parse error near row ${parseErrors[0]?.row ?? "unknown"}: ${parseErrors[0]?.message ?? "invalid CSV"}`,
        },
        { status: 422 }
      );
    }

    const columnMapping = sanitizeColumnMapping(body.columnMapping, ALLOWED_CANONICAL);

    const rawHeaders = Object.keys(parsedRows[0] ?? {});
    const prepared = prepareStripeCsvRows(parsedRows, rawHeaders);
    let rows = prepared.rows;
    const csvFormatNotice = prepared.notice;

    if (prepared.format === "payments" && !rows.length) {
      return NextResponse.json(
        {
          error:
            "No paid charges found in Payments export. Try Reports → Balance summary → Export → Itemized.",
        },
        { status: 422 }
      );
    }

    if (prepared.format === "unknown" && columnMapping && Object.keys(columnMapping).length > 0) {
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
        { error: `Missing required columns: ${missing.join(", ")}. Export from Stripe Dashboard → Reports → Balance summary → Itemized, or Payments → Export.` },
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

    if (!isDemo) {
      const currencies = normalized.map((r) => r.currency).filter(Boolean) as string[];
      const settlement = validateSettlementCurrency(currencies, accountCountry);
      if (!settlement.ok) {
        logOpsInfo("settlement_currency_rejected", {
          code: settlement.code,
          account_country: accountCountry,
          currencies: currencies.join(","),
        });
        return NextResponse.json({ error: settlement.error }, { status: 422 });
      }
    }

    // ── Analyze ────────────────────────────────────────────────────────────────
    failureStage = "calculation";
    const result = analyze(normalized, { accountCountry });
    const volumeSegment = paymentVolumeSegment(result);
    const materialFinding = hasMaterialFinding(result);
    const storedResult = redactAnalysisResultForStorage(result);
    const accessToken = createReportAccessToken();
    failureStage = "token_encryption";
    const accessTokenCiphertext = encryptSecretPayload(accessToken);

    let reportId: string;
    try {
      failureStage = "report_storage";
      reportId = await createReport({
        sessionId: isDemo ? "demo-sample" : crypto.randomUUID(),
        blobUrl: null,
        result: storedResult,
        accessTokenHash: hashReportAccessToken(accessToken),
        accessTokenCiphertext,
        retention: !isDemo ? "beta_full_access" : "free_preview",
        attribution: isDemo ? undefined : readAttributionFromRequest(req),
        clientId: typeof body.clientId === "string" ? body.clientId : null,
      });
    } catch (err) {
      if (err instanceof Error && err.message === "Invalid clientId") {
        return NextResponse.json({ error: "Unknown client profile" }, { status: 400 });
      }
      throw err;
    }

    logFunnelServer("funnel_analyze_saved", {
      mode: result.mode,
      is_demo: isDemo,
    });

    const attribution = isDemo ? {} : readAttributionFromRequest(req);
    logFunnelServer("analysis_completed", {
      mode: result.mode,
      is_demo: isDemo,
      account_country: accountCountry,
      payment_volume_segment: volumeSegment,
      effective_rate: result.allInRate,
      transaction_count: result.chargeCount ?? 0,
      total_fees: result.allInFees,
      has_international: (result.geographySummary?.internationalCount ?? 0) > 0,
      has_refunds: (result.refundSummary?.count ?? 0) > 0,
      traffic_source: attribution.utm_source ?? (attribution.referrer ? "referral" : "direct_or_organic"),
      landing_page: attribution.landing_path ?? "unknown",
    });
    if (materialFinding) {
      logFunnelServer("material_issue_found", {
        mode: result.mode,
        is_demo: isDemo,
        payment_volume_segment: volumeSegment,
      });
    }

    const res = NextResponse.json({
      reportId,
      mode: result.mode,
      account_country: accountCountry,
      isDemo,
      ...(csvFormatNotice ? { csvFormatNotice } : {}),
      summary: {
        chargeVolume: result.chargeVolume,
        chargeFees: result.chargeFees,
        chargeRate: result.chargeRate,
        otherFees: result.otherFees,
        allInFees: result.allInFees,
        allInRate: result.allInRate,
        periodDelta: result.periodDelta,
        monthCount: result.monthly.length,
        anomalyCount: result.anomalyCount ?? result.anomalies.length,
        paymentVolumeSegment: volumeSegment,
        materialFinding,
      },
    });
    failureStage = "access_cookie";
    appendReportAccessCookie(res, reportId, accessToken);
    return res;
  } catch (err) {
    logOpsError("analyze_failed", {
      message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
    });
    return NextResponse.json(
      { error: "Analysis failed", code: `ANALYZE_${failureStage.toUpperCase()}_FAILED` },
      { status: 500 }
    );
  }
}
