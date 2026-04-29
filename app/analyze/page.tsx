import { AnalyzeClient } from "./_components/AnalyzeClient";

export const metadata = {
  title: "Analyze My Stripe Fees — Stripe Fee Auditor",
  description: "Upload your Stripe Balance CSV and see your real fee rate in 30 seconds.",
};

export default function AnalyzePage() {
  return <AnalyzeClient />;
}
