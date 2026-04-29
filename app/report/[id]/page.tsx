import { notFound } from "next/navigation";
import { getReport } from "@/lib/db";
import { ReportShell } from "./_components/ReportShell";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  return {
    title: `Your Stripe Fee Report — Stripe Fee Auditor`,
    robots: "noindex",
  };
}

export default async function ReportPage({ params }: Props) {
  const report = await getReport(params.id);

  if (!report || !report.result) {
    notFound();
  }

  return <ReportShell reportId={params.id} result={report.result} isPaid={report.is_paid ?? false} />;
}
