import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { validateColumns, normalizeRow, type RawRow } from "@/lib/csv-parser";
import { analyze } from "@/lib/fee-analyzer";
import { createReport, countReportsForIp, recordIpRequest } from "@/lib/db";

export const maxDuration = 30;

const FREE_LIMIT = 3; // requests per IP per day

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────────
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const count = await countReportsForIp(ip);
    if (count >= FREE_LIMIT) {
      return NextResponse.json(
        { error: "Rate limit reached. Max 3 free reports per day per IP." },
        { status: 429 }
      );
    }

    // ── Parse request ──────────────────────────────────────────────────────────
    const body = (await req.json()) as {
      blobUrl: string;
      sessionId: string;
      columnMapping?: Record<string, string>;
    };

    if (!body.blobUrl || !body.sessionId) {
      return NextResponse.json({ error: "blobUrl and sessionId are required" }, { status: 400 });
    }

    // ── Fetch CSV from Blob ────────────────────────────────────────────────────
    const csvResponse = await fetch(body.blobUrl);
    if (!csvResponse.ok) {
      return NextResponse.json({ error: "Could not fetch uploaded file" }, { status: 400 });
    }
    const csvText = await csvResponse.text();

    // ── Parse CSV ─────────────────────────────────────────────────────────────
    const parsed = Papa.parse<RawRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (!parsed.data.length) {
      return NextResponse.json({ error: "CSV is empty or could not be parsed" }, { status: 422 });
    }

    const headers = parsed.meta.fields ?? [];

    // Apply column mapping if provided
    let rows = parsed.data;
    if (body.columnMapping && Object.keys(body.columnMapping).length > 0) {
      rows = rows.map((row) => {
        const remapped: RawRow = { ...row };
        for (const [canonical, original] of Object.entries(body.columnMapping!)) {
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

    // ── Save to DB ─────────────────────────────────────────────────────────────
    const reportId = await createReport({
      sessionId: body.sessionId,
      blobUrl: body.blobUrl,
      result,
    });

    await recordIpRequest(ip);

    // ── Response ───────────────────────────────────────────────────────────────
    return NextResponse.json({
      reportId,
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
