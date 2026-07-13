/* eslint-disable react/no-unescaped-entities -- long-form SEO copy */
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TrackedLink } from "@/components/TrackedLink";

export type ProviderScenario = {
  useCase: string;
  stripe: string;
  alternative: string;
  decision: string;
};

export type ProviderDecisionCard = {
  title: string;
  body: string;
};

export type ProviderComparisonSource = {
  title: string;
  href: string;
};

export type ProviderComparisonConfig = {
  pageTitle: string;
  pagePath: string;
  eyebrow: string;
  h1: string;
  intro: string;
  alternativeName: string;
  heroTitle: string;
  heroBody: string;
  scenarios: ProviderScenario[];
  goodFit: ProviderDecisionCard[];
  badFit: ProviderDecisionCard[];
  checklist: string[];
  officialSources: ProviderComparisonSource[];
  related: ProviderComparisonSource[];
  ctaCampaign: string;
};

export function ProviderComparisonPage({ config }: { config: ProviderComparisonConfig }) {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-gray-900">
            Stripe Fee Auditor
          </Link>
          <Link
            href="/analyze"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Analyze My Fees
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: config.pageTitle }]} className="mb-8" />

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              {config.eyebrow}
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
              {config.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
              {config.intro}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                href="/analyze"
                utm={{ source: "comparison", medium: "cta", campaign: config.ctaCampaign }}
                funnelEvent="funnel_landing_cta"
                funnelProps={{ placement: `${config.ctaCampaign}_hero` }}
                className="inline-flex justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Audit my actual Stripe CSV
              </TrackedLink>
              <Link
                href="/stripe-fee-calculator"
                className="inline-flex justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                Start with a quick estimate
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
              Before you switch
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">{config.heroTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{config.heroBody}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {["Processing rate", "All-in cost", "Fee driver"].map((item) => (
                <div key={item} className="rounded-xl border border-white bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{item}</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">Measure first</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="scenario-heading">
          <h2 id="scenario-heading" className="text-2xl font-bold text-gray-900">
            Compare by real payment scenario
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 text-sm">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[0.85fr_1fr_1fr_1fr] bg-gray-50 font-semibold text-gray-700">
                <div className="px-4 py-3">Use case</div>
                <div className="border-l border-gray-200 px-4 py-3">Stripe</div>
                <div className="border-l border-gray-200 px-4 py-3">{config.alternativeName}</div>
                <div className="border-l border-gray-200 px-4 py-3">First decision</div>
              </div>
              {config.scenarios.map((row) => (
                <div key={row.useCase} className="grid grid-cols-[0.85fr_1fr_1fr_1fr] border-t border-gray-100">
                  <div className="px-4 py-4 font-medium text-gray-900">{row.useCase}</div>
                  <div className="border-l border-gray-100 px-4 py-4 leading-relaxed text-gray-600">{row.stripe}</div>
                  <div className="border-l border-gray-100 px-4 py-4 leading-relaxed text-gray-600">{row.alternative}</div>
                  <div className="border-l border-gray-100 px-4 py-4 leading-relaxed text-gray-600">{row.decision}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            Pricing varies by country, payment method, product, volume, and negotiated plan. Use
            this as decision guidance, then verify current official pricing before changing checkout.
          </p>
        </section>

        <section className="mt-14 grid gap-5 md:grid-cols-2" aria-labelledby="fit-heading">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              {config.alternativeName} may fit when
            </p>
            <div className="mt-5 space-y-4">
              {config.goodFit.map((item) => (
                <div key={item.title}>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              It may not solve the issue when
            </p>
            <div className="mt-5 space-y-4">
              {config.badFit.map((item) => (
                <div key={item.title}>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]" aria-labelledby="checklist-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Pre-switch checklist
            </p>
            <h2 id="checklist-heading" className="mt-2 text-2xl font-bold text-gray-900">
              Audit your Stripe baseline first.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              A provider comparison only helps after you know the actual driver: card mix,
              average charge size, international customers, refunds, disputes, or add-on fee lines.
            </p>
          </div>
          <ol className="space-y-3">
            {config.checklist.map((item, index) => (
              <li key={item} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-gray-700">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
            CSV audit before migration
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            Know your real Stripe baseline before comparing providers.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
            Upload the itemized Stripe Balance CSV and see your actual processing rate, all-in cost,
            monthly drift, high-fee charges, and savings ideas.
          </p>
          <TrackedLink
            href="/analyze"
            utm={{ source: "comparison", medium: "cta", campaign: `${config.ctaCampaign}_bottom` }}
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: `${config.ctaCampaign}_bottom` }}
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Analyze my CSV
          </TrackedLink>
        </section>

        <section className="mt-12 grid gap-8 border-t border-gray-100 pt-8 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Official pricing sources</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Confirm current pricing for your country and product before changing payment strategy.
            </p>
            <div className="mt-4 space-y-2">
              {config.officialSources.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-medium text-blue-600 hover:underline"
                >
                  {source.title} -&gt;
                </a>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Related guides</h2>
            <div className="mt-4 space-y-2">
              {config.related.map((link) => (
                <Link key={link.href} href={link.href} className="block text-sm font-medium text-blue-600 hover:underline">
                  {link.title} -&gt;
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
