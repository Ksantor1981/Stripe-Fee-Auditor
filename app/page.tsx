import type { Metadata } from "next";
import Link from "next/link";
import { LandingFaq } from "@/components/LandingFaq";
import { LandingNav } from "@/components/LandingNav";
import { TrackedLink } from "@/components/TrackedLink";
import { FULL_REPORTS_FREE_DURING_BETA } from "@/lib/beta-access";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const HOME_TITLE = "See Your Real Stripe Fee Rate | Stripe Fee Auditor";
const HOME_DESCRIPTION =
  "Most Stripe users pay more than the headline 2.9%. Upload your Balance CSV to see your real rate, fee drivers, and savings opportunities. Free preview. No OAuth.";
const HOME_OG_IMAGE = buildOgImageUrl({
  title: "See your real Stripe fee rate",
  eyebrow: "Stripe Fee Auditor",
});

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "https://feeauditor.com",
    type: "website",
    images: [{ url: HOME_OG_IMAGE, width: 1200, height: 630, alt: "Stripe Fee Auditor real fee rate report" }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [HOME_OG_IMAGE],
  },
};

const TRUST_SIGNALS = [
  { icon: "✓", label: "No Stripe API access" },
  { icon: "✓", label: "Server analysis, no raw file storage" },
  { icon: "✓", label: "No account signup" },
  { icon: "✓", label: "No ads or profiling" },
  { icon: "✓", label: "Core logic on GitHub" },
  { icon: "✓", label: "Usually under 30 seconds" },
];

const reportsAnalyzedCount = Number(process.env.NEXT_PUBLIC_REPORTS_ANALYZED_COUNT ?? 0);
const hasReportsAnalyzedCount = Number.isFinite(reportsAnalyzedCount) && reportsAnalyzedCount > 0;
const reportsAnalyzedLabel = new Intl.NumberFormat("en-US").format(reportsAnalyzedCount);

const INDEPENDENT_FEEDBACK = {
  quote: "Focused single-purpose tool with a compelling privacy differentiator.",
  name: "Assaf Sheinrok",
  role: "Founder of PagePulse",
  href: "https://pagepulse.page",
};

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Export your CSV",
    body: "Stripe Dashboard → Reports → Balance summary → Export → Itemized → Download to system. Takes about a minute. No API access needed.",
  },
  {
    step: "2",
    title: "Drop it here",
    body: "The CSV is sent to our server for analysis, but the raw file is not stored as a file. During beta, full report links from real uploads stay active for up to 30 days; after beta, unpaid previews expire sooner.",
  },
  {
    step: "3",
    title: "See your real rate",
    body: "Processing rate, all-in cost, fee mix chart, monthly timeline, benchmark, high-fee charges when your volume allows, and savings ideas.",
  },
];

const WHAT_WE_OFTEN_FIND = [
  "International cards quietly adding cross-border fees",
  "Small $5-$20 charges where the fixed $0.30 fee dominates",
  "Months where your fee rate jumped without an obvious reason",
  "Large B2B invoices that could be cheaper via ACH",
  "A ~4% all-in Stripe cost rate that may be normal — or a sign something is leaking margin",
];

const WHAT_YOU_GET = [
  { marker: "RATE", title: "Processing rate vs all-in cost", desc: "Separate the card/charge processing rate from the all-in Stripe cost rate across refunds, payouts, disputes, and other fee lines." },
  { marker: "BENCH", title: "Is your rate normal?", desc: "A rough benchmark range for your transaction mix, so you can see whether your rate is expected or unusually high." },
  { marker: "WHY", title: "Why your rate is higher", desc: "International cards, small transactions, Amex, currency conversion — pinpointed by transaction." },
  { marker: "REFUND", title: "Refund fee leakage", desc: "Estimate how much retained processing fees on refunds are quietly eating into margin." },
  { marker: "SAVE", title: "Savings opportunities", desc: "Directional annual estimates for ACH, local payments, or bundling — prioritization, not guaranteed savings." },
];

const METRICS = [
  { label: "Processing rate", example: "3.82%", desc: "Weighted avg across charges" },
  { label: "All-in cost rate", example: "4.02%", desc: "Includes other fee lines" },
  { label: "Benchmark verdict", example: "Normal", desc: "Normal range for your mix" },
  { label: "Refund leakage", example: "~$91", desc: "Estimated retained fees" },
];

