import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { getReportWithAccess } from "@/lib/db";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Prevent CSV formula injection (Excel/Sheets executes cells starting with = + - @ |).
// If you export description or other free-text columns later, run those cells through sanitize().
function sanitize(value: string): string {
  if (typeof value !== "string") return value;
  return /^[=+\-@|]/.test(value) ? `'${value}` : value;
}

export async function GET(req: NextRequest) {
  const reportId = req.nextUrl.searchParams.get("reportId");
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!reportId || !token) {
    return NextResponse.json({ error: "reportId and token required" }, { status: 400 });
  }

  if (!UUID_V4.test(reportId)) {
    return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
  }

  const report = await getReportWithAccess(reportId, token);
  if (!report || !report.result) {
    return NextResponse.json({ error: "Report not found or expired" }, { status: 404 });
  }

  if (!report.is_paid) {
    return NextResponse.json({ error: "Purchase required to export" }, { status: 403 });
  }

  const { monthly, topDrivers, anomalies, chargeVolume, chargeFees, chargeRate, otherFees } = report.result;

  // Sheet 1 — summary row
  const summaryRows = [
    { section: "Summary", key: "Charge Volume", value: chargeVolume.toFixed(2) },
    { section: "Summary", key: "Charge Fees", value: chargeFees.toFixed(2) },
    { section: "Summary", key: "Effective Rate %", value: chargeRate.toFixed(4) },
    { section: "Summary", key: "Other Fees", value: otherFees.toFixed(2) },
    { section: "", key: "", value: "" },
  ];

  // Sheet 2 — monthly breakdown
  const monthlyRows = monthly.map((m) => ({
    section: "Monthly",
    month: m.month,
    volume: m.volume.toFixed(2),
    fees: m.fees.toFixed(2),
    rate_pct: m.rate.toFixed(4),
    charge_count: m.count,
  }));

  // Alias used throughout — must be declared before first use
  const san = sanitize;

  // Sheet 3 — anomalies
  const anomalyRows = anomalies.map((r) => ({
    section: "Anomaly",
    id: san(r.id),
    date: san(r.date),
    amount: r.amount.toFixed(2),
    fee: r.fee.toFixed(2),
    rate_pct: r.amount > 0 ? ((r.fee / r.amount) * 100).toFixed(4) : "0",
    currency: san(r.currency),
  }));

  // Combine into one CSV
  const allRows = [
    ...summaryRows.map((r) => ({ ...r })),
    ...monthlyRows,
    ...anomalyRows,
    ...topDrivers.slice(0, 20).map((r) => ({
      section: "TopDriver",
      id: san(r.id),
      date: san(r.date),
      amount: r.amount.toFixed(2),
      fee: r.fee.toFixed(2),
      rate_pct: r.amount > 0 ? ((r.fee / r.amount) * 100).toFixed(4) : "0",
      currency: san(r.currency),
    })),
  ];

  const csv = Papa.unparse(allRows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stripe-fee-report-${reportId.slice(0, 8)}.csv"`,
    },
  });
}
