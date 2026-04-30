import { NextRequest, NextResponse } from "next/server";
import { saveReportEmail } from "@/lib/db";

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

  let email: string;
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  try {
    await saveReportEmail(id, email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[email-gate]", err);
    return NextResponse.json({ error: "Failed to save email" }, { status: 500 });
  }
}
