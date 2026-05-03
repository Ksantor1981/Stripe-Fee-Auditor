import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { validateColumns, normalizeRow, type RawRow } from "@/lib/csv-parser";
import { analyze } from "@/lib/fee-analyzer";
import {
  consumeIpRequest,
  createReport,
  createReportAccessToken,
  hashReportAccessToken,
} from "@/lib/db";
import { getTrustedClientIp } from "@/lib/request-ip";
import { SAMPLE_CSV } from "@/lib/sampleData";

export const maxDuration = 30;

const FREE_LIMIT = 3;
const VERCEL_MAX_BODY_BYTES = Math.floor(4.5 * 1024 * 1024);
const MAX_CSV_BYTES = 4 * 1024 * 1024;

const ALLOWED_CANONICAL = new Set(["id", "type", "amount", "fee", "net", "currency", "created", "description", "source", "status"]);

/** Normalise whitespace so comparison is robust */
const SAMPLE_CSV_TRIMMED = SAMPLE_CSV.trim();

function isSampleCsv(csvText: string): boolean {
  return csvText.trim() === SAMPLE_CSV_TRIMMED;
}

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > VERCEL_MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body too large (max ~4 MB CSV)" }, { status: 413 });
    }

    const body = (await req.json()) as {
      csvText?: string;
      columnMapping?: Record<string, string>;
    };

    if (!body.csvText || !body.csvText.trim()) {
      return NextResponse.json({ error: "csvText is required" }, { status: 400 });
    }

    if (Buffer.byteLength(body.csvText, "utf8") > MAX_CSV_BYTES) {
      return NextResponse.json({ error: "File too large (max 4 MB)" }, { status: 413 });
    }

    const csvText = body.csvText;
    const isDemo = isSampleCsv(csvText);

    // ── Rate limiting — skip for demo sample ──────────────────────────────────
    if (!isDemo) {
      const ip = getTrustedClientIp(req);
      if (!ip) {
        return NextResponse.json(
          { error: "Unable to process request" },
          { status: 400 }
        );
      }

      const allowed = await consumeIpRequest(ip, FREE_LIMIT);
      if (!allowed) {
        return NextResponse.json(
          { error: "Rate limit reached. Max 3 free reports per day per IP." },
          { status: 429 }
        );
      }
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

    let rows = parsed.data;
    if (body.columnMapping && Object.keys(body.columnMapping).length > 0) {
      rows = rows.map((row) => {
        const remapped: RawRow = { ...row };
        for (const [canonical, original] of Object.entries(body.columnMapping!)) {
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

    // ── Analyze ────────────────────────────────────────────────────────────────
    const result = analyze(normalized);
    const accessToken = createReportAccessToken();

    const reportId = await createReport({
      sessionId: crypto.randomUUID(),
      blobUrl: null,
      result,
      accessTokenHash: hashReportAccessToken(accessToken),
    });

    return NextResponse.json({
      reportId,
      accessToken,
      mode: result.mode,
      isDemo,
      summary: {
        chargeVolume: result.chargeVolume,
        chargeFees: result.chargeFees,
        chargeRate: result.chargeRate,
        otherFees: result.otherFees,
        periodDelta: result.periodDelta,
        monthCount: result.monthly.length,
        anomalyCount: result.anomalies.length,
      },
    });
  } catch (err) {
    console.error("[analyze]", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
