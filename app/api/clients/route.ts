import { NextRequest, NextResponse } from "next/server";
import { consumeIpRequest, createClient, isActiveMonitorSubscriber, listClientsForEmail } from "@/lib/db";
import { getMonitorSessionEmail } from "@/lib/monitor-session";
import { getTrustedClientIp } from "@/lib/request-ip";

const MAX_BODY_BYTES = 2 * 1024;
const LIMIT_PER_IP_PER_DAY = 120;

async function authorize(req: NextRequest): Promise<{ email: string } | NextResponse> {
  const ip = getTrustedClientIp(req);
  if (!ip) return NextResponse.json({ error: "Unable to process request" }, { status: 400 });
  if (!(await consumeIpRequest(`monitor_clients:${ip}`, LIMIT_PER_IP_PER_DAY))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const email = getMonitorSessionEmail(req);
  if (!email || !(await isActiveMonitorSubscriber(email))) {
    return NextResponse.json({ error: "Verified Fee Monitor session required" }, { status: 401 });
  }
  return { email };
}

export async function GET(req: NextRequest) {
  const auth = await authorize(req);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json({ clients: await listClientsForEmail(auth.email) });
}

export async function POST(req: NextRequest) {
  const auth = await authorize(req);
  if (auth instanceof NextResponse) return auth;
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return NextResponse.json({ error: "Request body too large" }, { status: 413 });
  let body: { name?: unknown };
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 120) return NextResponse.json({ error: "Client name must be 2–120 characters" }, { status: 400 });
  const client = await createClient(auth.email, name);
  if (!client) return NextResponse.json({ error: "Could not create client profile" }, { status: 400 });
  return NextResponse.json({ client });
}
