import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

import {
  CHROME_EXTENSION_STORE_URL,
  hasChromeWebStoreDetailUrl,
} from "@/lib/chrome-extension";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "Stripe Fee Auditor — CSV Fee Check Helper";
const pageDescription =
  "Install the free Chrome helper: open Stripe Balance export, audit your real fee rate on FeeAuditor.com, optional monthly CSV reminder. No OAuth or API keys. Does not read Stripe pages.";
const pagePath = "/chrome-extension";
const ogImage = buildOgImageUrl({
  title: "Stripe Fee Auditor Chrome Extension",
  eyebrow: "CSV helper · no OAuth",
});

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "Stripe Fee Auditor Chrome extension",
    "Stripe Balance CSV Chrome extension",
    "Stripe fee Chrome extension",
    "Stripe CSV export helper",
    "Stripe fee monitor extension",
  ],
  alternates: {
    canonical: pagePath,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pagePath,
    siteName: "Stripe Fee Auditor",
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Stripe Fee Auditor Chrome Extension" }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

const features = [
  {
    step: "1",
    title: "Open Stripe export",
    body: "Jump straight to Stripe's Balance export workflow instead of hunting through reports every month.",
  },
  {
    step: "2",
    title: "Analyze CSV",
    body: "Open Fee Auditor and upload the Balance CSV to check processing rate, all-in cost, and fee drivers.",
  },
  {
    step: "3",
    title: "Monthly reminder",
    body: "Use a local browser reminder to repeat the check before fee drift becomes invisible.",
  },
];

const privacyPoints = [
  "No Stripe OAuth and no API keys",
  "No host permissions for stripe.com",
  "Does not read Stripe Dashboard pages",
  "Stores only the reminder setting in Chrome storage",
  "CSV analysis still happens only when you choose to upload on feeauditor.com",
];

export default function ChromeExtensionPage() {
  const detailUrl = hasChromeWebStoreDetailUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Stripe Fee Auditor — CSV Fee Check Helper",
    applicationCategory: "BrowserApplication",
    operatingSystem: "Chrome",
    url: CHROME_EXTENSION_STORE_URL,
    downloadUrl: CHROME_EXTENSION_STORE_URL,
    description: pageDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "Stripe Fee Auditor",
      url: absoluteUrl("/"),
    },
  };

  return (
    <MarketingShell className="min-h-screen bg-white text-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Chrome helper · free on Web Store
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
            Stripe Fee Auditor — CSV Fee Check Helper
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
            Free Chrome helper for founders who check Stripe fees from Balance CSV exports. Opens the
            right export flow, sends you back to Fee Auditor, and can remind you monthly. Does not
            read Stripe pages. No OAuth or API keys.
          </p>
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950">
            <p className="font-semibold">Available on the Chrome Web Store for everyone.</p>
            <p className="mt-1 text-emerald-900/80">
              One-click install. The main product path is still the sample report on feeauditor.com —
              the helper is a shortcut and monthly nudge, not a second product.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={CHROME_EXTENSION_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Install from Chrome Web Store
            </a>
            <Link
              href="/analyze?sample=1"
              className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Try sample report first
            </Link>
          </div>
          {!detailUrl && (
            <p className="mt-3 text-xs text-gray-500">
              Opens Chrome Web Store search for &quot;Stripe Fee Auditor&quot;. Prefer the exact
              listing link? Set it in{" "}
              <code className="rounded bg-gray-100 px-1">lib/chrome-extension.ts</code>.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-950">What you get after install</p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-blue-900/85">
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Quick Stripe fee estimate in the popup (published rates by country)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Open Stripe Balance export in one click</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Jump to Fee Auditor to upload your CSV or view the sample</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Optional local monthly reminder (no OAuth)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">✓</span>
              <span>Does not scrape Stripe pages or request host permissions</span>
            </li>
          </ul>
          <a
            href={CHROME_EXTENSION_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Add to Chrome →
          </a>
          <p className="mt-3 text-center text-xs text-blue-900/60">
            Free · no Stripe connection · analysis stays on feeauditor.com
          </p>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Workflow</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
            Built for the monthly CSV audit habit
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.step} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {feature.step}
                </div>
                <h3 className="mt-4 font-bold text-gray-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Privacy posture</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950">No page reading. No API keys.</h2>
            <ul className="mt-5 space-y-3">
              {privacyPoints.map((point) => (
                <li key={point} className="flex gap-2 text-sm leading-relaxed text-gray-700">
                  <span className="text-blue-600">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Prefer the web app?</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950">You do not need the extension to audit fees</h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Export your Balance CSV, upload it on Fee Auditor, or start with the sample report. The
              Chrome helper only speeds up export and reminds you to repeat the check.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/analyze?sample=1"
                className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Try sample in 10s
              </Link>
              <Link
                href="/stripe-balance-csv"
                className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:bg-blue-50"
              >
                CSV export guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-slate-950 p-7 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
            Install · then run a diagnosis
          </p>
          <h2 className="mt-2 text-2xl font-bold">Add the helper, or start with the sample report.</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Recommended path: sample report first → install Chrome helper for monthly reminders →
            upload your own Balance CSV when ready.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={CHROME_EXTENSION_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Install from Chrome Web Store
            </a>
            <Link
              href="/analyze?sample=1"
              className="inline-flex justify-center rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
            >
              Try sample report
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Developers: source is on{" "}
            <a
              href="https://github.com/Ksantor1981/Stripe-Fee-Auditor/tree/master/chrome-extension"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-300"
            >
              GitHub
            </a>
            . Ordinary users should install from the Web Store, not Load unpacked.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
