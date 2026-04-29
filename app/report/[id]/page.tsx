import { notFound } from "next/navigation";
import { getReport } from "@/lib/db";
import { ReportShell } from "./_components/ReportShell";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `Your Stripe Fee Report — Stripe Fee Auditor`,
    robots: "noindex",
  };
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report || !report.result) {
    notFound();
  }

  return <ReportShell reportId={id} result={report.result} isPaid={report.is_paid ?? false} />;
}
