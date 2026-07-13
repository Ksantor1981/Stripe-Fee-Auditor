import type { Metadata } from "next";
import Link from "next/link";

import { ChromeExtensionEarlyAccessForm } from "@/components/ChromeExtensionEarlyAccessForm";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "Stripe Fee Auditor Chrome Extension";
const pageDescription =
  "A lightweight Chrome helper for Stripe Balance CSV exports: open the right Stripe report, analyze the CSV, and set monthly fee-check reminders. No Stripe API keys or page reading.";
const pagePath = "/chrome-extension";
const pageUrl = absoluteUrl(pagePath);
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

const installSteps = [
  "Open the GitHub source folder for the Chrome helper.",
  "Download or clone the repository.",
  "Go to chrome://extensions, enable Developer mode, and choose Load unpacked.",
  "Select the chrome-extension folder.",
];

export default function ChromeExtensionPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Stripe Fee Auditor Chrome Extension",
    applicationCategory: "BrowserApplication",
    operatingSystem: "Chrome",
    url: pageUrl,
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
    <main className="min-h-screen bg-white text-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-bold text-gray-900 hover:text-gray-700">
          Stripe Fee Auditor
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/stripe-balance-csv" className="font-medium text-gray-500 hover:text-gray-900">
            Export guide
          </Link>
          <Link href="/analyze" className="font-semibold text-blue-600 hover:underline">
            Analyze a CSV →
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Chrome helper · early access
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
            Stripe Fee Auditor Chrome Extension
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
            A lightweight browser helper for founders who check Stripe fees from Balance CSV exports.
            It opens the right export flow, sends you back to Fee Auditor, and can remind you to repeat
            the check every month.
          </p>
          <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
            <p className="font-semibold">Chrome helper is ready. Web Store listing is pending account verification.</p>
            <p className="mt-1 text-amber-900/80">
              Technical users can install from source now. Join early access if you want the packaged
              Web Store version when it is approved.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/analyze"
              className="inline-flex justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Analyze my Stripe CSV
            </Link>
            <a
              href="https://github.com/Ksantor1981/Stripe-Fee-Auditor/tree/master/chrome-extension"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              View direct install source
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-950">Get notified when the store version is live</p>
          <p className="mt-2 text-sm leading-relaxed text-blue-900/80">
            Early access is for the helper only: export shortcuts, analyze links, and monthly reminders.
            No Stripe account connection.
          </p>
          <div className="mt-5">
            <ChromeExtensionEarlyAccessForm
              source="chrome_extension_page_hero"
              ctaLabel="Join Chrome early access"
            />
          </div>
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
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Direct install</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950">For technical users before Web Store approval</h2>
            <ol className="mt-5 space-y-3">
              {installSteps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-relaxed text-gray-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-700">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-xs leading-relaxed text-gray-500">
              The Chrome Web Store version is still the recommended path for non-technical users.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-slate-950 p-7 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
            Start without the extension
          </p>
          <h2 className="mt-2 text-2xl font-bold">The fee audit works today from any browser.</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Export your Stripe Balance CSV, upload it to Fee Auditor, and see your processing rate,
            all-in Stripe cost, fee drivers, and first savings opportunity.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/stripe-balance-csv"
              className="inline-flex justify-center rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
            >
              How to export the CSV
            </Link>
            <Link
              href="/analyze"
              className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Analyze my CSV
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
