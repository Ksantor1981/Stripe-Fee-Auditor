import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { PageLoadMarker } from "@/components/PageLoadMarker";
import { getGaMeasurementId } from "@/lib/ga";
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
const gaMeasurementId = getGaMeasurementId();

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

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Stripe Fee Auditor",
  appleWebApp: {
    capable: true,
    title: "Fee Auditor",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=6" },
      { url: "/favicon.svg?v=6", type: "image/svg+xml" },
      { url: "/favicon-32.png?v=6", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png?v=6", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=6", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico?v=6",
  },
  manifest: "/manifest.json",
  title: "Why Is Your Stripe Rate Higher Than Expected? | Fee Auditor",
  description:
    "Find why your Stripe effective rate or payout is higher than expected — international cards, refund fees, monthly anomalies. No OAuth. Raw CSV is not stored.",
  // Do not set canonical here — it inherits to every child page and would
  // incorrectly point /analyze (and others) at the homepage.
  alternates: {
    types: {
      "application/rss+xml": `${siteUrl}/feed.xml`,
    },
  },
  ...(siteVerification ? { verification: siteVerification } : {}),
  openGraph: {
    title: "Why Is Your Stripe Rate Higher Than Expected? | Fee Auditor",
    description:
      "Find why your Stripe effective rate or payout is higher than expected. No OAuth. Raw CSV is not stored.",
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
    title: "Why Is Your Stripe Rate Higher Than Expected? | Fee Auditor",
    description:
      "Find why your Stripe effective rate or payout is higher than expected. No OAuth. Raw CSV is not stored.",
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
      <head />
      <body className="antialiased">
        <PageLoadMarker />
        {children}
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="lazyOnload"
            />
            <Script id="ga-config" strategy="lazyOnload">
              {`
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');
`.trim()}
            </Script>
          </>
        ) : null}
        <Script src="https://plausible.io/js/pa-NtZAVMy_DG97Ek3wmMn6V.js" strategy="lazyOnload" />
        <Script id="plausible-init" strategy="lazyOnload">
          {`
window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
plausible.init()
`.trim()}
        </Script>
      </body>
    </html>
  );
}
