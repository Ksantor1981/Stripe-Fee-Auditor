import type { Metadata } from "next";
import Link from "next/link";
import { LandingFaq } from "@/components/LandingFaq";
import { TrackedLink } from "@/components/TrackedLink";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const TRUST_SIGNALS = [
  { icon: "✓", label: "No Stripe API access" },
  { icon: "✓", label: "Raw CSV never stored" },
  { icon: "✓", label: "No account required" },
  { icon: "✓", label: "Results in 30 seconds" },
];

const reportsAnalyzedCount = Number(process.env.NEXT_PUBLIC_REPORTS_ANALYZED_COUNT ?? 0);
const hasReportsAnalyzedCount = Number.isFinite(reportsAnalyzedCount) && reportsAnalyzedCount > 0;
const reportsAnalyzedLabel = new Intl.NumberFormat("en-US").format(reportsAnalyzedCount);

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Export your CSV",
    body: "Stripe Dashboard → Reports → Balance summary → Export → Itemized → Download to system. Takes about a minute. No API access needed.",
  },
  {
    step: "2",
    title: "Drop it here",
    body: "Raw CSV is never stored. Your report link stays active for 30 days during beta.",
  },
  {
    step: "3",
    title: "See your real rate",
    body: "Processing rate, all-in cost, fee mix chart, monthly timeline, benchmark, anomalies when your volume allows, and savings ideas.",
  },
];

const COMMON_SURPRISES = [
  "International cards quietly adding cross-border fees",
  "Small $5-$20 charges where the fixed $0.30 fee dominates",
  "Months where your fee rate jumped without an obvious reason",
  "Large B2B invoices that could be cheaper via ACH",
  "A 4.5% blended rate that may be normal — or a sign something is leaking margin",
];

const WHAT_YOU_GET = [
  { marker: "RATE", title: "Processing rate vs all-in cost", desc: "Separate the card/charge processing rate from the all-in Stripe cost rate across refunds, payouts, disputes, and other fee lines." },
  { marker: "BENCH", title: "Is your rate normal?", desc: "A rough benchmark range for your transaction mix, so you can see whether your rate is expected or unusually high." },
  { marker: "WHY", title: "Why your rate is higher", desc: "International cards, small transactions, Amex, currency conversion — pinpointed by transaction." },
  { marker: "REFUND", title: "Refund fee leakage", desc: "Estimate how much retained processing fees on refunds are quietly eating into margin." },
  { marker: "SAVE", title: "Savings opportunities", desc: "Estimated annual savings from switching specific charge types to ACH, local payments, or bundling." },
];

const METRICS = [
  { label: "Processing rate", example: "3.24%", desc: "Weighted avg across charges" },
  { label: "All-in cost rate", example: "3.49%", desc: "Includes other fee lines" },
  { label: "Benchmark verdict", example: "High", desc: "Normal range for your mix" },
  { label: "Refund leakage", example: "~$91", desc: "Estimated retained fees" },
];

