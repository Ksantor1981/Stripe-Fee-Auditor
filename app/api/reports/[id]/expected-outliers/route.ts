import { NextRequest, NextResponse } from "next/server";
import { getReportWithAccess, saveExpectedOutlierIds } from "@/lib/db";
import { resolveReportAccessFromRequest } from "@/lib/report-access-cookie";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_IDS = 200;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!UUID_V4.test(id)) {
    return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
  }

  let excludedIds: string[] = [];
  try {
    const body: unknown = await req.json();
    if (
      body &&
      typeof body === "object" &&
      "excludedIds" in body &&
      Array.isArray((body as { excludedIds: unknown }).excludedIds)
    ) {
      excludedIds = (body as { excludedIds: unknown[] }).excludedIds.filter(
        (value): value is string => typeof value === "string"
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (excludedIds.length > MAX_IDS) {
    return NextResponse.json({ error: "Too many excluded transactions" }, { status: 400 });
  }

  const token = resolveReportAccessFromRequest(req, id);
  if (!token) {
    return NextResponse.json({ error: "Report access token required" }, { status: 401 });
  }

  const report = await getReportWithAccess(id, token).catch(() => null);
  if (!report?.result) {
    return NextResponse.json({ error: "Report not found or expired" }, { status: 404 });
  }

  if (!report.result.chargeLedger?.length) {
    return NextResponse.json(
      { error: "This report does not support outlier adjustments. Upload a fresh CSV to enable it." },
      { status: 422 }
    );
  }

  const saved = await saveExpectedOutlierIds(id, token, excludedIds);
  if (!saved) {
    return NextResponse.json({ error: "Report not found or expired" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, excludedIds: [...new Set(excludedIds.filter(Boolean))] });
}
