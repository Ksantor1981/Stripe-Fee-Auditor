import { notFound } from "next/navigation";
import { getReportWithAccess } from "@/lib/db";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { ReportShell } from "./_components/ReportShell";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata() {
  return {
    title: `Your Stripe Fee Report — Stripe Fee Auditor`,
    robots: "noindex",
  };
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toPreviewResult(result: AnalysisResult): AnalysisResult {
  return {
    ...result,
    // Free preview deliberately contains only the rows the UI is allowed to show.
    topDrivers: result.topDrivers.slice(0, 3),
    anomalies: [],
    monthly: result.monthly.map((month) => ({
      month: month.month,
      fees: month.fees,
      rate: month.rate,
      volume: 0,
      count: 0,
    })),
  };
}

export default async function ReportPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { token = "" } = await searchParams;

  if (!UUID_V4.test(id)) notFound();

  const report = await getReportWithAccess(id, token);

  if (!report || !report.result) {
    notFound();
  }

  return (
    <ReportShell
      reportId={id}
      accessToken={token}
      result={report.is_paid ? report.result : toPreviewResult(report.result)}
      isPaid={report.is_paid ?? false}
    />
  );
}
