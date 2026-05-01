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

export const maxDuration = 30;

const FREE_LIMIT = 3;
const MAX_CSV_BYTES = 10 * 1024 * 1024;

// Only these canonical column names are allowed in mapping to prevent prototype pollution
const ALLOWED_CANONICAL = new Set(["id", "type", "amount", "fee", "net", "currency", "created", "description", "source", "status"]);

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────────
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

    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_CSV_BYTES + 256 * 1024) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
    }

    // ── Parse request ──────────────────────────────────────────────────────────
    const body = (await req.json()) as {
      csvText?: string;
      columnMapping?: Record<string, string>;
    };

    if (!body.csvText || !body.csvText.trim()) {
      return NextResponse.json({ error: "csvText is required" }, { status: 400 });
    }

    // Server-side size limit (~10 MB UTF-8 bytes — String.length is UTF-16 units)
    if (Buffer.byteLength(body.csvText, "utf8") > MAX_CSV_BYTES) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
    }

    const csvText = body.csvText;
    // csvText is used only in-memory and passed to analyze(); it is never logged or written to disk.

    // ── Parse CSV ─────────────────────────────────────────────────────────────
    const parsed = Papa.parse<RawRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (!parsed.data.length) {
      return NextResponse.json({ error: "CSV is empty or could not be parsed" }, { status: 422 });
    }

    // Apply column mapping if provided — only allow known canonical keys
    let rows = parsed.data;
    if (body.columnMapping && Object.keys(body.columnMapping).length > 0) {
      rows = rows.map((row) => {
        const remapped: RawRow = { ...row };
        for (const [canonical, original] of Object.entries(body.columnMapping!)) {
          if (!ALLOWED_CANONICAL.has(canonical)) continue; // blocks __proto__, constructor, etc.
          if (original && original !== canonical) {
            remapped[canonical] = row[original];
          }
        }
        return remapped;
      });
    }

    // Validate required columns
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

    // ── Save to DB ─────────────────────────────────────────────────────────────
    const reportId = await createReport({
      sessionId: crypto.randomUUID(),
      blobUrl: null,
      result,
      accessTokenHash: hashReportAccessToken(accessToken),
    });

    // ── Response ───────────────────────────────────────────────────────────────
    return NextResponse.json({
      reportId,
      accessToken,
      mode: result.mode,
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
