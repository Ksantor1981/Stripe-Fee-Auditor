import type { Metadata } from "next";
import "./globals.css";
import { buildOgImageUrl } from "@/lib/seo-og";

const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://feeauditor.com").replace(/\/$/, "");

// Dynamic OG via /api/og — avoids shipping the 1.4 MB static og-image.png as
// the global fallback and keeps social previews consistent with blog OG images.
const ogImageUrl = buildOgImageUrl({
  title: "See your real Stripe fee rate",
  eyebrow: "Stripe Fee Auditor",
});

// Search engine verification — set in Vercel env (redeploy after adding):
// NEXT_PUBLIC_GSC_VERIFICATION, NEXT_PUBLIC_BING_VERIFICATION, NEXT_PUBLIC_YANDEX_VERIFICATION
/** Strip accidental full meta-tag paste; keep only the content value. */
function normalizeVerificationCode(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  const fromContent = trimmed.match(/content=["']([^"']+)["']/i);
  if (fromContent) return fromContent[1];
  return trimmed.replace(/<\/?meta[^>]*>/gi, "").trim() || trimmed;
}

const gscVerification = normalizeVerificationCode(process.env.NEXT_PUBLIC_GSC_VERIFICATION);
const bingVerification =
  normalizeVerificationCode(process.env.NEXT_PUBLIC_BING_VERIFICATION) ||
  "457247AA9DD926BC6F4668EB88F91BFE";
const yandexVerification = normalizeVerificationCode(process.env.NEXT_PUBLIC_YANDEX_VERIFICATION);

function buildSiteVerification(): Metadata["verification"] | undefined {
  const other: Record<string, string> = {};
  if (bingVerification) other["msvalidate.01"] = bingVerification;

  const verification: NonNullable<Metadata["verification"]> = {};
  if (gscVerification) verification.google = gscVerification;
  if (yandexVerification) verification.yandex = yandexVerification;
  if (Object.keys(other).length > 0) verification.other = other;

  if (!verification.google && !verification.yandex && !verification.other) return undefined;
  return verification;
}

const siteVerification = buildSiteVerification();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicon-32.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  title: "Stripe Fee Auditor — See Your Real Stripe Fee Rate",
  description:
    "Upload your Stripe Balance CSV and instantly see your effective fee rate, fee drivers, and savings opportunities. No OAuth. No account signup. Raw CSV files are not stored.",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": `${siteUrl}/feed.xml`,
    },
  },
  ...(siteVerification ? { verification: siteVerification } : {}),
  openGraph: {
    title: "Stripe Fee Auditor",
    description: "See your real effective Stripe fee rate from your Balance CSV. No OAuth. Raw CSV is not stored as a file.",
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
    description: "See your real effective Stripe fee rate from your Balance CSV. No OAuth. Raw CSV is not stored as a file.",
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
