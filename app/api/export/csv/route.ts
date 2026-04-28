import { NextRequest, NextResponse } from "next/server";

// GET /api/export/csv?reportId=... — Day 5
export async function GET(_req: NextRequest) {
  return NextResponse.json({ message: "csv export — Day 5" }, { status: 501 });
}
