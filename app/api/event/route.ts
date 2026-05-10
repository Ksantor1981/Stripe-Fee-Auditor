import { NextRequest, NextResponse } from "next/server";
import { consumeIpRequest } from "@/lib/db";
import {
  isValidFunnelEventName,
  logFunnelClientApi,
  sanitizeFunnelProps,
} from "@/lib/funnel-log";
import { getTrustedClientIp } from "@/lib/request-ip";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8192;

export async function POST(req: NextRequest) {
  const ip = getTrustedClientIp(req);
  if (ip) {
    const allowed = await consumeIpRequest(`event:${ip}`, 120); // 120 events/day per IP
    if (!allowed) {
      return new NextResponse(null, { status: 429 });
    }
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Body too large" }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = (raw as { name?: unknown }).name;
  if (!isValidFunnelEventName(name)) {
    return NextResponse.json({ error: "Invalid event name" }, { status: 400 });
  }

  const props = sanitizeFunnelProps((raw as { props?: unknown }).props);
  logFunnelClientApi(name, props);

  return new NextResponse(null, { status: 204 });
}
