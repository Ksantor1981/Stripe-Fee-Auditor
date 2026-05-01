import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://stripe-fee-auditor.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Stripe Fee Auditor — See Your Real Stripe Fee Rate",
  description:
    "Upload your Stripe Balance CSV and instantly see your effective fee rate, fee drivers, and savings opportunities. No account required. CSV files are not stored.",
  openGraph: {
    title: "Stripe Fee Auditor",
    description: "See your real Stripe fee rate from your Balance CSV",
    type: "website",
    url: "/",
    siteName: "Stripe Fee Auditor",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Stripe Fee Auditor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stripe Fee Auditor",
    description: "See your real Stripe fee rate from your Balance CSV",
    images: ["/og-image.png"],
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