const CALCULATOR_VS_AUDIT = [
  {
    label: "Fee calculator",
    title: "Estimate the published cost",
    rate: "2.9% + $0.30",
    tone: "gray",
    points: [
      "Uses product price and rough assumptions",
      "Good before you launch or change pricing",
      "Misses refunds, card mix, add-ons, and real monthly drift",
    ],
  },
  {
    label: "CSV fee audit",
    title: "Check what you actually paid",
    rate: "3.82% / 4.02%",
    tone: "blue",
    points: [
      "Uses your itemized Stripe Balance export",
      "Separates processing rate from all-in Stripe cost",
      "Shows fee drivers, high-fee charges, and savings ideas",
    ],
  },
] as const;

const OAUTH_COMPARISON = [
  {
    aspect: "Stripe credentials",
    ours: "Never stored — no API keys",
    theirs: "Stored on vendor servers",
  },
  {
    aspect: "Access after analysis",
    ours: "No ongoing connection",
    theirs: "Permanent until you revoke OAuth",
  },
  {
    aspect: "Data you share",
    ours: "Only what you export in CSV",
    theirs: "Full account via API",
  },
  {
    aspect: "Typical cost",
    oursBeta: "Free in beta · $12 one-time per report after",
    oursLaunch: "$12 one-time per report · free preview first",
    theirs: "$39–149/mo subscriptions",
  },
] as const;

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

const FAQ_JSON_LD_ITEMS = [
  {
    q: "Do you store my Stripe CSV file?",
    text: [
      "No. Your browser reads the file for upload preview, then sends it once to our servers for analysis. We store computed numbers and aggregates (rates, totals, grouped categories) — not the raw CSV as a file.",
      "Transaction IDs may appear in your private report so you can match rows to Stripe; free-text descriptions from the export are stripped before long-term storage where possible.",
    ],
  },
  {
    q: "Does Stripe Fee Auditor connect to my Stripe account?",
    text: [
      "No API connection and no OAuth. You export a CSV from the Stripe Dashboard and upload it here — same data you could open in a spreadsheet, without granting third-party access to your live account.",
    ],
  },
  {
    q: "Who can see my report?",
    text: [
      "Only someone with your private link (including the access token in the URL). Treat it like a password: don't share it in public channels. Reports expire automatically based on our retention policy.",
    ],
  },
  {
    q: "Are the benchmarks and savings numbers guaranteed?",
    text: [
      "No. They are directional estimates built from your export using simplified rules, not Stripe's internal ledger. Use them to spot patterns and questions for your finance team — not as contractual fee quotes.",
    ],
  },
  {
    q: "Is the $12 full report worth it after beta?",
    text: [
      "It depends on your volume. If you process only a few small payments, the preview or a spreadsheet may be enough. If you process meaningful monthly volume, have international customers, refunds, or many low-ticket charges, the full report is designed to show the rows and actions behind the headline rate.",
    ],
  },
  {
    q: "Can I calculate this myself in Excel?",
    text: [
      "Yes. The basic blended rate is total charge fees divided by total charge volume. Fee Auditor is useful when you want monthly changes, high-fee charges, refund fee leakage, benchmark context, exports, and specific savings opportunities without rebuilding the spreadsheet every time.",
    ],
  },
  {
    q: "How is this different from a Stripe fee calculator?",
    text: [
      "A fee calculator estimates what Stripe might charge from public pricing and assumptions. Stripe Fee Auditor checks what you actually paid by analyzing an itemized Stripe Balance CSV, including refunds, other fee lines, card mix, monthly changes, and unusual transactions.",
    ],
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_JSON_LD_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.text.join(" "),
    },
  })),
};

