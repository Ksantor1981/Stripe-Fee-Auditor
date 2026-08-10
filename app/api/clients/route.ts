import { NextRequest, NextResponse } from "next/server";
import {
  createClient,
  isActiveMonitorSubscriber,
  listClientsForEmail,
} from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (!(await isActiveMonitorSubscriber(email))) {
    return NextResponse.json({ error: "Fee Monitor subscription required" }, { status: 403 });
  }

  const clients = await listClientsForEmail(email);
  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const name = body.name?.trim() ?? "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "Client name must be 2–120 characters" }, { status: 400 });
  }
  if (!(await isActiveMonitorSubscriber(email))) {
    return NextResponse.json({ error: "Fee Monitor subscription required" }, { status: 403 });
  }

  const client = await createClient(email, name);
  if (!client) {
    return NextResponse.json({ error: "Could not create client profile" }, { status: 400 });
  }

  return NextResponse.json({ client });
}
