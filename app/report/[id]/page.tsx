import { notFound } from "next/navigation";
import { getReportWithAccess } from "@/lib/db";
import { FULL_REPORTS_FREE_DURING_BETA } from "@/lib/beta-access";
import type { AnalysisResult } from "@/lib/fee-analyzer";
import { ReportShell } from "./_components/ReportShell";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; demo?: string; payment?: string }>;
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
    annotatedAnomalies: [],
    savingsOpportunities: [],
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
  const { token = "", demo, payment } = await searchParams;
  const demoSkipGate = demo === "1" || demo === "true";

  if (!UUID_V4.test(id)) notFound();

  const report = await getReportWithAccess(id, token);

  if (!report || !report.result) {
    notFound();
  }

  const rawResult = report.result;
  const demoFullAccess = demoSkipGate && report.session_id === "demo-sample";
  const betaFullAccess = FULL_REPORTS_FREE_DURING_BETA && !demoFullAccess;
  const hasFullAccess = Boolean(report.is_paid || demoFullAccess || betaFullAccess);
  const paymentPending = payment === "success" && !report.is_paid && !betaFullAccess;

  return (
    <ReportShell
      reportId={id}
      accessToken={token}
      result={hasFullAccess ? rawResult : toPreviewResult(rawResult)}
      isPaid={report.is_paid ?? false}
      demoSkipEmailGate={demoSkipGate}
      demoFullAccess={demoFullAccess}
      betaFullAccess={betaFullAccess}
      paymentPending={paymentPending}
      previewAnomalyCount={hasFullAccess ? undefined : rawResult.anomalies.length}
    />
  );
}
