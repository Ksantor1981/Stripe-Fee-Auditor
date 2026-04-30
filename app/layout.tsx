import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://stripe-fee-auditor.vercel.app"
  ),
  title: "Stripe Fee Auditor — See Your Real Stripe Fee Rate",
  description:
    "Upload your Stripe Balance CSV and instantly see your effective fee rate, fee drivers, and savings opportunities. No account required. CSV files are not stored.",
  openGraph: {
    title: "Stripe Fee Auditor",
    description: "See your real Stripe fee rate in 30 seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