const SOFTWARE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Stripe Fee Auditor",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: absoluteUrl("/"),
  description: HOME_DESCRIPTION,
  offers: {
    "@type": "Offer",
    price: "12",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_JSON_LD).replace(/</g, "\\u003c") }}
      />

      {FULL_REPORTS_FREE_DURING_BETA ? (
        <div className="bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white">
          Free right now — full reports lock to paid after launch.{" "}
          <TrackedLink
            href="/analyze"
            utm={{ source: "landing", medium: "banner", campaign: "beta_banner" }}
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "beta_banner" }}
            className="underline underline-offset-2 hover:text-emerald-100 transition-colors"
          >
            Try it now →
          </TrackedLink>
        </div>
      ) : (
        <div className="bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white">
          $12 one-time unlock for the full report · Free preview first.{" "}
          <TrackedLink
            href="/analyze"
            utm={{ source: "landing", medium: "banner", campaign: "launch_banner" }}
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "launch_banner" }}
            className="underline underline-offset-2 hover:text-blue-100 transition-colors"
          >
            Analyze my CSV →
          </TrackedLink>
        </div>
      )}

      <LandingNav />

      {/* Hero — Problem */}
      <section id="problem" className="flex flex-col items-center justify-center px-4 py-20 text-center scroll-mt-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          The problem
        </p>

        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl leading-tight max-w-3xl">
          Your real Stripe fee rate is{" "}
          <span className="text-blue-600">probably higher than 2.9%.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-gray-500 leading-relaxed">
          Upload your Stripe Balance CSV and see whether your fee rate is normal, what is driving it up, and how much refunds may be leaking from margin.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <TrackedLink
            href="/analyze"
            utm={{ source: "landing", medium: "cta", campaign: "hero_primary" }}
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
            utm={{ source: "landing", medium: "cta", campaign: "hero_sample" }}
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "hero_sample" }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all"
          >
            Try sample report →
          </TrackedLink>
          <Link
            href="/stripe-fee-calculator"
            className="text-sm font-medium text-gray-500 hover:text-blue-600 underline underline-offset-2"
          >
            Quick fee estimate first →
          </Link>
        </div>

        {/* Trust signals */}
        <div className="mt-6 w-full max-w-3xl rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3.5">
          <div className="grid gap-2 text-left sm:grid-cols-3 sm:text-center lg:grid-cols-6">
            {TRUST_SIGNALS.map(({ icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700">
                <span className="text-blue-600">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-gray-500">
            <Link href="/how-it-works" className="font-medium text-blue-600 hover:underline">
              See exactly how uploads are handled
            </Link>
            <a
              href="https://github.com/Ksantor1981/Stripe-Fee-Auditor"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline"
            >
              View core logic on GitHub
            </a>
          </div>
        </div>
        {hasReportsAnalyzedCount && (
          <p className="mt-3 text-xs font-medium text-gray-500">
            {reportsAnalyzedLabel} reports analyzed in beta
          </p>
        )}

        <div className="mt-6 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white"
              aria-hidden
            >
              “
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Independent feedback
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">
                “{INDEPENDENT_FEEDBACK.quote}”
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {INDEPENDENT_FEEDBACK.name}, {INDEPENDENT_FEEDBACK.role} ·{" "}
                <a
                  href={INDEPENDENT_FEEDBACK.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  PagePulse
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* vs OAuth — trust comparison */}
      <section className="px-4 pb-12" aria-labelledby="privacy-compare-heading">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/80 to-white p-6 shadow-sm">
          <div className="flex gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"
              aria-hidden
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <div>
              <h2 id="privacy-compare-heading" className="text-lg font-bold text-gray-900">
                CSV upload, not OAuth
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                Many fee tools ask for permanent read access to your Stripe account — transactions,
                customers, payouts. We never connect to Stripe: you export a Balance CSV, upload it,
                get the report. The CSV is sent to the server for analysis; the raw file is processed in memory and not stored as a file.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-sm">
            <div className="hidden sm:grid sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <div className="px-4 py-3" />
              <div className="border-l border-slate-200 bg-blue-700 px-4 py-2.5 text-center text-[11px] font-semibold tracking-wide text-white sm:text-xs sm:uppercase">
                Stripe Fee Auditor
              </div>
              <div className="border-l border-slate-200 px-4 py-2.5 text-center text-[11px] font-medium text-slate-500 sm:text-xs sm:uppercase">OAuth-based tools</div>
            </div>

            {OAUTH_COMPARISON.map((row, index) => {
              const ours =
                "oursBeta" in row
                  ? FULL_REPORTS_FREE_DURING_BETA
                    ? row.oursBeta
                    : row.oursLaunch
                  : row.ours;
              return (
              <div
                key={row.aspect}
                className={`border-t border-slate-100 sm:grid sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] ${
                  index === 0 ? "border-t-0 sm:border-t" : ""
                }`}
              >
                <div className="bg-slate-50/80 px-4 py-3 font-medium text-gray-800 sm:bg-transparent">
                  <span className="sm:hidden text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {row.aspect}
                  </span>
                  <span className="block sm:inline">{row.aspect}</span>
                </div>
                <div className="border-t border-slate-100 bg-blue-50/50 px-4 py-3 sm:border-t-0 sm:border-l sm:border-slate-200">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700 sm:sr-only">
                    Stripe Fee Auditor
                  </p>
                  <p className="flex gap-2 font-medium text-blue-950">
                    <span className="mt-0.5 shrink-0 text-blue-600" aria-hidden>
                      ✓
                    </span>
                    <span>{ours}</span>
                  </p>
                </div>
                <div className="border-t border-slate-100 px-4 py-3 text-gray-500 sm:border-t-0 sm:border-l sm:border-slate-200">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:sr-only">
                    OAuth-based tools
                  </p>
                  <p>{row.theirs}</p>
                </div>
              </div>
            );
            })}
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
              { label: "Benchmark", value: "Normal" },
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
      <section className="bg-white px-4 py-16" aria-labelledby="calculator-vs-audit-heading">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Calculator vs reality
            </p>
            <h2 id="calculator-vs-audit-heading" className="text-2xl font-bold text-gray-900">
              Fee calculators estimate. Your Stripe CSV tells the truth.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              A calculator is useful before you sell. Once payments are live, your Balance export shows
              the real mix: international cards, refunds, small charges, payout fees, and monthly drift.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {CALCULATOR_VS_AUDIT.map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border p-6 shadow-sm ${
                  item.tone === "blue"
                    ? "border-blue-200 bg-blue-50/70"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-widest ${
                        item.tone === "blue" ? "text-blue-700" : "text-gray-500"
                      }`}
                    >
                      {item.label}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.tone === "blue"
                        ? "bg-white text-blue-700"
                        : "bg-white text-gray-600"
                    }`}
                  >
                    {item.rate}
                  </span>
                </div>
                <ul className="mt-5 space-y-3">
                  {item.points.map((point) => (
                    <li key={point} className="flex gap-2 text-sm leading-relaxed text-gray-600">
                      <span className={item.tone === "blue" ? "text-blue-600" : "text-gray-400"}>✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <TrackedLink
              href="/analyze"
              utm={{ source: "landing", medium: "cta", campaign: "calculator_vs_audit" }}
              funnelEvent="funnel_landing_cta"
              funnelProps={{ placement: "calculator_vs_audit" }}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
            >
              Audit my real Stripe CSV
            </TrackedLink>
            <Link
              href="/stripe-fee-calculator"
              className="text-sm font-medium text-gray-500 underline underline-offset-2 hover:text-blue-600"
            >
              Start with a quick estimate first
            </Link>
          </div>
        </div>
      </section>

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
              utm={{ source: "landing", medium: "cta", campaign: "mid_sample" }}
              funnelEvent="funnel_landing_cta"
              funnelProps={{ placement: "mid_sample" }}
              className="text-sm text-blue-600 hover:underline"
            >
              See a sample report without uploading anything →
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* What we often find */}
      <section className="bg-slate-50/50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            In real Stripe exports
          </p>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
            What we often find
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-center text-sm text-gray-500 leading-relaxed">
            Not always a problem — often mix, refunds, or small-ticket math worth a second look.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {WHAT_WE_OFTEN_FIND.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-100 bg-white/80 p-4"
              >
                <p className="flex gap-2.5 text-sm leading-relaxed text-gray-600">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"
                    aria-hidden
                  />
                  <span>{item}</span>
                </p>
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
            {FULL_REPORTS_FREE_DURING_BETA ? (
              <>
                During beta, the full report is free. After beta, the paid unlock is meant for founders
                who want more than a blended-rate formula: line-level drivers, refund leakage, monthly
                detail, exports, and specific savings ideas.
              </>
            ) : (
              <>
                Start with a free preview — headline rate, top drivers, and a teaser. The $12 unlock is
                for founders who want line-level drivers, refund leakage, monthly detail, exports, and
                specific savings ideas.
              </>
            )}
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
            {HOW_IT_WORKS.map(({ step, title, body }) => {
              const stepBody =
                step === "2" && !FULL_REPORTS_FREE_DURING_BETA
                  ? "The CSV is sent to our server for analysis, but the raw file is not stored as a file. Upload once for a free preview immediately — no card required. Unlock the full report for $12 when you want high-fee charge details, exports, and savings actions."
                  : body;
              return (
              <div key={step} className="relative rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {step}
                </div>
                <h3 className="mb-1.5 font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{stepBody}</p>
              </div>
            );
            })}
          </div>
          <div className="mt-10 text-center">
            <TrackedLink
              href="/analyze"
              utm={{ source: "landing", medium: "cta", campaign: "footer" }}
              funnelEvent="funnel_landing_cta"
              funnelProps={{ placement: "footer" }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow hover:bg-blue-700 transition-colors"
            >
              {FULL_REPORTS_FREE_DURING_BETA ? "Get Started — It&apos;s Free" : "Get Started — Free Preview"}
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* Fee Monitor waitlist */}
      <section id="monitor" className="bg-slate-950 px-4 py-16 text-white scroll-mt-14">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">Next: Fee Monitor</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Want to know when your fee rate gets worse next month?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
              We are validating monthly Stripe fee monitoring without OAuth: private report history,
              month-over-month comparisons, and reminders from CSV exports you control.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <ul className="space-y-3 text-sm text-slate-200">
              <li className="flex gap-2">
                <span className="text-blue-300">✓</span>
                <span>Compare this month vs your previous CSV audit</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-300">✓</span>
                <span>Get a reminder when it is time to check fees again</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-300">✓</span>
                <span>No permanent Stripe connection in the first version</span>
              </li>
            </ul>
            <TrackedLink
              href="/monitor"
              utm={{ source: "landing", medium: "cta", campaign: "monitor_waitlist" }}
              funnelEvent="funnel_landing_cta"
              funnelProps={{ placement: "monitor_section" }}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-blue-50"
            >
              Join Fee Monitor waitlist →
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
            {FULL_REPORTS_FREE_DURING_BETA ? (
              <>
                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">During beta</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">Full report — free</p>
                  <p className="text-sm text-emerald-900/90 leading-relaxed">
                    High-fee charge details, savings ideas, exports, and dashboard charts while beta lasts. Private link with automatic expiry — see Terms.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">After launch</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">Free preview + $12 unlock</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Preview first, then pay once to open the full analysis for one upload for 30 days.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Free preview</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">No card required</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Headline processing and all-in rates, top fee drivers, monthly timeline, and a teaser — enough to reconcile against Stripe before you pay.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/80 p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">Full report</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">$12 one-time</p>
                  <p className="text-sm text-blue-900/90 leading-relaxed">
                    All high-fee charges with explanations, savings actions, monthly detail, CSV export, and print-ready report — private link for 30 days.
                  </p>
                  <p className="mt-3 text-xs text-gray-500">
                    Refund available if payment succeeds but the report does not unlock.
                  </p>
                </div>
              </>
            )}
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
            More detail in{" "}
            <Link href="/how-it-works" className="text-blue-600 hover:underline">
              How it works
            </Link>
            {" "}and our{" "}
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
          <Link href="/how-it-works" className="underline hover:text-gray-600">How it works</Link>
          {" · "}
          <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          {" · "}
          <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
          {" · "}
          <Link href="/refund" className="underline hover:text-gray-600">Refund Policy</Link>
        </p>
        <p className="flex justify-center gap-3 flex-wrap">
          <Link href="/monitor" className="hover:underline">Fee Monitor</Link>
          <span>·</span>
          <Link href="/stripe-fee-calculator" className="hover:underline">Stripe fee calculator</Link>
          <span>·</span>
          <Link href="/what-percent-does-stripe-take" className="hover:underline">What percent Stripe takes</Link>
          <span>·</span>
          <Link href="/stripe-balance-csv" className="hover:underline">Stripe Balance CSV</Link>
          <span>·</span>
          <Link href="/why-stripe-fee-rate-higher-than-2-9" className="hover:underline">Why fees exceed 2.9%</Link>
        </p>
        <p className="flex justify-center gap-3 flex-wrap">
          <a
            href="https://github.com/Ksantor1981/Stripe-Fee-Auditor"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
          <span>·</span>
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