const DECISION_GUIDE = [
  {
    title: "Worth checking",
    tone: "blue",
    items: [
      "You process more than a few thousand dollars per month",
      "Your customers are international or pay in multiple currencies",
      "You have many $5-$20 monthly charges",
      "You refund customers often and want to see retained fee impact",
    ],
  },
  {
    title: "Probably okay to skip",
    tone: "gray",
    items: [
      "You only have a handful of Stripe transactions",
      "All customers are domestic and high-ticket",
      "You only need a rough blended rate you can calculate in Excel",
      "You need accounting or tax advice instead of a fee audit",
    ],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Beta banner */}
      <div className="bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white">
        Free right now — full reports lock to paid after launch.{" "}
        <TrackedLink
          href="/analyze"
          funnelEvent="funnel_landing_cta"
          funnelProps={{ placement: "beta_banner" }}
          className="underline underline-offset-2 hover:text-emerald-100 transition-colors"
        >
          Try it now →
        </TrackedLink>
      </div>

      {/* Nav */}
      <nav className="flex items-center justify-between gap-4 px-6 py-4 max-w-5xl mx-auto">
        <Link href="/" className="font-bold text-gray-900 text-lg hover:text-gray-700 transition-colors">
          Stripe Fee Auditor
        </Link>
        <div className="flex items-center gap-4">
          <TrackedLink
            href="/blog"
            funnelEvent="funnel_nav_blog"
            funnelProps={{ placement: "nav" }}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Blog
          </TrackedLink>
          <TrackedLink
            href="/analyze"
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "nav" }}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            Analyze My Fees
          </TrackedLink>
        </div>
      </nav>

      {/* Hero — Problem */}
      <section id="problem" className="flex flex-col items-center justify-center px-4 py-20 text-center scroll-mt-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          The problem
        </p>

        {/* No OAuth badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
          <span className="text-green-500">✓</span>
          No Stripe API access · No OAuth · Just a CSV
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl leading-tight max-w-3xl">
          Stripe says 2.9%. Your real fee rate is{" "}
          <span className="text-blue-600">probably higher.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-gray-500 leading-relaxed">
          Upload your Stripe Balance CSV and see whether your fee rate is normal, what is driving it up, and how much refunds may be leaking from margin.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <TrackedLink
            href="/analyze"
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "hero_primary" }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
          >
            Analyze My CSV
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </TrackedLink>
          <TrackedLink
            href="/analyze?sample=1"
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "hero_sample" }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all"
          >
            Try sample report →
          </TrackedLink>
        </div>

        {/* Trust signals */}
        <div className="mt-4 w-full max-w-3xl rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <div className="grid gap-2 text-left sm:grid-cols-4 sm:text-center">
            {TRUST_SIGNALS.map(({ icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-700">
                <span className="text-green-600">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs font-medium text-gray-500">
          {hasReportsAnalyzedCount
            ? `${reportsAnalyzedLabel} reports analyzed in beta`
            : "Early beta: real founder reports are already coming in"}
        </p>
      </section>

      {/* vs OAuth tools callout */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            🔒 Why some founders prefer CSV over OAuth
          </p>
          <p className="text-sm text-amber-700 leading-relaxed">
            Other Stripe fee tools require OAuth access to your Stripe account — read access to your full transaction history, customer data, and payout details, permanently until you revoke it.
            Stripe Fee Auditor never connects to your Stripe account. You export a CSV, upload it, get your analysis, and that&apos;s it. The raw file is processed in memory and never stored as a file.
          </p>
          <div className="mt-4 rounded-lg border border-amber-100 overflow-hidden text-sm">
            <table className="w-full">
              <thead className="bg-amber-100/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-amber-800" aria-hidden />
                  <th className="px-3 py-2 text-center text-xs font-semibold text-amber-800">feeauditor.com</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-amber-800">OAuth tools</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {[
                  ["Stripe credentials stored", "❌ Never", "✅ On their servers"],
                  ["Access after you're done", "❌ None", "✅ Permanent until revoked"],
                  ["Data scope", "Only what you export", "Full account access"],
                  ["Price", "Free beta / $12 post-beta", "$39–149/mo"],
                ].map(([label, ours, theirs]) => (
                  <tr key={label} className="bg-white/60">
                    <td className="px-3 py-2 text-amber-700 font-medium">{label}</td>
                    <td className="px-3 py-2 text-center text-green-700 font-semibold">{ours}</td>
                    <td className="px-3 py-2 text-center text-gray-500">{theirs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Solution preview */}
      <section id="solution" className="px-4 pb-16 scroll-mt-14">
        <div className="mx-auto max-w-3xl text-center mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            The solution
          </p>
          <p className="mt-1 text-sm text-gray-500">
            One upload turns your Balance CSV into plain-English metrics — no OAuth, no permanent Stripe access.
          </p>
        </div>
        <div className="mx-auto max-w-3xl rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
            Example output
          </p>
          <div className="grid gap-3 sm:grid-cols-5">
            {[
              { label: "Processed", value: "$18,420" },
              { label: "Stripe fees", value: "$642.18" },
              { label: "All-in cost rate", value: "3.49%" },
              { label: "Benchmark", value: "High" },
              { label: "Savings", value: "~$720/yr" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white px-4 py-3 border border-blue-50">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-lg font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            The report turns a raw Balance CSV into a plain-English answer to: is this rate normal, what is driving it up, and what should I look at first?
          </p>
        </div>
      </section>

      {/* What the report tells you */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            What the report tells you
          </p>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-10">
            Not just a number — a full breakdown
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {WHAT_YOU_GET.map(({ marker, title, desc }) => (
              <div key={title} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 flex gap-4">
                <span className="flex h-9 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[10px] font-bold tracking-wide text-blue-700">
                  {marker}
                </span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <TrackedLink
              href="/analyze?sample=1"
              funnelEvent="funnel_landing_cta"
              funnelProps={{ placement: "mid_sample" }}
              className="text-sm text-blue-600 hover:underline"
            >
              See a sample report without uploading anything →
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* Common surprises */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Common surprises we catch
          </p>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
            Where the extra fees usually hide
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {COMMON_SURPRISES.map((item) => (
              <div key={item} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Decision guide */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Is it worth it?
          </p>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-3">
            When a fee audit is useful — and when to skip it
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-relaxed text-gray-500">
            During beta, the full report is free. After beta, the paid unlock is meant for founders
            who want more than a blended-rate formula: line-level drivers, refund leakage, monthly
            detail, exports, and specific savings ideas.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {DECISION_GUIDE.map((group) => (
              <div
                key={group.title}
                className={`rounded-2xl border p-6 shadow-sm ${
                  group.tone === "blue"
                    ? "border-blue-100 bg-blue-50/60"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <h3 className="font-bold text-gray-900">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-600">
                      <span className={group.tone === "blue" ? "text-blue-600" : "text-gray-400"}>
                        {group.tone === "blue" ? "✓" : "•"}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics preview */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
            What you&apos;ll discover
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map(({ label, example, desc }) => (
              <div key={label} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{example}</p>
                <p className="text-xs text-gray-400 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 px-4 py-20 scroll-mt-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            How it works
          </p>
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900">Three steps to clarity</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <div key={step} className="relative rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {step}
                </div>
                <h3 className="mb-1.5 font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <TrackedLink
              href="/analyze"
              funnelEvent="funnel_landing_cta"
              funnelProps={{ placement: "footer" }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow hover:bg-blue-700 transition-colors"
            >
              Get Started — It&apos;s Free
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-16 bg-white scroll-mt-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Pricing
          </p>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
            Simple access to your report
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">During beta</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">Full report — free</p>
              <p className="text-sm text-emerald-900/90 leading-relaxed">
                Anomalies, savings ideas, exports, and dashboard charts while beta lasts. Private link with automatic expiry — see Terms.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">After beta</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">$12 one-time unlock</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Pay once to open the full analysis for one upload for 30 days: all unusual charges,
                savings opportunities, monthly detail, CSV export, and print-ready report.
              </p>
              <p className="mt-3 text-xs text-gray-400">
                Refund available if payment succeeds but the report does not unlock.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-gray-50 px-4 py-16 scroll-mt-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            FAQ
          </p>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
            Security &amp; trust
          </h2>
          <LandingFaq />
          <p className="mt-6 text-center text-sm text-gray-500">
            More detail in our{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 text-center text-xs text-gray-400 space-y-2">
        <p>
          Stripe Fee Auditor is not affiliated with Stripe, Inc.{" "}
          <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          {" · "}
          <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
          {" · "}
          <Link href="/refund" className="underline hover:text-gray-600">Refund Policy</Link>
        </p>
        <p className="flex justify-center gap-3 flex-wrap">
          <Link href="/stripe-fee-calculator" className="hover:underline">Stripe fee calculator</Link>
          <span>·</span>
          <Link href="/stripe-balance-csv" className="hover:underline">Stripe Balance CSV</Link>
          <span>·</span>
          <Link href="/why-stripe-fee-rate-higher-than-2-9" className="hover:underline">Why fees exceed 2.9%</Link>
        </p>
        <p className="flex justify-center gap-3 flex-wrap">
          <Link href="/blog/why-stripe-fees-increase" className="hover:underline">Why Stripe fees increase</Link>
          <span>·</span>
          <Link href="/blog/how-to-reduce-stripe-fees" className="hover:underline">How to reduce fees</Link>
          <span>·</span>
          <Link href="/blog/stripe-effective-fee-rate-explained" className="hover:underline">Fee rate explained</Link>
        </p>
      </footer>
    </main>
  );
}
