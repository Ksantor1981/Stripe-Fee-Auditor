import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://stripe-fee-auditor.vercel.app"
  ),
  title: "Stripe Fee Auditor — See Your Real Stripe Fee Rate",
  description:
    "Upload your Stripe Balance CSV and instantly see your effective fee rate, fee drivers, and savings opportunities. No account required. Results expire in 1 hour.",
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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
