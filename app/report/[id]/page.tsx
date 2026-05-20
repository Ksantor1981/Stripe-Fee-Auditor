import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getReportWithAccess } from "@/lib/db";
import { FULL_REPORTS_FREE_DURING_BETA } from "@/lib/beta-access";
import { resolveReportAccessToken } from "@/lib/report-access-cookie";
import { getSiteBaseUrl } from "@/lib/site-url";
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
  const teaserSavings = result.savingsOpportunities?.slice(0, 1).map((opp) => ({
    ...opp,
    // Free preview shows one value teaser, but keeps the step-by-step plan gated.
    steps: undefined,
  }));
  const teaserAnomalies = result.annotatedAnomalies?.slice(0, 1);

  return {
    ...result,
    // Free preview deliberately contains only the rows the UI is allowed to show.
    topDrivers: result.topDrivers.slice(0, 3),
    anomalies: [],
    annotatedAnomalies: teaserAnomalies ?? [],
    savingsOpportunities: teaserSavings ?? [],
    // Keep monthly totals visible so users can reconcile the preview against Stripe before paying.
    monthly: result.monthly,
    // Paid-only aggregates can otherwise leak the value of the full report through client props.
    benchmark: undefined,
    refundSummary: undefined,
    transactionBuckets: undefined,
    geographySummary: undefined,
    feeMix: undefined,
  };
}

export default async function ReportPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { token: queryToken, demo, payment } = await searchParams;
  const demoSkipGate = demo === "1" || demo === "true";

  if (!UUID_V4.test(id)) notFound();

  const cookieStore = await cookies();
  const cookieToken = resolveReportAccessToken(id, { cookieStore });

  if (queryToken && !cookieToken) {
    const exchange = new URLSearchParams({ reportId: id, token: queryToken });
    if (demo) exchange.set("demo", demo);
    if (payment) exchange.set("payment", payment);
    redirect(`/api/report/access?${exchange.toString()}`);
  }

  const token = cookieToken || queryToken || "";

  const report = await getReportWithAccess(id, token);

  if (!report || !report.result) {
    notFound();
  }

  const rawResult = report.result;
  const demoFullAccess = demoSkipGate && report.session_id === "demo-sample";
  const betaFullAccess = FULL_REPORTS_FREE_DURING_BETA && !demoFullAccess;
  const hasFullAccess = Boolean(report.is_paid || demoFullAccess || betaFullAccess);
  const paymentPending = payment === "success" && !report.is_paid && !betaFullAccess;
  const embedShareUrl =
    hasFullAccess && token
      ? `${getSiteBaseUrl()}/embed/${id}?token=${encodeURIComponent(token)}`
      : undefined;

  return (
    <ReportShell
      reportId={id}
      embedShareUrl={embedShareUrl}
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
