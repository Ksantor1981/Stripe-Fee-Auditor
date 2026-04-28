import { NextRequest, NextResponse } from "next/server";

// POST /api/upload — Day 3
export async function POST(_req: NextRequest) {
  return NextResponse.json({ message: "upload endpoint — Day 3" }, { status: 501 });
}
