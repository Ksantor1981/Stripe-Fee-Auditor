import { NextRequest, NextResponse } from "next/server";
import {
  isActiveMonitorSubscriber,
  softHideMonitorReport,
} from "@/lib/db";
import { resolveReportAccessFromRequest } from "@/lib/report-access-cookie";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_V4.test(id)) {
    return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (!(await isActiveMonitorSubscriber(email))) {
    return NextResponse.json({ error: "Fee Monitor subscription required" }, { status: 403 });
  }

  const token = resolveReportAccessFromRequest(req, id);
  if (!token) {
    return NextResponse.json({ error: "Report access token required" }, { status: 401 });
  }

  const hidden = await softHideMonitorReport(id, token, email);
  if (!hidden) {
    return NextResponse.json({ error: "Report not found or already hidden" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
