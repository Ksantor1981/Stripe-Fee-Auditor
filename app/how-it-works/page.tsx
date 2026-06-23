import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/LandingNav";

const GITHUB_REPO = "https://github.com/Ksantor1981/Stripe-Fee-Auditor";

export const metadata: Metadata = {
  title: "How Stripe Fee Auditor Handles Your CSV",
  description:
    "A transparent look at what happens when you upload a Stripe Balance CSV: server analysis, raw file handling, stored report data, retention, and open-source core logic.",
  alternates: { canonical: "/how-it-works" },
};

const FLOW = [
  {
    step: "1",
    title: "You upload a Stripe Balance CSV",
    body: "The CSV is sent to Fee Auditor over HTTPS so the server can analyze it. There is no Stripe OAuth connection, no API key, and no ongoing access to your Stripe account.",
  },
  {
    step: "2",
    title: "We parse it for fee analysis",
    body: "The analyzer extracts the fields needed for totals, rates, dates, transaction types, and fee categories. It does not need live customer records or account-wide Stripe permissions.",
  },
  {
    step: "3",
    title: "We store a computed report, not the raw file",
    body: "The raw CSV is not stored as a file. The report stores derived numbers and categorized rows so your private report link can reopen.",
  },
  {
    step: "4",
    title: "Reports expire automatically",
    body: "Unpaid previews are short-lived outside beta, paid reports remain available for up to 30 days, and expired report rows are removed by cleanup jobs.",
  },
];

const STORED = [
  "Processing rate and all-in Stripe cost rate",
  "Monthly totals, trends, and benchmark verdicts",
  "Grouped fee categories and high-fee charge flags",
  "Private report ID and access state",
  "Email only if you provide it for report access or checkout",
];

const NOT_STORED = [
  "Raw CSV as an uploaded file",
  "Stripe API keys or OAuth tokens",
  "Permanent access to your Stripe account",
  "Data for ads, profiling, or resale",
  "Free-text descriptions where they are not needed after analysis",
];

const CODE_LINKS = [
  {
    label: "CSV parser",
    href: `${GITHUB_REPO}/blob/master/lib/csv-parser.ts`,
    desc: "Column mapping, amount normalization, and row parsing.",
  },
  {
    label: "Fee analyzer",
    href: `${GITHUB_REPO}/blob/master/lib/fee-analyzer.ts`,
    desc: "Effective rate, high-fee charge detection, savings estimates, and storage redaction.",
  },
  {
    label: "Analyze API route",
    href: `${GITHUB_REPO}/blob/master/app/api/analyze/route.ts`,
    desc: "Server endpoint that receives the CSV, runs analysis, and saves the derived report.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingNav />

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-sm font-medium text-blue-600">Data handling</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-900">
          What happens when you upload a Stripe CSV
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Fee Auditor is intentionally not an OAuth app. You export a Stripe Balance CSV, upload it once,
          and get a report. The honest version: the CSV does leave your laptop for server-side analysis,
          but the raw file is not stored as a file, and the stored report is derived from the CSV.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/analyze"
            className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Analyze my CSV
          </Link>
          <Link
            href="/privacy"
            className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300"
          >
            Read Privacy Policy
          </Link>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900">The upload flow</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {FLOW.map((item) => (
              <div key={item.step} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-5 px-4 py-14 sm:px-6 md:grid-cols-2">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
          <h2 className="text-lg font-bold text-gray-900">What is stored</h2>
          <ul className="mt-4 space-y-3">
            {STORED.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-700">
                <span className="text-blue-600">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">What is not stored or requested</h2>
          <ul className="mt-4 space-y-3">
            {NOT_STORED.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-700">
                <span className="text-gray-400">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">Open core logic</p>
            <h2 className="mt-2 text-2xl font-bold">You can inspect how the analysis works</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              The useful trust signal is transparency: you can see the parser, analyzer, and request
              flow. The repository is public, including the core CSV and fee logic.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {CODE_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
              >
                <p className="text-sm font-semibold text-white">{link.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{link.desc}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-blue-300">
                  View on GitHub -&gt;
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900">Plain-English privacy summary</h2>
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-gray-600">
          <p>
            Fee Auditor uses your CSV to produce the report you asked for. It does not sell financial
            data, does not use it for advertising profiles, and does not connect to your Stripe account.
          </p>
          <p>
            Infrastructure providers still exist: Vercel hosts the app, Neon stores derived reports,
            Polar handles checkout, Resend may send transactional email, and Plausible measures aggregate
            traffic. The detailed version is in the Privacy Policy.
          </p>
          <p>
            If your policy requires fully local processing, use the public code as a reference or wait
            for a browser-only preview mode. The current production app uses server-side analysis.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="text-lg font-bold text-gray-900">Need the CSV export first?</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Use the Stripe Balance CSV guide, then come back and upload the Itemized export.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/stripe-balance-csv"
              className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300"
            >
              CSV export guide
            </Link>
            <Link
              href="/analyze"
              className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Upload CSV
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
