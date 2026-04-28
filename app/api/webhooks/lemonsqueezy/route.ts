import { NextRequest, NextResponse } from "next/server";

// POST /api/webhooks/lemonsqueezy — Day 5
export async function POST(_req: NextRequest) {
  return NextResponse.json({ received: true });
}
