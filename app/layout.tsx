import type { Metadata } from "next";
import "./globals.css";

const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://feeauditor.com").replace(/\/$/, "");
const ogImageUrl = `${siteUrl}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  title: "Stripe Fee Auditor — See Your Real Stripe Fee Rate",
  description:
    "Upload your Stripe Balance CSV and instantly see your effective fee rate, fee drivers, and savings opportunities. No account required. CSV files are not stored.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Stripe Fee Auditor",
    description: "See your real effective Stripe fee rate from your Balance CSV. 100% local.",
    type: "website",
    url: siteUrl,
    siteName: "Stripe Fee Auditor",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Stripe Fee Auditor — effective Stripe fee rate from your Balance CSV",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stripe Fee Auditor",
    description: "See your real effective Stripe fee rate from your Balance CSV. 100% local.",
    images: [ogImageUrl],
  },
  other: {
    "twitter:domain": "feeauditor.com",
    "twitter:url": siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script async src="https://plausible.io/js/pa-NtZAVMy_DG97Ek3wmMn6V.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
plausible.init()
`.trim(),
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
