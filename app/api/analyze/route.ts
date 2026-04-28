import { NextRequest, NextResponse } from "next/server";

// POST /api/analyze — Day 3
export async function POST(_req: NextRequest) {
  return NextResponse.json({ message: "analyze endpoint — Day 3" }, { status: 501 });
}
